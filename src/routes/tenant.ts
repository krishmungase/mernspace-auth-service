import express, { NextFunction, Request, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import tenantValidator from "../validators/tenant-validator";
import { CreateTenantRequest } from "../types";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

router.patch(
  "/:id",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next)
);

router.get("/", (req, res, next) => tenantController.getAll(req, res, next));

router.get(
  "/:id",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.getOne(req, res, next)
);

router.delete(
  "/:id",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next)
);

export default router;
