# GGN Home 99Acres Scraper

A robust Node.js web scraper designed to extract real estate listings from 99acres.com and populate a MongoDB database with rental and sale property data. This scraper is specifically tailored for the Gurgaon (Gurugram) region and supports both rental and sale property listings.

## Description

This project provides an automated solution for scraping property listings from 99acres.com for the Gurgaon area. It uses Playwright for browser automation and Mongoose for MongoDB database operations. The scraper extracts comprehensive property information including details about bedrooms, bathrooms, pricing, amenities, parking, and more.

The scraper:
- **Crawls multiple sectors** in Gurgaon (sectors 1-115 plus Badshahpur and Sohna)
- **Supports dual property types**: rental (R) and sale (S) listings
- **Maps listing data** to structured MongoDB schemas (RentalProperty and SaleProperty)
- **Avoids duplicates** by tracking existing listings in the database
- **Handles pagination** across multiple pages per sector
- **Extracts rich metadata** including amenities, furnishings, parking, and landmarks
- **Provides dry-run mode** for testing without database writes
- **Features headless automation** via Chrome DevTools Protocol (CDP) for reliable browser control

## Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Playwright Core** (v1.62.1) - Browser automation library using Chrome DevTools Protocol
- **Mongoose** (v8.24.4) - MongoDB object modeling and database operations
- **JavaScript (CommonJS)** - Primary scripting language

### External Services
- **99acres.com** - Source for property listings
- **MongoDB** - Data storage for rental and sale properties
- **Google Chrome** - Browser with remote debugging enabled

## Features

### Primary Features
- **Dual Scraping Mode**: Extract both rental (preference=R) and sale (preference=S) listings
- **Multi-Sector Coverage**: Automatically crawls 117 predefined sectors and areas in Gurgaon
- **Pagination Support**: Configurable number of pages per sector
- **Smart Deduplication**: Checks MongoDB before inserting to avoid duplicate listings
- **Rich Data Extraction**: Captures 30+ properties per listing including:
  - Basic info (title, description, address, sector)
  - Physical specs (bedrooms, bathrooms, square footage, parking)
  - Features (appliances, balconies, community amenities, transportation links)
  - Pricing (monthly rent or sale price)
  - Ownership details and source tracking

### Developer Features
- **Dry-Run Mode**: Test extraction without database modifications
- **Sector-Specific Crawling**: Run scraper for specific sectors only
- **Sector Limit**: Restrict total number of sectors processed
- **Environment Configuration**: All behavior controlled via environment variables
- **Utility Scripts**: Helper scripts for verification, debugging, and data validation
- **Visual Feedback**: Highlights captured properties during scraping with visual badges

### Quality Assurance Features
- **Duplicate Detection**: Prevents re-scraping of known listings
- **Error Tracking**: Logs errors per property ID and sector
- **Activity Status Verification**: Scripts to verify active vs inactive listings
- **Data Integrity**: Validates parsed data before database insertion
- **Run Logging**: Comprehensive console output with detailed progress tracking

## Project Structure

```
Desktop/Tanush/Projects/ggnHome-scraped-data/
├── scraper99acres/                 # Main scraper application
│   ├── scrape.js                   # Main scraper entry point (orchestrates crawling)
│   ├── mapListing.js               # Data transformation logic for rental/sale properties
│   ├── package.json                # Node.js dependencies
│   ├── explore.js                  # Utility: inspect current browser page
│   ├── check_active.js             # Database utility: verify/fix active status
│   ├── check_dupes.js              # Database utility: identify duplicate listings
│   ├── check_segregation.js        # Database utility: verify data segregation
│   ├── check_sale_source.js        # Database utility: check sale property source fields
│   ├── backfill_source_portal.js   # Database utility: backfill source portal info
│   ├── backfill_sale_source_portal.js # Database utility: backfill sale source
│   ├── verify_brands.js            # Database utility: verify property data consistency
│   ├── verify_client.js            # Database utility: validate client-facing data
│   ├── launch-chrome.sh            # Shell script: launch Chrome with remote debugging
│   ├── stop_before_sale.sh         # Shell script: stop scraper before sale type
│   ├── extract_state.py            # Python utility: extract initial page state
│   ├── *.log                       # Scraper execution logs
│   └── test_*.js                   # Various test/diagnostic scripts
│
├── Gurgaon/                        # Scraped data organized by location
│   ├── Badshahpur/
│   │   ├── sale.json
│   │   └── rent.json
│   ├── Sector_36/
│   │   ├── sale.json
│   │   └── rent.json
│   └── [... more sectors ...]
│
└── [JSON data files for each sector/property type]

ggnHome/                           # Main application backend
├── server/
│   ├── models/
│   │   ├── Rentalproperty.model.js
│   │   ├── SaleProperty.model.js
│   │   └── [... other models ...]
│   ├── controllers/
│   │   ├── Rentalproperty.controller.js
│   │   ├── Saleproperty.controller.js
│   │   └── [... other controllers ...]
│   └── node_modules/              # Shared Node.js dependencies (including mongoose)
│
└── client/                        # React frontend
    ├── src/
    ├── public/
    └── package.json
```

