# LP2: all-29 fixed plaintext markers fail source-native word-length geography

**Agent 16, 13 November 2026. Scope: original-cipher necessary-condition gate with exact analytic reference distributions.** This is a substantial restriction on **one proposed reversible cipher architecture**, not a decryption, historical key, proof of the actual algorithm, or general statistical impossibility. The exact original-input CommonJS SFT is [here](../sims/lp2_transparent_zero_symbol_lexical_gate_sft.cjs); its full source and planted inverse passed [GitHub Actions #43363316842](https://github.com/FlareZ123/liber-primus/actions/runs/43363316842); the subsequent conditional-EA extension is [run #43363853236](https://github.com/FlareZ123/liber-primus/actions/runs/43363853236); the exact source-position comparator is covered in the same SFT.

## Mechanism being adjudicated

The unsolved manuscript has only **86 identical successive GP29 rune pairs** within its 55 rune-bearing physical pages, despite nearly uniform nonzero successor differences. One information-preserving proposal, already tested with several guessed source keys, is to give a distinguished plaintext rune `q` a **zero output increment**, while all other 28 runes emit nonzero increments under a changing keyed bijection:

`C[i]=C[i-1]` **if and only if** `P[i]=q` for each within-page position `i>0`.

The source-informed `q=28` (GP rune EA) was previously [examined using exact source-text marker matching](ea-marker-source-locator.md), but an unknown secret choice among all **29** GP runes remained logically possible. This experiment neither assumes a known key nor picks `q` from ciphertext. It asks whether **any** fixed plaintext letter could occupy the actual 86 zero-step sites if the manuscript prints its plaintext GP word lengths and has a broadly normal English word vocabulary. A state-dependent exceptional letter, different plaintext segmentation, non-English register, or text deliberately constructed with unusual lexical choices is outside the tested model.

## Original-source and independent language controls

The unmodified [LP2 transcription](../resources/lp2-transcription.txt) and [numeric GP corpus](../resources/liber-primus/lp2-corpus.json) jointly give 12,956 original runes in exactly **2,896 printed words**. Slashes/newlines and page boundaries are *not* word breaks; physical-page firsts **are ineligible zero-step sites** because there is no same-page predecessor. A single printed word may continue across pages. The SFT verifies each rune against the canonical JSON, preserving the page-first eligibility mask of **every original word**.

From the 86 observable zero-step sites, the following three geometrical observables are fixed, without reading any candidate plaintext:

| Observable | Original count |
| --- | ---: |
| All source-eligible duplicate steps | **86** |
| Duplicate steps occupying words **at least eight GP runes long** | **21** |
| Duplicate steps at the **first rune of a printed word** | **23** |

Independently tokenize four checked-in prose references into the original 29-rune GP alphabet, with authentic seven digraphs TH/NG/EO/OE/AE/IA/EA: Shakespeare's first 300k characters; Gibran's *The Prophet*; Emerson's *Essays*; and the editor-normalized solved Cicada LP1/LP2 prose reference. These references are **language-shape controls**, not guesses that the actual LP2 plaintext copied one of those books.

For each original printed word of GP length L, independently draw a reference word of **exactly length L**, with replacement, retaining its original physical-page-first mask. Given candidate secret letter q, count its occurrences at source-eligible rune offsets, at long-word sites and at eligible word initials. This is a reference-specific fully specified null for the literal transparent-singleton cipher and printed word lengths. It is *not* a probability model of Cicada's actual author or evidence that the author drew words independently.

## Exact all-symbol gate

For each of the 29 possible q and each observable, group original words by their fixed **(GP length, page-first eligibility mask)**. There are **41** such groups, so the computation directly uses actual page-crossing words rather than approximating first-rune exclusions. For every group, tabulate the empirical reference probability mass of 0,1,2,… legal q occurrences. Convolve the distributions once per original word by dynamic programming; an absorbing terminal bucket computes an **exact one-sided tail**, without Monte Carlo. The tested tail is chosen above or below the reference expectation to correspond to the original observed count.

A conservative within-q multiple-feature p bound is `min(1,6×minimum one-sided tail)`, allowing both tail directions and the three predeclared observables. For the **composite existential hypothesis** that *some* q among the 29 makes the model plausible, use the maximum corrected p across all q: if **every** label is anomalous, this intersection–union gate rejects the entire reference-specific model. The 29 labels are exhaustively evaluated, without a fitted alphabet or a favorable postselected letter. The original 86 event positions do not determine any key or plaintext under this test.

| Native GP language reference | All-label composite p bound | Least-disfavored q | Its decisive observable |
| --- | ---: | --- | --- |
| Shakespeare (55,407 words) | **2.25568044 × 10⁻⁹** | EA (index28) | 21 long-word sites (mean 3.7414) |
| Gibran (15,733 words) | **0.000591730** | EA | 21 long-word sites (mean 8.2082) |
| Emerson (77,932 words) | **0.001002906** | EA | 23 word-initial sites (mean 9.6436) |
| Solved Cicada reference (888 editor-normalized words) | **0.0000432034** | EA | 21 long-word sites (mean 7.0000) |

The next-best q is far weaker in every reference (corrected best-feature p ≤3.3×10⁻¹⁴ for Shakespeare; ≤9.2×10⁻¹⁵ Gibran; ≤2.6×10⁻⁹ Emerson; ≤4.4×10⁻²⁰ Cicada). q=EA is favored **relative to the other 28**, but still **fails all four** complete source-conditioned lexical shape gates. The source-native solved-Cicada reference has only a few examples of long words at many lengths, so its empirical p is especially sensitive to source coverage. The other three larger independent texts anchor the conclusion.

### Why the length-conditioned evidence matters

The total count alone can be misleading. For q=EA, the native-Cicada reference predicts about **78.31** eligible singleton-marked sites, close to the observed **86**, and about **18.10** word-initial sites, close to the observed **23**. Shakespeare predicts **88.54** eligible EA sites, also close. A mere global EA frequency comparison would falsely suggest the zero-step plaintext marker had been found.

But in the original manuscript, **21** duplicate steps occur among the **343 printed words of length ≥8**. Source-matched EA predictions are **3.74**, **8.21**, **9.29**, and **7.00** for Shakespeare, Gibran, Emerson, and solved Cicada. The exact one-sided long-word tails are respectively **3.7595×10⁻¹⁰**, **9.8622×10⁻⁵**, **5.3896×10⁻⁴**, and **7.2006×10⁻⁶**, before multiple-feature correction. Emerson's still stronger word-initial tail is **1.6715×10⁻⁴**. Page-first exclusions and original long-word inventory have all been explicitly retained.

### Independent source-position comparator

The 343 original printed long words contain **3,119 eligible in-page successor runes** out of **12,901** eligible runes overall. Under an intentionally simple key-free *ciphertext-side* comparator that allocates exactly 86 surviving repeat events uniformly among these eligible sites, the number falling in long words is hypergeometric with mean **20.79172**. The observed **21** lies only **0.0526 standard deviations** above that mean; the exact one-sided chance of at least 21 is **0.52077938**. This comparator requires neither guessed plaintext letters nor word-specific lexical distributions.

A more source-constrained version fixes **the observed number of duplicate events on each of the 55 original physical pages**, randomizes only their eligible positions within that same page, and convolves the resulting page-specific hypergeometric distributions *exactly*. It predicts **22.40583** long-word events; the chance of at least the observed **21** is **0.67935559**. The result therefore remains entirely ordinary after allowing unequal page event densities, rather than relying on a manuscript-wide uniform draw. Both comparators are implemented and asserted against the original rune masks in the SFT.

The stark contrast is informative: observed long-word events align almost perfectly with **available printed rune mass**, while any single rare plaintext GP symbol would have to inhabit those words at an unusually high rate under all four source references. It makes a ciphertext-side event process worth prioritizing over the rejected stationary transparent-rune model, subject to a real source-derived state mechanism. **Uniformly selected event sites are not a demonstrated cipher or a legitimate encryption algorithm**, and this single comparison cannot distinguish collision-rejection, adaptive formatting, or a contrived plaintext.

### Conditional test: even exactly 86 EA markers have the wrong word geometry

The global EA rate may be author-specific, so a second exact comparison **conditions on seeing exactly 86 eligible EA symbols** in the length-matched reference-generated manuscript. In the declared independent word-resampling model, the long-word marker count and short-word marker count are sums over disjoint pools, hence independent. Compute each full probability distribution up to 86 by dynamic programming (without an absorbing bucket), then use

\[
\Pr(L\ge21\mid L+S=86)=
\frac{\sum_{\ell=21}^{86}\Pr(L=\ell)\Pr(S=86-\ell)}
{\sum_{\ell=0}^{86}\Pr(L=\ell)\Pr(S=86-\ell)}.
\]

| Length-matched source | Expected long-word EA given exactly 86 total | Exact chance of ≥21 long-word EA given 86 total |
| --- | ---: | ---: |
| Shakespeare | **3.6295** | **3.11652×10⁻¹¹** |
| Gibran | **5.8359** | **1.37249×10⁻⁷** |
| Emerson | **8.2682** | **3.87914×10⁻⁵** |
| Solved Cicada prose | **7.6864** | **8.63783×10⁻⁶** |

This is an additional, separately labeled diagnostic on the predeclared EA model; it is **not** multiplied into the all-29 formal gate above. The rejection is therefore not an artifact of mismatched global EA prevalence. The event sites remain disproportionately concentrated in longer printed words even after granting the hypothesis *its observed total marker count*. The resulting probability values still concern the stated reference-word sampling assumption only.

This is a direct source-to-plaintext geometry mismatch under the declared English word-length-preserving hypothesis. There is no need to guess another AES seed, GP pad, source table column, or 28-state period to see it.

## Source-native genuine positive and limits

The SFT plants **12,956** real GP-English symbols into *all original 2,896 word shapes*, using fixed words sampled from its Shakespeare reference by a deterministic index. It encrypts via the proposed reversible transparent-EA step emitter (EA→zero, others→nonzero modulo29, deterministic position key, page-initial header) and **recovers all 12,956 plaintext runes exactly** with the explicit inverse. This confirms the conditional encoding model is genuine and lossless; no original LP2 plaintext is recovered.

**Decision:** deprioritize any direct stationary `cipher repeat iff plaintext is one fixed GP letter` interpretation **when** it claims ordinary English GP plaintext and the printed original word lengths survive encryption. Simply fitting a new stream key to that model is low value. Next attacks should bring an independent reason for *word boundary changes*, a *state-dependent marker value*, a source-supplied *special language register*, or another reversible output mechanism. This result does **not** exclude a specially composed plaintext with more long-word EA occurrences or a different stage that transforms English before this cipher. The observed p values are calibrated only for the four specified independent, length-matched empirical word models and must never be interpreted as probability Cicada intended the architecture.

**Reproduce:** `node sims/lp2_transparent_zero_symbol_lexical_gate_sft.cjs` (Node.js 22, repository root); [passing locked-source CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43363316842). All reference texts and ciphertext sources are checked into the repository. No random trials or floating optimization are required.
