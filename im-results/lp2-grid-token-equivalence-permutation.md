# Literal p49–51 token equivalence: canonical occurrence permutations and terminal inverse

**Agent12, 25 November 2026 — Director #2865. No unknown plaintext, authenticated key or continuation.** Literal equality removes the base59/base60 choice, but does not identify an order or consumer.

## Distinct question and source

Use the 256 literal two-character tokens in printed 32×8 row-major order, not decoded numbers. The 161 classes have multiplicities: 92 singleton, 49 double, 14 triple, 6 quadruple. The last three physical pages contain 76+85+95=256 runes; the first is unknown, p56 has an independently verified prime-minus-one/F-hold solution, and p57 is clear. The equality-count match 161=76+85 and 95 repeats=95 clear runes is already bounded by the [static repeat-token lookup negative](lp2-grid-firstrepeat95-parable-static-source-gate.md). #2626 [ordered row-rank and split channel](lp2-p50-ordered-row-enumerative-rank-gate.md) computes numeric ranks, #2361 tests a conditional numeric graph path, and #2527 searches a typed verification object; none establishes an equality-only order. The [stable numeric rank whole-word transport](lp2-p50-256numeric-rank-wordorder-gate.md) already tests lexical value sorting as a whole-word permutation. Do not repeat that receiver.

## Historically available occurrence-matching rule

Burrows & Wheeler, *A Block-sorting Lossless Data Compression Algorithm*, SRC Research Report 124, 10 May 1994 ([original report](https://www.cs.ucdavis.edu/~gusfield/spring06readings/BWTOriginal.pdf), §2), gives an exact predecessor map matching the kth occurrence of a symbol in the last column L to its kth occurrence in sorted column F. Its inverse also requires a primary row index. This is a period-available algorithm, not evidence that Cicada selected it.

Treat each two-character token as one indivisible symbol and take the printed table as L. With the literal lexicographic order (ASCII digits, uppercase, lowercase, no numeric conversion), stable matching produces permutation T. The report's example `abraca → (caraab,1)` gives T=(4,0,5,1,2,3), and the implemented inverse recovers the example exactly. For the original table, T's cycle lengths are **188,24,16,12,7,3,3,2,1**. No single walk visits all 256. Because the original has singleton symbols, any putative input string with its histogram is primitive: it cannot be a nontrivial repetition. Its sorted rotations must be distinct, and the genuine cyclic predecessor permutation must form one 256-cycle. The original table cannot be the ordinary cyclic BWT last column under this alphabet order, regardless of primary row. Reconstructing and forward-transforming all 256 starting rows confirms zero exact literal-table returns.

If instead equality classes are ordered by their first appearance, the matching permutation has cycles **94,64,39,34,8,6,4,2,2,1,1,1**. In particular the first source position is necessarily fixed by first-occurrence matching. The same primitive-string argument excludes it. A different independently specified alphabet, multiple blocks, bijective variant or a separately supplied consumer would be another hypothesis; there is no source selection for these.

## Equality alone does not specify a permutation

Two equally deterministic order rules requiring only equality and the printed direction are:

- Visit each class in first-appearance order, output all positions in that class in printed order.
- Visit the same classes by first occurrence round, then second occurrence round, then third and fourth, skipping exhausted classes.

Both return a permutation of the 256 labelled cells, both invert exactly, and neither assumes a numerical radix. They agree at only **2/256 output positions**. A third canonical equality-only map advances each position to the next occurrence of its own token, wrapping within its class; its inverse uses the previous occurrence. This has 92 fixed cells and disjoint cycles of lengths 2,3,4, with order12. Thus the equivalence relation supports several concrete but incompatible reversible maps, and no first-party instruction chooses among them.

## Actual terminal receiver and exact ambiguity

The simplest typed consumer applies each map (read and inverse) to all 256 p55–57 runes, leaving p56's known input to the authenticated decoder and p57's clear text intact. This is deliberately a direct transposition-only hypothesis; it is not an assertion that a terminal transposition must preserve known pages under every possible layered cipher.

| Fixed permutation | p56 ciphertext matches, read/inverse (85) | p57 clear matches, read/inverse (95) |
|---|---:|---:|
| First-occurrence grouping | 6 / 3 | 3 / 6 |
| Occurrence rounds | 5 / 2 | 4 / 7 |
| Literal lexical stable (comparison) | 6 / 3 | 4 / 5 |
| Next equal cyclic | 31 / 31 | 38 / 38 |

All eight candidates are incompatible with independently known terminal data. Each forward/reverse positional replay is exact, a mathematical property only.

Grant every possible independent within-class permutation, far beyond the fixed next-occurrence map. There are exactly `∏ m!` = **8430527379596857675529996470321152** distinct labelled positional permutations before considering the known suffix. Of these, **49,152** preserve all 180 actual known terminal runes, but they yield **384 distinct p55 rune tapes**. Proof: if known output values are fixed, each class's remaining unknown p55 outputs must be a permutation of that class's original p55 value multiset. Multiply the multinomial counts across classes. Seven variable classes contribute six factors of two and one of six; only 15 of the 76 p55 rune positions can vary. Labelled permutation multiplicity is calculated separately by matching known suffix occurrences and freely assigning remaining labelled cells.

Enumerated **all 384** distinct p55 candidates with their exact source positions and rune outputs. With a smoothed trigram model fitted only on 2,391 solved LP1 native runes, best original candidate scores −3.409433 nats/rune; original p55 scores −3.486620; independent clear p57 scores −2.682543. None is a coherent full p55 reading. The finite language comparison is descriptive, not an all-language proof; the exact 384-tape ambiguity is independent of scoring. In particular, even retaining both known pages perfectly does not determine which of these 384 tapes to use.

## Decision

Retire the ordinary cyclic BWT receiver under the two specified alphabet orders, the three direct equality-derived terminal maps, and equality-only within-class transport as a unique terminal selector. Token equality is genuine original information; it does not independently identify a cryptographic operation, source-selected class order, primary row or downstream key. Do not search new arbitrary permutations or numeric maps without independent instructions.

[Standalone read-only SFT](../sims/lp2_grid_token_equivalence_permutation_sft.cjs) · [complete original maps, every p55 candidate, historical example and exact counts](lp2-grid-token-equivalence-permutation-output.json). Actual connected JS execution against checked-in canonical inputs; no standalone CI claim.
