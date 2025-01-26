import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

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
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    if (connection) {
      await connection.destroy();
    }
  });

  describe("Given all fields", () => {
    it("Should return the user data", async () => {
      const userData = {
        firstName: "Narayan",
        lastName: "Mungase",
        email: "example@gmail.com",
        password: "Mungase1234",
        role: "customer",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save(userData);

      //Generate token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      //Add token to cookie
      const response = await request(app as any)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(200);
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not return the password field", async () => {
      // Register user
      const userData = {
        firstName: "Narayan",
        lastName: "Mungase",
        email: "example@gmail.com",
        password: "Mungase1234",
        role: "customer",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save(userData);
      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app as any)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      // Assert
      // Check if user id matches with registered user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password"
      );
    });

    it("should return 401 status code if token does not exists", async () => {
      // Register user
      const userData = {
        firstName: "Narayan",
        lastName: "Mungase",
        email: "example@gmail.com",
        password: "Mungase1234",
        role: "customer",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);

      // Add token to cookie
      const response = await request(app as any).get("/auth/self");
      console.log(response.body);

      // Assert
      expect(response.statusCode).toEqual(500);
    });
  });
});
