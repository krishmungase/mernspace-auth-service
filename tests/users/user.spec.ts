import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import createJWKSMock from "mock-jwks"
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks:ReturnType<typeof createJWKSMock> ;

  beforeAll(async () => {
    try {
      jwks = createJWKSMock('http://localhost:5501');
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
  })

  afterAll(async () => {
    if (connection) {
      await connection.destroy();
    }
  });

  describe("Given all fields", () => {
    it("should return 200 status code" , async () => {

      const accessToken = jwks.token({sub:'1' ,role: Roles.CUSTOMER });
      const response = await request(app as any).get("/auth/self").set('Cookie',[`accessToken=${accessToken}`]).send();

      expect(response.statusCode).toBe(200);
    })

    // it("should return user data" , async () => {

    //   const userData = {
    //     firstName: "Krish",
    //     lastName: "M",
    //     email: "krishmungase@gmail.com",
    //     password: "secret",
    //   };

    //   const userRepository = connection.getRepository(User);
    //   const data = await userRepository.save({...userData, role: Roles.CUSTOMER});

    //   // generate token 
    //   const accessToken = jwks.token({sub: String(data.id) ,role: data.role })

    //   // Register user
    //   const response = await request(app as any).get("/auth/self").set('Cookie',[`accessToken=${accessToken}`]).send();

    //   expect((response.body as Record<string,string>).id).toBe(data.id);
    // })
  });

});
