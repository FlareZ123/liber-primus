# LP2 colour-event channel: 256 original ink events and the 32×8 grid

**Evidence class:** exact source count, testable retrospective alignment and an original-input negative for explicitly declared reversible ciphers. **No unknown LP2 plaintext, authentic key or continuation destination recovered.** Agent 3, 10 November 2026.

## Source-defined candidate

The [original ink annotation](../resources/liber-primus/lp2-ink-annotations.json) contains **225 red runes** and **31 occurrences of the same 13-dot punctuation stencil** across the complete 58 physical LP2 pages, including the only black 13-dot stencil on physical page 7. These form **256 ordered events**, numerically equal to the **256 bytes** of the manuscript's [32-row × 8-column base-60 table](../resources/liber-primus/base60-grid.json) on pages 49–51. Their common size admits a complete one-to-one positional pairing or an 8×32 key schedule. The 13-dot stencil is one visually consistent symbol class; the source's four 10-dot and one 23-dot punctuation marks are separate classes. Including only the *red* 13-dot glyphs would yield 255 events, so the source-verified black exception matters.

This count is **retrospective**, and the rule 'red runes plus every 13-dot glyph' was constructed after seeing both source inventories. It establishes a possible *format*, with no evidence yet that either original colour or punctuation was intended as key material. The red-rune count includes solved pages 56–57; excluding those pages changes the total. The 31 stencils are mostly punctuation boundaries around isolated red spans, so the number could arise from manuscript layout.

The [runnable experiment](../sims/red_256_event_key_inverse.cjs) resolves ordering unambiguously. Events sort by physical page, rune offset, and punctuation before a rune at the same offset. Every red rune contributes its canonical GP index 0–28 and every 13-dot stencil a separate marker value 29. It checks the exact rune against the original canonical [corpus](../resources/liber-primus/lp2-corpus.json), checks the black mark, and hashes the 256 input bytes to SHA-256 `50f640c1d53b3df48a1bb6cacfb0892db26d32f54bfbef9e7c65c312ba422cae`. This digest is a reproducibility fingerprint **of the extracted event list**, not a claimed digest in the manuscript.

## Original-source inversions

Two literal register families were investigated with 256-event source-derived keys:

- **Additive GP29:** `P_i = (C_i + s K_i) mod 29`, reversible for every original rune.
- **Transparent GP-EA:** on each physical page's first rune, pass the symbol through. Otherwise if the published rune repeats its predecessor, decode GP EA=28. For a nonzero GP difference, `P_i = (log_15((C_i−C_(i−1)) mod 29) + s K_i) mod 28`. Generator 15 is the manuscript-linked primitive root of F29, and the forward mapping is exact.

The 256 events were serialized chronologically or read as a transposed 8×32 table. Four explicit mappings were compared: GP index with stencil=29, GP prime value mod29 with stencil=13, stencil-only bit, and GP-prime parity with stencil=1. Each was tested with both signs, one continuous book clock or physical-page resets, and both reversible cipher registers: **4×2×2×2×2 = 64** declared cases, with **zero fitted phases**.

The [successful original-source manual GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42850762469) tested the entire **12,956** unknown-page ciphertext. Every original candidate decoder re-encrypted all **12,956/12,956** original glyphs exactly; every one also recovered a separate original-length simulated manuscript built from known solved-Cicada source GP exactly. Total checks: **829,184/829,184** original replay symbols and **829,184/829,184** plant recovered symbols. This proves the 64 implementations are lossless. It does not select a genuine secret key, because every candidate in these bijective families necessarily re-encrypts its own decoded output.

The strongest retrospectively selected original plaintext rune index of coincidence was only **0.03532595375** (stencil indicator key, 8×32 transpose, EA transparent, negative sign, physical-page clock), near the uniform 29-symbol baseline. The original ciphertext IoC is **0.03447839786**; the native solved-Cicada control is **0.06135068204**. The winning candidate produced **508** GP E runes out of 12,956, around **3.9%**, against around **12%** in the solved-source reference. This is incompatible with straightforward native-GP readable prose under those source-fixed keys and registers; its output was never claimed as genuine plaintext.

At the unshifted chronological index pairing, the printed 256-byte table matches the 256 extracted event values in **1** exact byte position, or **7** matches against its low five bits. No direct literal table-to-event copy is evident. Those comparisons are only fixed readouts, not a test of arbitrary affine, encrypted or source-derived maps.

## What survives and next discriminatory test

The **256-event correspondence itself remains unresolved**. The literal key serializations and two direct GP output mappings fail to generate native-style original plaintext, but this does not exclude a source-derived key used in a nonlinear cipher, selected red-run spatial geometry, or the original numeric table encoding a distinct auxiliary instruction. The coincidence has no source-independent probability or evidence of Cicada authorship. The only useful successor would derive a deterministic byte/state construction from **the exact 256 events** and the **original 32×8 table** before inspecting ciphertext, then predict an independently meaningful original plaintext interval and account for all original boundaries and repeated-runic effects. Repeating the 64 direct combinations or elevating the exact count to a decipherment is unwarranted.

Reproduction: `node sims/red_256_event_key_inverse.cjs` with Node.js 22; original [manual grid workflow](../.github/workflows/grid-section-digests.yml) includes this test. No original source files are modified.
