# Original LP2 exact T-overwrite inverse with source-derived eight-column stream keys

**Evidence class:** exact conditional key-likelihood attack, genuine original-ciphertext negative, planted hidden-key positive. **No LP2 plaintext, original key or established encryption mechanism recovered.** Agent 39, 2026-11-10.

## Unexplored joint candidate tested

Original LP2 contains **12,956 runes in 2,896 complete words**, separated into eight substantial text groups of rune lengths **729, 1,145, 1,729, 1,903, 1,021, 1,524, 1,589, 3,316**. The printed base-60 grid (LP2 pages 49–51) has eight columns of 32 bytes each. Previous experiments screened these literal bytes as stream keys under a direct additive cipher or key-skip/unknown outer alphabet models. This attack tests a distinct, ciphertext-motivated **actual T-overwrite** mechanism, and evaluates key candidates using a normalized **marginal word likelihood**, incorporating both lexical probabilities and context.

The candidate generative model is:

1. Assign each text section exactly one of the eight grid columns, with **all 8! bijections** admissible.
2. Generate a modulo-29 additive pad from that column using AES-256-CTR or ChaCha20 with zero 16-byte IV. Test natural/reversed byte order, output-byte modulo29/scaled29, and additive sign. This yields 16 mode families × 8! assignments.
3. At each canonical rune position form tentative symbol \`X_i=(P_i+K_i) mod29\`. If X equals the preceding **published** cipher rune, with probability q=.81 overwrite the output. At local word positions 0–5, use a random different symbol; at positions 6+, publish \`T(C[i-6])=(24-2C[i-6]) mod29\`. Previous published output persists across all genuine word, page, and section boundaries. The pad stream restarts at text-section boundaries.
4. Sum over **every** legal latent collision rewrite for each observed original word. For a known key, the tentative rune is either published \`C_i\` or previous published \`C[i-1]\`; a word-local T rewrite is only possible if \`C_i=T(C[i-6])\`. The source prior mixes a Shakespeare-trained **GP-English word-frequency trie** (95%) and smoothed GP-English trigram model (5%). The likelihood is the exact wordwise sum of \`P(source word) × P(observed cipher word | source word, key, history)\`, rather than the maximum word fit.

The additive model's output-rewrite rule was chosen from earlier real-LP2 statistical anomalies; **the model is a hypothesis**. The source corpus is the first 200,000 characters of the fixed Shakespeare control. The 0.95 mixture was chosen **before the original grid-key screen** using an independent Shakespeare synthetic validation set in [the contextual inverse work](lag6-keyed-rewrite-inversion.md). The independent corpus parser supplies intact canonical words even across physical-page wraps. The exact global previous-ciphertext symbol is retained at text-section transitions.

For each candidate mode, score the **first 55% of complete words separately within each section** (7,087 original runes). Optimize the exact 8! assignment using dynamic programming, then freeze both mode and assignment and evaluate the held-out last 45% words in those sections (5,869 original runes). The selection and holdout scores are joint log marginal likelihoods. Every shuffled-grid control re-runs the complete candidate search, including the mode and assignment optimization.

## Actual executed key recovery test

[Successful corrected CI run **42768732453**](https://github.com/FlareZ123/liber-primus/actions/runs/42768732453), Node 22, includes the exact page/word parser regression, a hidden-key positive control, all original candidate settings, and eight full-family shuffled-grid controls.

| Case | Candidate and assignment | Training log marginal (7,087) | Frozen held-out log marginal (5,869) |
| --- | --- | ---: | ---: |
| Held-out **synthetic** GP-English with true table-derived key | AES-256-CTR, forward, byte mod29, positive sign; **[5,1,7,2,0,4,3,6]**, recovered exactly | **−11,301.893** | **−9,760.825** |
| **Original LP2**, best trained candidate | ChaCha20, forward, scaled29, negative sign; **[7,1,0,3,4,5,6,2]** | **−47,399.654** | **−40,231.144** |

The synthetic source is from an untouched 60,000-character Shakespeare holdout, sampled to **all 2,896 original word lengths**. Its exact known encryptor used the printed source-grid keys but permuted the eight columns secretly, plus **363 actual collision overwrites**. The source/section assignment, AES-vs-ChaCha setting, key orientation, reducer and sign were unknown to the screen. **The true configuration ranked first** among the entire 645,120-candidate space; all eight column placements recovered exactly. The score gap gives a powered control for one correct member of the named family.

Original LP2 produces **no interpretable English-like GP plaintext**. Under the best actual mode, only **185 / 2,896 complete words** select the trained lexicon path in the MAP preview; the remaining wordstrings are predominantly unrecognizable. The original key family has held-out log score **−40,231**, dramatically below the true-key plant's **−9,761** on the same original word layout. This difference is a *source-model diagnostic*, not a calibrated p-value across possible unknown alternate languages.

For a matched empirical original-key null, independently shuffle the **32 byte positions within each of the eight columns**, preserving per-column byte multisets but destroying original order. Across eight fixed-seed null books with identical candidate searches:

- Four of eight nulls have a training-selected maximum at least as favorable as the real grid: plus-one empirical upper-tail **5/9 = 0.5556**.
- Two of eight shuffled-key winners achieve a held-out likelihood at least as good as the real grid's heldout likelihood: plus-one empirical upper-tail **3/9 = 0.3333**.
- The true original 8-column byte ordering is therefore **not preferred** in this small fully matched test.

The eight-replicate null is deliberately finite: the observed candidate already falls squarely inside the shuffled-grid range, so extending the same null grid hundreds of times would provide little new evidence. The earlier test [42768335636](https://github.com/FlareZ123/liber-primus/actions/runs/42768335636) used the same generator but set the previous cipher symbol to a sentinel at the start of each section. The corrected test **42768732453** retains the actual previous section's final cipher rune. Cite the corrected run for final original-score numbers.

## Cryptanalytic consequence

This exact source-derived **AES/ChaCha + eight-column assignment + hypothesized T-collision-rewrite + GP-English word marginal likelihood** combination supplies no sign of original LP2 decryption. A correct key from this family is powerfully detectable in a planted control under the same manuscript's word layout, and the best original fit is statistically typical of shuffled keys. It specifically closes the possibility that earlier direct-key negative tests missed these keys merely because their decoder failed to invert a deterministic T overwrite. It does **not** exclude a different key derivation, different nonce, variable consumed-key pointer, hidden outer alphabet, altered word source, unknown cipher family, or an algorithm that uses the 256-byte numerical grid for an unrelated stage.

Do not re-run this candidate family with more guessed IVs merely to improve its already weak original key score. A promising next key requires external source constraints or a genuinely different decipherable structural mechanism. The original key/word recovery bottleneck remains open.

**Reproduce:** [\`sims/grid_contextual_T_keyscreen.cjs\`](../sims/grid_contextual_T_keyscreen.cjs) with Node22, source test module [\`sims/lag6_repair_contextual_inverse.cjs\`](../sims/lag6_repair_contextual_inverse.cjs), source data under \`resources/control/\` and corrected \`resources/liber-primus/base60-grid.json\`. Opt-in workflow [\`.github/workflows/grid-contextual-T-keyscreen.yml\`](../.github/workflows/grid-contextual-T-keyscreen.yml) runs the canonical-parser regression first. Positive source seed \`0x39a317\`, collision seed \`0x39a318\`, full-family shuffled-key seed \`0x39a319\`; output preserves the exact selected mode, all 8 column indices, scores, real decoded previews and eight null score pairs. This workflow never runs automatically on push.
