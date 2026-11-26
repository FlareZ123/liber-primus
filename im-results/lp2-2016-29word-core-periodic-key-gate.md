# Signed-2016 29-word core as a period-29 key: exact F-hold gate

**26 November 2026. Intermediate result; no unknown plaintext or authentic key recovered.**

## Hypothesis

The authenticated 2016 OpenPGP message has a contiguous 29-word core, from **THE** through **DIRECTION**. The Gematria Primus alphabet has 29 symbols. A plausible human attempt is to use the 29 signed words in source order as a period-29 key register: compute each word's Gematria-prime sum, reduce modulo29, and apply the known p56-style additive receiver. A second direct variant applies the established prime-minus-one convention to each rune in the word before summing.

This is a bounded source-derived candidate, not an instruction explicitly stated by Cicada. The signed message does not say that its own 29-word core is a repeating key, or specify a cipher direction. The test therefore freezes only the two low-description numeric serializations, both signs, phase zero, and one continuous clock across the original p0–p55 stream. No key phase, word permutation, page reset, or fitted offset is searched.

The 29 words are taken from the authenticated message after its opening HELLO and end at DIRECTION. The source-attested ING spelling is used for MEANING (M + EA + N + ING), giving prime sum 288.

## Exact receiver

For each key value K at current phase j, test the additive inverse P = C ± K[j] modulo29. Apply the solved p56 plaintext-F convention:

- If ciphertext C is F (index 0), plaintext F may be emitted without consuming the key.
- A non-F plaintext consumes one key value.
- A consuming branch that produces plaintext F is illegal; F is transparent rather than encrypted.

Track every reachable key phase exactly. This is a finite algebraic reachability test, not language-model pruning. The input is the corrected original corpus: **2,896 complete printed groups and 12,956 runes** on p0–p55, with all 32 real page-crossing words preserved.

## Key registers

Word prime sums modulo29:

\`14,0,21,24,1,21,14,14,11,9,26,14,16,27,5,1,14,8,27,27,26,14,1,12,27,5,1,14,18\`

Sum of per-rune prime totients modulo29:

\`12,26,17,19,22,16,12,7,6,3,24,12,13,24,0,27,12,5,23,23,24,12,26,9,23,27,27,12,9\`

## Results

| Key serialization | Direction | First impossible zero-based rune offset | Ciphertext at failure | Reachable phase(s) before failure | Key value(s) |
|---|---:|---:|---:|---|---|
| Word prime sums mod29 | C−K | **51** | 26 | 20 | 26 |
| Word prime sums mod29 | C+K | **0** | 15 | 0 | 14 |
| Sum of per-rune prime totients mod29 | C−K | **43** | 13 | 12 | 13 |
| Sum of per-rune prime totients mod29 | C+K | **118** | 2 | 25, 26 | 27, 27 |

All four candidate receivers become impossible within the first 119 original p0 runes. At each listed failure, every still-reachable phase would require a consuming plaintext F from a non-F ciphertext symbol, which the established transparent-F rule forbids.

**Positive control:** the same F-hold transition and key/sign combinations were planted into a 12,956-rune GP-transliterated Gibran control. All four synthetic ciphertexts retain a complete legal inverse path. This checks the reachability implementation and the F-hold transition; it does not authenticate the key.

## Reproduction

Run from the repository root:

\`node sims/lp2_2016_29word_core_periodic_key_sft.cjs\`

The script reads the signed 2016 message, canonical GP29 prime table, corrected physical transcription, original p0–p55 corpus, and Gibran control. It asserts the 29-word core, 2,896/12,956 input counts, the four exact failure offsets, and four complete synthetic positive controls.

## Decision

Retire only the direct period-29 additive key formed from the 29-word signed-message core's prime sums or summed prime totients, with the p56 transparent-F rule, printed order, phase zero, and continuous p0–p55 clock. The 29-word/29-symbol correspondence remains a real structural match, but it does not yield a legal inverse under these simple key consumers. Do not rescue the hypothesis with arbitrary phases, word permutations, or page resets absent a new source instruction. Other roles for the 2016 words, and genuinely different cipher architectures, remain open.

This is distinct from the earlier 43-word key against p55's 43 strict interiors, the two-dimension-word stream-key tests, and the base-58 word-to-page navigation hypothesis. It supplies no plaintext, key, or external destination.
