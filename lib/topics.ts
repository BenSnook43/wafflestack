// Master topic taxonomy for the topic-based dashboard. The dashboard groups
// curated RSS feeds, Substacks and subreddits into these topics; the email
// structure is unchanged (still Reddit → RSS → Substack sections), so these
// IDs are pure UI metadata and never leave the dashboard layer.

export const TOPIC_IDS = [
  "tech",
  "ai",
  "investing",
  "startups",
  "world-news",
  "politics",
  "sports",
  "science",
  "design",
  "crypto",
  "health",
  "gaming",
  "ideas",
  "culture",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export const TOPIC_META: Record<TopicId, { label: string; emoji: string }> = {
  tech:         { label: "Tech",        emoji: "💻" },
  ai:           { label: "AI",          emoji: "🤖" },
  investing:    { label: "Investing",   emoji: "📈" },
  startups:     { label: "Startups",    emoji: "🚀" },
  "world-news": { label: "World News",  emoji: "🌍" },
  politics:     { label: "Politics",    emoji: "🏛️" },
  sports:       { label: "Sports",      emoji: "🏈" },
  science:      { label: "Science",     emoji: "🔬" },
  design:       { label: "Design",      emoji: "🎨" },
  crypto:       { label: "Crypto",      emoji: "₿"  },
  health:       { label: "Health",      emoji: "🏃" },
  gaming:       { label: "Gaming",      emoji: "🎮" },
  ideas:        { label: "Ideas",       emoji: "🧠" },
  culture:      { label: "Culture",     emoji: "🎭" },
};

// Maps CURATED_FEEDS.category (user-facing display name) → TopicId.
// Returns null for any category not in the taxonomy (defensive — currently all
// curated RSS categories map).
export function rssCategoryToTopic(category: string): TopicId | null {
  const map: Record<string, TopicId> = {
    "Tech":       "tech",
    "Investing":  "investing",
    "World News": "world-news",
    "Politics":   "politics",
    "Sports":     "sports",
    "Design":     "design",
    "Science":    "science",
    "Crypto":     "crypto",
    "Health":     "health",
    "Gaming":     "gaming",
  };
  return map[category] ?? null;
}

// Maps CURATED_SUBSTACKS.category → TopicId. The "Finance" Substack category
// remaps to the "investing" topic so finance newsletters live alongside
// investing RSS feeds in the same topic block.
export function substackCategoryToTopic(category: string): TopicId | null {
  const map: Record<string, TopicId> = {
    "Tech":     "tech",
    "AI":       "ai",
    "Startups": "startups",
    "Finance":  "investing",
    "Ideas":    "ideas",
    "Culture":  "culture",
  };
  return map[category] ?? null;
}

// Default topics for the hardcoded preset subreddits surfaced on the dashboard
// (see PRESET_SUBS in DashboardClient.tsx). Customs added inside Reddit get no
// topic; customs added inside a topic block get tagged via settings.subreddit_topics.
export const PRESET_SUBREDDIT_TOPICS: Record<string, TopicId> = {
  technology: "tech",
  investing:  "investing",
  science:    "science",
  worldnews:  "world-news",
  design:     "design",
  philosophy: "ideas",
};
