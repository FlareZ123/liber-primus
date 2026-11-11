"""Fetch and inspect three pinned multi-MB historical IRC Git blobs.

This checks the source Git blob hashes before reading text and prints only
targeted match counts and bounded line contexts. It never guesses a hash
preimage or treats participant chat as an authenticated Cicada statement.
"""
from __future__ import annotations

import hashlib
import json
import re
from urllib.request import Request, urlopen

FILES = (
    ("#33012014.freenode.log", 8629610, "a2880b1db31ce523599ef30ca2e55291bf295900"),
    ("#cicadasolvers.freenode.log", 18487233, "bdd277c14f94c34b5ae714cd00c238065beeed4e"),
    ("#cicadasolvers.freenode.2.log", 27234234, "72634a9d071d32af767edbffc0493d810e88cd0d"),
)

# Exact missing object first; broader terms only give historical context.
TARGETS = {
    "specific_2016_html": rb"uRkNsGsa(?:\.htm)?",
    "specific_filename_stem": rb"uRkNs",
    "known_2016_key_fingerprint": rb"7A35090F",
    "an_end_phrase": rb"\bAN[\s_\-]+END\b",
    "sha512_word": rb"SHA[\s_\-]*512",
    "liber_primus": rb"\bLIBER[\s_\-]+PRIMUS\b",
    "2016_reference": rb"\b2016\b",
    "full_128_hex": rb"(?<![a-f0-9])[a-f0-9]{128}(?![a-f0-9])",
}

def git_blob_sha(data: bytes) -> str:
    """Return Git's object SHA-1 for raw byte-exact blob content."""
    prefix = b"blob " + str(len(data)).encode("ascii") + b"\x00"
    return hashlib.sha1(prefix + data).hexdigest()


def scan() -> None:
    """Print one compact audited JSON summary for all three raw objects."""
    all_results = []
    for name, expected_size, expected_sha in FILES:
        url = (
            "https://raw.githubusercontent.com/neuroretransmit/cicada/main/"
            "irc-logs/" + name.replace("#", "%23")
        )
        req = Request(url, headers={"User-Agent": "liber-primus-historical-source-audit"})
        with urlopen(req, timeout=120) as response:
            data = response.read()

        actual_sha = git_blob_sha(data)
        assert len(data) == expected_size, (name, len(data), expected_size)
        assert actual_sha == expected_sha, (name, actual_sha, expected_sha)
        lines = data.splitlines()
        matches = {}
        for key, pattern in TARGETS.items():
            compiled = re.compile(pattern, re.IGNORECASE)
            hit_positions = [
                index for index, line in enumerate(lines)
                if compiled.search(line)
            ]
            matches[key] = {
                "count": len(hit_positions),
                "sample": [
                    {"line": i + 1,
                     "text": lines[i].decode("utf-8", errors="replace")[:380],
                     "context": [
                         {"line": j + 1,
                          "text": lines[j].decode("utf-8", errors="replace")[:380]}
                         for j in range(max(0, i - 12), min(len(lines), i + 13))
                     ] if key.startswith("specific") else []}
                    for i in hit_positions[:(100 if key.startswith("specific") else 12)]
                ],
            }
        # New independently bounded original-page plaintext claim screen.
        # It does not authenticate a speaker: only surfaces concrete dated
        # statements with both a target and an explicit solution verb.
        target = re.compile(
            rb"\b(?:liber[\s_\-]*primus|LP2|(?:page|pg|p\.)[\s#]*"
            rb"(?:[0-4]?[0-9]|5[0-5])\b)\b", re.IGNORECASE
        )
        claim = re.compile(
            rb"\b(?:solved?|solving|decrypted?|decrypting|decoded?|decoding|"
            rb"deciphered?|translated?|translating|cracked?|cracking|plaintext|"
            rb"key(?:s|word)?[\s:=-]+(?:is|was|for))\b", re.IGNORECASE
        )
        discoveries = []
        for i, line in enumerate(lines):
            if not re.match(rb"^201[456] ", line):
                continue
            objects = list(target.finditer(line))
            verbs = list(claim.finditer(line))
            if not objects or not verbs:
                continue
            gap = min(abs(o.start() - v.start()) for o in objects for v in verbs)
            if gap > 150:
                continue
            # Priority is explicit recovery language, not page count.
            is_first_person = bool(re.search(
                rb"\b(?:i|we|someone)[\s\w]{0,35}\b"
                rb"(?:solved|decrypted|decoded|deciphered|cracked)\b",
                line, re.IGNORECASE
            ))
            score = 4 * is_first_person + (3 if re.search(
                rb"\b(?:plaintext|key(?:word)?[\s:=-]+(?:is|was))\b",
                line, re.IGNORECASE
            ) else 0) + (2 if re.search(
                rb"\b(?:http|onion|pastebin|github|gist)\b",
                line, re.IGNORECASE
            ) else 0) + (1 if gap <= 70 else 0)
            discoveries.append({
                "line": i + 1, "score": score, "gap": gap,
                "text": line.decode("utf-8", errors="replace")[:500]
            })
        discoveries.sort(key=lambda hit: (-hit["score"], hit["line"]))
        specific_solve_claims = {
            "candidate_count": len(discoveries),
            "top": discoveries[:35],
            "source_earliest": sorted(discoveries, key=lambda hit: hit["line"])[:15]
        }
        # Frozen original IRC discussion targets surfaced by the first,
        # predeclared lexical screen. Preserve full local context to separate
        # authentic source statements from guesses, jokes, and fake sources.
        clue_context_lines = {
            "#cicadasolvers.freenode.log": [188780, 204070, 216041],
            "#cicadasolvers.freenode.2.log": [
                87383, 230620, 264788, 285137, 307709
            ]
        }.get(name, [])
        clue_contexts = [
            {"center": at,
             "lines": [
                 {"line": j + 1, "text": lines[j].decode(
                     "utf-8", errors="replace")[:480]}
                 for j in range(max(0, at - 16), min(len(lines), at + 25))
             ]}
            for at in clue_context_lines
        ]
        all_results.append({
            "archive": name, "size_bytes": len(data), "git_blob_sha1": actual_sha,
            "lp2_solution_claim_screen": specific_solve_claims,
            "lp2_claim_contexts": clue_contexts,
            "line_count": len(lines), "matches": matches,
            "first_line": lines[0][:150].decode("utf-8", errors="replace"),
            "last_line": lines[-1][:150].decode("utf-8", errors="replace"),
        })
        print(
            f"VERIFIED {name}: {len(data)} bytes, {len(lines)} lines, "
            + ", ".join(f"{k}={v['count']}" for k, v in matches.items()),
            flush=True,
        )

    print("SOURCE_AUDIT_JSON_BEGIN", flush=True)
    print(json.dumps(all_results, ensure_ascii=False, indent=2), flush=True)
    print("SOURCE_AUDIT_JSON_END", flush=True)


if __name__ == "__main__":
    scan()
