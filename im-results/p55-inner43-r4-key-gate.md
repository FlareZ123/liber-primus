# p55 strict-interior repeating key under the R4 channel

**Disposition: negative for this key interpretation.** The p55 strict-interior sequence and its central five do not behave as repeating GP29 keys under the tested R4 collision-repair / keyless-null model. This does not disprove R4 itself, nor the separate p55 prime-sum checksum relationship.

## Source-fixed extraction

The parser covers the 55 rune-bearing LP2 pages (the numeric p50 grid has no runes), preserving words that cross page boundaries. It yields **2,896 words, 12,956 runes and 32 cross-page words**. Physical p55 is rune-bearing page index 54. Its 16 complete contained words have **43 strict-interior runes** after removing the first and last rune of each word.

The extracted key, in GP transliteration, is:

`M I EO G D TH IA A B C EA F X I M U C P H NG L S D IA P H EO E I G X G S EO TH TH E EA I M C J E`

Its central five, positions 19–23 (zero-based), are **[21,20,15,23,27]**. Their GP-prime weights sum to **401 = 13×29 + 24**, yielding BASE29 `PA`. This preserves the previously documented checksum observation; it does not make the five symbols a cipher key.

## Tested model and decision

The independent R4 hypothesis combines additive GP29 keying, collision probability (q=0.81), within-word lag-six repair (T(c_{i-6})=(24-2c_{i-6})mod29), random-other fallback during the first six positions or when T collides with the predecessor, and one checked keyless interior rune inserted after collision repair in 45% of eligible plaintext words. The two collision-clock variants are **hold** and **spend**.

The decoder uses the repository's word-position GP unigram model trained on Shakespeare words 600–50,000. It evaluates both key orientations, both additive signs and both hold/spend clocks. The 43-key screen compares fixed phase zero by Viterbi and unrestricted initial phase by sum-product. Controls are deterministic length-matched shuffles and random 43-rune keys. The central-five order is ranked against all 120 permutations.

## Results

| Test | Result |
|---|---:|
| Synthetic R4 positive control: correct key vs random key | **−2,155.55 vs −4,183.90** |
| Positive-control advantage | **2,028.35 log-likelihood units** over 865 ciphertext runes |
| Original 43-key, fixed-phase Viterbi | 10/20 controls score higher; empirical (p=0.524) |
| Original 43-key, free-phase sum-product | 3/10 controls score higher; empirical (p=0.364) |
| Central-five key, Viterbi permutation rank | **20/120** |
| Central-five key, sum-product permutation rank | **20/120** |

The synthetic plant demonstrates that the decoder distinguishes its true source key from a wrong key under the same channel. The original p55 key does not produce that behaviour: it is ordinary relative to matched controls, and the central-five order is not unusually ranked among its 120 permutations.

## Conclusion and scope

Retire these specific interpretations: (1) the 43 p55 strict-interior runes as a continuous repeating GP29 key under R4; (2) the central five [21,20,15,23,27] as a period-five GP29 key under R4.

Do **not** infer that the R4 statistical channel is false. Do not erase the independent 401→PA / p54-red-24 checksum observation; it remains an intermediate source relationship, not a key or decryption. The test does not cover a different source-selected key schedule or a page-reset clock; neither should be pursued without a new primary clue selecting it.

## Reproduction

Run from the repository root:

```bash
node sims/p55_inner43_r4_key_gate.cjs
```

The script reads the original transcription, canonical GP alphabet, and Shakespeare reference corpus; asserts the 2,896/12,956/32 parse and 16/43 p55 extraction; regenerates the synthetic control; and prints deterministic control results.

R4 model reference: [pnotisdev/cicada3301, phase57 mechanism at commit 15200c67](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase57_mechanism.md). Local language model: `sims/outer_permutation_word_context.cjs`.
