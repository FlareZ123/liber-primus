# P15's 16-step spiral as a lossless predecessor-exclusion cipher: an all-secret original-input gate

**13 November 2026, Agent 2. Evidence: finite original-ciphertext / source-native-English exclusion, with an exact inverse plant. No unknown plaintext, historical LP2 key, intended operator or destination was recovered.**

## A concrete human-readable solve path

Physical LP2 p15 has a 16-cell prime/Fibonacci spiral and infinity-like arrow ornament. Physical pp16–22 follow it without a new illustrated chapter opening. The manuscript's very unusual shortage of adjacent equal ciphertext runes suggests testing whether an output uses the previous ciphertext rune and chooses one of the other 28 GP symbols. A GP29 author could represent a special symbol (EA, index28) as an unchanged glyph and every other GP rune as one of the 28 nonzero modular steps. The presence of sixteen spiral entries suggests using one alphabet per repeating phase.

Let the page-initial published rune be the visible IV. For every subsequent native GP29 plaintext index `P_i` and predecessor ciphertext rune `C_(i-1)`, an explicit *reversible* candidate is

```text
if P_i == 28:
    C_i = C_(i-1)
else:
    C_i = (C_(i-1) + 1 + S_phase(P_i)) mod 29

where S_phase is any bijection {0,...,27} -> {0,...,27}.
```

The direct inverse reads `D_i=(C_i-C_(i-1)) mod29`, reconstructs EA when `D_i=0`, and otherwise returns `S_phase^(-1)(D_i-1)`. The key alphabet can be completely arbitrary at each of the 16 phases, giving **(28!)^16 possible phase-key combinations** (or more under independent page resets). No secret key is chosen or guessed for the original input. The spiral gives the testable period, although **the source does not prescribe this cipher, which rune receives the repeat symbol, or the clock**.

The direct, source-numeric member was also checked before the all-secret gate: use the 16 original printed p15 entries, recovered Fibonacci-indexed primes, their totients and Fibonacci indices reduced modulo28 as additive transforms of the nonzero-step rank, with both signs and page/chapter clocks. Every output remains near GP29-uniform (best IoC 0.03568 on pp16–22) and supplies no readable passage. The broad result below does not rely on the particular numbers.

## An invariant that eliminates every secret 16-phase alphabet

Within one fixed secret phase, a permutation preserves exact equality counts. Group all nonzero original ciphertext steps by the residue class of the source clock modulo16 and calculate the pooled `sum(count*(count-1))/sum(N*(N-1))` across the 16 groups. An arbitrary alphabet permutation can relabel the 28 observed difference-ranks but **cannot increase this same-phase coincidence statistic**. This necessary condition is independent of the key and is valid for nonlinear, nonaffine, completely secret phase alphabets.

Frozen input: all **1,744 authentic source rune indices on physical pp16–22**, with page lengths **[267,273,260,271,269,273,131]**. Seven printed page-first glyphs are the IVs; the remaining 1,737 positions contain **10** exact adjacent repeats, leaving **1,727** nonzero rank symbols. The two source-visible reset readings are chapter-continuous and page-local. For each, both natural key-consumption rules are admitted: every eligible rune advances the phase, or only nonzero-step payload symbols advance.

| Source phase clock | Original equal ordered pairs / all eligible ordered pairs | Original IoC |
|---|---:|---:|
| Page reset; repeat consumes key | **6,568 / 184,720** | **0.035556518** |
| Page reset; repeat does not consume key | **6,676 / 184,728** | **0.036139621** |
| Chapter continuous; repeat consumes key | **6,608 / 184,696** | **0.035777710** |
| Chapter continuous; repeat does not consume key | **6,746 / 184,682** | **0.036527653** |

The original source is close to the uniform 28-symbol coincidence baseline 1/28 ≈ 0.035714, even after its nonzero differences have been partitioned by the four source-motivated clocks.

## Three independent native-English controls

The checked-in Shakespeare, Emerson and Gibran corpora were independently GP29-encoded with the existing source-calibrated spelling conventions: TH, EO, NG and other atomic glyphs, with the GP merges C/K, U/V, S/Z and single-rune ING/IO. Every comparator takes **the same seven page lengths**, skips each page's first GP rune as the IV, and treats native plaintext EA as the sole repeated-step symbol. The control independently determines which symbols are eligible and which phases consume them, exactly as the hypothesized encoder would.

Each source is scanned in contiguous 1,744-rune windows at fixed stride17. This is a bounded finite corpus comparison, **not an independent-probability p-value or a universal impossibility proof for all imaginable plaintext registers**.

| Native-GP source | GP rune total | Windows | Minimum IoC: page/all | Page/nonzero | Chapter/all | Chapter/nonzero |
|---|---:|---:|---:|---:|---:|---:|
| Shakespeare | 217,106 | 12,669 | **0.0549743** | 0.0549956 | 0.0545817 | 0.0553600 |
| Emerson | 321,327 | 18,800 | **0.0573282** | 0.0571113 | 0.0573633 | 0.0575367 |
| Gibran | 62,492 | 3,574 | **0.0566675** | 0.0574467 | 0.0580608 | 0.0576288 |
| **Original pp16–22** | 1,744 | one fixed | **0.0355565** | 0.0361396 | 0.0357777 | 0.0365277 |

**Zero of 35,043 matched English windows reaches the original IoC under any of the four specified clocks.** The separation is too large to repair by selecting a different secret 16-phase substitution, p15 numeric reduction, phase alphabet order, or initial phase: a global cyclic rotation merely relabels all 16 groups and leaves the statistic unchanged.

An independent source-native plant encrypts 1,744 Shakespeare GP29 runes under sixteen different *secret 28-symbol permutations*, with exact predecessor-exclusion feedback, synthetic IVs, and genuine EA repeat emissions. For all four clocks the decoder recovers **1,737/1,737** non-IV source symbols exactly, while the implanted ciphertext has precisely the same grouped collision numerator and denominator as its source-native plaintext. This confirms the key-free invariant under the actual candidate cipher, rather than merely comparing suspicious statistics.

## Decision and what can still work

The exact 16-phase **rank-of-nonrepeat-difference** family cannot transform the tested native-English samples into the original pp16–22 while preserving the printed rune count and segment order. This is a distinct consumer from the previously excluded **16-phase positionwise GP29 direct-substitution family** [here](lp2-p15-period16-allsecret-source-gate.md), because it first uses the preceding ciphertext rune to encode a 28-symbol difference alphabet and reserves an exact repeated output for GP EA. It is also distinct from the earlier **word-initial** secret GP28 rank gate on pp11–23 [here](lp2-word-boundary-doublet-analysis.md#word-initial-gp28-no-repeat-rank-an-all-secret-page-local-permutation-fails).

The original source does **not** rule out a rune-varying key driven by a longer recurrence, a predecessor-and-phase-dependent alphabet, a pretransposed intermediate text, a separate exception-channel mapping, non-English/plaintext code data, or an additional cipher layer. Those possibilities are viable only if an original visual or historical clue selects the extra operation or missing state. A search through more period-16 secret alphabets alone cannot produce authentic plaintext.

**Reproducer:** [single-file original/English positive-control SFT](../sims/lp2_p15_no_repeat_16phase_allsecret_sft.cjs) using only the repository source corpus and three frozen references. The tested source is the canonical `resources/liber-primus/lp2-corpus.json` with unedited printed order. This result is supporting research; it does not change [the established manuscript-wide synthesis](../results/README.md).
