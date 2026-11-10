# A constructive keyed inverse for the candidate LP2 lag-six collision rewrite

**Class:** conditional, artificial-positive decryptor; **no original LP2 plaintext or original key recovered**. Agent 39, 2026-11-10.

The forward generator in [the consolidated joint analysis](lp2-forward-generator-joint.md) can overwrite a tentative ciphertext rune only when that tentative rune equals the previous **published** rune. Thus, **when the underlying additive keystream K is known**, any original tentative cipher rune must have been either the published rune `C_i` or the preceding published rune `C_(i-1)`. This exact two-element candidate set is independent of the source language.

The [new decoder](../sims/lag6_repair_keyed_inverse.cjs) analytically enumerates both possibilities. For a word position `i>=6`, the rewrite candidate is legal only where the observed output equals `T(C_(i-6))`. At earlier positions `i<6`, a replacement rune may be any different rune, and a rewrite candidate has emission likelihood `q/28`. At later eligible positions its likelihood is `q`. The literal candidate uses emission probability 1, or `1-q` for an unchanged adjacent collision, with the special case `T(C_(i-6))=C_(i-1)` handled exactly. Each candidate plaintext rune is then `(candidate-K_i) mod29`, and an independently trained GP-English **word-position prior** chooses between them. This is local maximum-posterior decoding; a full n-gram or whole-word decoder could incorporate more context.

## Executed heldout artificial inversion

A source text in Shakespeare was split before generating data. The first **240,000 characters** train a 29-rune word-position frequency prior; English GP-encoded words from the trailing **60,000 characters** are sampled at all **2,896 exact LP2 whole-word lengths**, with three rare lengths filled by contiguous heldout GP-rune excerpts. An independent key of **12,956 uniformly sampled modulo-29 digits** and a fixed-seed collision rewrite probability of **0.81** generated an artificial ciphertext, using the same deterministic `T` rewrite at word-local positions `i>=6` as the joint forward model.

[Successful 2026-11-10 CI run 42763019345](https://github.com/FlareZ123/liber-primus/actions/runs/42763019345) recovered the planted source under the *known key*:

| Inversion measurement | Actual synthetic control |
| --- | ---: |
| Synthetic source runes | 12,956 |
| Actual overwrite events | **367** |
| True rune in enumerated candidate set | **12,956/12,956** |
| Naive inverse ignoring rewrites | **12,590/12,956 (97.175%)** |
| Posterior inverse with word-position prior | **12,681/12,956 (97.877%)** |
| Net additional correctly recovered runes | **91** |
| Positions with two tentative-symbol choices | 11,671 |
| Positions selected as rewrites by posterior | 181 |

The exact candidate-set coverage is **100% by construction and asserted in the test**; it reflects algebraic invertibility into a small ambiguous set, not successful classification of every altered rune. There remain **275** wrongly chosen runes with this simple local language model. A more powerful contextual word or sentence decoder is a specific, implementable next attack. The vast majority of possible ambiguities occur in short-word positions where the rewrite output was uniform; their *prior* chance of a rewrite is small, and language context can improve classification.

The model has an important limit: the original ciphertext offers no actual additive key `K`. Neither this test nor the source-derived key searches recovered one. The test does **not** claim an original LP2 word decipherment. Stronger work should bring a source-constrained key generator and exact key-state tracking into the inverse, then require independently predicted original ciphertext and readable heldout plaintext. The original source and exact 500-trial compatibility evidence remain in [lp2-forward-generator-joint.md](lp2-forward-generator-joint.md).

Reproduce: `node sims/lag6_repair_keyed_inverse.cjs` on Node 22, source `sims/lag6_repair_keyed_inverse.cjs`, on-demand workflow `.github/workflows/lag6-repair-keyed-inverse.yml`. The first pilot run 42762937401 failed because its strict heldout word corpus had no length-14 word; the successful test explicitly uses a heldout contiguous excerpt for three unsupported lengths and records that fallback.
