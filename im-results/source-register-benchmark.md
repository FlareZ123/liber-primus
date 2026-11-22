# Source-grounded GP29 language/register benchmark

**Decision:** The existing broad English controls are adequate for the source-supported register variation tested here. No source-supported non-English candidate language emerged. A Gibran-only score is not a source attribution and should not be the sole gate, but the matched-size panel shows no material failure of the existing broad English controls on the known LP2 anchors or the held-out Cicada/Blake material.

## Source inventory and controlled splits

| Register/control | Training material | Held-out material | Training runes |
| --- | --- | --- | ---: |
| Blake verse | First 20 non-chorus lines of William Blake's “A Song of Liberty” | Exact archived 2012 Cicada chorus transcription | 1,468 |
| Cicada signed prose | Clear-signed 2012 countdown and 2014 stage11 payloads | 2016 signed message and 2017 signed warning | 139 |
| LP1 A-KOAN | Text-bearing LP1 pages 6 and 9 | LP1 pages 14 and 15 | 776 |
| Gibran | Existing full The Prophet control, first 80% of words | Last 20% | 47,657 |
| Emerson | Existing English control, first 80% of words | Last 20% | 254,637 |
| Shakespeare | Existing English control, first 80% of words | Last 20% | 173,233 |
| Latin Vulgate | Existing Latin control, first 80% of words | Last 20% | 104,653 |

