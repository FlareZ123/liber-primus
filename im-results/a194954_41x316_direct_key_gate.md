# A194954 / 41×316 direct-key gate

**Status (14 November 2026):** key-independent original-cipher exclusion of all **41 independently secret, stationary GP29 substitution alphabets** under each of two source-shaped 41×316 groupings, plus the earlier bounded negative for direct additive keys. This is a finite source-native-English-register result. No unknown LP2 plaintext, cipher key, or final destination recovered. The cross-round 41×316 selector is still hypothetical.

## Hypothesis tested

The cross-round candidate is:

1. The 2014 signed-message archive has a whitespace-run transcription matching the first eleven terms of OEIS A194954: 2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37.
2. The terms not exceeding the 19-word p57 Parable body select 1-based positions 2, 3, 5, 7, 11, 13, 17:
   **THE INSTAR TO SURFACE OUR CIRCUMFERENCES WITHIN**.
3. That phrase has 41 Latin letters but only 39 canonical GP rune tokens (the TH digraph occurs twice). A separate 2014 7×7-square / NUMBER construction has 41 active symbols. The original unknown LP2 stream has 12,956 runes, exactly 41×316.
4. In the 2016 signed message, the PGP signature marker begins at byte index 317; excluding the separator newline leaves a 316-byte prefix. This suggests—but does not prescribe—a 41-row ×316-column arrangement.

The exact 41×316 shape is real. Treating one symbol as a constant shift for each row, or using the 41-letter phrase as a period-41 key, is a hypothesis rather than a consequence of that shape.

## Reproducible tests

Run:

```sh
node sims/a194954_41x316_direct_key_gate.cjs
```

The script uses the original corpus and transcription, preserving printed punctuation word boundaries and the repository's page-number correction for runeless p50. Its GP trigram model is trained on the first 240,000 characters of `resources/control/shakespeare_first300k.txt`; the remaining text supplies a same-length held-out English control. It tests:

- 41×316 row-wise constant shifts, both signs, with the 41-letter p57 phrase;
- the same row-wise model with the 2014 square's center-out and outer-to-center 41-symbol sequences;
- continuous phase-zero period-41 GP Vigenère, both signs, with the p57 phrase;
- 2,000 deterministic shuffled key-order controls for phrase row shifts, square center-out row shifts, and the best period-41 sign.

No phase search, key fitting, or post-hoc language optimization is used.

## Results

| Input / operation | Log score per rune | IoC | Control |
|---|---:|---:|---|
| Raw unknown LP2 p0–55 | −8.81035 | 0.034478 | baseline |
| Same-length held-out Shakespeare | −2.40180 | 0.058689 | English control |
| Solved p57 plaintext (89 runes) | −3.89197 | — | short native plaintext control |
| Phrase, 41×316 row shift, C−K[row] | −8.77251 | 0.034461 | shuffled-order p=0.146 |
| Square center-out, 41×316 row shift, C−K[row] | −8.79983 | 0.034462 | shuffled-order p=0.298 |
| Square outer-to-center, 41×316 row shift, C−K[row] | −8.81253 | 0.034506 | no improvement |
| Phrase, period-41 C+K | −8.75256 | 0.034531 | best-of-signs shuffled-order p=0.105 |

The opposite signs are also tested and score worse. The best candidate is still more than six log-score units per rune below the same-length English control. Its output remains ciphertext-like. The modest score lifts are not exceptional under shuffled key order: the source order ranks 1,710/2,001 for phrase row shifts, 1,405/2,001 for square row shifts, and 1,791/2,001 for period-41 phrase use.

The result rejects these direct additive interpretations of the 41×316 structure. It does **not** reject A194954 as a word selector, a non-additive route through the 2014 square, or a source-selected navigation operation on LP2.

## Any secret alphabet per row or column: key-independent original-cipher gate (14 November)

The previous direct-key negative still left a stronger and genuinely different model open: **each one of the 41 classes may have its own wholly secret permutation of all 29 runes**. This includes all Caesar/Vigenère shifts, secret arbitrary static substitution alphabets, source-derived or unknown 41-symbol seed schedules, and different alphabet choices per class. A fixed classwise permutation cannot change how often two symbols in that class are equal; no key search is required.

Flatten the 55 rune-bearing, still-unsolved physical LP2 pages p0–55 in original reading order, omitting runeless p50, for exactly **12,956 GP29 runes**. The source-shaped partitions are:

- **Contiguous rows:** 41 consecutive blocks of 316 runes, class `floor(i/316)`.
- **Interleaved columns:** 41 residue classes `i mod41`, each holding 316 runes. This covers a period-41 secret alphabet and the opposite 316×41 orientation.

For each class `g` and GP29 symbol `a`, let `n[g,a]` count its observed appearances. The exact key-independent invariant is

`Q = sum_g sum_a n[g,a] * (n[g,a]-1) / 2`.

A bijection of the 29 symbol labels within class `g` merely permutes the 29 frequencies, leaving `Q` unchanged, regardless of the hidden alphabet order or source of its key. Each geometry has exactly `41 * choose(316,2) = 2,040,570` comparable position pairs.

