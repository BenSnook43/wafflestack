# WaffleStack

A personalised daily morning email digest delivered to users' inboxes. Users configure their preferences (location, subreddits, stocks, calendar, Gmail etc.) and receive a curated, AI-written email each morning — think Morning Brew but fully personalised per user.

Domain: wafflestack.am

## Vision

Lean, autonomous small business. Not targeting huge scale. The goal is a profitable niche product that largely runs itself, with Claude Code handling most of the engineering iteration.

## Architecture

### Services
- **Frontend** — Vercel (static, free)
- **Database + Auth** — Supabase (user records, preferences, OAuth tokens)
- **Workflow engine** — n8n, self-hosted on Mac Mini initially → VPS when scale demands
- **Email delivery** — Resend (free to 3k/mo) → AWS SES at scale
- **LLM** — Claude Haiku (cost-efficient for summarisation, ~$0.006/email)
- **Tunnel** — Cloudflare Tunnel (exposes Mac Mini n8n to web without port forwarding)

### How emails are sent
One n8n workflow runs on a daily cron. It fetches all active users from Supabase, loops through each one, plugs their preferences into the workflow as variables, generates their email via Claude, and sends it. No workflow duplication per user — one workflow handles all users.

### Data sources
- Weather: OpenWeatherMap API
- Reddit: Reddit API (cache per unique subreddit, not per user)
- Stocks/markets: Alpha Vantage or Polygon.io free tier
- Calendar: Google Calendar API (OAuth per user)
- Gmail: Gmail API (OAuth per user)

## Phases

### Phase 1 — Parametric workflow (current)
Convert the existing personal n8n workflow from hardcoded values to parametric ones driven by a webhook payload. Test manually on MacBook. No scheduling needed yet.

Webhook payload shape:
```json
{
  "email": "user@example.com",
  "location": "London",
  "subreddits": ["technology", "investing"],
  "stocks": ["AAPL", "TSLA"],
  "connectors": ["weather", "reddit", "stocks"]
}
```

### Phase 2 — UI + user layer
- Signup form and preferences UI
- Supabase schema: users, preferences, oauth_tokens
- Daily scheduler triggers n8n webhook per user (or n8n loops through Supabase itself)
- Deploy frontend to Vercel

### Phase 3 — OAuth connectors
- Google Calendar: summary of today's events
- Gmail: unread digest, flag urgents
- Future: Todoist, Notion, Slack

### Phase 4 — Monetisation + migration
- Stripe for subscriptions (~$3-5/mo per user)
- Migrate n8n from Mac Mini to Hetzner/DO VPS when uptime becomes critical
- Break-even is very early — costs ~$30/mo at 100 users

## Key decisions

- **Use Haiku not Sonnet** — quality is sufficient for summarisation, 3x cheaper
- **Cache API calls by unique value** — fetch each subreddit/ticker once per run, not once per user
- **Mac Mini first** — self-host n8n locally until there are paying users who'd notice downtime
- **Cloudflare Tunnel** — no port forwarding, no static IP required
- **Keep scope lean** — get weather + Reddit + stocks + email working before adding connectors
- **Email voice: Morning Brew-style, not a data report** — Haiku prompts must produce witty, concise, human-sounding prose. The output should feel like a smart friend summarising the news, not a dashboard printout. Inject light humour and personality; avoid dry bullet dumps.
- **Referral program is a launch feature, not a Phase 4 afterthought** — WaffleStack's personalisation pitch ("get your own version built around your life") is unusually shareable. Build referral mechanics into the UI from day one. Start tiers at 3–5 referrals with achievable rewards (e.g. a free month). Economically sound at $3–5/mo.

## Cost reference

| Users | Monthly cost (Haiku) |
|-------|----------------------|
| 100 | ~$30 |
| 500 | ~$130 |
| 1,000 | ~$260 |
| 5,000 | ~$1,110 |

Profitable at $3-5/mo per user from day one.
