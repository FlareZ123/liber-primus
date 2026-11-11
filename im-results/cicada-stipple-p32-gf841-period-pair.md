# p57 cicada stipple -> p32 prime-index -> GF(29^2) period pair

**Status:** exact cross-artifact arithmetic and field identities; an intermediate source-path hypothesis, not a decryption.

## Original-image measurement

On original resources/liber-primus/74.jpg (LP2 p57), the central illustration crop x=350..2049, y=1900..3449 yields **574 eight-connected components** at every grayscale threshold tested (40, 80, 120, 160, 200). The two largest components have areas **1,027** and **12,821**; excluding these two visibly non-stipple structures leaves **572 small components**. At the natural image midline x=1200, the small components split **241 left / 331 right**, invariant across all five thresholds. The two large components sit on opposite sides of the midline.

The split counts are both prime:
- 241 is prime ordinal **53**.
- 331 is prime ordinal **67**.

The exclusion of the two large structures is visually motivated but remains an interpretation: including them changes the split to 242/332, which is not prime.

## The selected p32 positions

LP2 p32 contains 121 runes and is independently implicated by the 2016 signed tree image / 11x11 dimension relation. Using the prime ordinals as **zero-based** positions in its row-major 121-rune sequence selects offsets **53** and **67**:

| Quantity | Left | Right |
|---|---:|---:|
| Small-component count | 241 | 331 |
| Prime ordinal | 53 | 67 |
| p32 cell (zero-based) | (4, 9) | (6, 1) |
| Original GP-prime weight | 101 | 11 |

The selected cells are antipodal about the p32 center cell (5,5): their row and column coordinates sum to (10,10). Their offsets also satisfy 53+67=120 and 67-53=14=2x7. The seven-word opening sentence of the solved p57 Parable is LIKE THE INSTAR TUNNELING TO THE SURFACE.

The GP-prime-weight difference is 101-11=90, exactly the small-component split difference 331-241. This is not unique among arbitrary p32 pairs: three of the 60 antipodal pairs have a prime-weight difference of 90. Across all 11 unordered prime pairs summing to 572, however, (241,331) is the only pair whose prime ordinals sum to 120 and differ by 14. A random permutation of the fixed p32 prime-weight multiset would put a difference-90 pair at two fixed positions with frequency 78/7260 ~= 1.074%; this is a descriptive conditional diagnostic, not a discovery-wide p-value.

**Indexing caveat:** the one-based alternative positions (52,66) have GP-prime weights (29,53), difference 24, not 90. The zero-based convention is natural for the canonical array and pixel coordinates, but is still a convention that must be justified in any proposed human solve path.

## A source-selected GF(29^2) period pair

The p3 red triad has GP-prime weights [13,23,2], giving

\[
13+23u+2u^2=0 \pmod{29},\qquad u^2=8+3u.
\]

The p3 element u has multiplicative order **840** in GF(29^2). Reducing the two selected p32 prime weights modulo 29 gives the ordered left-to-right field element

\[
z_{LR}=14+11u=u^{50},\qquad \operatorname{ord}(z_{LR})=84.
\]

Reversing the image direction gives

\[
z_{RL}=11+14u=u^{588},\qquad \operatorname{ord}(z_{RL})=10.
\]

Exact checks include zLR^3=2, zLR^42=-1, and zRL^5=-1. The product of the two orders is 84x10=840, the order of u; however, their multiplicative product has order **420** (lcm(84,10)), not 840. A product mask built from the two clocks therefore does not traverse all 840 nonzero field elements.

The period lengths have independent source-sized counterparts:

- 84 = 51 + 33: p53's original red span has 51 runes; p32's first printed clause has 33.
- 10 is the marked ten-dot punctuation size.
- 127 = 84 + 43, where 43 is the first GP-prime weight of the red p57 heading PARABLE.
- Separately, 82 = 51 + 31, where 31 is the total number of thirteen-dot marks; and 574 = 7x82, where 7 is the word count of the opening Parable sentence.

This yields a compact, source-derived candidate architecture: the p57 illustration selects a pair of opposite p32 cells; their GP-prime weights define two direction-ordered GF(29^2) elements with periods 84 and 10; those periods align with the p53 red span, p32 clause, ten-dot marks, and the existing 51x127 register shape. It is a plausible selector, not proof that the creator intended these operations.

## Bounded original-cipher test

The existing source-sized register hypothesis retains the first two original runes and groups the remaining 12,954 runes into **51x127 adjacent GF(29^2) pairs**. The 256-byte base-60 grid is divided by the source-marked (X-24)^2 factor to obtain 127 quotient pairs Q[j]. The p53 red rune indices are R[r].

Two deterministic uses of the new field pair were tested on the unchanged original payload:

1. **Direct two-clock mask:** K[r,j] = zLR^R[r] * zRL^j * Q[j], decoding with either C-K or C+K.
2. **Row-reset feedback:** S[r,0] = zLR^R[r]; S[r,j+1] = zRL*S[r,j] +/- Q[j], decoding with either C-S or C+S.

All six variants exactly re-encrypt the original and invert a 12,954-rune native-GP positive-control plant. None produces language:

| Measure | Raw payload | Best of six variants |
|---|---:|---:|
| IoC | 0.03447896 | 0.03454249 |
| Shakespeare-GP trigram score (nats/rune) | -13.28405598 | -13.23700365 |

The best decode is only 0.0471 nats/rune above raw ciphertext. The worst minimum among 300 same-length native-GP control windows is -8.40039103 (Emerson); the best original decode remains **4.8366 nats/rune below** that floor. This is a bounded negative for these two fixed masks/state updates, not for every nonlinear or stateful use of the selector.

## Interpretation and next discriminant

The strongest result is the exact **241/331 -> 53/67 -> p32 weights 101/11 -> GF(29^2) periods 84/10** chain and its independent size relations. It does not recover plaintext, an authentic key, or a complete mechanism. Its main vulnerabilities are the exclusion of the two largest image components, the zero-based index choice, and the retrospective combination of otherwise separate source counts.

A productive next test must use the pair as a source-fixed selector in a materially different, historically motivated operation; do not repeat direct additive masks or the already-negative p53-red row-reset variants. The 84/10 pair may be useful to the ongoing p32 direction/address and 51x127 register investigations, but should remain a hypothesis until it predicts held-out original plaintext.

**Reproducer:** sims/cicada_stipple_p32_gf841_period_pair_sft.py (original image component counts, prime-index mapping, field orders, source arithmetic, and the bounded 51x127 tests).
