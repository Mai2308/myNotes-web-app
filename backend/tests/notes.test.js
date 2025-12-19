import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import Note from '../models/noteModel.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// Create test app
const app = express();
app.use(express.json());

let testUserId;

// Mock routes for testing
app.get('/api/notes', async (req, res) => {
  try {
    const { userId } = req.query;
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    if (!title || !userId) {
      return res.status(400).json({ message: 'Title and userId are required' });
    }

    const note = await Note.create({
      title,
      content: content || '',
      user: userId
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.title = title || note.title;
    note.content = content !== undefined ? content : note.content;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

describe('Notes API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    testUserId = user._id.toString();
  });

  describe('GET /api/notes', () => {
    test('should return empty array when no notes exist', async () => {
      const response = await request(app)
        .get(`/api/notes?userId=${testUserId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all notes for a user', async () => {
      // Create test notes
      await Note.create([
        { title: 'Note 1', content: 'Content 1', user: testUserId },
        { title: 'Note 2', content: 'Content 2', user: testUserId }
      ]);

      const response = await request(app)
        .get(`/api/notes?userId=${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBeDefined();
      expect(response.body[0].content).toBeDefined();
    });

    test('should return notes sorted by creation date (newest first)', async () => {
      // Create notes with delay
      const note1 = await Note.create({
        title: 'First Note',
        content: 'Content 1',
        user: testUserId
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const note2 = await Note.create({
        title: 'Second Note',
        content: 'Content 2',
        user: testUserId
      });

      const response = await request(app)
        .get(`/api/notes?userId=${testUserId}`)
        .expect(200);

      expect(response.body[0]._id.toString()).toBe(note2._id.toString());
      expect(response.body[1]._id.toString()).toBe(note1._id.toString());
    });
  });

  describe('POST /api/notes', () => {
    test('should create a new note with valid data', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'Test Content',
        userId: testUserId
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(noteData.title);
      expect(response.body.content).toBe(noteData.content);
      expect(response.body.user).toBe(testUserId);
    });

    test('should create note with empty content', async () => {
      const noteData = {
        title: 'Title Only',
        userId: testUserId
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(201);

      expect(response.body.title).toBe(noteData.title);
      expect(response.body.content).toBe('');
    });

    test('should reject note creation without title', async () => {
      const noteData = {
        content: 'Content without title',
        userId: testUserId
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(400);

      expect(response.body.message).toBe('Title and userId are required');
    });

    test('should reject note creation without userId', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'Test Content'
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(400);

      expect(response.body.message).toBe('Title and userId are required');
    });
  });

  describe('PUT /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = await Note.create({
        title: 'Original Title',
        content: 'Original Content',
        user: testUserId
      });
      noteId = note._id.toString();
    });

    test('should update note title', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe('Original Content');
    });

    test('should update note content', async () => {
      const updateData = {
        content: 'Updated Content'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Original Title');
      expect(response.body.content).toBe(updateData.content);
    });

    test('should update both title and content', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/notes/${fakeId}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = await Note.create({
        title: 'Note to Delete',
        content: 'Content',
        user: testUserId
      });
      noteId = note._id.toString();
    });

    test('should delete an existing note', async () => {
      const response = await request(app)
        .delete(`/api/notes/${noteId}`)
        .expect(200);

      expect(response.body.message).toBe('Note deleted successfully');

      // Verify note is deleted
      const deletedNote = await Note.findById(noteId);
      expect(deletedNote).toBeNull();
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/notes/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });
});
