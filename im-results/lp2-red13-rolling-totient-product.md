# Red13 rolling prime-product totient receiver

Agent7, 27 November 2026. **No original plaintext.** One source-motivated but unauthenticated feedback composition, distinct from cumulative GP-prime sums, multiplication modulo3301, previous-word feedback, and static title key.

The original p0 red heading has 13 runes [15,8,18,3,6,19,27,0,15,26,18,21,5] before the red 13-dot separator and 249 black body runes. The complete chapter remainder has 716 runes. LP1 p05 explicitly calls primes and the totient function sacred. Use the red heading in its actual order as a 13-position rolling history h. At each consuming symbol compute K = phi(product GPprime(h_j)) mod29, emit C=P+sK mod29 (s=±1), then drop the oldest history element and append either P or C, two different causal roles. No resets, no shifted or permuted seed. Under transparent F, P=0 emits C=0 and does not update h. The source motivates operands but does not prescribe this receiver.

If a GP-prime occurs m times in h, its contribution to the totient is (p-1)*p^(m-1). In particular the presence of GP-prime59 (index16) or two occurrences of GP-prime29 (index9) forces K=0 mod29. This is exact and predicts visible plaintext runs whenever those history conditions persist; it also makes the candidate implausible for original near-uniform prose ciphertext.

Exact inverse: the next consuming P is determined by h and C. At visible zero branch to literal hold, and include the consuming branch only if its recovered P!=0. Merge equal h and last two plaintext runes, add BigInt path counts, retain maximum trigram score. Counts are exact; MAP is exact within the fixed independent model. No lexical segmentation. Models use Shakespeare, Emerson and native solved text, no Gibran training. Fixed seed; 249-rune fit region and 467-rune continuation. No key fitting or continuation retuning.

Two disjoint 716-rune Gibran plants at starts2001 and12001 for all eight settings recover **11,456/11,456** plaintext runes. All replay exactly; maximum 14 dynamic states; no clipping. The eight transparent-F plant MAP paths recover all runes despite 108–49,152 complete legal histories. Their continuation scores are -2.22593 and -2.27857 nats/rune.

| History role | Sign | Ordinary held score | Literal-F first impossible offset (zero-based black body) |
|---|---:|---:|---:|
| P | -1 | -6.74912 | 27 |
| P | +1 | -6.98979 | 116 |
| C | -1 | -6.64909 | 3 |
| C | +1 | -6.32361 | 196 |

All four transparent-F original paths exhaust before the end of the 249-rune p0 body. All ordinary variants replay 716/716, produce nonprose and score far below controls on frozen continuation. This rejects only the named 13-rune seed, product-totient/mod29 rolling feedback operation and signs. It does not authenticate the title as key or exclude every totient/history law. No arbitrary modulus or history-length sweep.

[Standalone SFT](../sims/lp2_red13_rolling_totient_product_sft.cjs) · [raw result](lp2-red13-rolling-totient-product-output.json). Exact core executed in connected V8; Node wrapper not separately executed.

## Unknown-history inversion by forced-clear synchronization

The GP weight of T is 59, whose totient is zero modulo 29. A consuming T in the feedback history therefore forces the next 13 consuming shifts to zero. Their ciphertext gives their plaintext and the entire post-anchor history. With transparent F, visible zero must be a hold during that interval: a zero-shift consuming branch cannot encode plaintext F. This recovers a later state without guessing any of the 29^13 possible initial histories.

Use every prospective anchor at offsets 0–128 for plaintext feedback, only actual T offsets for ciphertext feedback. All original synchronization windows finish by offset 142. Fit on offsets 160–248, freeze the best history at offset 249, and evaluate the remaining 467 runes. Sixteen controls with random hidden initial histories recover **7,472/7,472 held runes** and replay exactly. They reuse two donor intervals across eight settings. The inverse does not recover the initial history or discarded prefix.

| Role/sign | Ordinary best held score (even oracle selection) | F-hold complete suffixes / candidate anchors |
|---|---:|---:|
| P− | −6.71317 | 0/122 |
| P+ | −6.39426 | 0/122 |
| C− | −6.64909 | 0/2 |
| C+ | −6.32361 | 0/2 |

The C-driven F-hold case is impossible for every initial history, since the two actual early T symbols must consume. For P-driven F-hold, exhaustive testing of all 716 prospective positions, granting arbitrary prefixes, finds no possible T in the first 436 runes for either sign. Earliest potentially legal anchors are 436 (minus) and 524 (plus); the final 14 positions are unclosed and explicitly granted. Maximum exact state count 15; no caps. Across all 47,369 length-716 contiguous Gibran windows, the minimum number of T runes in the first 436 is nine. This excludes every such donor under both signs and arbitrary initial history; it is not an exclusion of arbitrary nonprose. Ordinary P-feedback still conditional on an early T and the language model. No original plaintext recovered.

The reusable result is a zero-factor synchronization attack on rolling multiplicative feedback, not authentication of this receiver. Retire the stated operation absent independently selected evidence.
