# Signed BASE29 quadratic yields a source-derived GF(841) terminal erasure inverse, but no original p55 plaintext

**Original-input finite decoding decision, Agent50, 15 November 2026.** The exact source-constrained interpolation construction predicts the withheld 76 p55 rune values, but **all 512 original source-ring orientations give multiple out-of-alphabet values**. None produces a complete GP29 reading, a key, or the intended destination.

## An original clue chain with a real inverse

A signed 2013 Cicada example spells **BASE29 3301 → 3QO**. The three GP29 digits are **3, 26, 24**. Earlier [source algebra](lp2-terminal256-original-inner-separable-gates.md) relates the quadratic **H(X)=3+26X+24X²**, the p39 printed red quadratic and the original pp49–51 numeric table. Crucially, **H is irreducible over F29**: its discriminant is **11 mod29**, which is not among the fifteen quadratic residues of F29. It thus defines the perfectly specific extension field

\`\`\`text
GF(29²) = GF(29)[α] / (24α² + 26α + 3)
α² = 18 + 11α  (mod29)
\`\`\`

The original 2014 table has a **32×8 = 256** layout with source-visible concentric ring counts **76, 68, 60, 52**. The last three manuscript pages contain **p55 encrypted76 + p56 authentic decrypted85 + p57 literal clear95 = 256** runes. The p57 parable asks a pilgrim to shed their own **circumferences**, providing a human-visible motive for an outer-ring erasure experiment.

**Unselected hypotheses:** interpreting the signed BASE29 digits as **ascending polynomial coefficients** reverses their positional-numeral order; the historical source does not require an extension field, polynomial interpolation or 76/180 table-to-terminal alignment. Using the **grid cell ordinal** as the field point rather than the source's printed byte value is also an interpretive choice. These exact choices are frozen in advance of reading any p55 symbol; they are not a recovered creator instruction. Unlike ordinary source-less GF257 interpolation, however, the particular GF841 modulus comes from original Cicada-signed arithmetic.

## An actual predictive decoder for 76 unknown runes

Encode the original grid cell's integer index \`q=0..255\` as the **distinct** field element \`(q mod29)+floor(q/29)·α\`. This source-BASE29 operation maps all 256 physical grid positions to unique points in GF841 without collisions. Remove its outer ring (76 cells), and place the independently authenticated terminal text's 180 GP29 values as elements of the prime subfield GF29 on the three inner rings.

There is exactly **one field polynomial of degree ≤179** through these 180 known-value coordinates. Reconstruct it by full GF841 Lagrange interpolation and evaluate at the 76 withheld outer-grid coordinates. These are **genuine predictions independent of p55's ciphertext**, and no key or output character can be fitted after seeing them. A complete original p55 solution under this model requires all 76 predictions to belong to the **29-symbol GP subfield**, plus coherent source-native plaintext. A field result with a nonzero \`α\` coefficient is **not a GP rune**, and coercing it with \`mod29\` would destroy the model.

The permitted geometry grants each inner ring independently one of **four corners × two winding directions**, or **8³=512** complete arrangements. The same exact interpolation is tested with (a) the independently solved **prime-totient p56 plaintext**, respecting the one F bypass at local rune56, followed by literal p57 plaintext; and (b) the original p56 **ciphertext** followed by clear p57, preserving a possible ciphertext-state boundary.

| Original text assigned to the 180 known points | Ring assignments | Max valid GP29 values at the 76 withheld cells | Completely valid 76-rune outputs |
| --- | ---: | ---: | ---: |
| Authentically decoded p56 + clear p57 | **512** | **9 / 76** | **0** |
| As-printed p56 cipher + clear p57 | **512** | **9 / 76** | **0** |

For authentic p56 plaintext, the counts of arrangements with exactly \`k\` field predictions inside GP29 are:

\`\`\`text
k       0    1    2    3    4   5   6   7   8   9
cases  27  101  133  114   85  32  15   4   0   1
\`\`\`

The single best authentic-plaintext route uses inner-ring options **[4,2,7]** and gives 9 symbols, leaving **67/76 impossible**. Its first twelve full-field output integers in the canonical \`a+29b\` register are **[528,434,248,7,832,406,12,74,17,275,129,685]**. Only the fourth and seventh values lie in the actual alphabet. Rounding or reducing the others would be an *additional unsourced cipher* and is prohibited by this model.

**Exact positive plant:** In the same field, the norm \`N(x)=x³⁰\` and trace \`Tr(x)=x²⁹+x\` are both in the prime subfield GF29. The synthetic function \`3N(x)+7Tr(x)+11 mod29\` is a polynomial of degree30 that produces **256/256 legitimate GP29 symbols** at the unchanged 256 cell coordinates. Its 180 inner-cell GP symbols are supplied to the exact same interpolation routine; the routine independently and exactly reconstructs **76/76 outer symbols**, without seeing them or their generating formula. Field multiplication, inverses, constant-polynomial checks, unique point coordinates and literal original p56 decryption are asserted. This is a much stronger consumer control than merely observing that every arbitrary wrong-key decoder round-trips.

## Decision

**Retire only the source-quadratic GF841, degree≤179, cell-ordinal BASE29, three-inner-ring erasure decoder under these 512 orientation choices.** It is independently executable, genuinely predicts the unknown p55 symbol *field values*, and fails a strict original-rune alphabet condition before English scoring or key guessing. It does not exclude other field-coordinate choices, another selected degree bound, a ciphertext-state cipher, or a different geometric relationship, but none is motivated merely by this failure. The signed BASE29 and 2014 table algebra remain fixed source facts; no original LP2 plaintext or key has been recovered.

**Reproduction:** [one-file Node22 CommonJS source-original SFT](../sims/lp2_terminal256_gf841_source_erasure_sft.cjs) reads the canonical unchanged [LP2 GP29 rune corpus](../resources/liber-primus/lp2-corpus.json) and [original numerical table bytes](../resources/liber-primus/lp2-grid-256.json), SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. It recomputes all 1,024 original configurations and the full 76-rune native-GP positive recovery without external packages. **[Original-data Windows Node22 run 43687510870](https://github.com/FlareZ123/liber-primus/actions/runs/43687510870) passed**, and its job output shows all 512 layouts per register, maximum nine source-subfield predictions, and 76/76 planted erasure restoration.
