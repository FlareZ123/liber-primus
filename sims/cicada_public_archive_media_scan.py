#!/usr/bin/env python3
"""OCR/text scan of public Cicada archive images and the Unfiction claims DOCX.

The output contains only redacted candidate contexts, not full documents or
participant email addresses.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

BASE = "https://raw.githubusercontent.com/krisyotam/cicada3301/main/"
TEXT_SOURCES = [
    "papers/cicada 3301 2013  4chan x thread.txt",
]
IMAGE_SOURCES = [
    "archives/cijhho/2013/additional files/Winners leak/0iKcgK8.png",
    "archives/cijhho/2013/additional files/Winners leak/KaGgU2j.jpg",
    "archives/cijhho/2013/additional files/Winners leak/L2N80rG.jpg",
    "archives/cijhho/2013/additional files/Winners leak/aWOcomB.jpg",
    "archives/cijhho/2013/additional files/Winners leak/cChYewZ.png",
    "archives/cijhho/2013/additional files/Winners leak/inVmnbQ.jpg",
    "archives/cijhho/2013/additional docs/The Leaked Email/screenshot from hacker-forum.png",
]
DOCX_SOURCES = [
    "archives/cijhho/2012/2012 - what happend part 1.docx",
    "archives/cijhho/2012/2012 - what happend part 2.docx",
    "archives/cijhho/2012/MIDI puzzle/The MIDI puzzle and solution.docx",
    "archives/cijhho/2012/additional docs/The Leaked Email/The leaked email.docx",
    "archives/cijhho/2012/additional docs/the outgussed messege.docx",
    "archives/cijhho/2012/additional docs/the subreddit/The subreddit.docx",
    "archives/cijhho/2012/additional docs/scream314 git pages/2012.docx",
    "archives/cijhho/2012/additional docs/unverified claims from alleged winners on Unfiction.docx",
]
HOST_RE = re.compile(r"sq6wmgv2zcsrix6t(?:\.onion)?", re.I)
PATH_RE = re.compile(r"sq6wmgv2zcsrix6t\.onion\s*/\s*([A-Za-z0-9_-]{3,64})", re.I)
NUMBER_RE = re.compile(r"\b\d{16,24}\b")
CONTEXT_RE = re.compile(
    r"sq6|onion|rsa|email|number|cicada|3301|num|received|append|slash|midi|unique|second chance",
    re.I,
)
EMAIL_RE = re.compile(r"(?<![\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?![\w.-])")
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def url_for(path: str) -> str:
    return BASE + quote(path, safe="/")


def fetch(path: str) -> bytes:
    request = Request(url_for(path), headers={"User-Agent": "LiberPrimus-public-media-scan/1.0"})
    with urlopen(request, timeout=120) as response:
        return response.read()


def redact(value: str) -> str:
    value = EMAIL_RE.sub("[REDACTED_EMAIL]", value)
    value = IP_RE.sub("[REDACTED_IP]", value)
    return re.sub(r"\s+", " ", value).strip()


def scan_text(source: str, page: int, value: str) -> list[dict]:
    hits: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for regex, kind in ((PATH_RE, "target-path"), (HOST_RE, "target-host")):
        for match in regex.finditer(value):
            key = (kind, match.group(0))
            if key in seen:
                continue
            seen.add(key)
            context = value[max(0, match.start() - 180): min(len(value), match.end() + 180)]
            hits.append({
                "source": source, "page": page, "type": kind,
                "match": match.group(0), "context": redact(context),
            })
    for match in NUMBER_RE.finditer(value):
        context = value[max(0, match.start() - 220): min(len(value), match.end() + 220)]
        if not CONTEXT_RE.search(context):
            continue
        key = ("long-number", match.group(0))
        if key in seen:
            continue
        seen.add(key)
        hits.append({
            "source": source, "page": page, "type": "long-number-near-cicada-context",
            "match": match.group(0), "context": redact(context),
        })
    return hits


def ocr_image(source: str, data: bytes, temp_dir: Path) -> tuple[dict, list[dict]]:
    digest = hashlib.sha256(data).hexdigest()
    suffix = Path(source).suffix.lower() or ".png"
    image_path = temp_dir / ("image-" + digest[:16] + suffix)
    image_path.write_bytes(data)
    text = subprocess.run(
        ["tesseract", str(image_path), "stdout", "--psm", "6"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    ).stdout
    hits = scan_text(source, 1, text)
    return ({
        "source": source, "url": url_for(source), "bytes": len(data),
        "sha256": digest, "extraction": "Tesseract OCR",
        "characters": len(text), "candidate_hits": len(hits),
    }, hits)


def scan_docx(source: str, data: bytes, temp_dir: Path) -> tuple[dict, list[dict]]:
    digest = hashlib.sha256(data).hexdigest()
    docx_path = temp_dir / ("docx-" + digest[:16] + ".docx")
    docx_path.write_bytes(data)
    hits: list[dict] = []
    media_scanned: list[str] = []

    with zipfile.ZipFile(docx_path) as archive:
        xml_bytes = archive.read("word/document.xml")
        root = ET.fromstring(xml_bytes)
        document_text = "\n".join(
            node.text or "" for node in root.iter()
            if node.tag.endswith("}t")
        )
        hits.extend(scan_text(source, 1, document_text))

        for name in archive.namelist():
            if not name.startswith("word/media/"):
                continue
            suffix = Path(name).suffix.lower()
            if suffix not in {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}:
                continue
            media = archive.read(name)
            media_source = source + "::" + name
            _, media_hits = ocr_image(media_source, media, temp_dir)
            media_scanned.append(name)
            hits.extend(media_hits)

    return ({
        "source": source, "url": url_for(source), "bytes": len(data),
        "sha256": digest, "extraction": "DOCX XML text plus OCR of embedded images",
        "embedded_images_scanned": media_scanned,
        "candidate_hits": len(hits),
    }, hits)


def main() -> None:
    out_dir = Path("artifacts/cicada-public-archive-media-scan")
    out_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix="cicada-public-media-"))
    manifest: list[dict] = []
    hits: list[dict] = []
    errors: list[dict] = []

    for source in TEXT_SOURCES:
        try:
            data = fetch(source)
            text = data.decode("utf-8", errors="replace")
            found = scan_text(source, 1, text)
            manifest.append({
                "source": source, "url": url_for(source), "bytes": len(data),
                "sha256": hashlib.sha256(data).hexdigest(),
                "extraction": "raw UTF-8 text", "characters": len(text),
                "candidate_hits": len(found),
            })
            hits.extend(found)
        except Exception as exc:
            errors.append({"source": source, "error": type(exc).__name__ + ": " + str(exc)})

    for source in IMAGE_SOURCES:
        try:
            entry, found = ocr_image(source, fetch(source), temp_dir)
            manifest.append(entry)
            hits.extend(found)
        except Exception as exc:
            errors.append({"source": source, "error": type(exc).__name__ + ": " + str(exc)})

    for source in DOCX_SOURCES:
        try:
            entry, found = scan_docx(source, fetch(source), temp_dir)
            manifest.append(entry)
            hits.extend(found)
        except Exception as exc:
            errors.append({"source": source, "error": type(exc).__name__ + ": " + str(exc)})

    summary = {
        "scope": "2012 email, MIDI, Reddit, Unfiction, and archive DOCX records; 2013 leaked-email screenshots; omitted 2013 4chan text export",
        "files_requested": len(TEXT_SOURCES) + len(IMAGE_SOURCES) + len(DOCX_SOURCES),
        "files_scanned": len(manifest),
        "errors": errors,
        "candidate_hits": hits,
        "interpretation_warning": (
            "These are public archive/leak materials, not automatically authenticated. "
            "A PGP signature path or RSA plaintext response is not the initial 2012 /NUM token."
        ),
    }
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        f"COMPLETE files={len(manifest)}/{summary['files_requested']} "
        f"errors={len(errors)} candidate_hits={len(hits)}"
    )
    for hit in hits[:100]:
        print(
            f"HIT {hit['source']} p.{hit['page']} {hit['type']}={hit['match']} "
            f":: {hit['context'][:260]}"
        )
    if not manifest:
        raise SystemExit("No public media source could be scanned.")


if __name__ == "__main__":
    main()
