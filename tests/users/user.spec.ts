import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks"
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    try {
      jwks = createJWKSMock("http://localhost:5501")
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
    it("should return the 201 status code", async () => {
      const response = await request(app as any)
        .get("/auth/self")
        .send();
      // Assert

      expect(response.statusCode).toBe(200);
    })

    // it("should return the user data", async () => {
    //   const userData = {
    //     firstName: "Krish",
    //     lastName: "M",
    //     email: "krishmungase@gmail.com",
    //     password: "secret",
    //   };

    //   const userRepository = connection.getRepository(User);
    //   const user = await userRepository.save({...userData, role: Roles.CUSTOMER });

    //   const accessToken = jwks.token({sub:String(user.id), role: Roles.CUSTOMER}); 
    //   console.log("accessToken => ",accessToken);


    //   const response = await request(app as any)
    //     .get("/auth/self")
    //     .set('Cookie',[`accessToken=${accessToken}`])
    //     .send();
      

    //   // Assert
    //   expect(response.statusCode).toBe(200);
    //   expect(response.body.id).toBe(user.id);
    // })

    it("should return 401 status code if token does not exists", async () => {
      // Register user
      const userData = {
          firstName: "Rakesh",
          lastName: "K",
          email: "rakesh@mern.space",
          password: "password",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({
          ...userData,
          role: Roles.CUSTOMER,
      });

      // Add token to cookie
      const response = await request(app as any).get("/auth/self").send();
      // Assert
      expect(response.statusCode).toBe(401);
  });
  });
})