# Managing Sessions

This guide covers the day-to-day operation of Smyles Station, including starting sessions, monitoring time, and handling common scenarios.

## Table of Contents

- [Starting a Session](#starting-a-session)
- [During a Session](#during-a-session)
- [Ending a Session](#ending-a-session)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting](#troubleshooting)

---

## Starting a Session

### The Welcome Screen

When Smyles Station launches, children see a simple welcome screen with:

- **Large Play Button (�)** - The main button to start
- **Settings button (�)** - At the bottom (staff use only)

### Starting a Session

**For children:**

1. Click the **Play button (�)**
2. Session starts automatically with the default time limit
3. Game selection screen appears

**That's it!** No complicated menus or choices - kids just click play.

### Selecting a Game

After clicking play:

1. **Grid of available games** appears
2. Each tile shows:
   - Game icon
   - Game name
3. **Click any game** to start playing
4. Game loads immediately

### Session Duration

Sessions use the **default time limit** configured in admin settings.

**To change the default:**
1. Access Admin Dashboard (Settings button � Admin Settings)
2. Enter admin password
3. Go to Settings tab
4. Change "Session Time Limit"
5. Save

Common durations:
- 30 minutes (recommended for libraries)
- 45 minutes (classroom periods)
- 60 minutes (longer sessions)

---

## During a Session

### What the Child Sees

**While playing a game:**
- Game runs fullscreen
- Timer visible in corner (if time limit set)
- "End Session" button available
- "Exit Game" button (top left) - returns to game selection

### Game View Controls

**Exit Game button ( Exit Game):**
- Located in top left corner
- Returns to game selection screen
- Session timer continues running
- Can choose a different game

**End Session button:**
- Visible with timer display
- Click to end entire session early
- Returns to welcome screen (Play button)
- Next child can start fresh

**Timer Display:**
- Shows remaining time: "23:45" (mm:ss format)
- Updates every second
- Turns red in final minute
- Only visible if time limit is set

### What Staff Can See

**From a distance:**
- Child is engaged with game
- Timer shows remaining time (if visible)
- No intervention needed

**Staff cannot:**
- See which specific game is being played without approaching
- Pause the timer
- Extend time (must be done via admin settings before session starts)

### Switching Games

**Children can switch games freely:**

1. Click " Exit Game" (top left)
2. Returns to game selection screen
3. Click different game
4. Session timer continues - no time added

**Session time continues** across game switches - encourages thoughtful choices.

### Session Warnings

**5 minutes before end:**
- Warning message appears
- Timer turns yellow/orange
- Gentle alert sound
- Child has time to finish up

**1 minute before end:**
- Urgent warning appears
- Timer turns red
- More noticeable alert
- Time to save and wrap up

**When timer reaches zero:**
- Game automatically closes
- "Session Expired" message appears briefly
- Returns to welcome screen (Play button)
- Ready for next child

---

## Ending a Session

### Automatic End (Normal)

When the session timer expires:

1. Current game closes
2. "Session Expired" message displays
3. Returns to welcome screen after a few seconds
4. Next child can click Play button

**This is the standard, fair way sessions end.**

### Manual End by Child

If a child finishes early:

1. Click **End Session** button (with timer)
2. Session ends immediately
3. Returns to welcome screen
4. Next child can use computer

### Manual End by Staff

**To end a session early:**

**Option 1: End Session button**
- Click the "End Session" button visible on screen
- No password required
- Quick and simple

**Option 2: Close Application**
- Click Settings button (�) on welcome screen
- Select "Close Application"
- Enter admin password
- Closes Smyles Station entirely
- Returns to Windows desktop

**When to manually end:**
- Closing time approaching
- Inappropriate behavior
- Technical issue
- Emergency situation

---

### Technical Issue During Session

**Game won't load:**
1. Click " Exit Game"
2. Try different game
3. If all games fail, check internet connection

**Smyles Station crashes:**
1. Restart Smyles Station
2. Child can start new session
3. Previous session time is lost (by design - prevents exploits)

### Multiple Short Sessions vs. One Long Session

**Multiple short sessions (15-20 min):**
- Better for busy times
- More kids get turns
- Change in admin settings before busy period

**Longer sessions (45-60 min):**
- Better for quiet times
- Allows deeper engagement
- Less switching overhead

---

## Staff Access

### Accessing Admin Functions

**From welcome screen:**

1. Click **Settings button (�)** at bottom
2. Choose **Admin Settings**
3. Enter admin password
4. Access full Admin Dashboard

**From here you can:**
- Add/remove games
- View usage statistics
- Change session time limit
- Configure shutdown schedule
- Change admin password

### Closing Smyles Station

**To exit to Windows desktop:**

1. On welcome screen, click **Settings (�)**
2. Select **Close Application**
3. Enter admin password
4. Smyles Station closes
5. Computer returns to normal Windows

**Use when:**
- Need to use computer for other tasks
- Performing maintenance
- End of day (or let scheduled shutdown handle it)

---

## Monitoring and Statistics

### Viewing Usage Data

1. Access Admin Dashboard (Settings � Admin Settings + password)
2. Go to Statistics tab
3. See:
   - Total sessions
   - Most popular games
   - Total time used
   - Usage patterns

**Use this data to:**
- Add more similar games to popular ones
- Remove unused games
- Understand peak times
- Report to stakeholders

### Session Logs

Recent session history shows:
- Date and time
- Duration
- Which games were accessed
- How session ended (time expired vs. manual)

---

## Troubleshooting

### Session won't start (Play button doesn't work)

**Check:**
- Internet connection
- Smyles Station is responding (not frozen)
- Try restarting Smyles Station

### Timer not visible

**Possible causes:**
- Session time limit set to 0/unlimited
- Display issue

**Fix:**
- Check Admin Settings � Session Time Limit
- Should be set to desired minutes (e.g., 30)

### Session doesn't end automatically

**This is a bug - should not happen.**

**Workaround:**
1. Click "End Session" button manually
2. Report the issue
3. Check logs in `%APPDATA%\smyles-station\logs\`

### Can't exit game

**Try:**
1. Click " Exit Game" button (top left)
2. Or click "End Session" button
3. If both fail, restart Smyles Station

### Games won't load

**Check:**
- Internet connection working?
- Try different game
- Restart Smyles Station
- Check Admin Dashboard � Sites for URL errors

---

## Quick Reference Card

### For Children

```
How to Play:

1. Click the big Play button �
2. Choose your game
3. Have fun!
4. Click "Exit Game" to pick a different game
5. Click "End Session" when you're done
```

### For Staff

```
Starting: Child clicks Play button
Switching games: " Exit Game" button (top left)
Ending early: "End Session" button
Admin access: Settings � � Admin Settings � Password
Close app: Settings � � Close Application � Password
```

---

## Next Steps

- [Set up Scheduled Shutdowns](scheduled-shutdown.md)
- [Troubleshooting & FAQ](faq.md)

## Need Help?

- Check the [FAQ](faq.md)
- Contact support: smyles-station-safety@proton.me
- Visit GitHub for community support
