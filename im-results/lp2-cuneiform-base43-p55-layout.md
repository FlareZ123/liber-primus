# Cuneiform 1033/3301 and the p55 base-43 layout

**Status:** provisional source-structure observation; no plaintext, key, or cipher recovered. This is an intermediate finding, not an established result.

## Exact source-derived alignment

The p33 cuneiform header has the established sexagesimal readings **1033** and **3301**, from digits `17,13` and `55,1` respectively. The existing cuneiform audit records these values and the four-digit sum 86: [cuneiform bridge](lp2-cuneiform-digit-sum-repeat86-bridge.md).

The original p55 geometry supplies the following independently derived counts:

- 76 GP29 runes on p55.
- Four printed line lengths: **24, 22, 22, 8**.
- 17 printed groups: the first group is the one-rune carry `l` continuing p54's final group `63g2eis46q`; the other 16 are complete groups.
- Removing the first and last rune from each complete group leaves **43 interior** runes. The corresponding circumference is **33 exterior** runes: one carry rune plus two edge runes for each of 16 complete groups.

The page grouping and glyph-coordinate data are in `resources/liber-primus/lp2-page-groups-54-55-derived.json` and `resources/liber-primus/lp2-p55-source-glyph-coordinates.json`; the exact 43/33 partition is also documented in [the p55 source-framing report](p55-original-33-exterior-43-interior-source-framing.md).

Now both cuneiform values have exact Euclidean decompositions using the p55 interior count:

```
1033 = 43 × 24 + 1
3301 = 43 × 76 + 33
```

The quotient/remainder pairs match p55 geometry:

- `(24, 1)`: first-line length 24 and the one-rune cross-page carry.
- `(76, 33)`: full-page length 76 and exterior count 33.

The second identity `3301 = 43×76+33` was already noted in the p55 framing work. The additional observation is that **1033 = 43×24+1** uses the first-line length and the incoming carry, so the two cuneiform values encode two levels of the same p55 layout.

## Human solve-path hypothesis

A solver who has already read p57's “shed our own circumferences” could separate the p55 page into its 43-symbol interior and 33-symbol exterior. The cuneiform numbers then recover the first-line and whole-page dimensions when divided by 43. This makes p55 a plausible intended receiver or locator for the p33 cuneiform header.

The pairs can also be read as two affine position maps:

```
f24(i) = (43i + 1) mod 24
f76(i) = (43i + 33) mod 76
```

Both are bijections because gcd(43,24)=gcd(43,76)=1. This is a motivated interpretation of the arithmetic, not an instruction established by the source.

## Frozen tests and outcome

The original p55 page was tested without changing its rune transcription:

1. Apply each affine map and its inverse as a position permutation to the first 24 runes and to the full 76-rune page. Neither readout is plaintext. The full-page permutation preserves the raw p55 IoC, as any transposition must.
2. Use `K_i = ((43i+33) mod 76) mod 29` as a position-derived GP29 key stream on p55, with both additive signs and both ordinary consumption and literal-F hold. None produces readable text.
3. Interpret the quotient/remainder pairs as a 2×2 Hill key `[[24,1],[76,33]] mod 29 = [[24,1],[18,4]]`. Direct/inverse matrices and row/column vector conventions all fail to produce plaintext.

Selected exact outputs and IoCs are recorded by the reproducer. For example, the full-page affine readouts begin `NGNGHEOGUOECBPXIAEID...` and `AEEAEDAPOEEONGSIXEUC...`; the Hill inverse-column readout begins `TXEONGCODTMIACHMTHCN...`. Raw p55 IoC is 0.0378947368. These are not linguistic decryptions.

The reproducer asserts the original source counts, both arithmetic identities, invertibility of the two affine maps, and round-trip correctness of every tested permutation/matrix. Run from the repository root:

```sh
node sims/lp2_cuneiform_base43_p55_layout_sft.cjs
```

## Conditional p55 field → p33 ciphertext inverse (Agent14, 26 November)

