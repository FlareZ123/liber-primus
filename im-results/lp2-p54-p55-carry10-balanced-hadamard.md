# P54→p55 cross-page word carry produces two 43-rune tapes; original all-secret matrix attack

**Agent11, 22 November 2026, Director #2229. Source-grounded new register plus exact negative for a constrained full-state decoder. No authentic unknown plaintext, creator key or final destination.**

A genuinely contiguous source register closes physical p55's missing 10-unit outer count: **the last ten runes of p54 + p55's 33 word exteriors =43**, exactly equal to the 43 strict interiors of p55. The two 43-symbol tapes use **all 86 original runes**, including the complete word crossing the page break. This specifies a new real input geometry for possible reversible two-stream decoders. It still requires an independent operation selected by the creator; the artist did not label the 43/43 scheme.

## 1. The original cross-page source

Archive image `71.jpg`, physical p54, ends with an **unterminated ten-rune** fragment:

`G · O · T · TH · X · E · EA · R · G · Y` (canonical GP rune transliteration).

Archive image `72.jpg`, physical p55, begins with the single `NG` before an original hyphen, ending that 11-rune word. The p55 page has **76** runes divided into its original **17 page-local word fragments** of lengths

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

Keep the first and last rune of each complete fragment, and keep the lone incoming `NG` as an outer rune: **33 original exterior** and **43 strict-interior** p55 runes. The source-aligned 86-rune register is:

| Tape | Source of exactly 43 GP29 symbols | Original-order position treatment |
|---|---|---|
| **A** | All 43 strict word interiors on p55 | source order within and across complete p55 words |
| **B** | Final ten p54 runes, then 33 p55 exteriors | source chronological order; the first p55 `NG` remains attached to its p54 predecessor |

The complete state is `p54 last10 || p55 all76`, with no inserted pad, invented word break, omitted rune or guessed GP value. The 10-rune p54 tail has a *real word-continuation relationship* to that p55 singleton, making it a more specific candidate for the ten missing counterstream cells than an unrelated adjacent key.

An original-only census uses the identical first/last extraction rule for **53 physical neighboring rune-bearing unknown-page pairs**, omitting the runeless p50 transition. Only the p54→p55 pair satisfies **`current strict-interior count − current outer count = previous terminal printed fragment length`**: here **`43−33=10`**, with the preceding fragment length10. This describes a preselected exact-source match after noticing p55; because manuscript pages have varying widths and the wordwise boundary interpretation remains a hypothesis, it is **not an independent probability of intentional design**.

