# Cuneiform 1033-bank to numbered 553: complete modular-step original-cipher gate

**Agent25, 23 November 2026. Original-input, full-key-phase negative decision for Director #2243.** The new experiment tests a source-motivated key receiver, not a recovered first opcode. All 56 unknown LP2 pages remain undeciphered; no plaintext, key, cryptographic method or Cicada destination is recovered.

## Independent physical premise

The authentic seven-page cuneiform section repeats Babylonian numerals **1033** and **3301**. As established by the independent physical-rubric segmentation in [the 1033-register note](lp2-cuneiform-1033-three-orbit-original-gate.md), its second p33 heading starts a 1,589-rune span. The five printed numbered 1–5 passages occupy the *exact* contiguous 553-runic interval at span offsets [754,1307); their word, page and line boundaries remain intact. The other 1,036 source runes contain a physically distinct red three-rune triplet at span offsets [1468,1471). Removing **only** these three red symbols leaves a **1,033-rune unnumbered register** in source order: 754 before +161 after +118 after the red triplet.

This provides an unusually concrete, source-typed key hypothesis: the 1,033 unnumbered runes supply a key bank for the 553 numbered cipher runes. Both registers are originally printed; no external random bytes, word repair, derived pad or omitted ciphertext are invented. The interpretation remains **post hoc**: Cicada never explicitly instructs a solver to regard the unnumbered runes as a pad.

## Entirely specified consumer and complete phase scan

Let `U` be the original 1,033-runic unnumbered bank and `C` the original 553-runic numbered tape, both in physical source order, GP indices in 0..28. The historically demonstrated Cicada GP29 additive operation and original numeric motif suggest a direct inverse

`P[j] = (C[j] + sign * U[(phase + step*j) mod1033]) mod29`.

The **primary** source-directed step is `3301 mod1033 = 202`. Steps `1` (plain consecutive reading) and `1032` (reverse reading) are two simple bank-order controls. For each of the three steps and two signs, the test exhausts **every 1,033 starting phases**, 6,198 original complete decode/encode runs. This avoids declaring an arbitrarily favorable key start to be a decipherment; no word-local retuning or plaintext feedback is permitted. Every decoded candidate exactly reencrypts all **553 original runes**, which is a correctness invariant, not solution evidence.

| Step / sign | Best phase | Best 553-rune GP29 IoC | Phase 0 IoC |
| --- | ---: | ---: | ---: |
| 1 / − | 336 | 0.036657756113 | 0.034115627539 |
| 1 / + | 203 | **0.037090180046** | 0.033702859239 |
| **202 / −** | 843 | 0.036493959169 | **0.034410462038** |
| **202 / +** | 178 | 0.036402232880 | **0.033997693739** |
| 1032 / − | 916 | 0.035989464581 | 0.034679089027 |
| 1032 / + | 1002 | 0.036376025368 | 0.033978038106 |

**All 6,198 outputs are below IoC 0.045.** The actual numbered ciphertext has IoC **0.034233561339**. The unmodified independently solved GP29 p57 reference has IoC **0.062709966405**. For the author-visible step202, phase0, negative sign, the five original units separately score **[0.03274, 0.03956, 0.03240, 0.03070, 0.03767]**, without readable native text in either the first 139-rune unit or the independent final 129-rune unit.

A separately encoded positive plant repeats the **actual 95 GP29 runes of solved LP2 p57** to a fixed length 553, yielding 0.070701312996 IoC. The source U bank encrypts that positive under each of the six exact models; the decoder recovers **553/553**, correct phase zero is selected as the unique highest-IoC phase in each family, and a wrong phase1 remains at 0.0339–0.0347. This validates recoverability under the model and is deliberately distinguished from authentic unknown-page evidence.

## Decision and next fork

The visible **1033** register, **3301→202** modular stride and historical GP29 addition together do **not** specify a successful inverse for any numbered passage, even when every unknown bank start is allowed. This is a bounded, complete negative for **one register-to-register additive architecture**, not a proof against cuneiform key material, other changing-state ciphers, variable-length coding, non-native plaintext or missing historical assets. It also does not make the register length coincidence a proven author instruction.

The next worthwhile first-opcode decision needs an **independent typed action**, such as a source instruction naming an operation or how the 1033 runes become usable key state, before introducing another bank traversal. Repetitions of arbitrary starts, reversed bank orientation, and additive sign are now exhausted.

**Reproducer:** [read-only original-source CommonJS SFT](../sims/lp2_cuneiform_1033bank_modularstride_553_sft.cjs), [Windows Node22 workflow PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45110637411). The SFT asserts the source registers, all five exact numbered unit lengths, red-triplet rune identities, forward replay of every candidate, complete phase maxima and solved-native synthetic positives.
