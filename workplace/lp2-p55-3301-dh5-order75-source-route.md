# Signed Diffie–Hellman base 5 and original cuneiform 3301: a complete 75-state candidate for p55

**Agent 2, 13 November 2026. Classification: exact source-numeric conjunction and a bounded failed direct plaintext inverse. No new LP2 plaintext, authenticated p55 key, intended generator, or destination is recovered.**

## Why the new alignment could affect a solve path

The historically signed 2013 Cicada TCP/Diffie–Hellman teaching example uses **base 5** under a different modulus, 23. The original physical LP2 p33–39 ornament independently prints Babylonian numerals for **1033 and 3301**, with the second value matching Cicada's creator number. Physical p55 has **76 original GP runes**; its first is a lone `NG` rune continuing the preceding page's final printed word, leaving exactly **75 complete-body runes** within sixteen self-contained words.

A distinctive arithmetic property emerges **without choosing a secret exponent**:

```text
5^75 mod 3301 = 1;
5^25 mod 3301 = 1726;
5^15 mod 3301 = 1476.
```

Since the only prime factors of 75 are 3 and 5, these inequalities prove **ord_3301(5)=75**. The complete orbit `1,5,25,125,625,3125,2421,2202,...` consists of precisely 75 distinct states and therefore indexes every one of the 75 self-contained p55 body positions exactly once.

**Independent arithmetic discriminator within the actual clue set:** the companion cuneiform number **1033** is also prime, but `ord_1033(5)=1032`; it does not generate a 75-position cycle. Of the ordinary prime bases `2,3,5,7,11,13,17,19,23,29` tested under modulus3301, **only base5 has order75**. This uniquely distinguishes the historically attested generator among those small prime alternatives and one of the two authentic cuneiform moduli. It remains retrospective numerical evidence and cannot establish an intended cross-round transfer.

This is a potentially human-playable *candidate key schedule*: a previously demonstrated Cicada operation (modular exponentiation with base5), an actual runic-book numeral (3301) and an independent physical word-boundary length (75) select one finite full cycle. The strongest objection is serious: the signed example never tells solvers to move base5 to modulus3301, and p55 appears in a separate visual chapter from the cuneiform ornament. The alignment was recognized retrospectively. **Neither the arithmetic nor the length match authenticates the transfer as the intended operation.**

## Original ciphertext inverse, with a genuine planted plaintext control

The exact existing source p55 stream is `[carry21, ...75 body symbols]`. Fix the orbit `x_i=5^i mod3301`, `i=0..74`. Two concrete 29-symbol key serializations, each possible without guessing another key, are `x_i mod29` and `floor(x_i/29) mod29`; test the ordinary GP29 additive signs. For origin sensitivity, try only the frozen source exponents **0**, **1** and **1033** (the second cuneiform number). This gives 12 complete, bijective direct inverses with no unknown language scoring in the key selection.

The original 75-body GP29 IoC is **0.03855856**. All 12 literal orbit shifts remain between about **0.0295 and 0.038**, with no sustained coherent GP29 text. For the source-natural exponent0 residue mod29:

- `C−(x mod29)`: **IoC 0.03387387**, opening `A X X IA EA A F NG I J S C H T OE U F H E B M U NG ...`;
- `C+(x mod29)`: **IoC 0.03027027**, opening `Y A G T TH IA EA B L P Y EO AE C W A M Y NG ...`.

A separately sourced, already-clear **75-GP-rune physical p57** plaintext is artificially enciphered under every fixed orbit pad, then recovered **75/75 symbols** by the same inverse. Every one of the twelve original ciphertext candidates also forward-reencodes the complete original 75-body input exactly. These validations establish correct direct inverses, but not historical key correctness.

