# LP2 sliding-window copy code: exact two-/four-rune flag grammar gate (#3030)

**Decision (Agent21, 26 November 2026):** the frozen LZSS-style GP29 transport is impossible on every complete original illustrated chapter and p0–55, even under arbitrary independent phase permutations with period 8 or 13. The literal-F hold version of the specified 0/1-flag transport is impossible at any key period. No original plaintext or key; no authenticated compression selector.

## Source and frozen exploratory grammar

[Ziv and Lempel (1977), section II](https://www.icst.pku.edu.cn/mipl/docs/ziv1977.pdf) use fixed-radix pointer, copied length and trailing literal, with an initial zero-filled buffer. All nine original LP2 chapter lengths have gcd 1, ruling out a common fixed codeword width >1 at exact chapter resets without framing. The empty-history distance gate below does not apply to the paper's seeded history.

[Storer and Szymanski (1982)](https://doi.org/10.1145/322344.322346), [Okumura's 1989 source](https://www.raids.org/files/faq/lz-comp.htm) and the [ALDC specification](https://www.qic.org/html/standards/15x.x/qic154a.pdf) motivate literal/copy flag grammar; the historical implementations use binary framing (Okumura additionally prefills its ring). [RFC4880 §5.6](https://www.rfc-editor.org/rfc/rfc4880.html) documents actual OpenPGP compression algorithms, including raw DEFLATE, ZLIB and BZip2. The [signed 2013 BASE29 command](../resources/external/2013-tcp-server-signed-source.md) selects positional integer conversion, not fixed-width length/distance fields. The [2013/2014 book codes](cicada-organizer-bookcode-consumption-convention-gate.md) read pre-existing books, not mutable decoded history. None of these consulted first-party records binds the flags, field widths, initialization or termination of an LP2 sliding-window decoder. #2583/#2727/#2884 are distinct dictionary-growth gates.

Frozen in [issue #3030](https://github.com/FlareZ123/liber-primus/issues/3030#issuecomment-7198523508) before obtaining original rune values for the experiment:

- Literal: [0,x], two GP29 digits.
- Copy: [1,hi,lo,l], four digits, distance=1+29*hi+lo (1..841), length=3+l (3..31).
- Empty history; sequential overlapping copies; greedy longest match with nearest-distance tie; use copy at length >=3. Exact record-boundary EOF, no padding, printed-word assumption or fitted offsets.

The BASE29 serialization and parameters are explicitly exploratory, not Cicada's authenticated format. Decoder rejects unknown flags, incomplete records, illegal distances, and noncanonical forward replay. The overlap example [2,3,2,3,2,3,2,3,2] encodes to [0,2,0,3,1,0,1,4]: final copy distance 2, length 7. Four malformed cases reject.

## Exact constraints

For ordinary periodic additive encryption, a flag position fixes the candidate phase shift from its observed symbol and chosen literal/copy type. DFS branches only when assigning an unknown phase shift, follows forced legal flags, and accepts only exact record-boundary EOF. Payloads remain unconstrained.

A stronger relaxation assigns two distinct observed ciphertext symbols per phase, one literal and one copy. A known symbol forces the width; a new symbol can occupy an unused slot. Exhausting these assignments covers **any independent bijection at each phase**, any distinct pair of flag values, additive/affine keys and outer stationary alphabet permutations under an ordinary consuming clock. All payload images are left unconstrained. Failure is exact, even without distance or greedy constraints.

| Original interval | Runes | Additive q8/q13 furthest boundary | Arbitrary phase permutations q8/q13 furthest boundary |
|---|---:|---:|---:|
| p0–2 |729|odd|odd|
| p3–7 |1145|odd|odd|
| p8–14 |1729|odd|odd|
| p15–22 |1903|odd|odd|
| p23–26 |1021|odd|odd|
| p27–32 |1433|odd|odd|
| p33–39 |1680|10/28|24/78|
| p40–53 |3008|10/50|26/80|
| p54–55 |308|10/28|30/78|
| p0–55 |12956|18/28|30/78|

All rows have zero complete histories in both searches. Furthest boundary means greatest explored record-start offset, not recovered plaintext. Odd-length failure is key-independent.

**Transparent-F after serialization:** first literal flag 0 must be visible F, since empty history forbids a copy. Three of the four even frames fail immediately. The remaining p40–53 begins [0,9,19,26,6,23]. After the first literal only one output symbol exists. Offset 2 is nonzero, forcing a copy flag. Its distance must be 1; both distance digits must therefore be zero and survive as visible F. Offsets 3 and 4 are instead 26 and 6. This exact contradiction covers all key periods for the frozen flag representation, not arbitrary flags with holds.

## Controls and limitations

36 native/normalized prose windows (authentic clear p57, LP1 editor-normalized transliterations, Gibran GP-normalized prose; overlapping length strata), 72 independently seeded period-8/13 encrypted transports. All true keys decode, canonical re-encode and forward-encrypt exactly. Both blind flag-only gates retain the plants; for q13 the exact full key survives 36/36, with 24/36 having just one full candidate. For q8 the odd phases are not observed by any flag, so no full blind key recovery is claimed. All 72 held-prefix positive controls pass. Zero of 144 seeded uniform random streams matched to plant lengths pass either ordinary flag gate. Transported/native length ratio 1.159–2.000, so the tested adaptation expands native prose.

Retire this exact record geometry. Other bit-packed compression formats, different record widths/framing, initial histories selected by authentic evidence, cipher-before-compression, and nonperiodic clocks remain outside scope. Do not start another arbitrary packing menu without a source-selected operand.

## Reproduction

[CommonJS SFT](../sims/lp2_lzss_base29_flag_gate_sft.cjs) · [actual JSON](lp2-lzss-base29-flag-gate.json). Source blobs corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, LP1 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d. Seed 3030. Executed actual experiment function on repository sources in connected JS runtime; standalone Node wrapper not separately run in CI. Historical paper screenshot retrieval failed; text extraction was available.
