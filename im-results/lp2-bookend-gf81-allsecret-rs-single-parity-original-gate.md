# LP2 original GF(81) bookend: every global-alphabet one-parity Reed–Solomon decoder fails

**Agent32, 22 November 2026. Exact original-source algebraic exclusion; no new plaintext.**

## Hypothesis with a concrete human operation

The established p7 red-word reduction determines the field \`GF(3)[x]/(x⁴+x²+x+1)\` of **81** elements. The adjacent p8 source-red operands specify \`g=x+1\`, a primitive field element of order **80**. A prior exact source split gives the first **6,561** LP2 rune symbols as an **81×81** square A, while the following **6,395** symbols plus the five genuine numbered paragraph-label holes form an **80×80** square B. The five holes occupy exactly

\`(28,4), (29,64), (30,76), (32,15), (33,32)\`,

so no two are in the same row or column. A field of size81 supports canonical **Reed–Solomon polynomial evaluation codes of length81** over all field elements and **length80** over the 80 nonzero elements. A one-parity-symbol-per-row or column code would, in principle, repair each of these five individual erasures. That is a source-motivated reversible interpretation different from the already excluded direct field pads, stationary pair-mixers and ECC200 image bitplanes.

The **weak premise** is the absence of an instruction identifying rune symbols with elements of GF81 or treating these grids as RS codewords. The direct proposed mechanism is still worth a finite test because ordinary cyclic RS code structure itself supplies a rigid, globally checkable equation, even if the 29→81 embedding were a completely private alphabet.

## Exact original-cipher all-secret proof: first square A

For a canonical full-field **RS(81,80)** word of length81, \`y_j=f(x_j)\` at all 81 field points with \`deg f≤79\`. Since sums of \`x^d\` over GF81 vanish for every \`d=0…79\`, its mandatory parity check is

\`Σ_{j=0}^{80} y_j = 0\` in GF81.

Let \`φ_0,…,φ_28\` be an **entirely arbitrary** global mapping of the 29 actual GP glyphs to GF81 values. No injectivity or formula is assumed, so this grants all \`81^29\` possible secret symbol assignments. Each original A row yields a homogeneous linear equation in these unknowns, with coefficient for glyph i equal to its occurrence count modulo3. In characteristic3, a constant map \`φ_i=c\` always passes because each complete line has81 cells.

On the **81 original unmodified rows**, the complete **81×29** coefficient matrix has **exact GF3/GF81 rank28**. The **81 original columns separately also have rank28**. Thus the only possible assignments for either orientation are \`φ_0=φ_1=…=φ_28\`: all rune identities collapse to one constant field value. This cannot encode an 81-valued RS codeword from the distinct GP glyphs. The native index embedding \`φ_i=i\`, included only as a diagnostic, has nonzero row syndromes in **80/81** rows and nonzero column syndromes in **77/81** columns. The rank conclusion covers **every single fixed global rune palette**, and requires no choice of field-element coordinate order.

## Exact original-cipher all-secret proof: second square B

For a cyclic **RS(80,79)** word over the 80 nonzero field elements, choose the genuine p8-selected generator \`g=x+1\` and evaluation positions \`x_c=g^c\` for columns c0…79. Every polynomial of degree at most78 satisfies the necessary one-parity equation

\`Σ_{c=0}^{79} g^c y_c = 0\` in GF81,

because for polynomial monomial degree d0…78, the corresponding geometric-power sum is \`Σ_c g^{c(d+1)}=0\`. Every ordinary cyclic RS(80,k) with **k≤79** is a subcode and must satisfy this same equation.

Original B has **75 rows without a numeral hole** and **75 columns without a hole**, so there are 75 independent available candidate equations of each orientation. For each secret rune value \`φ_i\`, the coefficient in a fixed original row is the GF81 sum of \`g^c\` across all positions containing original rune i. The resulting **75×29 coefficient matrix has exact rank28**. Its complete nullspace consists only of **constant** rune palettes. This independently rules out any nonconstant global symbol embedding.

The four source-natural presentations (forward/reverse g exponents, rows/columns) have the following exact original-input results:

| Axis | Exponent | Original complete lines | Exact equation rank | Nonzero parity checks under \`φ(i)=i\` |
| --- | --- | ---: | ---: | ---: |
| Rows | +1 | 75 | **28** | 75 |
| Rows | −1 | 75 | **28** | 75 |
| Columns | +1 | 75 | **28** | 75 |
| Columns | −1 | 75 | **28** | 74 |

This already covers all eight square reflections/rotations up to equivalent row/column order. To avoid mistaking a generator-orientation convention for failure, the SFT additionally checks **all 32 primitive generators** \`g^a\` with \`gcd(a,80)=1\`, each for both row and column lines: **all 64 source-original matrices have rank28**, with no nonconstant secret alphabet. Any fixed exponent-phase shift multiplies the complete parity equation by a nonzero field constant and does not change rank. Thus arbitrary generator phase cannot evade the certificate.

The complete positive control constructs **80 genuine RS(80,79) rows using all 29 actual GP rune indices under the injective embedding \`φ(i)=i\`**. Each is a true GF81 codeword, the same five physical-number slots are erased, every intact row satisfies the parity equation, and the constrained original-style 75×29 matrix has rank **27**, admitting the nonconstant intended embedding. This confirms that rank28 is a discriminating original-input exclusion rather than a universal property of 80-rune rows.

## Cryptanalytic decision

**Retire direct, row- or column-wise full-field/cyclic Reed–Solomon codewords under any single global GP29→GF81 rune alphabet**, including an unspecified secret injective embedding. The 81×81 original register and 80×80 original register independently fail even **one standard RS parity symbol per line**, before testing higher redundancy or any plaintext decoder. A claimed success from this architecture must supply a **specific changing per-position alphabet, a creator-selected generalized-RS column multiplier, a prior transformation or a nonstandard code**. The printed five numerals alone do not specify those extra operations.

This finite exclusion does not affect cryptanalysis using the p7-derived field as a nonlinear internal state, a field address schedule, a varying codebook, a key in the original 2014 source, or a differently serialized input register. The polynomial field relationship remains an authentic arithmetic identity conditional on its reading; **no unknown LP2 plaintext, authentic key or final destination has been recovered**.

## Original-input reproducibility

Run [the single-file Windows-compatible Node22 CommonJS SFT](../sims/lp2_bookend_gf81_allalphabet_rs_parity_sft.cjs) against the unchanged [canonical LP2 rune tape](../resources/liber-primus/lp2-corpus.json). It reconstructs the original 81²/80² split and five authentic holes, implements arithmetic in the source-derived GF81 quartic, computes both original full-field and cyclic field parity matrices, performs exact Gaussian elimination, exhausts primitive generators, and supplies a genuine nonconstant-palette original-shape RS positive control. The only original-secret space eliminated is the clearly specified globally fixed 29→81 alphabet; this is an exact linear-algebra result rather than a language-model score or extrapolated p-value.

The corrected SFT passes on Windows Node.js 22, including the independent native control: [run45065102892](https://github.com/FlareZ123/liber-primus/actions/runs/45065102892).
