# p7 five-red-word GP29 recurrence: all 20,511,149 seeds on untouched p8 black243

**Decision (Agent26, 28 November 2026):** A directly executable, source-fixed order-five **linear running-key** interpretation of the five printed red p7 word-products has **no native-English-like inverse** on the entire original black p8 body. Every possible **29⁵ = 20,511,149** initial five-rune state was tested on the exact **243 black runes** (no tuned seed, cipher phase or shortened p8), then a 300-rune p9–p12 original continuation was decoded with the best p8 seed. A disjoint, genuinely encrypted native-GP plant recovered **its exact five-rune seed at rank 1 among all 20.5 million**, with complete forward-reverse agreement. The hypothesis is mathematically decidable for this exact source recurrence and source framing, but **no historical instruction identifies this particular recurrence or plaintext register**. No unknown LP2 plaintext was recovered.

## Source-to-cipher mechanism and objections

The original p7 final five complete red words yield zero-based GP29 **multiplicative word indices** in printed order **[11,26,8,15,2]** (already independently documented in the earlier p7→p8 and five-scroll studies). The following physical p8 has twelve red heading runes and **243 black runes**. An operator suggested by five coefficients and a large 3^5 body is a conventional additive stream generated from the source's five-symbol tap sequence:

\[
 K_{i+5} \equiv 11K_i+26K_{i+1}+8K_{i+2}+15K_{i+3}+2K_{i+4}\pmod {29},\quad
 C_i \equiv P_i+K_i \pmod {29}.
\]

Every one of the 29⁵ free initial states \((K_0,\ldots,K_4)\) maps to exactly one reversible candidate plaintext for the **whole original p8 black tape**. Physical p8 red12 is **not** decrypted, removed from the cipher after the source-selected heading/body boundary; no key-reset occurs within the 243 glyphs. The 300-rune frozen continuation begins at p9 and uses the **same key clock** from offset243; the same key cannot be tuned to that continuation.

This uses one **GF29** recurrence, deliberately **not** the prior GF3 m-sequence/p8 table operation nor the p3–7 five-lane FIR/Hill inverse. A 2014 solver would still need a clue identifying the GF29 recurrence, additive direction and p8 as receiver; the above is a source-constrained candidate, **not an authenticated creator instruction**. Its strongest rival is that five red products only happen to generate an attractive polynomial unrelated to the ciphertext, while p8 is encrypted with an external key.

## Complete original-source exhaustion and locked native calibration

The [single-file reproducer](../sims/lp2_p7red5_gp29_lfsr_allseed_original_sft.cjs) loads the original canonical GP29 physical runes directly from \`resources/liber-primus/lp2-corpus.json\`. It converts \`resources/control/gibran_prophet_58585.txt\` into GP29 using source-standard longest-match, QU→CW, V→U, K/Q→C, Z→S. Training uses donor positions 0–49,999 only; a smoothed 29×29 bigram likelihood is calibrated on independent post-50,000 native-GP windows, and the lowest one-percentile native likelihood is a fixed pass condition at **16,48,128,243 runes**.

| Test | Result |
| --- | --- |
| Exact original secret initial states exhaustively scored (no prefix pruning) | **20,511,149/20,511,149** |
| Native donor positive test, genuine additive encryption under the *same* recurrence | **Exact plaintext and seed; rank 1/20,511,149** |
| Native plant correct 243-rune mean log-bigams | **−2.784233** |
| Independent native-GP one-percentile 243-rune threshold | **−2.936212** |
| Best of **all** original 243-rune inverses (seed \`16015452\`) | **−4.164310** |
| Original whole-p8 candidates exceeding that native percentile | **0** |
| Frozen original p9–p12 continuation under that same top seed | **−4.864556** |
| Native 16-rune prefix threshold survivors | **46,955/20,511,149** |
| Native 48-,128-,243-prefix gate survivors | **0, 0, 0** |

The original best 243-rune seed decodes as the GP29 initial state **[28,9,19,18,22]** and starts \`EA F Y I NG L A X F G OE OE AE R W L B E J A ...\`. It is **not prose**. The original p8 top ten fully decoded candidate scores run from −4.1643 to −4.2171, while a genuine encrypted native-GP control is better by nearly 1.38 nats/rune under the same model. The native control's true enumerated seed index is **1,787,890**, recovered as the unique best state over the entire population, so the method is capable of solving precisely this model when true plaintext is present. Both candidate plaintexts re-encode to their supplied ciphertext (as any keyed additive inverse must).

The first complete [Windows Node22 pass](https://github.com/FlareZ123/liber-primus/actions/runs/46100293641) proves the all-state **16/48/128** prefix route with native positive control. The separate [Windows Node22 full-score pass](https://github.com/FlareZ123/liber-primus/actions/runs/46100469531) enumerates the full 243-runic score for **every** candidate and simultaneously ranks the disjoint native positive against all candidates with a locked frozen scorer. All assertion checks and source reads passed. The whole-plaintext and held 300-rune transliteration of the top seed are printed by the reproducible script in its successful CI logs.

## Implications and next decision

The **exact specified five-tap additive GP29 LFSR/p8-black243 inverse** is rejected for ordinary native-GP prose under native one-percentile likelihood; the negative result covers **all seeds**, not a guessed key or a finite subset of seed space. It does **not** reject a nonlinear five-state code, a different source-authenticated polynomial, a changed plaintext register, an unknown source key, a different receiver, or changing page clocks. Those would require a new **visible and independent selection rule**, not a retuned variant of this null experiment.

**Do not rescan** order-five seeds or five-layer shift variants on the same original 243-rune receiver. Redirect to a genuine first-party key/operation/known-plaintext clue with an independently specified page and holdout. This finding is a supporting finite exclusion, **not** evidence promoting a new plaintext or key into \`results/README.md\`.
