import mongoose from "mongoose";
import Note from "../models/noteModel.js";

const { Types: { ObjectId } } = mongoose;

// Add a highlight to a note
export const addHighlight = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { startOffset, endOffset, color, selectedText, comment } = req.body;

    console.log("📍 Add Highlight Request:", { userId, noteId, startOffset, endOffset, color, selectedText, comment });

    if (startOffset === undefined || endOffset === undefined || !selectedText) {
      console.error("❌ Validation failed:", { startOffset, endOffset, selectedText });
      return res.status(400).json({ 
        message: "startOffset, endOffset, and selectedText are required" 
      });
    }

    const highlight = {
      _id: new ObjectId(),
      startOffset,
      endOffset,
      color: color || "yellow",
      selectedText: selectedText.substring(0, 500), // limit text length
      comment: comment || "",
      createdAt: new Date()
    };

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $push: { highlights: highlight } },
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });

    // Return shape expected by tests: { highlight: {...} }
    res.status(201).json({ highlight });
  } catch (error) {
    console.error("❌ Error adding highlight:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all highlights for a note
export const getHighlights = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    console.log("📖 Get Highlights Request:", { userId, noteId });

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) {
      console.error("❌ Note not found:", noteId);
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("✅ Found highlights:", note.highlights?.length || 0);
    res.json(note.highlights || []);
  } catch (error) {
    console.error("❌ Error fetching highlights:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a highlight (edit comment or color)
export const updateHighlight = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId, highlightId } = req.params;
    const { color, comment } = req.body;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    const highlight = note.highlights.id(highlightId);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });

    if (color) highlight.color = color;
    if (comment !== undefined) highlight.comment = comment;

    await note.save();

    // Return shape expected by tests: { highlight: {...} }
    res.json({ highlight });
  } catch (error) {
    console.error("❌ Error updating highlight:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a highlight
export const deleteHighlight = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId, highlightId } = req.params;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    const highlight = note.highlights.id(highlightId);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });

    highlight.deleteOne();
    await note.save();

    res.json({ message: "Highlight deleted" });
  } catch (error) {
    console.error("❌ Error deleting highlight:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete all highlights from a note
export const clearHighlights = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.highlights = [];
    await note.save();

    res.json({ message: "All highlights cleared" });
  } catch (error) {
    console.error("❌ Error clearing highlights:", error);
    res.status(500).json({ message: "Server error" });
  }
};
