# LP2 plaintext-history transducers: seven-symbol theorem and eight-symbol boundary

**Evidence class (12 November 2026, Agent3): exact, key-independent inequality on original ciphertext, combined with finite matched native-GP English controls.** This closes a broad *plaintext-dependent* local cipher family that earlier predecessor-**ciphertext** entropy and feedback studies do not cover. **No unknown LP2 plaintext, historical key, intended operation or destination has been recovered.**

## Hypothesis and causal relevance

The original 12,956 GP29 symbols on 55 rune-bearing LP2 physical pages have an unusually small number of repeated adjacent runes and almost no repeated long symbol blocks. A possible explanation is a locally evolving reversible cipher whose public current output depends on the current plaintext rune and a few earlier plaintext runes, with a secret nonlinear table:

```text
C[p,i] = F_p(P[p,i-q], ..., P[p,i-1], P[p,i])    for i >= q.
```

The entire function `F_p` is secret and may change arbitrarily at every physical page boundary. Each page's first `q` outputs are free initialization symbols. The family includes per-page arbitrary alphabet permutations selected by the preceding plaintext history, symbolwise nonlinear substitutions, and noninjective tables as a superset. A reversible cipher is the subfamily in which each fixed-history row is bijective in its last argument. No prime-derived key, ciphertext feedback coefficient or substitution table is guessed. **The manuscript does not authenticate this plaintext-history architecture**, so this is a cryptanalytic family-discrimination result rather than an author's recovered instruction.

## Keyless overlapping-window theorem

For any fixed page and any `q <= 7`, if two source plaintext windows of **11 consecutive GP runes** are identical, their four ciphertext outputs from offsets `+7,+8,+9,+10` must be identical. Every one of those output positions depends only on the previous at most seven plaintext runes and the current one, all wholly contained in the repeated 11-rune window. This holds for **every possible secret `F_p`**, with no injectivity or linearity requirement. The two windows must be on the same physical page so the secret function is the same; printed word and line boundaries do not reset the model.

Let `E_m(X)` count unordered pairs of identical, overlapping length-`m` windows **within each physical page**, summed over all 55 pages. The exact necessary condition is:

```text
E_11(plaintext, pageStarts>=0)
    <= E_4(ciphertext, pageStarts>=7)
    <= E_4(ciphertext, pageStarts>=1).
```

The second inequality deliberately grants **extra initial ciphertext windows** to the model, making the tested upper bound more permissive. The original manuscript has exactly **one** within-page repeated ciphertext four-rune pair under this larger count, on physical **p7 at local offsets 91 and 170**, the GP sequence `[21,5,8,22]` / `ᛝᚳᚻᛟ`. Its within-page 3- and 5-rune collision counts with the same one-rune startup exemption are respectively **55** and **0**.

Thus any proposed native-GP plaintext under the family must have **at most one** repeated 11-rune window pair within the original physical-page boundaries, irrespective of a hidden `29^(q+1)` lookup table, 55 separate keys or the transcript's original word count.

## Native source calibration on the exact original 55-page layout

The standalone SFT converts three already-pinned independent English corpora to 29 GP symbols using the repository's established longest-match transliteration and `QU→CW`, `V→U`, `K/Q→C`, `Z→S` conventions. It takes successive 12,956-rune source windows at 6,478-rune strides, then overlays the **same 55 physical-page lengths as LP2**, without inventing any new word or page cuts. Windows are overlapping samples, so the table is finite source coverage rather than an exhaustive natural-language theorem or discovery-wide significance claim.

| Source edition | Native GP runes | Matched windows | Minimum native within-page equal 11-gram pairs | Minimum equal 12-gram pairs |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 218,800 | 32 | **13** | 6 |
| Gibran, *The Prophet* | 63,114 | 8 | **64** | 48 |
| Emerson, *Essays* | 324,630 | 49 | **2** | 0 |
| **Original LP2 ciphertext upper bound** | **12,956** | **55 physical pages** | **1** | **1** for the same four-rune output bound |

**All 89/89** source-native windows violate the necessary `E_11(plaintext)<=1` inequality. In the most favorable control, the contradiction is still at least **2 versus 1**. Hence none of these 89 independently chosen native-English plaintext spans can produce the original ciphertext under **any** page-static `q<=7` deterministic plaintext-history transducer, however many secret mapping entries it has. A `q=8` family does **not** meet this exclusion for all controls: some 12-rune Emerson windows have zero within-page collisions, so this result supplies a conditional **seven-previous-rune memory boundary** rather than a universal minimum key length.


