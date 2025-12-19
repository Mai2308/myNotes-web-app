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

// Mock routes for checklist operations
app.post('/api/notes/:id/convert-to-checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Parse content into checklist items
    const items = note.content
      .split('\n')
      .filter(line => line.trim())
      .map((text, index) => ({
        text: text.trim(),
        completed: false,
        order: index
      }));

    note.isChecklist = true;
    note.checklistItems = items;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notes/:id/convert-to-regular', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Convert checklist items back to content
    const content = note.checklistItems
      .map(item => item.text)
      .join('\n');

    note.isChecklist = false;
    note.content = content;
    note.checklistItems = [];
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notes/:id/checklist-items', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.checklistItems = items;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notes/:id/checklist-items/:itemIndex/toggle', async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const index = parseInt(itemIndex);
    
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (index < 0 || index >= note.checklistItems.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    note.checklistItems[index].completed = !note.checklistItems[index].completed;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

describe('Checklist API', () => {
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

  describe('POST /api/notes/:id/convert-to-checklist', () => {
    test('should convert regular note to checklist', async () => {
      const note = await Note.create({
        title: 'Shopping List',
        content: 'Milk\nBread\nEggs\nButter',
        user: testUserId,
        isChecklist: false
      });

      const response = await request(app)
        .post(`/api/notes/${note._id}/convert-to-checklist`)
        .expect(200);

      expect(response.body.isChecklist).toBe(true);
      expect(response.body.checklistItems).toHaveLength(4);
      expect(response.body.checklistItems[0].text).toBe('Milk');
      expect(response.body.checklistItems[0].completed).toBe(false);
      expect(response.body.checklistItems[1].text).toBe('Bread');
    });

    test('should handle empty lines in content', async () => {
      const note = await Note.create({
        title: 'Test Note',
        content: 'Item 1\n\n\nItem 2\n\nItem 3',
        user: testUserId,
        isChecklist: false
      });

      const response = await request(app)
        .post(`/api/notes/${note._id}/convert-to-checklist`)
        .expect(200);

      expect(response.body.checklistItems).toHaveLength(3);
      expect(response.body.checklistItems[0].text).toBe('Item 1');
      expect(response.body.checklistItems[1].text).toBe('Item 2');
      expect(response.body.checklistItems[2].text).toBe('Item 3');
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/notes/${fakeId}/convert-to-checklist`)
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });

  describe('POST /api/notes/:id/convert-to-regular', () => {
    test('should convert checklist back to regular note', async () => {
      const note = await Note.create({
        title: 'Shopping List',
        content: '',
        user: testUserId,
        isChecklist: true,
        checklistItems: [
          { text: 'Milk', completed: false, order: 0 },
          { text: 'Bread', completed: true, order: 1 },
          { text: 'Eggs', completed: false, order: 2 }
        ]
      });

      const response = await request(app)
        .post(`/api/notes/${note._id}/convert-to-regular`)
        .expect(200);

      expect(response.body.isChecklist).toBe(false);
      expect(response.body.checklistItems).toHaveLength(0);
      expect(response.body.content).toBe('Milk\nBread\nEggs');
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/notes/${fakeId}/convert-to-regular`)
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });

  describe('PUT /api/notes/:id/checklist-items', () => {
    test('should update checklist items', async () => {
      const note = await Note.create({
        title: 'Todo List',
        content: '',
        user: testUserId,
        isChecklist: true,
        checklistItems: [
          { text: 'Task 1', completed: false, order: 0 }
        ]
      });

      const updatedItems = [
        { text: 'Task 1 Updated', completed: true, order: 0 },
        { text: 'Task 2', completed: false, order: 1 },
        { text: 'Task 3', completed: false, order: 2 }
      ];

      const response = await request(app)
        .put(`/api/notes/${note._id}/checklist-items`)
        .send({ items: updatedItems })
        .expect(200);

      expect(response.body.checklistItems).toHaveLength(3);
      expect(response.body.checklistItems[0].text).toBe('Task 1 Updated');
      expect(response.body.checklistItems[0].completed).toBe(true);
      expect(response.body.checklistItems[1].text).toBe('Task 2');
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/notes/${fakeId}/checklist-items`)
        .send({ items: [] })
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });

  describe('POST /api/notes/:id/checklist-items/:itemIndex/toggle', () => {
    test('should toggle checklist item completion status', async () => {
      const note = await Note.create({
        title: 'Todo List',
        content: '',
        user: testUserId,
        isChecklist: true,
        checklistItems: [
          { text: 'Task 1', completed: false, order: 0 },
          { text: 'Task 2', completed: false, order: 1 },
          { text: 'Task 3', completed: true, order: 2 }
        ]
      });

      // Toggle first item (false -> true)
      let response = await request(app)
        .post(`/api/notes/${note._id}/checklist-items/0/toggle`)
        .expect(200);

      expect(response.body.checklistItems[0].completed).toBe(true);

      // Toggle third item (true -> false)
      response = await request(app)
        .post(`/api/notes/${note._id}/checklist-items/2/toggle`)
        .expect(200);

      expect(response.body.checklistItems[2].completed).toBe(false);
    });

    test('should return 400 for invalid item index', async () => {
      const note = await Note.create({
        title: 'Todo List',
        content: '',
        user: testUserId,
        isChecklist: true,
        checklistItems: [
          { text: 'Task 1', completed: false, order: 0 }
        ]
      });

      const response = await request(app)
        .post(`/api/notes/${note._id}/checklist-items/10/toggle`)
        .expect(400);

      expect(response.body.message).toBe('Invalid item index');
    });

    test('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/notes/${fakeId}/checklist-items/0/toggle`)
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });
  });
});
