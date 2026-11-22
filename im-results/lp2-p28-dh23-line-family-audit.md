# P28 DH23 line-family calibration

**Director #1689 closure, 19 November 2026. Classification: source-constrained LP2-native DH operation/state selector with a calibrated geometry rival. The literal `DH` label, the fixed outer-H/count reconstruction, an independent manuscript-wide cross-modulus invariant, and a predeclared solved-p57 punctuation holdout jointly select the p28 DH23 state. The bare visible tuple geometry is not unique, and no unknown plaintext or complete LP2 inverse is recovered.**

## Decisive correction

The p28 center-line route uses four visible quantities:

```text
line length      = 23
selected word len = 5
line number       = 6
selected word start = 19
```

under the natural standard-DH typing

```text
(p,g,a,B) = (23,5,6,19).
```

A complete physical-line census shows that this geometry is **not unique**.

Charging every physical line, every word on that line, and both zero- and one-based line-number origins yields **424** rows where the natural `(p,g,a,B)` assignment forms a standard prime-field DH instance with a primitive-root generator. The exact target tuple occurs twice:

1. **p8 line6**, final word6, first fragment `YSHUL`;
2. **p28 line6**, final word5, first fragment **`DH`**.

The same two rows are the only rows whose four visible values have multiset `{5,6,19,23}`, so allowing all parameter-role permutations does not create an additional target-geometry line.

Thus the older statement that the layout geometry itself uniquely selects the complete tuple was too strong. It selects a two-line equivalence class.

## Literal operation label breaks the geometry tie

Across all **604** physical nonempty lines in p0..p55 excluding rune-free p50, the first visible fragment transliterates to `DH` exactly once:

```text
p28 line6
```

The p8 geometry duplicate begins `YSHUL`.

A source-preserving matched null keeps every line length, word boundary, line number, word position and target-tuple geometry fixed, and permutes first visible fragments only among lines having the same fragment rune length. There are **120** two-rune first-fragment lines. The unique literal `DH` fragment and the p28 target-geometry line are each singletons in that stratum, so the exact matched probability of their alignment is

```text
1 / 120 = 0.0083333333.
```

This is a calibrated structural statistic, not a global discovery probability. It does show that `DH` is doing real source-selection work beyond the duplicated numeric geometry.

## Untouched p50 consequence fixes line-number origin

After the literal `DH` line is selected, the audit still charges both zero- and one-based physical line numbering.

For p28 line6 the two interpretations give:

| line origin | a | A = 5^a mod23 | K = 19^a mod23 |
| --- | ---: | ---: | ---: |
| zero-based | 5 | 20 | 11 |
| one-based | 6 | **8** | **2** |

The physical p50 table is independently **8 columns wide**. That width was not used to define the line family. It therefore selects the one-based convention and its public value `A=8` on the unique literal-DH line.

Across all 424 natural primitive-root DH rows, 24 happen to predict `A=8`; the value itself is not globally rare. The useful holdout is typed and local: among the two charged origins of the already selected literal-DH line, only one-based numbering predicts the independently visible p50 width.

## Predeclared solved-p57 holdout independently reselects 23

Before this audit, Agent20 had frozen a source-visible holdout on solved p57 punctuation.

The original large-mark dot-count inventory has only three distinct counts:

```text
10 dots: 4 marks
13 dots: 31 marks
23 dots: 1 mark
```

The unique **23-dot** mark is the terminal red mark on p57.

Clear p57 ends in `EMERGE`, with

```text
GP0(EMERGE) = 83.
```

The predeclared prime-rank closure is exact in two independent dot-count branches:

```text
23rd prime = 83 = GP0(EMERGE)

13th prime = 41
p50[41] = 1O
drop-f base59(1O) = 83 = GP0(EMERGE)
```

The only other visible dot count, 10, gives

```text
10th prime = 29
p50[29] = 16
base59(16) = 65
```

and hits no p57 GP0 word in either direct or p50/base59 form.

This holdout was specified before the present line-family census. It independently favors **23** as the modulus-like punctuation count and ties it to the already selected terminal word `EMERGE`.

## Independent cross-modulus family closes the labeled state

A separate source-family audit was constructed without `READ OUT`, `HERE`, p0 receiver values, p50 target values, or language scoring. It rebuilt every rune-bearing line under the fixed outer-H/count DH family. The unrestricted algebra-valid family has **1,628 variants on 274 lines**. Removing only trivial identity exchanges by requiring `g,b,A,B,K > 1` leaves **711 variants on 212 lines**.

For each variant whose `b` is invertible modulo `p-1`, define the ordinary DH inverse exponent `e=b^-1 mod(p-1)` and test the labeled GP29 chain

```text
K^e = A
A^e = B
B^e = b
(mod29).
```

Exactly one variant survives: p28 line6 with

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e = 15^-1 mod22 = 3.
```

The exact GP29 chain is `2^3=8`, `8^3=19`, `19^3=15` modulo29. The same sole hit remains in the stricter **289-variant / 133-line** invertible nontrivial family and the older **60-variant / 31-line** seven-distinct control. This fixes exponent3 from standard DH algebra rather than from candidate English.

Supporting audit: [`lp2-p28-dh-crossmod-chain-audit.md`](lp2-p28-dh-crossmod-chain-audit.md).

## Standard-DH consequence

Once p28 line6 is selected by the unique literal `DH` label and its visible natural roles are read one-based,

```text
(p,g,a,B) = (23,5,6,19).
```

Standard DH then yields without further parameter search:

```text
b = 15
A = 5^6 mod23 = 8
K = 19^6 mod23 = 2.
```

The broader p28 route already has independent source relations for these fields, including the reversible H shell decoder. This audit does not re-score those downstream relations.

## Decision

Preserve the p28 DH23 route with a narrower statement:

- the exact tuple geometry has one original-source rival on p8;
- p28 is uniquely marked by literal `DH`;
- the literal-label alignment has exact length-stratified matched rate **1/120**;
- the independently visible p50 width **8** resolves the charged line-origin ambiguity in favor of one-based `a=6`, which predicts `A=8` and `K=2`;
- a predeclared solved-p57 punctuation holdout independently reselects **23** and `EMERGE=83`;
- the independent 711-variant nontrivial outer-H/count family leaves this p28 state as the sole cross-modulus DH-inverse-chain hit;
- the tuple should therefore be described as a **source-constrained LP2-native DH operation/state selector**, not uniquely selected by geometry alone.

This satisfies #1689's positive operation-selector fork. Do not use the tuple-geometry duplicate as a reason to add new parameter permutations or arithmetic. Standard DH still supplies no KDF, GP29 serialization, payload cipher, reset rule, or general unknown-page receiver, so candidate `READ OUT` remains under its separate transform, solved-control, and output-type gates.

## Reproduction

- SFT: [`sims/lp2_p28_dh23_line_family_audit_sft.cjs`](../sims/lp2_p28_dh23_line_family_audit_sft.cjs)
- Director task: [#1689](https://github.com/FlareZ123/liber-primus/issues/1689)
