import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
  constructor(private readonly tenantService: TenantService, private readonly logger: Logger) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;

    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("Tenant created", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAll();
      this.logger.info("All tenant have been fetched");
      res.json(tenants);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const tenant = await this.tenantService.getById(Number(tenantId));
      if (!tenant) {
        next(createHttpError(400, "Tenant does not exist."));
        return;
      }

      this.logger.info("Tenant has been fetched");
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      const tenant = await this.tenantService.deleteById(Number(tenantId));
      if (!tenant) {
        next(createHttpError(400, "Tenant does not exist."));
        return;
      }

      this.logger.info("Tenant has been Deleted");
      res.json({
        message: "Tenant deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const tenantId = req.params.id;
    const { name, address } = req.body;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      await this.tenantService.update(Number(tenantId), { name, address });

      this.logger.info("Tenant has been updated", { id: tenantId });

      res.json({ id: Number(tenantId) });
      return;
    } catch (err) {
      next(err);
    }
  }
}
