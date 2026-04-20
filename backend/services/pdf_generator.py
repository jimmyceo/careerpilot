# PDF generation temporarily disabled for Railway deployment
# Returns HTML instead - can be converted client-side or with browser print

from pathlib import Path
import uuid
import os

UPLOAD_DIR = Path(os.getenv('PDF_DIR', '/app/uploads/pdfs'))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def generate_pdf_from_html(cv_html: str, cv_id: str) -> str:
    """Generate PDF from HTML CV - simplified version"""

    # For now, save HTML and return path
    # PDF conversion can be done client-side with browser print
    html_path = UPLOAD_DIR / f"{cv_id}.html"

    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @media print {{
                @page {{ size: A4; margin: 2cm; }}
            }}
            body {{
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 210mm;
                margin: 0 auto;
                padding: 2cm;
            }}
            h1, h2, h3 {{ color: #1a1a2e; }}
            .section {{ margin-bottom: 1.5em; }}
        </style>
    </head>
    <body>
        {cv_html}
    </body>
    </html>
    """

    with open(html_path, "w") as f:
        f.write(full_html)

    return str(html_path)
