# Doublet exceptions as a possible hidden channel

**Status, 12 November 2026:** Original-input tests of repeated-letter and gap-symbol readings, a 64-byte digest channel, and combinatorial event-mask rank are negative. A further direct attempt to index the 86 quoted words with the 86 doublet events is also negative. A new within-page boundary-permutation test finds strong suppression of repeated ciphertext runes across printed word separators. These are bounded structural constraints; none recovers unknown LP2 plaintext, an authentic cipher key or a destination.

## Motivating structure

Across 55 rune-bearing unsolved LP2 pages (pages 0–55, omitting the number-only page 50), 86 of 12,901 within-page adjacent ciphertext pairs are equal. The exceptions to the unusually strong same-rune suppression may in principle carry an independent message.

We tested three explicit 29-symbol readings of these *events*, in manuscript order: (1) the rune value that repeats (86 symbols); (2) global rune-position gaps between successive events modulo 29 (85 symbols); and (3) within-page positions of the second rune modulo 29 (86 symbols). This is a direct channel attack, separate from analyses of the full ciphertext.

## Repeat suppression crosses printed word boundaries

A distinct original-cipher necessary-condition test restores the printed separators from `resources/liber-primus/lp2-transcription.txt`, whose **13,136 rune symbols** align exactly, position by position, with the canonical 58-page corpus. Only physical p0–55 are tested; the numeric-only p50 contributes no rune pairs, and cross-page adjacencies are excluded. The original 12,901 eligible pairs split at **printed hyphens or full stops**:

| Within-page pair location | Identical adjacent GP29 rune pairs | Fraction |
| --- | ---: | ---: |
| Within a printed word (or an unbroken line wrap) | **63 / 10,028** | **0.62824%** |
| Across a printed word or sentence separator | **23 / 2,873** | **0.80056%** |
| All eligible within-page pairs | **86 / 12,901** | **0.66661%** |

To distinguish a continuous no-repeat constraint from independently random ciphertext starts, freeze each actual preceding last-word rune, the complete multiset of actual succeeding word-start runes **within each physical page**, and every original word boundary. Uniformly permute those succeeding runes separately within each page. In **10,000** deterministic matched permutations (xorshift32 seed `0x43c1d27f`), the number of same-rune word-boundary collisions averages **100.8796** with a range of **69–140**; **0/10,000** have at most the observed 23 (add-one empirical `p=0.00009999`). The observed suppression across boundaries is therefore incompatible with this particular independent-word-start exchangeability model.

This reveals a stronger **cipher continuity constraint** than merely reporting the known 86 doublets. It is consistent with a state carried across word breaks or a post-encoding anti-repeat operation spanning words, among other possibilities. It neither determines the hidden transformation nor proves the author used a continuous encryption clock. The direct 86-event-to-86-quote-word rune-index, prime-index, and one-based prime-index extractions are all nonlinguistic (IoC 0.031464, 0.034473, 0.027633 versus solved p57 control 0.059644), despite exact planted extraction controls. Correctly treating the original sentence mark at **global offset 10,320** yields 86 words in seven quotes; the earlier 85-count signature omitted this word break. The quoted-word source analysis is consolidated in [the punctuation report](punctuation-quote-channel-gate.md).

[Original-input CommonJS reproducer](../sims/lp2_quote_doublet_word_boundary_sft.cjs) checks every original rune and prints the full readouts, collision counts, permutation null, and planted positives. Continue only after an independent clue specifies how to use these events to recover an actual key or message.

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

## Whole-book 86-of-12,901 combinatorial-rank digest channel (Agent45)

A second use of the event **positions** has more capacity than the Base64 test. The 86 repeated-rune successors across the 12,901 available within-page adjacent positions define one set among \(\binom{12901}{86}\), with a capacity of **740 complete bits**, enough to carry the page56 512-bit digest. This is mathematically a genuine lossless positional channel, although there is no original instruction selecting a combinatorial-number-system encoder. The digest/code coincidence is recognized retrospectively.

In original page-and-rune order, omit the first rune from each of 55 nonempty unsolved pages. Number the eligible predecessor positions 0–12,900 and let `s_i` be the one-based `i`th event's zero-based position. The first 14 source positions are `[121,206,454,650,778,905,928,974,1033,1584,1972,2007,2017,2182]` and the last 12 `[10909,11057,11143,11297,11551,11611,11796,12064,12322,12614,12750,12884]`. The colexicographic rank is \(\sum_{i=1}^{86}\binom{s_i}{i}\). The second source-order convention is **true lexicographic rank**, computed from the reflected/reversed positions. These two fixed ranks have 741 and 740 bits respectively; both are below \(\binom{12901}{86}\).

The known page56 target is the original printed 128-hex-character value in `resources/cicada2014-anend-binary-witness.json`, beginning `36367763ab73783c`. Neither original rank equals that 512-bit integer, nor do either rank's 512 lowest or 512 highest bits equal it. For a direct candidate preimage, encode each full rank as its natural fixed-width **93-byte** positive integer and compute SHA-512 in both big- and little-endian order. The four exact 64-byte outputs **all disagree** with the printed target:

| 93-byte rank | SHA-512 big-endian prefix | SHA-512 little-endian prefix |
| --- | --- | --- |
| Colex | `6d106dc50bd730fa` | `600692e30ee8c1e8` |
| Lex | `7f7e96e8651264c7` | `38b738f884783a02` |

The [source-original CommonJS SFT](../sims/lp2_doublet_combinadic_anend_sft.cjs) emits full rank bytes, complete digest outputs and exact event sites, asserts each negative, and checks a strong **positive through the same mask extraction path**: it encodes the actual 512-bit page56 digest as a valid 86-of-12,901 event mask, constructs artificial GP29 ciphertext with the **same 55 page lengths**, no accidental doublets, and then extracts the marked positions and recovers the planted digest exactly. The [manual CI run 43112692420](https://github.com/FlareZ123/liber-primus/actions/runs/43112692420) succeeded.

**Decision:** retire only the two canonical whole-book combinatorial masks as *direct encoded AN END digest* or a raw rank byte-string SHA-512 preimage. No manuscript plaintext, key or hash preimage was discovered. Other independently instructed arithmetic codings, sectional masks or different payloads are untested; the finite check does not establish that the exception positions carry no information. In particular, the digest's hash algorithm is only presumed SHA-512 from its 64-byte form, not authenticated by the solved page.

## Reproduce

[Self-contained CommonJS script](../sims/doublet_exception_channel.cjs) reads the shared [LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json), checks all 55-page / 12,956-rune / 12,901-pair / 86-event invariants, and prints deterministic JSON scores and planted-control counts. The new combinatorial-rank SFT is separately executed in the manual historical-decryptions CI; neither is scheduled per commit.

The English-only calibration is intended as a cheap rejection gate. A later positive claim would require a specified reversible extraction mechanism and independent plaintext or key confirmation.
