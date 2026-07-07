# Agent Brain + Expense Automation — Design

**Date:** 2026-07-07
**Owner:** Omar Hassanein
**Status:** Approved direction ("vault first"), decomposed into 3 sub-projects

## Vision

1. An "Obsidian brain" — a persistent vault where Claude agents write their work, decisions, and conversations as linked markdown, visible as a growing knowledge graph.
2. A specialized agent crew (marketer, web developer, video editor, content strategist) that works in parallel and logs everything to the brain.
3. A modern, futuristic live UI to watch the brain grow.
4. An expense + subscription automation: send a receipt photo or text to Telegram → parsed automatically → recorded in a tracker → confirmation back to phone. Built on n8n.

## Sub-project A — The Brain (build now)

- Vault at `C:\Users\Admin\Desktop\BRAIN` (plain markdown, openable in Obsidian).
- Structure:
  - `Dashboard.md` — home note linking everything
  - `agents/<name>/` — one folder per agent; agents write work notes here
  - `projects/washly/`, `projects/gym-content/`, `projects/expenses/`
  - `log/activity.md` — append-only event stream (agent started/finished, session events)
- Claude Code hooks (user-level `settings.json`): `SubagentStop` and `Stop` run a PowerShell script that appends timestamped entries to `log/activity.md`.
- Convention baked into agent prompts: every agent ends its task by writing a work note into its folder with `[[wikilinks]]` to related notes.

## Sub-project B — The Crew (build now)

- Agent definitions in `~/.claude/agents/`:
  - `marketer` — growth/copy/CRO, uses installed marketing-skills
  - `web-developer` — websites, landing pages, ui-design skills
  - `video-editor` — 9:16 shorts via vertical video-editing skill
  - `content-strategist` — content calendars, SEO, social publishing
- Each has a focused system prompt + instruction to log to the BRAIN vault.
- Orchestration: Claude Code native subagents/agent teams; VoltAgent repo (23k stars) as reference for more definitions later.

## Sub-project C — Live brain viewer UI (build v1 now)

- `BRAIN/_viewer/` — a local Node server (`serve.js`) that scans the vault, extracts notes + wikilinks, and serves a dark futuristic D3 force-graph page that polls for changes (near-live).
- v1: force graph + activity ticker. Later: claude-hud plugin for in-terminal live agent HUD.

## Sub-project D — Expense & subscription automation (foundation now, website next)

- Engine: n8n installed globally (195k stars). Telegram is the input channel.
- Flow: Telegram bot (via BotFather) → n8n Telegram Trigger → branch:
  - photo → download → AI vision parses receipt (amount, merchant, category)
  - text → AI parses free-form message ("coffee 4.50")
- → append to `Desktop\expense-automation\data\expenses.json` (subscriptions flagged by recurring-merchant detection) → Telegram confirmation reply.
- Templates from enescingoz/awesome-n8n-templates (23.7k stars) as reference.
- **User-only step:** create the bot with @BotFather in Telegram and provide the token.
- Website (dashboard for expenses/subscriptions, phone notifications) = next design cycle; reads the same data file. Wallos (8.1k stars) is the fallback if we prefer self-hosting over custom.

## Out of scope (for now)

- Vector embeddings/semantic search in the brain (phase 2; khoj or basic-memory are candidates).
- The custom expense website UI (own spec next).
- claude-hud install (quick follow-up, needs session restart anyway).

## Risks

- n8n on Windows global npm: works, runs at `http://localhost:5678`; needs to be running for automation to fire.
- Workflow JSON scaffold must be verified in the n8n editor after import.
- Telegram token is a secret — stored in n8n credentials, never committed.
