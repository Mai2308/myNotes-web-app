import request from "supertest";
import app from "../app.js";

describe("Authentication", () => {
  it("health check works", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("should sign up a new user", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail login with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "wrong@example.com",
        password: "123",
      });

    expect(res.statusCode).toBe(401);
  });
});
