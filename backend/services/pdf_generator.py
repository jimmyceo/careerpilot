from playwright.sync_api import sync_playwright
from pathlib import Path
import uuid

UPLOAD_DIR = Path("/data/.openclaw/workspace/empire/careerpilot/uploads/pdfs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def generate_pdf_from_html(cv_html: str, cv_id: str) -> str:
    """Generate PDF from HTML CV using Playwright"""
    
    # Wrap HTML in proper document structure
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 2cm;
            }}
            body {{
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 210mm;
                margin: 0 auto;
            }}
            h1, h2, h3 {{
                color: #1a1a2e;
            }}
            .section {{
                margin-bottom: 1.5em;
            }}
            .job-title {{
                font-weight: bold;
                font-size: 1.2em;
            }}
            .company {{
                color: #666;
            }}
            .date {{
                color: #999;
                font-size: 0.9em;
            }}
            ul {{
                padding-left: 1.5em;
            }}
            li {{
                margin-bottom: 0.3em;
            }}
        </style>
    </head>
    <body>
        {cv_html}
    </body>
    </html>
    """
    
    pdf_path = UPLOAD_DIR / f"{cv_id}.pdf"
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(full_html)
        page.pdf(path=str(pdf_path), format='A4')
        browser.close()
    
    return str(pdf_path)

if __name__ == "__main__":
    # Test
    test_html = "<h1>John Doe</h1><p>Software Engineer</p>"
    pdf_path = generate_pdf_from_html(test_html, str(uuid.uuid4()))
    print(f"PDF generated: {pdf_path}")