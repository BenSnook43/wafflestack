"use client";

import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export type BlockType = "weather" | "reddit" | "stocks" | "hacker_news" | "rss" | "separator";

export interface Block {
  id: string;
  type: BlockType;
  config: {
    city?: string;
    subreddits?: string[];
    tickers?: string[];
    feeds?: string[];
  };
}

interface Props {
  email: string;
  userId: string;
  active: boolean;
  blocks: Block[];
}

// ── Block display metadata ───────────────────────────────────────────────────

const BLOCK_META: Record<BlockType, { emoji: React.ReactNode; label: string }> = {
  weather:     { emoji: "⛅", label: "Weather" },
  reddit:      { emoji: <span className="font-black text-orange-500">↑</span>, label: "Reddit" },
  stocks:      { emoji: "📈", label: "Markets" },
  hacker_news: { emoji: <span className="font-extrabold bg-orange-600 text-white w-5 h-5 flex items-center justify-center rounded text-[10px]">Y</span>, label: "Hacker News" },
  rss:         { emoji: "📡", label: "RSS Feeds" },
  separator:   { emoji: "—", label: "Separator" },
};

function blockSummary(block: Block): string {
  switch (block.type) {
    case "weather":     return block.config.city ? `📍 ${block.config.city}` : "No city set";
    case "reddit":      return block.config.subreddits?.length ? block.config.subreddits.map((s) => `r/${s}`).join(", ") : "No subreddits";
    case "stocks":      return block.config.tickers?.length ? block.config.tickers.join(", ") : "No tickers";
    case "hacker_news": return "Top stories";
    case "rss":         return block.config.feeds?.length ? block.config.feeds.join(", ") : "No feeds added";
    case "separator":   return "Visual divider";
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient(props: Props) {
  const [blocks, setBlocks] = useState<Block[]>(props.blocks);
  const [active, setActive] = useState(props.active);
  const [showPicker, setShowPicker] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, dir: "up" | "down") {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function addBlock(block: Block) {
    setBlocks((prev) => [...prev, block]);
    setShowPicker(false);
  }

  function saveEditedBlock(updated: Block) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditingBlock(null);
  }

  async function handleSave() {
    setSaveStatus("loading");

    // Derive flat fields for n8n backward compatibility
    const weatherBlock = blocks.find((b) => b.type === "weather");
    const redditBlock = blocks.find((b) => b.type === "reddit");
    const stocksBlock = blocks.find((b) => b.type === "stocks");
    const rssBlock = blocks.find((b) => b.type === "rss");
    const connectors = blocks
      .filter((b) => b.type !== "separator")
      .map((b) => b.type);

    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: weatherBlock?.config.city ?? null,
        subreddits: redditBlock?.config.subreddits ?? [],
        stocks: stocksBlock?.config.tickers ?? [],
        rss_feeds: rssBlock?.config.feeds ?? [],
        settings: { connectors, blocks },
      }),
    });

    if (res.ok) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      setSaveStatus("error");
    }
  }

  async function handleTogglePause() {
    const next = !active;
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) setActive(next);
  }

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-waffle-pale">
      {/* ── Header ── */}
      <div className="bg-waffle-cream border-b border-waffle-brown/8">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-waffle-brown">Your Digest</h1>
            <p className="text-xs text-waffle-brown/40 mt-0.5">{props.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-waffle-brown/40 hover:text-waffle-brown transition-colors font-semibold"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        {/* ── Pause toggle ── */}
        <div className="bg-white rounded-2xl border border-waffle-brown/8 px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-waffle-brown">
              {active ? "Briefings active" : "Briefings paused"}
            </p>
            <p className="text-xs text-waffle-brown/45 mt-0.5">
              {active ? "One email every morning at 7:00 AM." : "No emails until you resume."}
            </p>
          </div>
          <button
            onClick={handleTogglePause}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              active ? "bg-waffle-orange" : "bg-waffle-brown/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ── Block list ── */}
        <div className="space-y-1">
          {blocks.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-waffle-brown/10 px-6 py-12 text-center text-waffle-brown/30 text-sm font-medium">
              Your digest is empty. Add some sources below.
            </div>
          )}

          {blocks.map((block, idx) => (
            <BlockCard
              key={block.id}
              block={block}
              isFirst={idx === 0}
              isLast={idx === blocks.length - 1}
              onEdit={() => setEditingBlock(block)}
              onRemove={() => removeBlock(block.id)}
              onMoveUp={() => moveBlock(block.id, "up")}
              onMoveDown={() => moveBlock(block.id, "down")}
            />
          ))}
        </div>

        {/* ── Add block button ── */}
        <button
          onClick={() => setShowPicker(true)}
          className="w-full bg-white hover:bg-waffle-pale border-2 border-dashed border-waffle-brown/15 hover:border-waffle-orange/40 rounded-2xl py-4 text-sm font-semibold text-waffle-brown/50 hover:text-waffle-orange transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add to your digest
        </button>

        {/* ── Save button ── */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saveStatus === "loading"}
            className="w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Stack saved! ✓" : "Save Stack"}
          </button>
          {saveStatus === "error" && (
            <p className="text-xs text-red-600 text-center mt-2">Failed to save. Please try again.</p>
          )}
        </div>

        {/* ── Unsubscribe ── */}
        <div className="text-center pt-2">
          <a
            href={`/unsubscribe?uid=${props.userId}`}
            className="text-xs text-waffle-brown/30 hover:text-waffle-brown/60 underline transition-colors"
          >
            Unsubscribe permanently
          </a>
        </div>
      </div>

      {/* ── Source picker modal ── */}
      {(showPicker || editingBlock !== null) && (
        <SourcePickerModal
          editingBlock={editingBlock}
          onAdd={addBlock}
          onUpdate={saveEditedBlock}
          onClose={() => {
            setShowPicker(false);
            setEditingBlock(null);
          }}
        />
      )}
    </main>
  );
}

