const output = $input.first().json.output;
const vars = $('Breakout Vars').first().json;

const buildData = $('Build Prompt').first().json;
const financeSection = buildData.finance_section;
const weatherSection = buildData.weather_section;
const sectionOrder = buildData.section_order ?? [];

// Parse LLM output
const cleaned = output
  .replace(/^```json\n?/, '')
  .replace(/^```\n?/, '')
  .replace(/```$/, '')
  .trim()
  .replace(/[\u0000-\u001F\u007F]/g, (ch) => {
    if (ch === '\n' || ch === '\r') return ' ';
    if (ch === '\t') return ' ';
    return '';
  });

let data;
try {
  data = JSON.parse(cleaned);
} catch (e) {
  throw new Error(`Failed to parse LLM JSON: ${e.message}\n\nFirst 300 chars of output:\n${output.slice(0, 300)}`);
}

// Rebuild sections in correct order
const llmByType = {};
for (const s of data.sections ?? []) {
  llmByType[s.type] = s;
}
const orderedSections = [];
for (const sectionType of sectionOrder) {
  if (sectionType === 'finance') {
    if (financeSection) orderedSections.push(financeSection);
  } else if (sectionType === 'weather') {
    if (weatherSection) orderedSections.push(weatherSection);
  } else if (llmByType[sectionType]) {
    orderedSections.push(llmByType[sectionType]);
  }
}
data.sections = orderedSections;

// ── Helpers ──────────────────────────────────────────────────────────────────

const icon = (name) =>
  `<img src="https://wafflestack.am/icons/${name}" width="14" height="14" alt="" style="vertical-align:middle;margin-right:4px;border-radius:2px;">`;

function formatScore(n) {
  const num = Number(n);
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

// Short weekday of the most recently completed US trading session. Email goes out
// before market open, so the latest close is the prior trading weekday.
// (Holidays not modelled — the % itself is always "vs previous close"; only this
// label word can be off by a holiday. Acceptable for now.)
function lastTradingWeekday() {
  const d = new Date();
  const offset = { 0: 2, 1: 3, 6: 1 }[d.getDay()] ?? 1; // Sun→Fri, Mon→Fri, Sat→Fri, else prior day
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

const SANS = "'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif";
const NEWS = "'Newsreader',Georgia,serif";

const rule = `<div style="height:1px;background:#f0ece6;"></div>`;

// Table-based section label — email-safe alternative to display:flex
const sectionLabel = (label) =>
  `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;"><tr>
    <td style="font-family:${SANS};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#c47c1a;white-space:nowrap;padding-right:10px;" width="1%">${label}</td>
    <td><div style="height:1px;background:#f0ece6;"></div></td>
  </tr></table>`;

const sectionWrap = (headerHtml, bodyHtml) =>
  `<div style="padding:22px 0;">${headerHtml}${bodyHtml}</div>${rule}`;

// Left-border quote block for the LLM take
const takeBlock = (take) =>
  `<div style="background:#ffffff;border-left:3px solid #f5c33a;padding:8px 12px;border-radius:0 6px 6px 0;margin-top:6px;">
    <div style="font-family:${NEWS};font-size:13px;font-weight:500;color:#4a3424;line-height:1.6;">${take}</div>
  </div>`;

// HN story row — points + comments shown as small inline text below the title (mirrors Reddit)
const hnStoryRow = (url, title, score, comments, take) =>
  `<div style="margin-bottom:18px;">
    <a href="${url}" style="font-family:${SANS};font-size:14px;font-weight:600;color:#2d1a0e;text-decoration:none;line-height:1.3;display:block;margin-bottom:4px;">${title}</a>
    <span style="font-family:${SANS};font-size:10px;color:#7a5010;margin-bottom:6px;display:block;">&#9650; ${formatScore(score)} points &nbsp;&bull;&nbsp; &#128172; ${formatScore(comments)} comments</span>
    ${takeBlock(take)}
  </div>`;

// Reddit story row — upvotes + comments shown as small inline pills below the title
const redditStoryRow = (url, title, score, comments, take) =>
  `<div style="margin-bottom:18px;">
    <a href="${url}" style="font-family:${SANS};font-size:14px;font-weight:600;color:#2d1a0e;text-decoration:none;line-height:1.3;display:block;margin-bottom:4px;">${title}</a>
    <span style="font-family:${SANS};font-size:10px;color:#7a5010;margin-bottom:6px;display:block;">&#9650; ${formatScore(score)} upvotes &nbsp;&bull;&nbsp; &#128172; ${formatScore(comments)} comments</span>
    ${takeBlock(take)}
  </div>`;

// RSS / generic article — no badge
const articleRow = (url, title, take) =>
  `<div style="margin-bottom:18px;">
    <a href="${url}" style="font-family:${SANS};font-size:14px;font-weight:600;color:#2d1a0e;text-decoration:none;line-height:1.3;display:block;margin-bottom:2px;">${title}</a>
    ${takeBlock(take)}
  </div>`;

// Map OpenWeatherMap icon codes to email-safe emoji
const weatherEmoji = (icon) => {
  if (!icon) return '🌡️';
  const base = icon.replace(/[dn]$/, '');
  const map = { '01': '☀️', '02': '⛅', '03': '🌤️', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
  return map[base] ?? '🌡️';
};

// Weather card — rendered deterministically from structured section fields
const weatherCard = (s) => {
  if (s.temp === undefined) return '';

  const hourlyRow = (s.hourly ?? []).length > 0
    ? `<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;padding-top:12px;border-top:1px solid #f0e8d0;"><tr>
        ${s.hourly.map(h => `<td align="center" style="padding:0 2px;">
          <div style="font-size:15px;line-height:1;">${weatherEmoji(h.icon)}</div>
          <div style="font-family:${SANS};font-size:10px;color:#9a8070;margin-top:3px;">${h.time}</div>
          <div style="font-family:${SANS};font-size:11px;font-weight:600;color:#2d1a0e;margin-top:2px;">${h.temp}°</div>
        </td>`).join('')}
      </tr></table>`
    : '';

  const hasForecast = (s.forecast ?? []).length > 0;

  const mainCard = `<div style="background:#ffffff;border:1px solid #f0e8d0;border-radius:8px;padding:14px 16px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td valign="middle">
        <div style="font-family:${SANS};font-size:${hasForecast ? '32' : '38'}px;font-weight:700;color:#2d1a0e;line-height:1;">${s.temp}°</div>
        <div style="font-family:${SANS};font-size:11px;color:#9a8070;margin-top:4px;text-transform:capitalize;">${s.condition}${s.location ? ' &middot; ' + s.location : ''}</div>
      </td>
      <td valign="top" align="right">
        <div style="font-family:${SANS};font-size:12px;font-weight:700;color:#c03020;">H ${s.high}°</div>
        <div style="font-family:${SANS};font-size:12px;font-weight:700;color:#2563eb;margin-top:3px;">L ${s.low}°</div>
        ${s.feels_like !== undefined ? `<div style="font-family:${SANS};font-size:10px;color:#b09a82;margin-top:3px;">feels ${s.feels_like}°</div>` : ''}
      </td>
    </tr></table>
    ${hourlyRow}
  </div>`;

  if (!hasForecast) {
    return `<table cellpadding="0" cellspacing="0" width="100%"><tr><td>${mainCard}</td></tr></table>`;
  }

  // Single unified card. Rows use a taller layout (day + H/L line + description)
  // so the content fills the card rather than floating in dead space.
  const forecastInner = s.forecast.map((f, i) => `
    ${i > 0 ? '<tr><td colspan="2" height="1" style="padding:0;line-height:1px;font-size:1px;background:#f0e8d0;">&nbsp;</td></tr>' : ''}
    <tr>
      <td width="1%" valign="middle" style="padding:14px 10px 14px 14px;">
        <div style="font-size:26px;line-height:1;">${weatherEmoji(f.icon)}</div>
      </td>
      <td valign="middle" style="padding:14px 14px 14px 0;">
        <div style="font-family:${SANS};font-size:11px;font-weight:700;color:#2d1a0e;margin-bottom:4px;">${f.day}</div>
        <div style="font-family:${SANS};font-size:14px;font-weight:700;line-height:1;margin-bottom:4px;">
          <span style="color:#c03020;">H ${f.high}°</span>&nbsp;<span style="color:#9a8070;font-weight:400;">&middot;</span>&nbsp;<span style="color:#2563eb;">L ${f.low}°</span>
        </div>
        <div style="font-family:${NEWS};font-size:11px;font-style:italic;color:#9a8070;text-transform:capitalize;">${f.description}</div>
      </td>
    </tr>`).join('');

  return `<table cellpadding="0" cellspacing="0" width="100%"><tr>
    <td width="53%" valign="top" style="padding-right:10px;">${mainCard}</td>
    <td width="47%" valign="middle" style="background:#ffffff;border:1px solid #f0e8d0;border-radius:8px;">
      <table cellpadding="0" cellspacing="0" width="100%">${forecastInner}</table>
    </td>
  </tr></table>`;
};

// ── Section renderers ────────────────────────────────────────────────────────

const sectionHtml = (s) => {
  if (s.type === 'weather') {
    return sectionWrap(
      sectionLabel('&#x2600; Weather &amp; Your Day'),
      weatherCard(s)
    );
  }

  if (s.type === 'finance') {
    if (!s.tickers || s.tickers.length === 0) return '';
    const pills = s.tickers.map(t => {
      const up = t.direction === 'up';
      return `<div style="display:inline-block;background:${up ? '#f0fdf4' : '#fef2f2'};border:1px solid ${up ? '#bbf7d0' : '#fecaca'};border-radius:6px;padding:8px 6px;text-align:center;min-width:52px;margin:0 5px 5px 0;vertical-align:top;">
        <div style="font-family:${SANS};font-size:11px;font-weight:700;color:#2d1a0e;line-height:1.2;">${t.symbol}</div>
        <div style="font-family:${SANS};font-size:12px;font-weight:600;color:${up ? '#16a34a' : '#dc2626'};margin-top:2px;">${t.change}</div>
      </div>`;
    }).join('');
    // 3-cell header: label | rule | "1-day · <weekday>"
    const financeHeader =
      `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;"><tr>
        <td style="font-family:${SANS};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#c47c1a;white-space:nowrap;padding-right:10px;" width="1%">&#x1F4C8; Markets</td>
        <td><div style="height:1px;background:#f0ece6;"></div></td>
        <td style="font-family:${SANS};font-size:11px;color:#b09a82;white-space:nowrap;padding-left:10px;" width="1%">1-day &middot; ${lastTradingWeekday()}</td>
      </tr></table>`;
    return sectionWrap(financeHeader, `<div>${pills}</div>`);
  }

  if (s.type === 'reddit') {
    return (s.feeds ?? []).map(feed => {
      const posts = (feed.posts ?? []).map(p =>
        redditStoryRow(p.url, p.title, p.score, p.comments, p.take)
      ).join('');
      return sectionWrap(sectionLabel(`${icon('reddit.png')} r/${feed.subreddit}`), posts);
    }).join('');
  }

  if (s.type === 'hacker_news') {
    const stories = (s.stories ?? []).map(p =>
      hnStoryRow(p.url, p.title, p.score, p.comments, p.take)
    ).join('');
    return sectionWrap(sectionLabel(`${icon('hacker-news.png')} Hacker News`), stories);
  }

  if (s.type === 'rss') {
    return (s.feeds ?? []).map(feed => {
      const label = feed.name || feed.source || 'News';
      const feedIcon = label.includes('substack.com') ? icon('substack.png') : icon('rss_icon.png');
      const feedUrl = /\.[a-z]{2,}/.test(label) ? `https://${label.replace(/^https?:\/\//, '')}` : null;
      const labelHtml = feedUrl
        ? `<a href="${feedUrl}" style="color:#c47c1a;text-decoration:none;">${label}</a>`
        : `<span style="color:#c47c1a;">${label}</span>`;
      const items = (feed.items ?? []).map(item =>
        articleRow(item.url, item.title, item.take)
      ).join('');
      return sectionWrap(sectionLabel(`${feedIcon} ${labelHtml}`), items);
    }).join('');
  }

  return '';
};