The alignment has now been tested as a typed operand handoff, distinct from the affine and Hill interpretations above. It combines the already certified [p55 SHED prime and primitive generator](lp2-p55-shed-circumference-prime-shell-original.md) with the authentic 2013 DH grammar. Use the two original cuneiform values **1033 and 3301 as the two private exponents** (not the previously tested p55 factors 8/43 or the p28 exponents 6/15). The cuneiform-bearing section starts at physical p33's second rubric, so freeze the recipient as the 1,460 black-body runes from p33 offset99 through p39 offset119 exclusive, keeping the entire continuous original source order. Use the conventional base29 digits of the shared value, left to right, as a periodic additive key, phase zero, with historical literal plaintext-F bypass.

This interpretation is conditional: neither the original cuneiform nor the layout count actually labels private exponents, the 32-rune shell extraction excludes the p54 carry, and the 43/33 layout alignment includes it. The different conventions must remain explicit. No parameter is inferred from the target ciphertext.

```text
P = 63755441409934721069036418908763882578170591536653256311514221
g = 1268532719737981052966698570711268391040527137
a = 1033
b = 3301
K = g^(a*b) mod P
  = 38430632033483775579048580476887664347323130924179312790405125
GP0 base29 key = [1,13,8,21,25,12,4,4,13,13,26,10,17,2,12,14,23,11,15,8,1,18,2,2,3,13,12,1,7,6,10,9,1,6,11,25,24,23,12,2,8,17,20]
```

**Exact original inverse result:** the historical F-transparent receiver has no complete path. At body offset19 (physical p33 rune offset118, zero-based), the sole live phase is19, its key value8 equals ciphertext H=8, and the consuming inverse would produce F=0. Historical plaintext F can only be emitted as ciphertext F, so this edge is impossible; no earlier ciphertext F introduces a viable alternate history. The ordinary consuming receiver is also nonprose, with IoC 0.03438459444 against raw 0.03432919902, and exact forward replay of all 1,460 runes. This is a fixed-key inverse, not an optimization over phases.

On all 95 authentic clear p57 runes, the same sender retains the exact known native plaintext among three complete F-inverse paths; one candidate is forward-replayed exactly. It is a path-retention calibration, not unique blind recovery. The source-consuming core executed directly in V8; the standalone CommonJS wrapper has not separately been run in repository CI.

Reproducer: [sims/lp2_p33_cuneiform_p55_field_dh_inverse_sft.cjs](../sims/lp2_p33_cuneiform_p55_field_dh_inverse_sft.cjs), committed at a9df63e2378ca58af8052713a8d57a748784a8ad. The exact failure rules out this particular phase-zero additive receiver before any language scoring. It does not reject an unrelated typed cuneiform operation or other field use.

### Rival: the cuneiform numerals are public DH values

If 1033 and 3301 denote public values rather than private exponents, the same field has a tractable subgroup of order M=630311729907820 and a remaining prime-order factor R=101149063843788281988908603592862658065019147521. Exact baby-step/giant-step in each smooth subgroup and CRT give:

| Candidate public value | Log modulo 4 | 5 | 41 | 49477 | 15535963 | Exact log modulo M |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1033 | 2 | 1 | 3 | 42056 | 13771801 | 495201920893266 |
| 3301 | 0 | 4 | 25 | 9300 | 13036955 | 208442035865464 |

Neither least representative is the full log, so neither value can arise from a small historical-style exponent (including 6, 15, 8, 43, 1033, 3301 or any positive exponent below 208442035865464). The common shared secret's R-th power is determined exactly as
`55582936767324806650735115392056447093901202905955408043374090`.
It agrees when computed through either projected public value. It is **not** the shared secret: the R-order component remains undetermined. An independent planted exponent123456789 is exactly recovered and the full group generator order is checked. This extension executed in V8 and is incorporated in the same SFT (commit a2d961ee8bd321c4cf9d82a6893163ccd7c4ff2f). No full DH inverse or original plaintext is claimed.

## Second finite-field interpretation: 1033 and 3301 as two prime fields

**Agent1, 26 November 2026.** This is a separate hypothesis from the already-tested p33–39 RSA four-rune FPE and the large-\(P\) p55 DH receiver above. It treats the two cuneiform integers themselves as prime-field moduli and asks whether the p55 43/33 split selects their cyclic subgroups.

