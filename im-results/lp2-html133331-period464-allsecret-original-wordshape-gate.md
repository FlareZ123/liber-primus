# Original 2014 Stage11 HTML sum 464 cannot be a direct repeated GP29 alphabet on ordinary runes

**Agent 10, 22 November 2026. Classification:** source-conditioned, key-independent native-English exclusion of a 464-rune-period substitution on unchanged original LP2 pages. **No unknown plaintext or author-selected key has been recovered.**

## Human-accessible premise

The authentic archived HTML accompanying the original May 2014 LP2 release visibly contains the literal title **133** and enclosing div ID **331**. These were actual participant-accessible strings, rather than values inferred from 2026 ciphertext statistics. They sum to **464**, and independently **3301 is the 464th prime**. The book's Gematria Primus alphabet has **29** runes and the p15 original Fibonacci-prime number square has **16** cells, so **464 = 16 × 29** provides a source-constrained hypothetical long alphabet clock. This is a possibility a 2014 participant could have attempted; no authorial instruction connects the HTML pair to a repeating key.

An appealing rival is a strong nonperiodic pad, a hidden word-dependent clock, a non-GP plaintext representation, or an external one-time key. The proposed fixed 464-rune period makes a **key-independent** prediction that can be tested on the untouched manuscript before trying a single password.

## An exact invariant of every 464-state secret alphabet

Suppose the author's native GP29 plaintext P was encrypted by

\[
C_i = \sigma_{\,i\bmod 464}(P_i)
\]

where each of the **464 hidden maps** \(\sigma_j\) may be **any** of the **29! invertible GP29 substitutions**. The maps may be independent; there is no Caesar/affine, historical password, or rune key restriction beyond invertibility. The test also grants independent resets at each of the nine actual red-heading chapters or every one of the 55 rune-bearing physical pages. It keeps **all 12,956 original rune values and 2,896 original complete printed word boundaries**, including the 32 words carried across physical pages, with no inserted symbols.

For any two rune positions with the **same 464 clock phase**, equality of their ciphertext symbols is equivalent to equality of their plaintext symbols. In particular, the count

\[
S=\sum_{\text{clock phases }j=0}^{463}
 \sum_{\text{GP symbol }x=0}^{28}\binom{n_{j,x}}2
\]

is **unchanged by every choice of the 464 secret permutations**, regardless of how nonlinearly those permutations map the letters. A long English source naturally has more same-phase identical letters than independent uniform GP29 samples, irrespective of a secret substitution. This makes a finite, all-secret *necessary condition* for one precise cipher model.

| Clock on the original pages | Original same-phase equal pairs | All possible same-phase pairs | Gibran English control minimum of 64 | Shakespeare control minimum of 64 | Authentic solved-Cicada GP control minimum of 64 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Entire 12,956-rune manuscript | **5,998** | 174,420 | 10,132 | 10,176 | 10,316 |
| Reset independently at nine illustrated chapters | **6,069** | 176,619 | 10,251 | 10,214 | 10,409 |
| Reset independently at 55 physical rune pages | **10,751** | 311,132 | 18,075 | 18,086 | 18,402 |

Every control uses **exactly the original 2,896 printed rune-word lengths**, sampling independently from real GP-encoded Gibran and Shakespeare word occurrences or independently solved, Cicada-authored GP rune words of matching lengths. The sampling seed is fixed by the SFT. Across **64 controls for each of three sources and three clocks**, all **576 original-shape comparisons** have strictly **more** within-phase equality than the original ciphertext. The controls preserve the unusually high counts of one- and three-rune LP2 words. This is a lexical control experiment, **not a claim that the actual author must have drawn words independently** or that 576 controls exhaust all possible English.

A positive ciphertext was built under an independently generated arbitrary **non-Caesar, fully secret GP29 permutation in every one of the 464 clock phases**, applied to a complete native plaintext with all 2,896 original word lengths. Its phase-equality statistic was exactly preserved. Its inverse recovered **12,956/12,956** planted GP runes, showing the source test detects its own full-strength cipher family.

## Result and decision

The source's printed HTML numbers supply an **unfitted, historical choice of 464**, but the unchanged LP2 ciphertext lacks the within-phase equality structure of native GP29 English under **any** 464-period collection of independent secret invertible alphabets, globally or under either natural page/chapter rekey. Its observed equal-pair count is approximately 57–58% of the source-native English control means. This is a model-specific structural contradiction, more informative than searching 464 unknown shifts for a language score.

**Retire 464 as a direct, one-rune-per-step, reset-at-book/chapter/page, periodic GP29 alphabet cipher for native prose** without independent evidence of another value-changing layer. The exact test **does not** exclude a key clock that skips literal F, a hidden/variable position-dependent phase, changes inside words, output-dependent nulls, an alternative source language/register, a noninvertible substitution or genuine longer nonperiodic encryption. The HTML relation by itself authenticates **no such secondary mechanism**.

**Reproducer:** [source-locked Windows Node 22 standalone CommonJS test](../sims/lp2_html133331_period464_allsecret_wordshape_sft.cjs), [successful live original-source Actions run 45019487888](https://github.com/FlareZ123/liber-primus/actions/runs/45019487888). The program reads the archived original HTML and indexed LP2 corpus, asserts exactly 12,956 ciphertext runes and 2,896 native printed words, evaluates all-secret same-phase invariants, and independently plants and inverts 464 unrelated hidden substitutions. It writes no source files.
