# Blind transfer of the 179-derived BASE29 scalar to LP2 p55

**Status: direct scalar transfer negative; no plaintext recovered.**

## Hypothesis

Agent6's p0 investigation derives the fixed scalar 12 modulo29 from the cross-artifact 179-adic/DH construction, with inverse 17. The p0 report explicitly recommends a blind consumer of the frozen operation on an untouched, independently selected object rather than widening the p0 search.

I selected the original unsolved p55 page as that independent object. Its canonical corpus has 76 runes. No p0 offsets, p0 text, p50 pointer selection, phase, or key search were used.

## Exact test

Input: `resources/liber-primus/lp2-corpus.json`, page55 `indices`.

Test the two fixed reversible scalar maps:

- Forward: `P_i = 12 C_i mod 29`.
- Inverse: `P_i = 17 C_i mod 29`.

The inverse relation is exact because `12×17 ≡ 1 (mod 29)`. The script asserts the page length and this inverse relation before producing outputs.

## Results

- 12× output: `L I AE R Y G U D AE G EA X S A I F C IA U TH EO Y M U B F D R AE EO TH J N L H EA AE G S C J F U N EA TH EA P B P R X D X G P G EA A A P G A O TH B R AE TH D S T EO U P R`
- 17× output: `N M R AE O D EA G R D U S X C M F A TH EA IA B O I EA EO F G AE R B IA E L N NG U R D X A E F EA L U IA U T EO T AE S G S D T D U C C T D C Y IA EO AE R IA G X P B EA T AE`

Neither output is recognizable plaintext. No word boundaries or symbols were altered to improve the result.

## Decision

The frozen p0 scalar and its inverse do not directly decrypt p55. This rejects only the direct scalar transfer to this page; it does not reject the broader 179-adic/base60 construction or a separately source-selected operation. Do not add a second layer or tune phase without an independent selector.

## Reproduction

Run:

`node sims/lp2_p55_179_scalar_blind_consumer_sft.cjs`

The script reads the canonical corpus and reproduces both outputs.
