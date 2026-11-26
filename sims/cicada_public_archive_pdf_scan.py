#!/usr/bin/env python3
"""Search selected public 2012-2014 Cicada forum/archive records for the missing /NUM path.

Only sanitized candidate contexts are written to the artifact. Full extracted text,
participant email addresses, and raw forum dumps are not uploaded.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE = "https://raw.githubusercontent.com/krisyotam/cicada3301/main/"
PDF_SOURCES = [
    "papers/_x_ - Paranormal » Thread #13761502.pdf",
    "papers/_x_ - Paranormal » Thread #13767100.pdf",
    "papers/_x_ - Paranormal » Thread #13767269.pdf",
    "papers/_x_ - Paranormal » Thread #13817276.pdf",
    "papers/_x_ - Paranormal » Thread #13865307.pdf",
    "papers/_x_ - Paranormal » Thread #14099148.pdf",
    "papers/_x_ - Paranormal » Thread #14099148 - french group of solvers.pdf",
    "papers/_x_ - Paranormal » Thread #14120949.pdf",
    "papers/_x_ - Paranormal » Thread #14547165.pdf",
    "papers/_x_ - Paranormal » Thread #18491379.pdf",
    "papers/sci thread from 2012.pdf",
    "papers/sci board Discussion Thread Archive.pdf",
    "papers/sci board Discussion Thread Archive 2.pdf",
    "papers/Reddit thread discovering the leaked email with pgp.pdf",
    "papers/hacker forum thread about 2013 leaked email with pgp.pdf",
]
TEXT_SOURCES = [
    "papers/4chan thread from dec-2-13.txt",
    "papers/cicada 3301 2013 4chan x thread.txt",
    "papers/cicada 3301 2013 4chan first b thread.txt",
    "papers/cicada 3301 2013 4chan second b thread.txt",
]
MAX_OCR_PAGES = 500
LOW_TEXT_THRESHOLD = 80

HOST_RE = re.compile(r"sq6wmgv2zcsrix6t(?:\.onion)?", re.I)
PATH_RE = re.compile(r"sq6wmgv2zcsrix6t\.onion\s*/\s*([A-Za-z0-9_-]{3,48})", re.I)
LONG_NUMBER_RE = re.compile(r"\b\d{16,24}\b")
CONTEXT_RE = re.compile(
    r"sq6|onion|rsa|email|number|cicada|3301|num|received|append|slash|midi|unique|second chance",
    re.I,
)
EMAIL_RE = re.compile(r"(?<![\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?![\w.-])")
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def run(cmd: list[str]) -> str:
    result = subprocess.run(
        cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    return result.stdout


def redact(text: str) -> str:
    text = EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    text = IP_RE.sub("[REDACTED_IP]", text)
    return re.sub(r"\s+", " ", text).strip()


def source_url(path: str) -> str:
    return BASE + quote(path, safe="/")


def fetch_bytes(path: str) -> bytes:
    request = Request(
        source_url(path),
        headers={"User-Agent": "LiberPrimus-public-archive-scan/1.0"},
    )
    with urlopen(request, timeout=120) as response:
        return response.read()


def scan_page(path: str, page_no: int, page_text: str) -> list[dict]:
    hits: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for match in PATH_RE.finditer(page_text):
        value = match.group(0)
        key = ("target-path", value)
        if key not in seen:
            seen.add(key)
            context = page_text[max(0, match.start() - 180): min(len(page_text), match.end() + 180)]
            hits.append({
                "source": path, "page": page_no, "type": "target-path",
                "match": value, "context": redact(context),
            })

    for match in HOST_RE.finditer(page_text):
        value = match.group(0)
        key = ("target-host", value)
        if key not in seen:
            seen.add(key)
            context = page_text[max(0, match.start() - 180): min(len(page_text), match.end() + 180)]
            hits.append({
                "source": path, "page": page_no, "type": "target-host",
                "match": value, "context": redact(context),
            })

    for match in LONG_NUMBER_RE.finditer(page_text):
        context = page_text[max(0, match.start() - 220): min(len(page_text), match.end() + 220)]
        if not CONTEXT_RE.search(context):
            continue
        value = match.group(0)
        key = ("long-number", value)
        if key not in seen:
            seen.add(key)
            hits.append({
                "source": path, "page": page_no,
                "type": "long-number-near-cicada-context",
                "match": value, "context": redact(context),
            })

    return hits


def scan_text_source(path: str) -> tuple[dict, list[dict]]:
    data = fetch_bytes(path)
    digest = hashlib.sha256(data).hexdigest()
    text = data.decode("utf-8", errors="replace")
    hits = scan_page(path, 1, text)
    return ({
        "source": path, "url": source_url(path), "bytes": len(data),
        "sha256": digest, "pages": 1, "extraction": "raw UTF-8 text",
        "ocr_pages": [], "characters": len(text), "candidate_hits": len(hits),
    }, hits)


def scan_pdf(path: str, temp_dir: Path, ocr_budget: list[int]) -> tuple[dict, list[dict]]:
    data = fetch_bytes(path)
    digest = hashlib.sha256(data).hexdigest()
    local = temp_dir / ("source-" + hashlib.sha256(path.encode()).hexdigest()[:16] + ".pdf")
    local.write_bytes(data)

    try:
        info = run(["pdfinfo", str(local)])
        page_match = re.search(r"^Pages:\s+(\d+)", info, re.M)
        page_count = int(page_match.group(1)) if page_match else 0
    except Exception:
        page_count = 0

    raw_text = run(["pdftotext", "-layout", str(local), "-"])
    page_texts = raw_text.split("\f")
    if page_count <= 0:
        page_count = max(1, len(page_texts))
    page_texts = page_texts[:page_count]
    if len(page_texts) < page_count:
        page_texts.extend([""] * (page_count - len(page_texts)))

    ocr_pages: list[int] = []
    hits: list[dict] = []
    total_chars = 0

    for page_no, page_text in enumerate(page_texts, start=1):
        compact = re.sub(r"\s+", "", page_text)
        if len(compact) < LOW_TEXT_THRESHOLD and ocr_budget[0] < MAX_OCR_PAGES:
            prefix = temp_dir / (
                "page-" + hashlib.sha256((path + str(page_no)).encode()).hexdigest()[:16]
            )
            try:
                subprocess.run(
                    [
                        "pdftoppm", "-f", str(page_no), "-l", str(page_no),
                        "-r", "150", "-png", "-singlefile", str(local), str(prefix),
                    ],
                    check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                )
                image_path = Path(str(prefix) + ".png")
                if image_path.exists():
                    ocr_text = run(["tesseract", str(image_path), "stdout", "--psm", "6"])
                    ocr_budget[0] += 1
                    ocr_pages.append(page_no)
                    if len(ocr_text.strip()) > len(page_text.strip()):
                        page_text = ocr_text
            except Exception:
                pass

        total_chars += len(page_text)
        hits.extend(scan_page(path, page_no, page_text))

    return ({
        "source": path, "url": source_url(path), "bytes": len(data),
        "sha256": digest, "pages": page_count,
        "extraction": "pdftotext with OCR fallback for low-text pages",
        "ocr_pages": ocr_pages, "characters": total_chars,
        "candidate_hits": len(hits),
    }, hits)


def main() -> None:
    out_dir = Path("artifacts/cicada-public-archive-pdf-scan")
    out_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix="cicada-public-archive-"))
    manifest: list[dict] = []
    hits: list[dict] = []
    errors: list[dict] = []
    ocr_budget = [0]

    for source in PDF_SOURCES:
        try:
            entry, found = scan_pdf(source, temp_dir, ocr_budget)
            manifest.append(entry)
            hits.extend(found)
            print(
                f"PDF {source}: {entry['pages']} pages, {entry['bytes']} bytes, "
                f"{entry['candidate_hits']} candidate hits, OCR pages={len(entry['ocr_pages'])}"
            )
        except Exception as exc:
            errors.append({"source": source, "error": type(exc).__name__ + ": " + str(exc)})
            print(f"ERROR {source}: {type(exc).__name__}: {exc}")

    for source in TEXT_SOURCES:
        try:
            entry, found = scan_text_source(source)
            manifest.append(entry)
            hits.extend(found)
            print(f"TEXT {source}: {entry['bytes']} bytes, {entry['candidate_hits']} candidate hits")
        except Exception as exc:
            errors.append({"source": source, "error": type(exc).__name__ + ": " + str(exc)})
            print(f"ERROR {source}: {type(exc).__name__}: {exc}")

    summary = {
        "scope": "named public 2012-2014 Cicada /x/, /sci/, Reddit, and 2013 leaked-email archive records",
        "source_repository": "https://github.com/krisyotam/cicada3301/tree/main/papers",
        "files_requested": len(PDF_SOURCES) + len(TEXT_SOURCES),
        "files_scanned": len(manifest),
        "errors": errors,
        "ocr_pages": ocr_budget[0],
        "candidate_hits": hits,
        "interpretation_warning": (
            "A long number is only a candidate. Distinguish the initial emailed /NUM "
            "path token from RSA plaintext response numbers, example placeholders, "
            "phone numbers, post IDs, and unrelated puzzle values."
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
        f"errors={len(errors)} OCR_pages={ocr_budget[0]} candidate_hits={len(hits)}"
    )
    for hit in hits[:80]:
        print(
            f"HIT {hit['source']} p.{hit['page']} {hit['type']}={hit['match']} "
            f":: {hit['context'][:260]}"
        )
    if not manifest:
        raise SystemExit("No archive source could be scanned.")


if __name__ == "__main__":
    main()
