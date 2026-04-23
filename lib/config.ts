/**
 * Configuration for file paths and external services
 * Uses environment variables with sensible defaults for local development
 */

export const config = {
  // File paths - default to ./data/ folder for portability
  usersFilePath: process.env.USERS_FILE_PATH || './data/users.json',
  irdaiDbPath: process.env.IRDAI_DB_PATH || './data/irdai/entities_database.json',
  headlinesFilePath: process.env.HEADLINES_FILE_PATH || './data/irdai/headlines.json',
  scraperScriptPath: process.env.SCRAPER_SCRIPT_PATH || './scripts/daily_crawl.py',

  // IRDAI analysis base path (for external python scripts)
  irdaiAnalysisBase: process.env.IRDAI_ANALYSIS_BASE || '/home/deva/full_stack_app/irdai-analysis',

  // Optional: Set custom paths for production deployments
  getUserFilePath: () => {
    const path = process.env.USERS_FILE_PATH;
    if (path) return path;
    // Default relative to project root
    if (typeof window !== 'undefined') {
      // Client-side - use relative path
      return './data/users.json';
    }
    // Server-side - resolve to absolute
    return require('path').resolve(process.cwd(), './data/users.json');
  }
};

// Validate on startup (server-side only)
if (typeof window === 'undefined') {
  const fs = require('fs');
  const path = require('path');

  const requiredPaths = [
    { key: 'USERS_FILE_PATH', path: config.getUserFilePath() },
    { key: 'IRDAI_DB_PATH', path: config.irdaiDbPath },
    { key: 'HEADLINES_FILE_PATH', path: config.headlinesFilePath },
  ];

  for (const { key, path: filePath } of requiredPaths) {
    const absPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absPath)) {
      console.warn(`⚠️  Missing file at ${absPath} (${key}). Create it or set ${key} environment variable.`);
    }
  }
}
