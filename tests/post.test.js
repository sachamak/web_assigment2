const request = require("supertest");
const app = require("../server.js");
const mongoose = require("mongoose");
const postModel = require("../models/post_model");
const { default: test } = require("node:test");
const { title } = require("process");

beforeAll(async ()=>{
    console.log('Before all tests');
    await postModel.deleteMany();
});

afterAll((done) => {
    console.log("after all tests");
    done();
    mongoose.connection.close();
});
var postId = "";
const testPost = {
    title: "test title",
    content: "test content",
    owner: "test owner"
}
const invalidPost = {
    title: "test title",
    content: "test content",
}
describe("Post test suite", () => {
 test("Post test get all post", async () => {
 const response = await request(app).get("/posts");
 expect(response.status).toBe(200);
});

test("Test Adding new post", async () => {
    const response = await request(app).post("/posts").send(testPost);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe(testPost.title);
    expect(response.body.content).toBe(testPost.content);
    expect(response.body.owner).toBe(testPost.owner);
    postId = response.body._id;
});

test("Test get all posts after adding", async () => {
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
});

test("Test get post by owner", async () => {
    const response = await request(app).get("/posts?owner=test owner");
    expect(response.status).toBe(201);
    expect(response.body.length).toBe(1);
    expect(response.body[0].owner).toBe("Nadav");
});

test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe("test title");
    expect(response.body.content).toBe("test content");
    expect(response.body._id).toBe(postId);
});

test("Test get post by id fail", async () => {
    const response = await request(app).get("/posts/" + postId + 5);
    console.log(response.body);
    expect(response.status).toBe(400);
    
});
});