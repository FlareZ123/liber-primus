# Spacing-free prime-totient residue permutation with authentic F holds

**Agent3 · 24 November 2026.** Two full planted keys recovered and 200/200 withheld native runes, but no unknown original LP2 plaintext. This is a predictive failure of the specific search, not an all-key exclusion.

## Source route and rival

Original p56 genuinely uses successive ordinary-prime minus one shifts in GP29, with transparent plaintext F. The exact Anglo-Saxon Rune Poem ordering independently constrains the native alphabet. Ask whether an earlier chapter uses the same clock but a secret substitution of the 29 shift residues. This extension allows a full 29! permutation rather than the prior affine extension. It is not an authenticated source-selected permutation or clock origin. The strongest rival is that p56's clock is local to that page and the unknown text uses a different mechanism.

The earlier [all-secret state permutation gate](lp2-prime-totient-allsecret-page-state-original-gate.md) assumes no hidden F pauses; [affine-prime F-hold gate](lp2-affine-prime-fhold-singleton-original-gate.md) constrains the mapping to affine slopes and uses A/I(/O) printed singletons. Here no printed boundary is assumed to be a plaintext boundary, and all legal F interpretations enter the initial search.

## Reproducible attack

For non-F plaintext GP index P, emit C = (P + K[(prime_j - 1) mod 29]) mod 29 and advance j. For plaintext F (index 0), emit literal F and do not advance j. K is an unknown permutation of 0..28, prime ordinal starts at zero on each frozen region. Prime 2 is the first prime.

Enumerate every prefix ciphertext-F hold mask (cap 16 F). For a fixed mask, each consuming position identifies a public prime residue r. For every candidate shift k, forbid k if any consuming ciphertext at row r equals k; otherwise score the decoded symbols by a target-excluded, add-one GP unigram. An exact maximum-weight Hungarian assignment returns one highest-unigram legal permutation per mask. Literal F contributes its native unigram log probability. Thus the maximum across all masks is an **exact maximum unigram score for this key family**, although the individual assignments are not all possible keys.

For prediction, rank these representative keys/paths by the smoothed native trigram score. Refine the top 16 prefix assignments by deterministic best-improving pairwise key swaps (up to 40 passes each, retaining each candidate's F mask and rejecting illegal consuming F). Choose the highest prefix trigram score, freeze its key, prime cursor and language context, then enumerate all suffix hold masks under that fixed state. This second stage is a heuristic, not exhaustive trigram optimization. No original suffix chooses the prefix key, and no plaintext word boundaries enter training or inference.

Native training excludes WELCOME, first KOAN and authentic p56. It uses the other six solved source records, add-one unigram and hierarchical bigram/trigram backoff weight 10. Authentic p56 known-key encryption replays all 85 source runes. Independent WELCOME and KOAN1 plants use seeded random permutations, 208 prefix and 100 withheld runes; both true plaintext donors are excluded from the model. The authentic 60/25 p56 arbitrary-permutation blind control is underdetermined and fails, despite exact known-key replay. The two longer plant permutations are not inferred from the source; they calibrate the new inverse.

## Actual results

| Receiver | Prefix/holdout | Feasible prefix masks | Prefix trigram nats/rune | Frozen suffix paths | Suffix nats/rune | Known key; prefix; suffix matches |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| authentic-p56 | 60/25 | 16/16 | -2.483622 | 2 | -3.995155 | 7/29; 15/60; 7/25 |
| plant-0_welcome | 208/100 | 16384/16384 | -2.848850 | 2 | -2.758294 | 29/29; 198/208; 100/100 |
| plant-0_koan_1 | 208/100 | 16/16 | -2.331734 | 1 | -2.255142 | 29/29; 208/208; 100/100 |
| original-p54-55 | 208/100 | 8/8 | -3.633875 | 0 | — | unknown |
| original-p40-41 | 200/100 | 128/128 | -3.500822 | 0 | — | unknown |

Both native plants recover **29/29 key values and 100/100 suffix runes**, with exact complete ciphertext replay. The WELCOME prefix is only 198/208 correct (hold-mask ambiguity). KOAN1 is 208/208. Authentic p56 blind arbitrary-permutation recovery obtains only 7/29 key assignments and 7/25 heldout symbols. A small page does not identify an unconstrained permutation.

The original p54–55 region is the entire 308-rune terminal chapter, immediately adjacent to solved p56. The independent p40–41 receiver is the first 300 runes of the p40 chapter. Every prefix F mask admits at least one permutation, but neither frozen top key admits any legal continuation. Prefix language scores are below both 208-rune native plant controls.

## Exact full-region unigram bound, separate from prediction

After freezing/evaluating the prediction, independently compute the exact maximum unigram score across every full-region F mask:

| Receiver | Full masks with a feasible assignment | Maximum unigram nats/rune |
| --- | ---: | ---: |
| Original p54–55 | 64/64 | -3.257821154742 |
| Original p40–41 first 300 | 8192/8192 | -3.230829623539 |
| Native KOAN1 plant | 64/64 | -2.909730380887 |

Native WELCOME true plaintext has score -3.034616003095; its full assignment search is skipped because it has 18 ciphertext F (above cap). Both original exact maxima are worse than these two native prose donors' actual scores. This is a quantitative language constraint on **every** permutation and every F-mask in the two frozen original regions, not merely the heuristic winner. It is not a universal English lower bound or a statistical significance claim. Full-original feasibility is positive, so a lack of legal continuation for the fitted key does **not** establish impossibility of the whole family.

## Decision and reusable contribution

Retire this fixed prime2-start predictive transfer on the two original targets. Do not reuse them to tune mask counts, candidate count, prime origin, or training model. The exact assignment plus prefix-only trigram refinement is a reusable attack for a source-selected public residue clock. A future source selector or a new independent calibration can justify applying it to a different clock; arbitrary offset expansion is not supported here. No authentic unknown plaintext, complete unknown-page inverse, or new source key.

- [Runnable CJS SFT](../sims/lp2_prime_residue_permutation_fhold_spacingfree_sft.cjs) — run from repository root with Node; no dependencies.
- [Complete output](lp2-prime-residue-permutation-fhold-spacingfree-output.json).
- Source: canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [native solved corpus](../resources/external/relikd-solved-gp29-native-v1.json).
- Implementation checkpoint: [bc3ef36](https://github.com/FlareZ123/liber-primus/commit/bc3ef3681b4eeb6384f3630fb134f2f6624b40e9).
