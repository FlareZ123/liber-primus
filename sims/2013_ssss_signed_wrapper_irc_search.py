"""Targeted archived 2013 IRC search for the four missing signed SSSS wrappers."""
import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

COMMIT = "b13600373d3400d75ec4208198019f3d92a304dd"
URL = f"https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/{COMMIT}/irc-logs/%2333012013.freenode.log"
BLOB = "f81e20129fb6dff69e0f614746089b8c6cbc8130"
SHARES = {
    "02": "41cc481a51fe77f91600f593c1db2ce9babd2626ea6e",
    "03": "7678a5f6b72042d839151b34b02ffe161cf997fed484",
    "05": "fcd82965b6632ea25d80edc3e58baafb4b2938895cbd",
    "07": "f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa",
    "08": "b970e507dbc4ac115a273126f62671654c480fce32e5",
    "09": "82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750",
    "10": "1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d",
}
HOSTS = {
    "02": "y2wyuvrqraowagc5.onion",
    "05": "qw7mhchzvuq6f2mf.onion",
    "07": "4l6uipnstbggwjyv.onion",
    "08": "erwfcsdvx6pm2rsk.onion",
}
RELATED = re.compile(r"PGP|signature|Hash: SHA|Threshold|ssss|Good luck|pastebin|anonpaste|https?://|\.onion", re.I)

def main():
    with urlopen(Request(URL, headers={"User-Agent": "liber-primus-research/1.0"}), timeout=90) as response:
        raw = response.read()
    assert hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest() == BLOB
    lines = raw.decode("latin-1").splitlines()
    lower = [line.lower() for line in lines]
    result = {"source": URL, "blob": BLOB, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "lines": len(lines), "shares": {}, "hosts": {}}
    for category, needles in (("shares", SHARES), ("hosts", HOSTS)):
        for label, needle in needles.items():
            hits = [i for i, line in enumerate(lower) if needle in line]
            contexts = []
            for i in hits:
                window = range(max(0, i-25), min(len(lines), i+26))
                contexts.append({"line": i+1, "text": lines[i], "related": [{"line": j+1, "text": lines[j]} for j in window if j != i and RELATED.search(lines[j])]})
            result[category][label] = {"needle": needle, "count": len(hits), "hits": contexts}
    out = Path("im-results/2013-ssss-signed-wrapper-irc-search.json")
    out.write_text(json.dumps(result, indent=2, ensure_ascii=True)+"\n", encoding="utf-8")
    print(json.dumps({"bytes": len(raw), "lines": len(lines), "counts": {k: {label: v["count"] for label,v in result[k].items()} for k in ("shares","hosts")}}))
    for label, item in result["shares"].items():
        for h in item["hits"][:8]:
            print(json.dumps({"share": label, **h}, ensure_ascii=True))

if __name__ == "__main__":
    main()
