#!/bin/bash
LOGFILE="full_run_expanded.log"
until grep -q "=== SALE ===" "$LOGFILE" 2>/dev/null; do
  sleep 3
done
echo "SALE marker detected — killing scrape.js before any sale navigation happens"
pkill -9 -f "node scrape.js"
sleep 1
echo "Cleaning up Chrome debug profile..."
pkill -9 -f "99acres-scrape-profile"
sleep 1
echo "=== Verification ==="
ps aux | grep -E "node scrape.js|99acres-scrape-profile" | grep -v grep || echo "All clean — nothing left running."
