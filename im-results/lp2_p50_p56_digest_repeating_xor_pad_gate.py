#!/usr/bin/env python3
"""Direct p56-digest repeating-XOR test for the 256-byte p50 table."""
import hashlib
import json
import math
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
grid = json.loads((root / "resources/liber-primus/base60-grid.json").read_text())
reference = (root / "resources/liber-primus/lp1-plaintext-reference.txt").read_text()
p56 = reference.split("### 56", 1)[1].split("### 57", 1)[0]
digest_hex = re.search(r"[0-9a-f]{128}", re.sub(r"\s+", "", p56), re.I).group(0).lower()
digest = bytes.fromhex(digest_hex)
assert len(digest) == 64

tokens = [x for row in grid["rows"] for x in row]
assert len(tokens) == 256
a60 = grid["alphabet"]
a59 = a60.replace("f", "")

def decode(alphabet):
    out = bytearray()
    for token in tokens:
        value = alphabet.index(token[0]) * len(alphabet) + alphabet.index(token[1])
        assert value <= 255
        out.append(value)
    return bytes(out)

def xor(data, key):
    return bytes(x ^ key[i % len(key)] for i, x in enumerate(data))

def stats(data):
    printable = sum(32 <= x <= 126 for x in data)
    letters = sum(65 <= x <= 90 or 97 <= x <= 122 for x in data)
    zeros = data.count(0)
    longest = run = 0
    for x in data:
        if 32 <= x <= 126:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
    counts = {x: data.count(x) for x in set(data)}
    entropy = -sum((n / len(data)) * math.log2(n / len(data)) for n in counts.values())
    magic = [name for name, sig in {
        "PNG": bytes.fromhex("89504e470d0a1a0a"), "JPEG": bytes.fromhex("ffd8ff"),
        "ZIP": bytes.fromhex("504b0304"), "PDF": b"%PDF", "GZIP": bytes.fromhex("1f8b"),
        "ELF": bytes.fromhex("7f454c46"), "GIF": b"GIF8", "7Z": bytes.fromhex("377abcaf271c"),
        "SQLite": b"SQLite"
    }.items() if data.startswith(sig)]
    return {
        "printable": printable, "letters": letters, "zeros": zeros,
        "longest_printable_run": longest, "unique_bytes": len(counts),
        "entropy_bits_per_byte": round(entropy, 4), "magic": magic,
        "preview": "".join(chr(x) if 32 <= x <= 126 else "." for x in data[:96]),
        "sha256": hashlib.sha256(data).hexdigest()
    }

def imul(a, b):
    return (a * b) & 0xffffffff

def rng32(seed):
    state = seed & 0xffffffff
    def draw():
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xffffffff
        t = state
        t = imul(t ^ (t >> 15), t | 1)
        t ^= (t + imul(t ^ (t >> 7), t | 61)) & 0xffffffff
        return ((t ^ (t >> 14)) & 0xffffffff) / 4294967296.0
    return draw

def shuffle(values, draw):
    out = list(values)
    for i in range(len(out) - 1, 0, -1):
        j = int(draw() * (i + 1))
        out[i], out[j] = out[j], out[i]
    return bytes(out)

phrase = b"CICADA3301 SOURCE-DERIVED HASH XOR CONTROL; "
control = bytes(phrase[i % len(phrase)] for i in range(256))
assert xor(xor(control, digest), digest) == control

draw = rng32(0x56332016)
results = []
expected_input_hashes = {
    "base60": "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    "base59_drop_f": "511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79"
}
for name, alphabet in [("base60", a60), ("base59_drop_f", a59)]:
    payload = decode(alphabet)
    assert hashlib.sha256(payload).hexdigest() == expected_input_hashes[name]
    output = xor(payload, digest)
    nulls = [stats(xor(payload, shuffle(digest, draw)))["printable"] for _ in range(64)]
    ordered = sorted(nulls)
    actual = stats(output)
    results.append({
        "encoding": name, "payload_sha256": hashlib.sha256(payload).hexdigest(),
        "output": actual, "null_count": 64,
        "null_printable_median": ordered[32], "null_printable_min": ordered[0],
        "null_printable_max": ordered[-1],
        "null_printable_counts": nulls,
        "empirical_upper_tail_p": (1 + sum(x >= actual["printable"] for x in nulls)) / 65
    })

print(json.dumps({
    "test": "p50 256-byte table XOR repeating p56 SHA-512 digest",
    "digest_hex": digest_hex, "digest_bytes": len(digest),
    "digest_sha256": hashlib.sha256(digest).hexdigest(),
    "key_repetitions": 4, "offset": 0, "positive_control_exact": True,
    "results": results
}, indent=2))
