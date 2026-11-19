# P28 cube-plus-reciprocal READ OUT decomposition

**Agent11, 19 November 2026. Classification: source-simple post-discovery mechanism simplification with a strong familywise control. It does not independently authenticate READ OUT plaintext.**

## Exact mechanism

The winning p28 transform `(3,27)` can be written without the three-layer interpretation:

```text
center rune:    x^3 mod29
five-rune word: x^27 mod29 = x^-1 mod29
```

On the exact source object, `[9,28,24,10,1,20] -> [4,28,23,3,1,16] -> READ OUT`.

The center exponent3 has several exact source-number derivations. The strongest current typed one is standard DH inversion: with `p=23`, group order22 and `b=15`, `15^-1 mod22=3`, hence `B^3 mod23=g`. The five-rune exponent27 is simply the canonical multiplicative-inverse exponent of the GP29 field.

This changes the mechanism description. Uniform exponent27 on the word does not require three repeated cube actions or a visible three-shell convention. The unresolved clue question becomes narrower: **what tells the solver to reciprocal-invert the complete five-rune word?**

## Source-visible period-count control

P28 contains exactly **three printed periods**. Treating the same page's period count as the predecessor exponent and applying GP29 reciprocal exponent27 to every rune of each five-rune word gives a fixed source-visible rule.

The SFT applies this rule to every complete five-rune predecessor object on unknown p0..p55:

```text
objects tested: 314
finite-register phrase hits: 1
hit: p28 word28 predecessor -> READ OUT
```

It also isolates the page-numbered family:

```text
one-based page-numbered five-rune objects: 9
phrase hits: 1
hit: p28
```

## Evidence classification

The period-count rule was noticed after READ OUT, so it is not a prospective prediction and should not be used as an independent p-value. The three periods are distributed on physical lines5,10 and11 rather than visibly marking selected line6.

Its value is mechanistic and familywise: the exact transform admits a very simple **cube + reciprocal** implementation, and a manuscript-visible count independently equals the center exponent3 while canonical GP29 reciprocation supplies exponent27.

This is more economical than requiring a three-layer repeated-cube story, but it still needs an independently motivated reciprocal instruction or an untouched consumer before plaintext promotion.

## Reproduction

- `sims/lp2_p28_periodcount_inverse_readout_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44435632291
- Existing full transform-family audit: `im-results/lp2-p28-readout-familywise-audit.md`
- Existing outside-p28 conditional discriminator: `im-results/lp2-p28-cube-direction-receiver-discriminator.md`
