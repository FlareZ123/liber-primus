"""Original LP2 grid: source-constrained modulo-29 quotient carrier screen.

Run: python sims/lp2_p50_quotient9_sidechannel_sft.py
Python standard library; read-only. Original bytes are never fitted or altered.
"""
from __future__ import annotations

import bz2
import gzip
import hashlib
import json
import lzma
import math
from pathlib import Path
import zlib

SOURCE = Path(__file__).resolve().parents[1] / "resources/liber-primus/lp2-grid-256.json"
SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
MAGIC = {"gzip": b"\x1f\x8b", "zip": b"PK\x03\x04", "pdf": b"%PDF", "png": b"\x89PNG",
         "xz": b"\xfd7zXZ", "bz2": b"BZh", "elf": b"\x7fELF", "pgp": b"-----BEGIN"}
LIMIT = 1_048_576


def base9_bytes(digits: list[int], width: int | None = None) -> bytes:
    value = 0
    for digit in digits:
        assert 0 <= digit <= 8
        value = 9 * value + digit
    if width is None:
        width = ((9 ** len(digits) - 1).bit_length() + 7) // 8
    return value.to_bytes(width, "big")


def packed(digits: list[int], group: int) -> bytes:
    assert len(digits) % group == 0
    width = ((9 ** group - 1).bit_length() + 7) // 8
    return b"".join(base9_bytes(digits[i:i + group], width) for i in range(0, len(digits), group))


def order(major: str, snake: bool, reverse: bool) -> list[int]:
    indexes = []
    for outer in range(32 if major == "rows" else 8):
        inner = list(range(8 if major == "rows" else 32))
        if snake and outer % 2:
            inner.reverse()
        for j in inner:
            r, c = (outer, j) if major == "rows" else (j, outer)
            indexes.append(8 * r + c)
    assert sorted(indexes) == list(range(256))
    return indexes[::-1] if reverse else indexes


def ascii_fraction(data: bytes) -> float:
    return sum(32 <= c <= 126 or c in (9, 10, 13) for c in data) / len(data)


def decompress_candidates(data: bytes) -> list[tuple[str, int, float]]:
    decoders = {
        "raw-deflate": lambda b: zlib.decompressobj(-15).decompress(b, LIMIT + 1),
        "zlib": lambda b: zlib.decompressobj(15).decompress(b, LIMIT + 1),
        "gzip": lambda b: zlib.decompressobj(31).decompress(b, LIMIT + 1),
        "bz2": lambda b: bz2.BZ2Decompressor().decompress(b, max_length=LIMIT + 1),
        "xz": lambda b: lzma.LZMADecompressor().decompress(b, max_length=LIMIT + 1),
    }
    outcomes = []
    for name, decode in decoders.items():
        try:
            output = decode(data)
        except (OSError, EOFError, ValueError, zlib.error, lzma.LZMAError):
            continue
        if 0 < len(output) <= LIMIT:
            outcomes.append((name, len(output), ascii_fraction(output)))
    return outcomes


def readouts(quotients: list[int]):
    for major in ("rows", "columns"):
        for snake in (False, True):
            for reverse in (False, True):
                tag = f"{major}/snake={int(snake)}/reverse={int(reverse)}"
                d = [quotients[i] for i in order(major, snake, reverse)]
                yield tag + "/integer-big", base9_bytes(d)
                yield tag + "/integer-little", base9_bytes(d[::-1])
                for group in (2, 4, 8):
                    yield tag + f"/pack{group}", packed(d, group)
    for bit_name, predicate in (
        ("bit0", lambda x: x & 1),
        ("bit1", lambda x: (x >> 1) & 1),
        ("bit2", lambda x: (x >> 2) & 1),
        ("bit3", lambda x: (x >> 3) & 1),
        ("ge4", lambda x: int(x >= 4)),
    ):
        for lsb in (False, True):
            out = bytearray()
            for row in range(32):
                bits = [predicate(quotients[8 * row + c]) for c in range(8)]
                if lsb:
                    bits.reverse()
                out.append(sum(bit << (7 - i) for i, bit in enumerate(bits)))
            yield f"{bit_name}/rowbits/lsb={int(lsb)}", bytes(out)


