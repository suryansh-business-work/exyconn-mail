import {
  SMTPServer,
  SMTPServerSession,
  SMTPServerDataStream,
} from "smtp-server";
import { simpleParser, ParsedMail } from "mailparser";
import { v4 as uuidv4 } from "uuid";
import { Mailbox } from "../features/mailboxes/mailboxes.models";
import { Domain } from "../features/domains/domains.models";
import { emailsService } from "../features/emails/emails.services";

interface SMTPConfig {
  port: number;
  host?: string;
  secure?: boolean;
  authOptional?: boolean;
}

let smtpServer: SMTPServer | null = null;

const extractDomain = (email: string): string => {
  const parts = email.split("@");
  return parts[1]?.toLowerCase() || "";
};

const validateRecipient = async (address: string): Promise<boolean> => {
  const domain = extractDomain(address);
  const domainExists = await Domain.findOne({ name: domain, isActive: true });
  if (!domainExists) return false;

  const mailbox = await Mailbox.findOne({
    email: address.toLowerCase(),
    isActive: true,
  });
  return !!mailbox;
};

const authenticateUser = async (
  username: string,
  password: string,
): Promise<{ success: boolean; email?: string }> => {
  const mailbox = await Mailbox.findOne({
    $or: [
      { email: username.toLowerCase() },
      { username: username.toLowerCase() },
    ],
    isActive: true,
  }).populate("domainId");

  if (!mailbox) {
    return { success: false };
  }

  const isValid = mailbox.validatePassword(password);
  if (!isValid) {
    return { success: false };
  }

  return { success: true, email: mailbox.email };
};

const processIncomingEmail = async (
  parsed: ParsedMail,
  recipients: string[],
): Promise<void> => {
  for (const recipient of recipients) {
    const messageId = parsed.messageId || `<${uuidv4()}@exyconn.local>`;

    await emailsService.saveIncomingEmail({
      recipientEmail: recipient,
      messageId,
      from: parsed.from?.text || "unknown@unknown.com",
      to: Array.isArray(parsed.to)
        ? parsed.to.map((t) => t.text)
        : parsed.to
          ? [parsed.to.text]
          : [],
      cc: Array.isArray(parsed.cc)
        ? parsed.cc.map((c) => c.text)
        : parsed.cc
          ? [parsed.cc.text]
          : [],
      replyTo: parsed.replyTo?.text || parsed.from?.text,
      subject: parsed.subject,
      textBody: parsed.text,
      htmlBody: parsed.html || undefined,
      receivedAt: parsed.date || new Date(),
    });
  }
};

export const createSMTPServer = (config: SMTPConfig): SMTPServer => {
  smtpServer = new SMTPServer({
    secure: config.secure || false,
    authOptional: config.authOptional ?? true,
    disabledCommands: config.authOptional ? ["AUTH"] : [],

    onConnect(session: SMTPServerSession, callback: (err?: Error) => void) {
      console.log(`[SMTP] Connection from ${session.remoteAddress}`);
      callback();
    },

    onAuth(auth, _session, callback) {
      const username = auth.username || "";
      const password = auth.password || "";
      authenticateUser(username, password)
        .then((result) => {
          if (result.success) {
            console.log(`[SMTP] Auth success for ${username}`);
            callback(null, { user: result.email });
          } else {
            console.log(`[SMTP] Auth failed for ${username}`);
            callback(new Error("Invalid credentials"));
          }
        })
        .catch((err) => {
          console.error("[SMTP] Auth error:", err);
          callback(new Error("Authentication error"));
        });
    },

    onMailFrom(address, _session, callback) {
      console.log(`[SMTP] MAIL FROM: ${address.address}`);
      callback();
    },

    onRcptTo(address, _session, callback) {
      validateRecipient(address.address)
        .then((isValid) => {
          if (isValid) {
            console.log(`[SMTP] RCPT TO (valid): ${address.address}`);
            callback();
          } else {
            console.log(`[SMTP] RCPT TO (invalid): ${address.address}`);
            callback(new Error(`Mailbox ${address.address} not found`));
          }
        })
        .catch((err) => {
          console.error("[SMTP] Recipient validation error:", err);
          callback(new Error("Recipient validation failed"));
        });
    },

    onData(stream: SMTPServerDataStream, session: SMTPServerSession, callback) {
      const chunks: Buffer[] = [];

      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on("end", () => {
        const emailBuffer = Buffer.concat(chunks);

        simpleParser(emailBuffer)
          .then((parsed) => {
            const recipients = session.envelope.rcptTo.map((r) => r.address);
            return processIncomingEmail(parsed, recipients);
          })
          .then(() => {
            console.log(`[SMTP] Email processed successfully`);
            callback();
          })
          .catch((err) => {
            console.error("[SMTP] Email processing error:", err);
            callback(new Error("Failed to process email"));
          });
      });

      stream.on("error", (err) => {
        console.error("[SMTP] Stream error:", err);
        callback(new Error("Stream error"));
      });
    },

    onClose(session) {
      console.log(`[SMTP] Connection closed from ${session.remoteAddress}`);
    },
  });

  return smtpServer;
};

export const startSMTPServer = (config: SMTPConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const server = createSMTPServer(config);

    server.on("error", (err) => {
      console.error("[SMTP] Server error:", err);
      reject(err);
    });

    server.listen(config.port, config.host || "0.0.0.0", () => {
      console.log(`📧 SMTP Server running on port ${config.port}`);
      resolve();
    });
  });
};

export const stopSMTPServer = (): Promise<void> => {
  return new Promise((resolve) => {
    if (smtpServer) {
      smtpServer.close(() => {
        console.log("[SMTP] Server stopped");
        smtpServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};
