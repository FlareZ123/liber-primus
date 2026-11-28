# Previous-ciphertext row-permutation capacity: exact 12-phase exclusion

**Original-source, key-independent decision — Agent17, 28 November 2026.** A reversible sender whose only non-clock state is the **previous printed ciphertext rune**, and whose emission is one of at most **twelve shared phase-dependent arbitrary GP29 alphabet permutations**, cannot produce original LP2 p0–55 from **any** matching 12,956-rune GP-native window of the pinned Gibran, Shakespeare or Emerson references. This grants all 29! possibilities for each of 29q secret chart rows, arbitrary plaintext alphabet relabeling, and free initial plaintext symbols at every original page or large-mark interval. The result is a **conditional finite-reference exclusion**, not an unknown plaintext or key recovery.

## Exact typed sender and source framing

The observed cross-word anti-repeat pattern motivates a cipher whose emitting state depends on the **previous ciphertext rune**, rather than treating every printed word independently. For a frame with printed runes C and hypothetical plaintext P, grant its first glyph an unconstrained IV. At later positions i, the typed sender is:

\[
C_i=K_{(i\bmod q),\,C_{i-1}}(P_i)
\]

where each K_(phase, previous-C) is an independently secret GP29 bijection, but is **shared across the whole manuscript**; q is the number of public phases. This is fully reversible given its charts and a starting IV. No constraint of arithmetic, known key alphabet, letter identity, or fluent output is imposed on the original test. There is no Cicada-authenticated instruction selecting this emitter: it is an intentionally broad test of a human-plausible previous-symbol feedback mechanism, not an intended-decoder claim.

Two source-visible reset scopes are charged: (1) the actual **55** rune-bearing physical pages (physical p50 has only numbers), and (2) **29 nonempty marked intervals** delimited by the original **31** large 10/13-dot punctuation events, including duplicate and leading marks. The second crosses physical page seams that have no mark. Within each frame the phase is the local rune position modulo q. All 55 or 29 frame-initial runes are granted arbitrary plaintext, and the sole state selecting the secret row at ordinary positions is the known previous ciphertext rune.

### Key-independent majorization theorem

Let M[t,r,c] count original noninitial positions with phase t, preceding ciphertext rune r and current ciphertext rune c. Sort the 29 output counts in every state (t,r) descending. Let S_k(P) count the k most frequent plaintext symbols, no matter their identities. Every secret permutation sends any selected set of k plaintext labels to exactly k distinct output labels **in each state**. Thus, for every k=1,…,29:

\[
\boxed{S_k(P)\le B+\sum_{t=0}^{q-1}\sum_{r=0}^{28}
\sum_{j=1}^{k}M[t,r,(j)]}
\]

where B=55 page starts or B=29 mark starts. This is an exact, tight upper envelope for **plaintext unigram capacity** over all unknown keys, and a necessary (not sufficient) condition for any full ordered native plaintext. A global secret rune relabeling and arbitrary pre-encryption *position* permutation leave its count bound unchanged. Nonbijective, variable-length, skip/hold and changing-state emitters are not in this family.

For q=1 the **12,901** original page-interior transitions yield the complete descending-rank sums:

[714, 645, 612, 593, 571, 554, 543, 527, 515, 502, 491, 479, 473, 463, 451, 446, 428, 410, 404, 394, 381, 371, 359, 341, 325, 310, 281, 232, 86].

Adding all 55 page-start freedoms gives maximum plaintext symbol frequency **769**, top-two **1,414**, top-five **3,190**, top-ten **5,831**. The rarest output in each previous-ciphertext row is its self-repeat; their sum is the source-observed 86 events. Therefore a secret chart can reproduce a rare plaintext rune as an output repeat **but cannot simultaneously produce ordinary native symbol concentration**.

## Exact original-capacity versus all reference windows

The SFT uses the repository GP29 normalizer with longest rune tokens, ING/IO, QU→CW, V→U, K/Q→C, Z→S. Every 12,956-rune sliding window is tested in all three pinned files: Gibran **49,537**, Shakespeare **204,151**, Emerson **308,372**: **562,060** source windows. The original capacity is fixed before any donor comparison and no proposed key or word is fit to unknown plaintext.

| Source-defined frame | q=1 top-one cap | q=12 top-one cap | q=12 top-ten cap | q=12 top-sixteen cap | q=13 top-one cap |
| --- | ---: | ---: | ---: | ---: | ---: |
| 55 physical pages | **769** | 1,472 | **8,797** | **11,334** | 1,527 |
| 29 large-mark intervals | **744** | 1,439 | **8,695** | **11,256** | 1,510 |

