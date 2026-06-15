# 🎯 Bags & Brats — Tournament Director Guide

Welcome to the Tournament Director dashboard! This guide walks you through everything you need to run a tournament day from start to finish.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Pre-Tournament Setup](#pre-tournament-setup)
4. [Gameday Workflow](#gameday-workflow)
5. [Managing Players](#managing-players)
6. [Managing Live Games](#managing-live-games)
7. [Data & Backups](#data--backups)
8. [The Big Reveal](#the-big-reveal)
9. [Schedule Management](#schedule-management)
10. [Quick Reference Card](#quick-reference-card)

---

## Getting Started

### Logging In

1. Go to the app URL and log in with your admin credentials.
2. If you see the **Player Dashboard**, tap the "Director View" button in the top-right corner.
3. You'll land on the **Director Control Center** — this is your command center.

### Switching Views

- **Director View** → **Player View**: Use the "Player View" button in the top-right header to see exactly what players see.
- **Player View** → **Director View**: Use the "Director View" button in the top-right header to return.
- **Theme Toggle**: The sun/moon icon in the top-right lets you switch between light and dark mode.

---

## Dashboard Overview

The Director Control Center has **5 tabs** across the top:

| Tab | Icon | Purpose |
|---|---|---|
| **Controls** | 🎛️ Sliders | Proxy registration, data backups, DB backup/restore |
| **Tournaments** | 📅 Calendar | Create tournaments, manage rounds, Big Reveal |
| **Overview** | 🏆 Trophy | Live tournament standings |
| **Global Roster** | 👥 Users | Full player list with check-in, roles, history |
| **Live Games** | ⚡ Activity | Real-time game cards with scores and status |

---

## Pre-Tournament Setup

### Creating a Tournament

1. Go to the **Tournaments** tab.
2. Click **"Create New Tournament"**.
3. Fill in:
   - **Tournament Name** (e.g., "Summer Bags & Brats 2026")
   - **Rounds per day** — use the +/- buttons (default is 2)
   - **Tournament dates** — click the date picker to add each tournament day
4. Click **"Create Tournament"** to launch it.

### Registering Players

Players can self-register via the app (email/password, Google, or Apple sign-in). For players without a phone:

1. Go to the **Controls** tab.
2. Use the **Admin Proxy Registration** card.
3. Enter the player's name and a temporary password.
4. This creates a "proxy" account the admin manages on their behalf.

### Setting Up Admins

1. Go to the **Global Roster** tab.
2. Find the player you want to promote.
3. Click the **gear icon** (🔧) in their Actions column.
4. Confirm the promotion dialog: **"Yes — Make Admin"**.

> ⚠️ **Safety note**: You cannot remove admin from your own account. This prevents accidental lockout.

---

## Gameday Workflow

This is the step-by-step flow you'll follow on each tournament day.

### Step 1: Open Check-In

Check-in automatically opens at the configured time (default: 5pm). To open it early:

1. Go to the **Tournaments** tab.
2. In the **Tournament Lifecycle** card, click **"⏰ Open Check-In Early"**.
3. Players can now mark themselves as "Present" on their phones.

> 💡 Admins can also manually check players in from the **Global Roster** tab by clicking the Present/Absent toggle.

### Step 2: Generate Pairings (Round 1)

Once players are checked in:

1. In the **Tournament Lifecycle** card, find the **Round Manager** section.
2. Click **"Pairings"** on Round 1.
3. The system automatically:
   - Creates balanced 2v2 teams from checked-in players.
   - If the player count isn't divisible by 4, assigns a **Power Player** to solo (1v2).
   - Teams persist for the entire day — same partners across all rounds.

### Step 3: Start the Round

1. After pairings are generated, the round shows status **"Ready"**.
2. Click **"Start"** on that round.
3. Confirm the dialog.
4. This starts the **20-minute countdown timer** on all player devices.
5. Players can now see their match card with their partner, opponents, and court assignment.

### Step 4: Gameplay

During the round:
- Players play their cornhole matches.
- **Either team member** can submit the final score on their phone.
- Once submitted, the game is **finalized** automatically.
- You can monitor progress on the **Live Games** tab.

### Step 5: Stop the Round

When the round is over (or time runs out):

1. Click **"Stop"** on the active round.
2. This **instantly finalizes all remaining games** with their current scores.
3. Any games that weren't manually scored will be finalized as 0-0.

### Step 6: Repeat for Remaining Rounds

1. Click **"Pairings"** on Round 2.
   - The system reuses the same teams but creates **new matchups**.
   - Anti-repeat logic prevents the same teams from facing each other twice in a day.
2. Click **"Start"**, let them play, then **"Stop"**.
3. Repeat for Round 3 (if configured).

### Step 7: Advance to Next Day

When all rounds are complete and it's time for the next tournament day:

1. Click **"Advance Day ▶"** in the Tournament Lifecycle card.
2. This moves the tournament to the next scheduled date.
3. Player check-in and payment status automatically reset at midnight.

---

## Managing Players

### Global Roster

The **Global Roster** tab shows every registered player in a sortable table.

#### Sortable Columns
Click any column header to sort:
- **Player** — Alphabetical by name
- **Status** — Present/Absent
- **Role** — Admin/Player

#### Per-Player Actions

| Icon | Action | Description |
|---|---|---|
| Click **player name** | View History | Opens a modal showing their full game history, scores, W/L record, and running total |
| Present/Absent | Toggle Check-In | Click to toggle between checked-in and absent |
| ⚡ Yes/No | Toggle Power Player | Marks/unmarks the player as a Power Player volunteer |
| 💲 Paid/Unpaid | Toggle Payment | Tracks whether the player has paid their entry fee |
| 🔗 Link icon | Unlink Social Login | Removes Google/Apple sign-in (converts to email/password account) |
| 🔑 Key icon | Reset Password | Enter a new password for the player |
| ⚙️ Gear icon | Toggle Admin | Promote to admin or demote to player (with confirmation) |
| 🗑️ Trash icon | Delete Player | Permanently removes the player (with confirmation) |

#### Player History Modal

Click any player's **name** (shown in teal) to open their game history:

- **Summary cards**: Total Points, Wins, Losses, Games Played
- **Game-by-game table**: Day, Round, Partner, Opponents, Score (color-coded), Result (W/L/T badge), Running Total
- Power Player solo games show "⚡ Solo" in the Partner column

#### Schedule & History Dots

When a tournament is active, each player row shows colored dots representing their attendance across tournament days:

- 🟢 **Green filled** = Attended (past) or Checked In (today)
- 🔴 **Red filled** = Absent (past)
- 🟢 **Green border** = Plans to attend (future)
- 🔴 **Red border** = Plans to skip (future)
- ⚪ **Gray border** = Undecided (future)

Hover over any dot for a detailed tooltip.

#### Bulk Actions

- **Reset Roster** (red button) — Deletes ALL players except admin accounts. Use with extreme caution.

---

## Managing Live Games

The **Live Games** tab shows all game cards for the active tournament, organized by round.

Each game card shows:
- Team 1 players vs. Team 2 players
- Current scores
- Game status: **Upcoming**, **Active** (with timer), or **Finalized**
- Court assignment

### Admin Game Controls

On active or upcoming games, admins can:
- **Finalize** — Instantly end the game with current scores
- **Edit scores** — Manually adjust scores if needed

---

## Data & Backups

### Tournament Data Backup (Controls Tab)

Export standings and round scores for offline record keeping:

1. Go to the **Controls** tab.
2. In the **Tournament Data Backup** card, select the tournament day using the day chips.
3. Choose your export format:
   - **Download CSV** — Spreadsheet with player rankings, round scores, daily/aggregate stats
   - **Print / PDF** — Formatted printable sheet with full standings table

> 💡 Keep a printed copy as a manual backup in case of tech issues.

### Full Database Backup & Restore (Controls Tab)

Complete snapshot of all data — users, tournaments, games, and teams:

1. **Download Full DB Backup** — Saves a `.json` file containing the entire database.
2. **Restore from Backup** — Upload a previously downloaded `.json` file to restore the database to that state.

> ⚠️ **Critical**: Take a full backup before each tournament day. If anything goes wrong, you can restore instantly.

> ⚠️ **Restoring overwrites everything** — all current data is replaced with the backup data.

---

## The Big Reveal

The Big Reveal is the dramatic ceremony for announcing winners. It's found in the **Tournaments** tab under the "The Big Reveal" card.

### Daily Big Reveal

Available once **all rounds for the current day are complete** (button lights up gold).

1. Click **"Launch Daily Big Reveal 🏆"**.
2. This takes you to a full-screen reveal page.
3. The reveal shows the **top 3 teams** for the day in dramatic fashion:
   - 🥉 3rd place reveals first
   - 🥈 2nd place reveals next
   - 🥇 1st place (Golden Bag Winner) reveals last with confetti 🎉
4. Project this on a screen for maximum drama!

### Grand Champion Reveal

Available only when **ALL tournament days are complete** (button lights up teal).

1. Click **"Launch Grand Champion Reveal 👑"**.
2. This reveals the overall tournament champion based on aggregate standings across all days.
3. Same dramatic 3rd → 2nd → 1st reveal sequence.

> 📝 Both reveal buttons are grayed out and disabled until their conditions are met. You cannot accidentally launch a reveal too early.

---

## Schedule Management

### Day Tabs

The Tournament Lifecycle card shows day tabs labeled with the **weekday** and **MM/DD** date (e.g., "SAT 6/21"). The current day is highlighted with a green "LIVE" badge.

### Cancelling a Tournament Day

If a day needs to be cancelled (weather, scheduling conflict):

1. Click the small **❌** button on a future day tab.
2. Confirm the dialog: **"Yes — Cancel the Tournament Day"** / **"No"**
3. The cancelled day will show with strikethrough styling and a "Cancelled" badge.
4. All games and teams for that day are automatically cleaned up.
5. Players will not see the cancelled day on their dashboards.

> ⚠️ You can only cancel **future** days, not the current or past days.

### Adding a Tournament Day

1. Click the **"+"** button at the end of the day tab row.
2. A date picker appears — select the new date.
3. The day is automatically sorted into chronological order.

### Ending a Tournament

1. In the Tournament Lifecycle card, scroll to the bottom.
2. Click **"End Tournament"** (red button).
3. Confirm the destruction dialog.
4. This permanently deletes the tournament and all associated game/team data.

---

## Quick Reference Card

### Gameday Checklist

```
□  Take a full DB backup (Controls → Database Backup & Restore)
□  Open check-in (or wait for auto-open)
□  Verify all players are checked in (Global Roster)
□  Generate Round 1 pairings (Tournaments → Round Manager)
□  Start Round 1
□  Monitor games (Live Games tab)
□  Stop Round 1 when complete
□  Generate Round 2 pairings
□  Start Round 2
□  Stop Round 2 when complete
□  (Repeat for additional rounds)
□  Download day's data backup (Controls → Tournament Data Backup)
□  Launch Daily Big Reveal (Tournaments → The Big Reveal)
□  After final tournament day: Launch Grand Champion Reveal
```

### Key Shortcuts

| Want to... | Go to... |
|---|---|
| Check someone in | Global Roster → click Present/Absent |
| See who's winning | Overview tab |
| View a player's full history | Global Roster → click their name |
| Fix a wrong score | Live Games → edit the game card |
| Register someone without a phone | Controls → Admin Proxy Registration |
| Cancel a tournament day | Tournaments → click ❌ on future day tab |
| Back up everything | Controls → Database Backup & Restore |
| See what players see | Player View button (top-right) |

---

*Last updated: June 2026*
