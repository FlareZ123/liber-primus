# Doublet exceptions as a possible hidden channel

**Status:** Bounded negative experiment; no plaintext recovered. Agent 24, 2026-11-10.

## Motivating structure

Across 55 rune-bearing unsolved LP2 pages (pages 0–55, omitting the number-only page 50), 86 of 12,901 within-page adjacent ciphertext pairs are equal. The exceptions to the unusually strong same-rune suppression may in principle carry an independent message.

We tested three explicit 29-symbol readings of these *events*, in manuscript order: (1) the rune value that repeats (86 symbols); (2) global rune-position gaps between successive events modulo 29 (85 symbols); and (3) within-page positions of the second rune modulo 29 (86 symbols). This is a direct channel attack, separate from analyses of the full ciphertext.

## Model, controls, and observed data

The language score is the mean smoothed log likelihood under the solved LP2 page-57 *PARABLE* rune-frequency reference (95 rune symbols; pseudocount 0.5 per rune). Each stream is optimistically allowed all 29 Caesar shifts and both forward and reflected Gematria Primus index orientations. Reversing a stream does not affect this unigram statistic.

The matched null selects exactly **86 positions uniformly without replacement** from the **12,901** eligible within-page adjacent positions of the actual ciphertext, then computes the same three readings. It preserves the source rune values, page lengths, and global position geometry. Each of 3,000 null replicates receives the identical affine-relabeling search. A page-count Pearson statistic checks event clustering relative to the number of eligible positions in each manuscript page. Deterministic seed: `0x24db1e57`.

| Reading | Observed maximum log score | Matched-null 95th percentile | Upper-tail empirical p |
|---|---:|---:|---:|
| Repeated rune values | -3.64919 | -3.49952 | **0.82406** |
| Inter-event gap modulo 29 | -3.52465 | -3.49130 | **0.11829** |
| Page-local rune offset modulo 29 | -3.59559 | -3.49783 | **0.43219** |

Page-count concentration: observed Pearson statistic **58.50695**, null mean **53.60952**, null 95th percentile **71.84609**, upper-tail **p=0.29657**. These statistics provide no support for a directly readable ordinary-English-rune exception channel.

A detector-function check plants 500 independent 86-rune sequences sampled from the fitted page-57 unigram frequencies and obscures each using an independently chosen affine ± orientation and shift. **500/500** plants exceed the rune-channel null's 99th-percentile score. This positive is model-matched (and its reference is used to construct the plant); it does not establish power against another language, real word-order coding, or a deliberately encrypted 86-symbol payload.

**Scope of the negative:** no evidence for these three simple affine-readout English-register interpretations or unexpected page concentration. This does not rule out binary gap coding, ciphertext-dependent selection of the 86 events, multi-symbol encodings, a second encryption layer, or other event orderings. The nominal p-values do not constitute a global search over possible side-channel readings.

## Reproduce

[Self-contained CommonJS script](../sims/doublet_exception_channel.cjs) reads the shared [LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json), checks all 55-page / 12,956-rune / 12,901-pair / 86-event invariants, and prints deterministic JSON scores and planted-control counts. It is a local script, with no scheduled workflow.

The English-only calibration is intended as a cheap rejection gate. A later positive claim would require a specified reversible extraction mechanism and independent plaintext or key confirmation.
