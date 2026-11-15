# Exact 841-state dual-ring completion of the 812-unit LP2 pair map

**Agent1, 15 November 2026, Director Issue [#1181](https://github.com/FlareZ123/liber-primus/issues/1181).** The original 86 same-page equal adjacent rune pairs can be retained *without any external escape sidecar*: they are exactly the 29 nonunits of the dual-number algebra suggested by p39. A fixed, complete reversible 841-state code follows. On the untouched 12,956-rune unknown source, its only canonical GP29 projections remain near-uniform and reveal **no plaintext or authentic key**. The completion is mathematically real; its use as a Cicada cipher is not source-authenticated.

## Why test this correspondence at all?

Source observations already established before this issue:

- Gematria Primus has 29 rune indices. Its ordered unequal adjacent rune pairs number `29×28=812`; the unknown manuscript has **12,815** such within-page transitions and **86** equal transitions.
- A sign-restored p15 Fibonacci-prime matrix has order812, while p39's red quadratic has a double root at24 and defines the algebra `R=GF(29)[ε]/(ε²)` with **812 units**.
- A conditional p50 quotient calculation gives the candidate unit `g=19+13ε`, whose powers exhaust all 812 units. [Upstream source arithmetic](lp2-p15-p39-signed-matrix-eigen-crosslink.md) and [earlier unit-only pair representation](../workplace/lp2-dual812-unequal-pair-original-inverse.md).

A creator instruction to restore p15's suppressed signs or use `g` as a ciphertext generator has **not** been found. The exact arithmetic is grounds for one finite cryptanalytic experiment, not authority to assert this cipher family.

## The complete in-band 29² map

For two *original* GP29 rune indices `x` (previous) and `y` (current), form

```text
u(x,y) = (y - x) + x ε            in R, modulo 29.
```

This is a **bijection** between all 841 ordered rune pairs and **all 841 ring elements**. If `x≠y`, its real part is nonzero, so it is among the 812 units. The earlier study used `k=log_g(u)`, the unique exponent 0–811, but discarded its 86 repeated-rune sites as undefined. The complete code treats their elements as nonunits:

```text
if y != x:
    k = log_(19+13ε)((y-x)+xε)    # 0..811
    q = floor(k / 28)             # 0..28
    r = k mod 28                  # 0..27
else:
    q = x                        # 0..28
    r = 28                       # designated in-band nonunit class
```

The result `(q,r)` belongs to `{0..28}²`. Every one of the **841** output pairs occurs exactly once among the 841 possible `(x,y)` inputs. Inversion needs only the fixed original source-derived generator:

```text
if r == 28:
    x = q
    y = q
else:
    (a+b ε) = (19+13ε)^(28q+r)
    x = b
    y = (a+b) mod 29
```

For any complete source page, retain its visible **first rune** `x₀` as a seed and represent its `n−1` ordered transitions by these complete `(q,r)` pairs. During inversion assert that every transition's recovered `x` agrees with the preceding recovered rune. That overlap check matters: independent arbitrary ring elements are generally **not** a valid contiguous rune stream. The cross-step consistency relation is `b_(i+1)=a_i+b_i (mod29)`. No original word break, original F, doublet, page position or source rune is changed.

### Unexpected consequence: the 812-state coordinate is redundant on a real rune chain

When `x≠y`, write `a=y−x` and `k=28q+r`. Dual-number exponentiation yields

```text
a = 19^k = 19^r                         (mod29)
x = 13 k 19^(k-1)                       (mod29)
k mod29 = (19/13) x/a = 26 x/a          (mod29)
q = (r - 26 x/a) mod29.
```

Therefore, **given the previous observed rune x, the 28-way step r uniquely determines the next rune y and the full 812-unit logarithm k**. The extra q register is mathematically determined; it cannot independently encode another 29-way plaintext symbol. For an equal pair, `r=28` and the nonunit `q=x` is likewise fully determined.

The complete 812+29 code thus reduces, for a contiguous string, to exactly

```text
first = first original rune;
r_i = 28                  if C_i == C_(i-1)
    = log_19(C_i - C_(i-1) mod29) otherwise.
C_i = C_(i-1) + (r_i == 28 ? 0 : 19^r_i) mod29.
```

This is a **lossless GP29 differential-log transform with an in-band repeated-symbol code 28**, needing no secret and no separate sidecar. The order812 property becomes a convenient way to label overlapping pairs; it adds no cryptographic entropy or independent per-symbol key. This explains precisely why an arbitrary 812-state rotor hypothesis needs an *additional authored state update or secret*: the printed mathematical cardinalities alone do not supply it.

## Complete original-source test and positive controls

All original physical LP2 p0–p55 are tested unchanged. Physical p50 has no runes; the other **55** provide their own first visible rune. The original carries **32 words across physical page boundaries**, retained exactly because no original symbols or word delimiters are altered.

| Original measure | Exact result |
| --- | ---: |
| Original runes reconstructed | **12,956/12,956** |
| First-rune page seeds retained | 55 |
| Adjacent transitions encoded | **12,901** |
| Unit transitions (unequal neighbors) | **12,815** |
| Nonunit `r=28` repeats | **86/86** |
| Original ciphertext IoC | **0.03447839786450569** |
| Candidate `q` register IoC, 12,901 symbols | **0.034460269590302774** |
| Candidate `r` register IoC, 12,901 symbols | **0.035325030389447606** |
| Genuine solved clear p57 IoC, 95 runes | **0.06270996640537514** |

The only two obvious fixed **GP29 plaintext-producing registers**, q and r, remain far from normal native-GP prose concentration. Any *single secret permutation of their 29 output labels* preserves IoC and does not fix that deficit. Source-specific rekeying, nonlinear consumption, non-English language, compression or an entirely different cipher remain logically possible, but none is specified by the original artifacts.

The reproducible [read-only Node22 CommonJS source](../sims/lp2_dual812_fullring_nonunit_original_sft.cjs) enumerates all 841 input pairs, asserts unique forward/reverse codes and the exact q-redundancy formula for every unit, reconstructs all 12,956 original runes and all 86 repeats, and checks the complete 55-page raw register against the original. For a native positive, it takes the genuine **95 clear source p57 runes** (including **three literal F**) and plants them into the source-selected GP29 log-difference forward encoder; the inverse recovers **95/95** exactly. A separate **98-symbol** plant appends EA,F,EA and recovers **two** explicit repeat-escape sites, as well as the literal-F rune. These positive plants establish decoder correctness and respect the source GP alphabet. They are not evidence that the unknown ciphertext was generated by that encoder.

## Director decision

**Algebraic answer: yes, a complete reversible exception/restoration rule exists with no external sidecar. Cryptanalytic answer: it is only a lossless re-expression of the original GP29 stream.** It provides a concrete 29-symbol candidate transform but recovers no original plaintext. There is no manuscript-visible instruction selecting the `q` or `r` projection as plaintext, initializing an independent key stream, or combining this state with p15's matrix or p50's table. More 812-generator/key/phase sweeps would be parametrizing a source-unselected cipher.

Close #1181 on this exact bounded decision. Any reopening must supply an independent first-party consumer or authenticated nontrivial state rule and produce a held-out plaintext interval with exact reencryption.
