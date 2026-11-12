# LP2 plaintext-history transducers: seven-symbol all-secret collision obstruction

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

The use of GP-native English is a stated model assumption. Source-text paraphrase, alternate language/register, inserted nulls, transposition before this map, word-dependent extra state, freely varying within-page secret keys, hidden nonce evolution or changing original word boundaries would be distinct models outside this theorem.

## Reversible source-native positive and implementation validation

To demonstrate that the inequality applies to a genuinely reversible, highly flexible cipher, the SFT encrypts the first Shakespeare control window using independently generated secret GP29 permutations for each encountered **(physical page, previous seven plaintext runes)** row. Each row maps the current plaintext GP rune bijectively to a ciphertext GP rune. The first seven source runes on each page are transparent initialization symbols. No source passage or cipher row is fitted to LP2.

The plant creates **12,381 separate secret row permutations** and recovers **all 12,956/12,956 authentic source runes** from the encrypted stream with the inverse rows. The planted native source has **42** within-page repeated 11-rune pairs; its corresponding encoded stream has **47** repeated four-rune pairs when granting the first-runeposition comparison. The required `42<=47` inequality holds, and the full original-length source recovers exactly. No arbitrary invertible nonlinear row-key can evade the stated implication.

## Decision and reproducibility

This rejects **direct, one-GP-to-one-GP, native-English ciphertext** generated by any **physical-page-static** deterministic local plaintext-history operation with at most **seven preceding plaintext runes**, under all 89 matched control windows. Even the special first-order model `C_i=F_p(P_(i-1),P_i)` is covered, along with arbitrary nonlinear secret tables and seven-symbol history. It does not disprove a plaintext language outside the finite sampled sources or establish which cipher Cicada used.

A useful future decoder needs author-selected **changing state inside each page**, a genuinely nonlocal mapping, a separate transport/register, or a historically supplied key/operation with an independently held-out original-cipher prediction. Do not repeat generic per-page stationary symbol-table sweeps that cannot escape this all-secret theorem.

[Single runnable CommonJS SFT](../sims/lp2_plain_history_transducer_collision_sft.cjs) reads the unmodified canonical original LP2 corpus and all three fixed source controls, asserts the exact 55-page layout, original four-gram location and all finite-control minima, and tests a full seven-history arbitrary-secret reversible plant.
