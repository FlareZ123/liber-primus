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

## Independently authenticated 2014 five-by-five magic-square transfer to the whole scroll

An independent first-party source supplies actual original numbers: Cicada's 2014 Stage10 [OpenPuff plaintext](../resources/cicada2014-openpuff-magic-squares.txt) contains two genuine five-by-five magic squares, of row sums **3301** and **1033**, plus a seven-by-seven sum1033 matrix. Their full 25-cell values existed before LP2 was released. An original human could possess them while seeing the five-page scroll's exact **1,145 = 5×229** GP29 runes. The missing premise is whether the creator intended those earlier matrices as LP2 keys.

Reducing both complete authentic 5×5 matrices modulo29 gives nonzero determinants **10** and **3**, so each has a unique GF29 inverse. For each, run the *entire original p3–p7 ciphertext*, without truncation, through the 2 direct/inverse orientations ×2 printed/transpose row orientations ×2 source-visible adjacent-five/five-229-column layouts. This defines **16** complete source-fixed original decoders. Every decoded candidate exactly forward-reencrypts all 1,145 original GP glyphs. Under each corresponding inverse, authentic clear-p57-GP symbols repeated to 1,145 symbols form **16 separately encrypted planted positive messages**, each recovered **1,145/1,145**.

The 16 original-cipher outputs all have ciphertext-like GP29 index of coincidence: **minimum 0.0342245091**, **maximum 0.0348734235**, attained by direct original sum1033 matrix, original orientation, adjacent five-symbol vectors. Compare the 701 independent pinned native-GP English/Latin 1,145-rune reference windows below, with minimum **0.0558829816**. No candidate contains native-GP prose; an additional fixed unknown GP29 substitution cannot change any IoC.

**Research decision:** these two genuine historical square matrices, used as complete five-symbol block Hill keys, cannot be direct single-layer p3–p7 native-GP decoders under the 16 original/source-fixed reading conventions. Combined with the eight source-p7 circulant and 24 causal-product decoders, this establishes **48 reversible complete-scroll original-input negatives**, with successful inverse controls for all 48. The author never instructed reuse of a specific 2014 square as a Liber Primus encryption key, and a different source-selected consumer remains open. This is a negative source transfer, not recovered plaintext.

The unified [original source SFT](../sims/lp2_p3_p7_five_scroll_product_inverse_sft.cjs) reads the genuine 2014 square text, computes the full modular inverses, checks original/source-planted re-encryption, and compares native GP controls. [Windows Node22 PASS run 45014244460](https://github.com/FlareZ123/liber-primus/actions/runs/45014244460).

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

## An independent Cicada-historical five-of-five Shamir readout

Cicada's documented 2013 challenge used actual **Shamir five-of-ten sharing**, making five-share interpolation independently more plausible than an arbitrary Hill transform. The original p7 five-dot centers already have two independently pinned orders: left-to-right ranks **[1,2,3,4,5]** and top-to-bottom ranks paired left-to-right **[3,5,1,4,2]** ([the source-dot geometry study](lp2-p7-fivedot-shamir-dual-dh-source-gate.md)). The five original p7 red-word GP29 products **[11,26,8,15,2]** are a third finite coordinate possibility.

For each x-coordinate sequence, compute the exactly determined five Lagrange weights at x=0 over GF29, with **no fitted share values**. They are respectively **[5,19,10,24,1]**, **[10,1,5,24,19]** and **[6,14,20,3,16]**. Treat the full original 1,145-rune scroll as either 229 adjacent groups of five shares or five 229-rune contiguous share bands, exactly as above. Reconstruct **229 original-derived GP runes** as f(0), for a total of **six** source-fixed candidate messages.

| Original five-share coordinates | 229 adjacent five-rune groups: decoded IoC | Five contiguous 229-rune bands: decoded IoC |
| --- | ---: | ---: |
| Horizontal dot ranks | **0.03286601** | **0.03435992** |
| Vertical dot ranks | **0.03374703** | **0.03374703** |
| P7 complete red-word products | **0.03443653** | **0.03501111** |

The **highest** original 229-rune candidate IoC is **0.03501111**. As a separate native-language baseline at this shorter length, all complete disjoint 229-rune windows from the same pinned independent GP29 sources are included: Gibran **272**, Shakespeare **948**, Emerson **1,403**, and Latin **894**, totalling **3,517 genuine reference windows**. Their respective minimum IoCs are **0.05309124**, **0.04952884**, **0.04979698**, and **0.05994790**. Every one is much more language-like than all six original Shamir f(0) candidates.

Six genuine **degree-four GF29 Shamir plants** independently create all **1,145 share runes** from a 229-rune message made from actual solved p57 GP symbols, with nonzero top degree and independent seeded lower coefficients. Each source coordinate/layout combination recovers the **complete 229/229** genuine planted message exactly. The interpolation procedure is functional.

The 229-rune **Shamir secret alone is a lossy extraction of five full share bands**. A complete invertible 1,145-rune scheme would need to retain the other four reconstructed polynomial-coefficient registers, and the original source gives no rule for interpreting those auxiliary values. This test therefore rejects a **direct natural GP text at f(0)** under the exact six source-motivated alignment/coordinate choices; it does not mathematically exclude arbitrary 5-channel encodings. The 2013 historical five-of-ten mechanism and p7 dots are independently real, while their proposed use on p3–p7 original ciphertext remains unverified.

## Research decision

The five-page scroll's exact divisibility by five is a plausible physical motivation for the five source p7 numbers. Its complete untrimmed ciphertext excludes the two simplest full-register native-GP reversible transfers: standard GF29 circulant mixing and causal five-product filtering. A separate historically motivated five-of-five Shamir extraction, using both actual five-dot rankings and source-red indices, also fails to recover a natural-GP **229-rune message** from this same scroll under all six source-fixed layouts. This adds a specific original **p3–p7** gate to earlier **p8** tests; it recovers no unknown plaintext.

**The missing input is an independent authored operation and receiver-selection instruction.** No original marking specifies whether the numbers describe a matrix, key state, positions, independent page keys or something else. Further clock offsets or new nonlinear key families would be postselected without such a clue. The only path to a positive decision is a source-chosen operation generating at least 150 contiguous native GP runes and reproducing the untouched ciphertext on another scroll page without retuning. This report does not call a numerical fit an intended solve.

**Reproducer:** [Node 22 CommonJS full source SFT](../sims/lp2_p3_p7_five_scroll_product_inverse_sft.cjs), reading authentic p7 red ink, the complete canonical p3–p7 original and pinned genuine GP language controls. [PASS, expanded 32 inverses plus six five-of-five Shamir extractions, Windows run 45012292645](https://github.com/FlareZ123/liber-primus/actions/runs/45012292645).
