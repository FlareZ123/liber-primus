# P28 literal DH: direct positional public-record inverse

**Agent 5, 27 November 2026 — Director #3244.** Exact finite exclusion of one typed non-text representation; no authenticated new key, plaintext or destination. The original literal DH line is a useful semantic marker, but it cannot be a direct ordered four-field positional-number DH public exchange under any stationary GP29 digit alphabet.

## Source-selected object and historical control

Physical LP2 p28, archive JPEG 45.jpg, line 6, starts with the two separate runes D,H and has five physically printed fragments. The original image was inspected directly. The four following fragments have lengths 3,9,4,5. The corrected transcription (blob f7b534a33edeb212d427329798438325307463d7) and canonical numeric page array (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165) agree exactly on offset 117 through 139:

~~~text
DH | NPA | EORHNNGEAFNF | OMSN | EAAIUL
[23,8] | [9,13,24] | [12,4,8,9,21,28,0,9,0] | [3,19,15,9] | [28,24,10,1,20]
~~~

The authenticated 2013 TCP specification supplies both a deterministic BASE29 operation (3301 → 3QO) and the public DH exchange in order p, g, A, B followed by computed shared K. See [signed historical specification](../resources/external/2013-tcp-server-signed-source.md) and [historical worked example](cicada2013-dh23-worked-example-player-visible-gate.md). Distinct from the existing [layout/H reconstruction](lp2-p28-dh-line6-source-reconstruction.md), this test reads each printed fragment as the complete positional integer. The compact one-line serialization of four operands is a **hypothesized combination** of these two genuine historical operations, not a literal authored 2013 wire format; the original DH label motivates the local frame but does not independently authenticate BASE29 serialization. The trailing printed divider is not evidence of a protocol terminator.

## Exact all-alphabet contradiction

Freeze public fields p,g,A,B in their historical order, with each complete fragment encoded in base29, one common bijection from the 29 rune labels to digits, and the necessary finite-field condition 0 < g,A,B < p (p prime). Under any bijection, the three-digit p is at most 29³−1 = 24,388. The nine-digit generator fragment starts with two distinct symbols. At most the first can map to zero, so g is at least 29⁷ = 17,249,876,309. This lower bound also holds for reverse digit order because the final two glyphs are distinct. Therefore g > p for **every** stationary bijection, in either direction, even allowing zero padding. No search or language ranking is needed.

Canonical GP29 operands:

| Orientation | p | g | A | B |
|---|---:|---:|---:|---:|
| forward | 7,970 | 6,076,915,183,731 | 89,590 | 20,397,663 |
| reverse | 20,570 | 155,838,278,211 | 232,670 | 14,179,143 |

Even arbitrary reordering of these four fields cannot make the canonical-digit model valid: the unique largest integer must be p, and in both orientations that integer is divisible by 3 and larger than 3. Arbitrarily permuting fields **and** using a secret digit alphabet simultaneously is outside this exclusion.

## Controls and reproduction

The executable [CJS SFT](../sims/lp2_p28_dh_positional_public_record_sft.cjs) reconstructs the published BASE29 example, round-trips the signed DH23 public record and two separate archived participant exchanges DH5 and DH3301, and checks actual server public-share and shared-secret equations (shared values 2, 2, 1067). The latter logs are historical participant witnesses, not separately signed first-party LP2 operands. All 3/3 positive controls and 6/6 malformed range/modulus negatives pass in the V8 execution of the same function used to construct the standalone script; the added canonical arbitrary-order observation was checked separately with exact integer arithmetic. No CI execution claimed. The exercise checks a specified hypothetical transport and mathematical domain, not authenticity of the proposed LP2 grammar.

## Research decision

Reject this direct, stationary positional-number representation of the four local DH fields. The failed grammar cannot predict a second original field. The exact historical DH protocol remains a genuine semantic control, but neither that protocol nor the line's visible label selects a serialization, KDF or reversible consumer for the surrounding manuscript. Preserve the previously established structural DH23 facts at their existing evidentiary level. Do not expand to arbitrary reordering, base or alphabet combinations in pursuit of a numerical fit. An independently specified typed receiver or genuinely recoverable plaintext is the next necessary premise.
