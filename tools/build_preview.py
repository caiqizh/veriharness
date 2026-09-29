#!/usr/bin/env python3
"""Build a single HTML preview with embedded styles, scripts, icon, and paper."""
import argparse
import base64
from pathlib import Path
import re

SITE = Path(__file__).resolve().parents[1]
SCRIPTS = ('data.js', 'cases.js', 'app.js', 'cases-view.js')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    html = (SITE / 'index.html').read_text()
    def embed_stylesheet(match):
        stylesheet = (SITE / match.group(1)).resolve()
        if not stylesheet.is_relative_to(SITE):
            raise ValueError('Stylesheets must be inside the website directory')
        return '<style>' + stylesheet.read_text() + '</style>'

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', embed_stylesheet, html)
    for name in SCRIPTS:
        html = re.sub(r'\s*<script src="' + re.escape(name) + r'" defer></script>', '', html)
    icon = base64.b64encode((SITE / 'favicon.svg').read_bytes()).decode()
    html = html.replace('href="favicon.svg"', f'href="data:image/svg+xml;base64,{icon}"')
    pdf = base64.b64encode((SITE / 'assets/paper.pdf').read_bytes()).decode()
    scripts = '\n'.join((SITE / name).read_text() for name in SCRIPTS)
    scripts += '\n' + f"""
// Embed the PDF once; every paper link downloads the same local document.
const paperBytes = Uint8Array.from(atob('{pdf}'), character => character.charCodeAt(0));
const paperUrl = URL.createObjectURL(new Blob([paperBytes], {{ type: 'application/pdf' }}));
document.querySelectorAll('a[href="assets/paper.pdf"]').forEach(link => {{
  link.href = paperUrl;
  link.download = 'VeriHarness-paper.pdf';
}});
"""
    html = html.replace('</body>', '<script>' + scripts.replace('</script', '<\\/script') + '</script>\n</body>')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html)
    print(f'Wrote {args.output} ({args.output.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
