# Troubleshooting & FAQ

Common questions and solutions for Smyles Station.

## Table of Contents

- [Getting Started](#getting-started)
- [Sessions & Time Limits](#sessions--time-limits)
- [Admin Access](#admin-access)
- [Games & Sites](#games--sites)
- [Technical Issues](#technical-issues)
- [Security & Safety](#security--safety)

---

## Getting Started

### Q: What is Smyles Station?

**A:** Smyles Station is a kid-friendly kiosk application that provides safe, time-limited access to educational games and websites. It's designed for libraries, schools, and community centers.

### Q: What do I need to run Smyles Station?

**A:**
- Windows 10+ or Ubuntu 20.04+ (Linux)
- 4 GB RAM minimum (8 GB recommended)
- Internet connection
- See [Hardware Requirements](../setup/hardware.md) for full details

### Q: How do I install Smyles Station?

**A:** See the [Installation Guide](../setup/install.md) for step-by-step instructions for Windows and Linux.

### Q: Is Smyles Station free?

**A:** Yes, Smyles Station is open source and free to use.

---

## Sessions & Time Limits

### Q: How long is each session?

**A:** The default session length is configured in Admin Settings. Common defaults are:
- 30 minutes (typical for libraries)
- 45 minutes (classroom use)
- 60 minutes (extended use)

You set this once in Admin Dashboard ’ Settings ’ "Session Time Limit"

### Q: Can I change the time limit for individual sessions?

**A:** No, the current design uses a single default time limit for all sessions. All children get the same amount of time for fairness.

### Q: Can kids extend their session time?

**A:** No. Time limits are enforced automatically and cannot be extended by users. This ensures fairness for all children.

### Q: What happens when the session timer expires?

**A:**
1. 5 minutes before end: Yellow warning appears
2. 1 minute before end: Red warning appears
3. At zero: Session ends automatically
4. "Session Expired" message shows briefly
5. Returns to welcome screen for next child

### Q: Can kids switch games during their session?

**A:** Yes! Kids can click " Exit Game" to return to the game selection screen and choose a different game. The session timer continues running - no extra time is added.

### Q: How do I set session time to unlimited?

**A:** Set "Session Time Limit" to `0` in Admin Dashboard. The timer won't display and sessions won't auto-end.

**Warning:** Unlimited sessions aren't recommended for public use as they prevent fair access.

---

## Admin Access

### Q: What's the default admin password?

**A:** There is no default password. You create the admin password the first time you launch Smyles Station.

### Q: How do I access Admin Settings?

**A:**
1. On the welcome screen, click the **Settings button (™)** at the bottom
2. Select **Admin Settings**
3. Enter your admin password

### Q: I forgot my admin password. What do I do?

**A:**
1. Close Smyles Station completely
2. Navigate to the config directory:
   - Windows: Press `Win + R`, type `%APPDATA%\smyles-station\`, press Enter
   - Linux: `~/.config/smyles-station/`
3. Delete the file `config.json`
4. Restart Smyles Station
5. You'll be prompted to create a new password

**Warning:** This resets ALL settings, not just the password. Your site list (in `sites.json`) is preserved.

### Q: How do I change the admin password?

**A:**
1. Access Admin Dashboard
2. Go to the Settings or Password tab
3. Enter current password
4. Enter new password twice
5. Click Save

### Q: Can I have multiple admin passwords?

**A:** No, there's only one admin password for the entire system.

### Q: The Settings button doesn't appear. Where is it?

**A:** The Settings button (™) is at the bottom center of the welcome screen (the screen with the big Play button). If you're in a game session, end the session first.

---

## Games & Sites

### Q: How do I add games?

**A:**
1. Access Admin Dashboard
2. Go to **Sites** tab
3. Click **Add New Site**
4. Enter the full URL (e.g., `https://pbskids.org`)
5. App fetches the site name and icon automatically
6. Click **Save**

See [Configuration Guide](../setup/config.md) for details.

### Q: Why won't a game load?

**Possible causes:**

**No internet:** Check your internet connection

**Site is down:** Try accessing the site in a regular browser

**Blocked by firewall:** Some firewalls block embedded browsers. Check firewall settings.

**Site blocks embedding:** Some websites prevent being displayed in embedded views for security. These sites won't work in Smyles Station.

**Wrong URL:** Verify the URL is correct in Admin Dashboard ’ Sites

### Q: A game loads but looks broken or doesn't work properly.

**A:** Some websites use features that don't work well in embedded views. Try:
1. Re-fetching the site info in Admin Dashboard
2. Checking if the site works in a regular browser
3. Finding an alternative similar site

Not all websites are compatible with embedded viewing.

### Q: Can kids download files or install programs?

**A:** No. File downloads are blocked by design. Kids cannot install programs or download files through Smyles Station.

### Q: How do I remove a game?

**A:**
1. Admin Dashboard ’ Sites tab
2. Find the site
3. Click the **Delete** button (trash icon)
4. Confirm deletion

### Q: The game icons don't show up.

**A:** Some sites don't provide icons (favicons). You can:
- Upload a custom icon when editing the site
- Leave it with a generic placeholder
- Re-fetch site info to try again

### Q: How do I reorder games?

**A:** In Admin Dashboard ’ Sites tab, drag and drop the site tiles to reorder them. Changes save automatically.

---

## Technical Issues

### Q: Smyles Station won't start.

**Check:**
- System requirements are met (see [Hardware Requirements](../setup/hardware.md))
- All Windows updates are installed
- Try restarting your computer
- Check error logs:
  - Windows: `%APPDATA%\smyles-station\logs\`
  - Linux: `~/.config/smyles-station/logs/`

Try reinstalling if the issue persists.

### Q: The application crashes frequently.

**Try:**
1. Disable hardware acceleration:
   - Admin Dashboard ’ Settings ’ Uncheck "Enable Hardware Acceleration"
2. Update graphics drivers
3. Check available RAM (4 GB minimum, 8 GB recommended)
4. Review logs for error messages

### Q: The Play button doesn't work.

**Check:**
- Internet connection is working
- Application isn't frozen (try clicking Settings button)
- Restart Smyles Station
- Check console for errors (if in development mode)

### Q: Games load slowly.

**Possible causes:**
- Slow internet connection (need 5+ Mbps)
- Many browser tabs/windows open
- Insufficient RAM
- Site itself is slow

**Try:**
- Close other programs
- Test internet speed
- Try different games to see if all are slow

### Q: The timer doesn't appear.

**Check:**
- Session Time Limit is set to a value greater than 0
- Admin Dashboard ’ Settings ’ "Session Time Limit"
- If set to 0, timer won't display (unlimited session)

### Q: The session doesn't end when timer reaches zero.

**This is a bug.** Workaround:
1. Click "End Session" button manually
2. Report the issue on GitHub
3. Check logs: `%APPDATA%\smyles-station\logs\`

### Q: Scheduled shutdown isn't working.

**Check:**
1. Admin Dashboard ’ Schedule tab
2. Verify day is enabled (checkmark)
3. Verify time is correct (24-hour format: 8 PM = 20:00)
4. Click "Save" or "Update" after making changes
5. Smyles Station must be running at shutdown time

**Linux only:** May need special permissions. See [Scheduled Shutdown Guide](scheduled-shutdown.md#technical-notes-for-it-staff).

### Q: Where are configuration files stored?

**A:**
- **Windows:** `%APPDATA%\smyles-station\`
  - Full path: `C:\Users\[YourUsername]\AppData\Roaming\smyles-station\`
- **Linux:** `~/.config/smyles-station/`

Files include:
- `config.json` - Settings and admin password
- `sites.json` - Game list
- `schedule.json` - Shutdown schedule
- `stats.json` - Usage statistics

---

## Security & Safety

### Q: Is Smyles Station safe for children?

**A:** Yes. Smyles Station includes multiple security layers:
- Only whitelisted sites can be accessed
- No file downloads
- Developer tools disabled
- Cannot exit without admin password
- Time limits prevent excessive use

### Q: Can kids access websites not on the approved list?

**A:** No. Only sites added to the whitelist in Admin Dashboard can be accessed. Kids cannot navigate to other sites.

### Q: Can kids access Windows or other programs?

**A:** From within a session, no - fullscreen mode and keyboard blocking prevent this. However, Smyles Station is designed to allow admin exit to Windows desktop with a password. For maximum lockdown, see [Kiosk Mode Guide](../setup/kiosk-mode.md).

### Q: What if a kid finds inappropriate content on an approved site?

**A:**
1. Immediately end the session (click "End Session")
2. Investigate what they saw
3. Remove the site: Admin Dashboard ’ Sites ’ Delete
4. Report the issue to the site owner and/or Smyles Station developers

### Q: How do I prevent kids from closing Smyles Station?

**A:** Built-in protections block common exit methods (Alt+F4, Alt+Tab, Windows key).

For complete lockdown where kids cannot access Windows at all, see [OS-Level Security](../setup/kiosk-mode.md#os-level-security-optional).

### Q: Can I monitor which games kids are playing?

**A:** Yes. Admin Dashboard ’ Statistics tab shows:
- Most popular games
- Total time played
- Session history
- Usage patterns

You can also export this data as CSV.

### Q: How secure is the admin password?

**A:** The password is hashed (encrypted) and stored locally. Only someone with physical access to the computer could attempt to reset it (by deleting config files).

**Best practices:**
- Use a strong password
- Don't share it with children
- Change it periodically
- Store it securely but accessible to all authorized staff

---

## Usage & Statistics

### Q: How do I view usage statistics?

**A:**
1. Admin Dashboard ’ Statistics tab
2. View summary data:
   - Total sessions
   - Completed sessions
   - Total time used
   - Most popular games

### Q: Can I export usage data?

**A:** Yes. In Statistics tab, click "Download CSV" to export data for use in Excel or other spreadsheet programs.

### Q: How do I reset/clear statistics?

**A:** Currently, statistics automatically accumulate. To clear:
1. Close Smyles Station
2. Navigate to config directory
3. Delete `stats.json`
4. Restart Smyles Station

**Warning:** This permanently deletes all usage history.

---

## Updating & Maintenance

### Q: How do I update Smyles Station?

**A:** Smyles Station doesn't auto-update. To update:
1. Visit [GitHub Releases](https://github.com/YOUR_USERNAME/verbose-funicular/releases)
2. Download latest version
3. Install over existing installation
4. Your settings and sites are preserved

See the [Updates Guide](updates.md) for details.

### Q: How often should I backup my configuration?

**A:** Recommended:
- Before any updates
- Weekly during regular maintenance
- After adding many sites or making major changes

See [Backup Guide](updates.md#backup-and-restore) for instructions.

### Q: Can I use Smyles Station on multiple computers with the same configuration?

**A:** Yes. Backup the configuration files from one computer and copy them to others. See [Configuration Sharing](updates.md#sharing-configuration-across-multiple-installations).

---

## Advanced Questions

### Q: Can I customize the appearance/colors?

**A:** Not currently through the UI. Advanced users can modify CSS files, but this requires technical knowledge and may break with updates.

### Q: Can I add password protection to individual games?

**A:** No, all approved games are equally accessible once a session starts.

### Q: Can I have different time limits for different age groups?

**A:** Not currently. All sessions use the same default time limit.

### Q: Does Smyles Station work offline?

**A:** No, an internet connection is required as the games are web-based.

### Q: Can I host my own games instead of using external websites?

**A:** Yes, if you have a local web server, you can add `http://localhost:port` or local IP addresses to the site list.

### Q: Can I white-label or rebrand Smyles Station?

**A:** Smyles Station is open source. Advanced users can modify branding, but this requires technical knowledge of Electron and React.

---

## Still Need Help?

**If your question isn't answered here:**

1. **Check the other guides:**
   - [Installation](../setup/install.md)
   - [Configuration](../setup/config.md)
   - [Sessions](sessions.md)
   - [Kiosk Mode](../setup/kiosk-mode.md)

2. **Check GitHub Issues:**
   - [Existing issues](https://github.com/YOUR_USERNAME/verbose-funicular/issues)
   - Search for your problem
   - Open a new issue if needed

3. **Contact Support:**
   - Email: smyles-station-safety@proton.me
   - Include:
     - Operating system and version
     - Smyles Station version
     - Description of issue
     - Steps to reproduce
     - Error messages or logs

4. **Community Support:**
   - GitHub Discussions
   - Share solutions with other users

---

## Reporting Bugs

**When reporting a bug, include:**

1. **System Information:**
   - OS (Windows 10, Ubuntu 22.04, etc.)
   - Smyles Station version
   - RAM and processor

2. **What you expected to happen**

3. **What actually happened**

4. **Steps to reproduce:**
   - Step-by-step instructions
   - Happens every time or intermittently?

5. **Error messages:**
   - Screenshots
   - Log files from `%APPDATA%\smyles-station\logs\`

6. **Configuration:**
   - Are you using kiosk mode?
   - How many sites configured?
   - Any custom settings?

**Where to report:**
- GitHub Issues: [github.com/YOUR_USERNAME/verbose-funicular/issues](https://github.com/YOUR_USERNAME/verbose-funicular/issues)
- Email: smyles-station-safety@proton.me

---

Thank you for using Smyles Station!
