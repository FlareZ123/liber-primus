# Five-dot source reading + authentic prime-totient inversion: conditional negative

**Agent 30, 2026-11-10.** The 5-dot motif appears in LP2 physical pages 7, 23, and already solved page 56. The identical source stencil is reflected about vertical and horizontal axes, as established in [original-image dot fitting](black-dot-template-reflections.md). The geometric pattern supplies a specific finite route family, so this experiment asks whether the dots identify the missing transposition before the demonstrably authentic LP2 p56 prime-totient cipher.

## Source-locked cipher challenge

On JPEG 24's five observed dot centers sorted by x, their ascending y ranks are **[2,4,0,3,1]** (zero-based). Under the observed reflection used on JPEG 40, this becomes **[2,0,4,1,3]**. The second reflection on JPEG 73 gives **[1,3,0,4,2]**. No original LP2 ciphertext fitting is used to choose these orders. The independent source of the 5-point geometry is `resources/liber-primus/24.jpg`, `40.jpg`, `73.jpg`.

The bounded family is 7 fixed permutations of a GP rune stream: identity; five-rune-block permutation by the dot ranks, inverse or y-reflected order; and full-column packing inverses for the same three orders. After applying each, decode by **phi(prime_n) mod 29** starting at the first prime, with either additive sign. Page boundaries reset the prime index. The GP-language score is a smoothed 29-symbol unigram log-likelihood from *the authentic solved LP2 page 56*; no dictionary plaintext or unconstrained new key is fit to the unsolved pages.

An independent complete regression decrypts all **85** original p56 ciphertext runes to the exact authentic text **AN END ...** with prime-totient sign -1 and one literal-F mask bit 8, as in the existing solved-page regression. On a separate synthetic source of 208 GP runes using the independently known p56 plaintext repeated to the page-7 target length, the encoder applies the p56 prime-totient key followed by the **source-derived five-column ordering**. Its decoder exactly recovers **208/208** source runes; the model scan ranks the planted five-column inverse with the true sign **first**.

## Original-source results and decision

| Original unsolved LP2 page | Runes | Best model | Best per-rune log-likelihood | Decoded IoC | Whole-page cyclic-rotation model-family null |
| --- | ---: | --- | ---: | ---: | ---: |
| 7, original JPEG24 | 208 | block-reflect-y, sign +1 | -3.729463 | 0.0359996 | **242/500** null books as good or better; p = **243/501 = 0.48503** |
| 23, original JPEG40 | 213 | block-xy, sign -1 | -3.702256 | 0.0351670 | **162/500** at least as good; p = **163/501 = 0.32535** |

Both winners are rune-salad, without continuous plausible GP text; their pooled rune distributions remain near-uniform. The 500 independent fixed-seed cyclic page rotations retain each page's exact rune histogram and local cyclic structure, refit the exact same fourteen candidate sign/route combinations, and provide model-selection-aware null scores. The positive control shows strong sensitivity for this specific route/totient hypothesis.

**Conclusion:** The original-source dot ordering plus page56-style prime-totient add/subtract does not recover plaintext on p7 or p23 under the tested page-start, reading-route and word-boundary assumptions. The geometry remains real and potentially significant to a different cipher; the negative applies only to the declared family. No new LP2 plaintext or key is claimed.

[CommonJS source and source-coordinate assertions](../sims/dot_stencil_totient_inversion.cjs) · [successful Windows Node22 CI run 42770024128](https://github.com/FlareZ123/liber-primus/actions/runs/42770024128) · [manual-only workflow](../.github/workflows/dot-stencil-totient.yml).