The [source-authenticated register and original86 reconstruction SFT](../sims/lp2_p54_p55_carry10_balanced_hadamard_sft.cjs) passed [Windows Node22 CI 45014156169](https://github.com/FlareZ123/liber-primus/actions/runs/45014156169).

## 2. First complete two-tape inverse: source-order Hadamard

The historically familiar GP29 arithmetic and two mirrored moth wings suggest the simple, mathematically invertible symmetry

`H(A,B)=(A+B,A−B) mod29`, with `H⁻¹(A,B)=15×(A+B,A−B) mod29`.

There is **no first-party 2014 sentence instructing this Hadamard operation**. Freeze tape pair index `i=0..42`, align A and B as printed, and apply both H and its inverse **to both tapes**, replacing **all 86 physical positions** in their source order. Every original GP rune is forward-replayable. Both complete 86-rune candidate readouts have **IoC 0.038303693570451436** against the untouched original86 **0.036114911080711354**; neither forms an original wordwise English passage. The 16 complete p55 words under H are:

`RAEPW | ATH | TS | IAEAHHLEO | NGYEADTHM | HM | ILAENGAEWSAEARNGNGU | EOEIASAEEO | UIAEOC | DAE | WGSEOCF | DUUBRJT | FAE | DRAPGAE | AEEAR | DEAH`.

Both operations preserve physical page/word positions. The standalone SFT emits full original and inverse outputs and independently recovers **86/86 genuine source-native solved-p57 runes** in an encrypted plant. This validates code correctness, not the historical plaintext.

## 3. All-secret key-recovery attack: every fixed invertible 2×2 GF29 matrix

A substantially stronger and **cryptanalytically decisive** decoder model lets the creator choose **any** fixed 2×2 matrix

`M=[[a,b],[c,d]] mod29` with `ad−bc≠0`,

thereby changing all interior and exterior values, with **no known secret coefficients**. There are exactly `(29²−1)(29²−29)=682,080` possible matrices. The two natural source input pairings are **B in printed order** and **B reversed** (the literal moth-wing mirror). Each model returns the transformed 86 runes to their original positions and has a unique exact inverse. The only further assumption is that original printed p55 word breaks survive and the 13-rune seventh complete word represents an ordinary native-GP English word.

The original p55 complete word beginning at zero-based offset23 contains **13** GP runes:

`B-EA-F-X-I-M-U-C-P-H-NG-L-EO`.

It occupies **11 A-tape positions and exactly two B-tape endpoints**. For either fixed B orientation, two linearly independent original input pairs among the A outputs determine the first row `(a,b)` uniquely, and two independent B inputs determine `(c,d)`. Thus **only four of 13 positions** are needed to infer the complete secret matrix for any proposed 13-rune plaintext word; the other nine positions must predict correctly. No sampling of keys, scoring threshold, or parameter optimization is required.

The pinned source-native lexicon is the exact union of the Shakespeare, Gibran, Emerson and TextBlob English controls, normalized under historical GP29 spelling including `ING` and `IO` ligatures. It yields **422 distinct GP29 words of length13**. For each word, the [all-secret crib-recovery SFT](../sims/lp2_p54_p55_carry10_allsecret_gl2_word13_sft.cjs) solves the unknown matrix algebraically and checks every remaining rune. The observed result is:

| Full 86-rune pairing | Potential source-native GP13 words | Invertible secret matrices allowed | Entire original 13-rune word matches |
|---|---:|---:|---:|
| B in literal physical order | 422 | 682,080 | **0** |
| B in literal reversed order | 422 | 682,080 | **0** |

This rejects **every secret fixed GL2(29) paired decoder** of the 86 original symbols in these two author-visible pairings *if* the source's 13-rune word preserves its boundaries and belongs to the pinned GP13 native-English vocabulary. It is materially stronger than testing H alone or fitting coefficients from language scores. It cannot exclude differently segmented text, non-English plaintext, an independently sourced key evolving per pair, or an explicit separate encoding layer.

The SFT plants a real independently solved **86-rune p57** passage with the authentic English GP13 word `CIRCUMSTANCES` placed at the exact original 13-position physical slot. A hidden invertible secret matrix `[[5,8],[13,21]]` encrypts all 86 symbols. Under each of the two pairing orientations, the same cryptanalytic recovery program finds the **complete hidden matrix solely from the authentic 13-rune word**, decrypts the entire native passage **86/86**, and rejects a deliberately wrong matrix. This prevents a false negative caused by a cipher implementation that cannot actually recover valid synthetic source-shaped input. All original and positive assertions passed [Windows Node22 CI 45014741716](https://github.com/FlareZ123/liber-primus/actions/runs/45014741716).

## 4. Cryptanalytic choice and open source field

The **cross-page 10+33=43 counterstream** is now a concrete, source-verifiable register that permits simultaneous alteration of p55 interior and exterior runes while respecting the actual p54→p55 unfinished word. Its simplest reversible GF29 consumer fails, and even the **entire unknown stationary invertible 2×2 matrix family** cannot decode the original 13-rune word into any of 422 independent GP-native English references in either source-natural orientation.

The missing *creator-authored field* is the **actual two-tape symbol-changing opcode**: a rule choosing pair order, arithmetic, state transition, or an external key beyond the bare observed 43/43 lengths. This limitation prevents an original 76/76 p55 decoder and prevents the requested p54 150+ rune holdout. A known-matrix plant is a proof of test reachability, not an original decipherment.

Do **not** extend this falsified family with fitted offsets, additional free matrix phases, arbitrary secret S-boxes or speculative word changes merely to rescue it. Any renewed decoder attempt should originate from a period-source instruction that fixes a new reversible operation and then predict an untouched original passage. The earlier competing p54→p55 **9+256+43** and **256+52** source-count partitions remain distinct, as documented in [the p50 overlay report](p54-p55-256-inner52-source-gate.md). No original plaintext, real key or final destination is recovered in this experiment.