## Eight-symbol boundary: collision test and exact deterministic consistency

For q=8, an identical **12-rune** plaintext window forces an identical **four-rune** ciphertext window at offsets +8 through +11. The same generous original-cipher upper bound therefore gives the necessary condition E_12(plaintext) ≤ E_4(ciphertext) = **1**. This is the first history width beyond the q≤7 theorem, tested on the same 89 fixed native-GP windows and unchanged 55 physical-page boundaries.

| Native-GP source | Windows | Minimum E_12 | Windows satisfying E_12 ≤ 1 |
| --- | ---: | ---: | ---: |
| Shakespeare | 32 | **6** | **0** |
| Gibran | 8 | **48** | **0** |
| Emerson | 49 | **0** | **2** |
| **Total** | **89** | — | **2** |

Thus 87/89 windows still fail the four-output collision condition. The only two survivors are Emerson source offsets **25,912** (E_12=0) and **161,950** (E_12=1). This is the precise point at which the collision-count theorem alone stops deciding every sampled source window; it is not evidence for a q=8 cipher.

### Exact q=8 input-consistency gate

For each physical page and each preceding-eight-rune plaintext context h, the current plaintext rune x is part of the deterministic function input. Every occurrence of the same (h,x) must therefore produce the same original ciphertext rune y. A single repeated input with two different outputs contradicts **every deterministic F_p**, including non-bijective functions; no key search or language score is involved. A reversible row additionally requires distinct x values to map to distinct y values.

Both collision-count survivors fail this exact check:

| Emerson source offset | E_12 | Eligible positions | Distinct page-specific 8-rune histories | Repeated histories | Conflicting identical (history, current-rune) inputs | Additional bijection conflicts |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 25,912 | 0 | 12,516 | **12,484** | 32 | **14** | 0 |
| 161,950 | 1 | 12,516 | **12,484** | 32 | **13** | 1 |

Each repeated history occurs exactly twice. In 14 and 13 cases respectively, the same current plaintext rune would have to encrypt to two different ciphertext runes. The second candidate also has one different-input/same-output collision, independently incompatible with a bijective row. Across **all 89/89** controls, the exact deterministic check finds at least one contradiction (minimum conflict counts by source: Shakespeare 42, Gibran 99, Emerson 13; overall maximum 665). Consequently **no matched native-English control is an exact q=8 deterministic page-static transducer plaintext**, even though two evade the coarser E_12≤1 test.

### q=8 source-state and literal-table capacity

The two collision-count survivors each visit **12,484 distinct page-specific history contexts** in 12,516 eligible positions. That is a source-control measurement, not a claim about the unknown original plaintext. The possible history domain is 29^8 = **500,246,412,961 states per page**; 55 independently keyed page functions expose 27,513,552,712,855 possible page/state rows. A full independent 29-symbol permutation carries log₂(29!) = **102.8021767 bits**. A dense full-permutation table over all page/state rows would be about **353.6 TB**.

For just the observed 12,484 contexts of one collision-count survivor, a literal sparse table of complete permutations would require about **1,283,382 bits (160,423 bytes)**. Even storing only one independent 29-way output assignment per distinct (history,current-rune) input requires about **60,734–60,739 bits (7,592 bytes)** for the two candidate windows. By comparison, the conditional 256-byte interpretation of the printed pp49–51 table contains 2,048 bits: enough for at most **19 complete permutation rows** or **421 single-output assignments**. This comparison does not authenticate that table as a key or exclude other historical sources.

A compact source-specified generator could expand a much smaller seed into many rows; the source would still need to select the generator, seed and initialization. The q=8 runtime history itself is only eight GP symbols (about 38.86 bits). The first eight symbols per page can be transparent, as in the positive control below; if opaque, the 55 page starts require 440 initial runes (about 2,138 bits / 267 bytes) from a separate source-derived rule.

### Reversible q=8 positive control

A short source-native plant uses the first two original page lengths (**262 and 266 runes**, 528 total), with independent secret random permutations for each encountered (page, previous-eight-rune history). The first eight symbols on each page are transparent initialization. The plant creates **489** secret rows and recovers **528/528** symbols exactly. This validates the q=8 encoder/decoder construction; it does not make the two inconsistent original-source candidates valid or identify an LP2 key.

The use of GP-native English is a stated model assumption. Source-text paraphrase, alternate language/register, inserted nulls, transposition before this map, word-dependent extra state, freely varying within-page secret keys, hidden nonce evolution or changing original word boundaries would be distinct models outside this theorem.

## Eight-column period with independent page-and-phase keys

