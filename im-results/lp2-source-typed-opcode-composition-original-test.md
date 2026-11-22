# Source-typed short Cicada opcode composition on original LP2

**Decision, 22 November 2026, Director #2202:** A frozen, 24-member family built from three *historically reproduced* rune-preserving operations yields **no readable unknown-page passage**. The best program selected on physical p16–21 is **VIG with a fresh key on each physical page**, which yields nonlinguistic text on 3,008 entirely separate original p40–53 runes. The exercise supplies neither authentic LP2 plaintext nor a source-selected new key. It excludes only the explicit finite grammar below.

The complete, independently rerunnable Node.js 22 CommonJS implementation and its full 3,008-rune held-out transliteration are [`sims/lp2_source_typed_opcode_composition_sft.cjs`](../sims/lp2_source_typed_opcode_composition_sft.cjs). The original file was executed in [Windows Actions run 45002556101](https://github.com/FlareZ123/liber-primus/actions/runs/45002556101), **PASS**, with exact original-cipher re-encryption for every candidate and the held-out output. No other workflows were created.

## Starting evidence and source fidelity

The 2014 Stage04 runic small image genuinely used the period phrase **WELCOME PILGRIM TO THE**. After native GP spelling, its 18 rune indices are `[7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18]`; subtracting them in the original documented GP index convention reproduces the 18-symbol 2014 original and its embedded literal digits. The source permits GP `IA/IO`, `C/K`, and `S/Z` alternatives. The SFT explicitly accounts for `IA/IO` at the last symbol, instead of silently treating a transliteration variant as a failed decryption. The independent baseline is [`stage04_small_image_vigenere_repro.cjs`](../sims/stage04_small_image_vigenere_repro.cjs).

The 2014 Stage05 original seven-symbol rearrangement **[0,6,2,5,1,4,3]** reconstructs `TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133` from the published 56-character source. This is an exact historical operation: [original transposition control](../sims/cicada2014_stage05_blind_width_key_original_sft.cjs).

The authentic solved LP2 physical **p56** original cipher has **85 runes** and exactly **one** plaintext-literal F at original position56. The script reproduces all 85 using negative consecutive-prime totients from prime2 with the F bypass non-consuming. [Independent solved-cipher regression](../sims/authentic_lp2_p56_totient_regression.cjs).

Operations that cannot directly act on a rune stream without another historical input were **not** coerced into substitute ciphers. BASE29 takes numeric operands; GZIP acts on bytes; OutGuess needs a JPEG and a sourced password; book-coordinate reading needs an indexed book. No original LP2 source selects those missing type conversions.

## Frozen original-input grammar and held-out prediction

- Alphabet: original 29 GP rune indices, preserving order, 29-symbol frequency and source page segmentation.
- Operators: `PHI`, subtract consecutive-prime totients; `VIG`, subtract the published 18-index Stage04 phrase; `COL7`, exact seven-item row read order.
- Program length: one or two operations, ordered; clocks either reset at each physical page or continue through the chosen chapter. No word resets or page-dependent keys. No secret offset, key tuning, unknown-page F bypass, permutation search, or replacement cipher alphabet.
- **Extension explicitly not demonstrated in the 2014 source:** for a physical section ending mid-seven-row, leave remaining fewer than seven runes in original order. All 24 such candidate programs are reversible; only 22 produce distinct p16–21 training outputs.
- Model: native-GP Laplace-smoothed trigram language score based on solved LP1 transcription, fixed before candidate evaluation. Original p16–21 **1,613** runes alone select the winner. A separate authentic p56 decrypted control scores **−2.4361899127543354** under that fixed model.
- The top training candidate is **page-local VIG**, score **−3.4039208497235878**, index of coincidence **0.03447639295488424**. Runner-up page-local PHI scores −3.4085057355724646. A synthetic original-length source-native composition implant `VIG,COL7` decodes exactly and forward replays, establishing mechanics only.
- The unchanged training winner predicts independently withheld **p40–53** (13 rune-bearing physical pages; p50 is numeric). Held-out score **−3.4177797534870624**, index of coincidence **0.03447607178993695**. The original-input output contains extensive implausible native digraph strings, with no 200-rune coherent passage. Re-encryption is exact, which is an invariant of all reversible candidates rather than evidence of a true historical key.
- Full held-out GP-index byte-array SHA-256: `a2f7b298c7e26273717c873abbcd89cd107978a2ce3740a574f32bea7a52b04f`. The full 3,008-rune GP transliteration is in the linked Actions test JSON under `frozenDisjointPrediction.completeGpTransliteration`. It begins `OELEANGORWAXOEHOEIAOEEOFTIAXIFCPEOJGXXEOMAYBMRITH...`.

## Inference and next fork

There is **no first-party LP2 instruction** assigning the 2014 VIG phrase, prime-totient starting clock, or seven-column row order to unknown physical pages. Source-authored F bypass behavior on unsolved pages is also unspecified. The Stage05 column operation mixes rune positions across original word boundaries; treating those transformed positions as literal printed word boundaries would require a further source rule. The seven-row tail rule here is openly a completion convention, not a recovered historical mechanism.

Retire this **fixed one/two-stage** family. This cannot exclude longer compositions, a missing 2014 key artifact, a different image-selected opcode, or a cipher with a hidden but recoverable source-specified state. Any successor should produce an independent operand or full new reversible rule before scoring more original unknown pages; otherwise it repeats the same underconstrained search.

**Evidence classification:** verified historical positives, complete bounded original-input negative, successful original reencryption and synthetic planted positive. **Recovered LP2 p0–55 plaintext: none.**
