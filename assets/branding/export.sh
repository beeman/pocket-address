#!/usr/bin/env bash
# Exports every branding SVG in this folder to PNG. Requires rsvg-convert (brew install librsvg).
set -euo pipefail
cd "$(dirname "$0")"

export_png() { rsvg-convert --width "$2" --height "$3" --output "$1.png" "$1.svg"; }

export_png android-icon-background 1024 1024
export_png android-icon-foreground 1024 1024
export_png android-icon-monochrome 1024 1024
export_png icon 1024 1024
export_png splash-icon 1024 1024
export_png store-banner 1200 600
export_png store-icon 512 512
rsvg-convert --width 48 --height 48 --output favicon.png icon.svg
