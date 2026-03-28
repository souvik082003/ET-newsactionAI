"""
scraper.py — Article extraction from URLs and PDFs for ET NewsAction AI.
"""

import re
import fitz  # PyMuPDF

# Patch lxml.html.clean before newspaper imports it
try:
    import lxml.html.clean
except ImportError:
    try:
        import lxml_html_clean
        import lxml.html
        lxml.html.clean = lxml_html_clean
    except ImportError:
        pass

from newspaper import Article
import requests
from bs4 import BeautifulSoup


def clean_text(text: str) -> str:
    """Remove ads, boilerplate, and normalize whitespace."""
    patterns = [
        r"Read more:.*",
        r"Also read:.*",
        r"ALSO READ:.*",
        r"Subscribe to.*",
        r"Download the.*app.*",
        r"Follow us on.*",
        r"Join our.*channel.*",
        r"Click here to.*",
        r"Advertisement",
        r"Promoted Content",
        r"\(Reuters\)|\(PTI\)|\(ANI\)",
    ]
    for pat in patterns:
        text = re.sub(pat, "", text, flags=re.IGNORECASE)

    # Normalize whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def scrape_url(url: str) -> dict:
    """Scrape article text and metadata from a URL using newspaper3k with BS4 fallback."""
    title = "Untitled Article"
    text = ""

    # Try newspaper3k first
    try:
        article = Article(url)
        article.download()
        article.parse()
        title = article.title or title
        text = article.text or ""
    except Exception:
        pass

    # Fallback to requests + BeautifulSoup if text is too short
    if not text or len(text.strip()) < 100:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            # Remove non-content elements
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "iframe"]):
                tag.decompose()

            # Try to find article body first
            article_body = (
                soup.find("article")
                or soup.find("div", class_=re.compile(r"article|story|content|post", re.I))
                or soup.find("main")
            )
            target = article_body or soup.body or soup

            text = target.get_text(separator="\n", strip=True)

            if not title or title == "Untitled Article":
                title_tag = soup.find("title")
                title = title_tag.get_text(strip=True) if title_tag else title

        except Exception as e:
            if not text:
                raise RuntimeError(f"Failed to scrape article: {e}")

    text = clean_text(text)
    return {"title": title, "text": text, "source": url}


def extract_pdf(file_bytes: bytes) -> dict:
    """Extract and clean text from a PDF using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        page_text = page.get_text()
        # Remove page number lines
        page_text = re.sub(r"^\s*\d+\s*$", "", page_text, flags=re.MULTILINE)
        pages.append(page_text)
    doc.close()

    text = clean_text("\n".join(pages))
    return {"title": "Uploaded Document", "text": text, "source": "pdf"}
