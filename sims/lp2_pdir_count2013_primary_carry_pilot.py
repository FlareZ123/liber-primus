#!/usr/bin/env python3
"""Primary-2013 COUNT source-compatible directional pointer pilot.

The contemporaneous 7-Jan-2013 COUNT participant paste (AfndPJa0)
marks REVERSIBLE primes with '*' and ORDINARY primes with '+'. The later
reconstructed first-onion README reverses those suffix meanings. This pilot
freezes the primary participant-paste semantics, not the reconstruction. This pilot
tests the narrow causal interpretation: the most recent previous marked word
sets the next word's key-pointer direction; unmarked composites carry state.
It uses ciphertext-word GP sums (the solver-visible proxy), not plaintext
feedback. That distinction is explicit and remains unresolved.

Run after the pinned external kscreen export/signrules/dirrules setup:
  python sims/lp2_pdir_count2013_primary_carry_pilot.py external-cicada3301
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


RULE = "COUNT2013_primary_revprime_prev_carry"


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True


def reverse_decimal(n: int) -> int:
    return int(str(n)[::-1])


def marker(n: int) -> int:
    """+1 for ordinary prime, -1 for reversible prime, 0 for composite."""
    if not is_prime(n):
        return 0
    return -1 if is_prime(reverse_decimal(n)) else 1


def carry_directions(words: list[dict]) -> list[int]:
    """Direction used by each word; its predecessor's last marker is carried."""
    state = 1
    out = []
    for word in words:
        out.append(state)
        m = marker(int(word["G"]))
        if m:
            state = m
    return out


