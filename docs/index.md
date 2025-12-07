# Smyles Station - Kids Game Kiosk

Welcome to Smyles Station! This is a kid-friendly computer kiosk designed to give children safe access to educational games and websites.

## What It Does

Think of Smyles Station as a safe, controlled computer environment perfect for libraries, schools, and community centers. Here's what it helps you do:

- **Keep Kids Safe**: Only shows websites you approve - kids can't visit anything else
- **Manage Time**: Set time limits so each child gets a fair turn
- **Close on Time**: Automatically turns off the computer at closing time
- **Track Usage**: See which games are most popular and how long kids play
- **Lock It Down**: Prevents kids from accessing system settings, downloads, or other programs

## Quick Links

### For Librarians & Administrators

- [How to Install](setup/install.md) - Setting up for the first time
- [Locking It Down](setup/kiosk-mode.md) - Prevent kids from accessing system settings
- [Customizing Your Kiosk](setup/config.md) - Adding games, changing settings
- [Managing Time Limits](daily/sessions.md) - Setting up session times
- [Automatic Shutdowns](daily/scheduled-shutdown.md) - Making the computer turn off at closing time
- [Help & Common Problems](daily/faq.md) - Fixing common issues

### For Developers

- [Architecture Overview](dev/architecture.md) - Technical design
- [Development Setup](dev/setup.md) - Local development environment
- [Contributing](dev/contributing.md) - How to contribute

## Key Features

### Security
- Password-protected admin panel
- Sandboxed browser views for games
- Blocked developer tools and task manager
- URL whitelist enforcement
- Emergency exit with password verification

### Session Management
- Time-limited sessions (configurable per session)
- Warning alerts before session expiry
- Automatic cleanup on session end
- Session usage statistics

### Scheduled Shutdowns
- Configure shutdown times for each day of the week
- 10-minute warning before shutdown
- Automatic system power-off (Windows & Linux)
- Cannot be cancelled once triggered (as configured)

### Content Management
- Easy-to-use site management interface
- Automatic favicon and title fetching
- Drag-to-reorder site tiles
- Show/hide sites from selection screen

## Getting Started

1. **Install**: Follow the [Installation Guide](setup/install.md)
2. **Configure**: Set up your [Kiosk Mode](setup/kiosk-mode.md)
3. **Customize**: Configure [Settings](setup/config.md)
4. **Deploy**: Start managing [Sessions](daily/sessions.md)

## Support

For issues, questions, or contributions, please visit the project repository or contact your system administrator.
