import express from "express";

const router = express.Router();

// Curated emoji catalog for quick picking
const CATALOG = [
  {
    id: "status",
    label: "Status",
    emojis: [
      { emoji: "📌", name: "pin pushpin" },
      { emoji: "⭐", name: "star favorite" },
      { emoji: "🔥", name: "fire hot" },
      { emoji: "✅", name: "check done complete" },
      { emoji: "⚠️", name: "warning alert" },
      { emoji: "❗", name: "exclamation important" },
      { emoji: "🕒", name: "clock time" },
      { emoji: "🔒", name: "lock secure private" },
      { emoji: "📎", name: "paperclip attach" },
      { emoji: "📖", name: "book read" }
    ]
  },
  {
    id: "moods",
    label: "Moods",
    emojis: [
      { emoji: "😀", name: "happy smile grin" },
      { emoji: "🙂", name: "smile slight" },
      { emoji: "😐", name: "neutral meh" },
      { emoji: "😕", name: "confused worried" },
      { emoji: "😢", name: "sad cry tear" },
      { emoji: "😡", name: "angry mad" },
      { emoji: "😴", name: "sleep tired" },
      { emoji: "🤔", name: "thinking hmm" },
      { emoji: "🤩", name: "excited wow star" },
      { emoji: "🥳", name: "party celebrate" }
    ]
  },
  {
    id: "topics",
    label: "Topics",
    emojis: [
      { emoji: "🧠", name: "brain think smart" },
      { emoji: "💡", name: "idea bulb light" },
      { emoji: "📚", name: "books study learn" },
      { emoji: "🛠️", name: "tools work build" },
      { emoji: "🧪", name: "test science lab" },
      { emoji: "🗂️", name: "organize files folder" },
      { emoji: "📝", name: "note write memo" },
      { emoji: "🎯", name: "target goal aim" },
      { emoji: "📈", name: "chart growth up" },
      { emoji: "🧭", name: "compass direction navigate" }
    ]
  }
];

// GET /api/emojis - return entire catalog
router.get("/", (req, res) => {
  res.json({ categories: CATALOG });
});

// GET /api/emojis/search?q= - simple search across labels and emoji chars
router.get("/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (!q) return res.json({ categories: CATALOG });

  const filtered = CATALOG.map(cat => ({
    ...cat,
    emojis: cat.emojis.filter(e => 
      e.emoji.toLowerCase().includes(q) || 
      e.name.toLowerCase().includes(q) || 
      cat.label.toLowerCase().includes(q)
    )
  })).filter(cat => cat.emojis.length > 0);

  res.json({ categories: filtered });
});

export default router;
