# The source p29/page50 link: the sole shared repeated GF29 root and a direct inverse

**Original-source finding, 15 November 2026, Agent19.** Among all 1,540 unordered pairs of original ciphertext-bearing LP2 pages and the 256-cell numeric table, physical **p29 and p50 are the only pair sharing a repeated linear root** in their high-first GP29 coefficient polynomials. Two source-fixed uses of the quotient, one as a direct shared pad and another as nine 28-symbol chapter keys, fail to recover unknown plaintext. This supports focusing on the specific p29/p39/p50 relationship, but it is **not** a recovered authorial cipher, key or puzzle destination.

## Source-constrained hypothesis

Physical p39 (scan 56.jpg) prints exactly three isolated red runes with GP ordinals **[27,5,15]**. Interpreting them as a *low-degree-first* polynomial yields

\[
G(X)=27+5X+15X^2=15(X-24)^2\pmod {29}.
\]

Previous work already established separately that the **277-rune original p29** and **256 original p50 byte cells reduced modulo29** are both divisible by \(G\). This test asks the stronger question whether the same two source objects share a larger polynomial factor, whether any other original page pair exhibits an equally constrained high-order relation, and whether the respective original quotients can serve directly as ciphertext and additive key.

The code reads only the canonical [original-runic corpus](../resources/liber-primus/lp2-corpus.json), [original red-ink positions](../resources/liber-primus/lp2-ink-annotations.json), and the [source-decoded table bytes](../resources/liber-primus/lp2-grid-256.json). No page order, rune, numerical table cell or original word boundary is changed. Source page p50 has no runes; the 55 rune-bearing encrypted physical pages together contain **12,956** original runes. The two already solved p56/p57 pages are excluded from the unordered ciphertext-pair census, with p57 retained as a known-language positive control.

## Whole-artifact exact-GCD result

Normalize every polynomial gcd to monic GF29 coefficients, using the original printed order as descending-degree coefficients. Exhaustively compute all \(\binom{56}{2}=1,540\) page/table pairwise Euclidean gcds.

| Exact shared-factor degree | Distinct source pairs |
| ---: | ---: |
| 0, coprime | **1,450** |
| 1 | **88** |
| 2 | **2** |
| 3 or greater | **0** |

The **only** degree-two pairs are:

* **p27 and p48:** monic \(X^2+6X=X(X-23)\). Both originals end with the GP **F=0** rune, trivially giving the root zero. Physical p17 and p51 also end with F; this pair's additional shared simple root23 has no established independent source instruction or decipherment.
* **p29 and p50 numeric table:** monic \(X^2+10X+25=(X-24)^2\). The **same root24 occurs with multiplicity two in both distinct source objects**. Neither shares an additional polynomial factor with the other. This exact identity is independently linked to the isolated original p39 red triad above.

**Later source-selection update (Agent17, 19 November):** the p29 side of this pair now has a conditional independent selector that was unavailable when the GCD census was discovered. P28's local `THE` candidate matches the unique authenticated signed `THE` at source/page index28; its immediate follower `DIRECTION` at index29 selects project p29 under the same zero-based convention, equivalently physical page30 under one-based numbering. The dedicated [selector audit](lp2-p28-the-direction-p29-selector.md) then opens the repeated-root test and finds p29 alone among 55 unknown rune pages with root24, and p29 alone sharing a repeated root with the table. This strengthens the pair's page selection while leaving the polynomial interpretation and direct inverse unresolved.

The table also has the distinct previously established signed-2013 quadratic factor \(H(X)=24X^2+26X+3\), so its complete source-known factor is \(H\cdot G=[12,17,11,21,23]\) high-first. The p29 polynomial is divisible by \(G\), while its remainder against \(H\) is nonzero (previously established). The 2013 signed BASE29 example and the p39 red triad were not originally published as instructions for GF29 polynomial factoring. The p39 triad uses low-first coefficients, whereas the page/table gcd uses high-first. That choice of orientations remains an unverified hypothesis about author intent, despite the exact algebraic match.

