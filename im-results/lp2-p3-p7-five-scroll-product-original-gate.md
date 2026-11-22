# Five-page p3–p7 scroll: original source five-product matrix and causal inverses

**Agent4, 22 November 2026, Director issue #2222. Classification: complete original receiver negative under specified reversible architectures. No recovered unknown LP2 plaintext.**

## Source-chosen opportunity and independent rival

The original 2014 images show **p3–p7 as a five-page scroll** with repeated side ornament, conspicuous red initials and a closing p7 set of **five red printed words and five black dots**. The untouched five-page text has physical lengths **217|261|263|196|208**, summing to **1,145 = 5×229 original GP29 runes**. A whole-scroll five-column reversible transform can therefore consume every rune without padding, deleting runes or shifting across external pages.

The five final red p7 words occupy exact local glyph offsets194–207, split **2|4|3|2|3**. Their zero-based original **GP29 rune-index products modulo29** are **[11,26,8,15,2]**, not Gematria Primus *prime-weight products*. The exact 5×5 right-circulant with this first row and its first inverse row **[23,2,5,2,19]** were independently found in [the previous p7 study](lp2-p7-red-circulant-dh-original-inverse.md); no source tells a solver that a circulant is actually the intended cipher.

The strongest rival is that the red numbers are a separate teaching, checksum, or navigation clue. The visible scroll geometry does not supply a corresponding reader instruction. This experiment freezes two smallest complete reversible consumers and tests them on their **actual preceding scroll** rather than retracing the already-tested p8 matrix.

## Exact original 5×5 block-matrix inverse

Take the source product vector as row0 of a right-rotating circulant matrix M. Derive its full inverse in GF29 by actual elimination and assert M×M-inverse equals identity. Admit M and its inverse as the two possible encryption directions; also each transpose as the only orientation alternative.

Two natural original unpadded 5×229 scroll serializations are admitted: consecutive five-rune vectors across the original 1,145-rune text, or 229 consecutive vectors whose five entries lie at offsets k, k+229, k+458, k+687 and k+916. Both use all five source values. This produces exactly **8 complete inverse cases**, with every output verified to forward-reencrypt all unchanged 1,145 original glyphs.

| Complete original scroll receiver | GP29 index of coincidence |
| --- | ---: |
| Untouched scroll ciphertext | **0.0346337069** |
| Maximum across all 8 source-fixed block transforms | **0.0346169115** |
| Minimum across all 8 source-fixed block transforms | **0.0342092405** |

The strongest original candidate remains a uniform-frequency nonlinguistic GP29 stream. Reading the five-column arrangement in a different final order cannot change the original rune histogram. Likewise an *arbitrary unknown final monoalphabetic GP29 substitution*, including any Caesar/affine relabeling, cannot rescue these outputs: index of coincidence is invariant under a bijection on the 29 glyphs.

## Exact causal five-product alternate operation

A second genuinely different human-legible use of the five numbers is an invertible **causal GP29 polynomial filter**, rather than a Hill block. Test:

    C_i = P_i ± 11 P_(i-1) ± 26 P_(i-2) ± 8 P_(i-3) ± 15 P_(i-4) ± 2 P_(i-5) mod29,

where the signs of all five tap terms move together, or

    C_i = 11 P_i ± 26 P_(i-1) ± 8 P_(i-2) ± 15 P_(i-3) ± 2 P_(i-4) mod29.

Both use the exact source products, including an invertible leading coefficient in the second family. Apply products in original or reversed order. Reset the causal state at exactly one of three source-visible scopes: once at the start of the whole scroll, at each of its five physical pages, or at actual printed red/major punctuation cuts p3:16/119/122, p6:71/82, p7:194. Every start uses a public zero history. This is exactly **2 filter kinds × 2 signs × 2 product orientations × 3 source reset scopes = 24** complete models.

Every candidate decrypts and reencrypts the original 1,145 runes exactly; none produces ordinary GP-native text. The strongest of the 24 has IoC **0.0347726509**. Across **all 32** Hill/filter candidates, no decoded original register exceeds this.

## Language controls and constructive plants

The [existing source-calibrated English GP29 encoder](../sims/lp2_native_gp_source_orthography_sft.cjs) is fixed from genuine solved LP1 and p57 spelling, including the special handling of IO and ING; the independent Latin GP29 corpus is already encoded. Compare *every complete disjoint 1,145-rune window* of the four pinned unrelated prose corpora:

| Native GP29 prose control | Number of full independent windows | Minimum GP29 IoC |
| --- | ---: | ---: |
| Gibran | 54 | **0.0575869545** |
| Shakespeare | 189 | **0.0558829816** |
| Emerson | 280 | **0.0567593978** |
| Latin Vulgate | 178 | **0.0694597978** |

All **701 native GP29 prose windows** are more concentrated than every complete unchanged-original scroll inverse by at least **0.02111** IoC units. This is an exact source-native comparative rejection of the declared single-layer reversible architectures. It is conditional on GP-native plaintext rather than deliberately frequency-flattened language, another language, a changing outer alphabet, or compressed intermediate data.

For implementation controls the program plants the **95 genuine solved p57 GP29 rune indices**, repeated to fill an entire scroll-length 1,145-rune known register. It encrypts under all **8 Hill** and **24 causal source-reset** models, then decrypts and reencrypts each one exactly. **All 32/32 full-length planted roundtrips succeed.** Original negative results therefore cannot be attributed to broken finite-field arithmetic or a noninvertible chosen operator.

## Research decision

The five-page scroll's exact divisibility by five is a plausible physical motivation for using the five source p7 numbers. Its complete untrimmed ciphertext decisively rejects the two simplest executable reversible transfers: standard GF29 circulant block mixing and causal five-product polynomial filtering, even under the two natural five-column serializations and actual printed red boundaries. This adds a specific original **p3–p7** gate to earlier **p8** tests; it recovers no unknown plaintext.

**The missing input is an independent authored operation and receiver-selection instruction.** No original marking specifies whether the numbers describe a matrix, key state, positions, independent page keys or something else. Further clock offsets or new nonlinear key families would be postselected without such a clue. The only path to a positive decision is a source-chosen operation generating at least 150 contiguous native GP runes and reproducing the untouched ciphertext on another scroll page without retuning. This report does not call a numerical fit an intended solve.

**Reproducer:** [Node 22 CommonJS full source SFT](../sims/lp2_p3_p7_five_scroll_product_inverse_sft.cjs), reading authentic p7 red ink, the complete canonical p3–p7 original and pinned genuine GP language controls. [PASS, Windows run 45011822518](https://github.com/FlareZ123/liber-primus/actions/runs/45011822518).
