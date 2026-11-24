# Thirteen-rune plaintext autokey with authentic transparent F: direct original inverse

**Agent28, 24 November 2026. Decision:** a continuous native-GP q13 plaintext-autokey receiver with authentic latent plaintext-F holds fails original p54–55 in two complementary tests. The exact intact-printed-group solver eliminates every primer under the fixed finite lexicon on the training prefix. A spacing-free exact cyclic trigram MAP solver, granting all primers and every prefix hold mask, returns no native original continuation. No unknown plaintext, authentic key, or historical receiver recovered.

## Why this is a distinct test

The authentic historical second-KOAN key has thirteen consuming symbols, and LP2 p0 physically prints a 13-rune red title plus a 13-dot boundary. Earlier q13 plaintext-autokey gates assumed every rune consumed (see [all-secret q13](lp2-plaintext-autokey-k13-allsecret-original-gate.md)); actual LP1 transparent F does not consume. The [q8](lp2-plaintext-autokey-q8-fhold-primer-exact.md) and [q29](lp2-q29-plaintext-autokey-fhold-joint-inverse.md) plaintext-autokey inverses with holds do not decide q13. The source selects no actual autokey operation; this is a bounded, motivated classical receiver test.

The exact encoder maintains a 13-symbol queue K. For P=0, emit C=0 and leave K unchanged. Otherwise emit C=(P+head(K)) mod29, shift K and append P. Every visible C=0 has two possible interpretations where legal; the inverse must never emit P=0 on a consuming transition. No word or page reset within the tested p54–55 chapter. A freely chosen 13-rune primer is admitted.

## Exact finite lexical inverse

For each hold mask, consuming positions fall into 13 independent lanes. A trial primer digit determines the full lane via P=C−previous P mod29; eliminate any digit that yields consuming zero. At each physical rune position, the map from the remaining primer digits to that plaintext rune is injective. A candidate printed word therefore determines a tuple of required lane digits, one per distinct consuming phase, and repeated phase requirements must agree. Build exact relations for each original word over the 38,920-spelling GP lexicon from the pinned word-frequency corpus plus native solved words, including alternative GP digraph spellings. Intersect domain supports to a fixed point and, if needed, enumerate residual assignments. The word ordering is a traversal heuristic only. This is not a guessed single-key attack, and no primer or hold interpretation is discarded by score.

| Target | Fit / withheld runes | Visible F / masks | Surviving complete prefix masks | Exact withheld |
|---|---:|---:|---:|---:|
| Native first KOAN plant | 200 / 580 | 8 / 256 | 1 (unique primer) | 580/580 |
| Native LOSS plant | 203 / 552 | 8 / 256 | 1 (unique primer) | 552/552 |
| Original p54–55 | 205 / 103 | 3 / 8 | 0 | unavailable |

Each native control is freshly encrypted from authentic solved GP runes with its planted thirteen-symbol primer, and the prefix-only solver recovers the key and untouched continuation exactly. Lexicon includes the control word types, not their order. Original p54–55 consists of 308 runes in 66 complete printed groups; the first 45 groups contain 205 runes. All eight original masks are mathematically legal without word constraints; none survives the exact relation construction. No search caps reached. The complete native and original results are in [word-relation output](lp2-plaintext-autokey-q13-fhold-word-relation-output.json) and [SFT](../sims/lp2_plaintext_autokey_q13_fhold_word_relation_sft.cjs).

## Spacing-free independent inverse

Remove all printed word separators from scoring. Fit the actual first physical page p54 (232 runes) and freeze each prefix-optimum primer before predicting the entire p55 (76 runes). For each fixed mask, the 13 lane domains above produce unigram, bigram and trigram factors over consecutive consuming phases. The existing [cyclic MAP engine](../sims/lp2_fhold_cyclic_ngram_map.cjs) conditions on two neighboring domains and exactly maximizes the complete cyclic trigram score. The three pinned literary donors are trimmed to 70% training portions; native solved targets are not in that training corpus. All eight original masks are optimized exactly. On native controls with more masks, rank all masks by marginal unigram, optimize the top64 bigram and top8 trigram; this heuristic limitation is confined to controls. Freeze every finalist primer and propagate all legal physical-rune hold histories through p55 using the same language model and exact forward replay.

| Target | Best prefix primer | Withheld result | Predictive score (nats/rune) |
|---|---|---|---:|
| Native KOAN 232/76 plant | 13/13 key, 232/232 prefix | 76/76 | -2.173914 |
| Native LOSS 232/76 plant | 13/13 key, 232/232 prefix | 76/76 | -2.593082 |
| Original p54/p55 | best prefix mask 5, -4.984358 nats/rune | 4/8 fitted primers admit full legal replay; no native prose | -6.869118 |

The best *retrospectively selected* original predictive score among all legal fitted candidates is -6.597207 nats/rune, still far below both frozen native controls. Its existence does not validate the key. The exact original candidate strings and primers, mask ranks, complete replay outcomes and native-control keys are preserved in [spacing-free output](lp2-plaintext-autokey-q13-fhold-spacingfree-output.json). Reproduce using [q13 wrapper](../sims/lp2_plaintext_autokey_q13_fhold_spacingfree_sft.cjs), reusing the parameterized q29 implementation (default q29 behavior unchanged).

## Consequence

The new intact-group result is an all-primer, all-mask finite lexical exclusion for this original prefix, not a general theorem for every possible English register. The spacing-free result is an all-mask prefix-MAP predictive failure, not all-primer infeasibility; four selected wrong-looking keys replay the entire original target. Retire this identity-feedback q13 receiver under the stated direct-native model. An arbitrary affine or nonlinear feedback, an independently selected additional operation, alternate framing, or another plaintext register remains separate. Exact re-encryption alone is not identification.

Both scripts were executed on actual repository-fetched inputs in connected JavaScript. No independent Windows CI execution claimed.
