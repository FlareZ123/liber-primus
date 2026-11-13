# All-secret p15–22 GP29 nonic key recovery from single-rune words

**Agent 12, 13 November 2026. Decision: bounded original-cipher negative, including a reversible repeat-avoiding model.** No previously unknown LP2 plaintext, key or creator-selected mechanism is recovered.

## Concrete source-to-plaintext hypothesis

The original p15 visual chapter begins with nine red runes. Independently, the printed 32×8 grid on pp49–51 has the exact degree-nine GF29 factor

\[
N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11.
\]

A source-relevant question is whether a nine-state recurrence keyed by this polynomial enciphers a chapter. No original Cicada text orders the solver to combine these two source features, but a **secret-state recovery attack** can answer the proposed model without blind key hunting.

The original physical p15–22 chapter contains 1,903 GP29 runes. After its first nine source-red runes, the unmodified 1,894-rune body has exactly **18 complete, printed one-rune words** at body offsets

    126,171,269,394,530,536,564,605,621,746,862,1021,1087,1139,1182,1641,1707,1724.

If original English GP word boundaries are preserved, every such plaintext word is conventionally one of **A, I, O**, GP indexes 24, 10, 3. This explicit plaintext constraint allows archaic O; it would be invalid for abbreviations, edited word boundaries, synthetic-language plaintext, arbitrary null symbols or an additional word-transposition layer.

## Exact recovery of all secret states for the direct cipher

Consider any additive GP29 LFSR cipher with characteristic polynomial N and **any** of its 29^9 initial states. At the first nine original one-rune word positions, an A/I/O plaintext gives three alternatives for each corresponding keystream symbol. Their nine recurrence-state row vectors are linearly independent over GF29. Thus each of the **3^9 = 19,683** possible first-nine plaintext assignments defines **one unique secret initial state**. Every secret key that could decode the first nine one-rune words is necessarily represented. Hold the remaining nine original one-rune words out of state recovery.

| Polynomial direction | Candidate nine-state keys | Keys decoding all 18 one-rune words | Fewest held-out errors |
| --- | ---: | ---: | ---: |
| Forward monic factor N | 19,683 | **0** | **4** |
| Monic reciprocal N | 19,683 | **0** | **3** |

The additive sign and starting phase cannot rescue an unsuccessful seed: the seed is wholly arbitrary, the recurrence is invertible, and the negative of a valid key state is another valid key state.

## Second complete model: nonzero transitions and repeat escapes

The original ciphertext has unusually few identical adjacent GP runes. A distinct lossless model makes that feature part of encryption, using the source-native multiplicative group of GF29. Let the first ciphertext predecessor be 0 and let g=15 be a primitive root modulo29. For plaintext rune P from 0 through27, produce

\[
C_i=C_{i-1}+15^{(P_i+K_t)\bmod 28}\pmod{29}.
\]

For GP rune EA (index28), emit C_i=C_{i-1} instead. The hidden K_t follows the same source N-recurrence in GF29; its effective exponent is K_t modulo28, so **the secret key value 0 and 28 are both admitted** whenever exponent zero is needed. Test both clocks: advance on every rune, or do not consume a key symbol for the EA repeat event, as the authentic p56 totient decoder has a separate literal exception. Test each clock with the forward and reciprocal recurrence.

On the complete authentic 1,894-rune chapter there are **10 repeat escapes**, and **none** of its 18 one-rune words is an escape. The nine first-word A/I/O assignments, including every GF29 0/28 alias, generate exactly **34,992 potential initial states per model**. All those states are tested against the remaining nine original singleton words.

| GF29 nonic exponent cipher | All candidate secret states | Survive all 18 words | Fewest held-out errors |
| --- | ---: | ---: | ---: |
| Forward, every-rune clock | 34,992 | **0** | **3** |
| Forward, skip-repeat clock | 34,992 | **0** | **3** |
| Reciprocal, every-rune clock | 34,992 | **0** | **2** |
| Reciprocal, skip-repeat clock | 34,992 | **0** | **3** |

This model is capable of suppressing runic doublets and is reversible for arbitrary GP29 plaintext. The direct key-recovery result excludes these four particular architectures under the stated source word assumption. The original manuscript does not select the exponential rule, an EA escape, or the generator15 hypothesis.

## Positive recovery controls and reproduction

The [complete CommonJS key-recovery script](../sims/lp2_p15_nonic_singleton_allseed_sft.cjs) accepts the unchanged 12,956 source unknown runes, canonical original word boundaries, and printed 256-byte grid. It confirms N as an actual factor of the grid polynomial. For every one of the six tested cipher/clock variants, a full **1,894-rune positive plant** is built from authentic solved-p57 GP prose, fixed A/I/O words at the 18 original singleton positions, and an independently planted nine-rune secret state. The attack **recovers the actual planted key** and deciphers the full 1,894 source-register runes. The exponent positive controls retain the ten exact original repeat-escape positions, ensuring the two clocks are tested on their actual event pattern.

The extended script passed on original committed files in [GitHub Actions run 43344146586](https://github.com/FlareZ123/liber-primus/actions/runs/43344146586); the initial additive-only script passed in [run 43343389350](https://github.com/FlareZ123/liber-primus/actions/runs/43343389350).

**Decision:** no direct nine-state source-nonic additive or exponent/EA cipher in the specified six families can recover ordinary A/I/O-compatible GP-native English from p15–22, for any starting seed. This materially reduces key-space uncertainty for a visually motivated source factor. Further seed/phase search in these families has no value; a different original-selected operation, alphabet/word representation, or key source is necessary.
