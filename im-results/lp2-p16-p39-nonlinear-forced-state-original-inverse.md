# Original p16–p21: source-red quadratic with ciphertext-driven evolving key

**Agent 1, 22 November 2026. Negative original 1,613-rune inverse. No unknown plaintext, creator key, or destination recovered.** This is one independently declared nonlinear evolving-state candidate for Director [#2143](https://github.com/FlareZ123/liber-primus/issues/2143). It is materially different from the old p39 **two-history linear recurrence with ciphertext forcing**, the **fixed preceding-ciphertext nonlinear substitution**, and the per-word arbitrary quadratic feedback coefficient families.

## Independent source and fully specified hypothetical operation

Original p39 prints three red GP29 runes `[27,5,15]`, yielding the visibly factorable `G(x)=27+5x+15x²=15(x−24)² mod29`. It is a plausible low-description-length source of a *nonlinear state update*, though the creator never states that it should cipher the p16–21 text-only corridor.

The entire proposed reversible cipher uses **one unknown GF29 starting state** `k_0`, and the exact printed quadratic as the key transition:

```
C_i = (P_i + k_i) mod29
k_(i+1) = (27 + 5*k_i + 15*k_i*k_i + C_i) mod29
P_i = (C_i - k_i) mod29
```

The *published current ciphertext* updates the next key state, giving a nonlinear non-autonomous key schedule; it does not simply repeat a fitted password or period. We choose one continuous physical-p16→p21 clock, no word/page resets and no exceptions for the F rune. All **29** possible starting states are explicitly exhausted. No unknown plaintext symbols or fitted coefficients enter the transition.

The original physical pages carry **[267,273,260,271,269,273]** rune indices, exactly **1,613**. Source p16, 267 runes, is the only seed-selection input. The next five pages (1,346 runes) are a strictly withheld check; the seed may not change at their boundaries.

## Actual original decryptions

A GP29 trigram language model is fixed using the **first 110,000 source-encoded Shakespeare GP runes** from the independent repository source text, with ordinary smoothing0.1. Neither original LP2 ciphertext nor the withheld Shakespeare prose is used in fitting the language profile. All 29 secret initial states are ranked solely by the 267-rune p16 portion.

| Tested stream | p16 training log-score/rune | p17–21 untouched log-score/rune | GP29 full-stream IoC |
| --- | ---: | ---: | ---: |
| Original ciphertext unchanged | **−4.45860555** | **−4.41270457** | **0.03454947** |
| Best original inverse among all29 states, seed **4** | **−4.55653044** | **−4.57424568** | **0.03464331** |
| Genuine independently withheld Shakespeare prose (positive plant plaintext) | around **−2.50** | around **−2.47** | about **0.0602** |

The complete original p16 inverse begins `XHROEBHAETFWGSFPOEOENEODXWMSAEONGE...`. Its displayed output is not grammatical GP-native prose. Every seed's inverse exactly reencrypts all 1,613 original runes; that is a bijective-implementation requirement, not evidence of a correct historical cipher.

A stronger **key-free structural property** makes the test a complete rejection of this model on p16–21 in native GP-English: because the 29-state quadratic transition is many-to-one, all 29 possible original initial states have **exactly coalesced by original offset 89**. Beyond offset89, every possible initial secret produces *the same forced plaintext*, independent of the language model or seed selection.

Preserving the canonical original printed word boundaries across pages yields **17 genuine one-rune words** in the six-page receiver at local offsets

```
21,119,244,380,386,414,455,471,596,
712,871,937,989,1032,1491,1557,1574.
```

Ordinary native-GP English one-rune words should be **A, I or O** (GP indices `24,10,3`). Of the **16** one-rune words strictly after the key-state convergence, only **three** decode to A/I/O under *every* possible secret initial state, leaving **13 forced contradictions**. At the first one-rune word, prior to convergence, granting an arbitrary starting seed can improve the entire 17-word fit to at most **4/17**. These are more decisive than a modest trigram score threshold: no choice among all 29 initial states fixes the 13 independently printed one-rune words.

This structural verdict depends on printed word boundaries surviving the cipher, an ordinary native English language and the exact source quadratic operating continuously. An invented word-initial bypass, alternate source language or extra secret state is a different cipher requiring its own clue; it cannot be used to salvage the present hypothesis.

## Independent positive plaintext-recovery controls

1. **Blind held-out natural text:** encode all **217,106** Shakespeare runes under the canonical GP29 convention; train on positions0–109999. Take the independent authentic prose at positions120000–121612, encrypt all **1,613** runes with hidden seed24 and this exact nonlinear transition, then perform the *same 29-seed search* on the plant's first267 ciphertext runes. It ranks **24 first**, recovers all **1,613/1,613** real GP-native plaintext runes and predicts the withheld next **1,346/1,346**, with exact complete reencryption. It tests actual ciphertext-only key recovery, not merely known-key roundtrip.
2. **Known solved-LP2 passage:** repeat the genuine source-original **95 GP runes of solved p57** to reach the original 1,613-position receiver shape, encrypt under secret seed24, and verify complete exact decryption of **1,613/1,613** runes. This independently grounds the alphabet and inverse in real Cicada plaintext without assuming that its repeated content resembles a natural independent prose sample.

## Decision

**Reject this entire 29-state, source-p39-keyed, quadratic ciphertext-feedback cipher as the direct full-p16–21 native-GP plaintext mechanism.** The mathematically exact state collapse and original singleton-word contradictions exclude all seeds, independently of score-model choice. The substantial difference between planted-English and unchanged-source trigram scores corroborates the result; the blind positive proves the implementation can indeed recover a known concealed message and predict genuinely withheld text when the proposed cipher is real.

The original quadratic/repeated-root24 observation remains useful as a *source structural clue*, but the p16–21 corridor does not disclose a usable author key or readable text under this model. No evidence licenses fitted state resets, new quadratic coefficients, or language-generated punctuation changes after this negative. Additional p16–21 work should prioritize authentic key or opcode discovery rather than repeatedly forcing this source polynomial through increasingly elaborate state models.

**Reproducer:** [read-only single runnable Windows CommonJS test](../sims/lp2_p16_p39_nonlinear_forced_state_sft.cjs), Node.js22, using the exact source `resources/liber-primus/lp2-corpus.json`, original `resources/liber-primus/lp2-transcription.txt`, independently sourced `resources/control/shakespeare_first300k.txt`. The original decryptions and controls were executed directly against these three GitHub source files, and the full committed SFT then **passed on Windows Node22 in [GitHub Actions run 44977177846](https://github.com/FlareZ123/liber-primus/actions/runs/44977177846)**, including all 29 exhaustive original states and both withheld positive inversions.
