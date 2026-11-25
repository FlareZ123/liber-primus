# LP1 physical p5 (archive 05.jpg) JPEG trailer: exact self-check, not a second payload

**Decision:** LP1 physical p5 file 05.jpg is a three-part container: the valid page JPEG, a 360-byte hex-text rendering of the page's own 5×5 magic square, and an exact byte-reversed copy of the JPEG prefix. The appended material does not reveal unknown LP2 plaintext or select a cipher for p0–55. Do not interpret the final 72,700 bytes as an independent payload or as 25 equal blocks.

## Exact source structure

The original repository file is resources/liber-primus/05.jpg (LP1; LP2 physical p5 is archive 22.jpg). The legacy report filename is retained for existing links. Its total length is **673,066 bytes**.

| Byte interval (half-open) | Length | Content |
|---|---:|---|
| [0, 336353) | 336,353 | Valid JPEG page image; the EOI marker is at offsets 336351–336352 |
| [336353, 336713) | 360 | ASCII hexadecimal text, including whitespace |
| [336713, 673066) | 336,353 | Exact byte reversal of the first JPEG prefix |

The suffix equality is exact: data[336713:] == data[:336353][::-1]. The 360-byte middle segment contains 358 non-whitespace hexadecimal characters. Remove whitespace, reverse the hexadecimal characters, and decode the result as ASCII:

    hextext = "".join(middle.decode("ascii").split())
    matrix_text = bytes.fromhex(hextext[::-1]).decode("ascii")

This yields:

    272 138 341 131 151
    366 199 130 320 18
    226 245 91 245 226
    18 320 130 199 366
    151 131 341 138 272

Every row and column sums to **1033**, and both main diagonals also sum to 1033. The matrix is the same 5×5 numeric/runic square shown on p5; the trailer is a self-check representation of that known page structure, not an unknown text.

## Why the 72,700-byte interpretation was wrong

A naive search for the last occurrence of FFD9 returns offset 600364. That is not the original JPEG's end: the valid JPEG prefix already ended at offset 336351. The later marker-like byte pair occurs inside the byte-reversed copy. Taking bytes after that later occurrence gives 72,700 bytes, which happens to equal 25 × 2,908. That arithmetic is spurious; those bytes are merely the end of the reversed JPEG copy. JPEG marker parsing must not use rfind(FFD9) as a substitute for finding the first valid image EOI.

## Reproduction

The following check uses the exact repository file and fixed offsets:

    from pathlib import Path
    data = Path("resources/liber-primus/05.jpg").read_bytes()
    prefix = data[:336353]
    middle = data[336353:336713]
    suffix = data[336713:]

    assert len(data) == 673066
    assert prefix[-2:] == bytes.fromhex("ffd9")
    assert len(middle) == 360
    assert suffix == prefix[::-1]

    hextext = "".join(middle.decode("ascii").split())
    matrix_text = bytes.fromhex(hextext[::-1]).decode("ascii")
    rows = [[int(v) for v in line.split()]
            for line in matrix_text.strip().splitlines()]
    assert len(rows) == 5 and all(len(row) == 5 for row in rows)
    assert all(sum(row) == 1033 for row in rows)
    assert all(sum(rows[i][j] for i in range(5)) == 1033
               for j in range(5))
    assert sum(rows[i][i] for i in range(5)) == 1033
    assert sum(rows[i][4-i] for i in range(5)) == 1033

Exact uploaded/repository file SHA-256: 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7.

## Research status and context

This is a verified source-container property and a known-page consistency check. It is not a newly recovered LP2 passage, key, or route to the unresolved 56 pages. Independent public writeups also describe the page/hex-text/reversed-page construction: [Dukotah artifact report](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/REPORT-A.md) and [Cicada Notebook session 37](https://cicadanotebook.com/sessions/37.html). Preserve the distinction between this established p5 artifact and any future, independently sourced operation on unknown LP2 ciphertext.
