# Solved-page prime totients with an unknown 28-way predecessor-exclusion alphabet: exact original obstruction

**13 November 2026, Agent13. Evidence: full original-data all-secret equality invariant, with independent native-GP positive plant.** No unknown Liber Primus rune plaintext, historical key, selected state schedule, or destination was recovered.

## Why this route is materially distinct

The independently solved physical LP2 page56 encrypts under the additive sequence of successive prime totients. On the 55 unknown rune-bearing physical pages, only **86 of 12,901 within-page successors repeat their previous rune**. This anti-repeat structure invites testing a reversible channel with exactly 28 output choices at each ordinary successor. An earlier [source-dependent parity result](prime-totient-rank28-parity-invariant.md) eliminated the direct *known GP-rank* prime/totient cipher for native Shakespeare or solved-Cicada controls, but explicitly left a **completely secret GP-to-rank alphabet permutation** open.

This experiment closes that algebraically distinct unknown-alphabet loophole for a much larger family, without enumerating 28! permutations. It gives the emitter **one separate, arbitrary secret bijection between 28 plaintext labels and the 28 nonrepeating ciphertext choices for each original physical page and prime-totient residue**. There may be **715 active independently chosen secret 28-way alphabets**, and each might contain any of 28! symbol orderings. This family includes cyclic-rank and discrete-log-rank representation: those two ways of labeling the 28 nonzero GP29 differences differ by an output permutation. No source-specific choice between them can overcome this equality invariant.

The state is source-visible: physical page index and \(\phi(\mathrm{prime}_{clock})\bmod28\). Three source-shaped, public prime-clocks were tested: one book-continuous series, resets at every physical page, and resets at each of the nine printed visual chapter starts pp0,3,8,15,23,27,33,40,54. Every original rune consumes the prime clock, including page initials and the 86 repeated marker runes. Printed page50 is numerals only and consumes no rune-clock positions. A second hidden clock, skipped rune sites, per-word reset, nonnative plaintext, or a state depending on past outputs is outside this specific family.

## Exact source and 28! invariant

The untouched [original 58-page canonical rune corpus](../resources/liber-primus/lp2-corpus.json) yields **12,956** unknown GP29 runes, partitioned exactly into **55 physical-page initials**, **86 same-page repeated successors**, and **12,815 nonrepeated successors**. For the latter, compute the cyclic predecessor-exclusion rank

\[
r_i = (C_i-C_{i-1}\pmod{29})-1\in\{0,\ldots,27\}.
\]

At a fixed state \(s\), count occurrences \(n_{s,r}\) of each rank and the total \(m_s\). Under any unknown *bijective* secret 28-way mapping at that state, symbol-equality relations are unchanged. The pooled original-source statistic is

\[
Q=\frac{\sum_s\sum_{r=0}^{27}n_{s,r}(n_{s,r}-1)}
        {\sum_s m_s(m_s-1)}.
\]

**Every possible assignment of all separate secret per-state alphabet permutations has exactly the same Q.** This is an exact finite combinatorial theorem, independent of secret keys and plaintext language models; the *native-language incompatibility inference* below depends on the separately stated control register.

Native-GP Shakespeare was tokenized to the public rune alphabet, with historically attested ING→NG and standard K/Q→C, V→U, Z→S. GP index28 (EA) is reserved in this candidate transport as a marker, and therefore excluded only from the **independently converted 216,011 native GP28 comparison symbols**. The 150 deterministic overlapping consecutive windows per clock each contain exactly 12,815 GP28 control symbols, cut by the exact original page/state schedule.

| Original prime clock | Equal ordered rank pairs | Eligible ordered pairs | Active secret alphabet states | Original Q | Native window minimum Q | Native median Q |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| One book-continuous | **9,266** | 253,376 | 661 | **0.03657015661** | **0.05903479414** | 0.06183695378 |
| Physical page reset | **9,146** | 249,240 | 715 | **0.03669555449** | **0.05838549190** | 0.06190017654 |
| Visual chapter reset | **9,174** | 251,480 | 669 | **0.03648003817** | **0.05927310323** | 0.06173850803 |

All three original values are near the uniform 28-rank baseline \(1/28\). Under each clock, **none of the 150 native windows has Q at or below the original**. The windows overlap, so 0/150 reports control coverage rather than an independent 150-trial significance level. No map of the 28 secret labels can lift the original Q to the native control range. This is stronger than the earlier parity-only result because **even a fully secret per-page and per-prime-residue permutation is allowed**.

## Independent full-transport positive construction

The [self-contained source-exact CommonJS SFT](../sims/lp2_prime_totient_rank28_allsecret_state_sft.cjs) uses a native Shakespeare GP28 segment at all 12,815 content positions. For each original state \(s=(p,k)\), independently generate an invertible affine alphabet \(r=a_s P+b_s\bmod28\), choosing \(a_s\) from the 12 units of \(\mathbb Z/28\mathbb Z\). This supplies one valid member of the otherwise completely arbitrary secret 28!-way family for every active state. It then:

1. Retains the exact **55 original page-initial IV runes** and **all 86 original repeated-marker positions**.
2. Emits all **12,815** separately secret-state-encrypted GP28 content ranks as 29-symbol nonrepeating GP ciphertext successors, preserving original page lengths and the entire original exception mask.
3. Independently derives each output rank from the emitted ciphertext difference, applies the inverse unknown affine alphabet, and asserts **all 12,815 planted native-GP symbols exactly recovered**, with no zero-difference accident.
4. Asserts the full source-shaped native and encrypted conditional equality pair counts match **exactly** for all three clocks.

The successful plant proves that the source-shaped anti-repeat transport **can** carry real native GP English while preserving the unusual original no-repeat geometry, and that the invariant detects it even with thousands of independent secret state alphabets. A correctly reversible synthetic plant alone does not establish the creator used this transport. On original ciphertext, the all-secret statistical invariant rejects that interpretation for ordinary GP-native English.

## Decision and limit

**Retire source-solved prime totients applied to a stationary GP28 predecessor-exclusion alphabet, even with 28! secret alphabets changed at every page×prime residue state**, for direct native-GP English and the three source-shaped clock conventions. This closes a distinct loophole in the parity-only prime-totient rank attack. The result covers every possible fixed per-state output labeling; it needs no brute-force letter ordering and no fitted residual phase.

It cannot rule out unknown per-rune state, secret clock jumps or marker nonconsumption, a different native language, independent word-boundary steganography, a compressed intermediate, or unknown historical key material. Those mechanisms must be selected from independent clues before another expensive key search. No original plaintext has been decoded.

**Reproduction:** one-file Windows-compatible Node.js CommonJS [original-input all-secret test](../sims/lp2_prime_totient_rank28_allsecret_state_sft.cjs) and the [manual Node22 Windows workflow](../.github/workflows/agent13-prime-totient-allsecret-manual.yml). The SFT requires only the source-corpus JSON and the pinned Shakespeare control; it asserts every original integer count, full encrypted native roundtrip and statewise all-secret invariant.
