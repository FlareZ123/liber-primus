#!/usr/bin/env python3
"""Test original LP2 against MT19937 streams seeded by each numeric-grid column.

Explicit candidate: each of 8 columns of the 32x8 base60 table is a 256-bit
integer seed for Python 3's MT19937 Random; each of 8 text groups starts a
fresh stream. Unknown column assignment is optimized exactly (8! dynamic
programming). This tests a *specific* seed interpretation, not arbitrary
MT19937 use. Print real-data and independently constructed planted controls.
No output files are written.
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOD = 29
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
TRANSLIT = (
    "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
    "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
    "A", "AE", "Y", "IA", "EA",
)
assert len(RUNES) == len(TRANSLIT) == MOD
TO_RUNE = {ch: i for i, ch in enumerate(RUNES)}
TEXT_NAMES = sorted(((name, i) for i, name in enumerate(TRANSLIT)), key=lambda x: -len(x[0]))


def ciphertext_groups() -> list[list[int]]:
    text = (ROOT / "resources" / "lp2-transcription.txt").read_text(encoding="utf-8")
    # 55 rune-bearing unsolved pages, excluding both known solved pages.
    text = "\n%\n".join(text.split("\n%\n")[:55])
    sections = [[TO_RUNE[c] for c in part if c in TO_RUNE]
                for part in text.split("$")]
    sections = [a for a in sections if a]
    # Preserve the eight literal nonempty '    assert list(map(len, sections)) == [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]
    assert sum(map(len, sections)) == 12956
    return sections


def grid_columns() -> list[bytes]:
    table = json.loads((ROOT / "resources" / "liber-primus" /
                        "base60-grid.json").read_text(encoding="utf-8"))
    rows = table["byte_rows"]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    return [bytes(row[col] for row in rows) for col in range(8)]


def pad(seed: bytes, endian: str, generator: str, length: int) -> list[int]:
    mt = random.Random(int.from_bytes(seed, endian))
    if generator == "randrange":
        return [mt.randrange(MOD) for _ in range(length)]
    if generator == "float":
        return [int(mt.random() * MOD) for _ in range(length)]
    if generator == "uint32":
        return [mt.getrandbits(32) % MOD for _ in range(length)]
    raise ValueError(generator)


def ioc(values: list[int]) -> float:
    freq = [0] * MOD
    for c in values:
        freq[c] += 1
    n = len(values)
    return sum(f * (f - 1) for f in freq) / (n * (n - 1))


def decode(cipher: list[int], key: list[int], sign: int) -> list[int]:
    assert len(cipher) == len(key)
    return [(c + sign * k) % MOD for c, k in zip(cipher, key)]


def optimum_assignment(scores: list[list[float]]) -> tuple[float, list[int]]:
    """Exact maximum-weight matching of eight seed columns to eight groups."""
    best = [-1e100] * 256
    paths: list[tuple[int, ...]] = [()] * 256
    best[0] = 0.0
    for mask in range(1, 256):
        row = mask.bit_count() - 1
        for col in range(8):
            bit = 1 << col
            if not mask & bit:
                continue
            prev = mask ^ bit
            candidate = best[prev] + scores[row][col]
            if candidate > best[mask]:
                best[mask] = candidate
                paths[mask] = paths[prev] + (col,)
    return best[255], list(paths[255])


def screen(sections: list[list[int]], columns: list[bytes]) -> list[dict]:
    results = []
    max_length = max(map(len, sections))
    weighted = sum(map(len, sections))
    for endian in ("big", "little"):
        for gen in ("randrange", "float", "uint32"):
            keys = [pad(seed, endian, gen, max_length) for seed in columns]
            for sign in (-1, 1):
                matrix: list[list[float]] = []
                singles: list[list[float]] = []
                for section in sections:
                    metrics = [ioc(decode(section, key[:len(section)], sign))
                               for key in keys]
                    singles.append(metrics)
                    matrix.append([m * len(section) / weighted for m in metrics])
                best, assignment = optimum_assignment(matrix)
                identity = sum(matrix[i][i] for i in range(8))
                results.append({
                    "endian": endian, "generator": gen, "sign": sign,
                    "weighted_ioc": round(best, 9),
                    "identity_ioc": round(identity, 9),
                    "assignment": assignment,
                    "by_group_ioc": [round(singles[i][assignment[i]], 8)
                                     for i in range(8)],
                })
    results.sort(key=lambda item: -item["weighted_ioc"])
    return results


def english_control() -> list[int]:
    control = (ROOT / "resources" / "control" /
               "shakespeare_first300k.txt").read_text(encoding="utf-8")
    control = control[-60000:].upper().replace("V", "U").replace("K", "C").replace("Z", "S")
    control = control.replace("Q", "CW")
    symbols = []
    at = 0
    while at < len(control):
        for token, rune in TEXT_NAMES:
            if control.startswith(token, at):
                symbols.append(rune)
                at += len(token)
                break
        else:
            at += 1
    assert len(symbols) >= 12956
    return symbols[:12956]


def planted(sections: list[list[int]], columns: list[bytes]) -> list[list[int]]:
    """Held-out GP-English under genuine full-width column seeds, including repair."""
    plain = english_control()
    check = random.Random(0x4192037)
    out: list[list[int]] = []
    offset = 0
    for col, section in enumerate(sections):
        block = plain[offset:offset + len(section)]
        offset += len(section)
        key = pad(columns[col], "big", "float", len(block))
        cipher = [(p + k) % MOD for p, k in zip(block, key)]
        for i in range(1, len(cipher)):
            if cipher[i] == cipher[i-1] and check.random() < 0.81:
                repl = check.randrange(MOD - 1)
                cipher[i] = repl + (repl >= cipher[i-1])
        out.append(cipher)
    assert offset == len(plain)
    return out


def main() -> None:
    sections = ciphertext_groups()
    cols = grid_columns()
    actual = screen(sections, cols)
    planted_screen = screen(planted(sections, cols), cols)
    expected = next(row for row in planted_screen if row["endian"] == "big"
                    and row["generator"] == "float" and row["sign"] == -1)
    assert expected["assignment"] == list(range(8)), (
        "The known implanted column permutation was not recovered", expected)
    assert expected["weighted_ioc"] > 0.045, (
        "Failed to recover English-like planted plaintext", expected)
    print(json.dumps({
        "model": "Python3 MT19937, integer-seeded with exact 256-bit grid columns",
        "rune_count": sum(map(len, sections)),
        "group_lengths": list(map(len, sections)),
        "model_settings": 12,
        "assignment_candidates_per_setting": math.factorial(8),
        "actual_top": actual[:5],
        "positive_control_top": planted_screen[:3],
        "positive_control_expected_mode": expected,
        "conclusion": "A recovered key requires actual decoded English, independent test, and re-encryption. IoC alone is not plaintext."
    }, indent=2))


if __name__ == "__main__":
    main()
 text groups in this source.
    assert list(map(len, sections)) == [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]
    assert sum(map(len, sections)) == 12956
    return sections


def grid_columns() -> list[bytes]:
    table = json.loads((ROOT / "resources" / "liber-primus" /
                        "base60-grid.json").read_text(encoding="utf-8"))
    rows = table["byte_rows"]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    return [bytes(row[col] for row in rows) for col in range(8)]


def pad(seed: bytes, endian: str, generator: str, length: int) -> list[int]:
    mt = random.Random(int.from_bytes(seed, endian))
    if generator == "randrange":
        return [mt.randrange(MOD) for _ in range(length)]
    if generator == "float":
        return [int(mt.random() * MOD) for _ in range(length)]
    if generator == "uint32":
        return [mt.getrandbits(32) % MOD for _ in range(length)]
    raise ValueError(generator)


def ioc(values: list[int]) -> float:
    freq = [0] * MOD
    for c in values:
        freq[c] += 1
    n = len(values)
    return sum(f * (f - 1) for f in freq) / (n * (n - 1))


def decode(cipher: list[int], key: list[int], sign: int) -> list[int]:
    assert len(cipher) == len(key)
    return [(c + sign * k) % MOD for c, k in zip(cipher, key)]


def optimum_assignment(scores: list[list[float]]) -> tuple[float, list[int]]:
    """Exact maximum-weight matching of eight seed columns to eight groups."""
    best = [-1e100] * 256
    paths: list[tuple[int, ...]] = [()] * 256
    best[0] = 0.0
    for mask in range(1, 256):
        row = mask.bit_count() - 1
        for col in range(8):
            bit = 1 << col
            if not mask & bit:
                continue
            prev = mask ^ bit
            candidate = best[prev] + scores[row][col]
            if candidate > best[mask]:
                best[mask] = candidate
                paths[mask] = paths[prev] + (col,)
    return best[255], list(paths[255])


def screen(sections: list[list[int]], columns: list[bytes]) -> list[dict]:
    results = []
    max_length = max(map(len, sections))
    weighted = sum(map(len, sections))
    for endian in ("big", "little"):
        for gen in ("randrange", "float", "uint32"):
            keys = [pad(seed, endian, gen, max_length) for seed in columns]
            for sign in (-1, 1):
                matrix: list[list[float]] = []
                singles: list[list[float]] = []
                for section in sections:
                    metrics = [ioc(decode(section, key[:len(section)], sign))
                               for key in keys]
                    singles.append(metrics)
                    matrix.append([m * len(section) / weighted for m in metrics])
                best, assignment = optimum_assignment(matrix)
                identity = sum(matrix[i][i] for i in range(8))
                results.append({
                    "endian": endian, "generator": gen, "sign": sign,
                    "weighted_ioc": round(best, 9),
                    "identity_ioc": round(identity, 9),
                    "assignment": assignment,
                    "by_group_ioc": [round(singles[i][assignment[i]], 8)
                                     for i in range(8)],
                })
    results.sort(key=lambda item: -item["weighted_ioc"])
    return results


def english_control() -> list[int]:
    control = (ROOT / "resources" / "control" /
               "shakespeare_first300k.txt").read_text(encoding="utf-8")
    control = control[-60000:].upper().replace("V", "U").replace("K", "C").replace("Z", "S")
    control = control.replace("Q", "CW")
    symbols = []
    at = 0
    while at < len(control):
        for token, rune in TEXT_NAMES:
            if control.startswith(token, at):
                symbols.append(rune)
                at += len(token)
                break
        else:
            at += 1
    assert len(symbols) >= 12956
    return symbols[:12956]


def planted(sections: list[list[int]], columns: list[bytes]) -> list[list[int]]:
    """Held-out GP-English under genuine full-width column seeds, including repair."""
    plain = english_control()
    check = random.Random(0x4192037)
    out: list[list[int]] = []
    offset = 0
    for col, section in enumerate(sections):
        block = plain[offset:offset + len(section)]
        offset += len(section)
        key = pad(columns[col], "big", "float", len(block))
        cipher = [(p + k) % MOD for p, k in zip(block, key)]
        for i in range(1, len(cipher)):
            if cipher[i] == cipher[i-1] and check.random() < 0.81:
                repl = check.randrange(MOD - 1)
                cipher[i] = repl + (repl >= cipher[i-1])
        out.append(cipher)
    assert offset == len(plain)
    return out


def main() -> None:
    sections = ciphertext_groups()
    cols = grid_columns()
    actual = screen(sections, cols)
    planted_screen = screen(planted(sections, cols), cols)
    expected = next(row for row in planted_screen if row["endian"] == "big"
                    and row["generator"] == "float" and row["sign"] == -1)
    assert expected["assignment"] == list(range(8)), (
        "The known implanted column permutation was not recovered", expected)
    assert expected["weighted_ioc"] > 0.045, (
        "Failed to recover English-like planted plaintext", expected)
    print(json.dumps({
        "model": "Python3 MT19937, integer-seeded with exact 256-bit grid columns",
        "rune_count": sum(map(len, sections)),
        "group_lengths": list(map(len, sections)),
        "model_settings": 12,
        "assignment_candidates_per_setting": math.factorial(8),
        "actual_top": actual[:5],
        "positive_control_top": planted_screen[:3],
        "positive_control_expected_mode": expected,
        "conclusion": "A recovered key requires actual decoded English, independent test, and re-encryption. IoC alone is not plaintext."
    }, indent=2))


if __name__ == "__main__":
    main()
