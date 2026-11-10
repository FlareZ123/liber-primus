# Doublet exceptions as a possible hidden channel

**Status, 10 November 2026:** two complementary bounded original-input negatives: Agent 24’s direct GP-letter readings and Agent 12’s exact known-hash Base64 necessary-condition test. Neither recovers unknown LP2 plaintext, an authentic cipher key or a destination.

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

## Direct 64-byte AN END hash as a putative 86-event Base64 channel (Agent 12)

The authenticated solved LP2 page56 supplies the **128-hex-digit (64-byte)** AN END digest, while the unresolved ciphertext contains exactly **86** adjacent-repeat events. Encoding **64 bytes as Base64 requires exactly 86 data sextets plus two padding characters**, so the event count *could* accommodate the known digest. This numerical coincidence and the choice of Base64 were recognized retrospectively and are not independent evidence for a historical channel.

Use the **original exact digest bytes** `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Convert them to 86 natural-order six-bit values, where the 86th carries two data bits and four zero padding bits. For each original repeated-rune event, test six source-defined 0..63 readings: absolute zero-based rune position, global inter-event gap (first gap from manuscript start), within-section position, within-section event gap (reset at its eight original section starts), repeated glyph index, and global gap plus rune index modulo64. Check normal or reversed event ordering, **12 explicit candidate channels**.

The channel may have a secret but **globally fixed arbitrary bijection among all 64 Base64 symbols**. For each reading, maximize the number of exact matches to the known hash over *all* 64! such bijections with an exact 64×64 maximum-weight bipartite assignment. This is a key-independent **upper bound on matching the specific authentic hash**, with no English scoring or guessed substitution key.

| Original event reading (mod64) | Forward optimum of 86 | Reversed optimum of 86 |
| --- | ---: | ---: |
| Absolute rune position | 42 | 39 |
| Inter-event gap | 41 | 41 |
| Position from section start | 41 | 42 |
| Gap from previous section-local marker | **43** | 42 |
| Repeated rune's GP index | 29 | 29 |
| Gap plus repeated GP index | 37 | 40 |

Even giving the extractor the most favorable arbitrary global alphabet, the best model has **43 correct digest sextets and at least 43 forced mismatches**. Thus none of the 12 original-input readings can encode the *known AN END digest* via a fixed Base64 alphabet. The exact algorithm's blind positive permutes 86 planted sextets through a hidden uniform 64-way permutation and recovers **86/86** as the assignment optimum.

This excludes only **literal direct hash presentation** under those six fixed residue geometries, two directions and one stationary unknown substitution. It does not disprove the marker count's possible intentional meaning, a different hidden payload, an encrypted hash, varying alphabets per page, stateful gap coding, secret salts or unknown transport frames. It supplies neither LP2 plaintext nor the missing deep-web hash preimage. [Reproducer](../sims/doublet_base64_anend_gate.cjs). [Original AN END target context](archive-hash-preimage.md).

## Reproduce

[Self-contained CommonJS script](../sims/doublet_exception_channel.cjs) reads the shared [LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json), checks all 55-page / 12,956-rune / 12,901-pair / 86-event invariants, and prints deterministic JSON scores and planted-control counts. It is a local script, with no scheduled workflow.

The English-only calibration is intended as a cheap rejection gate. A later positive claim would require a specified reversible extraction mechanism and independent plaintext or key confirmation.
