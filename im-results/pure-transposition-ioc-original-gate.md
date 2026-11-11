# Original LP2 pure-transposition invariant: source-class decision

**Classification:** exact symbol-multiset theorem, supported by a finite comparison against three native-Gematria-Primus prose registers. **No unknown plaintext or key recovered.** This is a class-level stop for any proposed **single-layer, rune-preserving transposition**, including unknown column order or arbitrary position permutations. A transposition followed by a separate cipher, changed alphabet, or variable-rate conversion is outside this exclusion.

## Source and human solve-path relevance

Original LP2 pages 0–55 contain 12,956 runes on 55 rune-bearing pages and a rune-free numerical page. Physical p53 has 179 runes, the enlarged first glyph on p54 is GP index 24, and p55 has 76. A proposed terminal extraction of p53 + only that first p54 rune + p55 gives exactly 256 runes, the printed table's 32×8 capacity. The eight subsequent red p54 runes provide a possible columnar key. Separately, the 2014 Cicada path demonstrably used columnar transposition. These facts motivate testing the simplest operation, but they do not establish that the 256-rune extraction is an intended payload. The single-key test in [the consolidated terminal study](tree-outline-blur-crosspage.md) has already failed to recover text.

An **independently decisive obstacle applies before choosing a key**: a pure transposition is only a permutation of positions. Let the count of GP rune \(r\) in a sequence of length \(n\) be \(f_r\). Under any positional permutation all \(f_r\) remain unchanged, hence the index of coincidence

\[
I=\frac{\sum_{r=0}^{28} f_r(f_r-1)}{n(n-1)}
\]

is exactly invariant. Reversing, folding, columnar keying, crossing pages, and unrestricted column order cannot raise or lower it if the operation preserves the same rune multiset. Every possible key therefore inherits the observed frequency profile.

## Original-input measurements and native language comparisons

The [single-file CommonJS SFT](../sims/pure_transposition_ioc_source_sft.cjs) uses only the repository's original normalized [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and previously retained Emerson, Gibran, and Shakespeare reference texts. It tokenizes the latter using the existing GP convention with TH/ING digraphs and source normalizations QU→CW, V→U, K→C, Z→S. It evaluates **disjoint**, fixed-width reference windows, without choosing any candidate key or fitting plaintext.

| Stream | GP runes | Exact IoC |
| --- | ---: | ---: |
| Original terminal p53 + oversized p54 A + p55 composite | 256 | **0.03431372549019608** |
| All original unsolved LP2 pages 0–55 | 12,956 | **0.03447839786450569** |

| Reference source | Disjoint 256-rune windows | Minimum IoC | 256-rune windows with IoC at or below original terminal | Disjoint 12,956-rune windows | Minimum 12,956-rune IoC | Full-length windows at or below original book |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Emerson, *Essays* | 1,262 | 0.05073529411764706 | 0 | 24 | 0.06154090518524891 | 0 |
| Gibran, *The Prophet* | 244 | 0.054044117647058826 | 0 | 4 | 0.05993730643597443 | 0 |
| Shakespeare | 850 | 0.048161764705882355 | 0 | 16 | 0.058495904971361076 | 0 |
| **Combined** | **2,356** | **0.048161764705882355** | **0** | **44** | **0.058495904971361076** | **0** |

All original rune indices, table widths, and reference sizes are asserted by the reproducer; reversing the original stream and applying a full 256-position multiplicative permutation preserve IoC exactly. The 2,356 prose windows are a finite language comparison rather than a universal distribution of possible English, and neighbouring windows within a reference book need not be statistically independent. No arbitrary sample-based p-value is promoted to a cipher theorem.

## Cryptanalytic decision

**Single-layer, rune-preserving position permutations of the original unknown book cannot repair its near-uniform GP29 rune frequencies.** For the tested native-GP English controls, every original candidate transposition would retain an IoC below the lowest observed reference window. This applies to *every secret transposition key and every positional permutation*, not only the previously tested p54 heading order. The class is thus strongly disfavoured as a direct native-GP prose decipherment and should not receive further free column-order/route searches.

This says nothing about transposing a *different* intermediate plaintext register, a transposition combined with substitution or keystream recovery, another language, or non-rune payload. Any proposed additional operation must be selected from independent original clues and supply exact information required to invert it. Synthetic invert-and-reencrypt success alone is insufficient to identify that missing operation. The primary objective remains an authentic original-source key or reversible decoder producing independently readable unknown plaintext.
