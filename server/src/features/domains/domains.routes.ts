import { Router } from "express";
import { domainsController } from "./domains.controllers";

const router = Router();

router.get("/", domainsController.getAll);
router.get("/:id", domainsController.getById);
router.post("/", domainsController.create);
router.put("/:id", domainsController.update);
router.delete("/:id", domainsController.delete);
router.post("/:id/generate-dkim", domainsController.generateDKIM);
router.post("/:id/verify", domainsController.verify);
router.get("/:id/dns-records", domainsController.getDNSRecords);

export const domainsRouter = router;
