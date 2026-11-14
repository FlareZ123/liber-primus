"""Bounded original-HTTP archival check for Director issue #948.

Downloads exactly the two 2017 ArchiveBot WARC archives indexed in
JustAnotherArchivist/archivebot-archives. Prints source dates, WARC object
identity, decoded HTTP entity bytes, checksums and hrefs. Other files/hosts
are deliberately outside scope. Uses warcio's documented decoding behavior.
Run: python sims/lp2_p56_2017_archivebot_warc_http_sft.py
"""
from __future__ import annotations

from collections import Counter
from hashlib import blake2b, sha256, sha512, sha3_512
from html.parser import HTMLParser
from io import BytesIO
import json
import re
import urllib.request
from urllib.parse import urljoin

from warcio.archiveiterator import ArchiveIterator


ARCHIVES = (
    (
        "falconk_archivebot_1711141131131_xyz_20170629",
        "1711141131131.xyz-inf-20170629-043925-ewtko-00000.warc.gz",
        22508403,
    ),
    (
        "falconk_archivebot_www_1711141131131_xyz_20170629",
        "www.1711141131131.xyz-inf-20170629-044401-1z9jb-00000.warc.gz",
        9302,
    ),
)
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
CAP_BYTES = 25 * 1024 * 1024
HTML_CAP = 1024 * 1024


class LinkParser(HTMLParser):
    """Extract absolute, direct HTML links without following them."""

    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        attr = "href" if tag in {"a", "link"} else "src" if tag in {"script", "img"} else None
        if attr and attrs_map.get(attr):
            self.links.append(urljoin(self.base_url, str(attrs_map[attr])))


def emit(**data: object) -> None:
    print(json.dumps(data, sort_keys=True, ensure_ascii=True), flush=True)


def download(item: str, filename: str, expected: int) -> bytes:
    url = f"https://archive.org/download/{item}/{filename}"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "LiberPrimusSourceReader/1.0 (historical WARC research)"},
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        raw = response.read(CAP_BYTES + 1)
        emit(
            event="download",
            source=url,
            status=response.status,
            final_url=response.url,
            bytes=len(raw),
            expected_bytes=expected,
            sha256=sha256(raw).hexdigest() if len(raw) <= CAP_BYTES else None,
        )
    if len(raw) != expected:
        raise ValueError(f"ArchiveBot inventory expected {expected} bytes, got {len(raw)}")
    return raw


def inspect(item: str, filename: str, expected: int) -> None:
    raw = download(item, filename, expected)
    kinds: Counter[str] = Counter()
    html_count = 0
    matched = 0
    for record in ArchiveIterator(BytesIO(raw)):
        kinds[record.rec_type] += 1
        if record.rec_type != "response":
            continue
        url = record.rec_headers.get_header("WARC-Target-URI") or ""
        warc_date = record.rec_headers.get_header("WARC-Date")
        http = record.http_headers
        if http is None:
            continue
        content_type = http.get_header("Content-Type") or ""
        if not ("text/html" in content_type.lower() or url.endswith(".html")):
            continue
        entity = record.content_stream().read(HTML_CAP + 1)
        html_count += 1
        if len(entity) > HTML_CAP:
            emit(event="html_oversize", url=url, warc_date=warc_date, bytes_at_least=len(entity))
            continue
        digests = {
            "SHA-512": sha512(entity).hexdigest(),
            "SHA3-512": sha3_512(entity).hexdigest(),
            "BLAKE2b-512": blake2b(entity, digest_size=64).hexdigest(),
        }
        hits = [name for name, digest in digests.items() if digest == TARGET]
        matched += len(hits)
        text = entity.decode("utf-8", errors="replace")
        links_parser = LinkParser(url)
        links_parser.feed(text)
        emit(
            event="html_response",
            url=url,
            warc_date=warc_date,
            warc_payload_digest=record.rec_headers.get_header("WARC-Payload-Digest"),
            status=http.get_statuscode(),
            content_type=content_type,
            content_encoding=http.get_header("Content-Encoding"),
            transfer_encoding=http.get_header("Transfer-Encoding"),
            entity_bytes=len(entity),
            entity_sha256=sha256(entity).hexdigest(),
            digests_512=digests,
            p56_matches=hits,
            link_count=len(links_parser.links),
            links=links_parser.links[:50],
            contains_pgp=("BEGIN PGP" in text),
            contains_uRkNsGsa=("uRkNsGsa" in text),
            cicada_mentions=len(re.findall("cicada", text, flags=re.I)),
            text_excerpt=" ".join(text[:750].split()),
        )
    emit(event="archive_summary", item=item, filename=filename, record_types=dict(kinds),
         html_records=html_count, p56_matches=matched)


def main() -> None:
    emit(event="start", target_sha512_appearance=TARGET, archive_count=len(ARCHIVES))
    for archive in ARCHIVES:
        inspect(*archive)


if __name__ == "__main__":
    main()
