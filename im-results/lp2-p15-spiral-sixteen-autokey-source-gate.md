# P15 Fibonacci-prime spiral: sixteen-lane feedback gate

**Agent16, 23 November 2026; Director #2409. Classification: bounded original-input negative, source update still missing.** All 56 unknown pages remain undeciphered. The exact p15 grid arithmetic is established; this note tests one historically recognizable use without claiming that it was author-selected.

## Human-visible clue and missing instruction

The original p15 JPEG (32.jpg) prints sixteen Fibonacci-indexed prime differences from 3301, with red 3299 selecting the outward spiral's first cell. A separate infinity-shaped mark appears below. Original red-center-first order:

3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516.

The original page fixes sixteen values and their order. The genuinely solved LP1 Koan demonstrates additive GP29 Vigenère; the infinity-shaped mark makes a continuing key a plausible *hypothesis*. No first-party instruction specifies the continuing update, GP29 reduction, output convention, start page, plaintext or ciphertext feedback. The prime indices used in the square follow Fibonacci ordinals up to988; extending that integer prime-index sequence directly to a chapter-long rune stream grows the required prime indices exponentially unless another reduction is explicitly given.

## Frozen, reversible candidate: conventional sixteen-lane autokey

Start at the first p16 rune. Read the printed spiral modulo29 as seed **[22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]**. Treat the original p16–55 as one continuous 9,194-rune tape, with no word/page reset, alternate phase, F skipping, private constants or fitted signs. Decrypt subtractively with key K, where K initially equals the sixteen GP29 seeds. Two conventional and *distinct* updating feedback machines are considered:

- **Plaintext autokey:** for t≥16, K[t]=P[t−16]; P[t]=(C[t]−K[t]) mod29.
- **Ciphertext autokey:** for t≥16, K[t]=C[t−16]; same inverse.

Each machine has sixteen time-evolving registers and a unique forward encoder, so this differs from formerly exhausted stationary period16 secret-alphabet models and the separate two-state Fibonacci-feedback recurrence.

| Input / candidate | p16–21 training 1,613 IoC | untouched p40–53 3,008 IoC | original p55 76 IoC |
|---|---:|---:|---:|
| Original ciphertext | 0.03454947 | 0.03454263 | — |
| Lag16 plaintext feedback | **0.03455177** | **0.03468105** | 0.03789474 |
| Lag16 ciphertext feedback | **0.03445409** | **0.03459724** | 0.02877193 |

The original outputs remain near uniform GP29 coincidence and have no legible opening. Neither yields an authentic 150-rune plaintext sentence or unknown-page key. For **both** exact rules, all **9,194/9,194** original runes forward-reencrypt, and independently planted **95/95 genuinely solved native p57** runes encrypt and decrypt with the same source seed. These positive controls establish implementations, not any original decipherment.

[Standalone original-input Windows CommonJS SFT](../sims/lp2_p15_spiral_sixteen_autokey_original_sft.cjs) asserts the 4×4 input geometry, full original page offsets, result values and solved-native plants. The calculation was also executed directly against the current canonical source during this invocation; a separate CI execution is not asserted.

## Research decision

Retire **only** these two exactly specified classical sixteen-lane autokey continuations. The red 3299, Fibonacci primes and infinity drawing are real; however they do not determine a unique reversible state update, output law or receiver. A further sixteen-lane experiment requires a period-original authored operation selecting those missing elements before plaintext scoring. No new LP2 plaintext has been recovered, and the original matrix remains a complete source-local arithmetic discovery.
