# The p27/p55 copied footer cannot encode ordinary GP-English under a shared six-phase key

**14 November 2026. Evidence class:** exact original-ciphertext, key-independent necessary condition for a copied-footer-motivated decipherment architecture; independently tested against 9,000 native-English windows and an encrypted original-shape plant. No unknown plaintext or author-selected key was recovered. [Windows Node22 CI passed, run43627534939](https://github.com/FlareZ123/liber-primus/actions/runs/43627534939).

## Why this is a source-selected experiment

The unique terminal recurrence in the real manuscript is the **last six ciphertext runes** of physical LP2 **p55**, two complete three-rune printed words `D-J-U B-E-I` at offsets **70–75**, exactly duplicated on **p27** at offsets **28–33**. Both occurrence starts are phase **4 modulo6** under an unchanged physical-page-reset rune clock. The separately established p55→p56 seventh-rune seam into p27 gives a possible page-navigation reading, discussed in [the original-copy report](p27-p54-repeated-7gram-periodic-key-gate.md). A simpler *rival* interpretation is that this repeated phrase reflects one **shared six-rune repeating additive key** on p27 and p55. This is a real cipher hypothesis selected by the exact repeated-source phrase and its two matching clock residues, rather than by a postselected language-score period search.

Take the complete unaltered GP29 ciphertext arrays `C27[0..233]` and `C55[0..75]`. Give the hypothetical decoder **six wholly unrestricted, independent, secret alphabet bijections** `σ0…σ5` and use the same six tables on both pages, restarting the phase at each physical page's first rune:

```text
P_page[i] = σ_(i mod 6)(C_page[i]),  page in {27,55}.
```

This grants **(29!)^6** possible hidden keys and includes every ordinary shared 6-digit Vigenère key as a tiny subset. It also permits a different, arbitrary **nonlinear** rune permutation per phase, making the exclusion below independent of which published GP numeric operation a key might use. The creator has not independently instructed solvers to use phase six, shared keys, or ordinary native-English plaintext on those two pages.

## All-secret original mathematical bound

Within each one of the six phase classes, a 29-way permutation changes the labels of printed runes but **cannot alter that phase's histogram**. To find the **largest possible pooled output index of coincidence over all six secret permutations**, sort each phase's 29-bin counts in descending order and align each ordered rank across phases. The rearrangement inequality proves this simultaneously maximizes all cross-phase dot products; it is the exact achievable global optimum. No key guessing or greedy cipher optimization is necessary.

The original 310 runes give the optimal pooled 29-class count vector

```text
[30,24,23,18,18,18,16,15,15,13,12,12,11,10,10,
 10,8,6,6,6,6,6,6,5,5,1,0,0,0].
```

Consequently:

| Literal original source / complete secret family | GP29 symbol coincidence |
| --- | ---: |
| p27+p55 unchanged ciphertext, before any decoding | **0.0338866269966** |
| **Maximum over all (29!)^6 phase-bijection keys** | **0.0478338031110** |
| Source-native English positive plaintext, exact same 234+76 rune lengths | **0.0630337195949** |
| Six-phase-key-encrypted positive, optimally relabelled upper bound | **0.0848522810314** |

The native baseline is intentionally stringent: original Shakespeare and Gibran passages are source-transliterated to Cicada's attested GP29, including the solved-LP1 **ING/IO single-rune spelling**. Every 310-rune contiguous window at a fixed stride **31**, partitioned into **234+76 rune** physical-page shapes, is evaluated with the **same maximized six-phase statistic**, which is even more favorable to each control than its unmodified native GP text.

| Independent native control | Tested windows | Minimum *maximum-achievable* GP29 IoC | Windows at or below original ceiling |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | **2,006** | **0.0645370080384** | **0** |
| Shakespeare source sample | **6,994** | **0.0609666979852** | **0** |
| **Total** | **9,000** | | **0** |

**True cipher plant.** Place the same natural two-word GP29 plaintext phrase `YOU ARE` in a 234-rune Gibran piece at offset28 and in an independent 76-rune piece at its terminal offset70. Apply a single six-symbol nonidentity Vigenère key `[5,13,0,11,27,19]`, with the phase reset at each page. The resulting ciphertext **has an exactly matching six-rune footer/p27 copy**. The same decoder recovers every planted GP29 plaintext rune exactly and the unlimited-secret ceiling exceeds its 0.06303 native language IoC. A legitimate shared period-six cipher with this structure would therefore not be falsely rejected by the test.

## Decision and boundary

The exact original p27+p55 phase-six source alignment is **insufficient to make the repeated phrase a shared-key Vigenère crib**. Even after allowing a fully arbitrary secret substitution for **every one of six phases**, both original pages together are flatter than any of 9,000 matched source-native English windows under the most favorable secret key. Repeating a search over more six-rune keys, secret alphabet orderings, or crib word pairs cannot improve the mathematical ceiling. The copied footer remains a candidate **navigation marker**; nothing here proves that it is an intended pointer.

A different key per page, a changing cipher state, another register such as non-English or compressed data, changing page/word boundaries, inserted/omitted runes, or a separate nonlinear layer escapes this precise bound. English references are finite samples, so this is a strong bounded incompatibility rather than a universal theorem that no writer could produce a 310-rune low-coincidence English passage. No new key or genuine unknown plaintext follows.

**Original source/positive reproduction:** [single-file CommonJS SFT](../sims/lp2_p27_p55_sixphase_allsecret_sft.cjs) with the actual [GP29 corpus](../resources/liber-primus/lp2-corpus.json), two independent control texts, and [manual Windows workflow](../.github/workflows/lp2-direct-plainprev-lookup-manual.yml). It asserts the exact six printed original rune identities, phase alignment, all 29 sorted-count components, 9,000 native control windows, positive repeated phrase and whole-plaintext decryption. [Successful GitHub Actions run43627534939](https://github.com/FlareZ123/liber-primus/actions/runs/43627534939).
