# Whole-word affine autokey: exhaustive original-input recovery gate

**24 November 2026 — no unknown plaintext or key.** This independently extends the forward whole-word recurrence tested under Director #2503. A shared affine transformation of every previous plaintext key rune cannot rescue that architecture: the historical F-hold version has an exact contradiction for every nonidentity law, and the ordinary version needs at least 24 distinct plaintext singleton rune types among 83 printed singleton groups.

## Model and distinction

For printed group i, use the previous recovered plaintext group as a cyclic key with transformed key symbols k_j = a P_(i-1,j mod length) + b (mod 29). Reset key phase at each complete printed group; carry across physical-page and line breaks. The shared parameters a,b range independently over GF29, including constant keys (a=0), subtraction/negative multipliers and every translation. With the historical plaintext-F hold, P=0 emits C=0 and leaves the within-word clock unchanged; otherwise C=P+k mod29 and the clock advances. At C=0 the exhaustive inverse includes a transparent F and, when legal, an ordinary nonzero preimage. A nonzero C equal to k has no preimage. The previous-word interpretation is exploratory; the signed 2016 words/numbers wording and authentic LP1 Vigenere motivate the test but do not specify an affine law. This is not a new source-selected decoder.

The [original literal predecessor gate](lp2-preceding-plaintext-word-autokey-fhold-exact-gate.md) rejected a=1,b=0. Rather than test successive ad hoc sign/offset variants, the present algorithm admits every affine representation at once, including the identity and constant shifts.

## Exact historical-emitter result

Use the canonical 12,956-rune tape, joined into 2,896 complete printed groups. Grant all 29 possible plaintext values at the first singleton (word39, rune176) independently for each of the 841 parameter pairs. At each following group enumerate all legal F-hold branches and merge equal full previous plaintext states; no dictionary or language filtering occurs. The seed is free, so any possible earlier key is covered. Every nonidentity law dies by group166, starting at rune774, length6. The longest survivor (a,b)=(27,26) dies at that group. Other latest deaths: (28,18) at157, (5,12) at151, (21,19) at146, (21,9) at145. Maximum state-set size anywhere is263. Only a=b=0 survives, which emits each subsequent rune unchanged and does not decipher the manuscript. This is a language-independent obstruction for the exact shared F-hold architecture with intact printed groups and no intermediate reset.

## Ordinary emitter: all seeds, no arbitrary keyword search

Without F hold, for each fixed multiplier a every plaintext rune after the singleton seed s is of the form x*s+y*b+z modulo29. Propagate these coefficient triples directly: for the matching cyclic previous key position (x,y,z), the next triple is (-a*x, -a*y-1, C-a*z). Evaluate the singleton triple register for all 29*29 values of (b,s) per a. This is an exact enumeration of all 24,389 parameter/seed combinations, even allowing arbitrary plaintext before the singleton. Histogram of distinct plaintext singleton types:

| Distinct types | Candidates |
|---:|---:|
| 24 | 290 |
| 25 | 957 |
| 26 | 3,219 |
| 27 | 6,786 |
| 28 | 9,454 |
| 29 | 3,683 |

Thus every ordinary inverse has at least 24 distinct one-rune plaintext groups. This strongly conflicts with native GP prose **if printed groups are words**. It is not an algebraic contradiction for a changed segmentation or nonlinguistic payload. It is independent of global alphabet relabeling as a *count* but the key law itself is fixed in canonical GP0 coordinates.

## Independent artwork-chapter rekeying

The global contradiction crosses the first artwork-chapter boundary for the last surviving nonnull key. To distinguish that from an invalid transfer of the continuous-clock conclusion, independently grant each of the nine established physical artwork-chapter spans its own affine parameters and free plaintext state at its first complete singleton. Only complete groups wholly inside the interval after that singleton are tested, so no assumed cross-chapter carry is required.

