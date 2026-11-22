# LP2 original-word key periods 16, 181, 256 and 362: exact all-secret exclusions

**Agent 3, 22 November 2026. Classification: bounded original-source cryptanalytic exclusion of four hidden-key families, with native-source positive encrypt/decrypt controls. No unknown-page plaintext, actual author key or endpoint recovered.**

## Motivated clocks and independent rival

The manuscript has **2,896 complete printed words**, totaling **12,956 GP29 runes** with **32 words carried across physical page breaks**. The solved source includes a **16-cell (4×4) p15 square**, while the original pp49–51 numeric object is **256 cells in 32×8 geometry**. The word count factors exactly into **16×181** and **8×362**. These source dimensions nominate four physically legible periods for a *hypothetical repeating word-key alphabet*: 16 and 181 from the 16×181 word rectangle, 256 from p50's full cell count, and 362 from the eight column-sized word lanes. This is a candidate human operation, not an instruction independently signed or printed by Cicada. An external one-time key or a varying stream emitter remains a distinct rival explanation.

A secret substitution `σ_s` for each complete-word phase `s = wordIndex mod p`, with `p∈{16,181,256,362}`, maps **each current plaintext GP29 symbol** to an encrypted GP29 symbol. We allow **every one of the 29! bijections independently at every secret phase**. Fixed per-word-phase Caesar, Vigenère, affine, any p15/square-valued keyed alphabet and any complete 29-symbol substitution are all contained. A secret initial phase offset only relabels the allowable alphabets. A complete-word pre-encryption rearrangement cannot evade the resulting whole-manuscript rune-multiset inequality. A post-encryption reordering or changing keys with time is outside the model.

## Exact original-cipher all-secret capacity

For each original ciphertext word, count each of its rune values in the row `M[s,c]` corresponding to the word number modulo `p`. For **any** set of `k` candidate plaintext symbols and **any** independent hidden permutations `σ_s`, the total number of plaintext positions occupied by these `k` symbols cannot exceed

`U_k = Σ_s top_k(M[s,*])`.

This is exact: in each phase, the greatest possible `k` plaintext frequencies are simply the `k` greatest original ciphertext rune frequencies, regardless of the unknown alphabet permutation. This grants the attacker all hidden keys without enumerating them. We computed each `U1` and `U4` on the entire canonical unmodified 12,956-symbol LP2 ciphertext after reconstructing all **2,896** printed words and checking them symbol-for-symbol against the canonical page-index corpus.

| Word-phase clock | Secret GP29 alphabets | Exact U1 | Exact U4 | Decisive capacity ceiling | Within-phase IoC |
| --- | ---: | ---: | ---: | --- | ---: |
| Period16: physical p15 4×4 size | 16 | 635 | 2,338 | U4 **18.0457%** | 0.0345093 |
| Period181: 2,896÷16 | 181 | 1,063 | 3,624 | U4 **27.9716%** | 0.0338905 |
| Period256: p50 table cell count | 256 | 1,226 | 4,021 | U4 **31.0358%** | 0.0340394 |
| Period362: 2,896÷8 p50 columns | 362 | 1,377 | 4,471 | U1 **10.6283%** | 0.0338007 |

For calibration independent of the ciphertext and unknown decoder, the SFT encodes pinned English corpus passages into **authentic GP29 source orthography** (including source-verified `ING→ᛝ` and `IO→ᛡ`), and measures **505 complete 12,956-rune windows** at stride503:

- **Gibran**, 99 windows: minimum observed top-one **1,423** (**10.9833%**), top-four **4,373** (**33.7527%**).
- **Shakespeare**, 406 windows: minimum observed top-one **1,409** (**10.8753%**), top-four **4,266** (**32.9268%**).

All three period16/181/256 **U4** ceilings are below every native control's top-four population. Period362, although its **U4=4,471** is permissive, fails every native control's **top-one** population: the maximum possible native single-rune count is **1,377**, while the independent source-native minimum is **1,409**. Thus none of the four proposed key clocks can decode the original full book directly into source-normal English under any assignment of its arbitrary secret phase-wise alphabet.

These are finite whole-corpus comparisons, not universal impossibility theorems for every conceivable English writing style. The 505 source windows overlap, so they are calibration cases, not independent Monte Carlo p-values. A cryptogram with unusually flat, non-native GP29 plaintext, an evolving phase-specific key, a page-specific key, or an additional source-selected operation can evade the stated model.

## Genuine plaintext positives and decision

For **each** period, the read-only test takes a genuine **12,956-rune Gibran source passage**, partitions its GP rune stream into the exact original 2,896 word-length slots, and encrypts it with a deterministic sample of **p independent arbitrary 29-way secret alphabet bijections** selected by complete-word ordinal modulo p. It decrypts the full stream with the true inverses and asserts exact **12,956/12,956** plaintext recovery. Its planted ciphertext's all-secret concentration ceiling is necessarily at least the source plaintext's true top-four GP rune mass, preventing a mistaken rejection arising from the test code.

**Reject a repeating fixed 16-, 181-, 256- or 362-word GP29 substitution key as a direct source-native LP2 decoder.** The p15 square and p50 table still may have roles as a distinct *changing* state source, a mixed-radix sidecar, or navigation clues. Their sizes alone supply no authenticated key schedule. Do not rescue these four exhausted stationary families by introducing arbitrary per-page exceptions or resegmentation without a new original clue.

Reproducer: [`sims/lp2_wordphase_16_181_256_allsecret_sft.cjs`](../sims/lp2_wordphase_16_181_256_allsecret_sft.cjs), Node.js22/CommonJS on Windows, with one true original-source input and two independent native English GP29 controls. This is distinct from the [original word-length/within-word-position all-secret test](lp2-wordlength-resegment-allsecret-original-gate.md), whose hidden key states are based on **word length and within-word rune position**, rather than the current clock's **absolute printed whole-word number**.
