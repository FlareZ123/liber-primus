# Predecessor-skip and page-secret five-phase alphabets: original all-key gate

**14 November 2026, Agent 11. Classification: exact finite-language-register exclusion with positive cipher plants.** No unknown LP2 plaintext, source-selected secret key, authenticated cipher, or final destination recovered. Reproducer: [single-file Windows Node22 SFT](../sims/lp2_rankskip_fivephase_allsecret_sft.cjs), [successful source-original manual run 43623857928](https://github.com/FlareZ123/liber-primus/actions/runs/43623857928).

## Why this route was a genuine separate hypothesis

The original LP2 text (pp0–55, excluding runeless p50) displays **86/12,901** identical neighboring runes and a source-conditioned excess of **104/2,105** identical five-apart runes **inside printed words**. Three original five-circle decorations on p7/p23/p56 make a period-five word mechanism visually imaginable. A predecessor-exclusion encoder would account for the scarcity of equal adjacent ciphertext values without discarding information: its otherwise forbidden repeat can carry one exceptional plaintext rune. The other 28 values can encode the remaining 28 symbols in order. This is a reversible, nonlinear alternative to the already-excluded *modular-additive* one-back feedback [all-secret family](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md). It does not claim that the creator actually selected a marker, phase or specific key.

For each complete printed word and rune position \`j\`, grant an **arbitrary hidden GP29 alphabet permutation** \`sigma[page,j%5]\`, independently for every physical page and five word-relative positions (275 secret maps). At each word start, emit \`C[0]=sigma[page,0](P[0])\`. For \`j>0\` let \`u=sigma[page,j%5](P[j])\`, \`v=C[j-1]\` and choose **one fixed but completely unknown marker** \`m in 0..28\`. The nonlinear bijection is

\`\`\`text
if u == m: C[j] = v
else:
    rank = u - (u > m)
    C[j] = rank + (rank >= v)
\`\`\`

The exact inverse is \`u=m\` whenever \`C[j]=v\`; otherwise \`rank=C[j]-(C[j]>v)\` and \`u=rank+(rank>=m)\`. Finally apply \`sigma[page,j%5]^-1\`. This is valid for all 29 input symbols at every inner-word position and is bijective for every marker and every secret map. Word phase and predecessor state reset at printed word boundaries; for the 32 words crossing physical page boundaries, the relevant secret map belongs to the physical page on which the emitted rune appears.

## All 29 markers and all possible page×phase secret keys, without searching them

Because changing \`m\` merely relabels the 29 possible inverse-rank outputs, **same-class equality is preserved for all marker choices**. An additional page×phase secret alphabet permutation likewise cannot change equality among observed values in a group. Accordingly, the 275-class collision count on original runes is an exact key-blind necessary condition for the entire family.

The SFT reads the original 2,896 complete words from \`resources/lp2-transcription.txt\`, validates every one of their 12,956 original GP rune indices against \`resources/liber-primus/lp2-corpus.json\`, then groups all 10,060 noninitial word symbols into physical-page × word-position mod5 classes.

| Register | Eligible within-class pairs | Equal pairs | Rate |
| --- | ---: | ---: | ---: |
| Original, inverse predecessor-rank (all **29** markers) | **231,190** | **8,218** | **0.0355465201782** |
| Native Shakespeare controls (250 exact-original-length books) | 231,190 each | min rate 0.0821835 | 0/250 ≤ original |
| Native Gibran controls (250) | 231,190 each | min rate 0.0786799 | 0/250 ≤ original |
| Native Emerson controls (250) | 231,190 each | min rate 0.0756088 | 0/250 ≤ original |
| Native Latin Vulgate controls (250) | 231,190 each | min rate 0.0768156 | 0/250 ≤ original |

Native control source, word-length sampling method, orthography and four fixed xorshift-style LCG seeds match the preexisting [modular additive five-phase gate](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md). The control dictionary is **not** expanded after inspecting original results. The two families have different original ciphertext transforms: modular differences previously give **8,277** same-class equal pairs, whereas exact predecessor deletion gives **8,218**. Despite the broader nonlinear transform, neither approaches native-GP English/Latin baseline under one page-reused five-phase alphabet per page.

**Positive control:** exact length-preserving source-native English plaintext is enciphered with 275 independently randomized secret permutations. For independently frozen markers \`m=0,6,28\`, all **12,956/12,956** planted GP symbols decode exactly. The calculated equality counts on original plaintext and on inverse-ranked ciphertext are equal. The Windows Node22 CI run passed all source identities, all-marker collision invariance and positive round-trips.

## Decision

**Retire this entire fixed-page five-phase, predecessor-exclusion family for the tested source-native English and Latin registers and original word segmentation.** A stationary rank-skip feedback transformation **does not** reconcile both manuscript anomalies with ordinary English, even granting 275 arbitrary secret alphabets and the choice of any 29-sentinel marker. The fifth-apart repeat phenomenon is insufficient: across positions sharing a phase, the transformed source is much too collision-poor to represent the tested prose registers under fixed bijections.

This test does **not** exclude independent secret maps per *word*, changing-state alphabets, variable-length rune coding, unpublished key material, non-English registers, changed word breaks, or other genuinely nonlinear feedback. A return to this direction requires a source-selected evolving key/state or an original plaintext span, rather than another fitted marker or a new per-page alphabet.