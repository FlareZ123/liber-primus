# Source-shaped GP28 successor streams as direct bytes

**Original-input decision (13 November 2026, Agent 30).** The 55 rune-bearing unknown LP2 pages contain **12,956 GP29 runes** and **12,901 within-physical-page successor positions**. Exactly **86** successors repeat the preceding rune. The other **12,815** can each be represented by one digit in an alphabet of 28 choices. This is a clue-constrained candidate transport representation, motivated by the unusually low repeat count; no original source explicitly instructs a GP28 conversion.

A human can extract either of two elementary predecessor-excluding digits without a secret key:

* **Ordered rank:** the zero-based rank of the next rune in the GP alphabet with the preceding rune excluded.
* **Cyclic rank:** the nonzero difference from the preceding rune modulo 29, reduced to a 0–27 digit.

For a same-rune successor, the test distinguishes **discard** (lossy), **zero** (ambiguous), and **escape** (reserve digit 28 and serialize in base 29). The escape variant is **exactly reversible for all original 55 pages**, given each visible page's first rune: the reproducer reconstitutes every original sequence without exception. Discard and zero are retained only to test common direct-binary interpretations; they cannot be universal inverses.

The original-image chapter starts give nine source-visible whole-chapter units: **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55**. The fixed test also treats the whole unknown book as a unit. For every unit it serializes each rank interpretation as a big-endian base-28 or base-29 integer, testing both minimal byte width and fixed width implied by digit count. This specifies **120** cases (10 units × 2 rank rules × 3 repeat rules × 2 byte widths). The test checks byte offset zero against six unambiguous common signatures: **gzip, bzip2, XZ, PNG, ZIP and PDF**. No fitted initial-byte skip, extension, adjusted key, page permutation or post-hoc header is allowed.

**Result:** **0/120** original-input serializations begins with any of those signatures. A separately generated valid gzip member survives the same base-28 integer-to-byte conversion exactly, passes signature identification and decompresses to its planted plaintext. All original escape-state decoder assertions pass.

**Decision:** There is no direct, unkeyed, start-aligned common-file header in these two GP28 successor encodings under the three defined repeat treatments. This does **not** exclude encrypted binary payloads, unknown formats, keys, different ways to handle repeats, or source-selected offsets. The observation supplies neither an authentic LP2 decipherment key nor unknown-page plaintext. Without independent evidence of a binary container, extending these serializations into an open-ended magic-header or byte-offset search has low value.

**Reproduce:** [self-contained CommonJS source](../sims/lp2_gp28_direct_byte_transport_sft.cjs) and [canonical LP2 numerical corpus](../resources/liber-primus/lp2-corpus.json). Run the source in the repository with Node.js 20 or later. All comparisons use original ciphertext rune indices and original physical-page boundaries.
