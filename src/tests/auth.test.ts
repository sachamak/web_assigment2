import request from "supertest";
import mongoose from "mongoose";
import userModel, { iUser } from "../models/user_model";
import initApp from "../server";
import { Express } from "express";
import postsModel from "../models/posts_model";
let app: Express;

beforeAll(async () => {
  console.log("Before all tests");
  app = await initApp();
  await userModel.deleteMany();
  await postsModel.deleteMany();
});

afterAll(async () => {
  console.log("after all tests");
  await mongoose.connection.close();
});
const baseUrl = "/auth";

type User = iUser & { accessToken?: string; refreshToken?: string };

const testUser: User = {
  email: "user1@test.com",
  password: "123456",
};
describe("Auth Tests", () => {
  test("Auth test registration", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).toBe(200);
  });
  test("Auth test registration exist", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).not.toBe(200);
  });
  test("Auth test login", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    testUser._id = response.body._id;
    expect(response.body._id).toBeDefined();
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });
  test("Auth test login wrong email", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: "wrong email",
        password: testUser.password,
      });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("User or password incorrect");
  });

  test("Auth test login wrong password", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: testUser.email,
        password: "wrong password",
      });
    expect(response.statusCode).not.toBe(200);
    expect(response.text).toBe("User or password incorrect");
  });

  test("Auth test me", async () => {
    const response = await request(app).post("/posts").send({
      title: "test title",
      content: "test content",
      owner: "test owner",
    });
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "test title",
        content: "test content",
        owner: testUser._id,
      });
    expect(response2.statusCode).toBe(201);
    expect(response2.body.title).toBe("test title");
    expect(response2.body.content).toBe("test content");
    expect(response2.body.owner).toBe(testUser._id);
  });

  test("Refresh Token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });
  test("Refresh Token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });
  test("No Refresh Token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("refreshToken is required");
  });

  test("logout without refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("refreshToken is required");
  });

      test("logout with invalid refresh token", async () => {
        const response = await request(app).post(baseUrl + "/logout").send({refreshToken: "invalid"});
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("Unauthorized");
      });
      
      test("Refresh token invalid token", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: "invalid"});
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("Unauthorized");
      });

  test("invalid refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({ refreshToken: testUser.refreshToken });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Refresh token multiple times", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response2.statusCode).toBe(200);
    const newRefreshToken = response2.body.refreshToken;
    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response3.statusCode).toBe(402);
    const response4 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: newRefreshToken });
    expect(response4.statusCode).not.toBe(200);
  });

  jest.setTimeout(10000);
  test("Refresh token timeout", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    await new Promise((r) => setTimeout(r, 6000));
    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "test title",
        content: "test content",
        owner: testUser._id,
      });
    expect(response2.statusCode).toBe(401);
    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;
    testUser.refreshToken = response3.body.refreshToken;
    const response4 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "test title",
        content: "test content",
        owner: testUser._id,
      });
    expect(response4.statusCode).toBe(201);
  });
});
