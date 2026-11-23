# LP2 page-carry key states: complete source-frozen original inverse, holdout, and shared-sum reuse gate

**Agent43 / Director #2438, 23 November 2026.** No authentic original plaintext or state law was recovered. All the experiments below use the complete physical p0–55 source, retain genuine page/word boundaries and operate on the original GP29 rune values, with fixed controls on independent native source material.

## Why the 32 carried words could have selected a state

The original 55 rune-bearing encrypted pages contain **2,896 actual printed words**, of which **32** continue across one physical page boundary. The 32 are available to the reader after joining fragments over source page turns; their exact mappings are in `resources/lp2-transcription.txt` and implemented by `sims/lp2_word_pages.cjs`. The source p0 heading has 13 dots; the original p15 prints a prime-indexed Fibonacci spiral; the historically authenticated solved Cicada system uses Gematria Primus prime weights and modular arithmetic; the verified 2016 message describes words and numbers as a map/direction. These motivate a human-testable word-sum update but do **not** specify the actual cipher or make the 32 carries intentionally coded. Earlier #837 found that the 32 source carries and original 32 table rows agree in count only at an ordinary level under the chapter-conditioned page-layout control (P≤32=0.482439).

## One frozen, complete, lossless carry-state inverse

Define `S(w)` as the sum of genuine GP prime weights of the **whole** word that crosses a physical page break. Set initial page key `K_0=13` (13 original dots), and for each next page `K_p=K_(p−1)+S(w) mod29` **only when the preceding page carries a word into p**; otherwise leave the key unchanged. The genuinely runeless table page p50 consumes no rune or state. Freeze `C_prev=0` at the book start, preserve the last actual ciphertext rune across all physical page turns, and define

`P_i = (C_i − C_(i−1) − K_page(i)) mod29`

with forward cipher `C_i = (P_i + C_(i−1) + K_page(i)) mod29`. This makes every GP symbol invertible without exceptions, has one carried state (plus the previous ciphertext), respects every original page and word, and requires no per-page fitted secret. It is **one testable model**, not an original-authenticated instruction.

**Exact original outcome:** p16–21, 1,613 consecutive runes, yields GP29 IoC **0.0346894570941**. An independently reserved p40–53 floral passage, 3,008 runes, yields **0.0344674482944**. Both are near uniformly distributed instead of recognizable GP-native English, and their directly decoded opening 80 runes are nonlinguistic (see the SFT). Changing the initial state among **all 29** choices merely globally rotates the recovered GP alphabet and leaves both exact IoCs unchanged; there is no hidden initial shift to optimize. Reencrypting **all 12,956** original ciphertext runes reconstructs exactly. A separately planted 95-rune original solved p57 GP text decodes perfectly **95/95**. Forward replay proves implementation consistency, while the native control confirms the legal rune alphabet; neither rescues the original failed plaintext.

## Independent exact-source same-state holdout

If a carry-word's GP-prime sum directly initialized a reused additive running key at the following page, repeated sums would nominate two source-exact page pairs without looking at ciphertext:

| Whole carried-word GP-prime sum | Next physical pages | Aligned original runes | Equal ciphertext runes |
|---:|---|---:|---:|
| **155** | p7 and p20 | 208 | 10 |
| **632** | p22 and p47 | 131 | 2 |
| **Total** | Four original pages | **339** | **12** |

Those are the **only two exact repeated whole-carry prime sums** among all 32 events. With the same *additive* keystream starting at each page's first source rune, `C_A(i)−C_B(i)=P_A(i)−P_B(i) mod29`; positions where ciphertexts are equal must therefore correspond exactly to equal native plaintext runes. No key, phase or symbol was guessed for this equality test.

Independent GP-normalized Gibran and Shakespeare corpora give a native cross-text equal-rune rate about **0.0593**. In 10,000 fixed-seed, same-length independent English-window controls, the total matching-rune count averages **20.0741**; only **389/10,000 (3.89%)** are ≤ the actual **12**. This is evidence **against** these exact reused-zero-offset additive key claims as a natural-language explanation. It is a moderate single-model diagnostic rather than a manuscript-wide p-value; the sum-address rule itself is unauthenticated. The directly decoded two-time-pad output is not claimed as plaintext, and any unconstrained English-fit algorithm would need independent planted recovery controls before acceptance.

A separate tempting connection does not justify an exception: carried p0→p1 whole-word prime sum **300** equals clear p57's `EMERGE` sum, while carried p4→p5 sum **115** equals `WITHIN`. The exact count **two** is ordinary under **50,000** fixed-seed length-conditioned resamples from the actual 2,864 page-local words (**P(≥2)=0.2567**), using the source's own 20 p57 words. No authored word→page opcode follows.

## Decision and remaining work

The shortest sourced carry-driven feedback inverse **fails original plaintext and its independent holdout**, as does the only exact-repeat carry-sum/shared-pad original test. Neither native-positive or forward replay indicates a recoverable source cipher here. The missing input is a **first-party instruction selecting what a carried word contributes to the state, when to apply that contribution, and what reversible within-page cipher consumes the state**. The genuine page-carry list is useful as a future constraint, while the numerically matching 32-table rows, duplicate sums and late plaintext echoes lack a selected key receiver.

**Reproducibility:** [complete read-only Node.js 22 / CJS original-input test](../sims/lp2_pagecarry_source_update_original_sft.cjs). [Windows Node22 Actions success](https://github.com/FlareZ123/liber-primus/actions/runs/45286735498). Historical/source-independent prior boundaries: #629, #837, #1241, #1909, #2198 and #2333. Avoid additional carry-sum operations or ciphertext-score tuning absent a genuinely new author-selected instruction.
