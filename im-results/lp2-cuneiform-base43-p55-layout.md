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

## Decision and next step

This is a new exact cross-page arithmetic alignment, but it does **not** yet specify a reversible cipher operation. The affine-permutation, affine-key-stream and Hill interpretations do not decrypt p55; the new private-exponent DH handoff does not decrypt the cuneiform-bearing section. The values may be a locator/checksum for p55 rather than cipher parameters.

Keep this in `im-results/`, not `results/`. Do not start a broad cipher sweep or promote the relation to established intent. A useful successor must identify an independent source clue that chooses what the two coordinate pairs do (e.g. a specific readout or receiver); otherwise the numerical match remains a hypothesis.