## Installation

### Prerequisites
- **Node.js** (v14 or higher) and npm
- **MongoDB** instance running and accessible
- **Google Chrome** browser installed (for desktop environments)
- **Unix-like environment** (Linux, macOS, or WSL on Windows)

### Setup Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/ggnhome629-git/ggnhome-99acres-scrapper.git
   cd ggnhome-99acres-scrapper
   ```

2. **Navigate to scraper directory**:
   ```bash
   cd Desktop/Tanush/Projects/ggnHome-scraped-data/scraper99acres
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables** (create a `.env` file or export to shell):
   ```bash
   export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname"
   export PAGES_PER_SECTOR=2        # Number of pages to scrape per sector (default: 2)
   export LISTING_TYPE="both"       # Options: "rent", "sale", or "both" (default: both)
   export DRY_RUN=0                 # Set to 1 to test without writing to DB (default: 0)
   export SECTOR_LIMIT=""           # Optional: limit to first N sectors (leave empty for all)
   export SECTOR_ONLY=""            # Optional: scrape only specific sector (e.g., "sector-45")
   ```

## Usage

### Basic Scraping

1. **Launch Chrome with remote debugging** (required for browser automation):
   ```bash
   # On macOS:
   bash launch-chrome.sh
   
   # On Linux (use 'google-chrome' or 'chromium' instead):
   google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.99acres-scrape-profile" &
   
   # On Windows with WSL:
   /mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe --remote-debugging-port=9222 --user-data-dir="$HOME/.99acres-scrape-profile" &
   ```

2. **Run the main scraper**:
   ```bash
   node scrape.js
   ```

   The scraper will:
   - Connect to MongoDB
   - Connect to Chrome via CDP port 9222
   - Load existing listings from database (to avoid duplicates)
   - Crawl configured sectors and pages
   - Extract and map listing data
   - Insert new properties into database
   - Output summary statistics

### Test Runs & Configuration

**Dry-run mode** (test without database modifications):
```bash
export DRY_RUN=1
node scrape.js
```

**Scrape specific sector only**:
```bash
export SECTOR_ONLY="sector-45"
node scrape.js
```

**Limit to first 5 sectors**:
```bash
export SECTOR_LIMIT=5
node scrape.js
```

**Scrape only rental listings**:
```bash
export LISTING_TYPE="rent"
node scrape.js
```

**Scrape only sale listings**:
```bash
export LISTING_TYPE="sale"
node scrape.js
```

### Utility Scripts

**Check active/inactive listings**:
```bash
node check_active.js
```
Verifies and fixes `isActive` status for 99acres listings.

**Detect duplicate listings**:
```bash
node check_dupes.js
```
Identifies and reports duplicate entries in the database.

**Verify data segregation**:
```bash
node check_segregation.js
```
Ensures rental and sale properties are properly categorized.

**Inspect current browser page**:
```bash
node explore.js
```
Captures and saves the current Chrome tab's rendered HTML for debugging.

**Verify property consistency**:
```bash
node verify_brands.js
```
Validates that property data meets consistency standards.

**Backfill source portal** (for historical data):
```bash
node backfill_source_portal.js
node backfill_sale_source_portal.js
```
Updates historical listing records to include source portal information.

## Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MONGO_URI` | String | **Required** | MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`) |
| `PAGES_PER_SECTOR` | Number | 2 | Pages to crawl per sector (e.g., 3 scrapes pages 1, 2, 3 for each sector) |
| `DRY_RUN` | 0 or 1 | 0 | When set to 1, logs what would be inserted without actually writing to DB |
| `SECTOR_LIMIT` | Number | null | Limits total sectors processed; null means process all |
| `SECTOR_ONLY` | String | null | Process only specified sector; format: "sector-45" or "badshahpur" |
| `LISTING_TYPE` | String | "both" | Listing preference: "rent", "sale", or "both" |

### Sector Configuration

The scraper covers Gurgaon's addressable sectors:
- **Numbered sectors**: 1-115 (e.g., `sector-1`, `sector-45`, `sector-115`)
- **Named areas**: `badshahpur`, `sohna`
- **Total coverage**: 117 distinct sectors/areas

Sectors without live inventory return empty pages and are skipped quickly.

## Dependencies

### Direct Dependencies
```json
{
  "mongoose": "^8.24.4",        // MongoDB ODM (Object Data Modeling)
  "playwright-core": "^1.62.1"  // Browser automation via CDP
}
```

### Peer Dependencies
- MongoDB server (v4.4+)
- Google Chrome (with remote debugging)
- Shared mongoose instance from ggnHome backend

### Notes on Shared Dependencies
The scraper uses the same mongoose instance as the ggnHome backend to ensure MongoDB connections and model definitions are consistent. It references models from `../../ggnHome/server/models/`.

## Contribution Guide

### Code Style
- Follow JavaScript/Node.js best practices
- Use descriptive variable and function names
- Add comments for complex logic (e.g., data transformation, parsing)
- Maintain consistent indentation (2 spaces)

### Adding New Features

1. **New data fields to capture**:
   - Update `mapListing.js` to extract and transform new fields
   - Add corresponding fields to MongoDB schemas (RentalProperty.model.js or SaleProperty.model.js)
   - Test with dry-run mode before committing

2. **New utility scripts**:
   - Create descriptive filename (e.g., `validate_prices.js`)
   - Follow existing error handling patterns
   - Include helpful console logging
   - Document purpose in script comments

3. **Testing changes**:
   - Use dry-run mode: `DRY_RUN=1 node scrape.js`
   - Test sector-specific: `SECTOR_ONLY="sector-45" node scrape.js`
   - Verify with utility scripts (check_dupes.js, verify_brands.js, etc.)

### Reporting Issues
- Include error messages from scraper output
- Specify sector(s) affected
- Note MongoDB connection status
- Attach relevant log file (full_run.log, etc.)

### Pull Request Process
1. Create a feature branch from main
2. Make changes with descriptive commits
3. Test thoroughly with multiple configurations
4. Ensure no sensitive data (credentials, API keys) in commits
5. Submit PR with detailed description of changes

## Deployment

### Production Setup

