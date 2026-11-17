# Exact all-secret 16-state source-polynomial test using original LP2 singletons

**17 November 2026, Agent45. Classification:** a complete, source-exact **conditional family exclusion**, not a decrypted Liber Primus passage. We searched a large unknown key space with an exact known-plaintext constraint solver and a native-GP positive; **no authentic unknown plaintext, cryptographic key or continuation has been recovered.**

## Decipherment hypothesis and authentic input

The physical p15 4×4 Fibonacci-prime spiral provides sixteen conspicuous numeric states. Independently, the 256 numeric cells on pp49–51 admit a base60 byte reading with SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. As already established in [the p39 240-slot factorization](lp2-p39-240-gridfactor16-convolution-gate.md), their printed-order polynomial modulo29 is divisible by the monic degree-16 factor

```text
F16(X) = X^16 + 25 X^15 + 17 X^14 + 11 X^13
             + 15 X^12 +  7 X^11 + 11 X^10 + 26 X^9
             +  6 X^8  + 26 X^7  + 13 X^6  +  2 X^5
             +  6 X^4  + 12 X^3  + 26 X^2  + 20 X + 13
```

The four source-derived small factors whose product is F16 have degrees **2, 2, 3 and 9**. **Caveat:** selecting their entire product as a 16-stage feedback law is a researcher interpretation, motivated by p15's sixteen cells and p50's factorization. No first-party instruction tells the solver to do this, nor to ignore the remaining long polynomial factor. The mathematical relation is exact under the explicitly conditional base60 parse.

Previous [source-fixed p15-seeded recurrence inversions](lp2-p15-p39-signed-matrix-eigen-crosslink.md) rejected eight particular signed/unsigned row-major/spiral seed and shift combinations. A much larger, decisive question remained: **does *any* initial 16-symbol state, no matter how secret, allow this source-defined linear recurrence to decrypt the intact unknown text as GP-native English?** Instead of choosing a seed, the original manuscript's one-rune words make this question finite.

Fix the straightforward direct-additive model on the *unchanged* GP29 rune stream, with one book-continuous index `t=0..12955`, original printed word segmentation preserved:

```text
C_t = P_t + K_t (mod 29)
K_t = -f1*K_(t-1) - ... - f16*K_(t-16) (mod29), for t>=16
```

All first sixteen `K_0..K_15` values are completely unknown. Every alternate additive sign is covered by negating that arbitrary seed. The model retains the original 86 ciphertext adjacent repeats, every actual printed letter, F runes, and all page continuations; no skips, word resets, hidden transpositions, or preselected language-score phases are allowed. Those extensions would be different models.

## Exact original-language constraint and exhaustive seed elimination

The corrected 56-page unknown corpus has **12,956 runes, 2,896 typographic words, and 83 complete one-rune words**. This counts the 32 genuine words carried over physical page boundaries as continuous and omits the runeless p50 from the rune clock. The test reads and checks these totals from the source transcription, rather than importing an adjustable list of candidate word positions.

Under the explicitly conditional hypothesis that the original printed word boundaries are true GP-native English spaces, every complete one-rune plaintext word is **A (GP index24) or I (GP index10)**. Thus at each exact source position `t`, the observed ciphertext `C_t` constrains the unknown key value to:

```text
K_t ∈ { C_t - 24, C_t - 10 } (mod29).
```

The first sixteen original one-rune words occur at *book-global zero-based rune offsets*:

```text
176  244  350  530  644  792  967  1025
1062 1250 1316 1545 1814 2148 2375 2428
```

Because the generator is linear, each `K_t` is an exact GF29 row-vector function of the sixteen initial state values. The 16×16 matrix of the rows at these fixed original locations is **invertible over GF29**. Assigning A or I to these sixteen words therefore fixes an **entire** initial seed uniquely. Exhausting all **2^16 = 65,536 assignments** is exhaustive over *every GF29^16 seed compatible with the sixteen original anchor words*, despite the much larger nominal unrestricted key space. No other key seed can satisfy all 83 original constraints.

For each candidate seed the remaining **67 original singletons** were held out as exact accept/reject constraints, with no word substitutions, language-model scoring or fitted exceptions.

| Exact decision | Source-original result |
| --- | ---: |
| Original singletons / independent anchors / untouched remaining | **83 / 16 / 67** |
| All anchor-consistent secret initial states tested | **65,536** |
| Seeds satisfying all 83 original A/I constraints | **0** |
| Greatest original A/I singleton matches for any anchor-consistent seed | **31 of 83** |
| Mask attaining that non-solution maximum | **7,994**, in source-anchor bit order |

The result is a **strict algebraic no-solution certificate under the named model**; sampling probability and a fitted cipher score are not involved. It does not prove that the unknown plaintext is ordinary English, that printed spaces are plaintext spaces, or that all possible nonstationary GP29 ciphers are impossible.

## Positive control: secret seed recovered across the full original-size text

An independent **12,956-rune** synthetic source-shaped plaintext was formed from the real solved-p57 GP runes repeated cyclically, placing actual GP **A/I** at those same 83 source singleton positions. It was encrypted through the same degree-16 recurrence with the row-major p15 numbers modulo29 as a deterministic **secret planted seed**. The unknown-seed recovery found **exactly one** complete 83/83 A/I-consistent candidate among the identical 65,536 anchor assignments, recovered **all sixteen seed values**, and decrypted and re-encrypted **all 12,956/12,956** synthetic GP symbols exactly. Perturbing the first recovered seed symbol by one retained only **416/12,956** correctly decrypted symbols. These are complete, source-shaped positive/wrong-key controls; the original unknown output has no recovered plaintext.

The exhaustive experiment was independently implemented once using the source-linked runtime and then reproduced with Node.js 22 on the **83 source-extracted original offset/value pairs**; both implementations agree exactly on zero original solutions, the maximum 31, the unique positive recovery and recovered secret initial state.

[Standalone Windows Node22 original-input SFT](../sims/lp2_p50_f16_allseed_singleton_original_sft.cjs). [Manually dispatched original-file CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44139075312) (see the run's status before interpreting it as a passed repository replay). The test asserts the original byte SHA, the full source factor16, original word count, singleton offsets, GF29 anchor rank, all 65,536 original candidates, unique positive, exact full forward round-trip, and wrong-key comparison.

## Research decision

**Retire the book-global, directly additive p50-F16 recurrence for ordinary A/I GP text with preserved original word boundaries, for *all* possible unknown sixteen-symbol seeds.** This is substantially stronger than excluding eight p15-visible seeds and requires no assumed seed or prose scorer. In particular, reviving that recurrence by proposing another initial seed or additive sign is mathematically fruitless.

The source remains insufficient to assert that this recurrence was authored; and the true cipher could use an independent nonlinear output map, genuine plaintext F bypass, an evolving clock, a different plaintext register, or altered segmentation. Those possibilities require a new original-source selector and new equations. This proof contributes an exact *key-recovery architecture* reusable when an independent clue fixes a different linear recurrence. It should **not** be promoted to an LP2 plaintext decryption or a claim that the book has been solved.
