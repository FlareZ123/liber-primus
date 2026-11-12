#!/usr/bin/env python3
"""Read-only search of a pinned, independent CicadaSolvers 2014 DOCX corpus.

All original packages stay byte-identical. This script extracts visible OOXML
paragraph text and external relationship targets and searches for a lost page-59
reference, the AN END deep-web digest, or a source-selected page locator.

Usage: python sims/anend_original_archive_docx_scan.py <archive-checkout>
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

SOURCE_COMMIT = "c3127e0e9eb5afbb582d37988d6369fe38429238"
CANDIDATES = (
    "2014/2014 - What Happened Part 1.docx",
    "2014/2014 - What Happened Part 2; Liber Primus (POST 2014).docx",
    "2014/additional docs/scream314 github/2014.docx",
    "2014/additional docs/scream314 github/LP.docx",
    "2014/Liber Primus/lp-full-english transcript.docx",
)
TERMS = {
    "missing_page_file": r"\b59\.(?:txt|bin)\b",
    "missing_page_prose": r"\bpage\s*(?:fifty[\s-]?nine|59)\b",
    "specific_hash": r"36367763ab73783c7af284446c",
    "hash_instruction": r"within\s+the\s+deep\s+web|page\s+that\s+hashes\s+to",
    "onion7_host": r"ky2khlqdf7qdznac(?:\.onion)?",
    "hash_related": r"sha[\s-]?512|(?:page|site)\s+hash|hash\s+preimage",
}
PATTERNS = {key: re.compile(raw, re.IGNORECASE) for key, raw in TERMS.items()}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
REL = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def docx_sections(raw: bytes) -> list[dict]:
    result = []
    with zipfile.ZipFile(__import__("io").BytesIO(raw)) as package:
        names = [
            name
            for name in package.namelist()
            if (name == "word/document.xml"
                or name.startswith(("word/header", "word/footer", "word/footnotes", "word/endnotes", "word/comments")))
            and name.endswith(".xml")
        ]
        for name in names:
            xml = ET.fromstring(package.read(name))
            paragraphs = []
            for p in xml.iter(W + "p"):
                text = "".join(
                    node.text or "" for node in p.iter()
                    if node.tag in {W + "t", W + "instrText"}
                )
                if text.strip():
                    paragraphs.append(text)
            result.append({"part": name, "paragraphs": paragraphs})
        rel_name = "word/_rels/document.xml.rels"
        if rel_name in package.namelist():
            rel_xml = ET.fromstring(package.read(rel_name))
            links = [
                node.get("Target", "")
                for node in rel_xml.iter(REL + "Relationship")
                if node.get("TargetMode") == "External"
            ]
            if links:
                result.append({"part": rel_name, "paragraphs": links})
    return result


def scan(root: Path) -> dict:
    docs = []
    for name in CANDIDATES:
        source = root / name
        data = source.read_bytes()
        sections = docx_sections(data)
        hits = []
        for section in sections:
            paragraphs = section["paragraphs"]
            for index, paragraph in enumerate(paragraphs):
                for label, pattern in PATTERNS.items():
                    occurrences = list(pattern.finditer(paragraph))
                    if occurrences:
                        for match in occurrences[:15]:
                            a = max(0, match.start() - 220)
                            b = min(len(paragraph), match.end() + 260)
                            hits.append({
                                "part": section["part"],
                                "paragraph": index + 1,
                                "kind": label,
                                "match": match.group(),
                                "excerpt": paragraph[a:b],
                            })
        docs.append({
            "source_path": name,
            "source_sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
            "ooxml_parts": [s["part"] for s in sections],
            "paragraphs": sum(len(s["paragraphs"]) for s in sections),
            "hit_counts": {term: sum(h["kind"] == term for h in hits) for term in TERMS},
            "hits": hits,
        })
    return {
        "schema": 1,
        "upstream_repository": "cicada-solvers/The-Complete-Cicada3301-Archive",
        "upstream_commit": SOURCE_COMMIT,
        "scope": "Five selected 2014/LP DOCX sources, read-only; visible OOXML text and external relationship targets.",
        "source_status": "Community archive, 2025 merge commit; individual document publication times and Cicada origin unverified.",
        "documents": docs,
        "totals": {
            "files": len(docs),
            "bytes": sum(doc["bytes"] for doc in docs),
            "hit_counts": {
                term: sum(doc["hit_counts"][term] for doc in docs) for term in TERMS
            },
        },
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python anend_original_archive_docx_scan.py <archive-checkout>")
    print(json.dumps(scan(Path(sys.argv[1])), indent=2))
