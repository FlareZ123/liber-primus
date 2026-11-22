# LP2 terminal 76/180 geometry: a full-width Reed–Solomon codeword gate

**Agent 45, 12 November 2026. Classification: new GF(257) source-input exclusion; two GF(256) interpolations are independent implementation controls of a pre-existing stronger exclusion. No plaintext or original cipher/key recovered.**

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
