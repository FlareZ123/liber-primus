# Original p39 red polynomial as a nonlinear plaintext-feedback repeat marker

**Agent10, 18 November 2026. Result: a new first-party-clue-selected finite-state GP29 inverse is mathematically reversible, but its key-independent predicted repeat frequency does not match any source-contiguous original-sized native-GP prose control. No unknown LP2 plaintext or authenticated cipher key was recovered.** [Exact CommonJS SFT](../sims/lp2_p39_quadratic_zero_feedback_source_gate_sft.cjs) · [Ubuntu Node22 PASS 44271969173](https://github.com/FlareZ123/liber-primus/actions/runs/44271969173).

## Human-solve-path premise and the independent rival

On physical LP2 p39, the three red GP coefficient runes give the source-visible quadratic

\[
G(x)=27+5x+15x^2=15(x+5)^2\pmod{29}.
\]

The low-degree-first coefficient convention is independently established by this exact polynomial's `x=24` root. It is a finite original clue to try as a cipher state update; its role as an encryption instruction is unproven. Previous source-shape gates already exclude fixed reserved plaintext runes, fixed predecessor **differences**, and various reused plaintext or ciphertext alphabets. They do not select this specific nonlinear **previous-plaintext-dependent reserved rune**. The intended-human hypothesis is: perhaps the red formula determines which plaintext symbol is permitted to emit an adjacent repeated ciphertext rune. A rival explanation is a stateful external pad with a separate surface formatting rule. Reusing a visible polynomial as a function has a shorter description than freely optimizing arbitrary nonlinear state tables, but source evidence still does not prescribe this interpretation.

The authentic GP29 alphabet has 29 runes, and the complete unchanged unknown corpus has **86 equal-adjacent ciphertext glyphs among 12,901 same-page transitions**, across 55 rune-bearing physical pages. Consider the following explicit family:

- The first plaintext and ciphertext rune of each physical page have an invertible 29-way initialization.
- At each later within-page position, set the **reserved current plaintext rune** `r_i=G(P[i−1])`.
- If `P[i]=r_i`, emit `C[i]=C[i−1]`, a zero modulo29 difference.
- Otherwise remove `r_i` from the GP29 plaintext alphabet, take its rank in the remaining 28 runes, apply **any invertible changing 28-way secret permutation**, and emit one of the 28 *nonzero* modulo29 ciphertext differences. A representative implementation rotates the 28 ranks by 13, while the invariant below allows every arbitrary secret 28-way map at **every position**.

The exact inverse reads `P[i−1]` to reconstruct `r_i`; if `C[i]=C[i−1]` it emits `r_i`, otherwise applies the inverse 28-way permutation and reinserts `r_i`. This is a lossless, causal finite-state cipher, with no language-dependent mapping needed to forward-encrypt. A 12,956-rune source-native English plant encrypts and decrypts **exactly**, preserving every original physical page cut; an inverse of the unchanged original ciphertext under the example key likewise reencrypts byte-for-byte. These are algebraic positive controls, not evidence of the historical algorithm.

## Key-independent original test

For **any** changing 28-way secret schedule, the original ciphertext's equality mask forces exactly

\[
86=\sum_{i\text{ within original physical pages}}
\mathbf{1}\bigl(P_i=G(P_{i-1})\bigr).
\]

The original 54 physical page-edge transitions are **excluded**, so chapter/page reset state cannot rescue the literal model. Original printed ciphertext word cuts are **ignored** and may be unrelated to plaintext words. Use only five preexisting source files in three independent known-English corpora and two historically pertinent literary sources; encode them into the solved-LP1-style GP29 register (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA). Every contiguous **12,956-rune** window is compared with the exact physical page cut schedule, without choosing `G`, changing the GP29 labels or optimizing a secret key.

| Source | Native GP runes | All contiguous original-sized windows | Minimum `P_i=G(P_{i-1})` hits | Mean hits |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare 300k | 217,106 | 204,151 | **440** | 553.904 |
| Gibran, *The Prophet* | 62,492 | 49,537 | **369** | 505.880 |
| Emerson, *Essays* | 321,327 | 308,372 | **372** | 495.325 |
| Blake, *The Marriage of Heaven and Hell* | 33,276 | 20,321 | **372** | 435.978 |
| KJV Passion / Resurrection excerpts | 53,675 | 40,720 | **467** | 510.608 |
| **All five** | | **623,101** | **369** | |

The **smallest** native-control hit count 369 still exceeds the exact required 86 by **283**. This entire discrepancy is **independent of all 28-way keys**, including arbitrary key changes at every ciphertext rune. The 2013 *Book of the Law* chapters, which are shorter than the original 12,956-rune corpus, were omitted from this specific full-book rolling-window calculation rather than being treated as nonexistent source matches.

## Stronger independence control: nine separate authored chapters

A single contiguous 12,956-rune source excerpt might be too restrictive if the LP2 author deliberately concatenated different prose passages. The original drawings and section breaks give nine independently recognized visual chapters. For each chapter, **independently choose any of nine pre-existing source books, any native-GP contiguous passage of that exact chapter length, and any source offset**. This also permits all three 2013 *Book of the Law* volumes and Tennyson for the shorter chapters. Exclude the true physical page starts *inside* each chapter, preserving all actual 54 page-edge omissions. The result is an exact optimistic minimum over more source choices than any single coherent novel:

| Original visual chapter | GP runes | Original repeats | Lowest possible source-quadratic markers |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | 4 | 9 |
| p3–7 | 1,145 | 6 | 17 |
| p8–14 | 1,729 | 9 | 34 |
| p15–22 | 1,903 | 10 | 38 |
| p23–26 | 1,021 | 11 | 15 |
| p27–32 | 1,433 | 13 | 22 |
| p33–39 | 1,680 | 12 | 32 |
| p40–53, with rune-free p50 | 3,008 | 18 | 65 |
| p54–55 | 308 | 3 | 0 |
| **Total** | **12,956** | **86** | **232** |

Even this freely composed, chapterwise excerpt model requires **at least 232** zero-event markers against **86** actual repeats, an excess of 146. The minima are independently optimized for each chapter and can overlap freely in a source book, so the summed 232 is a lower bound for any more restrictive selection of actual passages from those nine books. This substantially reduces the long-contiguous-quotation caveat. It is still a *finite supplied-source native GP register* exclusion; a new original manuscript or altered encoding remains possible.

The SFT independently tests the literal original count and 55 page lengths, the polynomial's `G(24)=0` root and `G(0)=27`, source orthography, all source-window minima, the **nine independently chosen exact original-chapter source minima**, exact algebraic inversion on a native Shakespeare source-shaped positive, and complete source ciphertext reencryption. It runs using read-only repository artifacts and no packages on Node22.

## Decision

**The particular p39-`G` plaintext-feedback reserved-rune receiver fails both the full-book contiguous and the independently recomposed nine-chapter native-prose comparisons**, even with completely unknown nonzero GP28 keys, falsified original word-boundary assumptions, and page initial states free. This does **not** disprove the mathematical construction or every possible English manuscript: an independently composed short passage in each chapter, other languages, nonlinear multistep functions or an external key stream can differ from these long source passages. Source-contiguous length-matched controls are a finite test population, and the p39 red polynomial's use as a feedback marker remains an interpretation.

No selected inverse decrypts 150 consecutive authentic unsolved GP29 runes into independently verifiable plaintext. The next productive step would require an **independently printed state rule or external key pointer** that specifies a different marker function, rather than fitting coefficients after seeing low repeat counts.
