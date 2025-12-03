import React, { useEffect, useMemo, useState } from "react";
import { getEmojiCatalog } from "../api/emojisApi";
import { Smile, Search } from "lucide-react";

// Fallback emoji catalog if API fails
const FALLBACK_CATALOG = [
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

export default function EmojiPicker({ onPick, compact = false }) {
  const [categories, setCategories] = useState(FALLBACK_CATALOG);
  
  const [activeCat, setActiveCat] = useState(FALLBACK_CATALOG[0]?.id || null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEmojiCatalog();
        setCategories(data.categories || FALLBACK_CATALOG);
        setActiveCat((data.categories || FALLBACK_CATALOG)[0]?.id || null);
      } catch (e) {
        console.warn("Failed to load emoji catalog from API, using fallback:", e);
        // Keep fallback catalog, no error shown to user
        setCategories(FALLBACK_CATALOG);
        setActiveCat(FALLBACK_CATALOG[0]?.id || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleEmojis = useMemo(() => {
    if (!q) {
      // Show current category when not searching
      const cat = categories.find(c => c.id === activeCat) || categories[0];
      return cat ? cat.emojis : [];
    }
    // When searching, show all matching emojis from all categories
    const searchLower = q.toLowerCase().trim();
    const allEmojis = categories.flatMap(c => c.emojis);
    
    return allEmojis.filter(e => {
      if (typeof e === 'string') {
        return e.includes(searchLower);
      }
      // Object format with emoji and name
      const emojiChar = e.emoji || '';
      const emojiName = e.name || '';
      return emojiChar.includes(searchLower) || emojiName.toLowerCase().includes(searchLower);
    });
  }, [categories, activeCat, q]);

  const handleSearch = (value) => {
    setQ(value);
    // No need to filter categories - visibleEmojis handles it
  };

  const toggleOpen = () => setOpen(o => !o);

  return (
    <div className="emoji-picker" style={{ position: "relative", display: "inline-block" }}>
      <button className="btn" type="button" onClick={toggleOpen} title="Insert Emoji">
        <Smile size={16} /> {compact ? "" : "Emoji"}
      </button>

      {open && (
        <div className="emoji-popover" style={{
          position: "absolute",
          top: "36px",
          left: 0,
          zIndex: 10,
          width: compact ? 260 : 340,
          background: "var(--background)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          padding: 8
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 8, top: 8, opacity: 0.6 }} />
              <input
                aria-label="Search emojis"
                value={q}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search"
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 28px",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  background: "var(--background)",
                  color: "var(--text-color)"
                }}
              />
            </div>
          </div>

          {!q && (
            <div className="emoji-tabs" style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
              {categories.map(cat => {
                const symbolById = {
                  status: "📌",
                  moods: "🙂",
                  topics: "🧠",
                };
                const displaySymbol = symbolById[cat.id] || cat.label;

                return (
                  <button
                    key={cat.id}
                    className="btn"
                    onClick={() => setActiveCat(cat.id)}
                    style={{
                      padding: "8px 14px",
                      background: activeCat === cat.id ? "#3b82f6" : "#6b7280",
                      color: "#ffffff",
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      lineHeight: 1
                    }}
                  >
                    {displaySymbol}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 12, textAlign: "center" }}>Loading...</div>
          ) : (
            <div className="emoji-grid" style={{
              display: "grid",
              gridTemplateColumns: `repeat(${compact ? 8 : 10}, 1fr)`,
              gap: 6,
              maxHeight: 220,
              overflowY: "auto"
            }}>
              {visibleEmojis.map((e, idx) => {
                const emojiChar = typeof e === 'string' ? e : e.emoji;
                const emojiName = typeof e === 'object' && e.name ? e.name : emojiChar;
                return (
                  <button
                    key={idx}
                    className="emoji-cell"
                    onClick={() => { onPick && onPick(emojiChar); setOpen(false); }}
                    title={emojiName}
                    style={{
                      fontSize: compact ? 18 : 20,
                      lineHeight: 1,
                      padding: compact ? 6 : 8,
                      background: "transparent",
                      border: "1px solid transparent",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    {emojiChar}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
