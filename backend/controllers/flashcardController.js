import Flashcard from "../models/flashcardModel.js";

// Get all flashcards for the logged-in user
export const getFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId } = req.query;

    const filter = { user: userId };
    if (noteId) filter.noteId = noteId;

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 }).exec();
    res.json(flashcards);
  } catch (error) {
    console.error("❌ Get flashcards error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a flashcard
export const createFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { front, back, noteId, tags } = req.body;

    if (!front || !back) {
      return res.status(400).json({ message: "Front and back are required" });
    }

    const flashcard = new Flashcard({
      front,
      back,
      user: userId,
      noteId: noteId || null,
      tags: tags || []
    });

    await flashcard.save();
    res.status(201).json({ message: "Flashcard created", flashcard });
  } catch (error) {
    console.error("❌ Create flashcard error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a flashcard
export const updateFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { front, back, tags, mastery, nextReviewDate } = req.body;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId }).exec();
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });

    if (front !== undefined) flashcard.front = front;
    if (back !== undefined) flashcard.back = back;
    if (tags !== undefined) flashcard.tags = tags;
    if (mastery !== undefined) flashcard.mastery = mastery;
    if (nextReviewDate !== undefined) flashcard.nextReviewDate = new Date(nextReviewDate);

    await flashcard.save();
    res.json({ message: "Flashcard updated", flashcard });
  } catch (error) {
    console.error("❌ Update flashcard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a flashcard
export const deleteFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const flashcard = await Flashcard.findOneAndDelete({ _id: id, user: userId }).exec();
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });

    res.json({ message: "Flashcard deleted" });
  } catch (error) {
    console.error("❌ Delete flashcard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Review a flashcard (update mastery based on user response)
export const reviewFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { correct } = req.body; // true or false

    const flashcard = await Flashcard.findOne({ _id: id, user: userId }).exec();
    if (!flashcard) return res.status(404).json({ message: "Flashcard not found" });

    flashcard.reviewCount += 1;

    if (correct) {
      flashcard.correctCount += 1;
      flashcard.mastery = Math.min(5, flashcard.mastery + 1);
      // Spaced repetition: increase interval based on mastery
      const daysToAdd = Math.pow(2, flashcard.mastery); // 2^mastery days
      flashcard.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      flashcard.incorrectCount += 1;
      flashcard.mastery = Math.max(0, flashcard.mastery - 1);
      // Review again tomorrow
      flashcard.nextReviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await flashcard.save();
    res.json({ message: "Review recorded", flashcard });
  } catch (error) {
    console.error("❌ Review flashcard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get flashcards due for review
export const getDueFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const flashcards = await Flashcard.find({
      user: userId,
      nextReviewDate: { $lte: now }
    }).sort({ nextReviewDate: 1 }).exec();

    res.json(flashcards);
  } catch (error) {
    console.error("❌ Get due flashcards error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
