# P6 terminal title-tape serializer gate

**Agent12, 28 November 2026. Classification: bounded source-only serializer exclusion for Director #3384. This does not reject the p41/p42 target-blind receiver selectors, and it does not establish VERIFY or OPENPGP as unknown plaintext.**

## Question

The p6 schedule partitions the signed-source corridor as `[q,1,q,K]=[4,1,4,2]`. Its terminal `K=2` block target-blindly selects p41/p42 through the unique consecutive ordinal pair whose selected words have center `F=0`; p42 additionally emits the manuscript-unique selector `[K,1,F]`. The unresolved causal step is a single p6-authored serializer that predicts the complete six- and seven-rune keys before comparing against the authenticated source words.

The most literal source-visible arity observation is exact:

```text
p41 prepared receiver length = 6 = q + K
p42 prepared receiver length = 7 = q + 1 + K
```

That suggests treating the p6 title itself as a typed key tape: one q-length title component, the singleton only for the seven-rune case, and the K-length terminal title word.

## Frozen source inputs

Only the original p6 title values and printed lengths are used to build the candidate family:

```text
W1 = [24,16,14,17]   length q=4
W2 = [19]            length 1
W3 = [6,27,15,17]    length q=4
W4 = [14,12]         length K=2
lengths = [4,1,4,2]
```

The previously fixed outside-pair H operation is charged in both serializations already used in the repository: interleaved `(difference,sum)` pairs and the canonical `differences | center | reversed sums` order. Both inverses are included.

The target plaintext rune values do not participate in grammar construction. This invocation had already read the repository's published fitted p41/p42 keys before freezing this family, so the result is intentionally interpreted only as a **negative family exclusion**, never as a prospective positive precommit.

## Charged literal title-tape family

For the q-length component, charge six source-only bases:

```text
W1
W3
W1 + W3
W1 - W3
W3 - W1
W1 * W3          (all coordinatewise mod 29)
```

For every q base, W2, and W4 independently charge:

- identity, interleaved H, interleaved H inverse, canonical H, canonical H inverse;
- every coordinate permutation;
- both signs.

Then charge every component order compatible with the required arity:

```text
length 6: q + K       -> both component orders
length 7: q + 1 + K   -> all six component orders
```

Finally charge both signs and fourteen whole-vector transforms: identity/reversal plus H/H-inverse under both serializations, with reversal permitted before or after those transforms. This deliberately overcharges the obvious ordering and H-convention choices rather than selecting a favorable one after seeing a key.

The labeled grammar contains:

```text
length 6:  1,612,800 labeled forms
length 7: 48,384,000 labeled forms
```

After exact deduplication these become:

```text
length 6: 175,464 distinct raw-key vectors
length 7: 983,134 distinct raw-key vectors
```

## Held comparison

The repository's previously published fitted keys are:

```text
p41 fitted key = [26,23,1,7,13,22]
p42 fitted key = [7,1,12,23,13,2,18]
```

Neither appears in its corresponding source-only family:

```text
p41 hit: false
p42 hit: false
joint hit: false
```

This is stronger than a failure to choose uniquely: the literal p6-title-tape family cannot reproduce either fitted endpoint key even after broad permutation, sign, H-serialization, reversal, and simple W1/W3 interaction freedom.

## Decision

Retire the direct **title-as-key-tape** explanation for the terminal block under this charged family. The p41/p42 receiver selectors remain valuable source-side evidence, but their published keys still lack an authored serializer.

Do not rescue this null by widening to arbitrary coordinatewise p6-state arithmetic. The existing p6-state saturation audit already shows `S ∪ (S+S)=Z29`, and the signed-warning audit similarly saturates the alphabet under one binary operation; unconstrained arithmetic would therefore manufacture fitted coordinates without identifying a historical rule.

A materially distinct reopening requires an independently authored field-order/arithmetic instruction, or a serializer frozen on another source-visible block and transferred unchanged to p41/p42. Merely adding more p6 expressions is not a causal advance toward plaintext.

## Reproduction

Run:

```text
node sims/lp2_p6_terminal_title_tape_serializer_sft.cjs
```

The SFT reconstructs the complete charged family, freezes the exact labeled and distinct counts above, and only then performs the held comparison against the two already-published fitted keys.
