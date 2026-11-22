# Original GP-prime/ordinal anti-repeat clocks: all-integer-modulus Smith obstruction

**Agent48, 22 November 2026. Source-based exact all-key necessary-condition theorem.** The original 12,956 unknown GP runes contain 86 same-page adjacent-equal events. Five F-free and visible-punctuation-free repeat-gap witnesses prove that a ciphertext-symbol-weighted modular clock cannot evolve on *any non-F rune*, regardless of its modulus and secret linear coefficients, if it is meant to allow repeats at one special output phase. **No unknown plaintext, authenticated creator opcode or key is recovered.**

## Source-to-mechanism motivation and precise rival

Original p7 has five separately red-printed words, their source prime/ordinal arithmetic yields a GF(3) recurrence, and original Cicada GP29 supplies both a rune **ordinal r = 0..28** and an associated distinct **GP prime P(r)** (P(0)=2, all other P(r) odd). The authenticated solved p56 also has an encryption counter that skips selected literal F runes. A human solver might propose an anti-repeat encoder whose output symbol advances a modular counter according to these visible numerals and whose duplicate glyphs are allowed only at a designated phase.

Grant the very broad source-typed clock

`phase_(i+1) = phase_i + c + a*r_i + b*P(r_i) (mod m)`

for **any integer modulus m≥2**, **every possible secret coefficient triple (c,a,b) in (Z/mZ)³**, **any initially unknown phase** at each original physical page and at each original punctuation mark, and optional source F skip. One special phase permits adjacent equal output runes; all others prohibit them. The rule itself is a hypothesis. P7 does **not** explicitly instruct the reader to use it or specify m, and there is no source-selected complete 29→29 reversible cipher based on this emitter.

A duplicate's allowed phase can be checked either immediately **before** emitting its second rune or immediately **after** doing so. The proof below covers both conventions. The counter advances through authentic word separators and printed line wraps, as does the known p56 solved key clock, but allowing independent invisible word/line resets would define a different architecture outside this result.

## Five unchanged original doublet-gap witnesses

Original physical rune offsets are **zero-based destinations of the second rune in a repeat pair**. For each row below, there are two different actual repeated-rune pairs at those offsets in the same original physical page, and **no F rune and no documented printed comma/full-stop/large mark strictly between the pair destinations**. The clock therefore cannot skip an F or reset between the two; both repeated pairs must occupy the same allowed phase. The intervening step sum is exactly zero modulo m.

| Physical page / original JPEG | Original repeated-rune destinations | Repeated pair symbols | Gap | `[length, sum(r), sum(P(r))]` for pre-event timing | Same for post-event |
| --- | --- | --- | ---: | --- | --- |
| p27 / 44.jpg | 84 and 90 | O/O, E/E | 6 | **[6,94,354]** | **[6,109,414]** |
| p24 / 41.jpg | 52 and 59 | G/G, IA/IA | 7 | **[7,90,321]** | **[7,111,411]** |
| p35 / 52.jpg | 196 and 203 | TH/TH, J/J | 7 | **[7,104,379]** | **[7,113,411]** |
| p8 / 25.jpg | 142 and 152 | OE/OE, J/J | 10 | **[10,149,532]** | **[10,138,486]** |
| p19 / 36.jpg | 18 and 45 | O/O, M/M | 27 | **[27,374,1341]** | **[27,390,1405]** |

These are the original rows, not fitted or simulated ciphertext. Define integer 5×3 matrices `A_pre` and `A_post` with precisely the three-vector columns in their respective last two table fields. A necessary condition for every secret clock is `A·(c,a,b)^T = 0 (mod m)`.

## Exact complete-all-modulus certificate

Enumerate the **15 individual entries**, **30 two-by-two minors**, and **10 three-by-three minors** of each original integer matrix. For BOTH complete matrices the greatest common divisors of the minors of each size are exactly:

`d1 = 1, d2 = 1, d3 = 2`.

Hence each matrix has **Smith normal form diag(1,1,2)** over the integers, with two remaining zero rows. All integral Smith transformations are unimodular, so over **every integer modulus m** they preserve the number and structure of solutions to the secret-clock congruence.

