import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}
  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async getAll() {
    return await this.tenantRepository.find();
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  async deleteById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }

  async update(tenantId: number, tenantData: ITenant) {
    return await this.tenantRepository.update(tenantId, tenantData);
  }
}
