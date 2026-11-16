# Dual812 original GP29 overlapping-pair multiplication: all-secret native-alphabet obstruction

**Agent24, 16 November 2026; Director [#1312](https://github.com/FlareZ123/liber-primus/issues/1312).** An exact necessary-condition test on the complete unmodified p0–55 rune register excludes **every stationary per-physical-page, 29-entry plaintext-to-dual-unit multiplier alphabet**, regardless of all 29 hidden multiplier choices or their mapping to GP runes. The original ciphertext requires **60–228 distinct actual group multipliers per page**, and **784 distinct multipliers across the book**, exceeding any 29-symbol table. A fixed unconditional multiplication by the source-derived generator `19+13ε` matches only **14/12,676** valid adjacent-pair transitions. No plaintext, creator key or fully authenticated cipher has been recovered.

## Human solve-path premise and exact limitation

Three original-source observations motivate considering a multiplicative chain:

- The original 29-rune GP alphabet gives 29×28=812 ordered **unequal** neighboring rune pairs.
- Original p15's sign-restored Fibonacci-prime matrix has order812, and the p39 red double-root quadratic selects the dual algebra `R=GF(29)[ε]/(ε²)` whose unit group contains 812 elements.
- An independently derived conditional p50 polynomial quotient maps to `g=19+13ε` and generates the 812 dual units.

The p15 signs are **not actually printed**, the red runes are not labeled polynomial coefficients, and neither the embedding nor group multiplication is directed by an authenticated Cicada instruction. The earlier [unit pair direct logs](../workplace/lp2-dual812-unequal-pair-original-inverse.md) and [complete 841-state nonunit transport](lp2-dual812-fullring-nonunit-completion.md) have already been tested. This report does not repeat their plaintext projections.

A cryptanalytic question left by them is whether a plaintext rune can select **one secret, fixed multiplier of this group**, while the ciphertext is the contiguous original GP29 rune stream. A stationary per-page secret table is a generous model: every physical page may choose all 29 unit elements independently, and exceptional equal-rune sites can reset without penalty. This is a complete unknown-key family and needs no language scorer.

## Overlap determines the multiplier; there are only 28 legal choices per state

For an *original* ciphertext triple `(x,y,z)`, let `d=y−x` and `e=z−y`, interpreted modulo29, and suppose `d,e≠0`. The published complete ring embedding is

```
u_i     = d + x ε
u_(i+1) = e + y ε
```

Because `u_i` is a unit, the **only** multiplier taking this unit to its actual successor is

```
m_i = α + β ε,  where
α = e / d
β = (y−αx) / d = 1+(1−α)x/d       (mod29).
```

Every step is known **without guessing plaintext or key**. For a fixed preceding `(x,y)`, exactly 28 choices of nonzero `e` are possible. Each permits precisely one overlap-consistent multiplier; every other one of the 812 group elements would produce an epsilon coefficient incompatible with the shared middle ciphertext rune `y`.

The set of multipliers possible anywhere in any contiguous unequal-pair rune chain has **exactly `27×29+1=784` elements**:

- For `α=1`, the formula forces `β=1`, regardless of state.
- For each `α∈{2,…,28}`, the ratio `x/d` can be any GF29 element, so all 29 values of `β` occur.

Consequently `1+ε` is the **only constant group element that can advance every possible preceding pair**. It preserves the difference `e=d`, creating an arithmetic progression, and does not encode an arbitrary 29-rune plaintext. The source quotient generator `19+13ε` generally violates the pair-overlap equation even before its predicted next difference is tested.

If the first difference is zero, `u_i` is a nonunit. Multiplying a nonunit by a unit remains a nonunit, so no group-unit-only generator can exit an original doublet event without an extra reset or an additive/nonmultiplicative operation. The 86 actual adjacent equalities are **isolated** on each physical page, producing **170 neighboring triple positions involving a nonunit**; they cannot be silently discarded.

## All-secret source decision

The complete original 55 rune-bearing physical pages and their unchanged 12,956 GP indices supply **12,676** consecutive triples with two nonzero differences, and 170 remaining triples with at least one doublet. For each eligible triple calculate the unique multiplier above.

| Frozen original-source measure | Exact value |
| --- | ---: |
| Original GP ciphertext runes | **12,956** |
| Original rune-bearing pages | **55** |
| Observed unit-to-unit triples | **12,676** |
| Triple positions touching a repeat/nonunit | **170** |
| Distinct observed unit multipliers | **784/784 mathematically possible** |
| **Minimum** distinct unit multipliers on *any one* physical page | **60** (p49) |
| **Maximum** distinct unit multipliers on one physical page | **228** (pp42 and47) |
| Fixed `g=19+13ε` satisfying the necessary shared-middle-rune condition | **437/12,676** |
| Fixed `g` matching the complete actual next pair | **14/12,676** |

The nine original image-delimited chapters individually have **[472, 580, 681, 708, 570, 654, 680, 763, 239]** distinct original multipliers. Each one exceeds 29. In particular, the shortest physical rune-bearing page p49 (66 original runes) already has **60** distinct multipliers among 64 eligible triples. Even an arbitrary independent 29-way alphabet for *every single page* is insufficient. This rejects the entire fixed `m_i=T_page(P_i)` family for GP29 plaintext, **without assuming any native-English character frequencies, dictionary, trained key, or specific source plaintext**.

The count of 784 globally observed multipliers is an expected saturation of the 784-state permissible set in a long, near-uniform stream. It is useful here as a **direct cipher-family cardinality witness**, not as a surprising statistical code signature or independent confirmation of the author's dual-ring intent.

## Exactly one viable mathematical relaxation and positive plaintext control

A state-dependent *28-choice* alphabet can work as follows. At each unequal-pair state, the plaintext token `t∈{0,…,27}` chooses `α=19^t mod29` and **β is calculated from the current state by the overlap rule**. This gives the exact reversible update `e=αd` and `z=y+e`; its inverse obtains `t=log_19(e/d)`. The original 12,676 such ratio tokens have IoC **0.0357094336593** under fixed log19, near the 1/28 uniform value and without sustained native-GP prose.

A full **authentic 95-rune solved p57 plaintext plant** has no rune28 and therefore supplies 95 real source tokens in that 28-symbol register. Starting from ciphertext seeds `[13,14]`, the exact state-dependent encoder produces 97 ciphertext runes; the inverse recovers **95/95 authentic p57 source values**, without fitting a key. This proves only the viability and correctness of the altered *state-dependent* operation. A 29th plaintext rune or a doublet would require an independently selected escape/reset path. The known p56 plaintext-F skip rule does not itself specify a GP28 ratio reset or imply that the LP2 doubles are F markers.

**Source audit:** The originally signed 2013 “everything you need,” “forest/trees,” original Cicada OS prime-echo/key text, the 2014 signed continuation instructions, and the 2016 signed LP2 statement about words, meaning and numbers name no dual-number multiplication or state-conditioned α/β update. The 2016 statement motivates examining word values and numerical directions generally; it supplies neither a ring equation nor a key. The presence of source arithmetic does not resolve the absent opcode.

## Decision and research fork

Reject a stationary GP29 plaintext→dual-unit-multiplier alphabet for the original source, even if it is **unknown and independently keyed on every page**, and reject the fixed source `g` progression as a direct original-pair state. Any serious surviving architecture must choose a **state-dependent** transition with no more than 28 nonzero-next-difference choices plus a specified equal-pair reset/escape rule; otherwise it needs a different state representation or a nonmultiplicative update. The all-secret overlap obstruction should prevent further fixed-generator or 29-symbol multiplication-table search.

Do not promote the 812 cardinality match as a cipher or multiply it by arbitrary key phases. Reopen this branch only when original imagery, signed historical material, or source-typed instructions identify the missing feedback, reset/escape and plaintext mapping. No unknown LP2 page has been decrypted.

**Reproducer:** [Windows Node22 CommonJS original-source SFT](../sims/lp2_dual812_multipliers_allsecret_original_sft.cjs). It enumerates all 841 candidate original overlapping-pair inputs, asserts exactly 784 admissible units, reconstructs every original triple multiplier, counts every page independently, proves the fixed-source-generator obstruction, and recovers the genuine p57 plant. The code includes no model fitting and requires only `resources/liber-primus/lp2-corpus.json`.
