# Word-rotated single-escape predecessor cipher: original necessary-condition gate

**Decision (17 November 2026):** The original LP2 pp0–55 rune tape does not support the specific reversible architecture in which each original printed plaintext word undergoes a shared fixed circular rotation (−5, −2, −1, 0, +1, +2, or +5 GP runes), followed by one globally fixed GP rune emitted as an adjacent-equal ciphertext symbol and a bijective 28-way ordinary successor emitter. All 203 (seven rotation × 29 escape rune) combinations fail three native-English source-conditioned tests. This is a **bounded original-cipher negative**, without recovered unknown-page plaintext, key, destination, or evidence that the author chose this architecture.

## Motivation and exact claim

The p57 clear parable describes *circumferences*. The unknown LP2 corpus exhibits 86 adjacent-equal ciphertext events in 12,956 runes (55 rune-bearing pages) and 2,896 source-printed words. A plausible but currently unauthenticated reading would rotate each word and use the rare adjacent-repeat transitions to carry a single exceptional plaintext rune. A 28-ary ordinary key can be arbitrarily complex; under this architecture the repeat locations reveal the exceptional rune's complete location pattern irrespective of that secret key.

Let a source-native plaintext word of rune length L be P[0..L−1], with fixed, common signed rotation r. Encrypt the rotated word R[j]=P[(j+r) mod L] through a predecessor-excluding 29-symbol emitter. For one fixed rune E, output C[i]=C[i−1] exactly when R[j]=E. Every ordinary R[j]≠E is mapped reversibly to one of the 28 successors different from C[i−1] with an arbitrary secret 28-way key.

Consequently every original ciphertext doublet maps to one occurrence of E at plaintext word index (j−r) mod L. The observable sufficient event vector is (total E positions, E at printed word starts, E at printed word ends). For each of Shakespeare, Gibran and Emerson, all 2,896 original printed word lengths are preserved. We enumerate source-native GP words by length, analytically compute the 3-component reference mean and covariance for each candidate E, and score the original event vector using Mahalanobis distance. No guessed key, decryption, or planted plaintext is used to fit the original. The 29 candidates and seven rotations are selected and evaluated exhaustively within this frozen family.

## Source-exact results

| Native-English source | Best fixed rotation | Best escape rune | Original event vector | Matched-source expected event vector | Mahalanobis distance² | Largest absolute marginal z |
| --- | ---: | --- | --- | --- | ---: | ---: |
| Shakespeare (first 300k) | +2 | P | 86 / 24 / 12 | 211.47 / 95.81 / 16.62 | 79.190 | 8.53 |
| Gibran (*The Prophet*) | +2 | G | 86 / 24 / 12 | 191.14 / 71.00 / 18.94 | 65.430 | 7.72 |
| Emerson (*Essays*) | +2 | G | 86 / 24 / 12 | 157.95 / 60.32 / 5.01 | 60.130 | 5.79 |

The no-rotation case is already excluded by [the earlier fixed-escape source gate](../sims/lp2_fixed_escape_repeat_site_native_gate_sft.cjs); this result tests six specific missing word rotations in addition. A constructed Gibran native-GP plaintext with fixed +2 rotation and the reversible predecessor-excluding emitter round-tripped all 12,956 runes, producing 226 emitted repeat markers, so the model is implementable. The original remains incompatible with each matched reference under the stated English-word model.

## Reproduce and scope

- [Exact original-input CommonJS SFT](../sims/lp2_wordrotate_singleescape_all29_original_gate_sft.cjs), with asserts on 12,956 original runes, 2,896 authentic source word lengths and 86 doublet events
- [Successful Windows Node22 run, 17 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/44173726494)
- Inputs: [original LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json), [source-printed word boundaries](../resources/liber-primus/lp2-transcription.txt), and the three pinned source-native English controls under `resources/control/`

This source-conditioned result is a model-prior rejection, not a mathematical exclusion of all plaintext languages. It does **not** test a variable per-word rotation schedule, changed word breaks, runic non-English, arbitrary nonlocal transpositions, hidden plaintext-state feedback or multi-rune emissions. Those extensions each require independent authorial selection before investing in broad key searches. This branch provides no reason to rerun generic word rotations with freely chosen keys.