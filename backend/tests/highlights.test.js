import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import server from "../server.js";
import User from "../models/userModel.js";
import Note from "../models/noteModel.js";
import jwt from "jsonwebtoken";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

describe("Highlight Operations", () => {
  let authToken;
  let userId;
  let noteId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    // Create test user
    const user = await User.create({
      name: "Highlighter Test",
      email: "highlighter@test.com",
      password: "hashed123"
    });
    userId = user._id;

    // Create JWT token
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || "test-secret", {
      expiresIn: "7d"
    });

    // Create a test note
    const note = await Note.create({
      title: "Test Note",
      content: "This is a test note with text to highlight",
      user: userId,
      highlights: []
    });
    noteId = note._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
  });

  it("should add a highlight to a note", async () => {
    const res = await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        startOffset: 0,
        endOffset: 4,
        color: "yellow",
        selectedText: "This",
        comment: "Important word"
      });

    expect(res.status).toBe(201);
    expect(res.body.highlight.color).toBe("yellow");
    expect(res.body.highlight.selectedText).toBe("This");
    expect(res.body.highlight.comment).toBe("Important word");
  });

  it("should get all highlights for a note", async () => {
    // Add a highlight first
    await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        startOffset: 0,
        endOffset: 4,
        color: "green",
        selectedText: "This",
        comment: "Test highlight"
      });

    const res = await request(server)
      .get(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].color).toBe("green");
  });

  it("should update a highlight comment", async () => {
    // Add a highlight
    const addRes = await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        startOffset: 5,
        endOffset: 7,
        color: "red",
        selectedText: "is",
        comment: "Original comment"
      });

    const highlightId = addRes.body.highlight._id;

    const res = await request(server)
      .put(`/api/notes/${noteId}/highlights/${highlightId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        comment: "Updated comment"
      });

    expect(res.status).toBe(200);
    expect(res.body.highlight.comment).toBe("Updated comment");
  });

  it("should delete a highlight", async () => {
    // Add a highlight
    const addRes = await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        startOffset: 0,
        endOffset: 4,
        color: "blue",
        selectedText: "This",
        comment: "To delete"
      });

    const highlightId = addRes.body.highlight._id;

    const res = await request(server)
      .delete(`/api/notes/${noteId}/highlights/${highlightId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);

    // Verify it's deleted
    const getRes = await request(server)
      .get(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(getRes.body.length).toBe(0);
  });

  it("should support multiple highlight colors", async () => {
    const colors = ["yellow", "green", "red", "blue", "purple"];
    
    for (const color of colors) {
      const res = await request(server)
        .post(`/api/notes/${noteId}/highlights`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          startOffset: 0,
          endOffset: 4,
          color,
          selectedText: "This",
          comment: `${color} highlight`
        });

      expect(res.status).toBe(201);
      expect(res.body.highlight.color).toBe(color);
    }

    // Verify all are stored
    const res = await request(server)
      .get(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.body.length).toBe(5);
  });

  it("should reject unauthorized access", async () => {
    const res = await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .send({
        startOffset: 0,
        endOffset: 4,
        color: "yellow",
        selectedText: "This",
        comment: "Unauthorized"
      });

    expect(res.status).toBe(401);
  });

  it("should validate required fields", async () => {
    const res = await request(server)
      .post(`/api/notes/${noteId}/highlights`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        color: "yellow"
        // Missing required fields
      });

    expect(res.status).toBe(400);
  });
});
