# Original LP2 83 single-rune cribs: bounded prime-word-key inverse

**Decision, 16 November 2026 (Agent30):** The first eight original LP2 chapters reject a precisely defined affine nth-prime word-clock key using *only* one-rune words, even allowing each chapter an independently free 29×29 slope/intercept. Original terminal pp54–55 has only two cribs and leaves four (A/I) or nine (A/I/O) keys. No new unknown plaintext or historical key has been recovered.

## Source cue, fixed grammar and rival

The printed manuscript itself calls attention to primes and the totient and visibly preserves one-rune words. The specific hypothesis fixed for this original test is **C[i] = (P[i] + a×prime(wordOrdinal+1) + b) mod29**, where all runes of a printed word share the same key. The *primary* word ordinal restarts at the original decorated chapter starts p0, p3, p8, p15, p23, p27, p33, p40, p54. All 841 (a,b) pairs are allowed separately **in every chapter**. A globally continuous word ordinal is an independent fixed control. This operation is a human-plausible candidate, **not an author-selected original instruction**. The rival explanation is that real original word breaks are cipher framing or that the actual encryption has a different, stateful key clock.

The cipher's GP29 A=24 and I=10 make each singleton ciphertext `c` constrain a proposed key to `{c−24,c−10} mod29`. The separate vocative-O sensitivity check adds O=3, yielding three candidates. The other 12,873 original ciphertext runes do not affect these tests.

## Exact original-input results

The canonical original rune source and parser check 12,956 runes, 2,896 printed words, **32 genuine cross-page continuation words**, and exactly **83** singletons using **28** ciphertext glyphs. Physical p50 is a zero-rune numeric grid and does not advance the clock.

| Original chapter | One-rune words | Surviving A/I keys | Surviving A/I/O keys | Earliest contradiction (A/I, A/I/O) |
|---|---:|---:|---:|---|
| p0–2 | 5 | 0 | 0 | 3, 3 |
| p3–7 | 8 | 0 | 0 | 4, 4 |
| p8–14 | 11 | 0 | 0 | 3, 4 |
| p15–22 | 18 | 0 | 0 | 3, 3 |
| p23–26 | 5 | 0 | 0 | 3, 4 |
| p27–32 | 12 | 0 | 0 | 4, 4 |
| p33–39 | 9 | 0 | 0 | 3, 4 |
| p40–53 | 13 | 0 | 0 | 3, 3 |
| p54–55 | 2 | **4** | **9** | none |

The prime-residue/intercept rows in each chapter have **rank two over GF(29)**. The final two one-rune positions therefore give four or nine exact solutions, respectively. For chapter p0–2, the first three witnesses are p0 local176 / global176 / chapter word39 / prime residue28 / ciphertext28; p0 local244 / global244 / word54 / prime residue25 / ciphertext15; p1 local88 / global350 / word79 / prime residue3 / ciphertext9. A/I survivor counts shrink **841 → 58 → 4 → 0** (A/I/O **841 → 87 → 9 → 0**). This algebraically rejects this chapter's model without any language scoring. With the *global* word clock, the full 83-site original mask also gives zero A/I and A/I/O candidate keys, first contradiction at the third observation.

Without a fixed compact generator, independent per-singleton additive keys still offer exactly **2^83 = 9,671,406,556,917,033,397,649,408** A/I assignments or **3^83 = 3,990,838,394,187,339,929,534,246,675,572,349,035,227** A/I/O assignments. The 83 cribs cannot identify one of those pads without a source-selected key rule.

## Native controls, reproducibility and proper scope

The [single-file CommonJS test](../sims/lp2_singleton_primeword_crib_solver_sft.cjs) performs all original checks and creates four full **12,956-rune GP29 planted streams** using cyclically repeated *original clear* LP2 p57 paragraph as filler, with the exact 83 original singleton sites explicitly replaced by alternating A/I. Each plant uses seed pair (7,13) or (11,2) under the chapter-word and global-word clocks. All complete forward/inverse transforms round-trip exactly, the known planted key survives the mask, and a separately wrong seed fails. These are algebraic controls with clear GP source text **and imposed singleton positions**, not untouched natural English paragraphs; they do not calibrate prose likelihood. **[Windows Node22 manual CI 43826432356 passed](https://github.com/FlareZ123/liber-primus/actions/runs/43826432356)** with the exact repository source script.

This finite exclusion concerns a **word-static additive affine nth-prime key** only. It does not exclude other prime operations, F-transparent skips that alter actual key-pointer advancement, alternative clocking, nonadditive output functions, source-derived secret pads or altered punctuation. An eventual candidate needs an authentic key/operation source, ≥150 contiguous **held-out** original plaintext runes, and full forward reencryption. Further use of the 83-site gate is appropriate when such a source-selected generator has first been specified.