**Predecessor-exclusion sensitivity:** The source p55 body contains **one** identical ciphertext-predecessor event against its carried p54 initial rune. Reserve a rank28 symbol for this exact doublet, and map each of the other 74 observed nonrepeat outcomes to a rank in the 28 available nonzero modular differences. Applying the same 75-state source orbit as a rank28 additive key, in the two declared residue/quotient projections, both signs, and the same three origin exponents gives **12** further complete inverse candidates. Their source-native GP IoCs range **0.03099099–0.04072072** and every one remains unreadable. Each 74-symbol invertible rank-map round-trips the original predecessor ranks exactly, preserving the single source doublet as an unclaimed marker. This is a new state-preserving consumer for the source’s 0.67%-level no-repeat feature, but there is no source-selected literal marker semantics and no evidence of a true GP28 decoder.

The exactly 75 distinct residues independently define a fixed *sorting transposition*: sort the original orbit numerically and reorder the 75 runes by the resulting index permutation or its inverse (and reversal). The four complete original-source permutations preserve every symbol exactly and have **predecessor-GP29-difference IoCs between 0.02887819 and 0.03628286**, with no readable instruction after differencing. Pure transposition alone cannot repair the original almost-uniform GP29 one-letter inventory; the difference test was a narrow historically ordinary attempt to remove a feedback stage.

## Direct DH-group representation, without arbitrary byte projection

A more mathematically faithful DH consumer is **cofactor projection** of each canonical GP *prime weight* into the unique order-75 subgroup of GF(3301)×. The full multiplicative group has order3300, so `u(g)=GPprime(g)^44 mod3301`, since **3300/75=44**. Then compute the original source-selected discrete logarithm `L(g)=log_5(u(g)) mod75`. This maps each source GP rune into a 75-state group exponent, permitting a direct candidate group cipher `L(C_i)=L(P_i)±(i+e) mod75`, with no arbitrary residue projection.

The map itself has an exact obstruction: **29 GP symbols collapse to only 25 distinct exponent labels**. In particular `W,EO,NG,A` all project to exponent31, and `OE,D` to exponent2. Thus it cannot encode all29 GP symbols losslessly without an additional side channel. Even ignoring that collision and asking the weaker necessary question, the 75 original p55 body glyphs have the following counts whose inverse shifted exponent belongs to the source's 25-label set:

| Exponent origin e | subtract i+e | add i+e |
| ---: | ---: | ---: |
| 0 | **22/75** | **31/75** |
| 1 | **24/75** | **15/75** |
| 1033 | **25/75** | **21/75** |

A genuine plaintext rune would require membership at **every one of 75 positions**, independent of how the two ambiguous label bins were resolved. The strict original-source membership rule therefore rules out the six direct cofactor-projected DH orbit decoders completely; it requires neither a linguistic scorer nor a guessed plaintext or ciphertext key. An independent more complicated group serialization remains outside this direct model.

## Decision and next useful input

The arithmetic **order75** correspondence should be retained as a distinctive, source-derived but *not authenticated* possible clock or permutation for physical p55, avoiding duplicated discovery by the agent population. The simplest GP29 additive/quotient pads, GP28 predecessor rank, orbit sorting plus first differencing, and direct GP-prime cofactor-projected DH cipher all have negative original readouts. The new orbit does **not** justify offset search, novel exponent guesses, unbounded key transforms or treating these candidates as plaintext.

A legitimate successor needs an independent Cicada instruction connecting the cuneiform modulus to its prior base5 operation, and specifying how orbit residues generate a GP cipher or positional ordering. If such a source appears, the 75-state cycle provides a complete reproducible primitive with a high-value target, the final unknown 75-rune body before the solved AN END and PARABLE.

[Single runnable Node22 source-input SFT](../sims/lp2_p55_signed_dh5_mod3301_orbit75_sft.cjs) asserts all 76 original source positions, the exact 75 distinct orbit states, direct inverse/plant recovery, all 12 rank28 predecessor variants and both sort permutations; no input file modifications. [Successful Windows manual CI run 43511210946](https://github.com/FlareZ123/liber-primus/actions/runs/43511210946). Source antecedents are the [original cuneiform numeric motif audit](issue344-cuneiform-historical-template-gate.md) and the [2013 signed DH teaching example](audio-761-original-id3-frame-inventory.md#terminal-headings-and-a-conditional-761dh5-orbit-12-november-2026).
