---
title: "SSH Group Management"
pubDate: 2026-08-18
order: 10100
description: "Organize your SSH connections into logical groups for easier management, while maintaining strict compatibility with the standard ~/.ssh/config format."
---

## Why Use Groups?

Grouping is essential for organized management in various scenarios:
- **Different Contexts**: Separating personal private servers from company office servers.
- **Different Projects**: Managing multiple devices belonging to a specific project.
- **Different Networks**: Distinguishing between intranet machines and public internet machines.

Grouping makes subsequent management, searching, and maintenance significantly easier and more intuitive.

## Universal Format

All group configuration files strictly follow the universal `~/.ssh/config` format. This ensures seamless migration and compatibility with other standard SSH tools.

## Supported Operations

- **Create Group**: Organize hosts into logical categories.
- **Delete Group**: Remove unnecessary groups (Note: The default `~/.ssh/config` group cannot be deleted for security reasons).
- **Collapse Group**: Fold groups to keep the interface clean.
- **Move Configurations**: Easily move SSH configurations between groups via dedicated buttons or intuitive drag-and-drop actions.