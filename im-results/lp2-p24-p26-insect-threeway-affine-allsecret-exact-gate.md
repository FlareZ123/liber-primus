# Exact three-way shared affine GF29-pad obstruction on the original insect pages

**Agent10, 22 November 2026. Classification: reproducible original-cipher finite-register exclusion, no new plaintext, authorial key, or full LP2 decoder.** The original physical pages **p24, p25 and p26** reuse the same insect illustration. A pagewise keyed relationship between all three is therefore an independently motivated possibility, distinct from the earlier **two-page additive** (#2148) and **two-page multiplicative** [negative](lp2-p24-p26-insect-shared-multiplicative-pad-native-gate.md). However, original Cicada does not explicitly say the artwork marks a key schedule.

## Arbitrary shared affine key, with no key fitting

The hypothesis allows **every** per-position change in a common invertible affine cipher, including one freely unknown multiplier and offset at **each** rune location:

`C_j[t] = A[t] P_j[t] + B[t] (mod 29)`, for original pages `j=24,25,26`, `A[t]∈{1,...,28}`, `B[t]∈{0,...,28}`.

It is more permissive than any source-fixed arithmetic key schedule. For unequal cipher values `C_i,C_j`, nonzero `A` requires unequal `P_i,P_j`; for the third track `k`, eliminating both freely unknown key values gives the **necessary and sufficient** per-position relation

`P_k = P_i + (C_k-C_i)(C_j-C_i)^(-1)(P_j-P_i) mod29`.

If all three ciphertext symbols are equal, all three plaintext symbols must be equal. Every valid plaintext triple defines an invertible `A,B`, so the test eliminates the full proposed key family without enumerating the keys.

### Source-fixed geometry

Use exactly the first complete source-printed words on each physical page, with **zero-based offsets 3, 2, 1** on p24, p25, p26. The p25 initial two-runic fragment is carried from p24 and is excluded from this synchronized three-way start. The original page rune counts are **270, 273, 265**, and all original transcribed rune arrays are asserted identical to [canonical source](../resources/liber-primus/lp2-corpus.json).

The dictionary is the unchanged 29,157-row [TextBlob/Norvig source](../resources/control/english_wordfreq_textblob.txt), GP29-transliterated with the canonical seven digraphs and period-known QU→CW, V→U, K/Q→C, Z→S variants. Every spelling of each word length up to15 is admitted, including five one-rune forms **A/I/O/TH/OE** to keep the conditional register permissive. Every printed word boundary remains fixed. A separate 29-way GP29 trie per original word length accepts the complete finite vocabulary and nothing outside it.

### Exact, unpruned original input

At each rune location, the algorithm retains **every compatible triple of plaintext word-prefix trie states**, with no beam, language score, guessed key, English phrase, free offset or finite-state pruning. Three trie nodes are losslessly packed in a 48-bit integer; source-printed new words reset only their corresponding trie state. The first 53 source-aligned original runes are tested.

| Original 0-based rune | Exact surviving triple states |
| ---: | ---: |
| 0 | 99 |
| 1 | 7,112 |
| 2 | 37,068 |
| 3 | 207,948 |
| 4 | 414,357 |
| 8 | **1,200,360** (maximum) |
| 10 | 28,444 |
| 40 | 875,497 |
| 48 | 792 |
| 49 | 277 |
| 50 | 10 |
| 51 | **2** |
| **52** | **0** |

The three original rune indices at the decisive zero-based position52 are respectively **10, 0, 13**, i.e. **I, F, P** in canonical GP transliteration, at p24 local55, p25 local54 and p26 local53. Every one of the two surviving word-prefix triples at t51 has no continuation at this original position; the finite shared-affine model is impossible **under the specified native-English words and original reading alignment**, even if a new secret key is supplied for every rune.

### Positive and falsification controls

An **independent planted native-GP control** uses the identical source word-length layouts, selects actual words from the pinned lexicon, encrypts each of the three 53-rune tracks using a **shared, freely changing** nonzero `A[t]` and `B[t]` and submits the resulting ciphertext to the same unpruned search. The true words are among the vocabulary entries, and the positive returns at least one exact state through the full **53/53** positions, with **159/159 symbol-for-symbol reencryption identities** checked.

A separate 53-rune independent-key synthetic control can retain accidental compatible word-prefix triples; consequently **the absence of a match is a finite dictionary and exact alignment theorem, not a statistical claim that any unrelated ciphertext must always fail in 53 positions**. No original unknown plaintext was recovered. The original's lack of a native-English compatible path does not disprove multilingual text, missing dictionary words, transformed word frames, independently chosen page keys, an entirely different cipher family, or a historical key clue not yet recovered.

## Decision and reproducibility

Retire **three-page, source-aligned, rune-synchronous reused arbitrary affine keys** as a route to unchanged GP-native English on the authentic printed word boundaries. This closes an otherwise vast all-secret family without optimizing keys or reusing the already rejected additive/multiplicative family. Further shifts/partitions or changing which pages share a key need an independently authored selector.

**Reproducer:** [Node.js22 CommonJS unpruned SFT](../sims/lp2_p24p25p26_affine_triple_exact_sft.cjs) reads the untouched canonical source, prints the entire exact-state trace, checks the two-state pre-failure and zero-state contradiction and encrypts/decodes a source-shaped positive plant. Manual Windows GitHub Actions workflow runs the same test on the remote committed inputs. This is supporting cryptanalysis in `im-results/`; the authoritative `results/README.md` remains unchanged because no unknown original plaintext or authentic key is established.
