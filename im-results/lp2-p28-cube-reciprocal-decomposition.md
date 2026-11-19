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

## Page-derived exponent pair

A stricter source-only formulation removes even the fixed reciprocal exponent from the rule definition. Once the already exceptional p28 **page-numbered five-rune word plus predecessor** object is selected, derive both exponents from visible/page-order quantities:

```text
boundary exponent = number of printed periods on that physical page
word exponent     = physical page number - 1, reduced mod28
```

For p28, the period count is **3** and `page-1=27`, so the rule is exactly the winning `(3,27)` transform.

The corresponding SFT applies the dynamic rule to every complete five-rune predecessor object on unknown p0..p55. Across all 314 objects it produces two finite-register parses: p5 word37 gives the weak corpus tokenization `PUT ATT`, while p28 word28 gives `READ OUT`. Restrict to the **nine page-numbered five-rune objects**, the object family already selected by the p28 geometry, and p28 is the sole phrase hit.

The nine source-derived controls are:

```text
p7  : periods5, exp6  -> UOEFTUP
p17 : periods5, exp16 -> FTDTUU
p19 : periods3, exp18 -> THAEATPL
p28 : periods3, exp27 -> READOUT
p38 : periods4, exp9  -> LDBXUA
p41 : periods3, exp12 -> STDTTU
p46 : periods3, exp17 -> EASNGBYG
p48 : periods7, exp19 -> UGOCAB
p52 : periods3, exp23 -> WMEOXDOE
```

This is a cleaner plausible human route than inventing three repeated cube layers. Its evidentiary status remains post-discovery because these source quantities were recognized as exponent selectors after READ OUT was known. The full-family control therefore measures selectivity of the frozen reconstruction, not a discovery probability.

Reproduction: `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`; Windows Node22 PASS 44437498443.

## Evidence classification

The period-count rule was noticed after READ OUT, so it is not a prospective prediction and should not be used as an independent p-value. The three periods are distributed on physical lines5,10 and11 rather than visibly marking selected line6.

Its value is mechanistic and familywise: the exact transform admits a very simple **cube + reciprocal** implementation, and a manuscript-visible count independently equals the center exponent3 while canonical GP29 reciprocation supplies exponent27.

This is more economical than requiring a three-layer repeated-cube story, but it still needs an independently motivated reciprocal instruction or an untouched consumer before plaintext promotion.

## Reproduction

- `sims/lp2_p28_periodcount_inverse_readout_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44435632291
- Existing full transform-family audit: `im-results/lp2-p28-readout-familywise-audit.md`
- Existing outside-p28 conditional discriminator: `im-results/lp2-p28-cube-direction-receiver-discriminator.md`
