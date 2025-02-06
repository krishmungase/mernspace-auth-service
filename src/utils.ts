import { Repository } from "typeorm";
import { Tenant } from "./entity/Tenant";

export const calculateDiscount = (price: number, percentage: number) => {
  return price * (percentage / 100);
};

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = await repository.save({
    name: "Test Tenant",
    address: "Test Address",
  });

  return tenant;
};
