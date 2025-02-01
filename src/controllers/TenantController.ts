import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class TenantController {
  constructor(private tenantService: TenantService, private logger: Logger) {}
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
}
