# A prime(7²) clock in the seven-page illustrated passage

**Evidence class:** source-visible arithmetic relationship and bounded original-input inverse test. **No unknown LP2 plaintext, authentic key, or historical cipher method recovered.** The exact numerical alignment deserves attention as a possible route constraint; the tested direct readings fail.

## Source-selected construction

The repeated 1033/3301 cuneiform header identifies physical LP2 pp33–39 as a seven-page illustrated unit. The **later** p33 red heading starts at local rune offset 91, independently distinguished from the earlier red heading and the previous page's inherited section marker in [the dual-clock source study](../workplace/lp2-section-clock-ambiguity.md).

The original [canonical corpus](../resources/liber-primus/lp2-corpus.json) counts **1,680 runes** over all seven physical pages. Omitting exactly the 91-runic lead-in leaves **1,589** runes:

```text
91 = 7 × 13
1680 = 7 × 240
1589 = 1680 − 91 = 7 × 227
227 = prime(49) = prime(7²)
```

The independently archived [middle 2014 OpenPuff square](../resources/cicada2014-openpuff-magic-squares.txt) has **7×7 = 49** cells, row/column magic sum **1033**, and center **331**. The seven-page artwork displays **1033/3301**, giving a source-visible way to select that historical square before testing unknown ciphertext. Together these observations suggest a potential 7-row ×227-column stream, whose **227 columns cover exactly the first 49 primes**, with one square cell for each prime-count ordinal.

The arithmetic is exact. **Intent is unproved.** The 91-rune boundary, seven pages, archival square and prime identity constrain a possible route, but they do not prescribe flattening order, a cipher operation, or how the key state changes. Discovering 227's ordinal after noticing 1,589 is retrospective selection, not independent proof.

## One frozen, reversible cipher test

The [Node22 source/original reproducer](../sims/onion7_prime49_227_clock_sft.cjs) forms the 1,589-symbol text from p33 local rune 91 through the end of p39, and arranges it in seven rows of 227 or 227 blocks of seven. At column (t=0,…,226), it uses the prime-count clock (j=\pi(t+1)), which ends at 49.

For the source square `M` reduced modulo29, it evaluates precisely three model families in each layout, with both arithmetic directions:

1. **Prime-clock additive:** row `r` uses `M[r][(j−1) mod7]` as a GP29 key. Every seven successive prime-count states traverse that row of the original square.
2. **Seven-lane Hill:** the complete original source `M` acts on each seven-symbol column by multiplication or by its field inverse.
3. **Prime-rotated Hill:** the same complete square is cyclically conjugated by the prime clock, `M_j[r,c]=M[(r+j) mod7,(c+j) mod7]`, before applying the selected direction.

Twelve original-LP2 inversions were run. Every version is lossless and exactly re-encrypts the original input; every corresponding independently generated Latin-GP plant is fully recovered. These are implementation controls, not claims about the historical cipher.

| Input / measurement | GP IoC | Held-out Latin-GP unigram score (nats/rune) |
| --- | ---: | ---: |
| Original illustrated ciphertext, 1,589 runes | 0.03434982 | −4.271378 |
| Best original model (additive, 7-rune blocks, subtract) | 0.03427769 | −4.245064 |
| Highest original-model IoC, across all 12 | 0.03472868 | Not an English-like frequency distribution |
| Independently held-out 1,589-rune Latin-GP control | 0.07290598 | −2.791284 |

The scores are computed from a smoothed unigram fitted to the initial 10,000 runes of the independently sourced [Latin GP control](../resources/control/latin-vulgate-heldout-gp.json); the native plant comes from the opposite end of that corpus. All original outputs retain nearly uniform GP coincidence and show no readable prose. These direct transformations are unsupported as original decoders; the whole 49-stage source-clue hypothesis remains open for a mechanism specified from fresh evidence.

**Execution:** the existing manual [Onion7 source workflow](https://github.com/FlareZ123/liber-primus/actions/runs/42941906070) completed successfully on 11 November 2026. The existing direct 7×7 Hill study in [the Onion7 report](onion7-magic-center-source-prime-gate.md) already excludes the static matrix use on this 1,589-rune interval. The present additive and clock-rotated models differ by their source-counted prime schedule; they add a precise, inexpensive finite check rather than reopening the static Hill search.

## What would change the decision

An independently readable clue specifying **which** of 49 prime-count stages selects **which** source-square cell, together with a nontrivial recoverable state or plaintext alphabet, could turn the arithmetic into an original-cipher proposal. A candidate should predict an exact decrypted interval and a held-out one before fitting language models. Without that instruction, broad phase, permutation or nonlinear-key searches around the same 7×227 factorization are weakly identified and should not be expanded just because the numbers match.
