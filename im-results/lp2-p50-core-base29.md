# Inner-grid integer: lossless GP29 receiver

The existing [radix-shed investigation](lp2-p50-radix-shed-circumference-divinity.md#7a-source-shaped-255-bit-inner-core-candidate-and-direct-aes-256-original-input-gate) tested a 255-bit candidate as an AES key. This distinct native receiver treats the same integer as a periodic GP29 key without a hash, modulus truncation, padding, or new permutation. The candidate is conditional on the previously proposed f-deleted base59 reading and two-shell peel; neither that hypothesis nor the periodic consumer is authenticated.

Take the 28×4 interior in printed row-major order. For each token compute radix60 value minus f-deleted radix59 value. Interpret the 112 resulting digits as an unsigned base-five integer, and convert exactly to its shortest big-endian base29 digit sequence. This gives the prior hex `55f78eab5d76f4d9f577829b25c560fbc83e7a5ff90e1381be067f7957995987` and a 53-rune key. Apply C=P+K mod29, with plaintext F emitting F without advancing the key. At ciphertext F, enumerate both possible legal preimages; consuming plaintext F is disallowed. Use the fixed page-55 origin zero as the principal target because the existing candidate TUNNELNG pointer selects p55. Diagnostic all-phase reachability is exhaustive. A native bigram model trained on the seven LP1 solved sections ranks complete paths (Laplace unigram, 0.5 additive bigram smoothing); no LP2 native test text enters training.

## Executed results

The genuine p56 prime-minus-one stream with the same hold convention reproduces 85/85 original ciphertext runes. Independent of training, the p57 and p56 plaintext controls encrypted under the candidate key recover 95/95 and 85/85 runes by MAP at the known phase. These are receiver controls, not evidence the original candidate key is authentic.

| Physical scope (end exclusive) | Runes | Phase-zero legal prefix | Longest prefix over 53 phases | Complete paths |
|---|---:|---:|---:|---:|
| 0–3 | 729 | 14 | 381 | 0 |
| 3–8 | 1145 | 18 | 356 | 0 |
| 8–15 | 1729 | 18 | 309 | 0 |
| 15–23 | 1903 | 56 | 172 | 0 |
| 23–27 | 1021 | 6 | 168 | 0 |
| 27–33 | 1433 | 9 | 310 | 0 |
| 33–40 | 1680 | 68 | 275 | 0 |
| 40–54 | 3008 | 80 | 157 | 0 |
| 54–56 | 308 | 2 | 221 | 0 |
| 55–56 | 76 | 76 | 76 | 45 |

The isolated p55 phase-zero solution has 2 legal paths and best score -3.905292 nats/rune; best diagnostic all-phase score -3.785662 at phase 10. Native controls score -2.628781 and -2.676895. The fixed-phase ordinary consuming subtraction also gives nonprose (-3.934348). Neither p55 candidate is a readable sentence. The preceding p54–55 scope has no complete inverse even over every start phase. No new plaintext or key is authenticated.

**Decision:** retire this exact native periodic GP29 consumer of the candidate integer; the isolated p55 result is a language-based negative, while the longer scopes are exact reachability negatives. No tuning of radix, key length, orientation, hash or phase is supported. The broader inner-grid hypothesis remains conditional, and these tests do not establish a general exclusion of every consumer.

Reproduce: [Node CommonJS SFT](../sims/lp2_p50_core_base29_sft.cjs), [actual connected V8 output](lp2-p50-core-base29-output.json). Physical scope starts are diagnostic physical-page ranges, not exact red-title chapter boundaries. No separate Node CI execution claimed.