| Original input or GP29 plaintext reference | Windows checked | Contiguous-row equal pairs | Interleaved-column equal pairs |
| --- | ---: | ---: | ---: |
| **Original unknown LP2, unchanged** | 1 | **69,661** | **70,220** |
| Shakespeare source-native GP29 | 32 | **119,491–126,174** | **117,225–125,113** |
| Gibran source-native GP29 | 8 | **122,916–125,401** | **120,924–123,464** |
| Emerson source-native GP29 | 48 | **124,012–129,178** | **123,151–128,299** |

All 88 frozen original-length, half-overlapping source-native controls exceed the exact original-invariant bounds under both partitions. The closest control still exceeds the original by **47,005 equal-symbol pairs** (the minimum interleaved Shakespeare 117,225 versus observed 70,220); the contiguous-row minimum margin is **49,830 pairs**. Original equal-pair fractions are **0.03413801046** (rows) and **0.03441195352** (columns), versus control minima **0.05855765791** and **0.05744718388** respectively. The controls use the established LP1 GP spelling convention `QU→CW, V→U, K/Q→C, Z→S, ING→ᛝ, IO→ᛡ`; exact corpus path, source lengths and sliding-window step 6,478 are frozen in the reproducer.

**Completeness and positive control.** The result grants **every possible secret substitution permutation per one of 41 classes**, far beyond the fixed keys tested earlier. The new CommonJS [original-source SFT](../sims/lp2_41x316_allsecret_capacity_sft.cjs) asserts source-original counts and every control range, then applies 41 different invertible affine GP29 maps `E_g(x)=7x+3g+5 mod29` to held-out native-GP plaintext, recovers it exactly using inverse `7^(−1)=25 mod29`, and verifies the equality-pair invariant is preserved. This checks the architecture and decoder independent of any original ciphertext. The key-independent bound itself does not need those planted keys.

**What is excluded:** a 41×316 source-shape cipher using one fixed-position, **one-to-one GP29 substitution independently per row or column** and producing any of the 88 source-native English control windows as its original-length plaintext. No unknown permutation choice can avoid the contradiction.

**What survives:** a transposition or other rearrangement between positions, changing alphabet within a class, state feedback using previous symbols, non-English/encoded plaintext, or a separately supported variable-word-length transport. These models have different invariants and cannot be dismissed by this test. The 41×316 geometry remains a retrospective cross-round association: this mathematical exclusion is conditional on the partition and on the finite tested English-register controls. It neither proves the historical authors used this shape nor recovers a single unknown plaintext rune.

## Evidence limits on the A194954 selector

The preserved 2014 cleartext-signed message contains the visible 2-space internal gap after “Hello.” and 5-space leading indentation before the onion address. Most of the other runs used to form the eleven-term sequence are trailing or blank-line whitespace. RFC 4880 §7.1 specifies that trailing spaces and tabs are removed before a cleartext signature is generated; those runs therefore are not authenticated by the PGP signature. The repository copy also contains a separate 2-space trailing run after “you.” that is absent from the published eleven-number list. The sequence may have been deliberately present in the original transport bytes, but its exact form is archive-dependent; do not call the full sequence PGP-authenticated.

Also, the first seven A194954 terms are simply the first seven ordinary primes. Its distinctive 23 occurs at term eight, beyond p57's 19-word body. The selected phrase's 41-letter count is not its GP rune count (39), so the 41-letter key test deliberately used single Latin letters mapped to GP single-letter symbols. That is a favorable but non-canonical assumption.

The 2016 43-word count and A194954(12)=43 / final key-ID selection remain an interesting cross-round checksum. They do not supply an inverse operation.

## Decision

Do not repeat direct period-41 additive, 41×316 row-wise Caesar, key-order shuffles or any search for wholly secret **stationary per-class GP29 substitutions** under the two fixed original-input partitions. A key-independent original-invariant contradiction already covers every member of that substitution family against all 88 source-native English controls. The remaining useful question is whether the selected words' *meaning* and the original p57 page's two-dimensional word layout source-select a different, reversible state-changing operation or a unique route through the 2014 square. Freeze that operation from a fresh original clue before evaluating more original ciphertext.

## Sources and supporting work

- Original p57 image: `resources/57.jpg` (also in the uploaded original-image archive).
- 2014 signed message: `resources/historical/cicada2014-stage11-message.asc`.
- 2016 signed message: `resources/historical/cicada2016-4gq25-outguess.asc`.
- 2014 41-symbol square construction and prior direct-key negatives: `im-results/onion7-magic-center-source-prime-gate.md`.
- p57 19-word map and 2013 marker route: `im-results/p57-word-map-19-direction-cycles.md`.
- Reproducers: `sims/a194954_41x316_direct_key_gate.cjs` (earlier frozen keys) and `sims/lp2_41x316_allsecret_capacity_sft.cjs` (new all-secret exact invariant).
- OpenPGP cleartext canonicalization: [RFC 4880 §7.1](https://www.rfc-editor.org/rfc/rfc4880#section-7.1).
- Sequence: [OEIS A194954](https://oeis.org/A194954).
