# p50 2-D product Reed–Solomon test and source-selector decision

**Agent20, 26 November 2026; Director issue [#2909](https://github.com/FlareZ123/liber-primus/issues/2909).** Classification: new exact negative for the natural 30×6-data / 76-border tensor-product code. No LP2 plaintext, key, or intended receiver recovered. The issue is closed because the source does not select a complete p50 representation/consumer.

## Decision

The p50 geometry admits a particularly simple reversible 180→76 construction that is distinct from the previously tested univariate RS(256,180) code: a **two-dimensional Reed–Solomon product code**. Treat the 30×6 interior as systematic data, with two parity columns on each of 30 interior rows and two parity rows across all eight columns. This is the tensor product of RS(8,6) and RS(32,30), equivalently a bivariate polynomial of degree below 6 in the column coordinate and below 30 in the row coordinate.

This is a motivated structural candidate because the printed object is 32×8 and the p57 wording suggests inspecting the interior after removing the circumference. It is **not** an authenticated Cicada operation: no source specifies Reed–Solomon coding, two parity symbols per axis, the field, or the relationship between table symbols and GP29 plaintext.

The exact original test rejects the literal systematic product-code reading under both extant numeral interpretations and all three natural byte fields:

| Printed-token interpretation | Field | Exact border matches |
|---|---|---:|
| Base60 | GF(256), polynomial 0x11b | 0/76 |
| Base60 | GF(256), polynomial 0x11d | 0/76 |
| Base60 | GF(257) | 0/76 |
| Drop-f base59 | GF(256), polynomial 0x11b | 0/76 |
| Drop-f base59 | GF(256), polynomial 0x11d | 0/76 |
| Drop-f base59 | GF(257) | 0/76 |

All six cases have 0/60 matches on the left/right side cells and 0/16 on the top/bottom rows. The same interpolation recovers 76/76 on a deterministic planted bivariate-polynomial control in each field. Row-first and column-first interpolation produce identical border predictions, as required by the tensor-product construction.

## Exact model and reproduction

The canonical original token resource is resources/liber-primus/lp2-grid-256.json, whose 256 base60 values reproduce the printed 32×8 grid. The alternative drop-f base59 map is independently retained; all 256 printed tokens are valid under both.

Use zero-based coordinates x=0..7, y=0..31. The data rectangle is x=1..6, y=1..30. For each of the 30 interior rows, interpolate the unique degree-at-most-5 polynomial through its six interior values and predict the two side cells. Then, for each of the eight columns, interpolate the unique degree-at-most-29 polynomial through its 30 interior-row values and predict the top and bottom cells. The result is exactly 60 side predictions plus 16 top/bottom predictions. Reversing the interpolation order gives the same predictions.

The field alternatives are deliberately limited to the two common byte-field polynomial bases 0x11b and 0x11d, plus GF(257), the smallest prime field larger than a byte. No arbitrary evaluation-point search, permutation, phase, or secret coordinate system is introduced.

**Reproducer:** sims/lp2_p50_2d_product_rs_76border_sft.cjs (Node.js, read-only original source plus deterministic positive controls). The same algorithm was executed against the retrieved canonical JSON in the connected JS runtime; the saved script is the standalone reproduction. No separate GitHub Actions run is claimed.

## Why this does not solve the assigned 180→76 plaintext route

The product-code test asks whether the p50 border is the parity of the p50 interior. It does **not** assert that the 180 interior byte values equal, encode, or otherwise correspond to the 85 solved p56 plus 95 clear p57 GP29 runes. That additional cross-artifact mapping remains unspecified.

Existing exact work already rejects:
- direct missing-prime residue, addition, subtraction, XOR and multiplication consumers on the fixed 180-cell row-major interior;
- stationary byte/token-to-GP29 lookups, including more permissive arbitrary secret codebooks and selected page/column variants;
- literal univariate RS(256,180) interpolation of the full table and the tested affine-normalized row/column extension;
- direct row/column XOR codebooks trained on the 180 known terminal runes.

See im-results/lp2-p50-76-perimeter-180-interior-source-partition.md, im-results/lp2-2013-telnet-180-gap-p50-inner180-source-route.md, im-results/lp2-p50-inner180-fullbyte-codebook-known180-gate.md, im-results/lp2-p50-inner180-allsecret-rowcol-byte-xor-gate.md, and im-results/lp2-terminal-reed-solomon-76border-180interior-gate.md.

## Source-selector audit

The source evidence fixes less than the proposed receiver needs:

1. **Geometry and visible serialization.** Original scans 66–68 show a 32×8 rectangle printed in page order (10+13+9 rows). The image fixes the displayed row/column arrangement and supports reading the printed tokens in their visible order. It does not label the grid as a codeword, identify data/parity axes, or specify a numeric address convention.
2. **Radix/value type.** Conventional base60 has contemporaneous May 2014 participant support, but that conversion is not in a Cicada-signed instruction. The source-only alphabet audit shows that all 256 original tokens lie in the shared canonical support of base60 and drop-f base59; the visible absence of lowercase f does not distinguish their byte values. A later manuscript-internal DH construction conditionally favors base59 for that separate mechanism, not as a global table rule.
3. **2013 protocols.** The signed TCP specification defines commands such as BASE29, RAND and DH, but does not name the p50 table, a matrix traversal, or a p50 byte-to-rune receiver. The 180-prime omission sometimes paired with the interior comes from a participant-era telnet transcript; the separate original CicadaOS prime_echo script emits the full prime list, including those values. The omission is therefore not an authenticated key tape.
4. **2016 instruction.** The signed message's “words are the map / numbers are the direction” wording does not specify p50 serialization, a radix, a cell-index convention, or an invertible table operation. Treating signed-message words as p50 addresses is an interpretation, not a format specification.
5. **p57 instruction.** “Shed our own circumferences” / “find divinity within” is a credible reason for a solver to inspect an interior and its boundary. It does not name p50 or prescribe a byte field, polynomial code, rune embedding, or relation to p55.

The relevant prior source audits are im-results/lp2-p50-zero-based-row-major-cicada-convention-audit.md and im-results/lp2-p50-digit-alphabet-authentication-gate.md. They distinguish physical print order and participant practice from a first-party decoding instruction.

## Completion decision for #2909

**Negative, per the issue's stated fork.** The p57 phrase and exact 76/180 geometry motivate a finite family of tests, but no first-party or independently source-grounded rule jointly selects the cell representation, radix, address/order semantics, and reversible consumer. The natural 2-D product-code candidate fails 0/76 under all six frozen radix/field combinations, with positive controls passing. Existing known-plaintext gates also reject the direct stationary receivers. Do not keep the 76/180 length alignment alive as a standalone argument or launch another arbitrary per-cell transform search.

Reopen only if an original instruction, authenticated contemporaneous implementation, or independently selected source object specifies the missing receiver and predicts a new p55 output before scoring. No unknown LP2 plaintext or authentic key is recovered by this work.
