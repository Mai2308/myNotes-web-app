const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getNotes,
  createNote,
  deleteNote,
  moveToFolder,
  toggleFavorite,
} = require("../controllers/notesController");

router.get("/", auth, getNotes);
router.post("/", auth, createNote);
router.delete("/:id", auth, deleteNote);
router.put("/:id/move", auth, moveToFolder);
router.put("/:id/favorite", auth, toggleFavorite);

module.exports = router;

