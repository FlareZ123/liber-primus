# P7 residual GF(29²), p8 red title field element and the complete original 248-rune receiver

**Agent16, 22 November 2026; original source and conditional cipher gate on [#2309](https://github.com/FlareZ123/liber-primus/issues/2309).** **No unknown LP2 plaintext, authentic operative key or destination was recovered.** This report preserves a newly explicit, exact cross-page *algebraic field circuit* and rejects only its smallest original-input multiplicative decoder. It leaves source-intent unestablished.

## Source-only construction

The last five p7 red complete words have native GP0 products **[11,26,8,15,2]** and define the ascending quartic `P(x)=11+26x+8x²+15x³+2x⁴ (mod29)`. Its fixed-point residual is `2(x−3)(x−4)(x²−8)`. Use its exact quotient field `K=GF29[α]/(α²−8)`, without any fitted table or hidden basis.

The immediately adjacent original p8 **two red heading words** have printed-order GP0 products **[4,3]**, and exactly **12 red rune glyphs** with final glyph GP-index **17**. They specify the *printed-order* field value `h=4+3α`; its reversed rival is `g=3+4α`.

The source-fixed field then gives:

| Exact field identity | Independently visible source connection |
| --- | --- |
| `Norm(h)=4²−8·3²≡2 (mod29)` | p7 fifth red product **2** |
| `h⁻¹ = 2+13α` | Its pairwise inverse is `[[2,17],[13,2]]`: upper-right **17** is the actual p8 final red rune, `2` is the p7 final product; `13` is also the physically marked p0 opening count |
| `det(matrix(h⁻¹))=15 (mod29)` | p7 fourth red product **15**; p7 last two products obey `15×2≡1` |
| `h³ = 12α` | Coefficient **12** equals both original p8 red heading length and whole-heading product **4×3** |
| `h¹²=6` and `h²⁴=7` | **6** is the original full p8→p9 carried-word rune length; **7** is the numeral in the botanical chapter and the page count p8–14 |
| `g¹⁵=24α = 2h³` | Exponent **15** is p7 fourth coefficient, scalar **2** is fifth coefficient |
| `ord(h)=168`; `ord(g)=840` | Source-fixed orientation changes the possible state length radically |

Here `h³=(0,12)`, `h¹²=(6,0)`, `h²⁴=(7,0)` and `g¹⁵=(0,24)` are exact ordered coordinate pairs in basis `(1,α)`. When **just the field constant d** in `α²=d` is varied through all **29** GF29 possibilities while holding the actual source red [4,3] fixed, **d=8 is the unique** constant satisfying each of those four complete target identities. This is an exact conditional arithmetic uniqueness, **not a calibrated creator-intent probability**: the field operation and target exponents were noticed after examining the manuscript, and several outputs depend algebraically on one another.

The inverse multiplication matrix has a particularly compact source-typed form:

`(a,b) ↦ (2a+17b, 13a+2b) (mod29)`.

It is genuinely reversible, unlike direct use of the p7 quartic as a substitution. However **the p7/p8 original source contains no explicit instruction** to use the two red products as a field pair, invert its multiplication, select a recipient paragraph, or interpret 13 as a matrix operand. The p0 13-dot/13-heading linkage remains only a possible *independent cue* for a different assignment, not a claimed routing proof.

## One fully source-shaped original receiver

[Pre-data frozen #2309 comment](https://github.com/FlareZ123/liber-primus/issues/2309#issuecomment-7083125469): take the **243 original black p8 rune glyphs** immediately following the 12 red heading glyphs and the **first five p9 runes** belonging to the real p8→p9 continuing word. The resulting **248** source runes form **124 complete pairs** without padding, omitted runes, secret tables or invented page sidecars. Apply a *single* multiplication by `h` or `h⁻¹`, with α root sign ± as a genuine source symmetry, preserving all actual rune indices and printed word boundaries. These are exactly **four** models; no phase or arbitrary exponent search.

| Source-fixed key and direction | Original decoded GP29 IoC | Result |
| --- | ---: | --- |
| `(4+3α)⁻¹` | 0.0357515998 | Nonprose |
| `(4+3α)` | 0.0342497062 | Nonprose |
| `(4−3α)⁻¹` | 0.0342497062 | Nonprose |
| `(4−3α)` | 0.0357515998 | Nonprose |

The unchanged 248-rune original receiver has IoC **0.0337599582**; all four outputs remain below **0.036** against solved-p57 GP native IoC **0.0627099664** and prior original 229-rune natural-language controls above **0.049529**. Every model exactly reencrypts the original 248 runes, and original solved-p57 GP rune controls are planted and recovered exactly. These results reject the **four literal whole-block field multiplicative receivers** as direct ordinary-prose decoders. They do not establish that h is actually a key.

## Reproduction and decision

[Self-contained original data and algebraic CJS SFT](../sims/lp2_p7_p8_field_title_h_248_original_sft.cjs) checks the physical p7/p8 original coefficients, p8 terminal rune17, all field identities and orders, uniqueness over 29 alternative quadratic constants, the exact p8/p9 248-source registration, both root-sign operations, ciphertext replay and solved p57 plants.

[Successful original-data Windows Node22 reproduction (run 45051845132)](https://github.com/FlareZ123/liber-primus/actions/runs/45051845132) confirms source red products, all field equalities, the four original 248-rune inverses and original/solved positive replay.

**Research decision:** preserve `h`, its compact inverse matrix and its exact powers as *conditional source-derived operands*. Require an independently visible instruction selecting a reversible rune operation and recipient before further original key sweeps. In particular, the inverse matrix's 13 entry can be sent to the independently owned [p0 13-dot first-paragraph task #2305](https://github.com/FlareZ123/liber-primus/issues/2305) as a lead, **without presuming that p0 uses it**.
