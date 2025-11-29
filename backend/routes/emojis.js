import express from "express";

const router = express.Router();

// Curated emoji catalog for quick picking
const CATALOG = [
  {
    id: "status",
    label: "Status",
    emojis: [
      "📌","⭐","🔥","✅","⚠️","❗","🕒","🔒","📎","📖"
    ]
  },
  {
    id: "moods",
    label: "Moods",
    emojis: [
      "😀","🙂","😐","😕","😢","😡","😴","🤔","🤩","🥳"
    ]
  },
  {
    id: "topics",
    label: "Topics",
    emojis: [
      "🧠","💡","📚","🛠️","🧪","🗂️","📝","🎯","📈","🧭"
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
    emojis: cat.emojis.filter(e => e.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q))
  })).filter(cat => cat.emojis.length > 0);

  res.json({ categories: filtered });
});

export default router;
