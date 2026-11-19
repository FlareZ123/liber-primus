# P35/P38 FOUND common-decoder audit: the published local key mechanisms do not unify

**Agent45, 19 November 2026. Director #1799. Classification: decisive negative common-mechanism audit.** The independently selected p35 and p38 receivers remain strong local `FOUND` candidates under their own evidence. A bounded union of the actual published key grammars, their signs, coordinate orderings, and the full p38 geometry family contains no decoder rule that recovers both receivers. Under the issue fork, no third receiver is opened.

## Frozen inputs

The two existing recoveries are:

```text
p35 offsets25..29
cipher = [19,17,19,24,11]
FOUND  = [ 0, 3, 1, 9,23]
P-C    = [10,15,11,14,12]
C-P    = [19,14,18,15,17]

p38 offsets49..53
cipher = [19,25,22,26, 3]
FOUND  = [ 0, 3, 1, 9,23]
P-C    = [10, 7, 8,12,20]
C-P    = [19,22,21,17, 9]
```

Both exact forward reconstructions are asserted directly from the canonical LP2 corpus in the reproducer.

The comparison does not alter either receiver or introduce a new plaintext target.

## 1. The complete published p35 key grammar cannot express the p38 recovery

The p35 report charges the direct-coordinate key grammar

```text
[x, -y, u-v, y, y+K]
```

with `x,y,u,v` independently drawn from the nine reconstructed state fields

```text
{p,g,a,b,A,B,K,e,q}.
```

That is 6,561 labeled tuples and 2,349 distinct numeric keys. The original p35 report has three labeled aliases for one numeric subtraction key.

For the common-mechanism audit, this family is widened rather than narrowed:

- all 120 coordinate permutations;
- both global signs;
- reversal is already included among the permutations.

This charges **1,574,640 labeled tuple/permutation/sign representations**.

Result:

```text
tuples that can recover p35 FOUND: 3
tuples that can recover p38 FOUND: 0
tuples that can recover both:      0
```

There is also a simple exact invariant behind the null. Every p35-grammar vector contains both `y` and `-y`. The p38 required key has no additive-inverse coordinate pair under either decryption sign, and permutation cannot change that fact.

The p35 grammar therefore cannot be the shared decoder.

## 2. The p38 HERE/DH lookup family cannot express the p35 recovery

The p38 local inverse was originally represented by per-slot HERE/DH state lookups. Use a deliberately broader control than that exact descriptor: the full direct/HERE/DH union already charged in the cross-page audit. Its 21 labels collapse to the 17 numeric atoms

```text
{2,3,5,6,7,8,10,12,15,17,19,20,22,23,24,26,28}.
```

The p35 additive recovery vector is

```text
[10,15,11,14,12]
```

and requires values **11** and **14**, neither of which belongs to that broader union. The opposite sign

```text
[19,14,18,15,17]
```

requires **14** and **18**, also outside the union.

Thus even the broadened p38 lookup vocabulary cannot generate the p35 inverse under either sign. Any narrower fixed p38 descriptor fails a fortiori.

## 3. The full p38 receiver-geometry family has no p35 match

The p38 geometry report defines a 2,304-formula family from the selected receiver's visible page/start/end/span coordinates. The exact p38 rule is:

```text
x = page/2 mod29
shell = [x, start-x, end, x, 2*span]
H^-1(shell) = key
```

where shell order is `H(k0,k4) || H(k1,k3) || [k2]`.

The complete published family charges:

- `x = page, page/2, 2*page`;
- `start-x` versus `x-start`;
- `±start` or `±end`;
- `±length, ±span, ±2span, ±2length`;
- every placement of the repeated `x` into two of the first four shell slots;
- both orders of the remaining two shell values.

This is 2,304 rules. The common-mechanism audit additionally charges forward/reversed key orientation and both global signs, for **9,216** configurations.

Result:

```text
p38 exact-key hits: 1
p35 exact-key hits: 0
shared-rule hits:   0
```

The sole p38 hit is exactly the published formula:

```text
page/2 | start-x | +end | +2span
x in shell slots 0,3
remaining order y,z
forward orientation
positive sign
```

Applying the same complete family to p35 offsets25..29 produces no exact recovery, so the geometry rule also fails as a shared mechanism.

## Decision

The three mechanism classes cover the concrete local explanations currently published for these two `FOUND` candidates:

1. the p35 state-expression key grammar;
2. the p38 state-index lookup vocabulary;
3. the p38 receiver-geometry key generator.

Each class is widened over its relevant sign and ordering freedom. None contains a common decoder. There is therefore no justified shared rule to freeze for the issue's required third five-rune holdout.

Per Director #1799, **do not open a third receiver**. Doing so would turn a failed common-mechanism test into a new search family.

This result preserves the two local candidates at their prior evidence level:

- p35 still has an independently selected page, a manuscript-unique raw H5 state packet, and a source-assigned `FOUND` target;
- p38 still has the globally unique typed closure selecting both receiver and `FOUND`, plus its own exact local inverse.

What fails is the stronger claim that their two inverses are manifestations of one reusable decoder. A future merger needs a new source-visible receiver-dependent state transition that is specified before ciphertext inspection.

## Reproduction

```text
node sims/lp2_p35_p38_found_common_decoder_gate_sft.cjs
```

The SFT reads the canonical LP2 corpus, reconstructs both original ciphertext receivers and exact `FOUND` differences, charges all three families above, and asserts exact forward reconstruction plus the zero-common-rule result.
