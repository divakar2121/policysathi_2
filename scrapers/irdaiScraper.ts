import puppeteer from "puppeteer";

const SOURCES = [
  { name: "IRDAI Circulars", url: "https://irdai.gov.in/circulars" },
  { name: "IRDAI Guidelines", url: "https://irdai.gov.in/guidelines" },
  { name: "NCDRC", url: "https://ncdrc.nic.in" },
];

interface ScrapedDocument {
  title: string;
  url: string;
  date: string;
  content: string;
  source: string;
}

export async function scrapeIRDAI(): Promise<ScrapedDocument[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const documents: ScrapedDocument[] = [];

  try {
    for (const source of SOURCES) {
      console.log(`Scraping ${source.name}...`);
      
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(30000);
      
      try {
        await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 30000 });
        
        const links = await page.evaluate(() => {
          const items = document.querySelectorAll("a[href$='.pdf']");
          return Array.from(items).map((a) => ({
            title: a.textContent?.trim() || "Untitled",
            url: (a as HTMLAnchorElement).href,
          }));
        });

        for (const link of links) {
          if (link.url) {
            documents.push({
              title: link.title,
              url: link.url,
              date: new Date().toISOString(),
              content: `PDF Document: ${link.title}`,
              source: source.name,
            });
          }
        }
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
      } finally {
        await page.close();
      }
    }

    console.log(`Scraped ${documents.length} documents`);
    return documents;
  } finally {
    await browser.close();
  }
}

export async function runNightlyUpdate() {
  console.log("Starting nightly IRDAI update...");
  
  const documents = await scrapeIRDAI();
  
  console.log(`Found ${documents.length} new documents`);
  
  for (const doc of documents) {
    console.log(`- ${doc.title} (${doc.source})`);
  }
  
  console.log("Nightly update complete");
  return documents;
}

if (require.main === module) {
  runNightlyUpdate().catch(console.error);
}
