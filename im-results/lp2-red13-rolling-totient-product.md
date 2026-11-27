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
