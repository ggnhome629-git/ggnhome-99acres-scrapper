#!/bin/bash
# Launches a dedicated, real Chrome profile with remote debugging enabled so
# our Playwright script can attach to (not replace) the browser you're using.
# Your normal day-to-day Chrome windows are untouched.
PROFILE_DIR="$HOME/.99acres-scrape-profile"
mkdir -p "$PROFILE_DIR"

open -na "Google Chrome" --args \
  --remote-debugging-port=9222 \
  --user-data-dir="$PROFILE_DIR" \
  "https://www.99acres.com/"

echo "Chrome launched with remote debugging on port 9222."
echo "Log in / solve any verification / navigate to a Gurugram sector listing page,"
echo "then let me know and I'll read the page from this end."