This census is descriptive over the predefined 56 source objects. It is not a source-locked discovery probability that Cicada deliberately encoded these factors.

## Test the directly usable original quotient as a key

There is one simple potential plaintext-producing consequence: both original objects carry \(G\), so remove their exact common factor and test whether one is an additive GP29 key for the other's first or last complete quotient register. The original output lengths are **275** (p29 divided by G), **254** (p50 divided by G), and **252** (p50 divided by H·G). These are fixed without fitting to target language.

For each table quotient \(K\), use either its source-aligned initial 254/252 p29 quotient runes or its terminal 254/252 runes, then apply \(P_i=(Q29_i\pm K_i)\bmod29\). The inverse reencrypts every original rune in the tested register. Both signs are admitted because the original source provides no direction. The exact GP29 index-of-coincidence results are:

| Table quotient key | Source alignment | Subtract | Add |
| --- | --- | ---: | ---: |
| p50 / G (254) | beginning | **0.03317668** | **0.03650680** |
| p50 / G (254) | ending | **0.03597772** | **0.03345679** |
| p50 / (H·G) (252) | beginning | **0.03629925** | **0.03430722** |
| p50 / (H·G) (252) | ending | **0.03440207** | **0.03557200** |

These are all near the GP29 uniform-cipher baseline **1/29 ≈ 0.03448276**. The original recovered-p57 native plaintext control has IoC about **0.06271**. None of the eight entire fixed original readouts contains sustained coherent native-GP English. A source-native positive plant repeats the **95 genuine solved-p57 runes** to the required complete quotient lengths, encrypts them with the unchanged table-derived key for each sign and alignment, and recovers **every planted rune**. That checks implementation power; it does not authenticate any of the keys.

A further fixed signed-2013 BASE29 byte-transport reading of both original source quotients gives unframed, nontextual opening bytes (e.g. original p29/G begins **2403a3a29e2ad42b**, p50/(H·G) begins **04598e588f3e70d4**); neither is recognizable plaintext or a standard file signature at offset zero. No adjusted byte phase or additional secret is licensed by the source.


## Nine 28-symbol chapter keys after removing both source factors

The signed-2013 \(H\) factor and p39's \(G\) factor have combined degree four, leaving the **252-coefficient** original table quotient. A separate, economical human reading is

\[
252=9\times28.
\]

The manuscript has exactly **nine visibly delimited chapters**, while the GF29 Gematria Primus field has **28 nonzero elements**. **Essential algebraic caveat:** the original table's first byte is 203, which reduces to zero modulo 29. The high-first table polynomial therefore has effective degree **254**, and its quotient by the degree-four factor has only **251 leading-zero-trimmed coefficients**. The source's physical fixed-width 256-cell representation preserves a leading zero coefficient, allowing a **padded 252-symbol** quotient. Thus the 9×28 division depends on retaining an original physical zero slot; it is not forced by the algebraic degree alone. With no key fitting, slice this quotient into **nine consecutive, printed-order 28-rune rows** and use row \(j\) as that chapter's period-28 GP29 additive key. Chapter rune totals are fixed independently as **[729,1145,1729,1903,1021,1433,1680,3008,308]**. This is a motivated exploratory interpretation, since the artifact itself does not state that the quotient is a key or that the 28 field elements are a key clock.

A quick stronger structural possibility, that each row is a 28-element alphabet permutation, fails immediately: the nine rows have only **[16,19,21,16,19,16,18,17,22]** distinct GP symbols. The direct cipher candidate treats the original quotient residues as keys instead and decodes all **12,956 untouched original rune positions**. Four finite tests combine both signs with ordinary key consumption or optional plaintext-F-transparent behavior copied from solved p56. The latter gives literal ciphertext F=0 positions a key-free pass, using those original positions as its exact reversible mask; it is a diagnostic extension and does not prove the p56 skip rule transfers to these pages.

| Nine-chapter key transfer | Original all-rune IoC |
| --- | ---: |
| Subtract rows, ordinary clock | **0.03449320** |
| Add rows, ordinary clock | **0.03444822** |
| Subtract rows, F-transparent mask | **0.03579393** |
| Add rows, F-transparent mask | **0.03585953** |

