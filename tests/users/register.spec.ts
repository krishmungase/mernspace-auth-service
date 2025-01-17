import request from "supertest"
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {

  let connection : DataSource;

  beforeAll(async() => {
    try {
      connection = await AppDataSource.initialize();
    } catch (error) {
      console.log(error)
    }
  })

  beforeEach(async() => {
    await connection.dropDatabase();
    await connection.synchronize();
  })

  afterAll(async() => {
    if (connection) {
      await connection.destroy();
    }
  })


  describe("Given all fields",() => {
    it("should return the 201 status code", async () => {
      // AAA

      // Arrange
      const  userData = {
        firstName: "Krish",
        lastName: "M",
        email: "krishmungase@gmail.com",
        password:"secret"
      }
      // Act
      const response = await request(app as any).post('/auth/register').send(userData)
      // Assert

      expect(response.statusCode).toBe(201)
    });

    it("should return valid json response", async () => {
      // AAA

      // Arrange
      const  userData = {
        firstName: "Krish",
        lastName: "M",
        email: "krishmungase@gmail.com",
        password:"secret"
      }
      // Act
      const response = await request(app as any).post('/auth/register').send(userData)
      // Assert

      expect((response.headers as Record<string,string>)['content-type']).toEqual(expect.stringContaining("json"))
    });

    it("should persist the user in the database",async() =>{
      const userData = {
        firstName: "Krish",
        lastName: "Mungase",
        email: "mungasekrishna8@gmail.com",
        password: "secret",
      }

      await request(app as any).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName)
      expect(users[0].lastName).toBe(userData.lastName)
      expect(users[0].email).toBe(userData.email)
      expect(users[0].password).toBe(userData.password)
    })

    it("should return an id of the created user",async() => {
      // Arrange
      const  userData = {
        firstName: "Krish",
        lastName: "M",
        email: "krishmungase@gmail.com",
        password:"secret"
      }
      // Act
      const response = await request(app as any).post('/auth/register').send(userData)
      // Assert
      const responseBody = JSON.parse(response.text);
      expect(responseBody.id).toBeDefined();
      expect(typeof responseBody.id).toBe("number");
    })

    it("should assign a customer role", async() => {
         // Arrange
         const  userData = {
          firstName: "Krish",
          lastName: "M",
          email: "krishmungase@gmail.com",
          password:"secret"
        }
        // Act
        await request(app as any).post('/auth/register').send(userData);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users[0]).toHaveProperty("role");
        expect(users[0].role).toBe(Roles.CUSTOMER);
    })
    
  })
  describe("Fields are missing ",() => {}) 
})