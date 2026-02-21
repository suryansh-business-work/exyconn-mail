import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Exyconn Mail Server API",
    version: "1.0.0",
    description:
      "Production-ready Mail Server SaaS API with domain management, mailbox management, and mail logging.",
    contact: {
      name: "Exyconn",
      url: "https://exyconn.com",
    },
  },
  servers: [
    {
      url: "http://localhost:4032",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Domains", description: "Domain management" },
    { name: "Mailboxes", description: "Mailbox management" },
    { name: "Mail", description: "Mail logs and statistics" },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
