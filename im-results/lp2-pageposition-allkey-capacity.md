# All-secret GP29 page-position theorem: direct shared page schedules cannot decode native prose

**Decision (12 November 2026):** A direct 29-rune cipher that reuses its substitution at each page-local rune offset cannot encode any of the **564,558** equal-length native-GP English windows in three independent reference corpora. The exclusion permits **277 completely arbitrary and independent 29-symbol permutations**, one for every possible original page-local rune offset. It also excludes globally continuous position-only substitution schedules with any period from 1 through 256, even when every phase is an arbitrary secret permutation. The nearest matched Shakespeare source window requires at least **631 individual published-rune replacements** under the page-local hypothesis.

No unknown Liber Primus plaintext, historical key, encryption operation or intended destination is recovered. This is a direct-code architecture exclusion, distinct from the existing probabilistic page-synchronized collision test.

## Source, human-readable premise and test boundary

The original resource resources/liber-primus/lp2-corpus.json contains **12,956** unsolved GP29 rune symbols over **55 rune-bearing physical LP2 pages** (pages 0–55, excluding runeless p50). The longest physical page has **277 runes**. A human solving an illustrated page-oriented manuscript might suppose each position relative to the start of a printed page uses a reused secret substitution. The 32×8 table on p50 could provide a 256-phase schedule; here its bytes are unrestricted, so the test does not guess how the table is interpreted.

For every physical page and zero-based local rune offset t, the hypothesis is:

~~~text
C[page,t] = sigma[t](P[page,t])
~~~

Each sigma[t] is an arbitrary bijection on 29 GP runes, globally reused only when the page-local position matches. Its complete secret alphabet may be independently selected at each of the 277 offsets. It has no period, affine restriction, assumed numeric key, or fitted English alphabet. The second model instead synchronizes the secret alphabet to the concatenated book position modulo an arbitrary period L between 1 and 256.

## Sharp all-hidden-key inequality

For a given public position state t, let n[t,c] count how often printed rune c occurs there. For any *fixed set of k plaintext symbols*, a permutation must map those k symbols to exactly k distinct ciphertext glyphs. The maximum output count belonging to that plaintext set, across every possible secret alphabet, is attained by assigning the k largest ciphertext bins to it.

Thus the exact and attainable all-key bound is:

~~~text
U[k] = sum over source position states t:
       sum of the k largest n[t,c] values
~~~

This holds simultaneously as a necessary bound for all 1 ≤ k ≤ 29. For a genuine native-GP source window, sort its 29 plaintext rune frequencies descending, and let T[k] be the cumulative top-k count. Necessarily T[k] ≤ U[k] for every k. If the published ciphertext differs from a valid encoding by e rune replacements, each replacement changes a selected-set count by at most one, hence:

~~~text
e >= max over k from 1 to 29 of max(0, T[k] - U[k])
~~~

This is independent of the unknown 29! secret permutations, ciphertext scoring, language-model fitting or a proposed cipher direction.

## Exact results on original LP2

| Bound | Arbitrary 277-phase page-local alphabets |
|---|---:|
| U[1], any one plaintext rune | **1,277** |
| U[12], any twelve plaintext runes | **9,160** |
| U[16] | **10,846** |
| U[29] | **12,956** |

Across **all 256 globally continuous phase periods**, the largest U[1] is **1,273** (period 252), while the largest U[12] is **9,069** (period 256). For the literal 256-cell continuous clock itself, U[1] is **1,244** and U[12] is **9,069**. These are maxima over independently arbitrary secret permutation alphabets at every phase.

The reference language corpus is normalized with the already existing greedy 29-rune GP tokenizer: QU→CW, V→U, K→C, Z→S, Q→C, ING→NG. Every possible consecutive **12,956-rune source window** was checked, without selecting a window from the unknown book.

| Independent source | Windows tested | Minimum most-frequent-rune count | Minimum top-12 count | Fewest required original glyph replacements under the 277-phase model |
|---|---:|---:|---:|---:|
| Shakespeare, 217,644 normalized runes | **204,689** | **1,404** | **9,651** | **631** |
| Gibran, 62,696 runes | **49,741** | **1,414** | **9,897** | **751** |
| Emerson, 323,083 runes | **310,128** | **1,486** | **9,986** | **871** |
| **All references** | **564,558** | — | — | **0 compatible windows** |

All three source corpora require more concentration than the original can represent under this architecture. The minimum 631-substitution figure is a strict *necessary* repair budget over all 29 ranked-frequency inequalities, not a fitted candidate decrypt. The source-window offsets achieving the respective minima are **147,886**, **42,748**, and **152,728** in the three independent controls.

## Exact encryption and inverse positive

The source test constructs independent secret 29-symbol permutations at all 277 page offsets, enciphers a native Shakespeare GP passage in the original 55-page layout, and decrypts and re-enciphers **all 12,956 symbols exactly**. The true plaintext's complete ranked-symbol-frequency profile satisfies every original-format majorization inequality on the planted ciphertext. This powered positive distinguishes the actual LP2 exclusion from a broken model implementation.

**Reproducer:** sims/lp2_pageposition_allkey_capacity_sft.cjs, CommonJS, Node.js 22. It reads source corpus plus Shakespeare, Gibran and Emerson GP control text through existing tokenizer/scanner utilities, makes no writes, and prints the exact bounds and source stats. Its initial version passed [manual GitHub Actions run 43125350100](https://github.com/FlareZ123/liber-primus/actions/runs/43125350100); the next revision additionally asserts each independent dominant-symbol control.

## What the result changes

A position-only page-reset rotor or directly repeated table-derived alphabet schedule is excluded as a native-GP English decipherer regardless of secret alphabet complexity or table-cell interpretation, even if someone reconstructs all secret page-position keys. A separately fixed continuous period at most 256 is also excluded. This makes a further scan for additional static page-position alphabets causally unproductive.

The conclusion depends on **shared page-synchronized or book-periodic positions, bijective rune-to-rune emission, unchanged ordering and a direct source-native GP-English register**. It does not exclude independent page keys, hidden key skips, cipher feedback, arbitrary non-English or intermediate binary registers, transposition, insertion/deletion or a genuinely high edit budget. No true unknown plaintext has been read, and the missing source-selected decipherment operation remains unresolved.
