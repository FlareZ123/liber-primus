# Original JPEG trailer: a reversed self-prefix on scan 05

**11 November 2026 | Agent 29 | bounded original-byte source test; no LP2 decryption.**

## Source and exact result

All 75 archived images `resources/liber-primus/00.jpg` through `74.jpg` were compared at the JPEG EOI marker (`FF D9`). The source ZIP `liber-primus-jpegs.zip` and repository source set agree for the three independently SHA-256-checked images 05, 17 and 74. The repository SHA-256 for scan 05 is `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`.

**Scan 05 alone has data after its EOI:** the file is 673,066 bytes; the EOI ends at byte offset 600,366 (exclusive), followed by exactly **72,700 bytes**. The trailer is **exactly the first 72,700 bytes of that same JPEG, in reverse byte order**, without exceptions. The appended suffix SHA-256 is `3e95593e226980e3bf743ce9d12f38cf41b96dc7797587f9ff7470788719803f`; its reversal SHA-256 is `d55187011436d38c3b73dbddf9fdc989413482cd0aa21de2b134a673643ceeb3`. The reversed suffix begins with a valid JFIF header because it reproduces a prefix of the original image; decoded alone it is truncated. It contains no distinct independent image data.

All 58 LP2 images, scans **17–74**, have **zero post-EOI bytes**. They each contain one JPEG APP2 ICC_PROFILE payload of length 2,590 bytes with identical SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`. The 17 LP1 scans (00–16) have no APP2 segment. The complete corpus uses 2400×3600 JPEGs. This is a marker/trailer census, **not** a claim about entropy-coded pixel steganography.

## Reproducer

The following Python standard-library test operates on the repository's image directory and checks the decisive structural facts without extracting or modifying the images.

```python
from pathlib import Path
import hashlib

root = Path("resources/liber-primus")
files = [root / f"{i:02}.jpg" for i in range(75)]
images = [file.read_bytes() for file in files]
assert all(image.startswith(bytes.fromhex("ffd8")) for image in images)
trails = []
for image in images:
    end = image.rfind(bytes.fromhex("ffd9")) + 2
    assert end >= 2
    trails.append(image[end:])
assert [i for i, trail in enumerate(trails) if trail] == [5]
assert len(images[5]) == 673066
assert len(trails[5]) == 72700
assert trails[5][::-1] == images[5][:72700]
assert hashlib.sha256(images[5]).hexdigest() == (
    "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7"
)
icc = []
for image in images[17:]:
    start = image.index(b"ICC_PROFILE\x00")
    icc.append(image[start:start + 2590])
assert len(set(icc)) == 1
assert hashlib.sha256(icc[0]).hexdigest() == (
    "62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f"
)
print("PASS: only scan 05 has a reversed self-prefix trailer; LP2 has no trailers")
```

## Interpretation and next decision

This is an exact original-artifact byte structure. It may arise from deliberate manipulation of the historical scan or from later image handling; the bytes alone do not decide intent. **Do not decode the appended 72,700 bytes as an independent ciphertext/key**: every byte is a redundant copy of the same image prefix. The APP2 marker identity is likewise a shared color profile, not independent per-page payload state. Source-selected reversal mechanisms would still need an independently visible instruction and a successful inverse on unknown LP2 ciphertext. No unknown plaintext, key, destination or encryption rule was recovered by this audit.
