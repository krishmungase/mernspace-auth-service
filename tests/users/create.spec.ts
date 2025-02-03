import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /users", () => {
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
    it("should persist the user in database", async () => {
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      // Register user
      const userData = {
        firstName: "Narayan",
        lastName: "Mungase",
        email: "example@gmail.com",
        password: "Mungase1234",
        tenantId: 1,
      };

      // Add token to cookie
      await request(app as any)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

        const userReposistory = connection.getRepository(User);
        const users = await userReposistory.find();

        expect(users).toHaveLength(1);
        expect(users[0].role).toBe(Roles.MANAGER)
        expect(users[0].email).toBe(userData.email)
      // Assert
    });

    it.todo("should return 403 if non admin user tries to create a user");
  });
});
