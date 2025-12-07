# Setting Up Automatic Shutdowns

This guide will help you set up your kiosk to automatically turn off at specific times each day - perfect for making sure the computer shuts down when the library closes!

## What This Does

Think of this like setting an alarm clock, but instead of waking you up, it turns the computer off:

- Set different shutdown times for each day of the week
- The computer will give a 10-minute warning before shutting down
- The computer will completely power off (not just close the program)
- Once the countdown starts, it cannot be stopped

**Example**: Set Monday through Friday to shut down at 8:00 PM, and leave weekends off.

## How to Set It Up

### Step 1: Open the Admin Settings

1. On the kiosk computer, press these three keys at the same time:
   - **Ctrl** + **Alt** + **Shift** + **A**
2. Enter your admin password (default is `admin` if you haven't changed it)
3. You'll see a page with various settings

### Step 2: Find the Shutdown Schedule

1. Scroll down the page until you see **"Scheduled Shutdown"**
2. You'll see a list of all seven days of the week

### Step 3: Choose Your Shutdown Days

For each day of the week, you can:

**Turn it ON or OFF:**
- ✅ **Checked box** = Computer will shut down on this day
- ☐ **Unchecked box** = Computer will NOT shut down on this day

**Set the time:**
- Click the time box
- Choose the hour and minute when you want the shutdown to happen
- Use 24-hour time (examples below)

**Time Examples:**
- 8:00 PM = 20:00
- 9:00 PM = 21:00
- 6:00 PM = 18:00
- 10:00 PM = 22:00

### Step 4: Save Your Changes

1. After setting up all your days, scroll to the bottom
2. Click the blue **"Update Shutdown Schedule"** button
3. You should see a green success message

## Example Setup

Here's a typical library schedule:

```
Monday:    ✅ Turned ON    20:00 (8:00 PM)
Tuesday:   ✅ Turned ON    20:00 (8:00 PM)
Wednesday: ✅ Turned ON    20:00 (8:00 PM)
Thursday:  ✅ Turned ON    20:00 (8:00 PM)
Friday:    ✅ Turned ON    22:00 (10:00 PM) - Late night!
Saturday:  ☐ Turned OFF
Sunday:    ☐ Turned OFF
```

This setup means:
- Monday through Thursday: Shuts down at 8 PM
- Friday: Shuts down at 10 PM (because of extended hours)
- Saturday and Sunday: No automatic shutdown (library closed)

## What Happens When Shutdown Time Arrives

### 10 Minutes Before
A bright yellow warning screen appears that says:
- "System Shutdown Scheduled"
- Shows a countdown timer
- Reminds everyone to save their work

**Important**: This warning CANNOT be closed or cancelled!

### When Time's Up
- The computer counts down to zero
- Everything closes automatically
- The computer powers off completely

## Special Setup for Linux Computers

**If you're using Windows**: You're all set! No extra steps needed.

**If you're using Linux**: The computer needs special permission to shut itself down. You'll need to ask your IT department or a technical person to help with this one-time setup.

### What to Tell Your IT Person

"We need to allow the kiosk user account to shut down the computer. Please set up either PolicyKit rules or sudoers permissions for system shutdown."

They can refer to the technical notes at the bottom of this page for exact instructions.

## Testing It Out

Before setting this up for real, you might want to test it:

1. Set a shutdown time for 5 minutes from now
2. Click "Update Shutdown Schedule"
3. Wait and watch - the warning should appear in 10 minutes... wait, that won't work!

**Better test**: Set it for today, about 15 minutes from now, so you can see the 10-minute warning.

**Even better**: Ask someone technical to run the program in "test mode" where it shows the warnings but doesn't actually shut down.

## Common Questions

### "What if someone is in the middle of a game?"

The 10-minute warning gives them time to finish up and save. However, the shutdown WILL happen, so it's important to:
- Post signs about closing times
- Make sure kids know when to finish up
- Train staff to give verbal warnings at closing time

### "What if I forget to turn it off on a holiday?"

The computer will shut down as scheduled. To prevent this:
- Uncheck that day ahead of time
- Or simply turn off the computer manually before the scheduled time

### "Can I stop it once the warning starts?"

No - once the 10-minute countdown begins, it cannot be cancelled. This ensures the kiosk always shuts down on time.

### "What if the computer is already off?"

Nothing happens! The schedule only works when the computer is on and the program is running. It won't turn on a computer that's already off.

### "What if I need to change the time?"

Just open the admin panel again (Ctrl+Alt+Shift+A), change the time, and click "Update Shutdown Schedule."

## Tips for Success

### Before You Start
- Decide your closing times for each day
- Consider: Do you have different hours on different days?
- Make sure you account for time to clean up

### Communication is Key
- **Put up signs** at the kiosk showing shutdown times
- **Tell your staff** about the automatic shutdown schedule
- **Remind kids** when closing time is approaching (5-10 minutes before)

### Good Scheduling Practices
- Set shutdowns 15-30 minutes AFTER closing time (gives buffer for stragglers)
- Don't schedule shutdowns during hours you're actually open
- Test new schedules on a quiet day first

## Troubleshooting

### "It's not shutting down!"

Check these things:
1. Is there a checkmark next to that day?
2. Is the time set correctly? (Remember: 8 PM = 20:00)
3. Did you click "Update Shutdown Schedule" after making changes?
4. Is the program actually running?

### "I don't see the warning"

The warning should appear 10 minutes before shutdown. If you don't see it:
- Make sure you're testing at least 11 minutes before the scheduled time
- The warning is a large yellow box that covers the whole screen - hard to miss!

### "On Linux, I get an error when it tries to shut down"

This means the computer doesn't have permission to shut itself down. You'll need help from your IT department (see the "Special Setup for Linux" section above).

## Need More Help?

- Check with your IT department
- Ask the person who installed the kiosk software
- Refer to the technical documentation in the Developer section

---

## Technical Notes (For IT Staff)

### Linux Permission Setup

The kiosk needs permission to execute system shutdown commands.

**Option 1: PolicyKit (Recommended)**

Create `/etc/polkit-1/rules.d/50-kiosk-shutdown.rules`:

```javascript
polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.login1.power-off" &&
        subject.user == "KIOSK_USERNAME") {
        return polkit.Result.YES;
    }
});
```

**Option 2: Sudoers**

Create `/etc/sudoers.d/kiosk-shutdown`:

```
KIOSK_USERNAME ALL=(ALL) NOPASSWD: /sbin/shutdown, /bin/systemctl poweroff
```

Replace `KIOSK_USERNAME` with the actual username running the kiosk application.

### Test Mode

For testing without actual shutdowns:

```bash
SHUTDOWN_DRY_RUN=true npm start
```

### Configuration Location

Settings stored in: `~/.config/Electron/admin-config.json` (or `%APPDATA%` on Windows)
