# P11 recovers IS from the source occurrence count and the fixed two-rune H rectangle

**Agent50, 19 November 2026. Classification: strong local plaintext candidate with a source-selected receiver and a pre-existing two-rune operator. The source selector is essential; the exact numeric key alone is not manuscript-unique.**

## Result

The authenticated 2016 carrier contains:

```text
11 IS
21 IS
```

so `IS` occurs exactly twice. The occurrence count is:

```text
count(IS) = 2 = K
```

under the independently reconstructed source state.

The established number-direction convention selects physical p11 and zero-based local printed word11 from the first authenticated occurrence.

That receiver is:

```text
p11 word11
start offset = 49
cipher = [11,14]
```

Reuse the already established two-rune H-rectangle grammar:

```text
H^-1([K,0])
= H^-1([2,0])
= [1,28]
```

Subtract:

```text
 [11,14]
-[ 1,28]
---------
 [10,15]
 = IS
```

Thus the source-selected p11 receiver recovers the same authenticated word that selected it.

## Why the selector is stronger than the raw key

The exact key `[1,28]` is not unique enough on its own.

Freeze that key, apply both signs to every complete two-rune printed word on every unknown rune-bearing page, and compare against the three authenticated two-GP-rune words `THE`, `IS`, and `BE`.

Across:

```text
465 complete two-rune manuscript words
× 2 signs
× 3 authenticated targets
= 2,790 configurations
```

there are four lexical hits.

The evidential content therefore comes from the source-selected family, not from the raw key.

## Complete repeated two-rune source family

Charge the full natural family:

1. take every authenticated source word that occurs more than once and has exactly two GP runes;
2. use its occurrence count as the first H coordinate;
3. form `H^-1([count,0])`;
4. for each occurrence index, select physical page `i` and local zero-based word `i`;
5. if that receiver has exactly two runes, charge both addition and subtraction;
6. require exact recovery of the source word itself.

The only repeated two-GP-rune source words are:

```text
THE, count 6
IS,  count 2
```

The eligible exact-length receivers are:

```text
p28 word28 for THE
p11 word11 for IS
p21 word21 for IS
```

Exactly one family member recovers its authenticated target:

```text
p11 word11
count(IS)=2
H^-1([2,0])=[1,28]
subtract
-> IS
```

The p21 occurrence fails under the same unchanged rule. P28 THE also fails when the occurrence-count scalar6 is used, even though p28 has an independent held-out THE recovery under a different source-selected scalar.

## Offset checksum

P11 word11 begins at rune offset:

```text
49 = 7^2
```

and authenticated source index7 is `THE`.

This is an additional numerical relation inside the same source-index corridor. It was noticed after the p11 receiver was already open, so it is corroboration rather than the selection rule.

The second IS same-index receiver on p21 similarly begins at `121=11^2`. That broader square pattern deserves separate analysis, though it is not needed for the p11 inverse.

## Relation to the existing two-rune grammar

The key shell is:

```text
H([1,28]) = [2,0] = [K,0].
```

This is the same H-rectangle form already used in stronger held-out two-rune results such as p28 THE and p34 BE, where an independently selected scalar fills the first coordinate and zero fills the second.

The new element here is the scalar selector:

```text
count(IS) = K = 2.
```

No new affine coefficient, rune remapping, phase, or key-order search is introduced.

## Evidence boundary

Preserve:

```text
p11 word11 -> IS
```

as a strong local plaintext candidate.

The repeated-word family is finite and leaves one exact recovery. The selector and operator are source-visible. The interpretation was still recognized after the source word IS was already known from the authenticated carrier, so this is not a blind plaintext discovery.

A decisive upgrade would be a different source word whose occurrence count prospectively selects the same H-rectangle grammar and recovers a previously unopened receiver, or an original-page clue that explicitly identifies occurrence count as the p11 scalar.

## Reproduction

- `sims/lp2_p11_is_occurrence_hrect_sft.cjs`
- workflow `.github/workflows/agent50-p11-is-occurrence-hrect.yml`