// ── BlockCard ────────────────────────────────────────────────────────────────

function BlockCard({
  block,
  isFirst,
  isLast,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const meta = BLOCK_META[block.type];

  if (block.type === "separator") {
    return (
      <div className="flex items-center gap-3 py-2 px-4 group">
        <div className="flex-1 h-px bg-waffle-brown/10" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ControlBtn onClick={onRemove} title="Remove" danger>✕</ControlBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-waffle-brown/8 px-5 py-4 flex items-start gap-4 shadow-sm group">
      <div className="text-2xl leading-none mt-0.5 flex-shrink-0 w-8 flex items-center justify-center">
        {meta.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-waffle-brown text-sm">{meta.label}</p>
        <p className="text-xs text-waffle-brown/45 mt-0.5 truncate">{blockSummary(block)}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <ControlBtn onClick={onRemove} title="Remove" danger>✕</ControlBtn>
        <ControlBtn onClick={onMoveUp} title="Move up" disabled={isFirst}>↑</ControlBtn>
        <ControlBtn onClick={onMoveDown} title="Move down" disabled={isLast}>↓</ControlBtn>
        <button
          onClick={onEdit}
          className="text-xs font-bold text-waffle-brown/50 hover:text-waffle-brown bg-waffle-pale hover:bg-waffle-golden/20 px-3 py-1.5 rounded-lg transition-colors ml-1"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function ControlBtn({
  onClick,
  title,
  danger,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-20 ${
        danger
          ? "text-waffle-brown/30 hover:bg-red-50 hover:text-red-500"
          : "text-waffle-brown/40 hover:bg-waffle-pale hover:text-waffle-brown"
      }`}
    >
      {children}
    </button>
  );
}

// ── Source Picker Modal ──────────────────────────────────────────────────────

const SOURCE_TYPES: { type: BlockType; emoji: React.ReactNode; label: string }[] = [
  { type: "weather",     emoji: "⛅", label: "Weather" },
  { type: "stocks",      emoji: "📈", label: "Stocks" },
  { type: "reddit",      emoji: <span className="font-black text-orange-500 text-xl">↑</span>, label: "Reddit" },
  { type: "hacker_news", emoji: <span className="font-extrabold bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded text-sm">Y</span>, label: "Hacker News" },
  { type: "rss",         emoji: "📡", label: "RSS Feeds" },
  { type: "separator",   emoji: <span className="font-bold text-waffle-brown/40 text-xl">—</span>, label: "Separator" },
];

function SourcePickerModal({
  editingBlock,
  onAdd,
  onUpdate,
  onClose,
}: {
  editingBlock: Block | null;
  onAdd: (block: Block) => void;
  onUpdate: (block: Block) => void;
  onClose: () => void;
}) {
  const [pickerStep, setPickerStep] = useState<"grid" | "config">(
    editingBlock ? "config" : "grid"
  );
  const [selectedType, setSelectedType] = useState<BlockType | null>(
    editingBlock?.type ?? null
  );
  const [city, setCity] = useState(editingBlock?.config.city ?? "");
  const [tickers, setTickers] = useState(
    editingBlock?.config.tickers?.join(", ") ?? ""
  );
  const [subreddits, setSubreddits] = useState<string[]>(
    editingBlock?.config.subreddits ?? []
  );
  const [customSub, setCustomSub] = useState("");
  const [feeds, setFeeds] = useState<string[]>(editingBlock?.config.feeds ?? []);
  const [customFeed, setCustomFeed] = useState("");

  function selectType(type: BlockType) {
    if (type === "separator") {
      onAdd({ id: uid(), type: "separator", config: {} });
      return;
    }
    setSelectedType(type);
    setPickerStep("config");
  }

  function addCustomSub() {
    const cleaned = customSub.trim().toLowerCase().replace(/^r\//, "");
    if (cleaned && !subreddits.includes(cleaned)) {
      setSubreddits((prev) => [...prev, cleaned]);
      setCustomSub("");
    }
  }

  function addFeed() {
    const url = customFeed.trim();
    if (url && !feeds.includes(url)) {
      setFeeds((prev) => [...prev, url]);
      setCustomFeed("");
    }
  }

  function handleConfirm() {
    if (!selectedType) return;

    const config: Block["config"] = {};
    if (selectedType === "weather") config.city = city.trim();
    if (selectedType === "stocks") {
      config.tickers = tickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
    }
    if (selectedType === "reddit") {
      const pendingSub = customSub.trim().toLowerCase().replace(/^r\//, "");
      const allSubs = pendingSub && !subreddits.includes(pendingSub) ? [...subreddits, pendingSub] : subreddits;
      config.subreddits = allSubs;
    }
    if (selectedType === "rss") {
      // Auto-flush any URL typed but not yet added via the Add button
      const pendingUrl = customFeed.trim();
      const allFeeds = pendingUrl && !feeds.includes(pendingUrl) ? [...feeds, pendingUrl] : feeds;
      config.feeds = allFeeds;
    }

    const block: Block = {
      id: editingBlock?.id ?? uid(),
      type: selectedType,
      config,
    };

    if (editingBlock) {
      onUpdate(block);
    } else {
      onAdd(block);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-waffle-espresso/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-waffle-brown/8">
          <div className="flex items-center gap-3">
            {pickerStep === "config" && !editingBlock && (
              <button
                onClick={() => setPickerStep("grid")}
                className="text-sm font-semibold text-waffle-brown/50 hover:text-waffle-brown transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="font-extrabold text-waffle-brown text-base">
              {pickerStep === "grid"
                ? "Add to your digest"
                : editingBlock
                ? `Edit ${BLOCK_META[selectedType!]?.label}`
                : `Configure ${BLOCK_META[selectedType!]?.label}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-waffle-pale hover:bg-waffle-golden/30 flex items-center justify-center text-waffle-brown/50 hover:text-waffle-brown transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Grid step */}
        {pickerStep === "grid" && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {SOURCE_TYPES.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  onClick={() => selectType(type)}
                  className="flex flex-col items-center gap-3 bg-waffle-pale hover:bg-waffle-golden/20 border border-waffle-brown/8 hover:border-waffle-orange/30 rounded-2xl p-5 transition-all group"
                >
                  <span className="text-3xl leading-none flex items-center justify-center w-10 h-10">
                    {emoji}
                  </span>
                  <span className="text-sm font-bold text-waffle-brown group-hover:text-waffle-espresso">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Config step */}
        {pickerStep === "config" && selectedType && (
          <div className="p-6 space-y-5">
            {selectedType === "weather" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-waffle-brown">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London"
                  autoFocus
                  className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3 text-sm bg-waffle-cream text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
                />
              </div>
            )}

            {selectedType === "stocks" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-waffle-brown">Stock tickers</label>
                <input
                  type="text"
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  placeholder="AAPL, TSLA, NVDA"
                  autoFocus
                  className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3 text-sm bg-waffle-cream text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
                />
                <p className="text-xs text-waffle-brown/40">Comma-separated ticker symbols</p>
              </div>
            )}

            {selectedType === "reddit" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-waffle-brown">Subreddits</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSub}
                      onChange={(e) => setCustomSub(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomSub()}
                      onBlur={addCustomSub}
                      placeholder="e.g. r/technology"
                      autoFocus
                      className="flex-1 border border-waffle-brown/15 rounded-xl px-4 py-3 text-sm bg-waffle-cream text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
                    />
                    <button
                      type="button"
                      onClick={addCustomSub}
                      className="px-4 py-3 bg-waffle-pale rounded-xl text-waffle-brown font-semibold text-sm hover:bg-waffle-golden/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {subreddits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subreddits.map((sub) => (
                      <span
                        key={sub}
                        className="flex items-center gap-1.5 bg-waffle-pale border border-waffle-golden/30 rounded-full px-3 py-1.5 text-sm font-semibold text-waffle-brown"
                      >
                        r/{sub}
                        <button
                          onClick={() => setSubreddits((prev) => prev.filter((s) => s !== sub))}
                          className="text-waffle-brown/40 hover:text-red-500 transition-colors leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedType === "hacker_news" && (
              <p className="text-sm text-waffle-brown/60 bg-waffle-pale rounded-xl p-4">
                Adds the top stories from Hacker News to your morning digest. No configuration needed.
              </p>
            )}

            {selectedType === "rss" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-waffle-brown">Feed URLs</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customFeed}
                      onChange={(e) => setCustomFeed(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addFeed()}
                      onBlur={addFeed}
                      placeholder="https://example.com/feed.xml"
                      autoFocus
                      className="flex-1 border border-waffle-brown/15 rounded-xl px-4 py-3 text-sm bg-waffle-cream text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
                    />
                    <button
                      type="button"
                      onClick={addFeed}
                      className="px-4 py-3 bg-waffle-pale rounded-xl text-waffle-brown font-semibold text-sm hover:bg-waffle-golden/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {feeds.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {feeds.map((feed) => (
                      <span
                        key={feed}
                        className="flex items-center justify-between gap-2 bg-waffle-pale border border-waffle-golden/30 rounded-xl px-3 py-2 text-xs font-medium text-waffle-brown"
                      >
                        <span className="truncate">{feed}</span>
                        <button
                          onClick={() => setFeeds((prev) => prev.filter((f) => f !== feed))}
                          className="text-waffle-brown/40 hover:text-red-500 transition-colors flex-shrink-0 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="w-full bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {editingBlock ? "Update block" : "Add to digest"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
