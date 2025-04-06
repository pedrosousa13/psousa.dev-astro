---
author: Pedro Sousa
pubDatetime: 2024-03-19T10:00:00Z
modDatetime: 2024-03-19T10:00:00Z
title: Recreating macOS Magnet window management in Linux
slug: macos-magnet-linux
featured: true
draft: false
tags:
  - linux
  - productivity
  - tools
description: "Set up macOS Magnet-like window management in Linux using gTile with custom presets and keyboard shortcuts for efficient workspace organization"
---

If you've ever used macOS with the Magnet app, you know how incredibly useful its window management capabilities are. As developers, efficient window management is crucial for our productivity. In this guide, I'll show you how to achieve similar functionality in Linux using gTile, a powerful GNOME extension.

## Prerequisites

- GNOME Desktop Environment (tested on version 45+)
- GNOME Extensions enabled in your browser
- GNOME Shell Extensions app installed

## Installation

1. Open the [gTile extension page](https://extensions.gnome.org/extension/28/gtile/) in your browser
2. Toggle the switch to install the extension
3. Click "Install" when prompted

Alternatively, if you prefer the terminal:

```bash
gnome-extensions install gtile@vibou
gnome-extensions enable gtile@vibou
```

## Configuration

After installation, you'll need to configure gTile with optimal presets and shortcuts. Here are my recommended settings that closely mirror Magnet's functionality:

### Presets

Open gTile settings and add the following presets:

1. 4x4 1:1 4:4 - Full screen
2. 4x4 1:1 2:4 - Left half
3. 4x4 3:1 4:4 - Right half
4. 4x4 1:1 4:2 - Top half
5. 4x4 1:4 4:3 - Bottom half

### Keyboard Shortcuts

Set up these intuitive shortcuts for quick access:

- Full screen: `<Control><Alt>Return`
- Left half: `<Control><Alt>Left`
- Right half: `<Control><Alt>Right`
- Top half: `<Control><Alt>Up`
- Bottom half: `<Control><Alt>Down`

## Usage Tips

The 4x4 grid system might seem complex at first, but it's incredibly flexible. The preset format follows this pattern:

```
4x4 startColumn:startRow endColumn:endRow
```

For example, `4x4 1:1 2:4` means:

- Use a 4x4 grid
- Start at column 1, row 1
- End at column 2, row 4
- This creates a perfect left half window

## Pro Tips

1. **Quick Activation**: Double-click the gTile icon in your system tray to instantly show the grid overlay
2. **Grid Preview**: Hold your configured shortcut to see a preview of where your window will snap
3. **Multiple Monitors**: gTile works seamlessly across multiple displays, just like Magnet

## Customization

You can further customize gTile by:

- Adjusting grid size (4x4 recommended for Magnet-like behavior)
- Modifying animation speed
- Changing grid appearance
- Adding more custom presets for specific layouts

## Troubleshooting

If shortcuts stop working after a system update:

1. Disable and re-enable the extension
2. Log out and back in
3. Verify shortcuts in GNOME Settings > Keyboard > Shortcuts

## Conclusion

With gTile properly configured, you'll have a powerful window management system that rivals (and in some ways exceeds) Magnet's functionality. The best part? It's completely free and open source.

Remember to log out and back in after making significant changes to ensure all settings are properly applied.
