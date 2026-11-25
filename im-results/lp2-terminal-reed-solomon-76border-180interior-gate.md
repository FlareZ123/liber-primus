# LP2 terminal 76/180 geometry: full-width and affine-normalized Reed–Solomon codeword gates

**Agent 45, 12 November 2026. Classification: new GF(257) source-input exclusion; two GF(256) interpolations are independent implementation controls of a pre-existing stronger exclusion. No plaintext or original cipher/key recovered.** The 25 November extension below also excludes every reversible additive row/column affine normalization in the same three fields under either radix.

## Why this particular error-correcting structure is worth testing

The original printed LP2 table on physical pp49–51 is **32×8 = 256** two-character cells, conventionally decoded as byte values. Its one-cell border has **76** entries and its interior **180** entries. Independently, the final pages contain **76 unsolved p55 runes**, followed by **85 solved p56 runes** and **95 solved p57 runes**. In the established p57 plaintext, the injunction to *shed our own circumferences* and find the divinity *within* is a visible reason to consider this exact perimeter/interior geometry.

A length-256, dimension-180 **extended Reed–Solomon evaluation code** is a concrete older-than-2014 mechanism with exactly **76 parity constraints**. The publisher's literal bytes may either represent such a systematic word or merely be unrelated high-entropy data. An exact source-selected field and evaluation order are not given, so this experiment fixes the **three standard arithmetical choices only**: prime field GF(257) (the least prime greater than a byte), GF(256) with the usual Reed–Solomon polynomial 0x11D, and GF(256) in the AES polynomial basis 0x11B. Distinct GF(256) irreducible bases do not create distinct abstract finite fields; these are two literal byte-identification conventions.

## Decisive original-byte interpolation

Preserve all 256 source bytes, printed row-major, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Assign each cell the **zero-based original row-major coordinate** `x=8r+c` with no permutation. The 180 interior coordinates `r=1…30,c=1…6` and their original byte values determine **one and only one polynomial of degree at most 179** over any of these fields, by Lagrange interpolation. Predict all 76 border cells from that same polynomial without fitting any hidden key, starting phase, word form, or text score.

| Frozen arithmetic convention | Original 180 interiors fitted by definition | Predicted original 76 perimeter cells matched | Independently planted degree-179 polynomial recovered |
| --- | ---: | ---: | ---: |
| GF(257) | 180/180 | **0/76** | 76/76 |
| GF(256), irreducible 0x11D | 180/180 | **0/76** | 76/76 |
| GF(256), irreducible 0x11B | 180/180 | **0/76** | 76/76 |

The planted polynomial's 180 coefficients are generated from the already solved p57 GP29 runes, repeated only inside the independent control. Every one of its 76 hidden border symbols is recovered exactly using the same interpolation routine. A separately implemented Python interpolation of the authentic 256 bytes independently gave the same original **0/76** results under all three field conventions.

The original table is therefore **not itself** a full-width extended Reed–Solomon RS(256,180) evaluation codeword under any of these three fixed source-order byte readings. **The two GF(256) negatives are already implied by a stronger pre-existing theorem** in [the terminal grid report](terminal-grid-circumference-knownplain-gate.md): XOR of all 256 original base60 bytes is 148 rather than zero, whereas the XOR across a full GF(256) evaluation polynomial of degree under 180 must vanish, in *any* ordering of all 256 field positions. The present same-position interpolations merely reproduce those bounded failures. **The incremental test here is GF(257),** whose arithmetic and 256 coordinate points are distinct from that characteristic-two theorem. This is an exact exclusion: a single mismatch is already inconsistent with the model. It does not make a significant probability claim about the observation of zero correct predictions, which is commonplace for unrelated random data.

## Decision and boundary

Retire the **additional GF(257)** *literal printed-table-as-extended-RS-codeword* model; the existing stronger GF(256) exclusion stands. Do **not** infer the 180 solved p56+p57 symbols were actually used as an encoder input: that would require a separately specified GP29-to-byte representation and a reason that the table and terminal pages share one code. The test does not address interleaved codeword positions, keyed evaluations, another field presentation, disguised parity bytes or a cipher before coding; none is supplied by the p57 phrase or original graphics.

The GF(257) extension is distinct from the already completed **GF29 polynomial-divisor erasure family** in [the terminal parity report](p50-terminal-parity-dimension-gate.md), which exhausts the 48 divisors of the *source table polynomial* but does not claim that the 256 original byte values lie on a generic degree-179 evaluation polynomial over a byte-size field.

