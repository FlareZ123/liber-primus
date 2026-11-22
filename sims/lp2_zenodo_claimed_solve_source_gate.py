"""
Check a publicly listed 2026 claim of solving Cicada 3301 for usable LP2 plaintext.
This is a source acquisition diagnostic. Do not archive the PDF in the repository.
"""
import hashlib
import io
import re

import requests
from pypdf import PdfReader

RECORD = "23487409"
URL = f"https://zenodo.org/api/records/{RECORD}"
EXPECTED_MD5 = "89f1248f3c24f8b628e4305fb1dcbe6c"
HEADERS = {"User-Agent": "LP2Research/1.0 (public first-party paper inspection)"}


def main() -> None:
    response = requests.get(URL, headers=HEADERS, timeout=35)
    print("Record status:", response.status_code, flush=True)
    response.raise_for_status()
    record = response.json()
    metadata = record["metadata"]
    print("Record title:", metadata.get("title", ""), flush=True)
    print("DOI:", record.get("doi", metadata.get("doi", "")), flush=True)
    print("Published:", metadata.get("publication_date", ""), flush=True)
    files = record["files"]
    for file_info in files:
        print("Listed PDF", file_info.get("key"), file_info.get("size"), flush=True)
    file_info = next(f for f in files if f.get("key", "").lower().endswith(".pdf"))
    link = file_info.get("links", {}).get("self") or file_info.get("links", {}).get("content")
    print("File link:", link, flush=True)
    file_response = requests.get(link, headers=HEADERS, timeout=60)
    print("File response:", file_response.status_code, "bytes:", len(file_response.content), flush=True)
    file_response.raise_for_status()
    data = file_response.content
    md5 = hashlib.md5(data).hexdigest()
    print("PDF MD5:", md5, "expected:", EXPECTED_MD5, flush=True)
    assert md5 == EXPECTED_MD5, "Unexpected paper bytes"
    pdf = PdfReader(io.BytesIO(data))
    print("PDF pages:", len(pdf.pages), flush=True)
    aggregate = []
    for index, page in enumerate(pdf.pages):
        txt = page.extract_text() or ""
        aggregate.append(txt)
        print(f"Page {index+1}: extracted characters {len(txt)}")
        flattened = re.sub(r"\s+", " ", txt).strip()
        print(f"Page {index+1} beginning: {flattened[:350]}")
    full = " ".join(aggregate)
    for term in ["liber primus", "decrypt", "cipher", "rune", "plaintext", "key", "2014", "solved"]:
        hits = list(re.finditer(re.escape(term), full, flags=re.IGNORECASE))
        print(f"Keyword {term!r}: {len(hits)} occurrences")
        for hit in hits[:4]:
            text = re.sub(r"\s+", " ", full[max(hit.start()-100, 0):hit.end()+180]).strip()
            print("  Context:", text[:240])
    print("SOURCE-CHECK COMPLETE: independently validate any claimed LP2 inverse before acceptance", flush=True)


if __name__ == "__main__":
    main()
