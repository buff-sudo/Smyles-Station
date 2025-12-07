# Step 3: Customization

This guide covers how to customize Smyles Station for your specific needs.

## Table of Contents

- [Accessing Admin Dashboard](#accessing-admin-dashboard)
- [Managing Sites](#managing-sites)
- [Session Settings](#session-settings)
- [Shutdown Schedule](#shutdown-schedule)
- [Admin Password](#admin-password)
- [Advanced Configuration](#advanced-configuration)

---

## Accessing Admin Dashboard

The Admin Dashboard is where all configuration happens.

### Opening the Dashboard

**Three ways to access:**

1. **From main screen:** Click the **Admin** button
2. **Keyboard shortcut:** Press `Ctrl+Shift+A`
3. **During a session:** Press `Ctrl+Shift+Q` to exit first, then access admin

**All methods require your admin password.**

### Dashboard Layout

The Admin Dashboard has several tabs:

- **Sites** - Add, edit, and manage websites
- **Statistics** - View usage data
- **Settings** - Configure session defaults and preferences
- **Schedule** - Set up automatic shutdowns
- **Password** - Change admin password

---

## Managing Sites

### Adding a New Site

1. Open Admin Dashboard
2. Click **Sites** tab
3. Click **Add New Site** button
4. Enter the website URL:
   - Must be complete URL (e.g., `https://pbskids.org`)
   - Include `https://` or `http://`
5. Click **Fetch Info** or press Enter
6. The app will automatically retrieve:
   - Site title
   - Site favicon/icon
7. Review and click **Save**

**The site will now appear on the main selection screen.**

### Editing a Site

1. In the **Sites** tab, find the site
2. Click the **Edit** button (pencil icon)
3. You can modify:
   - Display name
   - URL
   - Icon (upload custom or re-fetch)
   - Visibility (show/hide)
4. Click **Save Changes**

### Reordering Sites

Sites appear on the main screen in the order you arrange them:

1. In the **Sites** tab
2. **Drag and drop** sites to reorder
3. Changes save automatically
4. Kids will see sites in this order

**Tip:** Put the most popular sites at the top.

### Hiding Sites

To temporarily hide a site without deleting it:

1. Edit the site
2. Toggle **Visible** to OFF
3. Save

The site won't appear to kids but remains in your list.

### Removing Sites

To permanently delete a site:

1. In the **Sites** tab
2. Click the **Delete** button (trash icon)
3. Confirm deletion
4. The site is removed from the list

### Troubleshooting Site Issues

**Site won't load:**
- Verify URL is correct and complete
- Some sites don't work in embedded views
- Try accessing directly in browser first
- Check internet connection

**Icon doesn't load:**
- Some sites don't provide favicons
- Upload a custom icon instead
- Or use a generic placeholder

**Site loads but looks broken:**
- Some sites use features incompatible with embedded browsers
- May need to be accessed in full browser instead
- Consider alternative similar sites

---

## Session Settings

Configure default behavior for all sessions.

### Default Session Duration

1. Admin Dashboard -> **Settings** tab
2. Find **Default Session Time**
3. Choose duration:
   - 15 minutes (short sessions)
   - 30 minutes (recommended for most)
   - 45 minutes (classroom periods)
   - 60 minutes (longer sessions)
   - Custom (enter your own)
4. Click **Save**

**Note:** This is the default - you can override per-session when starting.

### Warning Time

How early to warn users before session expires:

1. **Settings** tab
2. **Warning Time** setting
3. Recommended: 5 minutes
4. Range: 1-10 minutes
5. Save

**The warning shows a countdown timer and alert sound.**

### Session End Behavior

Choose what happens when a session ends:

**Return to Selection Screen (Default):**
- Session closes
- Returns to main site selection
- Kid can start another session

**Exit to Desktop (Optional):**
- Session closes
- Smyles Station exits
- Returns to Windows desktop
- Requires restart for next use

**Lock Computer (Optional):**
- Session closes
- Computer locks
- Requires password to unlock

Configure in **Settings** -> **Session End Behavior**

---

## Shutdown Schedule

Configure automatic computer shutdown for closing time.

### Setting Up Scheduled Shutdowns

1. Admin Dashboard -> **Schedule** tab
2. You'll see each day of the week
3. For each day you want automatic shutdown:
   - Toggle **Enabled** to ON
   - Set the shutdown time
   - Save

**Example:**
- Monday-Friday: 8:00 PM (library closing)
- Saturday: 6:00 PM
- Sunday: OFF (closed)

### How Scheduled Shutdown Works

**10 minutes before shutdown time:**
- Warning appears on screen
- Sound alert plays
- Timer counts down

**When shutdown time arrives:**
- Active sessions end automatically
- Computer shuts down
- Cannot be cancelled (by design)

**Important:** Make sure shutdown time is AFTER your actual closing time to give staff time to finish up.

### Platform Support

**Windows:**
- Full support
- Uses `shutdown /s /t 0` command
- Computer powers off completely

**Linux:**
- Full support
- Uses `shutdown -h now` command
- May require sudo permissions

### Disabling Scheduled Shutdown

To turn off for a specific day:

1. **Schedule** tab
2. Toggle that day to OFF
3. Save

To disable completely: Turn OFF all days.


---

## Admin Password

### Changing Your Password

1. Admin Dashboard -> **Password** tab
2. Enter **current password**
3. Enter **new password**
4. Re-enter new password to confirm
5. Click **Change Password**

**Requirements:**
- At least 8 characters
- Should be memorable but secure
- Store in a safe place

### Password Security Tips

**Do:**
- Use a password manager
- Write it down and store securely
- Share with authorized staff only
- Change periodically

**Don't:**
- Share with kids
- Use obvious passwords (like "password123")
- Post it publicly visible
- Forget to write it down!

### If You Forget Your Password

**Reset method (resets ALL settings):**

1. Exit Smyles Station completely
2. Open File Explorer
3. Navigate to `%APPDATA%\smyles-station\`
4. Delete `config.json`
5. Restart Smyles Station
6. You'll be prompted to set a new password

**Warning:** This erases:
- Admin password
- All added sites
- All settings
- Usage statistics

**Backup recommendation:** Regularly backup your config file.

---

## Advanced Configuration

### Configuration Files

Smyles Station stores settings in:

**Windows:** `%APPDATA%\smyles-station\`
**Linux:** `~/.config/smyles-station/`

**Files:**
- `config.json` - Main configuration
- `sites.json` - Website list
- `schedule.json` - Shutdown schedule
- `stats.json` - Usage statistics

### Backing Up Configuration

**To backup your settings:**

1. Exit Smyles Station
2. Navigate to config directory
3. Copy all `.json` files to safe location
4. Date the backup

**To restore from backup:**

1. Exit Smyles Station
2. Replace `.json` files with backup copies
3. Restart Smyles Station

### Manual Configuration Editing

Advanced users can edit JSON files directly:

**Warning:** Incorrect edits can break Smyles Station. Backup first!

**Example - Editing sites.json:**

```json
{
  "sites": [
    {
      "id": "1",
      "name": "PBS Kids",
      "url": "https://pbskids.org",
      "icon": "https://pbskids.org/favicon.ico",
      "visible": true,
      "order": 0
    }
  ]
}
```

**Only edit if you know what you're doing.**

### Exporting/Importing Configuration

**Export configuration to share with other installations:**

1. Backup all `.json` files as above
2. Share with other libraries/locations
3. They can import by copying files

**Useful for:**
- Multiple kiosk stations
- Standard site lists across locations
- Backing up approved configurations

### Command Line Options

Smyles Station supports some command line arguments:

```bash
# Disable GPU acceleration (if display issues)
smyles-station --disable-gpu

# Start in development mode (shows console)
smyles-station --dev

# Specify custom config directory
smyles-station --config-dir=/path/to/config
```

### Environment Variables

Advanced configuration via environment variables:

```bash
# Custom config location
SMYLES_CONFIG_DIR=/custom/path

# Disable automatic updates
SMYLES_NO_UPDATE=1

# Enable debug logging
SMYLES_DEBUG=1
```

---

## Usage Statistics

### Viewing Statistics

1. Admin Dashboard -> **Statistics** tab
2. View data:
   - Total sessions
   - Total time used
   - Most popular sites
   - Usage by day/time

### Exporting Statistics

**To export usage data:**

1. Admin Portal
2. Scroll to Usage Data
3. Download CSV
4. Save file

**Use for:**
- Reporting to stakeholders
- Identifying popular content
- Planning content additions

### Clearing Statistics

**To reset all statistics:**

1. Admin Portal
2. Click **Clear All Data**
3. Confirm
4. All usage data is deleted

**Warning:** This cannot be undone.

---

## Troubleshooting Configuration

### Changes not saving

- Ensure you have write permissions
- Check disk space
- Verify config directory exists
- Try restarting Smyles Station

### Settings reset after restart

- Config file may be corrupted
- Check file permissions
- Restore from backup

### Cannot access Admin Dashboard

- Verify password is correct
- Check Caps Lock is off
- Use password reset if needed

### Sites not appearing

- Verify they're marked visible
- Check they were saved
- Restart Smyles Station

---

## Best Practices

### Regular Maintenance

**Weekly:**
- Review usage statistics
- Check for new site requests
- Test random sites still work

**Monthly:**
- Backup configuration
- Review and update site list
- Check for Smyles Station updates

**Annually:**
- Change admin password
- Audit all sites for appropriateness
- Review security settings

### Site Curation

**Guidelines for adding sites:**
- Educational value
- Age-appropriate content
- No ads or minimal ads
- Works in embedded browser
- Safe, trusted sources

**Remove sites that:**
- No longer work
- Have become ad-heavy
- Changed to inappropriate content
- Are never used (check stats)

---

## Next Steps

Now that Smyles Station is configured:

1. [Managing Sessions](../daily/sessions.md) - Daily operations
2. [Scheduled Shutdowns](../daily/scheduled-shutdown.md) - Automatic power-off details
3. [Troubleshooting](../daily/faq.md) - Common issues

## Need Help?

- Check the [FAQ](../daily/faq.md)
- Contact support: smyles-station-safety@proton.me
- Visit GitHub for community support
