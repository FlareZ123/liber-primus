# Previous-plaintext-word sum as a mod-29 ciphertext-feedback key: exact original-input negative

**Classification (22 November 2026, Agent7): completed bounded source-shaped cryptanalytic experiment, not authenticated plaintext recovery or established original cipher.** The clear-signed 2016 Cicada message treats words/numbers/direction as a map and the original LP2 print preserves 2,896 entire rune words. These are independent reasons to consider a *word*-state update. They do **not** identify the specific mechanism below. This experiment closes that one-stage reversible candidate under two source-natural sum definitions and a finite original-period English word register; it makes no claim about other word-state machines.

## Precisely reversible proposed cipher

Represent the authentic 29 Gematria Primus runes by their canonical values 0–28. Let `C_i` and `P_i` be ciphertext and plaintext runes within preserved whole printed words, and let `K_w` be the key for word `w`. At every position of that word apply

```text
decrypt:  P_i = (C_i - C_(i-1) + K_w) mod 29
encrypt:  C_i = (C_(i-1) + P_i - K_w) mod 29
next-key: K_(w+1) = (SUM of this plaintext word's values) mod 29
```

Both next-key definitions are tested separately: **GP0:** values are the GP29 indices 0–28; **prime:** values are the authentic 29 GP prime weights, beginning F=2,U=3,TH=5. The preceding **cipher** rune carries across printed words within each tested interval; the initial key is *unknown* but has exactly **29** possibilities, exhaustively enumerated. The word-state feedback is deterministic after that first key, without unconstrained dictionary-dependent per-word key selection. The readable output retains the precise original word boundaries, including all 32 cross-page carries.

This is a chosen original-source-shaped mechanism, **not** a rule authenticated by Cicada. In particular, the signed 2016 wording does not specify ciphertext differencing, this key sign, the preceding-plaintext-word sum or the modulus29 update.

## Source input, code and exact original results

The self-contained CommonJS [reproducer](../sims/lp2_previous_plainword_sum_all29_sft.cjs) uses only the existing canonical [LP2 transcript](../resources/liber-primus/lp2-transcription.txt), [full 29-rune GP corpus](../resources/liber-primus/lp2-corpus.json), existing page-carry parser and [source-native GP English encoder](../sims/lp2_native_gp_source_orthography_sft.cjs). Source words for the finite lexical check come from the existing Gibran *The Prophet* control, yielding **2,482 distinct canonical GP rune words**. All **2,896** original LP2 words, **12,956** original rune positions and **32** cross-page words are asserted. The code also includes original-source p56/p57 checks through the canonical GP index table.

A genuinely **known** clear-text positive from the original artifact is p57: all **20 original words / 95 GP runes** are encrypted under both hypotheses at nonzero seed17, completely decrypted, and exactly forward re-encrypted. This establishes the implementation's reversibility, without treating arbitrary original unknown ciphertext as a positive.

For each untouched page-local interval we tested **all 29 initial keys** with the original immediate preceding ciphertext rune. Where a visually selected heading/body boundary might reset a clock, the separately reported zero-predecessor alternative was also charged. These are the best candidate word dictionary hits, **maximized over every possible initial key**:

| Original physical receiver | Whole original words | Runes | GP0-sum best | GP-prime-sum best |
| --- | ---: | ---: | ---: | ---: |
| p0 black body, beginning original rune offset13 | 56 | 248 | 3 words / **7 runes** (seed18) | 2 words / **6 runes** (seed2) |
| p8 black body, beginning offset12 | 48 | 242 | 2 words / **5 runes** (seed8) | 1 word / **2 runes** (seed16) |
| p55 first complete word onward, offset1 | 16 | 75 | 1 word / **2 runes** (seed6) | 1 word / **2 runes** (seed21) |

Both p0 and p8 output have maximum **one consecutive** native-dictionary word. The p55 output matches only one two-rune word. The alternative page-reset `C_(i-1)=0` does not improve these maximum word/rune-hit counts. Across **all 55 rune-bearing physical pages**, the best page-local original GP0 counts are **11/253** rune hits at p9 and **11/259** at p48, each using at most five isolated small words; the best prime sum page is **8/209** rune hits at p23 or **8/231** at p27. Other short-page ratios are higher solely because the denominator is small. These outcomes provide no coherent plaintext passage under the strict source-native register.

**Verification:** Windows Node.js 22 [PASS run 44968187778](https://github.com/FlareZ123/liber-primus/actions/runs/44968187778), after correcting page-local starting ciphertext to the true original predecessor. Prior [PASS 44967867091](https://github.com/FlareZ123/liber-primus/actions/runs/44967867091) separately records the zero-predecessor case. CI tests succeeded for every executable assertion.

## Consequence

The exact two single-stage *previous-plaintext-word summed feedback* variants should be retired as plaintext decoders for original GP-English word-for-word LP2. Exhaustive seed recovery precludes a missed initial key within these forms; the positive source plaintext and forward encryption demonstrate mechanical correctness.

Remaining uncertainty: variable word boundaries, different linguistic register, nested encryption layers, source-selected resets **inside** a word, other state operations and wholly different key derivation remain open. The historical 2016 map language supplies a word-based research motivation only. **Neither a creator key nor unknown LP2 plaintext has been recovered.** Reopen this branch only if an independent original clue specifies the differencing rule or a non-English intermediate register.
