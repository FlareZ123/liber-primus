# Latent-word private affine ramps with shared predecessor feedback

Agent5, 26 November 2026. No unknown plaintext or key recovered. This receiver is distinct from intact-printed-word affine ramps and the continuous shared affine-feedback law: each **latent true word** has independent nonzero a and arbitrary b,t, with a shared h in GF29:
C_i = h C_(i-1) + a P_i + b + t j (mod29),
where j is the consuming position within the true word. In the F-hold variant P=0 emits literal C=0 and does not increment j; the following predecessor is the actual last emitted C. Ordinary consumption is also tested. The historical alphabet and finite GP lexicon are fixed; no first-party instruction selects this exact combined law.

For any h, form Y_i=C_i-hC_(i-1). On the active positions of a word, second differences satisfy Δ²Y=aΔ²P. Normalize each nonzero second-difference vector by its first nonzero component; zero vectors match zero only. This gives a necessary **and sufficient** lexical shape match, with exact recovery of a,b,t (or a compatible witness when rank deficient). A mask-indexed dictionary permits all latent boundaries and all visible F choices. The exact prefix marginal sums complete and partial-word paths, using uniform private a,b,t and the same 31,629-form weighted dictionary with 5% singleton fallback as the q8 receiver. MAP is a separate maximum path, forward-replayed exactly. Earliest-ending interval scheduling gives exact maximum disjoint lexical anchors at each active-length threshold for each h. Unknown predecessor before the chapter can change only intervals touching its first rune, so the zero-seed maximum plus one is a conservative upper bound over arbitrary seeds.

Held-donor controls of 716 runes with a 515/201 cut select h=1 and h=17 exactly, ordinary and F-hold respectively, with held MAP accuracy 94/201 and 64/201; weak due to private mask ambiguity. Fit/held log likelihood per rune −3.258232/−3.155501 and −3.174168/−3.293264, matched pad held −3.437928 and −3.406609. All planted dictionary-covered anchors retained. The original shorter chapters are nonprose at their frozen prefix choices:

| Original body | Clock | Selected h | Prefix | Held |
|---|---|---:|---:|---:|
| p0–2 | ordinary | 21 | -3.396676 | -3.433528 |
| p0–2 | F hold | 3 | -3.395112 | -3.426035 |
| p54–55 | ordinary | 25 | -3.387977 | -3.450927 |
| p54–55 | F hold | 25 | -3.403797 | -3.446576 |

All 29 h values tested for the 3008-rune floral chapter p40–53. Compare exact maximum disjoint anchors, granting arbitrary seed with +1, to the minimum actual fully contained lexicon-covered long words over every equal-length Gibran/Shakespeare/Emerson window.

| Active length at least | Ordinary upper / donor min | F-hold upper / donor min |
|---:|---:|---:|
| 7 | 31 / 50 | 27 / 47 |
| 8 | 5 / 20 | 5 / 15 |
| 9 | 1 / 6 | 1 / 5 |

This is an all-h, all-word-private-affine-ramp exclusion for the tested fixed native-English register and both clocks on p40–53, **without printed boundaries**, even with an arbitrary chapter seed. Not a universal English impossibility, nor exclusion of changing h, another alphabet, nonlinear private masks or length changes. The short-chapter likelihood results are conditional weak-decoder negatives.

Reproduce with `node sims/lp2_latent_feedback_affine_ramp_sft.cjs p40 hold`, also p0/p54/0/1 and ordinary without the hold argument. Raw files `im-results/lp2-latent-feedback-affine-ramp-{0-ordinary,1-hold,p40-ordinary,p40-hold,p0-ordinary,p0-hold,p54-ordinary,p54-hold}.json`. Repository JS cores executed against repository resources via connector runtime, no standalone Node/CI run.