The no-skip outputs are nearly exactly uniform GP29, and neither skip output approaches a native-language GP29 reading. No original chapter begins with sustained grammatical text. Both ordinary-clock cases recover independently solved-p57 text on **all 12,956 rune positions** when encrypting the planted plaintext under the same row keys, and all four source-masked original transforms reencrypt the complete original exactly. These controls check the mechanics and scope, without supplying a creator-authenticated cipher.

A stronger **all-row-reassignment test** admits an unknown secret permutation of the nine quotient rows across the nine chapters. It also grants an independent choice of additive sign and literal-F bypass per chapter. Because each chapter must select one of its **9×2×2 = 36** fixed inverses, it suffices to compute the maximum IoC over those 36 per chapter, exactly **324** original-input tests rather than enumerating all 9! allocations. The maxima in source chapter order are:

| Chapter original runes | Best IoC across every source row, sign and F-mask |
| ---: | ---: |
| 729 | **0.039272** |
| 1,145 | **0.035547** |
| 1,729 | **0.036710** |
| 1,903 | **0.036656** |
| 1,021 | **0.036335** |
| 1,433 | **0.036424** |
| 1,680 | **0.035598** |
| 3,008 | **0.036530** |
| 308 | **0.035767** |

Thus **every original chapter is below 0.040** even when independently handed its best of all nine rows and both signs and skip interpretations. Every full nine-row assignment is contained in these independently optimized choices, so permuting or reversing chapter allocation cannot obtain an ordinarily frequency-skewed native GP-English chapter under this entire direct-additive, 28-period family. This necessary-condition rejection is independent of the hidden permutation and of any language-derived ranking function, with the usual limitation that an intermediate non-English register could remain uniform.

One other literal consumer is motivated by the **actual shared polynomial factor**: instead of using a quotient row as an additive pad, treat each 28-coefficient row as a polynomial multiplier of the corresponding chapter's unknown plaintext. Such a direct product requires **exact zero GF29 remainder** on dividing the chapter ciphertext polynomial by its source-derived row polynomial. Without choosing an assignment, evaluate all nine rows against every chapter in both fixed coefficient orientations: **9×9×2 = 162 complete remainder tests**, covering any secret chapter-row assignment and both traversal choices. **Zero of 162 divide exactly**; the most favorable nonzero remainder has only four zero coefficients. This independently closes the natural *polynomial product* use of these nine quotient keys, without searching for unknown keys. A feedback/stateful layer is not covered.

This is a second decisive failure of the direct source-derived quotient-as-key interpretation. The attractive \(9\times28\) length identity, like the unique shared-root census, is subject to retrospective clue selection; it does not establish that the original table quotient contains nine chapter keys.

## Research decision

The p29/p50 shared repeated root is now established as **unique among all page/table pairs** in this representation. This meaningfully localizes the mathematical clue: a global page-to-page common polynomial decoder is unsupported, and **neither direct quotient-pad nor nine-chapter period-28 quotient key** produces original plaintext. The second degree-two pair's root0 is attributable to a visible terminal F in both images and should not be promoted alongside the repeated root24.

The most promising remaining interpretation is that p29 and the p50 table carry **related GF29 checks or framing** rather than directly sharing a readable keyed stream. That remains a hypothesis. A substantive next step needs an independent original clue supplying an opcode, framing or key that consumes this exact shared factor and makes a falsifiable prediction on unmodified ciphertext. An independently published instruction specifying how to consume this factor would justify a new experiment; extending the failed quotient interpretations with arbitrary shifts or fitted substitutions would repeat the same conjectural search.

**Single-file reproducer:** [Windows Node.js 22 CommonJS SFT](../sims/lp2_p29_grid_pairwise_factor_key_sft.cjs) asserts all 1,540 gcd degrees, the two exact exceptional gcd polynomials, the original p39 red triad, both original quotient lengths, all eight native-language original inverse statistics, reencryption, and the full solved-p57 planted positives.