def p57_calibration(root: Path) -> dict:
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    transcript = (root / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
    rune_index = {r: i for i, r in enumerate(corpus["runes"])}
    start = transcript.rfind("ᛈᚪᚱᚪᛒᛚᛖ")
    if start < 0:
        raise AssertionError("p57 PARABLE marker not found")
    end = transcript.find("§", start)
    if end < 0:
        raise AssertionError("p57 page terminator not found")
    raw = transcript[start:end].replace("\r", "").replace("\n", "").replace("/", "")

    def rune_sum(s: str) -> int:
        return sum(corpus["prime"][rune_index[ch]] for ch in s if ch in rune_index)

    words = [w for w in __import__("re").split(r"[-.]", raw) if w]
    labels = ["".join(corpus["translit"][rune_index[ch]] for ch in w) for w in words]
    sums = [rune_sum(w) for w in words]
    statuses = [marker(g) for g in sums]
    clauses = [rune_sum(c) for c in raw.split(".") if c]

    token_values = sorted(
        zip(corpus["translit"], corpus["prime"]),
        key=lambda pair: len(pair[0]),
        reverse=True,
    )

    def phrase_sum(phrase: str) -> int:
        phrase = phrase.upper()
        pos = total = 0
        while pos < len(phrase):
            if phrase[pos].isspace():
                pos += 1
                continue
            found = next((pair for pair in token_values if phrase.startswith(pair[0], pos)), None)
            if found is None:
                raise AssertionError(f"Gematria token missing at {phrase[pos:]!r}")
            total += found[1]
            pos += len(found[0])
        return total

    by_label = dict(zip(labels, zip(sums, statuses)))
    if len(words) != 20 or sum(len(w) for w in words) != 95:
        raise AssertionError(f"p57 transcription changed: {len(words)} words / {sum(map(len, words))} runes")
    if by_label.get("PARABLE") != (449, 1):
        raise AssertionError(f"PARABLE source count mismatch: {by_label.get('PARABLE')}")
    if by_label.get("FIND") != (151, -1):
        raise AssertionError(f"FIND source count mismatch: {by_label.get('FIND')}")
    if clauses != [449, 1259, 1031, 1229]:
        raise AssertionError(f"p57 clause sums changed: {clauses}")
    if phrase_sum("THE INSTAR EMERGENCE") != 761 or marker(761) != -1:
        raise AssertionError("2013 original COUNT phrase 761* no longer matches GP table")

    state = 1
    schedule = []
    for g, m in zip(sums, statuses):
        schedule.append(state)
        if m:
            state = m
    return {
        "source_calibration_only": True,
        "2013_primary_paste_sha256": "f3f7e546e7e66710f75649b9638c2d7c9a75b26a83bed0aa46daf159c97dafcd", "2013_PASTE_MARKER": "*=reversible-prime; +=ordinary-prime (unsigned participant note)",
        "reconstruction_conflict": "Later reconstruction says 761+; recovered Jan-2013 original note says 761*." ,
        "p57_words": len(words),
        "p57_runes": sum(len(w) for w in words),
        "word_markers": [
            {"word": label, "G": g, "marker": "+" if m == 1 else ("*" if m == -1 else None)}
            for label, g, m in zip(labels, sums, statuses) if m
        ],
        "p57_clause_sums": clauses,
        "count_examples": {
            "PARABLE": {"G": 449, "reverse": 944, "marker": "+"},
            "THE INSTAR EMERGENCE": {"G": 761, "reverse": 167, "marker": "*"},
            "FIND": {"G": 151, "reverse": 151, "marker": "*"},
        },
        "p57_direction_schedule_first20": schedule,
        "interpretation": "first word uses +1; original 2013 paste + ordinary prime sets forward, * reversible prime sets backward; composite/no suffix carries state", 
        "caution": "The original 2013 note does not contain PARABLE or FIND as count inputs; their labels are predicted, not observed.",
        "source_status": "The p57 examples are inferred labels from the confirmed GP sums; neither p57 COUNT input appears in the primary 2013 paste.",
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("external_repo", type=Path)
    ap.add_argument("--conv", default="000")
    ap.add_argument("--windows", default="seg0.7,seg0.8")
    ap.add_argument("--streams", default="all")
    ap.add_argument("--null", type=int, default=6)
    ap.add_argument("--threads", type=int, default=4)
    ap.add_argument("--tag", default="agent29-count2013-primary-carry")
    args = ap.parse_args()

    root = Path(__file__).resolve().parents[1]
    external = args.external_repo.resolve()
    ks = external / "work/kscreen"
    sys.path.insert(0, str(ks))
    import signrules as R  # type: ignore

    tabs = R.section_tables()
    if len(tabs) != 8:
        raise AssertionError(f"expected eight original section windows, got {len(tabs)}")
    total_runes = sum(len(runes) for _, runes, _, _, _ in tabs)
    total_words = sum(len(words) for _, _, _, _, words in tabs)
    # The kscreen corpus intentionally screens its eight >=100-rune section windows;
    # it excludes 9 runes / 2 words present in the full manuscript transcription.
    if (total_runes, total_words) != (12947, 2894):
        raise AssertionError(f"kscreen section-window scope changed: {total_runes} runes / {total_words} words")

    out_dir = ks / "data/dirs"
    out_dir.mkdir(parents=True, exist_ok=True)
    rule_file = out_dir / f"{RULE}.txt"
    window_summary = []
    with rule_file.open("w", encoding="utf-8", newline="\n") as f:
        for head, runes, lengths, spans, words in tabs:
            dirs = carry_directions(words)
            if len(dirs) != len(words):
                raise AssertionError(f"{head}: word direction count mismatch")
            dline = R.sign_vector(lambda _words, w: dirs[w], words, spans, len(runes))
            if len(dline) != len(runes) or set(dline) - {-1, 1}:
                raise AssertionError(f"{head}: malformed D vector")
            f.write(f"{head}\nR {' '.join(map(str, runes))}\n{lengths}\nD {' '.join(map(str, dline))}\n")
            marker_counts = {"reversible_prime": 0, "ordinary_prime": 0, "composite": 0}
            for word in words:
                m = marker(int(word["G"]))
                marker_counts["reversible_prime" if m == -1 else ("ordinary_prime" if m == 1 else "composite")] += 1
            window_summary.append({
                "window": head,
                "runes": len(runes),
                "words": len(words),
                "markers": marker_counts,
                "forward_runes": sum(x == 1 for x in dline),
                "backward_runes": sum(x == -1 for x in dline),
            })

    calibration = p57_calibration(root)
    result = {
        "rule": RULE,
        "hypothesis": "previous printed ciphertext-word GP prime sum; original 2013 paste reversible-prime(*) sets -1, ordinary-prime(+) sets +1, composite carries; first word +1", 
        "scope": {"runes": total_runes, "words": total_words, "windows": len(tabs)},
        "p57_calibration": calibration,
        "windows": window_summary,
        "source_note": "Reversible-prime marker semantics derive from the original 2013 AfndPJa0 participant paste, not first-party signed code. +/− direction mapping, composite carry, first word orientation and ciphertext-word observability remain conjectural. The later reconstructed 761+ disagrees.",
    }
    result_dir = external / "results/kscreen"
    result_dir.mkdir(parents=True, exist_ok=True)
    calibration_path = result_dir / "agent29-count2013-primary-carry-calibration.json"
    calibration_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))

    cmd = [
        sys.executable, str(ks / "pdir_pilot.py"),
        "--conv", args.conv,
        "--windows", args.windows,
        "--streams", args.streams,
        "--rules", RULE,
        "--null", str(args.null),
        "--threads", str(args.threads),
        "--tag", args.tag,
    ]
    subprocess.run(cmd, cwd=ks, check=True)
    summary = external / "results/kscreen/pdir" / args.tag / args.conv / "summary_real_null.txt"
    if not summary.is_file():
        raise AssertionError(f"pdir pilot did not create summary: {summary}")
    print(summary.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