def positive_control() -> None:
    phrase = b"THE PATH THROUGH THE BOOK SHOULD REVEAL A REPRODUCIBLE PLAINTEXT. " * 4
    compressed = gzip.compress(phrase, mtime=0)
    assert len(compressed) < 102
    integer = int.from_bytes(compressed, "big")
    digits = [0] * 256
    for i in range(255, -1, -1):
        integer, digits[i] = divmod(integer, 9)
    assert integer == 0
    planted_bytes = bytes(d * 29 for d in digits)
    recovered = base9_bytes([b // 29 for b in planted_bytes]).lstrip(b"\x00")
    assert recovered == compressed and gzip.decompress(recovered) == phrase
    print(f"POSITIVE GZIP bytes={len(compressed)} digits=256 recovered_exactly=yes")



def direct_quotient_key_gate(values: list[int]) -> None:
    """Apply the exact source quotient stream as a repeated GP29 additive key."""
    corpus_path = SOURCE.parent / "lp2-corpus.json"
    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    pages = [p for p in corpus["pages"] if p["page"] <= 55 and p["indices"]]
    assert len(pages) == 55 and sum(len(p["indices"]) for p in pages) == 12_956
    clear_p57 = next(p["indices"] for p in corpus["pages"] if p["page"] == 57)
    assert len(clear_p57) == 95
    starts = {0, 3, 8, 15, 23, 27, 33, 40, 54}
    original = [c for page in pages for c in page["indices"]]

    def collision(data: list[int]) -> float:
        counts = [data.count(i) for i in range(29)]
        return sum(x * (x - 1) for x in counts) / (len(data) * (len(data) - 1))

    print(f"CIPHER ORIGINAL rune_count={len(original)} ioc={collision(original):.14f}")
    maximum = 0.0
    for reading in ("rows", "columns"):
        indexes = order(reading, False, False)
        key = [values[i] // 29 for i in indexes]
        for scope in ("book", "chapter", "page"):
            sites = []
            book_pos = chapter_pos = 0
            for page in pages:
                if page["page"] in starts:
                    chapter_pos = 0
                for local_pos, c in enumerate(page["indices"]):
                    phase = {"book": book_pos, "chapter": chapter_pos, "page": local_pos}[scope]
                    sites.append((c, key[phase % 256]))
                    book_pos += 1
                    chapter_pos += 1
            assert len(sites) == 12_956
            for sign in (-1, 1):
                recovered = [(c + sign * k) % 29 for c, k in sites]
                ic = collision(recovered)
                maximum = max(maximum, ic)
                print(f"CIPHER reading={reading} scope={scope} sign={sign:+d} ioc={ic:.14f}")
                plant_c = [(p - sign * key[i % 256]) % 29 for i, p in enumerate(clear_p57)]
                assert [(c + sign * key[i % 256]) % 29 for i, c in enumerate(plant_c)] == clear_p57
    print(f"CIPHER SUMMARY candidates=12 maximum_ioc={maximum:.14f} positive_p57_exact=12/12")
    assert maximum < 0.04



def gf29_quotient_highregister_gate(values: list[int]) -> None:
    """Decrypt the field-29 H*G codeword using its co-located base-9 upper register."""
    divisor = [12, 17, 11, 21, 23]
    inverse = pow(divisor[0], -1, 29)

    def divide(residues: list[int]) -> list[int]:
        work = residues[:]
        quotient = []
        for i in range(252):
            digit = work[i] * inverse % 29
            quotient.append(digit)
            for j, coef in enumerate(divisor):
                work[i + j] = (work[i + j] - digit * coef) % 29
        assert work == [0] * 256
        return quotient

    field_quotient = divide([b % 29 for b in values])
    upper = [b // 29 for b in values]
    assert field_quotient[:16] == [0, 12, 9, 28, 2, 25, 23, 21,
                                   18, 28, 21, 17, 17, 8, 15, 21]

    def collision(data: list[int]) -> float:
        n = len(data)
        counts = [data.count(i) for i in range(29)]
        return sum(k * (k - 1) for k in counts) / (n * (n - 1))

    print(f"COUPLED Q252 original_ioc={collision(field_quotient):.14f}")
    maximum = 0.0
    for shift in (0, 4):
        for sign in (-1, 1):
            decoded = [(field_quotient[i] + sign * upper[i + shift]) % 29 for i in range(252)]
            score = collision(decoded)
            maximum = max(maximum, score)
            print(f"COUPLED original upper_shift={shift} sign={sign:+d} ioc={score:.14f}"
                  f" gp_prefix={decoded[:12]}")
    assert maximum < 0.04

    corpus = json.loads((SOURCE.parent / "lp2-corpus.json").read_text(encoding="utf-8"))
    p57 = next(page["indices"] for page in corpus["pages"] if page["page"] == 57)
    plaintext = [p57[i % len(p57)] for i in range(252)]
    planted_upper = [i % 8 for i in range(256)]
    planted_q = [(plaintext[i] + planted_upper[i]) % 29 for i in range(252)]
    planted_r = [
        sum(divisor[j] * planted_q[i - j] for j in range(5)
            if 0 <= i - j < len(planted_q)) % 29
        for i in range(256)
    ]
    planted_b = [29 * planted_upper[i] + planted_r[i] for i in range(256)]
    assert all(0 <= b < 256 for b in planted_b)
    recovered_q = divide([b % 29 for b in planted_b])
    recovered_plaintext = [(recovered_q[i] - planted_b[i] // 29) % 29 for i in range(252)]
    assert recovered_plaintext == plaintext
    print("COUPLED POSITIVE source-native-252-rune H*G codeword + co-located quotient-pad exact=252/252")



def secret_nine_alphabet_entropy_gate(values: list[int]) -> None:
    """Exact unknown-key bound for all nine independent GP29 symbol permutations."""
    corpus = json.loads((SOURCE.parent / "lp2-corpus.json").read_text(encoding="utf-8"))
    pages = [p for p in corpus["pages"] if p["page"] <= 55 and p["indices"]]
    p57 = next(p["indices"] for p in corpus["pages"] if p["page"] == 57)
    assert len(p57) == 95
    n = sum(len(p["indices"]) for p in pages)
    assert n == 12_956

    def entropy(counts: list[int]) -> float:
        total = sum(counts)
        return -sum((v / total) * math.log2(v / total)
                    for v in counts if v) if total else 0.0

    def conditional(stream: list[tuple[int, int]]) -> float:
        matrix = [[0] * 29 for _ in range(9)]
        for symbol, key_digit in stream:
            matrix[key_digit][symbol] += 1
        return sum(sum(row) / len(stream) * entropy(row) for row in matrix)

    chapters = {0, 3, 8, 15, 23, 27, 33, 40, 54}
    original = [symbol for page in pages for symbol in page["indices"]]
    counts = [original.count(i) for i in range(29)]
    print(f"ALLSECRET ORIGINAL H(C)={entropy(counts):.12f} bits/rune")
    minimum = 10.0
    for major in ("rows", "columns"):
        indexes = order(major, False, False)
        q = [values[i] // 29 for i in indexes]
        for scope in ("book", "chapter", "page"):
            key_at = []
            book_pos = chapter_pos = 0
            for page in pages:
                if page["page"] in chapters:
                    chapter_pos = 0
                for local_pos in range(len(page["indices"])):
                    phase = {"book": book_pos, "chapter": chapter_pos, "page": local_pos}[scope]
                    key_at.append(q[phase % 256])
                    book_pos += 1
                    chapter_pos += 1
            assert len(key_at) == n
            exact = conditional(list(zip(original, key_at)))
            minimum = min(minimum, exact)

            # All nine hidden alphabets are permitted. This secret affine
            # family is a positive representative of those bijections.
            planted_plain = [p57[i % len(p57)] for i in range(n)]
            planted_cipher = [
                ((1 + k) * p + 3 * k + 7) % 29
                for p, k in zip(planted_plain, key_at)
            ]
            recovered = [
                ((c - 3 * k - 7) * pow(1 + k, -1, 29)) % 29
                for c, k in zip(planted_cipher, key_at)
            ]
            assert recovered == planted_plain
            lhs = conditional(list(zip(planted_cipher, key_at)))
            rhs = conditional(list(zip(planted_plain, key_at)))
            assert abs(lhs - rhs) < 1e-11
            assert exact > 4.8
            print(f"ALLSECRET reading={major} scope={scope}"
                  f" H(C|q)={exact:.12f} planted_H(P|q)={rhs:.12f}"
                  f" planted_exact={n}/{n}")
    print(f"ALLSECRET SUMMARY models=6 min_required_original_H(P)={minimum:.12f} bits/rune")



def secret_quotient_feedback_entropy_gate(values: list[int]) -> None:
    """All (9*29) secret bijections with state (q_i, preceding ciphertext)."""
    corpus = json.loads((SOURCE.parent / "lp2-corpus.json").read_text(encoding="utf-8"))
    pages = [p for p in corpus["pages"] if p["page"] <= 55 and p["indices"]]
    starts = {0, 3, 8, 15, 23, 27, 33, 40, 54}
    n = sum(len(p["indices"]) - 1 for p in pages)
    assert n == 12_901

    def conditional(samples: list[tuple[int, int, int]]) -> float:
        matrix = [[0] * 29 for _ in range(261)]
        for value, previous, key in samples:
            matrix[29 * key + previous][value] += 1
        total = len(samples)
        return sum(
            (sum(row) / total) *
            (-sum((x / sum(row)) * math.log2(x / sum(row)) for x in row if x) if sum(row) else 0)
            for row in matrix
        )

    minimum = 10.0
    for major in ("rows", "columns"):
        q = [values[i] // 29 for i in order(major, False, False)]
        for scope in ("book", "chapter", "page"):
            book_pos = chapter_pos = 0
            original_samples = []
            for page in pages:
                if page["page"] in starts:
                    chapter_pos = 0
                previous = None
                for local_pos, cipher in enumerate(page["indices"]):
                    phase = {"book": book_pos, "chapter": chapter_pos, "page": local_pos}[scope]
                    if previous is not None:
                        original_samples.append((cipher, previous, q[phase % 256]))
                    previous = cipher
                    book_pos += 1
                    chapter_pos += 1
            assert len(original_samples) == n
            h = conditional(original_samples)
            assert h > 4.30
            minimum = min(minimum, h)
            print(f"FEEDBACK reading={major} scope={scope} H(C|q,Cprev)={h:.12f}")
    print(f"FEEDBACK SUMMARY states=261 scopes=6 min_required_H(P)={minimum:.12f} bits/rune")


def main() -> None:
    values = json.loads(SOURCE.read_text(encoding="utf-8"))["bytes"]
    assert len(values) == 256 and all(type(x) is int and 0 <= x < 256 for x in values)
    assert hashlib.sha256(bytes(values)).hexdigest() == SHA
    q = [x // 29 for x in values]
    r = [x % 29 for x in values]
    assert all(x == 29 * hi + lo for x, hi, lo in zip(values, q, r))
    print("ORIGINAL source_sha256=" + SHA)
    print("QUOTIENT histogram=" + ",".join(str(q.count(i)) for i in range(9)))
    print("QUOTIENT 102-byte prefix=" + base9_bytes(q)[:16].hex())
    positive_control()

    count = signatures = meaningful = 0
    most_printable = (0.0, "")
    for tag, data in readouts(q):
        count += 1
        file_signatures = [name for name, magic in MAGIC.items() if data.startswith(magic)]
        signatures += len(file_signatures)
        inflations = decompress_candidates(data)
        meaningful += sum(length >= 64 and fraction >= 0.85 for _, length, fraction in inflations)
        fraction = ascii_fraction(data)
        if fraction > most_printable[0]:
            most_printable = (fraction, tag)
        print(f"READ {tag:49} bytes={len(data):3d} ascii={fraction:.4f}"
              f" signature={file_signatures or '-'} inflation={inflations or '-'}"
              f" prefix={data[:8].hex()}")
    assert count == 50
    print(f"ORIGINAL SUMMARY readouts={count} file_signatures={signatures}"
          f" readable_decompressions={meaningful} max_ascii={most_printable[0]:.4f}"
          f" max_ascii_mode={most_printable[1]}")
    assert signatures == 0 and meaningful == 0
    direct_quotient_key_gate(values)
    gf29_quotient_highregister_gate(values)
    secret_nine_alphabet_entropy_gate(values)
    secret_quotient_feedback_entropy_gate(values)


if __name__ == "__main__":
    main()
