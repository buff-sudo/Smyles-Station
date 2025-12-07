# Step 2: Kiosk Mode (Locking it Down)

Smyles Station provides two levels of security: application-level (built-in) and optional OS-level lockdown. Choose the level appropriate for your environment.

## Security Levels

**Application-Level Security** (Built-in)
- Works out of the box
- Password-protected exit
- Can still access Windows desktop with admin password
- Recommended for most users

**OS-Level Security** (Optional)
- Prevents access to Windows entirely
- For dedicated kiosk computers only
- Maximum security but less flexible
- Requires Windows configuration

---

## Application-Level Security

### Built-In Protections

Smyles Station automatically provides these security features:

 **Fullscreen Mode**
- Game sessions run in fullscreen
- Prevents access to other windows

 **URL Whitelisting**
- Only approved sites can be accessed
- External links blocked
- Pop-ups prevented

 **Password-Protected Exit**
- Kids cannot exit without admin password
- Exit combination: `Ctrl+Shift+Q`

 **Keyboard Shortcuts Blocked**
- `Alt+Tab` - Cannot switch windows
- `Alt+F4` - Cannot close application
- `Windows key` - Cannot open Start menu
- `F11` - Cannot toggle fullscreen
- Right-click - Context menus disabled

 **No Downloads**
- File downloads blocked
- Prevents installing programs

 **Developer Tools Disabled**
- F12 (DevTools) blocked
- Cannot view page source

 **Session Time Limits**
- Automatic logout when time expires
- Warning alerts before session ends

### Initial Setup

**Step 1: Set Admin Password**

1. Launch Smyles Station for the first time
2. Create a strong admin password (at least 8 characters)
3. **Store this password securely - you'll need it to exit sessions!**

**Step 2: Add Websites**

1. Press `Ctrl+Shift+A` to open Admin Dashboard
2. Enter admin password
3. Click **Manage Sites**
4. Add approved websites:
   - Click **Add New Site**
   - Enter URL (e.g., `https://pbskids.org`)
   - App fetches title and icon automatically
   - Click **Save**

**Step 3: Configure Session Settings**

1. In Admin Dashboard ’ **Settings**
2. Set **Default Session Time** (recommended: 30-60 minutes)
3. Set **Warning Time** (recommended: 5 minutes before end)
4. Click **Save**

### Exiting to Windows Desktop

Administrators can exit Smyles Station at any time:

1. Press `Ctrl+Shift+Q`
2. Enter admin password
3. Choose **Exit to Desktop**

The computer returns to normal Windows operation.

### Testing Application Security

Before use, verify:

- [ ] Can start a session
- [ ] Session is fullscreen
- [ ] Cannot press Alt+Tab to switch windows
- [ ] Cannot press Windows key
- [ ] Cannot press Alt+F4 to close
- [ ] Cannot right-click in browser
- [ ] Session ends when timer expires
- [ ] Warning shows before session ends
- [ ] Ctrl+Shift+Q prompts for password
- [ ] Correct password exits to desktop

---

## OS-Level Security (Optional)

For dedicated kiosk computers where you don't want ANY access to Windows.

### When to Use OS-Level Lockdown

**Use this if:**
- Computer is dedicated solely to Smyles Station
- Located in unsupervised public area
- Maximum security required
- Don't need Windows desktop access

**Don't use this if:**
- Computer has multiple purposes
- Staff need regular Windows access
- You want flexibility to exit to desktop
- Simpler management preferred

### Windows Configuration

#### Option 1: Limited User Account (Recommended)

Create a restricted Windows account for kiosk use:

1. **Create kiosk user:**
   - Settings ’ Accounts ’ Family & other users
   - Add someone else to this PC
   - Create local account (no Microsoft account)
   - Set as "Standard user" (not Administrator)

2. **Configure auto-start Smyles Station:**
   - Press `Win + R`, type `shell:startup`
   - Create shortcut to Smyles Station
   - Place in startup folder

3. **Set auto-login (optional):**
   - Press `Win + R`, type `netplwiz`
   - Uncheck "Users must enter a user name and password"
   - Select kiosk account
   - Enter password

**Benefits:**
- Kids cannot install programs
- Cannot change system settings
- Cannot access admin files
- Easy to switch back to admin account for maintenance

