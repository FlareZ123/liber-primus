"""Bounded cross-line scan for historical LP2 solver claims in byte-pinned IRC logs.

The prior screen required a page/LP2 anchor and a decryption verb on the same
line. This scan checks a small same-day/same-speaker context window for explicit
page references plus key/cipher/operation language, including shorthand p34.
It does not authenticate participants or promote chat to Cicada instructions.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from datetime import date
from urllib.request import Request, urlopen

FILES = (
    ("#33012014.freenode.log", 8629610, "a2880b1db31ce523599ef30ca2e55291bf295900"),
    ("#cicadasolvers.freenode.log", 18487233, "bdd277c14f94c34b5ae714cd00c238065beeed4e"),
    ("#cicadasolvers.freenode.2.log", 27234234, "72634a9d071d32af767edbffc0493d810e88cd0d"),
)
MONTHS = {m: i for i, m in enumerate(
    ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), 1
)}
DATE_RE = re.compile(rb"^(201[456]) ([A-Za-z]{3}) (\d{1,2}) (\d{2}:\d{2})")
NICK_RE = re.compile(rb"<([^>]+)>")
UNKNOWN_PAGE = re.compile(
    rb"\b(?:LP2|liber[\s_-]*primus|"
    rb"pp?\s*0\s*(?:-|\xe2\x80\x93)\s*55|"
    rb"(?:pages?|pg|p\.?)\s*[#:]?\s*(?:0\s*[-\xe2\x80\x93]\s*55|[0-4]?\d|5[0-5]))\b",
    re.IGNORECASE,
)
OPERATION = re.compile(
    rb"\b(?:key|keys|keyword|cipher|crypt(?:o)?|decrypt(?:ed|ing)?|"
    rb"decod(?:ed|ing)|decipher(?:ed|ing)?|plaintext|crib|shift|"
    rb"vigenere|beaufort|atbash|totient|prime|gematria|rune|runes|"
    rb"stream|offset|skip|transposition|playfair|substitution|"
    rb"algorithm|operation|method|password|passphrase|inverse|"
    rb"known[\s-]+text|word[\s-]+guess)\b",
    re.IGNORECASE,
)
FIRST_PERSON = re.compile(
    rb"\b(?:i|we|my|our)\b.{0,90}\b(?:solv(?:e|ed|ing)|decod(?:e|ed|ing)|"
    rb"decrypt(?:ed|ing)?|crack(?:ed|ing)?|found|used|tried|"
    rb"shift(?:ed)?|key|guess(?:ed|ing)?)\b",
    re.IGNORECASE,
)
EXPLICIT = re.compile(
    rb"\b(?:solved|decoded|decrypted|deciphered|cracked|plaintext|"
    rb"key\s*[:=]|shift\s*[:=]|key\s+(?:is|was|for)|"
    rb"the\s+key|my\s+key|our\s+key|known[\s-]+plaintext)\b",
    re.IGNORECASE,
)
URL_RE = re.compile(rb"(?:https?://|[a-z0-9-]+\.onion\b|pastebin\.com|gist\.github)", re.I)

SOURCE_WINDOWS = {
    "#cicadasolvers.freenode.log": (
        (170815, 170855), (185115, 185150), (187565, 187590),
        (190210, 190235), (212600, 212635), (213300, 213415),
        (217285, 217325), (237770, 237810),
    ),
    "#cicadasolvers.freenode.2.log": (
        (1760, 1790), (16260, 16295), (26160, 26195), (26630, 26670),
    ),
}
LINKS = (
    "http://sprunge.us/PBPT",
    "http://sprunge.us/DbXN",
    "http://sprunge.us/BbUK",
    "http://sprunge.us/LIWC",
    "http://sprunge.us/EMXR",
    "http://titanpad.com/vFCy7T5p0O",
    "http://titanpad.com/hJ8pVQ5S43",
    "https://web.archive.org/web/20160411191458id_/https://titanpad.com/vFCy7T5p0O",
    "http://pastebin.com/R01rN7ZX",
    "https://pastebin.com/raw/R01rN7ZX",
    "http://pastebin.com/vkshfVTu",
    "https://pastebin.com/raw/vkshfVTu",
    "http://pastebin.com/kcLZvZAA",
    "https://pastebin.com/raw/kcLZvZAA",
    "http://prntscr.com/3z2cyx",
    "https://prnt.sc/3z2cyx",
    "http://prntscr.com/4kacop",
    "https://prnt.sc/4kacop",
    "https://web.archive.org/cdx/search/cdx?url=titanpad.com%2FvFCy7T5p0O&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=pastebin.com%2FvkshfVTu&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=pastebin.com%2FR01rN7ZX&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=sprunge.us%2FDbXN&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=sprunge.us%2FBbUK&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=sprunge.us%2FPBPT&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=sprunge.us%2FLIWC&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=sprunge.us%2FEMXR&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=prntscr.com%2F3z2cyx&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=prntscr.com%2F4kacop&output=json&filter=statuscode%3A200&collapse=digest",
    "https://web.archive.org/cdx/search/cdx?url=forums.unfiction.com%2Fforums%2Fviewtopic.php%3Fp%3D1028647&output=json&filter=statuscode%3A200&collapse=digest",
)


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def metadata(line: bytes):
    m = DATE_RE.match(line)
    if not m:
        return None, None
    try:
        d = date(int(m.group(1)), MONTHS[m.group(2).decode("ascii")], int(m.group(3)))
    except (KeyError, ValueError):
        return None, None
    n = NICK_RE.search(line)
    nick = n.group(1).decode("utf-8", errors="replace") if n else None
    return d, nick


def scan_file(name: str, expected_size: int, expected_sha: str):
    url = (
        "https://raw.githubusercontent.com/neuroretransmit/cicada/main/"
        "irc-logs/" + name.replace("#", "%23")
    )
    request = Request(url, headers={"User-Agent": "LP2-historical-claim-context-scan"})
    with urlopen(request, timeout=120) as response:
        raw = response.read()
    actual_sha = git_blob_sha(raw)
    assert len(raw) == expected_size, (name, len(raw), expected_size)
    assert actual_sha == expected_sha, (name, actual_sha, expected_sha)

    lines = raw.splitlines()
    dates = []
    nicks = []
    for line in lines:
        d, nick = metadata(line)
        dates.append(d)
        nicks.append(nick)

    anchors = [i for i, line in enumerate(lines)
               if UNKNOWN_PAGE.search(line) and dates[i] is not None
               and dates[i] >= date(2014, 5, 2)]
    candidates = []
    seen = set()
    for i in anchors:
        day = dates[i]
        left, right = max(0, i - 4), min(len(lines), i + 5)
        op_positions = [
            j for j in range(left, right)
            if OPERATION.search(lines[j])
            and (dates[j] is None or dates[j] == day)
        ]
        if not op_positions:
            continue
        for j in op_positions:
            key = (i, j)
            if key in seen:
                continue
            seen.add(key)
            same_line = i == j
            same_nick = bool(nicks[i] and nicks[j] and nicks[i] == nicks[j])
            first_person = any(FIRST_PERSON.search(lines[k])
                               for k in range(left, right)
                               if dates[k] is None or dates[k] == day)
            explicit = any(EXPLICIT.search(lines[k])
                           for k in range(left, right)
                           if dates[k] is None or dates[k] == day)
            has_url = any(URL_RE.search(lines[k])
                          for k in range(left, right)
                          if dates[k] is None or dates[k] == day)
            score = (6 if same_line else 3) + (2 if same_nick else 0)
            score += 2 * first_person + 2 * explicit + 1 * has_url
            candidates.append({
                "score": score,
                "anchor_line": i + 1,
                "operation_line": j + 1,
                "date": day.isoformat(),
                "anchor_nick": nicks[i],
                "operation_nick": nicks[j],
                "same_line": same_line,
                "same_nick": same_nick,
                "first_person_in_window": first_person,
                "explicit_claim_in_window": explicit,
                "url_in_window": has_url,
                "context": [
                    {"line": k + 1,
                     "text": lines[k].decode("utf-8", errors="replace")[:700]}
                    for k in range(max(0, min(i, j) - 3),
                                   min(len(lines), max(i, j) + 4))
                ],
            })

    candidates.sort(key=lambda x: (-x["score"], x["anchor_line"], x["operation_line"]))
    day_counts = Counter(d.isoformat() for d in dates if d and d >= date(2014, 5, 2))
    targeted_contexts = []
    for start, end in SOURCE_WINDOWS.get(name, ()):
        targeted_contexts.append({
            "requested_lines": [start, end],
            "lines": [
                {"line": k + 1, "text": lines[k].decode("utf-8", errors="replace")[:1000]}
                for k in range(max(0, start - 1), min(len(lines), end))
            ],
        })
    return {
        "archive": name,
        "bytes": len(raw),
        "lines": len(lines),
        "git_blob_sha1": actual_sha,
        "post_release_dated_lines": sum(day_counts.values()),
        "post_release_days": len(day_counts),
        "unknown_page_anchor_lines": len(anchors),
        "candidate_pairs": len(candidates),
        "top_candidates": candidates[:160],
        "targeted_contexts": targeted_contexts,
    }


def fetch_link(url: str):
    request = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; LP2 historical source audit)",
        "Accept": "text/plain,text/html,application/json,*/*",
    })
    try:
        with urlopen(request, timeout=25) as response:
            body = response.read(250000)
            return {
                "url": url, "status": response.status,
                "final_url": response.geturl(),
                "content_type": response.headers.get("Content-Type"),
                "bytes_read": len(body), "sha256": hashlib.sha256(body).hexdigest(),
                "body": body.decode("utf-8", errors="replace")[:25000],
            }
    except Exception as exc:
        return {"url": url, "error": f"{type(exc).__name__}: {exc}"}


def main():
    results = [scan_file(*item) for item in FILES]
    linked_materials = [fetch_link(url) for url in LINKS]
    report = {
        "scope": "2014-05-02 onward in three pinned IRC Git blobs",
        "method": (
            "Unknown LP2/page 0-55 anchor plus key/cipher/operation vocabulary "
            "within +/-4 source lines on the same date; shorthand pNN included. "
            "Participant statements are not Cicada-authenticated."
        ),
        "archives": results,
        "linked_materials": linked_materials,
        "total_candidate_pairs": sum(x["candidate_pairs"] for x in results),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
