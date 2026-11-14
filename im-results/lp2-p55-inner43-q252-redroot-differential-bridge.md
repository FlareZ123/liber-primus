# Shared p39 red-root slope between p55 interiors and p50 Q252

**14 November 2026, Agent21. New source-original algebraic congruence, not plaintext.** The strict 43 rune interiors of LP2 physical p55 and the 252 coefficients of the source-conditionally factored pp49–51 numeric table have the **same formal derivative at the independently visible p39 red-triad double root 24**. Their polynomial difference modulo that p39 quadratic is the constant GP29 residue **9**.

## Exact source operations and equality

- The original physical p39 red triad has GP29 indices `[27,5,15]`, forming the **conditionally adopted ascending polynomial** `G(X)=27+5X+15X²=15(X−24)² mod29`. This factor independently divides the original pp49–51 256 table residues.
- The canonical pp49–51 grid, under its existing conditional base60 and GF29 polynomial reading, is divisible by `F=H×G`, `H=3+26X+24X²`, giving the *fixed 252-slot quotient* `Q`. Read its 252 coefficients in ascending polynomial degree, preserving the formal first zero of the original descending division.
- The printed page p55 contains **76 runes in 17 page-local word segments** of lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Its **43 strict word-interior runes** are `P`'s ascending-degree coefficients, an independently discussed p57 circumference reading.

Original source arithmetic yields:

| Evaluations at original p39 factor root | P55 `P` | Table quotient `Q` |
| --- | ---: | ---: |
| `value at X=24` | **18** | **9** |
| `formal derivative at X=24` | **22** | **22** |
| `remainder modulo G` | **12+22X** | **3+22X** |

Therefore **`P(X)−Q(X) ≡ 9 mod G(X)`**. This is exact equality of the two **linear** GF29 remainder polynomials, after removing one common constant. No secret optimization, key fitting or unknown English is used. It is a stronger identity than a generic equality of evaluations at one field point because the source's double root tests the *derivatives*. The older p55 finding `P(24)=18`, `P(18)=23` and `P(22)=22` remains unchanged.

## Why this could matter and why it is not a decipherment

The p39 red glyphs select a concrete repeated-root polynomial; the p57 *shed circumferences* text motivates but does not force p55 word-interior extraction; H and the quotient come from an explicit conditional algebraic model of the original pp49–51 printed cells. The signed 2013 `3301→3QO` demonstrates ordinary most-significant-first BASE29 **without selecting the ascending polynomial orientation**. These choices were developed with knowledge of the manuscript, so the slope match can be an ordinary 1-in-29-type coincidence after many trials. In particular, **the GP29 constant 9 is not an authenticated letter of new plaintext** and should not be promoted to a discovered cipher key.

A human-directed next test would require an *independent printed or historically archived operation* explaining how the p39 repeated root transports a constant offset or algebraic state between the table and p55 words. Without that consumer, the new relation does not select a reversible transformation and should not justify unconstrained pad, phase, sign or key sweeps.

**Independent execution:** [manual Node22 Actions 43638031676](https://github.com/FlareZ123/liber-primus/actions/runs/43638031676) completed **success** after checking the original source files and all assertions.

**Reproducer:** [single-file exact-original Node22 SFT](../sims/lp2_p55_inner43_q252_redroot_bridge_sft.cjs); inputs are the pinned `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json`. The code asserts the original 76/43 rune segmentation, the quotient's exact zero division remainder, the p39 root, both remainders, derivative equality and the already known p55 value/orbit checks. Read alongside the [p55 bridge source limitations](p55-inner43-base29-polynomial-bridge.md) and the [historical H/G endianness caveat](2013-base29-gf29-grid-factor.md). **No unknown-page plaintext, complete key or final destination recovered.**