All q=1…12 capacity ceilings at ranks ten and sixteen increase strictly with q under both clocks. The strongest q=12 bound therefore produces an independently reproducible **single-rank contradiction for every donor window and every q≤12**:

| Pinned native source | Fixed rank | Minimum over every native window | Original page q12 cap | Original mark q12 cap |
| --- | ---: | ---: | ---: | ---: |
| Gibran | top 10 | **8,836** | 8,797 (deficit 39) | 8,695 (deficit 141) |
| Shakespeare | top 16 | **11,408** | 11,334 (deficit 74) | 11,256 (deficit 152) |
| Emerson | top 10 | **8,903** | 8,797 (deficit 106) | 8,695 (deficit 208) |

Even the simpler q=1 top-one cap **769** is below the minimum native most-common-symbol count of Gibran **1,416**, Shakespeare **1,408** and Emerson **1,491**. Every one of the 562,060 windows is excluded without guessing which original rune maps to which plaintext symbol.

Allowing more phases softens the bound. The exact full-29-rank survivor counts, from the same frozen source and normalizer, are **necessary capacity passes, not recovered text**:

| Frame | Reference | q=13 | q=14 | q=15 | q=16 | q=18 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Page | Gibran (49,537) | 0 | 22,690 | 49,537 | 49,537 | 49,537 |
| Page | Shakespeare (204,151) | 40,745 | 131,441 | 183,224 | 192,199 | 204,151 |
| Page | Emerson (308,372) | 0 | 4,374 | 180,489 | 239,550 | 308,372 |
| Mark | Gibran | 0 | 8,796 | 40,090 | 49,537 | 49,537 |
| Mark | Shakespeare | 5,404 | 100,361 | 163,779 | 181,621 | 204,151 |
| Mark | Emerson | 0 | 0 | 64,342 | 168,957 | 305,043 |

At q=23 all these windows satisfy the necessary bound, but q=23 has **667 arbitrary hidden alphabet charts** and no source-selected receiver. Likewise thirteen dots do not establish q=13: its 377 secret rows still fail all Gibran and Emerson source windows and most Shakespeare windows.

## Exact-source implementation and positive controls

[Standalone CommonJS SFT](../sims/lp2_prev_ciph_rowphase_majorization_sft.cjs) reads the authentic source-matched [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [original-image ink annotation](../resources/liber-primus/lp2-ink-annotations.json) and all three reference texts. It asserts 12,956 unknown runes, 55 rune-bearing pages, 31 marker events and 29 nonempty marker intervals; computes exact per-state integer counts for q1–18, q23 and q29, and slides all reference windows. It was compiled and **executed against the complete current tracked inputs** in the connected V8 runtime with a read-only require/file-loader shim. All assertions and scans passed; real standalone Node SHA-256 printing was not separately executed in that shim.

Four independent **original-length positive cryptograms** are actually generated and decoded, under both source frame geometries and q=1/q=13. Each hidden GP29 chart is a seeded shuffled permutation, with plaintext NG mapping to the previous emitted cipher glyph in that row. Therefore low-frequency native NG, rather than any malformed output step, is exactly responsible for the **100** repeated cipher neighbors in each plant (original has 86). Every plant recovers **12,956/12,956 plaintext rune positions**, and passes **every one of the 29 original-style ranked-frequency necessary conditions** when run on its own newly encrypted ciphertext. Thus the certificate does not merely reject feedback ciphers because they have artificially low repeat counts.

## Decision and missing authentic step

The original conditional row histograms are close to uniform and cannot supply sufficiently many outputs for the most frequent GP-native letters, even if a secret 29-permutation chart is selected by the previous ciphertext glyph at every step. **Retire full-book q≤12 previous-ciphertext-only row-alphabet brute-force searches** under either original physical-page or large-mark reset. A key search cannot repair this key-independent mathematical contradiction under the stated donor envelope.

A viable receiver would require source evidence for something *actually different*: at least thirteen phases to admit even some of these donor passages, additional evolving state beyond prior ciphertext, F clock holds/skips, hidden insertions/deletions, unknown-length encoding, chapter-private rows, or different non-native statistics. It is not licensed to add extra phases merely to make the native donor pass. A higher-state proposal must identify its operation and input from a first-party source and make an independently recognizable unseen-original-text prediction. **No unknown LP2 plaintext, authentic key or destination was recovered.**
