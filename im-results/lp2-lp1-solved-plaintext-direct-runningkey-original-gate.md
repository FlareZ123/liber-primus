# Solved first-release plaintext as a direct original LP2 running key

**Agent 7, 16 November 2026. Bounded original-cipher negative, not a decrypt.** A simple puzzle-designer move would be to use the first-release Liber Primus's already recovered GP29 rune text as the running pad for the 2014 second release. The first book itself says its words and numbers are sacred; its cipher pages already teach a 29-rune additive Vigenère inverse. This is a *human-plausible* source choice, though no authenticated instruction is known to select the whole LP1 plaintext as a key.

## Source-fixed experiment

- Key: all **2,799 GP29 runes** in the seven solved original first-release sections of `resources/external/relikd-solved-gp29-native-v1.json`, in the stored print order; punctuation removed. This is a verified-derived transcription of known solved LP1 content, not original JPEG carrier bytes.
- Original untouched ciphertext: all **12,956 GP29 runes** across LP2 physical pp0–55 (physical p50 runeless), `resources/liber-primus/lp2-corpus.json`. The fixed illustrated section starts are `0,729,1874,3603,5506,6527,7960,9640,12648`.
- Receiver: first **729 runes of each of the eight sufficiently long illustrated chapters**; all **308 runes of the ninth**. These are source-visible chapter boundaries, not fitted to a cipher score.
- Fixed cipher: `P[i]=(C[i] ± K[offset+i]) mod29` for both signs. A separately bounded variant treats every *ciphertext* literal rune F (index zero) as transparent `P=F` and advances the source key only on non-F ciphertext, consistent with the known solved-page interrupter idea. Source key offset is granted freely at every contiguous 729- or 308-rune position: 2,071 offsets for each long chapter and 2,492 for the last.
- Selection statistic: native GP29 index of coincidence, optimized over *all* key offsets separately for each chapter, sign and F-bypass variant. This permissive postselection makes the result favor the hypothesis.

| Original chapter | Max IoC, direct ±, no bypass | Max IoC, literal-F skip ± |
| --- | ---: | ---: |
| p0–2 | 0.0361514 | 0.0396675 |
| p3–7 | 0.0367506 | 0.0386537 |
| p8–14 | 0.0362230 | 0.0381374 |
| p15–22 | 0.0363926 | 0.0395205 |
| p23–26 | 0.0359705 | 0.0388798 |
| p27–32 | 0.0361364 | 0.0396298 |
| p33–39 | 0.0359781 | 0.0376023 |
| p40–53 | 0.0360271 | **0.0400895** |
| p54–55 (308 runes) | 0.0394898 | 0.0392360 |

The exact original 2,799-rune LP1 key's **first 729 original plaintext runes** have IoC **0.060273745**. A fully reversible 729-rune synthetic GP29 additive plant with a deliberately selected LP1 offset recovers its **729/729** source plaintext runes exactly. A second source-shaped plant exercising ciphertext-F bypass likewise recovers **729/729**, with accidental ciphertext-F collisions avoided in the encoder. The **largest** of all 36 original-cipher chapter×sign×mask maxima is **0.0400895**. None approaches the positive native GP-English register, despite treating each chapter and key origin independently.

**Exact runnable, read-only CommonJS:** [SFT](../sims/lp2_lp1_plaintext_direct_runningkey_original_sft.cjs). The original-source computation ran using the committed JSON data through the connected GitHub-source runtime; the standalone CJS was committed but has not yet been run in a local repository checkout or CI.

## Decision

The complete already-solved LP1 source text, used as a **contiguous direct GP29 additive running key**, fails to recover native-looking GP prose from the start of **any** of the nine illustrated unknown chapters. Allowing either additive direction, every source offset, and the two stated F masks does not improve it. This retires **this direct and transparent-F-only source-to-key transfer**, which is distinct from a cryptographic running-key decoder with changing key pointer, undisclosed key alphabet, different page or section clocks, or a book-code lookup. An independently authored instruction would be needed to justify those new assumptions. No unknown LP2 plaintext, historical LP2 key, complete inverse, or destination was recovered.