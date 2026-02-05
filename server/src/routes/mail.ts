import { Router } from "express";
import {
  sendEmail,
  getEmails,
  getEmailById,
} from "../controllers/mailController";

export const mailRouter = Router();

mailRouter.post("/send", sendEmail);
mailRouter.get("/", getEmails);
mailRouter.get("/:id", getEmailById);
