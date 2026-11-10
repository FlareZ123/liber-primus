# Agent 9: unknown outer rune permutations and hidden key skips

Claimed at 2026-11-10T01:51:15.246473Z after mandatory random draw 4 (normal mode). Primary aim is complete LP2 decryption. No actual LP2 plaintext or recovered key yet.

## Distinct attack lane

An arbitrary outer substitution sigma applied after 29-ary additive encryption appears largely absent from prior model-family screens: C_i=sigma((P_i+K_j) mod29). For an ALIGNED candidate K and independent plaintext priors q_i, the optimal arbitrary inverse sigma is a 29x29 maximum-weight assignment, rather than 29! brute force. This is an exact algebraic reduction only for the specified likelihood. Code: sims/outer_permutation_assignment.cjs and sims/test_outer_permutation.cjs. Their manual CI workflow is .github/workflows/outer-permutation.yml (workflow_dispatch only).

Word positions and word lengths form an unencrypted side channel and substantially strengthen the language prior: sims/outer_permutation_word_context.cjs. Clean synthetic 100-rune fit recovered 23/29 labels, compared to eight with plain unigram. Full 300- to 1000-rune aligned controls recover all 29. Anti-repeat filters consuming an extra key draw wreck naive positional matching.

Skip-aware Viterbi: sims/outer_permutation_alignment.cjs uses one collision-triggered rejected key draw and checks g(c_prev)-g(c_current)=K_{j-1}-K_j mod29 in strict mode. With an oracle sigma, recovers 994/1000 hidden key positions in one synthetic plant. Learned-sigma/Hungarian alternate initialized globally often fails, so initialize from short prefix.

Prefix bootstrapping: sims/outer_permutation_context_alignment.cjs recovered 29/29 sigma and 1114/1200 key indices in a lucky synthetic plant with first skip at 220. Independent power study sims/outer_permutation_context_power.cjs used 50 new arbitrary sigma and mod29 iid pad plants, q=.81 collision rejection, same English GP prior and a matched wrong pad per plant. Baseline prefix-only optimization: 26/50 exact alphabet, 41/50 true key outscored one wrong key, median 89.58% drift accuracy; GitHub CI run 42744668097. Improved search over first skip positions 1..W-1 (widths60,100; top four prefix fit hypotheses + no-skip), 37/50 exact alphabet, 47/50 true key outscored one wrong key, median drift accuracy 98.42%; run 42745114710. These are synthetic paired power checks only, not a calibrated maximum over millions of wrong keys.

Actual LP2 narrow SHA stream study (sims/outer_permutation_sha_probe.cjs): 12,956 runes and 2896 authentic word units, 27 seed phrases x 2 SHA256 counter layouts x 2 additive signs. First 200/350 runes scores not significant after 108-cell correction; top 200 named 2014-01-05 (raw p=.0227), top350 THE WORDS ARE THE MAP (raw p=.0152), neither accepted as key. Rejection-sampled true-key plant p=.467 and 3/29 labels, so this simple screen has poor sensitivity to skip models. Aligned 350-rune true-key plants with no filter or a rewrite-only anti-repeat correction both recovered 29/29, p<.001 against 1000 wrong keys. Exact behavior/limits in im-results/outer-alphabet-skip-alignment.md; manual CI runs 42743845949 and 42744158918.

A stronger real-cipher attack launched 2026-11-10 02:49 UTC: sims/outer_permutation_real_skip_scan.cjs, evaluating first1200 actual LP2 runes under 27 named SHA seeds and joint q=.81 skip/orbit optimization with 250 matched null keys. Check latest outer-permutation workflow run for result, then REVISE im-results/outer-alphabet-skip-alignment.md and memory. A modest raw leading score must never be called plaintext; demand held-out pages, larger familywise null, and English recovered text.

Agent 20 has an exact 29-state phase-marginalized HMM over arithmetic-ramp K_j=a*j and wrote communications/agent9/2026-11-10T0240Z_agent20_skip-hmm-schedule.md. I replied via communications/agent20/2026-11-10T0241Z_agent9_outer-sigma-joint-hmm.md. Agent20 tackles permutations of key-schedule states, while my lane explores unknown OUTER rune alphabet. Complementary.

## Source contracts and nonduplicated work

resources/lp2-transcription.txt: 57 rune-bearing segments separated '%'; 55 unsolved rune pages (LP2 physical page50 is numeric-only), rune alphabet order FU TH O etc (see code), total 12956. Word delimiters -.&$§; slash and page boundary should not be inserted as word delimiters. Correct 2896 words, not 2928. resources/liber-primus/lp2-corpus.json is a page-indexed alternative; control Shakespeare 300k bytes in resources/control/shakespeare_first300k.txt.

Do not repeat broadly negative families: Duko/cicada3301 2026 MEASURED-CEILING, Wulfic MASTER_TRACKER, pnotisdev/cicada3301 STATUS. Existing C20-23 already exclude simple word-reset and reuse, so early singleton/lag/unigram tests were abandoned as redundant. Do not promote reproducibility checks or an unpowered negative to results/README.md.

## Next highest-value actions

1. Read fresh CI results from sims/outer_permutation_real_skip_scan.cjs. If any candidate score is extreme, run 10x more matched nulls and independent held-out data with exact parameters before claims.
2. Improve early-skip search beyond one skip, use exact forward-backward rather than MAP Viterbi, train word bigrams and attempt continuous-pad fresh PRNG families.
3. Test unknown sigma initialization under misspecified GP plaintext language, word boundary changes, and per-page true pad resets.
4. Keep im-results/outer-alphabet-skip-alignment.md consolidated and limited to measured results, all code and controls retained.

No established LP2 decryptions from this run.
