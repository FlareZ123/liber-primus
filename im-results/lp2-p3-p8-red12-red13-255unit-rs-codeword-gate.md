# Original red12/red13 255-unit Reed–Solomon source gate

**Agent 28, 22 November 2026. Evidence: bounded original-input negative. No recovered unknown-page plaintext, author-selected key or cipher.**

## Physical source and plausible human operation

The physical p3–p7 scroll contains **255 complete printed words** spanning 1,145 GP29 runes: **13 entirely red**, **242 entirely black**. Its red complete-word positions are 0-based **[0,1,2,22,176,177,178,179,250,251,252,253,254]**. The adjacent physical p8 has **255 runes**, its first **12** red, remaining **243** black. The 243rd black rune belongs to one original word continuing into p9; it cannot be discarded merely to manufacture a 242-block.

Both 255=2^8−1 and the adjacent **13+242** and **12+243** partitions suggest systematic **RS(255,242)** and **RS(255,243)** error correction over GF(256). Earlier Cicada used QR codes, making Reed–Solomon a plausible human-recognizable algorithm. Yet the original does not say red means parity, give a 29-rune-to-byte map, or treat the scattered scroll red words as checks. The competing explanation is ordinary decorative headings and coincidental counts.

**Prior-art boundary:** The repository already contained [`lp2_p8_red12_rs255_243_source_sft.cjs`](../sims/lp2_p8_red12_rs255_243_source_sft.cjs), which excluded the **original p8** as an RS(255,243) GF(0x11d) codeword for GP-index and GP-prime bytes, a few source-shaped arrangements and generator roots 0/1. That p8 exclusion is **not a new discovery** here. The incremental test is the **adjacent 255-word scroll's separate red13/black242 original-input RS(255,242) gate**, plus the all-255-root / two-field / ordinal-representation extensions for p8. The equal 255-unit counts were known before this invocation. All 44 cases are displayed as combined scope; only the additional cases extend earlier evidence.

## Frozen original-source inverse gate

A complete conventional RS(255,k) codeword has 255 evaluations with at least 255−k consecutive generator roots. The necessary condition holds regardless of whether the 12/13 parity symbols appear at the front, end, or scattered positions. To allow **any first-root exponent**, scan all 255 field roots and find the longest cyclic zero-syndrome run.

Byte readings: original **p8 full 255 GP runes** mapped by GP index, GP ordinal, or GP prime; the original **255 scroll whole words** mapped by their first rune, last rune, length, GP-index sum mod256, GP-prime sum mod256, BASE29 number mod256 in both orientations, or rune XOR. For each choose source order or reversed, under **QR GF(256) polynomial 0x11d / primitive 2** or **AES GF(256) polynomial 0x11b / primitive 3**.

There are **12 p8 configurations and 32 scroll configurations, 44 total**. **None has even two consecutive zero syndromes** under any root offset, with at most **three isolated zero roots** in any configuration. The proposed exact direct RS byte readings require 12 or 13 consecutive zeros, so every declared source serialization is excluded as an unmodified conventional full-length RS codeword. No key search or postselected word-boundary change is involved.

**Positive controls:** independent GF(256) elimination constructs four genuine codewords: in each field 12 parity bytes precisely at p8's first 12 red slots, and 13 parity bytes at the original scattered scroll red-word positions. All have 12 or 13 zero syndromes, respectively, and one black-byte corruption makes the first syndrome nonzero. The source parser asserts exact 255 word/rune counts and physical red positions before testing.

## Cryptanalytic consequence

This is a narrow format exclusion, distinct from the preexisting p49–p51 numerical-table Reed–Solomon work. It does not rule out a **source-authenticated hidden rune-to-byte key**, interleaving, errors/erasures, non-RS checks, or a cryptographic transform before the code. Such alternatives need a source-selected opcode and decoding state before any fit to original ciphertext can authenticate them. **No original plaintext or key was found.**

[Windows 11 / Node22 read-only CJS reproducer](../sims/lp2_red12_red13_rs255_source_sft.cjs) · [Canonical source corpus](../resources/liber-primus/lp2-corpus.json) · [Original transcription](../resources/liber-primus/lp2-transcription.txt) · [Ink annotations](../resources/liber-primus/lp2-ink-annotations.json) · [Adjacent 242-word/242-rune observation](lp2-p3-p8-242-black-word-rune-original-inverse.md).
