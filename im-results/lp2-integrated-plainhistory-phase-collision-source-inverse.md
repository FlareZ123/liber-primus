# Spacing-free integrated plaintext-history receiver: exact phase collision and finite-source inverse

**25 November 2026 — no unknown LP2 plaintext or key.** This extends the direct-output plaintext-history results and the calibrated [periodic affine predecessor receiver](lp2-periodic-affine-plaintext-difference-predecessor-recovery.md) to arbitrary nonlinear row bijections of the *integrated* step stream. The previous exact suffix tests assume intact printed words; this experiment uses every contiguous rune position, with no word or punctuation assumption.

## Architecture and proof

Freeze the complete continuous 12,956-rune unknown tape p0–55 and the historically motivated q=8,13 clocks, plus q=29 (alphabet size, not an authenticated clock). For memory m in 1..4, grant every (phase, previous m plaintext runes) its own arbitrary GP29 permutation of the current plaintext rune:

```
D_i = (C_i-C_(i-1)) mod 29
D_i = A[i mod q, P_(i-m)..P_(i-1)](P_i), i>=m
```

The first m ciphertext and plaintext values are unconstrained. This includes every independently periodic affine predecessor model with the stated clock, plus arbitrary nonlinear tables. The output is one ciphertext rune per input rune, without hold, insertion, deletion, transposition or resets. Equal length-(m+k) plaintext blocks with equal start phase force equal length-k D blocks. Consequently in *every phase separately*, the number of equal plaintext block pairs cannot exceed the observed D block-pair count. No secret key, row invertibility or choice of word segmentation is needed for this inequality.

For finite actual candidate plaintext windows, the exact stronger gate follows: equal (phase, history, input) must require equal D; equal (phase, history, D) must require equal input. These two dictionary constraints are sufficient to complete each observed partial row into a bijection, with all unobserved entries arbitrary. The decoder then sequentially reads the same D with the candidate first m plaintext symbols; no fitted scoring or approximation is involved.

## All-window original source search

Source-native GP29 spelling uses the established solved-source ING/IO contractions. Three pinned prose corpora yield 217,106 / 62,492 / 321,327 encoded runes, respectively; all **562,060** possible contiguous 12,956-rune windows are tested per model. Sliding counts are exact; the phase rotation for each moving window is accounted for. All pairs are unordered and overlapping occurrences allowed.

At maximum memory four, the five-step output has zero equal same-phase pairs for each tested q. Its plaintext nine-rune block requirement gives:

| Clock q | Original five-step capacity | Minimum Shakespeare / Gibran / Emerson nine-block pairs | Aggregate candidate windows remaining |
|---:|---:|---:|---:|
| 8 | 0 | 34 / 58 / 11 | 0 |
| 13 | 0 | 18 / 29 / 3 | 0 |
| 29 | 0 | 4 / 14 / 0 | 5,206 |

The q29 Emerson survivors are tested against phase-specific four-step and three-step capacities, reducing 5,206 to 221 and then 176. All 176 fail exact row consistency: 155 require different outputs for identical input/context/phase, and 21 violate row injectivity. The latest first contradiction is rune1446 (zero-based). Thus no tested candidate source window admits the original ciphertext under any of the twelve models. For m<=3 all windows already violate the five-step collision requirement. The finite native reference and continuous source ordering are essential; this is not a theorem about every English text or all changing states.

## Constructive unknown-row finite-source control

An independent planted original-length ciphertext uses q29, m4, an undisclosed-to-the-receiver contiguous Emerson start20347, and independently keyed deterministic history/phase affine rows. The same complete search through all 562,060 windows retains 939 after the joint phase bounds; 938 fail exact row consistency, and exactly one survives: the true offset20347. It recovers all 12,956 native runes and all 12,777 observed row entries; unseen rows remain unconstrained. This is genuine finite-source identification without knowing the plant row key, conditional on the source being in the finite candidate set. The original yields no candidate or unknown plaintext.

## Decision

Retire the direct continuous integrated plaintext-history receiver at q8/13/29, memory1–4, against these complete native-prose reference windows. This is stronger than the prior periodic affine receiver's search-dependent negative; neither arbitrary nonlinear output maps nor removing the printed word-boundary premise rescues it on these references. A chapter-private clock, nonlocal state, altered rune order/register or independently supplied key is outside this exact scope. Do not infer that an arbitrary higher-memory family is the intended cipher.

- [Standalone CommonJS SFT](../sims/lp2_integrated_plainhistory_phase_collision_source_inverse_sft.cjs), commit 2c122b2c43de89ff9fcb9d8074b85a8a84c4783b
- [Complete results and phase capacities](lp2-integrated-plainhistory-phase-collision-source-inverse-output.json), commit 8091711b5e73233ba3bf5a2d27ab561ac1585573

Executed on checked-in original source and all pinned prose in connected JS; standalone Node CI not run.