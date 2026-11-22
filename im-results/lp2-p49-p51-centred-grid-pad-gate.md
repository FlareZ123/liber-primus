# p49/p51 original-table flank: source-centred GP29 direct-pad decision

**Status (11 November 2026): finite original-input negative, no plaintext or authentic key.** This tests the physically neighbouring rune passage, a different target from the previously retired p55 and whole-book table-key tests. [Self-contained reproducible CommonJS SFT](../sims/lp2_p49_p51_centered_grid_pad_sft.cjs).

## Why this is a motivated, finite candidate

The original source prints 66 runes above the start of the p49–51 256-byte table on physical p49 and 92 below its end on physical p51. Thus the split, interrupted passage contains **158 original ciphertext runes**. A direct table-to-rune decoding hypothesis can center the 158 runes symmetrically within 256 byte cells, leaving **exactly 49 cells on either side**, with start index **49**. This 49 is derived before evaluating the ciphertext, from (256−66−92)/2. It is an *inferred centring rule*, not a printed Cicada instruction.

Use the unchanged [canonical GP29 pages](../resources/liber-primus/lp2-corpus.json), [256 original table bytes](../resources/liber-primus/lp2-grid-256.json), and the conditional base60-to-byte reading. Two simple interpretations of each source byte B are Q=floor(B/29), an integer 0..8, and R=B mod29, a GP29 symbol. Freeze the symmetric offset and apply P_i=C_i±K_(49+i) (mod29) across the entire 158-rune interrupted passage, carrying the table clock across the source page gap. No word, punctuation, language, or hidden phase fitting is allowed.

## Original-input result

For a language-sensitive detector, the SFT converts the [known LP1 Latin transliterations](../resources/liber-primus/lp1-plaintext-reference.txt) through the canonical longest-match GP29 transliteration. It skips editorial headings, bracketed annotations, numeric rows and unsupported letters, yielding 3,052 training symbols. A smoothed GP29 trigram conditional log-likelihood is then evaluated on each 158-rune candidate. As a finite offset control, the same ciphertext is decoded for every one of the 256 circular table offsets with each sign, 512 variants per key map. This is a comparison conditional on the chosen model, not a global significance test.

| Direct original table key | Centred decoded IoC | GP29 trigram nats/rune | Rank among 512 offsets/signs, best=1 |
| --- | ---: | ---: | ---: |
| Raw p49+p51 ciphertext | 0.0340240 | **−3.83203** | n/a |
| Q, C−K | 0.0357172 | −3.91205 | 444 |
| Q, C+K | **0.0406353** | **−3.96694** | **495** |
| R, C−K | 0.0337821 | −3.88735 | 392 |
| R, C+K | 0.0332984 | −3.88223 | 384 |

The superficially attractive Q-plus IoC rise is deceptive: its 158-symbol *sequence order* scores worse than the untranslated ciphertext, and **494 of the 512 quotient-key variants** have better GP29 trigram scores. Both physical page segments improve in marginal IoC under this variant (p49 0.02844→0.03823; p51 0.03273→0.04109), yet the decoded rune sequences have no readable words. All four frozen table-key candidates score worse than the raw original by the independent GP-language proxy. The benchmark is an editorially normalized known-plaintext proxy, not an authenticated language model for the unknown pages.

The SFT verifies exact **158/158** recovery of planted native-GP symbols under both signs for each key, so a failure does not arise from an incorrectly implemented inverse. Original-source shapes, frozen start index and offset-rank assertions are checked directly. Exact reencryption on a plant validates the implementation only.

## Decision

**Retire** the specific hypothesis that the physically interrupted p49/p51 158-rune passage is simply Vigenère added/subtracted with the symmetrically centred p49–51 base29 quotient or remainder table register. This finite result does not preclude an external key, a stateful nonlinear consumer, source-selected different byte-to-rune serialization, or the numerical table being a separate encrypted payload. In particular, a high IoC for a 158-symbol decode is insufficient when the word-order evidence points the other way. No unknown LP2 plaintext, authentic key, full cipher inverse or destination follows.