The Blake clue is source-motivated: the archived 2012 MIDI-puzzle message explicitly directs the solver to the chorus. The held-out archive transcription preserves its differences from the Gutenberg text: “letchery” versus “lechery” and “every thing” versus “everything”. The training excerpt excludes the chorus, preventing direct chorus memorization. The source text is in [Project Gutenberg eBook 45315](https://www.gutenberg.org/ebooks/45315); the held-out transcription and its archive caveat are preserved in [the benchmark resource](../resources/control/cicada2012_blake_chorus.txt).

The A-KOAN split is first-release LP1 material, not a 2013 server response. Pages 7–8 are continuation placeholders, and page 16 is a numerical table; neither is used as prose. The text-bearing first A-KOAN pages 6/9 train the model, while the second A-KOAN pages 14/15 are held out. The 2013 server protocol's KOAN example is not an authenticated captured response and is not treated as a plaintext corpus.

The Cicada prose model is intentionally small. Its 2012/2014 clear-signed payloads provide only 139 GP runes; the 2016 and 2017 messages are held out. This script extracts cleartext but does not re-verify signatures. The existing [2016 source record](../resources/historical/cicada2016-4gq25.md) and [2017 signature record](../resources/historical/cicada2017-yEiTHhvF.md) document their good-signature checks. The small model is a qualitative control, not a standalone language gate.

The 2013 761.MP3 ID3 metadata directly preserves the LP2 p57 Parable text; see [the audio-761 source analysis](audio-761-pad-scan.md). The distinctive phrases “LIKE THE INSTAR”, “CIRCUMFERENCES”, and “DIVINITY WITHIN” are absent from the repository's Gibran The Prophet control. This only excludes an exact match in that one corpus; it does not exclude influence from another Gibran work. Gibran remains a generic English comparator, not an established source attribution for p57. Latin is a wrong-language control only.

## Method

The reproducer reuses the encoder and training implementation in [grid_keyskip_viterbi.cjs](../sims/grid_keyskip_viterbi.cjs): 29-symbol character trigrams, digraphs TH/NG/EO/OE/AE/IA/EA, the existing letter collapses, no word-boundary symbols, add-one unigram smoothing, bigram interpolation 12 and trigram interpolation 9. Scores are mean log-likelihood per rune; higher (less negative) is better.

The full models retain each source's available training size. For fair cross-register comparisons, the matched panel truncates Blake, A-KOAN, Gibran, Emerson, Shakespeare and Latin to **700 training runes each**. Cicada is excluded from this panel because its entire training corpus has only 139 runes. The p56 and p57 known plaintexts are held-out anchors, never training data.

Eight held-out plaintexts are also planted through deterministic, independently seeded per-rune additive GP29 streams. These are synthetic scoring controls, not a claim about LP2's actual cipher. Original unknown ciphertext pages 0–55 are evaluated as 55 rune-bearing pages containing 12,956 runes. Three known negative p33–39 transposition outputs are evaluated separately: whole-section historical order, whole-section rank order and per-page rank order.

## Matched-size held-out scores

All six models in this table were trained on exactly 700 runes. Values are per-rune log-likelihood; rows are independent held-out texts, not fitted candidates.

| Held-out text | Blake | A-KOAN | Gibran | Emerson | Shakespeare | Latin |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2012 Blake chorus | -2.897 | -2.919 | **-2.867** | -2.927 | -2.887 | -3.348 |
| LP1 second A-KOAN | -2.834 | **-2.727** | -3.069 | -2.957 | -2.995 | -3.280 |
| Cicada 2016 signed message | -3.052 | -3.200 | -2.993 | -3.130 | **-2.966** | -3.406 |
| Cicada 2017 signed warning | -3.248 | -3.377 | -3.235 | -3.520 | **-3.150** | -3.237 |
| LP2 p56 known plaintext | **-2.846** | -3.027 | -2.878 | -2.961 | -2.885 | -3.485 |
| LP2 p57 known plaintext | -2.689 | -2.951 | -2.872 | -2.821 | **-2.626** | -3.217 |

The source-specific A-KOAN model ranks first on its held-out second A-KOAN text, narrowly ahead of Blake (0.107 nats/rune). The Blake-trained model ranks third on the chorus; Gibran and Shakespeare are slightly better, by only about 0.01–0.03 nats/rune. The signed Cicada texts are best scored by broad English models, not by a dedicated Cicada model; the latter is too small to support a stable matched-size comparison. The p56/p57 anchors are comfortably within the broad English score range. These results support an English register panel, not a new language.

## Positive-plant calibration

| Held-out plaintext | Plaintext minus seeded additive-cipher score |
| --- | ---: |
| Blake chorus | +1.866 |
| Cicada 2016 signed message | +0.643 |
| Cicada 2017 signed warning | +0.782 |
| LP1 second A-KOAN | +1.960 |
| Gibran held-out | +3.471 |
| Emerson held-out | +4.080 |
| Shakespeare held-out | +3.846 |
| Latin held-out | +5.053 |

All eight source-native or control plaintexts score above their seeded additive-cipher plants under their own full model. The weakest margin is the short Cicada prose control, consistent with its 139-rune training size.

## Original ciphertext and known negatives

The matched-size mean per-page scores over the original 55 unknown pages are:

| Model | Original LP2 mean per-page score |
| --- | ---: |
| Blake | -4.360 |
| A-KOAN | -4.587 |
| Gibran | -4.437 |
| Emerson | -4.363 |
| Shakespeare | -4.436 |
| Latin | -4.349 |

Across the three p33–39 transposition negatives, matched-model scores range from **-4.582 to -4.318**. They remain close to the raw unknown-page distribution and far below the p56/p57 known-plaintext scores (which range from **-3.485 to -2.626** in the matched panel). The script asserts that the original unknown-page mean and all three negative outputs remain below both known plaintext anchors under every full and matched model.

The full 139-rune Cicada model assigns the raw unknown ciphertext a comparatively high score. This is a small-corpus overfitting warning, not evidence that the ciphertext is Cicada prose; it is why the model is excluded from matched-size comparison and not recommended as a gate.

## Conclusion and recommendation

1. **No material underpowering was found in the existing broad English controls** for the source-supported alternatives tested. Blake verse, Cicada's short signed prose and the known LP2 anchors are scored within the broad English range.
2. Retain the LP1 A-KOAN held-out as an explicit source-native dialogue/koan positive control. Its own model narrowly wins at matched training size, but the generic English controls are close.
3. Retain Blake's chorus as an explicit 2012 source-motivated verse control. A separate Blake model does not outperform the broad English controls.
4. Keep Cicada signed prose as a qualitative check only; 139 training runes are insufficient for a reliable standalone trigram gate.
5. Keep Gibran as a generic literary comparator, not a source attribution for p57. Keep Latin as a wrong-language control, not a candidate LP2 language.
6. Future frozen decoders should report the full English panel and these source-native held-outs, but a language score alone must never establish a decryption. A genuine candidate still needs a source-motivated reversible operation, specified key/state and exact re-encryption.

This benchmark validates scoring coverage only. It recovers no unknown plaintext, key, cipher mechanism or destination, and does not prove that every unsolved LP2 page is English.

## Reproduction

Run:

    node sims/source_register_benchmark.cjs

The [Source register GP29 benchmark workflow](../.github/workflows/source-register-benchmark.yml) passed in [GitHub Actions run 42991079961](https://github.com/FlareZ123/liber-primus/actions/runs/42991079961) on benchmark commit a52dbc54dd1c31fc3e0977f03a1fd4d68dffb3c2. The script prints the complete deterministic score matrices and asserts the planted positives, source splits, corpus dimensions and negative-control ordering.
