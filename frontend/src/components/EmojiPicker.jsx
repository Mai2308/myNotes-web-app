import React, { useEffect, useMemo, useState } from "react";
import { getEmojiCatalog, searchEmojis } from "../api/emojisApi";
import { Smile, Search } from "lucide-react";

export default function EmojiPicker({ onPick, compact = false }) {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEmojiCatalog();
        setCategories(data.categories || []);
        setActiveCat((data.categories || [])[0]?.id || null);
      } catch (e) {
        setError(e.message || "Failed to load emojis");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleEmojis = useMemo(() => {
    if (!q) {
      const cat = categories.find(c => c.id === activeCat) || categories[0];
      return cat ? cat.emojis : [];
    }
    // When searching, flatten categories and filter
    return (categories.flatMap(c => c.emojis)).filter(e => e.toLowerCase().includes(q.toLowerCase()));
  }, [categories, activeCat, q]);

  const handleSearch = async (value) => {
    setQ(value);
    if (!value) return; // resets to category view
    try {
      const data = await searchEmojis(value);
      setCategories(data.categories || []);
    } catch (e) {
      // ignore errors, keep current
    }
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
            <div className="emoji-tabs" style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="btn"
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    padding: "6px 10px",
                    background: activeCat === cat.id ? "#4b5563" : "#374151",
                    borderRadius: 6,
                    fontSize: 12
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 12 }}>Loading emojis...</div>
          ) : error ? (
            <div className="alert">{error}</div>
          ) : (
            <div className="emoji-grid" style={{
              display: "grid",
              gridTemplateColumns: `repeat(${compact ? 8 : 10}, 1fr)`,
              gap: 6,
              maxHeight: 220,
              overflowY: "auto"
            }}>
              {visibleEmojis.map((e, idx) => (
                <button
                  key={idx}
                  className="emoji-cell"
                  onClick={() => { onPick && onPick(e); setOpen(false); }}
                  title={e}
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
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
