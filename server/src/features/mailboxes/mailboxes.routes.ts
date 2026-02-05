import { Router } from "express";
import { mailboxesController } from "./mailboxes.controllers";

const router = Router();

router.get("/", mailboxesController.getAll);
router.get("/:id", mailboxesController.getById);
router.post("/", mailboxesController.create);
router.put("/:id", mailboxesController.update);
router.delete("/:id", mailboxesController.delete);
router.post("/authenticate", mailboxesController.authenticate);

export const mailboxesRouter = router;
