# Paired original-Cicada GP29 primitives on all unknown LP2 pages

**Agent 23, 13 November 2026. Classification: bounded negative original-cipher inverse.** No unknown plaintext, authentic LP2 key, algorithm, or destination recovered. A deterministic Windows/Node22 CI run examined all **12,956** original unread GP29 runes.

## The one source-constrained question

Known Cicada solutions establish three actual GP29 operations elsewhere in the puzzle: a repeated **DIVINITY** Vigenère key, the early **FIRFUMFERENCE** Vigenère key, and the LP2 physical p56 prime-totient sequence **phi(p_n)=p_n−1**. A short two-layer addition of already established operators is one possible human-designed cipher path. Its weakest premise is that the creators reused these **particular** operators on unknown LP2 pages; no original LP2 clue instructs the pairing or composition order. Alternative mechanisms, including ordinary random keying, are fully viable.

The test starts from the source GP29 indexes of the untouched 55 rune-bearing pages (physical pp0–55, excluding numeric-only p50). It respects nine original visually marked chapter groups with lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. The source keys in GP29 indexes are

- DIVINITY: **[23,10,1,10,9,10,16,26]**.
- FIRFUMFERENCE: **[0,10,4,0,1,19,0,18,4,18,9,5,18]**.
- PHI_PRIMES: successive ordinary primes **p0=2, p1=3, ...**, using the exact modulus-29 totient step already recovered on p56.

For each of the three possible two-key pairings, apply **P_i=(C_i or 28−C_i) ± A_i ± B_i mod29** to every original rune. Both keys' clocks may independently advance continuously through the manuscript or restart at each visible chapter, with no page-specific free keys. Every phase of each fixed Vigenère source key is considered; the prime clock begins at the first prime. Both signs for each component and the existing Atbash choice are tested. Two handling rules for printed ciphertext Fehu (GP index0) are admitted: consume the normal clock or treat **every** Fehu as literal F that consumes neither key. The all-Fehu rule is a conjectural generous extension of the one exceptional F known on p56.

There is no 29-symbol relabelling or hidden key, cipher feedback, hand-tuned phase per page, source word manipulation, arbitrary skip mask, or optimization on unseen plaintext.

## Complete full-source outcome

Normalized GP29 index of coincidence (IoC) is 29 times the ordinary per-symbol collision probability. A random-looking uniform 29-rune stream is near **1.0**. The unmodified 12,956-source-rune stream scores **0.9998735381**. The 95-runic *known plaintext* p57 scores **1.8185890258** using the same estimator. Native prose may vary, but all tested outputs stay far below that known LP2 register.

| Two historical key streams | Complete inverses | Any of nine chapters IoC ≥ 1.35 | Highest pooled IoC | Highest individual-chapter IoC |
|---|---:|---:|---:|---:|
| DIVINITY + FIRFUMFERENCE | **6,656** | **0** | **1.04786449** | **1.13429129** |
| DIVINITY + phi(primes) | **512** | **0** | **1.04311792** | **1.10423733** |
| FIRFUMFERENCE + phi(primes) | **832** | **0** | **1.04891118** | **1.10063085** |
| **Total** | **8,000** | **0** | **1.04891118** | **1.13429129** |

Every variant is evaluated on **all 12,956 original runes**; every original chapter's IoC is evaluated independently. The pooled maximum and maximum single-chapter observation need not belong to the same configuration. Alternative phases produce no independent chapter resembling the known p57 register.

This rejects the specified direct source-operator pairings as plausible native-GP plaintext recoveries on the full original corpus. It does not exclude altered word boundaries, other GP mappings, non-English intermediate ciphertext, additional layers, independently source-supplied page keys, selective literal F masks, or a truly historical instruction defining a different composition. Retire precisely these directly composed operators without rescuing them through new fitted layers.

## Essential positive controls and reproduction

The test recomputes the **authentic p56, 85-rune solution** using phi(prime) subtraction from prime2 and precisely the local ciphertext Fehu at offset56 as a nonconsuming literal. It asserts **85/85 actual GP rune matches**, including independently established words. It also constructs a 95-rune ciphertext from the solved original p57 GP plaintext with both Vigenère keys and recovers **95/95 runes** under the same combined inverse. These controls establish the chosen modulus, prime clock and additive signs; they do not establish historical selection of a double-key cipher.

- [Single-file reproducible CommonJS source](../sims/lp2_authentic_pairwise_composition_sft.cjs)
- [Read-only, manually triggered Windows/Node22 CI run 43357465885](https://github.com/FlareZ123/liber-primus/actions/runs/43357465885): **success**, with full exhaustive output and passed control assertions.
- Original inputs: [GP29 physical page corpus](../resources/liber-primus/lp2-corpus.json), [authentic p56 prime-clock regression](../sims/authentic_lp2_p56_totient_regression.cjs), [authentic DIVINITY regression](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs), [FIRFUMFERENCE historical source gate](../sims/lp2_2014_firfumference_vigenere_gate.cjs).

## Cryptanalytic implication

The appealing “combine the two known LP1 Vigenère passwords with the one solved LP2 totient method” route does **not** unlock unknown pages under any of these 8,000 source-shaped choices. Even the most favorable source-visible chapter fails to approach known plaintext concentration. Further progress should require a clue that **specifies a new inverse or actual key source**, not an additional arbitrary phase, key stacking or document-wide parameter sweep. The current overall manuscript status remains unchanged.
