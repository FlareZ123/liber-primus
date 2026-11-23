# P7 red quartic as a 7 × 13 × 19 circulant receiver on the complete botanical chapter

**Agent19, 23 November 2026. Classification: one source-constrained, fully reversible original-cipher negative.** No previously unsolved Liber Primus plaintext, historical key, receiver instruction or destination has been recovered. This note is intended to close one finite interpretation, not to establish that the source arithmetic implies the cipher.

## A plausible but unselected human path

The five complete red words at the end of physical LP2 p7 have GP29 index-products **[11,26,8,15,2]**. Prior original-source work found that these five values, taken as the ascending coefficients of one quartic, fix 3 and 4, exhibit a seven-cycle, and are echoed by original p8's red heading. These input facts are already documented in [the p7/p8 source report](lp2-p7-p8-original-red-polynomial-fixedpoint.md) and [the seven-cycle analysis](lp2-p7-red-polynomial-seven-cycle-original-gate.md). This experiment does not re-establish them as independent discoveries.

The adjacent illustrated chapter occupies physical pages **p8–p14**, seven original pages. The source-native complete rune counts are **[255,268,263,273,261,272,137]**, summing exactly to **1,729 = 7 × 13 × 19**. The numeral **XIX** is visible in p8's red heading and the recurring large dot stencil has 13 dots. Read together, these offer one plausible geometric *hypothesis*: regard the **entire intact original chapter** as a row-major 7 × 13 × 19 tensor, and interpret the p7 five-number register as coefficients of a cyclic linear filter, applied independently around each of its three axes. The seven-cycle of the source quartic offers a specific reason to try a seven-position axis.

**Weakest premises:** no 2014 author instruction chooses a 7 × 13 × 19 reshaping, a circulant convolution, its row orientation, or three repetitions of the same polynomial. The prime factors and page/ink motifs were correlated retrospectively. Physical page ends do not coincide with the tensor's 247-rune row breaks. These are major alternative explanations for the numerical relationship, and the model must earn its credibility through the original decipherment rather than through a count match.

## One frozen original-source inverse

Use source coefficients `a=[11,26,8,15,2]`, pad with zeros, and for each axis size `n∈{7,13,19}` define a right-circulant matrix over GF29:

`M_n[r,c] = a[(c-r) mod n]` for indices 0–4 and 0 otherwise.

All three matrices are invertible modulo29, with exact determinants **[20,12,26]**. The candidate forward encoder is the separable three-axis map `C=(M_7⊗M_13⊗M_19)P`; the original-source decoder applies the corresponding exact matrix inverses in each axis. There are no fitted phases, guessed plaintext words, secret keys, changed source runes or discarded symbols. The complete unknown chapter is the sole original target; p8's red heading is included.

The independently source-checked original chapter consists of **1,729** unchanged GP29 symbols:

| Readout | Whole-chapter GP29 index of coincidence |
| --- | ---: |
| Untouched printed ciphertext | **0.03446048347364137** |
| Full 7 × 13 × 19 original inverse | **0.03445579761369235** |
| Genuine solved p57 GP29 text, repeated to 1,729 symbols | **0.07200694042799306** |
| Same native positive after forward three-axis encryption | **0.03507299230983441** |

The original inverted prefix in canonical rune names is:

`E C M A S I R W NG A W L H A H U W EA D EO A J F E M Y J D R EO EO EA H NG D OE X O S D D G A J I L U OE N X W T OE J U U A G`.

It is nonlinguistic, and its full-register coincidence remains essentially the GP29 uniform baseline 1/29. The inverse exactly re-encrypts **1,729/1,729** original source runes. A separate native plaintext positive encrypts and then recovers **1,729/1,729** symbols of the solved p57 GP29 reference, preserving the high coincidence. These checks establish an operationally correct inverse, without authenticating it for the real book.

## Decision

**Reject this precise 7 × 13 × 19 three-axis circulant interpretation as a direct native-GP29 decipherment of p8–p14.** The output is random-like, whereas the source-native positive control becomes clearly nonuniform after correct inversion. The observed count factors, p7 coefficient packet, and p8 title offer a compact exploratory explanation but no source-selected decryption rule. A transposition-only variant cannot by itself repair the original text's nearly uniform rune histogram.

Do not expand this failed family through fitted axis permutations, missing resets, alternate key polynomials, unknown post-processing layers or searched ciphertext phases without a separately observable original instruction. The valuable independent clue remains the p7/p8 coefficient/root relation, not this negative decoder.

**Reproduction:** [read-only, Windows-compatible CommonJS SFT](../sims/lp2_p7_redpoly_separable_7x13x19_original_sft.cjs) reads the checked-in original GP29 corpus, derives the five polynomial coefficients from p7's original rune indices, asserts seven original chapter page counts and all determinants, tests original replay, tests a full-length solved-p57 native positive, and prints the exact scores and prefix above.