Both cuneiform values are prime. For the p55 page-local partition used by the base43 layout (the one-rune p54→p55 carry is included in the 33-symbol exterior register):

\[
1033-1=1032=24\times43,\qquad
3301-1=3300=100\times33.
\]

Thus \(\mathbb F_{1033}^{\times}\) contains a subgroup of order 43 and \(\mathbb F_{3301}^{\times}\) contains a subgroup of order 33, exactly matching the 43 interior and 33 exterior runes. The cofactor 24 also equals p55's first-line length. The second cofactor 100 has no independently identified p55 counterpart. This is an exact structural correspondence, not evidence by itself that either number is an authored modulus.

The sexagesimal digits \((17,13)\) provide two natural candidate bases:

| Assignment | Base order mod 1033 | Base order mod 3301 | Order-43 generator | Order-33 generator |
|---|---:|---:|---:|---:|
| Reverse pairing: 13 / 17 | 1032 | 3300 | \(13^{24}\bmod1033=829\) | \(17^{100}\bmod3301=1758\) |
| Printed order: 17 / 13 | 516 | 1650 | \(17^{24}\bmod1033=780\) | \(13^{100}\bmod3301=1537\) |

All four subgroup orders were checked exactly. In the reverse pairing, 13 and 17 are primitive roots of their respective fields. In printed order, the bases have half-order but their **field-cofactor powers 24 and 100** still generate the required 43- and 33-element subgroups. The assignment is therefore not uniquely selected by the cuneiform.

### Bounded receivers

1. **Subgroup-power key stream.** For each register, generate the full subgroup cycle \(k_i=g^i\bmod p\), reduce each field element modulo 29 to obtain a GP29 key symbol, and add or subtract it from the corresponding p55 register. Both generator assignments were tested with zero-based, one-based, and page55/carry1 phases; all four independent sign choices were tested. This is 24 fixed readouts, not an exponent or key search. None is readable plaintext. Their IoCs range from 0.028421 to 0.041404; the best-scoring output remains nonprose.

2. **GP-prime projection and discrete logarithm.** Map each rune to its original Gematria Primus prime weight, raise it by the **field cofactor** (24 or 100) to project into the selected subgroup, and take the discrete logarithm. Across the complete 29-symbol alphabet, raw logs fall within the 29-rune range for 18/29 interior symbols and 28/29 exterior symbols under the reverse pairing, and 18/29 and 29/29 under printed order. Reducing those logs modulo 29 makes every output syntactically a rune but collapses the 29 input symbols to only 19/29 and 18/29 distinct outputs under the reverse pairing, and 19/29 and 19/29 under printed order. Neither pair is a bijective 29-symbol substitution; the p55 readouts are also nonprose.

The complete original-input reproduction is **sims/lp2_cuneiform_1033_3301_p55_subgroup_key_gate.cjs**. It verifies the p55 group tape against lp2-corpus.json, reconstructs the 43/33 partition, proves the prime-field and subgroup orders, and freezes all tested readouts. The p55 exterior here **includes the incoming carry**; do not conflate it with the separate 43-interior/32-word-local-boundary extraction in lp2-p55-shed-circumference-prime-shell-original.md.

### Interpretation

The group-order match strengthens the possibility that p33 is structurally pointing to p55, and it supplies a new finite-field hypothesis. It does not yet specify how a field element or subgroup exponent is represented as a GP29 rune. The two simplest source-derived mappings above fail. Do not broaden this into arbitrary generator, phase, or residue searches: the next useful input must be an independent clue selecting a field-to-GP29 encoding or a concrete two-field receiver.

## Decision and next step

The p33→p55 arithmetic alignment now has two distinct aspects: the Euclidean quotients/remainders reproduce p55 layout counts, and the prime-field multiplicative group orders contain the exact 43/33 register lengths. Both are structurally interesting, but neither has yielded authentic plaintext, an authenticated key, or a fully specified encryption mechanism.

Keep this in im-results, not results. Do not duplicate the already-completed all-exponent RSA FPE test on p33–39 or the existing large-\(P\) DH inverse. The remaining question is whether an independent original clue specifies how the two small prime fields and their subgroups act on the GP29 streams. Without that selector, the field-order correspondence remains a hypothesis rather than a decipherment.
