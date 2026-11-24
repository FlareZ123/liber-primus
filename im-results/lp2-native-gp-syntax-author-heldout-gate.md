# Native-GP sentence syntax: held-out-source recovery gate

**Status:** completed bounded negative for blind sentence/phrase recovery. This is an intermediate result, not a recovered LP2 plaintext or cipher mechanism.

## Question

Does the solved manuscript's native GP29 word sequence, combined with original word lengths and sentence punctuation, give enough predictive information to recover unknown plaintext without training on candidate LP2 decryptions?

This test is deliberately source-first. It uses only solved GP29 reference strings, a fixed generic English lexicon, and independent literary controls. It does not use any candidate LP2 plaintext, key guess, or unknown-page decryption.

## Inputs and normalization

- Solved reference: `resources/external/relikd-solved-gp29-native-v1.json`, nine externally transcribed solved source records.
- Canonical GP29 mapping: `resources/liber-primus/lp2-corpus.json`.
- Generic lexicon: `resources/control/english_wordfreq_textblob.txt`, normalized to 29,062 distinct GP word types.
- Independent controls: Gibran's *The Prophet*, Emerson's *Essays*, Blake's *A Song of Liberty*, and the Hapgood service excerpts. Each is encoded with the same GP mapping; none is included in Cicada training.
- The source strings are external transcriptions of solved material, not original JPEG byte streams. This is a leave-one-source-record-out test, not an author-held-out test: all nine solved records belong to the same manuscript.
- Numeric-table portions are excluded from the prose test at the literal table starts in `0_wisdom` and `jpg229`. The resulting source records contain 727 GP words: 676 dictionary-covered and 51 OOV.

Words are measured in GP rune tokens, not Latin letters. `⁘` and `⁜` delimit sentences for the model. No unknown LP2 material enters the training or evaluation corpus.

## Model

A word-level Witten–Bell trigram model is trained on eight solved source records and evaluated on the ninth. Its unigram prior is the fixed TextBlob-derived GP lexicon, with ten pseudo-counts added per observed Cicada training token. It backs off from trigram to bigram to unigram.

The backoff behavior matters. An early prototype returned zero probability for an unseen context; that made every candidate in such a context tie at zero and spuriously ranked the target first. Those inflated preliminary figures were discarded. The committed SFT explicitly falls back to the lower-order distribution when a context has no observations. All results below use the corrected implementation.

Two evaluations distinguish an optimistic language-model ceiling from actual skeleton recovery:

1. **Teacher-forced word ranks:** rank each held-out word among dictionary words of the same GP length, supplying the actual previous two plaintext words. This is an upper bound because those preceding words would themselves have to be recovered.
2. **Phrase/sentence recovery:** search exact candidate sequences under the held-out GP word-length pattern. Three-word phrase windows receive the actual two-word prefix immediately before the window, again an optimistic advantage. Whole-sentence tests receive only BOS/BOS and the original sentence's word-length sequence.

The phrase search uses a top-500 beam and the top 30 length-matched candidate words per position. The full-sentence search uses a top-100 beam and the top 15 candidates per position. These are finite beam searches, not exhaustive global k-best proofs.

## Results

### Held-out next-word ranking

| Test source | In-vocabulary words | Model top-1 | Model top-5 | Model top-10 | Unigram top-1 | Unigram top-10 |
|---|---:|---:|---:|---:|---:|---:|
| Cicada held-out records, aggregate | 676 | 129 (19.1%) | 242 (35.8%) | 326 (48.2%) | 82 (12.1%) | 263 (38.9%) |
| Gibran | 391 | 69 (17.6%) | 161 (41.2%) | 186 (47.6%) | 73 (18.7%) | 188 (48.1%) |
| Emerson | 391 | 61 (15.6%) | 130 (33.2%) | 174 (44.5%) | 58 (14.8%) | 168 (43.0%) |
| Blake | 326 | 48 (14.7%) | 92 (28.2%) | 114 (35.0%) | 54 (16.6%) | 113 (34.7%) |
| Hapgood | 385 | 59 (15.3%) | 115 (29.9%) | 148 (38.4%) | 57 (14.8%) | 142 (36.9%) |

The held-out Cicada model improves over its unigram baseline, but only modestly distinguishes Cicada from unrelated controls. Its top-1 accuracy is 19.1%, versus 14.7–17.6% on controls; its top-10 rate is 48.2%, essentially the same as Gibran's 47.6%.

Of 676 held-out Cicada words, 200 have a previous-two-word context observed in training, and only 60 exact three-word transitions recur. The model ranks 29 of those 60 exact repeats first. On the 476 words with unseen two-word contexts, top-1 accuracy is 84/476 (17.6%).

At sentence starts, where no preceding plaintext is available, top-1 is only 13/91 (14.3%), top-5 28/91 (30.8%), and top-10 52/91 (57.1%). This is not a strong source-specific first-word selector.

### Exact phrase recovery

With the actual two-word plaintext prefix supplied before each target phrase:

| Test | Three-word windows | Exact top-1 | Exact top-10 | Exact top-100 |
|---|---:|---:|---:|---:|
| Cicada held-out source records | 35 | 1 | 3 | 3 |
| Four unrelated controls | 20 | 0 | 0 | 0 |

The phrase result is weak even under the oracle-prefix advantage. The full-sentence search, which starts with BOS/BOS and receives only the original word-length skeleton, tested 46 in-vocabulary sentences: **0/46** appeared in the top 10 and **1/46** in the top 100.

These rates measure exact sequence recovery, not whether a generated sentence merely sounds plausible.

## Decision

The solved text does contain some source-specific next-word information, but it is not strong enough to recover unknown word sequences from lengths and punctuation. The modest teacher-forced improvement largely disappears when the model must choose its own context. Exact phrase recovery is rare even when the true preceding two words are supplied; whole-sentence recovery from the skeleton is effectively absent.

Therefore **close the grammar-only channel for #2464**. Do not integrate this model into an arbitrary cipher or a second running-key decoder: no independent source clue currently selects a reversible operation and finite key uncertainty for such an integration. Preserve the model only as a weak auxiliary prior if future work independently recovers a short plaintext anchor or a source-selected key/clock.

This is a bounded negative for this fixed word-trigram/lexicon model, not proof that all possible syntactic constraints are absent. It recovers no unknown plaintext, key, mechanism, or destination. `results/README.md` remains unchanged because no established decryption has been produced.

## Reproduction

- Implementation: `sims/lp2_native_gp_syntax_author_holdout_sft.cjs`
- Run: [Windows Node22 manual read-only CommonJS SFT, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45315715536)
- Script commit: `622936f33323dacd9f68dd037cd8a4619135f5cb`
- The SFT asserts the source word counts, corrected backoff metrics, control metrics, phrase-search counts, and blind-sentence counts.
