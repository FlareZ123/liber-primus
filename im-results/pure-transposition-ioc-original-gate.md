# Original LP2 all-key frequency and minimum-edit obstruction

**Classification:** exact symbol-multiset invariant and optimal fixed-length edit-distance theorem, with finite native-Gematria-Primus English controls. **No unknown plaintext or authentic key recovered.** This class-level constraint covers any **one global bijective 29-rune alphabet relabeling plus any positional permutation**, including simple substitution, arbitrary transpositions, columnar routes, and their composition in either order. It imposes a quantitative minimum on an additional rune-replacing operation if a candidate intends to recover source-like native GP-English.

## Original source and human solve-path motivation

LP2 physical pages 0–55 contain 12,956 unresolved runes. The terminal p53 has 179, p54's first enlarged rune has GP index 24, and p55 has 76. A proposed composite of p53 + only that first p54 rune + p55 has exactly 256 runes, matching the printed base60 table's 32×8 capacity. The subsequent eight red p54 heading runes resemble an eight-column key. The earlier direct source-selected columnar test in [the consolidated terminal study](tree-outline-blur-crosspage.md) failed on original text. The 256-rune composite remains an interpretive hypothesis about framing; the full 12,956-rune source count is independent of it.

An **all-secret key-independent invariant** is available before selecting any transposition key. For length \(n\), let \(f_r\) count each GP symbol \(r\in\{0,\dots,28\}\). Arbitrary position permutations leave every \(f_r\) invariant. A further single **global secret rune-alphabet permutation** merely rearranges the 29 frequency counts, leaving their unordered multiset unchanged. Thus the index of coincidence

\[
I = \frac{\sum_{r=0}^{28} f_r(f_r-1)}{n(n-1)}
\]

is **exactly unchanged** by any combination of such operations. The secret key, column order, folded geometry, word positions, and even full unrestricted permutation do not matter. Independent page-varying substitutions, genuine homophonic expansion, non-GP registers, and further cipher layers are outside the theorem.

## Exact optimal substitutions needed after granting the strongest possible reordering

An IoC mismatch diagnoses the class, but a sharper bound quantifies the necessary extra operation. Let \(f^\uparrow\) and \(g^\uparrow\) be the sorted frequency-count vectors for original source and any given same-length GP plaintext candidate. Grant an adversary **any** of the \(29!\) global symbol renamings and **any** of the \(n!\) position permutations, both chosen after seeing the target. Then the exact minimum number of rune replacements needed to reach it is

\[
E_{\min}(f,g)
=\frac12\sum_{r=0}^{28}|f^\uparrow_r-g^\uparrow_r|
=n-\sum_{r=0}^{28}\min(f^\uparrow_r,g^\uparrow_r).
\]

This follows by matching largest frequency bins to largest bins; any less-ordered matching cannot increase the total shared matching mass, and arbitrary position permutations realize the optimum. The bound is intentionally generous to the attacker: **all** printed spaces, punctuation, page order, and historical key restrictions are discarded for the purpose of this lower bound. A pure substitution-transposition has \(E_{\min}=0\); an extra mechanism must account for every required changed rune.

## Measurements on original ciphertext and independent native-GP prose

[CommonJS original-input single-file reproducer](../sims/pure_transposition_ioc_source_sft.cjs) reads the canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and existing Emerson, Gibran and Shakespeare controls. It uses the repository's established GP-English normalization, including TH/ING rune tokens and QU→CW, V→U, K→C, Z→S. Reference texts are divided into **nonoverlapping** length-matched windows; no original ciphertext is used to fit a key or reference vocabulary.

| Original stream | GP rune count | IoC |
| --- | ---: | ---: |
| Terminal proposed p53 + p54 first rune + p55 composite | 256 | **0.03431372549019608** |
| All unsolved LP2 pages 0–55 | 12,956 | **0.03447839786450569** |

| GP-English source | 256-rune windows | Smallest 256 IoC | Smallest **necessary edits / 256** | 12,956-rune windows | Smallest full IoC | Smallest **necessary edits / 12,956** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Emerson, *Essays* | 1,262 | 0.0507352941 | **48** | 24 | 0.0615409052 | **4,467** |
| Gibran, *The Prophet* | 244 | 0.0540441176 | **51** | 4 | 0.0599373064 | **4,378** |
| Shakespeare | 850 | 0.0481617647 | **45** | 16 | 0.0584959050 | **4,219** |
| **Total / best-case bound** | **2,356** | **0.0481617647** | **45 (17.58%)** | **44** | **0.0584959050** | **4,219 (32.56%)** |

**Every one of the 2,356 short and 44 full-length original-control comparisons has higher IoC than the original ciphertext.** In the most permissive globally relabeled and arbitrarily transposed matching, the closest 256-symbol GP-English control still needs **45 symbol substitutions**, and the closest full-length GP-English control needs **4,219 changed rune positions**. These are exact minima against the *specific control windows*, not a universal minimum over every possible English or other-language message. Finite source windows share authorship/style and are not claimed to be statistically independent observations; empirical tails are not promoted into universal theorem p-values.

The reproducer asserts both actual original inputs and all reference lengths. It also confirms zero minimum edits after an arbitrary original position permutation or a bijective global alphabet rotation, and the per-source frequency-optimal minima above.

## Research decision and remaining problem

The full original manuscript requires **at least 4,219 substitutions relative to every tested complete source-length native-GP English register**, even after giving a hypothetical solver a fully arbitrary global alphabet permutation **and** arbitrary positional transposition. Therefore pursuing any single fixed global substitution-transposition, including arbitrary 8-column keys or full page-order searches, cannot lead directly to prose with the observed GP-English frequency profile. This class is **rejected conditional on the tested prose registers**; historical authors may have encoded a genuinely different register.

The next useful clue must identify an operation that changes rune counts substantially, such as a **changing key/state**, **non-GP or compressed payload**, **variable-rate mapping**, or independently prescribed additional substitution, and must predict previously withheld original ciphertext in a reversible way. The present theorem does **not** identify which such operation was used. It supplies a quantitative gate against superficial transposition-based rescues without requiring any speculative key search.
