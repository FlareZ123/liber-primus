# P6 shared key scheduler gate: the simplest source-visible families fail before holdout

**Agent19, 19 November 2026. Classification: bounded negative for Director #1839.** The p6 red title remains a strong source-visible DH/state packet, and the individual local plaintext candidates below retain their existing evidence. This test asks a narrower question: does one low-description scheduler generate their complete rune-key shells from source word number/length plus p6/DH fields?

The answer is negative for three finite source-visible families. The original two one-operation/state-position families fail before a third target is needed; a new literal printed-title tape family fails even on each single target.

## Same-type training set

Use the three four-rune consumers whose receivers were selected independently of their final key-shell formulas:

```text
p33 WILL   cipher [3,15,17,22]  key [25,5,26,2]
p37 LUCK   cipher [3,2,6,27]    key [12,1,1,22]
p40 PATHS  cipher [4,15,14,21]  key [20,20,12,6]
```

To prevent the repository's mixed display conventions from creating artificial differences, serialize every four-rune key with one fixed literal outside-in H order:

```text
J4(k) = [
  k0-k3, k0+k3,
  k1-k2, k1+k2
] mod29.
```

This gives:

```text
WILL  index33 -> [23,27,8,2] = [p,-K,A,K]
LUCK  index37 -> [19,5,0,2]  = [B,g,0,K]
PATHS index40 -> [14,26,8,3] = [-b,-e,A,e]
```

Every key re-encrypts its original ciphertext exactly. The purpose here is not to re-score those candidates. It is to see whether two complete shells determine a source-visible rule that can be frozen before a third.

## Family A: all one-operation arithmetic formulas

For each shell coordinate, charge every expression of the following forms:

- direct source index `r=i mod29` or GP length `L`, including negation;
- a direct signed p6/DH atom from `{p,g,a,b,A,B,K,e,q,1,0}`;
- one `+`, `-`, or `*` operation between one signed state atom and `r` or `L`;
- one operation between `r` and `L`;
- one operation between two fixed DH/state atoms.

No expression contains two binary operations. This yields **560 labeled formulas per coordinate**. Coordinate formulas may be chosen independently, which is deliberately generous.

Pairwise training gives:

```text
training WILL+LUCK:
  coordinate fit counts [1,0,0,23]
  complete schedulers   0

training WILL+PATHS:
  coordinate fit counts [0,0,20,0]
  complete schedulers   0

training LUCK+PATHS:
  coordinate fit counts [0,0,0,0]
  complete schedulers   0
```

Thus even this permissive coordinate-wise family cannot reproduce two complete four-rune shells.

## Family B: charged p6 field-position schedulers

A rival is that the scheduler selects positions rather than performing GP arithmetic. Charge the source-ordered p6/DH register

```text
[K,e,q,g,a,g+K,A,b,B,p,0]
= [2,3,4,5,6,7,8,15,19,23,0].
```

For each shell coordinate, allow

```text
± tape[(alpha * source_index + offset) mod 11]
```

with `alpha` charged over every signed member of `{1,K,e,q,g,a,A,b,B,p}`, every offset 0..10, and both output signs. Coordinate selectors are again allowed to differ, so the family is generous about field-role permutations.

Pairwise coordinate survivor counts are:

```text
WILL+LUCK   [3,0,2,0] -> 0 complete schedulers
WILL+PATHS  [1,3,0,3] -> 0 complete schedulers
LUCK+PATHS  [0,0,2,2] -> 0 complete schedulers
```

No complete field-position scheduler fits any pair.


## Family C: literal printed p6 title as an 11-cell cyclic tape

The strongest unused literal serializer is the actual eleven-rune red title, rather than a derived state register:

~~~text
[24,16,14,17,19,6,27,15,17,14,12].
~~~

To avoid choosing a favorable origin or direction after seeing a key, charge a deliberately broad complete family:

- tape: raw printed title or its canonical outside-in H shell;
- source-index start: every nonzero affine slope modulo11 and every offset0..10;
- window direction: forward or reverse;
- one global sign: + or -;
- four-cell output interpreted either as the raw key or as the fixed interleaved H shell.

This is

~~~text
2 * 10 * 11 * 2 * 2 * 2 = 1760
~~~

complete schedulers. The source-index map is broader than a literal rotation and therefore includes the natural same-index and tail-relative origins as special cases.

Result:

~~~text
WILL  single-target fits = 0
LUCK  single-target fits = 0
PATHS single-target fits = 0
~~~

Because no scheduler reproduces even one of the three complete four-rune keys/shells, every pairwise survivor count is also zero. The visible eleven-rune p6 title is therefore **not a direct cyclic key/shell tape** for this same-type consumer class under this family.

## Decision

The training gate fails before a holdout can honestly be predicted. A shared p6 scheduler in these natural source-number/length/field-position families therefore has **zero surviving models**, rather than several models from which a favorable third result could be selected. The literal printed-title tape family is excluded even more strongly: none of its 1,760 complete schedulers fits a single same-type candidate.

Do not add page-specific constants, per-target role tables, further tape warps, alternate H serializations, or extra arithmetic operations to rescue the idea. Those additions would encode exactly the target-conditioned shell algebra that #1839 was designed to distinguish from an authored schedule.

Preserve the local inverses and p6 as a state source:

```text
p33 WILL
p37 LUCK
p38 BEWARE
p39 FALSE
p40 PATHS
```

Their individual source selectors and exact re-encryption remain unchanged. The new conclusion is only that the present evidence does not support one common low-description p6 key scheduler. Revisit this question only if an original manuscript clue supplies an additional field-position or page-specific selector before another key is known.

P36 GOOD's EMPTY-center five-to-four codec is a different operand type and is being tested separately by Director #1841; mixing it into this training set would add degrees of freedom rather than repair the failed same-type scheduler.

## Reproduction

`node sims/lp2_p6_shared_scheduler_gate_sft.cjs`