**Reproducer:** [single-run CommonJS original-source RS inverse and native polynomial controls](../sims/lp2_terminal_76border_rs256_180interior_sft.cjs). Requires Node.js 22 and the pinned original repository JSON files. The source was unchanged.

## Executed regression

Both original-source SFTs executed successfully under Node.js 22 in [manual GitHub Actions run 43160568313](https://github.com/FlareZ123/liber-primus/actions/runs/43160568313), including frozen source checksum, complete planted-controls and the exact reported negative results.


## Affine-normalized whole-grid extension (Agent20, 25 November 2026)

**Decision:** the original table also fails every reversible normalization in the following larger, precisely bounded family, under either radix 59 or 60, in GF(256) (0x11b or 0x11d) and GF(257). This is an exploratory extension of the existing 76/180 geometry, not an independently selected author operation. Do not promote it to an authenticated cipher.

For fixed physical coordinate x=8r+c, allow arbitrary shared row/column weights and offsets:

`z[x]=(a[r]+e[c])*y[x]+b[r]+d[c]`.

Demand a nonzero effective multiplier at every cell, so that the normalization is reversible before any decoding. Setting either multiplier vector to zero includes the row-only or column-only affine cases; global scaling and shift are special cases. Require z to be evaluations of a degree-at-most-179 polynomial, the same 256-symbol / 180-data-symbol family considered above. The original 10|13|9 row breaks and printed row-major order are retained. There is no fitted traversal or guessed plaintext.

Let H be the 76 parity-check rows, H[j,x]=x^j for j=0..75 in GF(256). In GF(257), evaluation points omit -1, so the product polynomial is (X^257-X)/(X+1). Its derivative at each retained x is -1/(x+1). The dual weights are therefore -(x+1); a common sign can be dropped. Thus H[j,x]=(x+1)x^j. In each field H has rank76 and annihilates exactly the dimension180 evaluation code (by the generalized RS dual identity). The constraints H z=0 are linear in all 80 unknown parameters. Let B be the 76×40 matrix for row/column offsets, and A the 76×40 matrix for row/column slopes, formed by summing H[j,x] and H[j,x]*y[x] over each row or column. The dimension of slope vectors that can be extended by some offsets is 40-rank([B A])+rank(B), by quotienting the offset image. The row-only and column-only versions use the corresponding subsets of A.

| Field | Radix | rank(B) | row slope dimension | column slope dimension | joint slope dimension |
|---|---:|---:|---:|---:|---:|
| GF256/0x11b | 59 | 10 | 0 | 0 | 1 |
| GF256/0x11b | 60 | 10 | 0 | 0 | 1 |
| GF256/0x11d | 59 | 10 | 0 | 0 | 1 |
| GF256/0x11d | 60 | 10 | 0 | 0 | 1 |
| GF257 | 59 | 37 | 0 | 0 | 1 |
| GF257 | 60 | 37 | 0 | 0 | 1 |

The unavoidable one-dimensional joint gauge a[r]=t, e[c]=-t already has zero effective multiplier at all 256 positions. Consequently the entire projected slope space in every original case is exactly that gauge. Even allowing some cells to be singular cannot salvage a single nonzero multiplier. The remaining solutions consist of offsets only and convey none of the original cell values. This is an all-secret-parameter algebraic obstruction, not a language-score negative or random-data p-value.

**Controls:** nine independently constructed degree179 polynomial/affine-mask cases (row-only, column-only, combined for each field; seeded 3301+field parameter). Every unmasked 256-symbol plant has zero parity and every masked symbol restores exactly under its planted weights. The projected slope dimensions for row / column / joint are respectively (1,0,2), (0,1,2), (0,0,2), in all three fields; the joint dimension includes one gauge and one actual effective slope degree of freedom. Plants sample field symbols, including possible 256 in GF257, rather than conditioning on physical 8-distinct byte rows; these are implementation/identifiability controls, not matched nulls. The proof does not need a probability model.

**Reproduction:** [Python SFT](../sims/lp2_grid_affine_normalized_rs_sft.py). Core executed locally on the 256 exact retrieved tokens (base60 SHA256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290; base59 511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79); the repository wrapper reads the canonical JSON, no separate CI run. Retire this exact larger receiver. Multiplicative row-by-column products, arbitrary cell weights, different evaluation points, and non-polynomial mechanisms are outside the theorem, but no independent source selector currently warrants expanding into them. No new plaintext or key.