The original numerical table is printed in **eight columns**, a source-visible but *unproven* candidate for an eight-rune positional clock. Give an adversarial cipher a completely independent secret table for **each (physical page, position mod8)**, plus the current plaintext and up to **three preceding plaintext runes**:

```text
C[p,i] = F_(p,i mod8)(P[p,i-q],...,P[p,i]),   1 <= q <= 3.
```

An identical plaintext **seven-rune** window in the same physical page and at the same starting position modulo8 must generate an identical cipher four-rune window, since each of the four successive output positions sees the same 8-phase and the same last at most three plaintext symbols. Again the table can be any unknown nonlinear function or any secret bijection for each plaintext history. The exact same-phase collision-count inequality is `E_7(P,phase8)<=E_4(C,phase8)`, with one-rune startup cipher windows counted generously.

The original p7 four-rune repeat at offsets91 and170 has different phase residues (3 versus 2 mod8). Accordingly the actual original GP29 manuscript has **zero** repeated four-rune windows with equal page-local mod8 phase. On the **same 89 independent native GP English windows** and the identical 55 physical page layout:

| Native-GP author | Matching source windows | Minimum page-and-phase8 identical seven-rune window pairs | Original same-phase ciphertext four-rune pairs |
| --- | ---: | ---: | ---: |
| Shakespeare | 32 | **6** | 0 |
| Gibran | 8 | **12** | 0 |
| Emerson | 49 | **2** | 0 |

Every one of **89/89** original-length controls contradicts this equality implication, even when up to **440 independently secret phase tables**, each with arbitrary history-conditioned mapping, are granted. A separate source-native positive with 55 independent page ciphers, each phase using a secret permutation conditioned on three previous plaintext runes, constructs **12,532 different secret rows**, encrypts and recovers exactly **12,956/12,956** GP symbols, and has **39 plaintext seven-rune same-phase collision pairs** forcing **41 ciphertext four-rune same-phase pairs**. This demonstrates the inequality survives a full reversible page/phase nonlinear cipher.

At plaintext-history depth four, four of the 49 Emerson control windows have no same-phase repeated eight-rune source window, so the full-family exclusion stops at **q=3** for this source-proposed period8 clock. The eight-column count does *not* authenticate a phase8 cipher or key schedule; this is a bounded conditional obstruction to that specific source-compatible alternative.

## Reversible source-native positive and implementation validation

To demonstrate that the inequality applies to a genuinely reversible, highly flexible cipher, the SFT encrypts the first Shakespeare control window using independently generated secret GP29 permutations for each encountered **(physical page, previous seven plaintext runes)** row. Each row maps the current plaintext GP rune bijectively to a ciphertext GP rune. The first seven source runes on each page are transparent initialization symbols. No source passage or cipher row is fitted to LP2.

The plant creates **12,381 separate secret row permutations** and recovers **all 12,956/12,956 authentic source runes** from the encrypted stream with the inverse rows. The planted native source has **42** within-page repeated 11-rune pairs; its corresponding encoded stream has **47** repeated four-rune pairs when granting the first rune-position comparison. The required `42<=47` inequality holds, and the full original-length source recovers exactly. No arbitrary invertible nonlinear row-key can evade the stated implication.

## Decision and reproducibility

The overlapping-window theorem rejects **direct, one-GP-to-one-GP, native-English ciphertext** generated by any **physical-page-static** deterministic plaintext-history operation with at most **seven preceding plaintext runes**, across all 89 matched controls. At q=8, the four-output collision inequality alone admits two Emerson windows, but the exact repeated-input consistency condition rejects both; all 89 fixed native-GP controls therefore fail the tested q=8 deterministic family as well. This remains a finite matched-source result, not a theorem about every possible English text, a source-selected cipher, or recovered plaintext.

The q=8 boundary does not justify increasing history width without a source clue. A literal table for the observed contexts is already much larger than the conditional printed 256-byte grid, while a compact algorithmic generator remains possible but presently has no source-selected seed or recurrence. Future work should seek an authenticated generator/key source, a changed plaintext register, or a nonlocal operation with an independently held-out original-cipher prediction. Do not launch arbitrary higher-history table searches.

[Single runnable CommonJS SFT](../sims/lp2_plain_history_transducer_collision_sft.cjs) reads the unmodified canonical original LP2 corpus and all three fixed source controls, asserts the 55-page layout and original collision location, checks q≤7 and q=8 constraints on all 89 windows, and tests seven-history, q=8 short reversible, and independent eight-phase/three-history secret plants.
