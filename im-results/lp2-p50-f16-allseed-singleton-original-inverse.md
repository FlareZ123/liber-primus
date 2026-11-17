# Exact all-secret 16-state source-polynomial test using original LP2 singletons

**17 November 2026, Agent45. Classification:** a complete, source-exact **conditional family exclusion**, extended from A/I to A/I/O and a predecessor-differential receiver. No unknown Liber Primus passage was decrypted. We searched a large unknown key space with an exact known-plaintext constraint solver and a native-GP positive; **no authentic unknown plaintext, cryptographic key or continuation has been recovered.**

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

## Stronger full-A/I/O constraint and predecessor-difference receiver (17 November)

The A/I binary word hypothesis is stronger than necessary: genuine source-native single-rune English words can include the vocative **O** (GP index **3**). A much harder unknown-seed challenge is whether *any* key from the same entire GF29^16 F16 family can produce **A/I/O** at all 83 complete source singleton words. This permits **3^16 = 43,046,721** independent plaintext assignments at the same first sixteen source positions and covers both of these complete, source-order, book-continuous cipher laws:

1. **Direct:** C_t = P_t + K_t (mod29), already bounded above under A/I.
2. **Differential predecessor chain:** C_t − C_(t−1) = P_t + K_t (mod29), with a fixed virtual C_(−1)=0, which retains all 29 GP rune values and all observed ciphertext repeat events as actual runes. This admits a predecessor-dependent output convention without presuming a fixed secret symbol substitution.

**One exhaustive meet-in-the-middle solver replaces 43 million redundant seed reconstructions.** The 16-anchor matrix is invertible over GF29. A heldout key K_j equals a known linear form in the sixteen anchor key values. Split the sixteen anchors into eight left and eight right (3^8 = 6,561 each), freeze the first **four source-order untouched singleton constraints** (positions 16–19), calculate each half's four GF29 contributions and map each source-allowed triple into a four-residue target. Exactly matching half sums are all and only the anchor assignments that satisfy these four original holds. Test every surviving pair against the remaining 63 original singleton positions, with no adjustable key, page reset, rune deletion, word segmentation, alphabet reassignment, or language-model score. The four-residue packing base29 is bijective, so **no state in the full 43,046,721 set is skipped**. Both signs of the additive key are equivalent after negating the completely secret seed, under the same fixed recurrence.

| Exhaustive original-input gate | Direct C=P+K | Predecessor chain ΔC=P+K |
| --- | ---: | ---: |
| All anchor-consistent initial secret states represented | 43,046,721 | 43,046,721 |
| Candidate seeds satisfying the first four untouched singleton constraints | **4,934** | **5,025** |
| Candidate seeds satisfying all 83 original A/I/O words | **0** | **0** |
| Maximum source-order matched initial singleton words (including 16 anchors) | **23** | **24** |

**The independent reversed-time reading also fails exhaustively.** Because F16 has nonzero constant 13 (inverse 9 modulo29), its companion evolution is invertible. A natural alternative is to read the same sixteen-state linear key generator backward through the original book. This is exactly described by the normalized reciprocal characteristic polynomial (descending):

\`\`\`text
[1, 6, 2, 21, 25, 18, 1, 2, 25, 2, 12, 5, 19, 12, 8, 22, 9]
\`\`\`

The reciprocal is obtained by reversing all seventeen original coefficients and multiplying by 13^(-1) = 9 modulo29; it introduces **no new fitted key or cipher parameter**. Applying the identical 43,046,721-assignment exhaustive A/I/O solver to unchanged ciphertext gives **4,862** four-holdout survivors for direct addition, **4,953** for predecessor chaining, and **zero full all-83 solutions** in either case. Their maximum source-order matched singleton prefixes are **22** and **24**. Both reversed-time native-GP positive plants independently recover a unique correct sixteen-value secret key and complete 12,956-symbol forward/backward reconstruction. The same source-correct [MITM SFT](../sims/lp2_p50_f16_allseed_aio_mitm_original_sft.cjs) runs both directions. This closes a time-direction ambiguity present in the earlier fixed-seed p39 study; page-reset state, nonlinear output, or reverse *ciphertext travel* remain different unsourced programs.

**Fixed global phase is already covered.** The same nonzero constant 13 makes the recurrence transition matrix bijective. With *all* GF29^16 possible initial seeds allowed, shifting the stream's starting clock by any integer merely permutes the candidate seed set. A claimed different book-global starting phase, beginning after a red heading, or a fixed leading offset cannot evade the complete all-secret exclusion. This invariance does not extend to per-word/page resets or unknown state interventions.

The reported prefix maxima are only descriptive bookkeeping for this exact gate, not evidence of partial English or a fitted original decoder.

**Four positive controls** are complete: the two emission laws in each of two source-founded recurrence directions. a native 12,956-rune source-shaped GP plaintext from the real solved p57 tape, with A/I placed at the manuscript's eighty-three original singleton offsets, is encoded using the F16 source recurrence with a hidden original-p15 row-major sixteen-value seed. For the direct generator and separately its predecessor-integrated output, the same full A/I/O search finds **exactly one** all-83 matching seed per direction/emitter and recovers the entire genuine p15 initial vector modulo29:

\`\`\`text
[10,3,20,22,1,22,21,25,11,17,19,7,21,17,12,22]
\`\`\`

Each complete encoder exactly decodes and re-encrypts all **12,956** planted symbols. Thus the original zero-solution conclusion is a source-constrained **all-secret algebraic impossibility for both defined stream-emission architectures**, not a failure to guess the initial 16 runes.

[Full Windows Node22/CommonJS original-source MITM SFT](../sims/lp2_p50_f16_allseed_aio_mitm_original_sft.cjs) reads the unchanged canonical book rune tape, original word separators and source p50 digits. Its original counts **4,934 / 5,025** were independently duplicated with an isolated Python implementation from the 83 source-authentic original rune/difference pairs. The original full-A/I/O test and all four positive controls have executed successfully in local Node22 and the independent Python reconstruction. All four original-data tests and all four native-GP positive controls passed in [Windows Node22 manual run 44141977240](https://github.com/FlareZ123/liber-primus/actions/runs/44141977240) after the reversed-clock source extension. The earlier two-emitter run [44141479740](https://github.com/FlareZ123/liber-primus/actions/runs/44141479740) also passed.

**Boundary:** the F16 recurrence is mathematically source-derived, but no creator-era source explicitly selects this recurrence as an LP2 cipher. The observations exclude only book-global additive and predecessor-differential outputs under *preserved ordinary A/I/O word boundaries*. They do not constrain a secret nonlinear mapping, varying alphabet, transparent-F skip, alternate segmentation, non-GP output, or a genuinely different finite-state machine. No unknown original plaintext or authentic key was recovered.

## Research decision

**Retire the book-global direct-additive and predecessor-differential p50-F16 recurrence receivers in both forward and reversed time directions for ordinary A/I/O GP text with preserved original word boundaries, for *all* possible unknown sixteen-symbol seeds.** This is substantially stronger than excluding eight p15-visible seeds and requires no assumed seed or prose scorer. In particular, reviving either recurrence receiver by proposing another initial seed or additive sign is mathematically fruitless.

The source remains insufficient to assert that this recurrence was authored; and the true cipher could use an independent nonlinear output map, genuine plaintext F bypass, an evolving clock, a different plaintext register, or altered segmentation. Those possibilities require a new original-source selector and new equations. This proof contributes an exact *key-recovery architecture* reusable when an independent clue fixes a different linear recurrence. It should **not** be promoted to an LP2 plaintext decryption or a claim that the book has been solved.
