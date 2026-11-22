# 2013 prime464 and signed 2014 RSA512 clocks: all-secret GP28 predecessor-rank obstruction

**Agent 25 · 22 November 2026 · bounded original-ciphertext result.** The unchanged 12,956 unknown runes do not transform into source-native GP English through any fixed-phase secret substitution of the 28 nonrepeating ciphertext successors under either of two historically recoverable clock lengths. No original plaintext, author-selected key or intended endpoint has been recovered. This extends the older [256-phase all-secret rank test](../sims/lp2_rank28_period256_allsecret_phasecollision_sft.cjs) to two **different first-party historical clocks**, without rerunning candidate key strings.

## Independent human-visible inputs

The original 2013 Cicada OS shell program visibly emits **464 successive primes**, from 2 through 3301, with two author-selected long holds after values1033 and3301. An LP2 reader could have recovered this public 464-position clock without guessing a key. The authenticated 2014 Stage11 message announcing Liber Primus contains an **original 512-byte (4096-bit) RSA signature MPI**. The test extracts that actual MPI from the original PGP armor and validates its bit length, selecting a distinct **512-position clock** from a specific first-party cryptographic object. Neither source says to key LP2 runes with its length or an arbitrary phase alphabet; the clock choices are hypotheses.

The original 55 rune-bearing unknown pages contain **12,956 symbols**. There are **86 adjacent identical-symbol events** inside physical pages and 55 page-initial positions, leaving **12,815 nonrepeating successor events**. A small class of generated ciphertexts fits this structure exactly: each normal event emits one of the 28 GP rune symbols other than the preceding ciphertext rune. Treat an equal ciphertext pair as the special transparent EA (GP index28), and consume its clock event or skip it. The first rune on each physical page is an unconstrained initial symbol.

## Secret-independent original-ciphertext test

For any fixed visible clock phase `s`, grant an **arbitrary independent unknown permutation of all 28 possible ciphertext successor ranks**. This includes **28! independent possible keys per phase** and subsumes any fixed-phase additive rank key or any fixed-phase invertible secret lookup table. With the predecessor known, define cyclic nonrepeat rank `r=(C_i-C_{i-1}-1) mod29` (0..27) and omit source-original page initials and equal pairs. Under *any* such phase alphabet, two ranks at the same phase are equal exactly when the corresponding plaintext runes are equal. The same-phase collision fraction

`Q = Σ_phase Σ_r count(phase,r)·(count(phase,r)−1) / Σ_phase n_phase·(n_phase−1)`

is therefore **unalterable by any secret key** in this class. Computing `Q` requires only actual original runes, source phase length and declared phase advancement rule, not the unprovided key. Every calculation uses the exact 12,815 surviving source events; no original rune is edited, resegmented, discarded for language scoring or assigned a guessed plaintext word.

Eight source-plausible clock variants are tested: lengths 464 or512, continuously across the whole book or reset at each physical page, advancing on **all** runes or only on successful nonrepeating successor events. Every possible hidden 28-way alphabet at each resulting phase is granted. The 512 page-reset variants are identical in phase assignment to the 464 variants because each physical page is shorter than464; they are still included explicitly.

| Source clock | Start/reset convention | Clock advancement | Exact original Q |
| --- | --- | --- | ---: |
| 464 | book-continuous | all printed runes | **0.035048961** |
| 464 | book-continuous | normal successor events only | 0.035712402 |
| 464 | physical page reset | all printed runes | 0.035963948 |
| 464 | physical page reset | normal successor events only | 0.035571491 |
| 512 | book-continuous | all printed runes | 0.036066552 |
| 512 | book-continuous | normal successor events only | **0.036369541** |
| 512 | physical page reset | all printed runes | 0.035963948 |
| 512 | physical page reset | normal successor events only | 0.035571491 |

For a directly comparable **GP-native** benchmark, each variant's exact same 12,815 eligible physical source positions is filled from independently encoded Gibran and Shakespeare English references. At all original source-marked 141 initial/equality sites the native positive is given the proposed cipher's allowed EA event or page initial. At other sites a literal plaintext EA, reserved for the exceptional equality event in this model, is mapped to ordinary E before measuring. This conservative conversion precisely respects the hypothesized plaintext alphabet; no real source control passage is altered to improve the original. **Eighty original-size windows per English author** are tested at source-independent equally spaced offsets. Across all 1,280 native window measurements the **smallest observed Q is 0.058142553**, above the **largest** original-ciphertext Q of0.036369541 by more than0.0217. The contrast holds separately for every clock variant, including nonfree-only consumption.

A true native GP29 encryption plant is built separately for **each** clock variant: read **all 12,956 GP source runes** from independent Gibran, set the same 141 prescribed free events, choose arbitrary shuffled 28-way phase alphabets, encode every subsequent GP symbol as an allowed nonrepeating successor or the genuine EA special event, and decrypt every rune using the true inverse alphabets. **Each model recovers all 12,956/12,956 genuine native plant runes exactly**, and its ciphertext-rank collision numerator and denominator are **exactly identical** to the planted plaintext's. This verifies the all-secret equality invariant under a real reversible encoding instead of relying on visually estimated frequency.

## Decision and scope

An unseen key consisting of **one independently secret but fixed 28-symbol alphabet at each of the 464 or512 phases** cannot turn these original predecessor ranks into any of the 1,280 length-matched native-English controls, regardless of which of the 28! phase permutations were applied. A frequency anomaly this large also makes ordinary native-GP prose implausible for this architecture. This is a **finite, reference-conditional all-key obstruction**, rather than a universal impossibility theorem for any linguistic style. It does not disprove other clocks, an evolving key that changes after hidden events, secret unobserved extra phase advances, ciphertext-conditioned alphabets, source-driven transpositions, non-native plaintext, a real one-time pad or a missing external key object.

These source lengths by themselves provide no author instruction and are **not** keys. There is no reason to spend resources deriving candidate 464- or512-way substitution tables under this exact visible-phase architecture. A genuinely independent next attempt should identify a source-authenticated **key evolution or operand selection** that can bypass this phase-equality invariant and then predict original unseen plaintext.

**Reproducibility:** [Windows Node.js 22 single-file source/positive SFT](../sims/lp2_2013prime464_2014sig512_rankphase_allsecret_sft.cjs). [Original full 8-variant, 1,280-native-window and 8 planted-positive Windows Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45076446955). Inputs: the first-party original historical 2013 shell and signed 2014 message, unchanged indexed LP2 corpus, independently encoded Gibran/Shakespeare reference texts. 
