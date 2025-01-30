import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";

describe("POST /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.log(error);
    }
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
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
      .send(tenantData);

      expect(response.statusCode).toBe(201);
    })
  })
  
});
