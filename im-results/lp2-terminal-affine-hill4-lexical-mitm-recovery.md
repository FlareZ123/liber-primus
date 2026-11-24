# LP2 terminal p54–55: blind affine Hill4 key recovery from complete words

Agent 7, 2026-11-24. A new constructive all-key attack on the short terminal chapter, where the earlier frequency-only Hill4 exclusion was explicitly inconclusive. No authentic unknown plaintext/key is claimed.

## Model and source alignment

The final physical p54–55 chapter has 308 original runes and a nine-rune red title; the complete source interval is global [12648,12956). Its exact multiple-of-four length and the independently reconstructed p15 4×4 square motivate this candidate but do not select Hill4 as a creator operation. Test every fixed block phase 0..3 and a completely secret invertible affine inverse

```
P_block = M C_block + b mod29,
M arbitrary nonsingular 4×4, b arbitrary length4.
```

All 20 coefficients are free. The source word parser is independently aligned against every canonical original rune. Word boundaries remain unchanged; only full words within the black-body and complete-block intervals are used for constraints. Untested prefix/tail fragments at nonzero phases are explicitly excluded. No assumed F skip or per-block changing key.

## Exact dictionary attack

The repository TextBlob spelling fixture plus pinned Shakespeare, Gibran and Emerson form a finite lexicon of 32,079 distinct source-native GP29 rune words. Each pair of complete words of lengths at least eight and combined length at least 21 is eligible if it determines rank five for each of the four inverse rows. The longest three positions are global 12903 (13 runes), 12870 (11), and 12708 (10); a second ten-rune word begins 12858.

For each pair, augment the block's four ciphertext coordinates with a constant 1. Each proposed word yields one linear equation per plaintext rune, belonging to the appropriate matrix row. Exact GF29 elimination yields all left-nullspace constraints on the concatenated two-word plaintext vector. Hash dictionary words by their contribution to those constraints, join all complementary pairs, recover all 20 key coefficients, and retain only invertible keys. This enumerates every affine key compatible with that pair's finite dictionary domains, without enumerating 29^20 keys or fitting a language score. The longest remaining complete word is then an independent lexical test, and surviving matrices are checked against the other body words.

| Phase | Eligible anchor pairs | Compatible pair assignments | Invertible key occurrences | Keys passing the untouched third word |
|---|---:|---:|---:|---:|
|0|8|427,907|411,995|0|
|1|9|496,686|478,480|0|
|2|9|494,377|476,368|0|
|3|9|483,309|465,505|0|

Counts are per anchor-pair occurrence, not necessarily distinct keys across pairs. The strongest fixed pair, 13+11 runes, has four exact parity constraints and yields only 2,1,1,1 invertible candidate keys in phases 0,1,2,3 respectively. None decodes the unchanged ten-rune held-out word at 12708 to a dictionary word.

This excludes the stated stationary affine Hill4 family on the terminal interval **conditional on the finite GP dictionary membership of the relevant anchor and holdout words**. In particular, the longest fixed three-word witness suffices for every phase. It is not an unconditional impossibility theorem for all possible natural language, other orthographies, or changing keys. It does not rely on the earlier weak terminal Fourier statistics.

## Blind solution-capability controls

Use a deterministic independently drawn word from the same finite dictionary for each exact original terminal word length, encrypt the complete blocks under a hidden 4×4 invertible matrix and nonzero four-vector. On every phase the identical attack recovers one distinct matrix after the independent third-word test, with exactly the true 20 coefficients:
```
3 7 19 11 | 9
0 5 2 13 | 4
0 0 9 17 | 26
0 0 0 21 | 12
```
All 308/308 runes at phase zero and all 304/304 complete-block runes for each other phase decode exactly. All eligible withheld body words are recovered. The plant is source-shaped dictionary data, not genuine unknown text.

## Reproduction

`node sims/lp2_terminal_affine_hill4_lexical_mitm_sft.cjs` reads canonical source, shared complete-word parser and four existing lexicon sources. The exact original runs and all four full recovery controls were actually executed with the checked-in file contents in the connected V8 runtime; no CI claim. Program reports per-pair counts, recovered matrices, and asserts exact plant plaintext.
