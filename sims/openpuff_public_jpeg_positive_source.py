"""Recover the unchanged public, author-described OpenPuff JPEG positive carrier.

This is an independent test fixture, never a Liber Primus ciphertext carrier.
The site explicitly states password A=12345678, B/C off, JPEG Maximum 1/2,
and embedded hidden.txt containing 'Dies ist eine versteckte Nachricht!'.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import tempfile
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import Request, urlopen

from filelock import FileLock

SOURCE_PAGE = "https://www.bauser-enterprises.com/html/steganographie.php"
EXPECTED = "Dies ist eine versteckte Nachricht!"


class MediaLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag not in ("img", "a", "source"):
            return
        attr = dict(attrs)
        link = attr.get("src") if tag != "a" else attr.get("href")
        if link:
            self.links.append((tag, link, urljoin(SOURCE_PAGE, link)))


def request_bytes(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; OpenPuff-positive-validation/1.0)"})
    with urlopen(request, timeout=40) as response:
        return response.read()


def atomic_bytes(path: Path, data: bytes) -> None:
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.stem + ".", suffix=".tmp", delete=False) as f:
            temp = Path(f.name)
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        try:
            os.replace(temp, path)
        finally:
            temp.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    html_bytes = request_bytes(SOURCE_PAGE)
    html_text = html_bytes.decode("latin-1")
    parser_html = MediaLinks()
    parser_html.feed(html_text)
    links = parser_html.links
    candidates = [
        link for link in links
        if Path(unquote(urlparse(link[2]).path)).name.lower() == "openpuff.jpg"
    ]
    inventory = {
        "source_page": SOURCE_PAGE,
        "html_size": len(html_bytes),
        "html_sha256": hashlib.sha256(html_bytes).hexdigest(),
        "openpuff_link_candidates": candidates,
        "openpuff_media_links": [
            item for item in links if "openpuff" in item[1].lower()
        ],
        "site_declared_password_A": "12345678",
        "site_declared_BC_enabled": False,
        "site_declared_JPEG_bits": "1/2 (50%) - Maximum",
        "site_declared_secret_text": EXPECTED,
    }
    atomic_bytes(out / "page-source.html", html_bytes)
    atomic_bytes(out / "links.json", (json.dumps(inventory, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
    print("PUBLIC_JPEG_HTML_LINKS", json.dumps(inventory, ensure_ascii=False), flush=True)
    if len(candidates) != 1:
        raise RuntimeError(f"Expected exactly one original openpuff.jpg element, found {len(candidates)}")

    url = candidates[0][2]
    carrier = request_bytes(url)
    if not (carrier.startswith(b"\xff\xd8") and b"\xff\xd9" in carrier[-100000:]):
        raise RuntimeError("Source-linked image is not an intact JPEG file")
    atomic_bytes(out / "openpuff.jpg", carrier)
    identity = {
        "source_url": url,
        "carrier_name": "openpuff.jpg",
        "size": len(carrier),
        "sha256": hashlib.sha256(carrier).hexdigest(),
        "head_hex": carrier[:16].hex(),
    }
    atomic_bytes(out / "carrier-identity.json", (json.dumps(identity, indent=2) + "\n").encode("utf-8"))
    print("PUBLIC_JPEG_CARRIER", json.dumps(identity), flush=True)


if __name__ == "__main__":
    main()