| Physical span | First singleton word | Exclusive last word | Surviving (a,b), including null |
|---|---:|---:|---|
| p0–2 | 39 | 158 | (0,0), (27,26) |
| p3–7 | 168 | 413 | (0,0) only |
| p8–14 | 467 | 796 | (0,0) only |
| p15–22 | 827 | 1233 | (0,0) only |
| p23–26 | 1258 | 1457 | (0,0) only |
| p27–32 | 1465 | 1783 | (0,0) only |
| p33–39 | 1819 | 2161 | (0,0) only |
| p40–53 | 2192 | 2830 | (0,0) only |
| p54–55 | 2830 | 2896 | (0,0), (2,3), (8,14) |

Seven of nine artwork-chapter intervals cannot support **any nonnull** affine key even with independently chosen key and arbitrary earlier state. The short opening and terminal intervals retain nonnull possibilities; those are legality survivors only and not recovered keys. This substantially narrows the separate chapter-reset alternative, but does not cover resets at arbitrary internal words or other marker clocks.

### Decode every surviving nonnull chapter-local path

The remaining three parameter pairs were not left as unexplored legality claims. Enumerate their exact state DAG from the free singleton, count every complete plaintext trajectory with integer arithmetic, and select the path maximizing native-dictionary-matched runes in words of length at least four. The independent fixed comparator is the 29,081-form union of the pinned published native-GP donor words and the existing TextBlob word-frequency lexicon under repository GP spelling (lexicon blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938). A donor within-word bigram model (0.5 smoothing) only breaks ties. Because the next key depends solely on the current plaintext word, retaining the best path per state gives an exact global maximum of matched-rune coverage, not a beam heuristic.

| Span and (a,b) | Exact complete trajectories | Runes decoded after seed | Eligible groups (>=4 runes) | Maximum dictionary-matched eligible groups/runes |
|---|---:|---:|---:|---:|
| p0–2 (27,26) | 124,928 | 552 | 67 | 0 / 0 |
| p54–55 (2,3) | 8 | 307 | 39 | 0 / 0 |
| p54–55 (8,14) | 4 | 307 | 39 | 0 / 0 |

The best paths begin respectively `MRSOAER EOTHJNGJW IAPC EEORH`, `PSBNGAEHRP IAMCCGBPM BEOH PRHEABE`, and `EOXTLAWOEO RPTNGIAASAE EAOEA SSAUEAC` (canonical transliteration labels). These are exact legal candidate decodes, not language. The complete best paths are emitted by the SFT, which forward-checks each selected word. No path among the three surviving keys contains even one eligible dictionary word. This retires the remaining chapter-local legality survivors as candidates for ordinary word-aligned native English, subject to the finite lexicon and segmentation assumption.

## Positive controls and reproducibility

Three disjoint 150-group sections of the pinned published solved-GP comparator, with planted (a,b)=(3,7),(17,21),(28,12), retain the true F-hold branch at every step after their first singleton. The respective surviving parameter counts (including the always-legal null law) are 2,5,2; true final-word state counts are 1,2,6. These are reachability controls, not claims of unique full-trajectory recovery. The ordinary emitter returns the exact planted plaintext using the true key and seed; the minimum singleton-type counts in exhaustive searches are 1,2,2, equal to the respective true native counts. The solved-GP comparator is a published donor transcription; these controls do not assert perfect agreement with every original LP1 glyph.

Reproducer: [read-only CommonJS SFT](../sims/lp2_affine_wordfed_autokey_allkey_sft.cjs). The central algorithms were executed directly on the fetched original corpus and published donor; no Windows CI run is claimed. Source input blobs: transcript 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, donor 1b064ef6d85819b7d96adaff31a82d1ec551598f.

**Disposition:** retire the whole shared affine previous-plaintext-word cyclic key family under the given continuous group framing and historical F-hold emission; seven individual artwork chapters also reject every nonnull key; do not rescue the rejected identity by changing only sign, scaling or adding an offset. The ordinary model remains algebraically invertible but fails its native-word prerequisite. Other state laws, separately source-selected resets, changed segmentation and external keys remain outside this result.
