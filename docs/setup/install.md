# Step 1: Installation

This guide will walk you through installing Smyles Station on your computer.

## Before You Begin

Make sure you have:

- [ ] Verified your [hardware meets requirements](hardware.md)
- [ ] Internet connection
- [ ] Administrator access to the computer
- [ ] About 15-30 minutes for installation

## Installation Methods

Choose the installation method appropriate for your operating system:

- [Windows Installation](#windows-installation)
- [Linux Installation](#linux-installation)

---

## Windows Installation

### Step 1: Download Smyles Station

1. Visit the Smyles Station releases page: [GitHub Releases](https://github.com/buff-sudo/smyles-station/releases)

2. Download the latest Windows installer:
   - Look for `Smyles-Station-Setup-X.X.X.exe`
   - Click to download

3. Wait for the download to complete

### Step 2: Run the Installer

1. Locate the downloaded file (usually in your Downloads folder)

2. **Right-click** the installer and select **Run as administrator**
   - If prompted by Windows Security, click **Yes** to allow

3. The Smyles Station Setup Wizard will open

### Step 3: Follow the Installation Wizard

1. **Welcome Screen:**
   - Click **Next**

2. **Choose Installation Location:**
   - Default location is recommended: `C:\Program Files\Smyles Station`
   - Click **Next**

3. **Select Start Menu Folder:**
   - Use the default or choose a custom folder
   - Click **Next**

4. **Create Desktop Shortcut:**
   - Check the box if you want a desktop icon
   - Click **Next**

5. **Ready to Install:**
   - Review your choices
   - Click **Install**

6. **Installing:**
   - Wait for the installation to complete (1-2 minutes)

7. **Completing Setup:**
   - Uncheck "Launch Smyles Station" for now
   - Click **Finish**

### Step 4: Verify Installation

1. Press the **Windows key** and type "Smyles Station"

2. You should see the Smyles Station app

3. **Don't launch it yet** - we'll configure it first

---

## Linux Installation

### Ubuntu/Debian-based Systems

#### Step 1: Download Smyles Station

1. Visit the Smyles Station releases page: [GitHub Releases](https://github.com/buff-sudo/smyles-station/releases)

2. Download the latest Linux package:
   - For Debian/Ubuntu: `Smyles-Station_X.X.X_amd64.deb`
   - For other distros: `Smyles-Station-X.X.X.AppImage`

#### Step 2: Install the Package

**For .deb package:**

```sh
# Navigate to Downloads folder
cd ~/Downloads

# Install using dpkg
sudo dpkg -i Smyles-Station_*.deb

# Fix any dependency issues
sudo apt-get install -f
```

**For AppImage:**

```sh
# Navigate to Downloads folder
cd ~/Downloads

# Make AppImage executable
chmod +x Smyles-Station-*.AppImage

# Move to /opt for system-wide access
sudo mv Smyles-Station-*.AppImage /opt/smyles-station

# Create a desktop entry
cat > ~/.local/share/applications/smyles-station.desktop <<EOF
[Desktop Entry]
Name=Smyles Station
Exec=/opt/smyles-station
Type=Application
Categories=Education;
EOF
```

#### Step 3: Verify Installation

```sh
# Check if installed
which smyles-station

# Or search in application menu
# Look for "Smyles Station" in your application launcher
```

### Fedora/RHEL-based Systems

#### Step 1: Download and Install

1. Download the `.rpm` package from releases

2. Install using dnf:

```sh
cd ~/Downloads
sudo dnf install Smyles-Station-*.rpm
```

Or use rpm directly:

```sh
sudo rpm -ivh Smyles-Station-*.rpm
```

---

## First Launch Setup

Now that Smyles Station is installed, let's configure it:

### Step 1: Launch Smyles Station

**Windows:**
- Press Windows key
- Type "Smyles Station"
- Click the app

**Linux:**
- Open application menu
- Find "Smyles Station"
- Click to launch

### Step 2: Initial Configuration

On first launch, you'll see the welcome screen:

1. **Set Admin Password:**
   - Create a strong password (you'll need this to access admin settings)
   - Confirm the password
   - **Write this password down in a safe place!**
   - Click **Continue**

2. **Add Your First Game/Website:**
   - Enter a website URL (e.g., `https://pbskids.org`)
   - The app will automatically fetch the site's name and icon
   - Click **Add Site**
   - Add a few more sites to get started

3. **Set Default Session Time:**
   - Choose how long each session should last (e.g., 30 minutes)
   - You can change this later for individual sessions
   - Click **Save**

4. **Finish Setup:**
   - Click **Done**
   - You'll see the main screen with your added sites

### Step 3: Test a Session

Let's make sure everything works:

1. Click on one of your added sites

2. Choose a session duration (or use default)

3. Click **Start Session**

4. The game/website should load in fullscreen

5. You should see a timer in the corner showing remaining time

6. Press `Ctrl+Shift+Q` to exit the session (you'll need to enter the admin password)

**If everything works, you're ready to proceed!**

---

## Troubleshooting Installation

### Windows Issues

**"Windows protected your PC" warning:**
- This appears because the app isn't digitally signed
- Click **More info**
- Click **Run anyway**
- This is safe - it's just because we're not a big company with a signing certificate

**Installer won't run:**
- Make sure you're running as administrator
- Disable antivirus temporarily during installation
- Check that you downloaded the correct version (64-bit Windows)

**App won't launch:**
- Restart your computer
- Check Windows Event Viewer for errors
- Ensure all Windows updates are installed

### Linux Issues

**"Permission denied" when running AppImage:**
```sh
chmod +x Smyles-Station-*.AppImage
```

**Missing dependencies:**
```sh
# Ubuntu/Debian
sudo apt-get install -f

# Fedora
sudo dnf install missing-package-name
```

**AppImage won't run:**
- Install FUSE:
  ```sh
  # Ubuntu/Debian
  sudo apt install libfuse2

  # Fedora
  sudo dnf install fuse
  ```

**Blank screen on launch:**
- Try disabling GPU acceleration:
  ```sh
  smyles-station --disable-gpu
  ```

### General Issues

**Sites won't load:**
- Check internet connection
- Verify firewall isn't blocking the app
- Check proxy settings if applicable

**Can't set admin password:**
- Ensure you have write permissions
- Try running the app as administrator (Windows) or with sudo (Linux)

**App crashes immediately:**
- Check system requirements
- Update graphics drivers
- Look for error logs:
  - Windows: `%APPDATA%\smyles-station\logs\`
  - Linux: `~/.config/smyles-station/logs/`

---

## Post-Installation

### Recommended Next Steps

1. **[Set Up Kiosk Mode](kiosk-mode.md)**
   - Lock down the operating system
   - Prevent kids from exiting the app
   - Disable system shortcuts

2. **[Customize Configuration](config.md)**
   - Add all your game sites
   - Configure session defaults
   - Set up shutdown schedule

3. **[Learn Daily Operations](../daily/sessions.md)**
   - How to start sessions
   - Managing time limits
   - Viewing usage statistics

### Optional: Auto-Start on Boot

**Windows:**

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Right-click in the folder � New � Shortcut
4. Browse to: `C:\Program Files\Smyles Station\Smyles Station.exe`
5. Click OK and name it "Smyles Station"

**Linux (systemd):**

```sh
# Create systemd service
sudo nano /etc/systemd/system/smyles-station.service

# Add this content:
[Unit]
Description=Smyles Station Kiosk
After=graphical.target

[Service]
Type=simple
User=YOUR_USERNAME
Environment=DISPLAY=:0
ExecStart=/usr/bin/smyles-station
Restart=always

[Install]
WantedBy=graphical.target

# Enable and start
sudo systemctl enable smyles-station
sudo systemctl start smyles-station
```

### Optional: Create Limited User Account

For extra security, run Smyles Station under a limited user account:

**Windows:**
1. Settings � Accounts � Family & other users
2. Add someone else to this PC
3. Create account without Microsoft account
4. Set as Standard user (not Administrator)
5. Configure auto-login for this account

**Linux:**
```sh
# Create kiosk user
sudo adduser kiosk-user

# Set to auto-login (varies by distribution)
# Ubuntu with GDM: Edit /etc/gdm3/custom.conf
```

---

## Update Policy

Smyles Station does NOT include automatic updates by default for security.

To update:

1. Visit the [releases page](https://github.com/buff-sudo/smyles-station/releases)
2. Download the latest version
3. Install over existing installation (settings are preserved)

---

## Uninstallation

If you need to remove Smyles Station:

**Windows:**
1. Settings � Apps � Apps & features
2. Find "Smyles Station"
3. Click � Uninstall

**Linux (Debian/Ubuntu):**
```sh
sudo apt remove smyles-station
```

**Linux (Fedora):**
```sh
sudo dnf remove smyles-station
```

**AppImage:**
```sh
rm /opt/smyles-station
rm ~/.local/share/applications/smyles-station.desktop
```

**Remove all data and settings:**

- Windows: Delete `%APPDATA%\smyles-station\`
- Linux: Delete `~/.config/smyles-station/`

---

## Next Steps

Now that Smyles Station is installed:

1. [Set Up Kiosk Mode](kiosk-mode.md) - Essential for public use
2. [Customize Configuration](config.md) - Add games and configure settings
3. [Daily Operations](../daily/sessions.md) - Learn how to use Smyles Station

## Need Help?

- Check the [FAQ](../daily/faq.md) for common questions
- Open an issue on GitHub
- Contact support: smyles-station-safety@proton.me
