import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    try {
      jwks = createJWKSMock("http://localhost:5501");
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.log(error);
    }
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();

    adminToken = jwks.token({
      sub:"1",
      role: Roles.ADMIN
    })
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    if (connection) {
      await connection.destroy();
    }
  });

  describe("Given all Fields", () => {
    it("should return a 201 status code", async () => {

      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      }

      const response = await request(app as any)
      .post("/tenants")
      .set("Cookie",[`accessToken=${adminToken}`])
      .send(tenantData);

      expect(response.statusCode).toBe(201);
    })

    it("should create a tenant in database", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      }

      await request(app as any)
      .post("/tenants")
      .set("Cookie",[`accessToken=${adminToken}`])
      .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    })

    it("should return 401 if user is not authenticated", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      }

      const response = await request(app as any)
      .post("/tenants")
      .send(tenantData);

      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      
      expect(tenants).toHaveLength(0);
    })
  })
  
});
