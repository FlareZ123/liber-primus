"""Bounded 2014 Common Crawl Tor2web WARC source acquisition, issue #786.

Prints reproducible CDX URLs/records and hashes. A negative requires working
same-collection positive controls. No full-crawl or broad domain download.
"""
import gzip
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request

INDEXES = ("CC-MAIN-2014-23", "CC-MAIN-2014-35")
DISTRIBUTOR = "ky2khlqdf7qdznac"
PATTERNS = (
    f"{DISTRIBUTOR}.onion.to/*",
    f"{DISTRIBUTOR}.onion.link/*",
    f"{DISTRIBUTOR}.tor2web.org/*",
    "*.onion.to",
    "*.onion.link",
)
CONTROLS = ("www.wikipedia.org/", "www.google.com/", "www.bbc.co.uk/", "example.com/")
P56_SHA512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
INDEX_ORIGIN = "https://index.commoncrawl.org"
USER_AGENT = "LiberPrimus-2014-WARC-source-test/1.0 (public archive; bounded queries)"

def emit(event, **values):
    print(json.dumps(dict(event=event, **values), sort_keys=True), flush=True)

def fetch(url, headers=None, max_bytes=200000, timeout=22):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                data = response.read(max_bytes + 1)
                if len(data) > max_bytes:
                    raise ValueError(f"response exceeds {max_bytes} bytes")
                return response.status, data, dict(response.headers)
        except urllib.error.HTTPError as err:
            body = err.read(256).decode("utf-8", "replace")
            if err.code == 404:
                return 404, body.encode(), {}
            emit("http_error", url=url, status=err.code, message=body)
            if err.code not in (429, 500, 502, 503, 504) or attempt:
                return err.code, b"", {}
        except (TimeoutError, OSError, ValueError) as err:
            emit("transport_error", url=url, reason=str(err), attempt=attempt + 1)
            if attempt:
                return 0, b"", {}
        time.sleep(2)
    return 0, b"", {}

def cdx(index, pattern, limit=80):
    params = urllib.parse.urlencode({"url": pattern, "output": "json", "limit": limit})
    url = f"{INDEX_ORIGIN}/{index}-index?{params}"
    status, raw, _ = fetch(url)
    entries = []
    if status == 200:
        try:
            entries = [json.loads(line) for line in raw.splitlines() if line.strip()]
        except (ValueError, UnicodeDecodeError) as err:
            emit("invalid_cdx", index=index, query=pattern, url=url, error=str(err))
            return False, []
    elif status != 404:
        emit("unavailable_cdx", index=index, query=pattern, url=url, status=status)
        return False, []
    emit("cdx", index=index, query=pattern, url=url, status=status, count=len(entries))
    return True, entries

def inspect_warc(index, record):
    filename = record.get("filename", "")
    if not filename.startswith("crawl-data/" + index + "/") or not filename.endswith(".warc.gz"):
        emit("skip_bad_path", filename=filename)
        return
    offset, length = int(record["offset"]), int(record["length"])
    if not (0 <= offset and 0 < length <= 2_000_000):
        emit("skip_size", length=length)
        return
    url = "https://data.commoncrawl.org/" + filename
    status, compressed, headers = fetch(url, {"Range": f"bytes={offset}-{offset + length - 1}"}, 2_000_000, 30)
    if status != 206:
        emit("warc_unavailable", url=url, offset=offset, length=length, status=status)
        return
    emit("warc_range", index=index, capture_url=record.get("url"), timestamp=record.get("timestamp"),
         path=filename, offset=offset, length=length, compressed_sha256=hashlib.sha256(compressed).hexdigest())
    try:
        record_bytes = gzip.decompress(compressed)
        warc_headers, marker, http_block = record_bytes.partition(b"\r\n\r\n")
        if not marker:
            raise ValueError("no WARC header boundary")
        http_headers, marker, body = http_block.partition(b"\r\n\r\n")
        if not marker:
            raise ValueError("no HTTP header boundary")
        sha512 = hashlib.sha512(body).hexdigest()
        clues = sorted(set(x.decode("ascii", "replace") for x in re.findall(
            rb"[a-z0-9]{16,56}\.onion(?:\.(?:to|link))?|[a-z0-9]{16,56}\.tor2web\.org",
            body.lower())))[:30]
        emit("warc_body", capture_url=record.get("url"), record_sha256=hashlib.sha256(record_bytes).hexdigest(),
             body_len=len(body), body_sha512=sha512, p56_exact_sha512_match=(sha512 == P56_SHA512),
             onion_hosts=clues, original_http_header=http_headers[:350].decode("latin1"))
        for word in (b"cicada", b"liber primus", b"36367763", b"3301"):
            match = re.search(re.escape(word), body.lower())
            if match:
                emit("body_clue", capture_url=record.get("url"), word=word.decode(),
                     context=body[max(0, match.start() - 90):match.end() + 120].decode("latin1", "replace"))
    except (OSError, ValueError) as err:
        emit("warc_parse_error", capture_url=record.get("url"), error=str(err))

def main():
    emit("contract", indexes=INDEXES, controls=CONTROLS, patterns=PATTERNS,
         sha512=P56_SHA512, method="CDX JSON limit<=80; WARC HTTP Range <=2MB")
    for index in INDEXES:
        positive = False
        for control in CONTROLS:
            ok, recs = cdx(index, control, 3)
            if ok and recs:
                emit("positive", index=index, control=control, url=recs[0].get("url"),
                     timestamp=recs[0].get("timestamp"))
                positive = True
                break
        if not positive:
            emit("index_not_positively_controlled", index=index)
            continue
        fetched = set()
        for pattern in PATTERNS:
            ok, recs = cdx(index, pattern, 80 if pattern.startswith("*.") else 40)
            if not ok:
                continue
            for rec in recs:
                emit("candidate", index=index, pattern=pattern, record={
                    k: rec.get(k) for k in ("url", "timestamp", "status", "mime", "filename", "offset", "length", "redirect")
                })
                link = rec.get("url", "").lower()
                relevant = (DISTRIBUTOR in link or "cicada" in link or "3301" in link or "liber" in link)
                record_id = (rec.get("filename"), rec.get("offset"))
                if relevant and len(fetched) < 6 and record_id not in fetched:
                    fetched.add(record_id)
                    inspect_warc(index, rec)
        emit("collection_complete", index=index, inspected_warc=len(fetched))
    emit("probe_complete")

if __name__ == "__main__":
    main()
