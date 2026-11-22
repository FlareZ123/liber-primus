# P33 dual word-map family audit: fixed tuples survive, prospective grammar fails

**Agent2, 19 November 2026. Director task #1835. Classification: adversarial negative on the p33 map as a predictive instruction engine; preservation of the exact fixed-tuple observations.**

## Decision

The published p33 upper/lower word-map coincidences are reproducible at their stated coordinates, but the selector grammar is underdetermined. A finite family containing the same low-description operation classes used in the published reconstruction reaches every word position of both maps. Training on the first solved-p57 clause does not select the expressions or ordering needed for the withheld third clause.

Accordingly:

- preserve the exact p33 tuple coincidences as post-selected structural corroboration;
- do not use the p33 word map alone to read a new p57-style instruction or to select p55 prospectively;
- preserve downstream p55, READ-center, p28, and other evidence only to the extent that they have independent selectors;
- treat the SHED power construction separately, because its lexical identity was recognized after solved p57 was already available.

The Windows Node 22 reproduction passed in workflow run **44469256240**.

## Upstream premise and withheld test

The published reconstruction uses the authenticated state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4
```

and p33's two black bodies as a 21-word upper map and 28-word lower map. Its reported position formulas include direct atoms, sums and differences, an H coordinate, a square, and p50 output interpretations.

The adversarial test freezes solved-p57's first clause as training:

```text
TUNNELNG TO THE SURFACE
```

and withholds the entire third clause:

```text
FIND THE DIUINITY WITHIN AND EMERGE
```

The training pass may inspect p33 and the fixed state. It may not use the held-out words to decide that the next positions should be `p-e`, `e*e`, `A+K`, and `p+K`, or to decide their lexical order.

## Charged selector family

The smallest symmetric family used here contains every operation class already needed by the published position formulas, before the separate SHED exponentiation claim:

- each of the nine named state atoms;
- modular negation of each atom;
- raw pairwise addition and multiplication;
- ordered subtraction;
- both H coordinates modulo29;
- one-based and zero-based map origins;
- forward and reverse map orientation;
- four already-used value consumers at a selected map word: identity, p50 low60, p50 base59, and p50 base60.

This gives **297 arithmetic expressions**, **686 legal upper-map selectors**, and **878 legal lower-map selectors**. These selectors cover **all 21 upper cells** and **all 28 lower cells**.

The published coordinates themselves are highly non-unique under this family:

| Published position | Cell | charged selectors landing there |
| --- | ---: | ---: |
| upper `e` | 3 | 30 |
| upper `b+K` | 17 | 34 |
| upper `H(e,q)[1]` | 7 | 29 |
| upper `e²` | 9 | 39 |
| upper `A+K` | 10 | 40 |
| upper `a` | 6 | 30 |
| lower `g` | 5 | 31 |
| lower `p-e` | 20 | 33 |
| lower `p+K` | 25 | 35 |

These counts are expression/convention multiplicities, not probabilities. They show that the map does not provide its own selector rule.

## Exact tuple controls

The original exact-tuple observations reproduce.

Under **one-based forward** coordinates:

```text
upper -> physical p33, page word3, rune offset10
lower -> physical p33, page word26, rune offset99
```

and each is the sole manuscript window satisfying its complete published fixed tuple.

However, zero-based forward coordinates also produce a sole shifted p33 hit for each tuple:

```text
upper -> physical p33, page word2, rune offset2
lower -> physical p33, page word25, rune offset94
```

Reverse orientation gives no exact tuple hit in either origin convention.

Thus the tuple uniqueness supports p33 as a structured receiver after the coordinate formulas and origin are supplied. It does not select those formulas or the one-based origin.

## Matched-window family control

A broader matched control asks how many distinct solved-p57 GP0 values are reachable from each candidate window under the full charged selector family and the frozen four-output palette.

For the **1,833** 21-word windows:

- p33 upper scores **9** distinct target GP0 values;
- the maximum score is **11**;
- **61/1,833** windows score at least as high as p33.

For the **1,474** 28-word windows:

- p33 lower scores **6** distinct target GP0 values;
- the maximum score is **11**;
- **1,022/1,474** windows score at least as high as p33.

This control is intentionally generous to the proposed grammar. It shows why exact post-selected tuples can look singular even though the operation family that generated them is broad.

## Lexical-number ambiguity

The 16 solved-p57 word slots reduce to 15 distinct lexical types because THE appears twice. Those 15 lexical types reduce to only **14 distinct GP0 values** because:

```text
GP0(TO)  = 19
GP0(OWN) = 19
```

A GP0-valued map readout therefore cannot distinguish TO from OWN without a separate lexical selector. This directly limits claims that the numerical map itself reconstructs every lexical slot.

## State-role permutation and withheld-clause result

Charge all **9! = 362,880** permutations of the numeric state multiset over the named roles, all four upper-map origin/orientation conventions, all four lower-map conventions, and both ordered forms of each H sum/difference family.

The training clause leaves:

```text
384 total configurations
48 configurations under the published one-based-forward map convention
```

Now grant the proposed reconstruction an advantage: after training, supply the exact held-out formulas `p-e`, `e*e`, `A+K`, and `p+K`, plus the established THE→FIND and TUNNELNG→AND p50 edges. Even with those formulas supplied after the fact, the held-out clause leaves:

```text
4 total configurations
2 under the published one-based-forward convention
```

The two published-convention state assignments differ by swapping the values carried by `a` and `B`:

```text
a=6,  B=19
a=19, B=6
```

The apparent factor of two beyond that is the redundant ordering of the H sum operands.

This is an ambiguity census. It is not a prospective prediction, because the first clause never tells the solver to introduce `p-e`, `e*e`, `A+K`, and `p+K` next, nor does it provide their word order.

## Consequence for the p55 route

The chain

```text
FIND THE DIUINITY WITHIN
 -> center(DIUINITY)=A=8
 -> map word8 = RISE
 -> GP0(RISE)=47
 -> p50[47] = 75/76
 -> p55 local/physical rune counts
```

remains an exact conditional chain once the p57-style p33 map readout is granted. #1835 blocks treating the chain as an independently predictive p55 selector because its first instruction is part of the failed post-selected grammar.

Independent p55 evidence, including its own source geometry, rune counts, and separately selected WE MUST SHED route, remains available on its own merits.

## SHED boundary

The audit intentionally excludes the later SHED completion:

```text
K^A = 2^8 = 256
A^K = 8^2 = 64 = GP0(SHED)
```

That construction was recognized with the solved lexical slot already known. It cannot rescue the withheld-word test and should remain explicitly post-discovery.

## Reproduction

```text
node sims/lp2_p33_dual_wordmap_family_audit_sft.cjs
```

The SFT uses the canonical LP2 transcription, corpus, and p50 grid, reconstructs the p33 bodies, charges the complete family above, enumerates all same-length manuscript windows, and exhausts the state-role permutations. Windows Node 22 workflow **44469256240** passed on commit `7617ff387d679d3352d886fe4e4bfeded1bdea10`.

## Research decision

The p33 word-map route is useful as a compressed description of several exact coincidences on an independently selected page. It does not currently provide a deterministic human solve procedure from source-visible clues to unseen plaintext. Future use should require an independent source rule that chooses the map coordinate expression and consumer before the target word is opened.