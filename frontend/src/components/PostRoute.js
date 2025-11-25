const express = require("express");
const router = express.Router();
const Note = require("../models/note"); // adjust path to your model
// optional auth middleware:
// const auth = require("../middleware/auth");

router.post("/", /* auth, */ async (req, res) => {
  try {
    const { title, body } = req.body;
    const note = new Note({
      title,
      body,
      // user: req.user && req.user.id, // if you use auth
      createdAt: new Date(),
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;