1. **Secure MongoDB connection**:
   - Use strong, random passwords
   - Enable IP whitelisting for database access
   - Store MONGO_URI securely (environment secrets, not in code)
   - Use encrypted connections (mongodb+srv://)

2. **Chrome setup** (for server environments):
   ```bash
   # Install Chrome/Chromium if not present
   sudo apt-get install chromium-browser
   
   # Or use pre-built Chrome:
   # Set CHROME_PATH=/path/to/chrome if not in standard location
   ```

3. **Run scraper** (with process manager for reliability):
   ```bash
   # Using PM2:
   pm2 start scrape.js --name "99acres-scraper" \
     --env MONGO_URI="..." \
     --env LISTING_TYPE="both"
   
   # Or with cron for scheduled runs:
   # Add to crontab:
   # 0 2 * * * cd /path/to/scraper && MONGO_URI="..." node scrape.js >> scrape.log 2>&1
   ```

4. **Monitor and logging**:
   - Redirect output to log files
   - Set up alerts for failed runs
   - Periodically verify data quality with utility scripts
   - Archive old logs to manage disk space

### Scaling Considerations

- **Pagination depth**: Increase PAGES_PER_SECTOR for comprehensive crawls (larger time/resource cost)
- **Rate limiting**: Scraper includes 500-900ms delays between requests to avoid blocking
- **Database indexing**: Ensure MongoDB has indexes on sourceListingId and sourcePortal
- **Chrome resource usage**: Remote Chrome instance may need more memory with multiple pages
- **Network bandwidth**: Large-scale scraping with images can consume significant bandwidth

## Troubleshooting

### Common Issues

**"Chrome not found" or "Cannot connect to Chrome"**
- Verify Chrome is running with `--remote-debugging-port=9222`
- Check firewall rules allow localhost:9222
- Try `curl http://localhost:9222` to verify port is open
- Restart Chrome and try again

**"MONGO_URI env var is required"**
- Ensure MONGO_URI environment variable is set before running
- Check connection string format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- Verify MongoDB server is running and accessible

**"No listings found" for all sectors**
- Check your internet connection
- Verify 99acres.com is accessible from your environment
- Some sectors genuinely have no inventory; this is normal
- Check browser logs with `node explore.js`

**Database insertion errors**
- Check MongoDB connection and permissions
- Verify RentalProperty and SaleProperty models exist and are accessible
- Ensure shared mongoose instance in ggnHome is properly loaded
- Check for schema validation errors in console output

**Duplicate listings in database** (despite checks)
- Run `node check_dupes.js` to identify and report duplicates
- Use manual MongoDB queries to investigate conflicts
- May indicate concurrent scraper runs; ensure only one instance runs at a time

**Scraper hangs or times out**
- Check Chrome responsiveness with `node explore.js`
- Verify network connectivity to 99acres.com
- Increase timeout values in scrape.js if needed
- Monitor system resources (CPU, memory, disk I/O)

**Memory usage growing** during long runs
- Scraper holds all seen IDs in memory for deduplication
- If running 100+ sectors, consider limiting with SECTOR_LIMIT
- Restart scraper periodically to reset memory

### Debug Mode

Enable detailed logging:
```bash
# View Chrome communication:
DEBUG=pw:api node scrape.js

# Or create test script to inspect specific page:
node explore.js  # Saves rendered HTML to last_page.html
```

### Contact & Support

For issues or questions:
1. Check existing logs in scraper99acres/ directory
2. Review error output in console
3. Run utility scripts (check_active.js, verify_brands.js) to verify database state
4. Include full error messages and configuration when seeking help

## Security

### Best Practices

1. **Protect MongoDB credentials**:
   - Never commit MONGO_URI to version control
   - Use environment variables or secure vaults (AWS Secrets Manager, HashiCorp Vault)
   - Use strong, random passwords (20+ characters)
   - Rotate credentials regularly

2. **Rate limiting & ethics**:
   - Scraper includes built-in delays (500-900ms per request) to respect server load
   - Does not attempt to bypass CAPTCHA or authentication
   - Respects website structure and normal usage patterns
   - Terms of service compliance responsibility: verify before deployment

3. **Data privacy**:
   - Scraped data includes publicly listed property information
   - Ensure compliance with local data protection laws (GDPR, CCPA, etc.)
   - Implement appropriate access controls on MongoDB
   - Audit data usage and access logs

4. **Network security**:
   - Use HTTPS/TLS for MongoDB connections (mongodb+srv://)
   - Restrict database access to known IPs
   - Use VPN if scraper runs from untrusted networks
   - Monitor for unusual database queries or access patterns

5. **Code security**:
   - Keep Node.js and npm packages up to date
   - Review dependency changes during npm updates
   - Run `npm audit` before deployment
   - Use package-lock.json to ensure reproducible builds

### Ethical Considerations

- Always verify 99acres.com's Terms of Service allow automated scraping
- Implement reasonable request rates and delays
- Provide value to users with scraped data, not just aggregation
- Be transparent about data sources
- Remove listings when owners request (honor opt-out requests)

## License

This project is licensed under the ISC License. See LICENSE file for details.

**License summary**: You can use, modify, and distribute this code freely for personal and commercial purposes, provided you include the license and don't hold the author liable for any damages.

---

## Quick Reference

### Start Scraping
```bash
cd Desktop/Tanush/Projects/ggnHome-scraped-data/scraper99acres
export MONGO_URI="your_connection_string"
bash launch-chrome.sh  # Terminal 1
node scrape.js        # Terminal 2
```

### Check Results
```bash
node check_active.js       # Verify active status
node check_dupes.js        # Find duplicates
node verify_brands.js      # Validate data consistency
```

### Troubleshoot
```bash
node explore.js            # Inspect current browser state
DRY_RUN=1 node scrape.js  # Test without database changes
```

For more information and updates, visit the repository: https://github.com/ggnhome629-git/ggnhome-99acres-scrapper