// ── HTML ──────────────────────────────────────────────────────────────────────

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Newsreader:ital,wght@0,400;0,500;1,400;1,500;1,600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#fffdf5;font-family:'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:0 24px;">

  <!-- Header: waffle logo left, date right -->
  <div style="padding:32px 0 0;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td valign="middle">
        <table cellpadding="0" cellspacing="0"><tr>
          <td valign="middle" style="padding-right:10px;">
            <img src="https://wafflestack.am/icons/IconCropped.png" width="34" height="34" alt="WaffleStack" style="display:block;">
          </td>
          <td valign="middle">
            <span style="font-family:${SANS};font-size:18px;font-weight:700;color:#2d1a0e;letter-spacing:-0.3px;">WaffleStack</span>
          </td>
        </tr></table>
      </td>
      <td valign="middle" align="right">
        <span style="font-family:${SANS};font-size:12px;color:#b09a82;font-weight:500;">${today}</span>
      </td>
    </tr></table>
  </div>

  <!-- Greeting + lede -->
  <div style="padding:20px 0 24px;">
    <div style="font-family:${SANS};font-size:22px;font-weight:700;color:#2d1a0e;line-height:1.25;letter-spacing:-0.4px;margin-bottom:10px;">${data.greeting}</div>
    <div style="font-family:${NEWS};font-size:15px;color:#4a3424;line-height:1.65;font-weight:500;">${data.tagline}</div>
  </div>

  ${rule}

  <!-- Sections -->
  ${data.sections.map(sectionHtml).join('')}

  <!-- Footer -->
  <div style="border-top:1px solid #f0ece6;padding:24px 0 36px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td valign="middle">
        <table cellpadding="0" cellspacing="0"><tr>
          <td valign="middle" style="padding-right:8px;">
            <img src="https://wafflestack.am/icons/IconCropped.png" width="22" height="22" alt="WaffleStack" style="display:block;">
          </td>
          <td valign="middle">
            <span style="font-family:${SANS};font-size:12px;font-weight:600;color:#2d1a0e;">WaffleStack</span>
          </td>
        </tr></table>
      </td>
      <td valign="middle" align="right">
        <a href="https://wafflestack.am/dashboard" style="font-family:${SANS};font-size:11px;color:#b09a82;text-decoration:none;">Manage sources</a>
        <span style="font-family:${SANS};font-size:11px;color:#ddd6cc;margin:0 8px;">&middot;</span>
        <a href="https://wafflestack.am/unsubscribe?email=${encodeURIComponent(vars.email)}" style="font-family:${SANS};font-size:11px;color:#b09a82;text-decoration:none;">Unsubscribe</a>
      </td>
    </tr></table>
  </div>

</div>
</body>
</html>`;

return [{ json: { output: html } }];
