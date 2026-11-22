"""Bounded original-HTTP archival check for Director issue #948.

Downloads exactly the two 2017 ArchiveBot WARC archives indexed in
JustAnotherArchivist/archivebot-archives. Prints source dates, WARC object
identity, decoded HTTP entity bytes, checksums and hrefs. Other files/hosts
are deliberately outside scope. Uses warcio's documented decoding behavior.
Run: python sims/lp2_p56_2017_archivebot_warc_http_sft.py
"""
from __future__ import annotations

from collections import Counter
from hashlib import blake2b, sha1, sha256, sha512, sha3_512
from base64 import b32encode
from html.parser import HTMLParser
from io import BytesIO
import json
import re
import urllib.request
import urllib.error
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
        attr = "href" if tag in {"a", "link"} else "src" if tag in {"script", "img", "source", "audio", "video", "iframe"} else None
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


def probe_http_metadata(item: str) -> None:
    """Inspect the exact item's public availability without treating it as WARC bytes."""
    url = f"https://archive.org/metadata/{item}"
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            doc = json.loads(resp.read(256 * 1024))
        names = [entry.get("name") for entry in doc.get("files", [])]
        emit(event="item_metadata", item=item, available=True,
             is_dark=doc.get("is_dark"), is_restricted=doc.get("is_restricted"),
             metadata_access=doc.get("metadata", {}).get("access-restricted-item"),
             archive_file_names=[name for name in names if name and name.endswith(".warc.gz")],
             server=doc.get("server"), d1=doc.get("d1"), d2=doc.get("d2"))
    except (OSError, ValueError, urllib.error.HTTPError) as error:
        emit(event="item_metadata", item=item, error=f"{type(error).__name__}: {error}")


def probe_exact_wayback() -> None:
    """Two pinned public CDX observations, distinguish replay from original WARC entity."""
    captures = (
        ("20170629043935", "http://1711141131131.xyz/",
         "GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV", 4521),
        ("20170616042751", "http://www.1711141131131.xyz:80/092317.html",
         "7YVF4J7SVN5YO4VRCDYQG52ACLAP7V2O", 680),
    )
    for timestamp, url, cdx_sha1_base32, cdx_record_length in captures:
        replay = f"https://web.archive.org/web/{timestamp}id_/{url}"
        req = urllib.request.Request(replay, headers={"User-Agent": "LiberPrimusSourceReader/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                body = response.read(HTML_CAP + 1)
                final_url = response.url
                content_type = response.headers.get("Content-Type")
                memento = response.headers.get("Memento-Datetime")
            if len(body) > HTML_CAP:
                emit(event="wayback_oversize", source=replay)
                continue
            text = body.decode("utf-8", errors="replace")
            parser = LinkParser(url)
            parser.feed(text)
            sha1_base32 = b32encode(sha1(body).digest()).decode("ascii").rstrip("=")
            emit(event="wayback_replay", source=replay, final_url=final_url,
                 cdx_sha1_base32=cdx_sha1_base32,
                 replay_sha1_base32=sha1_base32,
                 index_payload_digest_matches=sha1_base32 == cdx_sha1_base32,
                 cdx_record_length=cdx_record_length,
                 content_type=content_type, memento_datetime=memento,
                 replay_bytes=len(body), sha256=sha256(body).hexdigest(),
                 sha512=sha512(body).hexdigest(), p56_sha512_match=sha512(body).hexdigest() == TARGET,
                 links=parser.links[:40],
                 signed_pgp_start_count=text.count("-----BEGIN PGP"),
                 onion_literal_count=len(re.findall(r"[a-z2-7]{16,56}\\.onion", text, re.I)),
                 contains_uRkNsGsa="uRkNsGsa" in text,
                 contains_3301="3301" in text,
                 contains_deepweb_hash=TARGET in text,
                 contains_pgp="BEGIN PGP" in text,
                 contains_cicada=bool(re.search("cicada", text, re.I)),
                 text_excerpt=" ".join(text[:800].split()),
                 source_boundary="Wayback replay, not original raw WARC bytes")
        except (OSError, urllib.error.HTTPError) as error:
            emit(event="wayback_replay_unavailable", source=replay,
                 error=f"{type(error).__name__}: {error}")


def main() -> None:
    emit(event="start", target_sha512_appearance=TARGET, archive_count=len(ARCHIVES))
    for archive in ARCHIVES:
        try:
            inspect(*archive)
        except (OSError, urllib.error.HTTPError, ValueError) as error:
            emit(event="archive_unavailable", item=archive[0], filename=archive[1],
                 error=f"{type(error).__name__}: {error}")
            probe_http_metadata(archive[0])
    probe_exact_wayback()


if __name__ == "__main__":
    main()
