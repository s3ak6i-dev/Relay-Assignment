# Relay

An internal support ticketing tool built for The/Nudge Institute assignment. Employees raise tickets without needing to know which department handles them — AI routes automatically.

## What it does

Three roles, one app:

**Employee** — Raises tickets. Describes the issue; AI suggests the right department with a confidence score. Similar resolved tickets surface before submission so employees can check if their issue is already addressed.

**Agent** — Works the department queue sorted by urgency. Opens a ticket, reads the full context, updates status, and can generate an AI-drafted first response with one click.

**Admin** — Sees the health of the support system: ticket volume by status and department, weekly trend, and a flagged list of high/critical tickets open more than 48 hours.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3 (PostCSS)
- Groq API — `llama3-8b-8192` for all AI calls
- Recharts for the admin dashboard
- localStorage for persistence (no backend required)

## AI features

The app makes three Groq API calls:

1. **Auto-categorization** — On description blur (300ms debounce), classifies the ticket into IT / HR / Finance / Admin with a confidence score and one-sentence reason.
2. **Similar ticket detection** — After categorization, finds up to 3 semantically similar resolved tickets so employees can self-serve before submitting.
3. **AI draft response** — Agents can generate a professional, empathetic first response to any ticket with one click. Editable before saving.

All AI features are optional. The app works fully without an API key — AI panels show a soft prompt to add one.

## Design

Dark UI (`#0F0F0F` base) with a single signature element: ticket cards have a color-coded left border by urgency. Critical tickets animate with a breathing pulse — the only animation in the UI, which makes it impossible to miss.

| Urgency | Color |
|---------|-------|
| Critical | `#FF6B35` (animated) |
| High | `#F59E0B` |
| Medium | `#3B82F6` |
| Low | `#6B7280` |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To enable AI features, click the gear icon in the top-right navbar and paste your [Groq API key](https://console.groq.com). The key is stored in localStorage and never sent anywhere except Groq's API.

## Role switching

The navbar has a three-way role switcher (Employee / Agent / Admin) — no login required. This simulates the three perspectives for the prototype.

The agent view defaults to the IT queue. Switch departments from the sidebar.

## Seed data

15 mock tickets are pre-loaded on first launch — spread across all departments, statuses, and urgency levels. Includes several resolved tickets so similar ticket detection has material to surface.

To reset to seed data, clear `relay_tickets` from localStorage (DevTools → Application → Local Storage).

## Project structure

```
src/
├── components/
│   ├── shared/       # Navbar, Sidebar, Modal, Drawer, Toast, badges
│   ├── employee/     # NewTicketForm, MyTickets, TicketDetailDrawer
│   ├── agent/        # DepartmentQueue, TicketDetailPage
│   └── admin/        # AnalyticsDashboard
├── context/
│   └── AppContext.tsx  # Global state + localStorage sync
├── hooks/
│   └── useGroq.ts     # All three AI calls
├── types/
│   └── index.ts
└── utils/
    ├── mockData.ts
    ├── storage.ts
    └── time.ts
```
