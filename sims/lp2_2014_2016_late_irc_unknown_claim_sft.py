"""Original 2014-16 IRC: isolate later unknown-LP2 plaintext/decoder claims.

One-file source-locked retrieval and bounded line-context extractor. The raw
27,234,234-byte IRC file is never stored or redistributed. It checks Git's
original blob SHA1 before interpreting historical participant statements.
"""
from __future__ import annotations

import hashlib
import json
import re
from urllib.request import Request, urlopen

URL = (
    "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/"
    "main/irc-logs/%23cicadasolvers.freenode.2.log"
)
SIZE = 27_234_234
BLOB = "72634a9d071d32af767edbffc0493d810e88cd0d"

DATE = re.compile(r"^201(?:4 (?:Sep|Oct|Nov|Dec)|5 |6 )", re.I)
TARGET = re.compile(
    r"\b(?:liber\s*primus|LP2|"
    r"(?:page|pg|pg\.|p\.)\s*#?\s*(?:[0-4]?\d|5[0-5])\b|"
    r"page\s+zero|the\s+(?:runes|book|ciphertext))\b", re.I
)
SOLVE = re.compile(
    r"\b(?:solved?|solving|decrypt(?:ed|ing|ion)?|decipher(?:ed|ing)?|"
    r"crack(?:ed|ing)?|decoded?|translat(?:ed|ing|ion)|plaintext|"
    r"(?:the|my|a|our)\s+key|"
    r"found\s+(?:the|a)\s+(?:key|text|solution)|"
    r"it\s+(?:says|reads|means)|"
    r"recovered\s+(?:the|some)\s+text)\b", re.I
)
CLAIM_DIRECT = re.compile(
    r"\b(?:i|we|someone|they|he|she|it)\s+(?:have\s+|had\s+)?"
    r"(?:solved?|deciphered|cracked|decoded|decrypted|translated)\b|"
    r"\b(?:plaintext|solution|answer)\s*(?:is|was|:|=)", re.I
)
SOURCE = re.compile(r"https?://[^\s<>]+|pastebin|gist|github|titanpad", re.I)
QUOTE = re.compile(r'["\'](?:[a-z]+[ \t]+){3,15}[a-z]+["\']', re.I)
RUNIC = re.compile(r"[ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ]{10,}")
NUMBER = re.compile(r"\b(?:page|pg|p\.)\s*#?\s*(\d{1,2})\b", re.I)
EXCLUDE = re.compile(
    r"\b(?:page|pg|p\.)\s*#?\s*(?:56|57|58)\b|"
    r"\ban\s+end\s*:\s*within\b", re.I
)


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(
        b"blob " + str(len(data)).encode() + b"\0" + data
    ).hexdigest()


def compact(line: str, max_len: int = 390) -> str:
    return line[:max_len]


def main() -> None:
    with urlopen(Request(URL, headers={"User-Agent": "liber-primus-source-scan"}), timeout=120) as h:
        data = h.read()
    assert len(data) == SIZE, (len(data), SIZE)
    assert blob_sha(data) == BLOB
    lines = data.decode("latin1").splitlines()
    years = {"2014": 0, "2015": 0, "2016": 0}
    matches = []
    direct = []
    rune_mentions = []
    for i, line in enumerate(lines):
        if not DATE.search(line):
            continue
        years[line[:4]] += 1
        if EXCLUDE.search(line):
            continue
        target = TARGET.search(line)
        solve = SOLVE.search(line)
        quote = QUOTE.search(line)
        runes = RUNIC.search(line)
        if runes:
            rune_mentions.append({"line": i + 1, "text": compact(line)})
        if not (target and solve):
            continue
        score = (
            8 * bool(CLAIM_DIRECT.search(line))
            + 5 * bool(QUOTE.search(line))
            + 3 * bool(SOURCE.search(line))
            + 2 * bool(NUMBER.search(line))
            + min(2, int(bool(runes)))
        )
        item = {"line": i + 1, "score": score, "text": compact(line)}
        matches.append(item)
        if score >= 8:
            direct.append(item)
    # Independently source-dated period code links, rather than another
    # unknown-key sweep. Require a code/document hosting URL and LP2 context.
    archive_links = []
    link_pat = re.compile(
        r"https?://(?:www\.)?"
        r"(?:github\.com|gist\.github\.com|bitbucket\.org|"
        r"gitlab\.com|pastebin\.com|sprunge\.us|titanpad\.com|"
        r"dpaste\.de|hastebin\.com)/[^\s<>]+", re.I
    )
    lp_context = re.compile(
        r"\b(?:liber\s*primus|rune(?:s|aylze)?|decrypt|"
        r"decipher|vigenere|cipher|code|script|python|solver|"
        r"cryptanalysis|gematria)\b", re.I
    )
    for i, line in enumerate(lines):
        if not DATE.search(line):
            continue
        links = [m.group().strip(".,)]}") for m in link_pat.finditer(line)]
        if not links:
            continue
        nearby = " ".join(lines[max(0, i-2):min(len(lines), i+3)])
        if not lp_context.search(nearby):
            continue
        for url in links:
            if re.search(r"/(?:issues|pull|search|wiki)/", url, re.I):
                continue
            score = (
                5 * bool(re.search(r"rune|primus|cicada|crypt", url, re.I))
                + 3 * bool(re.search(r"solver|decrypt|vigenere|code|source|script", line, re.I))
                + 2 * bool(re.search(r"github|gist|pastebin|sprunge", url, re.I))
                + 1 * bool(re.search(r"liber\s*primus", nearby, re.I))
            )
            archive_links.append({
                "line": i+1, "url": url, "score": score,
                "text": compact(line, 320)
            })
    dedup = {}
    for item in sorted(archive_links, key=lambda x: (-x["score"], x["line"])):
        dedup.setdefault(item["url"], item)
    unique_archive_links = list(dedup.values())
    matches.sort(key=lambda x: (-x["score"], x["line"]))
    direct.sort(key=lambda x: (-x["score"], x["line"]))

    def with_context(item: dict, radius: int = 2) -> dict:
        center = item["line"] - 1
        return {
            **item,
            "context": [
                {"line": j + 1, "text": compact(lines[j], 350)}
                for j in range(max(0, center - radius), min(len(lines), center + radius + 1))
            ],
        }

    print("LATE_IRC_JSON_BEGIN")
    print(json.dumps({
        "source": URL,
        "size": len(data),
        "blob": BLOB,
        "year_counts": years,
        "total_physical_lines": len(lines),
        "target_verb_candidate_count": len(matches),
        "direct_claim_candidate_count": len(direct),
        "rune_string_mentions": len(rune_mentions),
        "highest_score": [with_context(x) for x in matches[:25]],
        "direct_sample": [with_context(x, 1) for x in direct[:25]],
        "rune_sample": rune_mentions[:20],
        "relevant_archive_link_count": len(archive_links),
        "unique_relevant_links": len(unique_archive_links),
        "source_code_link_sample": unique_archive_links[:70],
        "specific_historical_contexts": [
            {
                "center": center,
                "lines": [
                    {"line": j + 1, "text": compact(lines[j], 520)}
                    for j in range(
                        max(0, center - 1 - 13),
                        min(len(lines), center + 13)
                    )
                ],
            }
            for center in (149655, 230833, 265003, 285354)
        ],
    }, ensure_ascii=False, indent=2))
    print("LATE_IRC_JSON_END")


if __name__ == "__main__":
    main()
