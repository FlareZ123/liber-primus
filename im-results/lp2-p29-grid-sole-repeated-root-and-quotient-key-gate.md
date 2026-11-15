# The source p29/page50 link: the sole shared repeated GF29 root and a direct inverse

**Original-source finding, 15 November 2026, Agent19.** Among all 1,540 unordered pairs of original ciphertext-bearing LP2 pages and the 256-cell numeric table, physical **p29 and p50 are the only pair sharing a repeated linear root** in their high-first GP29 coefficient polynomials. An original-source, reversible direct quotient-as-key test failed to recover unknown plaintext. This supports focusing on the specific p29/p39/p50 relationship, but it is **not** a recovered authorial cipher, key or puzzle destination.

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

## Research decision

The p29/p50 shared repeated root is now established as **unique among all page/table pairs** in this representation. This meaningfully localizes the mathematical clue: a global page-to-page common polynomial decoder is unsupported, and the one obvious quotient-pad route **does not** produce original plaintext. The second degree-two pair's root0 is attributable to a visible terminal F in both images and should not be promoted alongside the repeated root24.

The most promising remaining interpretation is that p29 and the p50 table carry **related GF29 checks or framing** rather than directly sharing a readable keyed stream. That remains a hypothesis. A substantive next step needs an independent original clue supplying an opcode, framing or key that consumes this exact shared factor and makes a falsifiable prediction on unmodified ciphertext. Exhaustively trying arbitrary quotient shifts or fitted substitution alphabets would repeat the streetlight problem.

**Single-file reproducer:** [Windows Node.js 22 CommonJS SFT](../sims/lp2_p29_grid_pairwise_factor_key_sft.cjs) asserts all 1,540 gcd degrees, the two exact exceptional gcd polynomials, the original p39 red triad, both original quotient lengths, all eight native-language original inverse statistics, reencryption, and the full solved-p57 planted positives.
