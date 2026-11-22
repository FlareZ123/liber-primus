# Floral p40–53: exhaustive continuous affine ciphertext-feedback original-input gate

**22 November 2026 | Agent12 | Director [#2162](https://github.com/FlareZ123/liber-primus/issues/2162).** No unknown-page plaintext, authentic creator key or Cicada destination was recovered. The proposed entire-chapter reversible GP29 scalar-affine state family fails two large untouched original-cipher intervals. This is a bounded model exclusion rather than an identification of the historical cipher.

## Human-visible premise and competing explanation

LP2 original physical pp40–55 use the same ornate floral frame. The five-disc markings at left and right read **13** and **31** (empty=0, full=1) in the already reported binary interpretation. A reader might hypothesize one continuously changing state across the visually identified p40–53 chapter, including the three-page printed numerical table. The nearest competing explanation is a reused compositor design: original images have exact unchanged floral borders, per [original-image comparison](lp2-floral16-identical-margins-source-gate.md). No authenticated authorial hint tells us to apply a ciphertext-feedback recurrence or those two numerical coefficients.

The original p40–53 rune counts in physical order are [231,273,272,274,273,270,270,274,271,66,0,92,263,179], **3,008 GP29 symbols**. Rune-free physical p50 contributes no state tick. Retain the canonical order and all intact printed-word/page continuations; never restart at word, line, stanza or page edges.

## Frozen executable inverse

Define, modulo 29, the complete cipher family

\[
C_i=P_i+S_i,\qquad S_{i+1}=aS_i+bC_i+d,\qquad
a,b,d,S_0\in\mathbb F_{29}.
\]

The inverse is P_i=C_i−S_i, with exact forward reencryption C_i=P_i+S_i. The source-motivated fixed-coefficient subfamily takes **a=13,b=31 mod29=2** with unrestricted initial state and drift. The broader family allows all four 29-valued scalars and, for the frequency test, even an arbitrary *stationary secret alphabet permutation* of the decoded letters.

For every fixed original ciphertext, put U_0=0 and U_i=a U_(i−1)+C_(i−1). When a differs from1, S_i=a^i(S_0+d/(a−1))+bU_i−d/(a−1). The last term is a single uniform global rotation of the output alphabet, which preserves the index of coincidence (IoC). Thus every one of **29⁴=707,281 nominal parameter choices** has the same IoC as one of the **29³=24,389** explicit representative ciphertext inverses

\[
Q_i=C_i-bU_i-xa^i \pmod {29}.
\]

For a=1, S_i=S_0+bU_i+di, and the same complete quotient uses Q_i=C_i−bU_i−xi with x=d; the unknown S_0 is another uniform alphabet rotation. A secret stationary GP29 letter permutation also preserves IoC exactly. Consequently the 24,389 distinct *parameter representatives* are an all-secret exhaustive test of the entire named family, even if some representatives share frequency histograms.

Select the winning profile solely on **p40 offsets1–230**, 230 noninitial runes. Two later original intervals were untouched by key selection: physical **p45+p46 offsets1323–1862**, 540 runes spanning a page seam, and **p52+p53 offsets2566–3007**, 442 runes spanning a second seam. The whole-chapter gate uses offsets1–3007.

## Source-original result

| Original interval | GP rune slots | Opening-selected IoC | Independent all-secret oracle maximum |
| --- | ---: | ---: | ---: |
| p40 opening (train) | 230 | **0.0411999241** | 0.0411999241 |
| p45–p46 untouched middle | 540 | **0.0341716485** | **0.0369820656** |
| p52–p53 untouched late | 442 | **0.0340443869** | **0.0384051056** |
| Full chapter, except first rune | 3007 | **0.0343737755** | **0.0354544209** |

The opening-selected representative is **(a,b,x)=(6,19,7)**. The last column is an intentionally overgenerous *post-decision* audit: a different optimal secret key is selected for every original interval, even though the proposed cipher permits no rekey. Both native-language holdout gates fail even with that impossible additional privilege.

For the original floral ornament pair **a=13,b=2**, exhaustive testing of all **29 possible drifts ×29 initial states** selects **d=0,S0=9** on the opening with IoC **0.0375545852**. Its two subsequent holdouts are **0.0343640486** and **0.0337057900**; their separate all-key maxima are **0.0358276644** and **0.0352653882**. The whole-register best is only **0.0347851022**.

## Calibrated native-GP language controls and full positive recovery

The original-source SFT uses the repository's established LP1-native spelling encoder (including ING→ᛝ and IO→ᛡ). It samples exactly **2,896 original printed-word length slots**, including all **32 cross-page whole words**, from genuine Shakespeare, Gibran and Emerson reference words. Twenty different deterministic seeded samples per author create 60 complete length-matched 12,956-rune native-English books. The test uses the same 3,008 GP29 positions and original interval cuts.

| Original interval | **Minimum native IoC across 60 controls** | Best possible original-cipher IoC |
| --- | ---: | ---: |
| Training p40 | **0.0513385229** | 0.0411999241 |
| p45–p46 | **0.0544698688** | 0.0369820656 |
| p52–p53 | **0.0549245339** | 0.0384051056 |
| Whole chapter | **0.0583769829** | 0.0354544209 |

Every native control beats the all-secret original maximum on every interval. These 60 samples are original-word-length matched; they are drawn from three authors, and do not constitute 60 independent literary sources. For both frozen planted true cipher keys (13,2,7,5) and (6,19,0,7), the original-layout 3,008-rune positive recovers **3,008/3,008** and exactly reencrpyts the full chapter across all page boundaries. The original real ciphertext likewise reencrpyts under wrong keys, an expected bijective identity with zero historical probative value.

## Decision and causal next fork

Retire the exact four-scalar continuous **ciphertext-dependent affine GP29 state** family for native-GP original plaintext and any unknown stationary GP29 relabeling, including the source-favored 13/31 coefficients. No parameter, IV, uniform alphabet shift, page continuation or postselected holdout key can restore native-text collision concentration within this family.

This extends the separate [p27/p55 repeated-six-rune affine-feedback gate](lp2-p27-p55-affine-cipherfeedback-state-gate.md) to a different, 3,008-rune chapter and exhaustive original-text profiles. It leaves nonlinear state functions, externally supplied keys, changing internal alphabets, and non-GP or compressed plaintext undecided. The five-disc numerals alone select none of those models; another hypothesized operation needs an independently visible selector or direct recoverable plaintext evidence before effort is justified.

**Reproducer:** [Windows 11/Node22 CommonJS read-only SFT](../sims/lp2_floral_continuous_affine_feedback_allsecret_sft.cjs). **[Successful full original-input Windows CI run 44992021975](https://github.com/FlareZ123/liber-primus/actions/runs/44992021975)**, including the all-key search, 60 source-layout-matched controls and both exact positive inverses.