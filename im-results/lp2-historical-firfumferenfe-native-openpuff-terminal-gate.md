# Authentic LP1 circumference key against original LP2 terminal JPEG carriers

**Original-input decision, 15 November 2026 (Agent 6).** No LP2 payload or unknown-page plaintext was recovered. The historically demonstrated LP1 second-koan key `FIRFUMFERENFE` fails as an **A-only OpenPuff v4.00 JPEG password** on each of the two source-adjacent terminal images when independently tested at both native JPEG bit levels. This is a bounded key/carrier/level exclusion, rather than an exclusion of the word `CIRCUMFERENCE`, multi-carrier payloads, or other ciphers.

## Causal source clue and exact input

The source-visible solved LP2 p57 PARABLE instructs the reader to `SHED OUR OWN CIRCUMFERENCES`. A different Cicada stage independently supplies a genuine 13-GP-symbol key for the solved original LP1 second koan: **`FIRFUMFERENFE`**, corresponding to `CIRCUMFERENCE` with all three `C` letters replaced by `F`. The source-original 319-rune LP1 key recovery, 319/319 solved plaintext control and spelling correction are recorded in [the corrected key report](lp2-2014-firfumference-vigenere-gate.md). This makes the historical key a concrete cross-round password candidate, although **no first-party instruction specifies OpenPuff or selects these LP2 carriers**.

The two candidate JPEGs are source-original **`resources/liber-primus/72.jpg`** (physical LP2 p55, last unknown rune page, with a tree) and **`74.jpg`** (physical LP2 p57, source-visible PARABLE). Their original rune corpus and the p57 literal `CIRCUMFERENCES` are checked before extraction. The selection is adjacent to the clue and is not a broad image/key search.

## Actual native original-version execution

[The reproducible Windows workflow](../.github/workflows/agent6-lp1-circumference-openpuff-original.yml) installs the original **32-bit OpenPuff v4.00** executable and companion DLL by pinned Git blobs `466e03c792075313ce533a5dc7a789e8a41209f9` and `f3b1c3315f8286346416fefd6141410f422f2454`. Its same-job decoder positive extracts the exact independently published **35-byte** `hidden.txt` under A=`12345678`, verifying that the native GUI path works with a genuine JPEG payload. The test fixes A=`FIRFUMFERENFE`, B/C disabled, one original JPEG at a time, and the two documented settings:

| Original source carrier | JPEG Medium 1/5 (20%) | JPEG Maximum 1/2 (50%) |
| --- | --- | --- |
| p55 original `72.jpg` | Native `corrupted stream`, zero files | Native `corrupted stream`, zero files |
| p57 original `74.jpg` | Native `corrupted stream`, zero files | Native `corrupted stream`, zero files |

Each of **four** genuine native attempts loaded exactly one image, confirmed the bit setting, and returned `Task stopped: corrupted stream` with zero extracted files. None was classified as an inconclusive timeout. [Successful complete original-source Windows execution, run 43754695719](https://github.com/FlareZ123/liber-primus/actions/runs/43754695719) preserves the UI evidence and run log. The workflow did not perform password variations or silently claim a recovered carrier.

## Cryptanalytic implication

The literal parable clue plus independently recovered historical key is a human-plausible operation selector. It has now received a decisive **single-original-image** extraction test, with an authentic-tool positive control, and is negative in the four fixed configurations. Source p57 does not prescribe a JPEG payload, source image grouping, alternative password transform, or GP29 plaintext decoder. No broader historical key reuse or invisible multi-carrier chain is established by the clue. Retire these four exact attempts unless a first-party source selects a different input arrangement; continue prioritizing a key and reversible operation that produce withheld unknown-page plaintext.
