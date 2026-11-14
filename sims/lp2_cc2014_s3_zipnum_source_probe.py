"""Direct S3 ZipNum lookup for 2014 Common Crawl Tor2web source, issue #786."""
import bisect
import gzip
import hashlib
import json
import urllib.error
import urllib.request

from lp2_cc2014_tor2web_warc_probe import INDEXES, emit, inspect_warc

ROOT = "https://data.commoncrawl.org/cc-index/collections"
PREFIXES = (
    "org,wikipedia,www)/",
    "to,onion,ky2khlqdf7qdznac)/",
    "link,onion,ky2khlqdf7qdznac)/",
    "org,tor2web,ky2khlqdf7qdznac)/",
    "to,onion,",
    "link,onion,",
    "org,tor2web,",
)

def get(url, maximum=100_000_000, byte_range=None):
    headers = {"User-Agent": "LiberPrimus-2014-Crawl-ZipNum/1.0"}
    if byte_range:
        off, n = byte_range
        headers["Range"] = f"bytes={off}-{off+n-1}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            data = res.read(maximum + 1)
            expected = 206 if byte_range else 200
            if res.status != expected or len(data) > maximum:
                raise ValueError(f"status={res.status} bytes>{maximum}? {len(data)>maximum}")
            return data
    except (OSError, ValueError) as exc:
        emit("s3_failure", url=url, requested_range=byte_range, reason=str(exc))
        return None

def index_entries(raw):
    out = []
    for line in raw.decode("utf-8", "replace").splitlines():
        bits = line.split("\t")
        if len(bits) < 4:
            continue
        try:
            out.append((bits[0].split(" ", 1)[0], bits[1], int(bits[2]), int(bits[3])))
        except ValueError:
            continue
    if not out or any(a[0] > b[0] for a,b in zip(out, out[1:])):
        raise ValueError("cluster index absent or unsorted")
    return out

def candidate_blocks(keys, prefix):
    low = bisect.bisect_left(keys, prefix)
    high = bisect.bisect_left(keys, prefix + "\uffff")
    return list(range(max(0, low - 1), max(low, high)))

def cdx_rows(compressed):
    rows = []
    for line in gzip.decompress(compressed).splitlines():
        bits = line.split(b" ", 2)
        if len(bits) != 3:
            continue
        try:
            o = json.loads(bits[2])
        except ValueError:
            continue
        rows.append((bits[0].decode("utf-8", "replace"), bits[1].decode("ascii"), o))
    return rows

def main():
    test_keys = ["a)", "to,onion,a)/", "to,onion,z)/", "zzzz)"]
    assert candidate_blocks(test_keys, "to,onion,") == [0,1,2]
    assert candidate_blocks(test_keys, "to,onion,k)") == [1]
    emit("contract", indexes=INDEXES, prefixes=PREFIXES, max_blocks_per_prefix=30)
    for index in INDEXES:
        root = f"{ROOT}/{index}/indexes"
        raw = get(root + "/cluster.idx")
        if raw is None:
            emit("index_unavailable", index=index)
            continue
        try:
            entries = index_entries(raw)
        except ValueError as e:
            emit("index_invalid", index=index, reason=str(e), sample=raw[:250].decode("latin1"))
            continue
        keys = [r[0] for r in entries]
        emit("secondary_index", index=index, bytes=len(raw),
             sha256=hashlib.sha256(raw).hexdigest(), blocks=len(entries),
             first_key=keys[0], last_key=keys[-1])
        cache = {}
        for prefix in PREFIXES:
            spans = candidate_blocks(keys, prefix)
            if len(spans) > 30:
                emit("prefix_limited", index=index, prefix=prefix, total_blocks=len(spans))
            found = []
            successful = 0
            for i in spans[:30]:
                key, filename, offset, size = entries[i]
                identity = (filename, offset, size)
                if identity not in cache:
                    if not filename.startswith("cdx-") or not filename.endswith(".gz") or not (0 < size <= 2_000_000):
                        emit("bad_block", file=filename, offset=offset, size=size)
                        continue
                    comp = get(root + "/" + filename, size + 16, (offset, size))
                    if comp is None:
                        continue
                    try:
                        cache[identity] = cdx_rows(comp)
                    except (OSError, ValueError) as e:
                        emit("bad_block_gzip", index=index, file=filename, reason=str(e))
                        continue
                successful += 1
                for u, ts, rec in cache[identity]:
                    if u.startswith(prefix):
                        found.append((u, ts, rec))
            complete = successful == len(spans) and len(spans) <= 30
            emit("prefix_result", index=index, prefix=prefix, relevant_blocks=len(spans),
                 read_blocks=successful, matches=len(found), complete=complete)
            for u,ts,rec in found[:30]:
                emit("capture", index=index, urlkey=u, timestamp=ts,
                     record={k:rec.get(k) for k in ("url","mime","status","offset","length","filename","redirect")})
            if prefix == "org,wikipedia,www)/" and found:
                emit("positive_control", index=index, capture_time=found[0][1])
            for _,_,rec in found[:12]:
                url = (rec.get("url") or "").lower()
                if any(word in url for word in ("ky2khlqdf7qdznac","cicada","3301")):
                    if all(rec.get(k) for k in ("filename","offset","length")):
                        inspect_warc(index, rec)
        emit("collection_complete", index=index)
    emit("s3_probe_complete")

if __name__ == "__main__":
    main()