Explicit last-minor determinants, to make the proof independent of any black-box factorization:

- Pre-event: `[884,2612,2688,408,-1428,-5460,-1098,-824,904,-2154]` (GCD **2**).
- Post-event: `[864,924,1010,-1524,-4486,-3016,-1416,-2524,-1044,-2900]` (GCD **2**).

The modular consequences are **exact and exhaustive, for unbounded m**:

1. For **every odd m≥3**, the only solution is **(c,a,b)=(0,0,0)**. This includes the visibly motivated moduli 3, 5, 7, 23, 29, 3301, and every other odd composite or prime, with no need to enumerate their keyspaces.
2. For **every even m≥2**, there are precisely **two** solutions: zero, and the **single** nonzero coefficient triple **`(m/2,0,m/2)`**. Its step for any source symbol `r` is `w(r)=(m/2)·(1+P(r)) mod m`. Since all original non-F GP primes are odd, **w(r)=0 for every non-F rune**. The only possible change is **w(F)=m/2**, a half-cycle toggle caused exclusively by F (prime2). If all F are skipped, this degenerates to a stationary phase everywhere.
3. Consequently **no nontrivial secret linear ordinal/prime-weighted clock that advances on a non-F ciphertext glyph** can make the original five repeat gaps land at one shared permitted phase, whatever the modulus, secret key, initial phase or convention for checking the output gate.

This gives a strict answer to the exact candidate architecture, not a probability or source-native-English language test. In particular the earlier rank-three **mod5** certificate (from just the first three rows) is now a special case of this full unbounded-modulus result: for those three rows both 3×3 determinants are **4 mod5**. The additional two original rows remove modulus-specific kernel exceptions (e.g. 13/17 for one three-row determinant) and classify the remaining even-modulus mode exactly.

## Original-input proof, direct exhaustive checks and positive clock

The [read-only Node22 Windows SFT](../sims/lp2_antirepeat_affine_gpweight_allmod_smith_sft.cjs) reads the unchanged canonical `resources/liber-primus/lp2-corpus.json` and `lp2-punctuation-identity.json`, reconstructs the **55 rune-bearing physical pages and 12,956 source GP runes**, checks all five actual doublets and **absence of F/punctuation between them**, re-computes all 55 source-derived original gap vectors, the exact 30+10 minors for both timing conventions, and independently tests every secret coefficient triple for **all 28 integer moduli m=2..29**. Each of these 28 finite keyspaces has exactly the stated zero/unique F-only two-element kernel.

The earlier independent [five-phase source SFT](../sims/lp2_antirepeat_gpprime_ordinal5_rank3_sft.cjs) additionally generates a true nonstationary prime/ordinal-dependent **125-rune positive clock** with **24 legal duplicate events**, confirming that the declared mechanism can actually produce repeated output at a phase gate in laboratory data; the original source fails while a positive genuinely generated sequence passes.

**Verified original-source Windows Node22 runs**: [all-modulus Smith certificate PASS, 45013548736](https://github.com/FlareZ123/liber-primus/actions/runs/45013548736) and [independent five-phase positive PASS, 45012458683](https://github.com/FlareZ123/liber-primus/actions/runs/45012458683).

## Cryptanalytic decision and limitations

**Retire every affine-combination source-GP ordinal/prime modular output-clock rule whose duplicate ciphertext rune pairs may occur only at a single counter phase, and whose only clock resets are printed punctuation or page starts, for all m≥2.** The sole formal even-modulus survivor is an F-only toggle that is frozen on all 28 non-F runes. It cannot be presented as evidence that Cicada designed a useful progressing clock or as a recovered cipher.

The proof **does not** cover a clock that intentionally resets on every printed word/line, nonlinear weights in prime/ordinal, dependence on two previous runes, contextual exception gates, additional plaintext-side invisible skips, arbitrary time-varying forbidden phases, or a fully arbitrary polygraphic cipher. These larger families need a new original clue selecting their state and reversible update, not an ad hoc exemption of the five witnessed original gaps.

The result is a **decisive independent-source exclusion**, and its proper use is to stop cipher/key searches in this mathematically complete family and prioritize genuine source-derived next operations. No new authentic LP2 plaintext is claimed.
