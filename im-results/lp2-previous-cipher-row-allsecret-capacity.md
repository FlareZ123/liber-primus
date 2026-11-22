# LP2 previous-cipher-row all-secret capacity gate

**Status (13 November 2026): original-input family exclusion under pinned source-native English controls.** The complete unknown physical LP2 pp0–55 (excluding the runeless p50) remain undeciphered. This gate rules against a particularly permissive deterministic **one-step ciphertext-context substitution** as the entire within-word encoder, with secret row maps that may differ across the nine source-visible visual chapters. The method recovers no unknown plaintext or historical key.

## Original-cipher hypothesis and exact obstruction

At each noninitial position `j ≥ 1` in a printed word, consider

`C[j] = f_{chapter(j), C[j−1]}(P[j])`.

Each of the **9 × 29 independent secret functions** `f` may be any GP29-to-GP29 map. The maps need not be affine, injective, monotone, invertible or linked between chapters. Every printed word-initial ciphertext rune is completely unconstrained; page-spanning word continuations remain in the word, and chapter assignment follows the authenticated physical-page visual map. This gives the proposed cipher substantially more freedom than a single keyed 29×29 alphabet, a Caesar/affine feedback, or a Vigenère variant.

For each observed state `s = (visual chapter, immediately preceding ciphertext rune)`, count its outgoing ciphertext symbols `n_s(c)`. Any particular plaintext rune, such as GP rune `E`, can emit at most **one** ciphertext rune for a fixed state `s`. Thus, for every imaginable choice of the secret functions,

`#plaintext E among tested positions ≤ Σ_s max_c n_s(c)`.

For a fixed set of `k` plaintext runes, replace the maximum with the sum of the largest `k` bins. These are tight statewise upper bounds even when every function is chosen adversarially after seeing the ciphertext. The inequality is independent of the missing secret alphabet and holds equally for nonbijective deterministic functions.

The original material gives exactly **2,896 complete printed words**, **12,956 ciphertext runes**, and therefore **10,060 tested noninitial within-word runes**. All 261 chapter/previous-cipher states appear in the original source. The chapter boundaries are the physical rune offsets `729,1874,3603,5506,6527,7960,9640,12648,12956`.

| Allowed secret-map scope | Most frequent fixed plaintext rune | Any two fixed plaintext runes | Any three fixed plaintext runes |
|---|---:|---:|---:|
| Whole-book previous-rune rows (29 states) | 578 | 1,086 | 1,582 |
| Nine independently keyed visual chapters (261 states) | **1,068** | **1,938** | **2,692** |
| Independently keyed *physical pages* (1,583 observed states) | **2,401** | **4,140** | Not needed |

The stronger last allowance is **not excluded** by this gate: it can already accommodate the matched English `E` rate. This illustrates why a chapter-scoped exclusion must not be misstated as a per-page, per-word, or arbitrary changing-state impossibility.

## Relationship to existing predecessor-state work

This is a **word-local-reset refinement of the already published all-secret predecessor-capacity invariant**, not a newly discovered mathematical principle. The prior [chapter/previous-rune capacity gate](../sims/lp2_chapter_predecessor_allsecret_capacity_sft.cjs) counts all original within-page transitions, offers a separate observable boundary flag, and grants 55 page initials. The present calculation deliberately **discards all 2,896 word-initial runes and grants them completely unconstrained**, which yields a different original-word-local hypothesis and the within-word 10,060-position ceiling. It also uses **exact length-matched words**, whereas the prior full-chapter screen principally compares continuous source-native control windows. This word-reset extension matters only for a cipher whose deterministic row law is restarted or bypassed at each printed word. It does not materially change the already documented exclusion of a single stationary chapter/previous-cipher row as a complete language-native encoder. Researchers should reuse the prior work and the current result rather than launching a third duplicate.

## Historical-language relevance and source-native checks

The exact GP29 alphabet, authentic cross-page word continuations and nine chapter offsets are read from `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`; the two sequences are asserted identical before analysis.

The pinned Shakespeare, Gibran and Emerson English controls are transliterated into the repo's GP29 English register, including `ING→ᛝ` and `IO→ᛡ` and existing `QU/V/K/Z` normalization. For each corpus, **512 deterministic samples** select source-native English words with exactly the original **2,896 printed word lengths**, and count the same 10,060 noninitial positions. The generator seed is `0x5eed3301`; every corpus is sampled independently. This is a finite English-register comparison, without claiming that the unknown plaintext must match any of these authors.

| Pinned control | Lowest `E` count / 512 | Lowest `E+O` | Lowest `E+O+A` |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 1,371 | 2,234 | 2,798 |
| Emerson, *Essays* | 1,396 | 2,107 | 2,726 |
| Shakespeare, first 300k | 1,395 | 2,296 | 2,928 |
| **Original nine-chapter upper capacity** | **1,068** | **1,938** | **2,692** |

Every one of **1,536** length-matched native-English candidate passages breaches the source-original `E` and `E+O` capacities. The result is not sensitive to selecting the most favourable row substitutions, since the entire secret map family was maximized analytically before selecting the English controls.

**Exact positive control:** Each corpus's first matched sample was encrypted with a separate fixed, randomly permuted **29-row state table per visual chapter**, respecting every original word boundary. A source-native roundtrip recovered the full **12,956/12,956** planted runes for each case. Its original-format ciphertext necessarily satisfies the capacity inequality (Gibran plant `E=1467≤2586`; Emerson `1516≤2352`; Shakespeare `1441≤2270`). The original-input and positive-control SFT **passed** on GitHub Actions [run 43487078698](https://github.com/FlareZ123/liber-primus/actions/runs/43487078698).

**Reproducer:** [`sims/lp2_previous_cipher_row_capacity_sft.cjs`](../sims/lp2_previous_cipher_row_capacity_sft.cjs), Node 22/CommonJS; manual-only [CI workflow](../.github/workflows/lp2-prevrow-capacity-manual.yml).

## Decision for subsequent research

A single preceding ciphertext rune, even coupled with an independently secret deterministic 29-symbol emission table for each of the nine source-visible visual chapters, lacks the state-dependent output concentration needed to encode conventional source-native English at original LP2 length and word format.

A viable near-no-repeat architecture using English would need additional independently motivated state (such as a per-page rekey, word-relative position, hidden keystream/counter, multirune buffering or a lossless escape mechanism); an alternative plaintext register might also change the bound. None is selected by the present source. **Do not expand this test into arbitrary state/cipher parameter searches without a source clue.** Use it to discard one-step preceding-cipher-rune alphabet decoders and devote the next attack to original-key acquisition or independently specified state updates.
