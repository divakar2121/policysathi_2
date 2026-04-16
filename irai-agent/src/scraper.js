import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

const BASE_URL = 'https://irdai.gov.in';
const DATA_DIR = path.join(__dirname, '../data');
const SCRAPED_DIR = path.join(DATA_DIR, 'scraped');
const PDFs_DIR = path.join(DATA_DIR, 'pdfs');

interface PageData {
  url: string;
  title: string;
  content: string;
  links: string[];
  pdfs: string[];
  timestamp: string;
}

function ensureDirectories() {
  [DATA_DIR, SCRAPED_DIR, PDFs_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IRDAI-Agent/1.0)' },
      timeout: 15000 
    }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', (e: Error) => reject(e));
    req.setTimeout(15000, () => req.destroy());
  });
}

async function scrapePage(url: string): Promise<PageData | null> {
  try {
    console.log(`[IRDAI] Fetching: ${url}`);
    const html = await fetchUrl(url);
    const $ = cheerio.load(html);
    
    const title = $('title').text() || $('h1').first().text() || url;
    
    const contentSelectors = ['main', 'article', '.content', '#content', '.container', 'body'];
    let content = '';
    for (const sel of contentSelectors) {
      const el = $(sel).first();
      if (el.length) {
        content = el.text().trim();
        if (content.length > 100) break;
      }
    }

    const links: string[] = [];
    $('a[href]').each((_: any, el: any) => {
      const href = $(el).attr('href');
      if (href?.startsWith('http')) links.push(href);
    });

    const pdfs: string[] = [];
    $('a[href$=".pdf"]').each((_: any, el: any) => {
      const href = $(el).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, BASE_URL).href;
        pdfs.push(fullUrl);
      }
    });

    return {
      url,
      title: title.trim(),
      content: content.substring(0, 50000),
      links: [...new Set(links)].slice(0, 50),
      pdfs,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[IRDAI] Error: ${url} -`, error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

function savePageData(pageData: PageData) {
  const urlPart = pageData.url.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 60);
  fs.writeFileSync(path.join(SCRAPED_DIR, `${urlPart}.json`), JSON.stringify(pageData, null, 2));
}

async function main() {
  console.log('='.repeat(50));
  console.log('IRDAI Website Data Collection Agent');
  console.log('='.repeat(50));
  
  ensureDirectories();

  const urls = [
    BASE_URL,
    `${BASE_URL}/circulars`,
    `${BASE_URL}/guidelines`,
    `${BASE_URL}/health-insurance`
  ];

  const pages: PageData[] = [];

  for (const url of urls) {
    const pageData = await scrapePage(url);
    if (pageData) {
      pages.push(pageData);
      savePageData(pageData);
      console.log(`[IRDAI] Saved: ${pageData.title.substring(0, 40)}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  const report = {
    generated: new Date().toISOString(),
    source: BASE_URL,
    stats: { totalPages: pages.length },
    pages: pages.map(p => ({ url: p.url, title: p.title, pdfs: p.pdfs.length }))
  };

  fs.writeFileSync(path.join(DATA_DIR, 'scrape_report.json'), JSON.stringify(report, null, 2));

  console.log('\n=== COMPLETE ===');
  console.log(`Pages scraped: ${pages.length}`);
}

main().catch(console.error);