#### Option 2: Windows Assigned Access (Pro/Enterprise)

Windows 10/11 Pro includes built-in kiosk mode:

1. Settings ’ Accounts ’ Family & other users
2. Set up assigned access
3. Choose kiosk account
4. Select Smyles Station as the app

**This prevents ALL access to Windows except Smyles Station.**

#### Option 3: Group Policy Restrictions (Advanced)

For IT administrators:

```
gpedit.msc
’ User Configuration
’ Administrative Templates
’ System
’ Disable Task Manager
’ Disable Command Prompt
’ Disable Registry Editor
```

**Only recommended if you know what you're doing.**

### Linux Configuration

**Create dedicated kiosk session:**

1. Install required packages:
   ```sh
   sudo apt install openbox unclutter
   ```

2. Create kiosk user:
   ```sh
   sudo adduser kiosk
   ```

3. Create custom session:
   `/usr/share/xsessions/kiosk.desktop`:
   ```ini
   [Desktop Entry]
   Name=Kiosk
   Exec=/usr/local/bin/kiosk-session
   ```

4. Create startup script:
   `/usr/local/bin/kiosk-session`:
   ```bash
   #!/bin/bash
   openbox &
   while true; do
       smyles-station
       sleep 5
   done
   ```

### Emergency Access

If you lock yourself out of a dedicated kiosk:

**Windows:**
- Restart and hold Shift to enter Safe Mode
- Login with administrator account
- Modify startup settings

**Linux:**
- Restart and select different session at login
- Or boot into recovery mode

---

## Additional Security Measures

### Physical Security

**Optional physical lockdown:**
- Cable locks for computer/peripherals
- BIOS password to prevent boot changes
- Disable USB ports in BIOS (if not needed)
- Cover or disable power button

### Windows User Account Control

For standard Windows profiles:

1. Create limited "Kids" account
2. Keep admin account for staff
3. Kids account cannot:
   - Install software
   - Change system settings
   - Access admin files

### Network Security

**Optional firewall rules:**
- Whitelist specific domains only
- Block everything else
- Prevents access even outside Smyles Station

**Note:** This is advanced and can break other functionality.

---

## Recommended Configurations

### Public Computer (Standard)

**Application-Level Only:**
- Normal Windows account
- Application-level security (built-in)
- Can exit to desktop with password
- Staff can use computer for other tasks

**Setup:**
- Install Smyles Station
- Set admin password
- Add approved sites
- Done!

### Dedicated Kiosk

**Application + OS-Level:**
- Limited Windows "kiosk" account
- Auto-start Smyles Station
- Cannot access Windows desktop
- Computer is dedicated to this purpose

**Setup:**
- Create kiosk Windows account
- Install Smyles Station
- Configure auto-start
- Set auto-login (optional)
- Test thoroughly

---

## Changing Admin Password

**To change password:**

1. Open Admin Dashboard (`Ctrl+Shift+A`)
2. Enter current password
3. Settings ’ Change Admin Password
4. Enter current password, then new password twice
5. Save

**If you forget password:**

1. Exit Smyles Station (or restart computer)
2. Navigate to: `%APPDATA%\smyles-station\` (Windows) or `~/.config/smyles-station/` (Linux)
3. Delete `config.json`
4. Restart Smyles Station
5. Set new password
6. **Warning:** This resets ALL settings

---

## Troubleshooting

### Kids escaped fullscreen

- Verify keyboard shortcuts are properly blocked
- Check for OS-level overrides
- Update to latest version

### Cannot exit with password

- Ensure Caps Lock is off
- Try re-entering password carefully
- Use password reset if forgotten

### Auto-start not working

- Check shortcut path is correct
- Verify user permissions
- Check startup folder location

### Other programs accessible

Application-level security only blocks within Smyles Station:
- Use OS-level security for complete lockdown
- Or use limited Windows account

---

## Next Steps

Once you've configured security:

1. [Customize Configuration](config.md) - Advanced settings
2. [Daily Operations](../daily/sessions.md) - Managing sessions
3. [Scheduled Shutdowns](../daily/scheduled-shutdown.md) - Automatic power-off

## Need Help?

- Check the [FAQ](../daily/faq.md) for common questions
- Contact support: smyles-station-safety@proton.me
- Visit GitHub for community support
