# Exact state budget for length-preserving, changing-state LP2 word ciphers

**Classification, 12 November 2026:** Exact conditional theorem and reproducible original-ciphertext/native-source benchmark. This establishes which changing-state **whole-word permutation** models can fit a predeclared plaintext-word sample, but recovers **no unknown LP2 plaintext, historical key, operation or continuation**. It does not establish that LP2 preserves plaintext word boundaries, or that a codebook is the real cipher. Director [#542](https://github.com/FlareZ123/liber-primus/issues/542).

**Reproducer:** [one-file CJS SFT](../sims/lp2_word_state_budget_sft.cjs), executed on [passing manual CI run 43152781884](https://github.com/FlareZ123/liber-primus/actions/runs/43152781884) via the **existing manual-only** word-partition workflow. All 512 three-by-three bipartite graph controls, 210 original-cipher/native-source runs, three independent keyed plants and three original-input inverse/re-encryption constructions passed. No per-commit CI trigger was introduced.

## 1. Original observation, plaintext premise and alternative

The canonical original source has 55 rune-bearing unknown physical LP2 pages, **12,956 GP29 runes** and **2,896 complete printed words**. All **1,645 ciphertext words of length at least four** are unique, as established with byte-preserved source delimiters in [the existing original-word invariant](lp2-word-collision-injective-source-gate.md). The parser joins word carries over printed line/page breaks. The largest page contains **71 word starts**.

**Premise:** Each printed ciphertext word corresponds to exactly one plaintext GP word of the same rune length, and each internal state selects an **injective, length-preserving mapping of entire words**. The mapping may be an arbitrary secret permutation on the set of all \(29^L\) length-\(L\) rune words; no symbolwise substitution, affine restriction, or key derivation is assumed. Multiple word lengths share state labels but have disjoint permutation domains.

This is intentionally generous and is different from the already excluded static page/line codebooks. Its weakest assumption is source-word/printed-word alignment. Solved genuine LP2 p56 has exact word-length alignment, but that does not establish alignment on unknown pages. A continuously encrypted binary/rune stream with independently printed spaces is a competing explanation and has no forced word-state budget.

## 2. Exact minimal number of arbitrary states

Fix a proposed source GP word sequence \(P_i\) matching the 2,896 original printed word lengths and the original ciphertext words \(C_i\). For every rune length \(L\), build a bipartite graph with one left vertex per **distinct** \(P_i\), one right vertex per **distinct** \(C_i\), and one edge per distinct observed pair \((P_i,C_i)\). Duplicated identical pairs are one edge since they may use the same state.

A deterministic, invertible word table for any one state must form a **matching** in this graph: equal plaintext cannot have two ciphertexts in one state, and two different plaintexts cannot map to the same ciphertext. Conversely, every matching extends to a length-\(L\) permutation on the remaining \(29^L\) words because its left/right vertices are all distinct.

Every edge is assigned a state color. The **exact minimum** number of unconstrained reusable states is therefore

\[
S_{\min}=\max_{L}\Delta(G_L),
\]

where \(\Delta\) is the largest number of **distinct** ciphertext neighbors of one source word or **distinct** source neighbors of one ciphertext word. Lower bound: edges sharing a vertex need different states. Upper bound: Kőnig's line-coloring theorem colors every bipartite graph with exactly \(\Delta\) colors, and disjoint length classes can reuse colors.

The SFT constructs an optimal edge coloring with alternating-color paths. It exhaustively verifies the bound for **all 512 simple bipartite graphs on \(3+3\) vertices** and, for the first sample from each native source, constructs **2,851 / 2,859 / 2,849** fitted distinct \((P,C)\) word-pair entries. These codebooks reproduce and invert **all 2,896 original ciphertext words exactly** using precisely the predicted minimum state count. This is a *mathematical positive control of feasibility after fitting the entire original ciphertext*, not evidence that its invented plaintext or fitted key is historical.

With an **independent codebook per physical page**, the same theorem applies to each page separately; the page state labels may be reused. The book-wide requirement becomes the largest degree among the 55 page-specific graphs.

## 3. Exact bound for cyclic state clocks

For period \(T\), a book-global phase is \(s_i=i\bmod T\), using zero-based ordinal **word** position. For two conflicting observations \(i,j\) sharing a plaintext word but different ciphertext words, or sharing a ciphertext word but different plaintext words, the period is impossible whenever

\[
T\mid |i-j|.
\]

The SFT marks **all exact divisors of every conflicting word-index gap**; the first unmarked period is necessary and sufficient for an arbitrary secret word permutation at each phase. There is no probabilistic search and no assumed key. The construction can color the observed phase-specific matchings and extend each to a full permutation.

The source-visible **page-local** alternative is \(s_i=(\text{word index within its physical page})\bmod T\), with an *independently keyed codebook per page*. Only conflicts within the same page matter. A third alternative resets the phase at each page but reuses one shared codebook across all pages. For that case, conflicting words at the **same page-local index** are impossible at every period, regardless of key size. All 210 tested native-source samples contain such conflicts.

## 4. Original-input benchmark on three native GP-English sources

A fixed unsigned XorShift32 seed **0x05423301** draws **70** independent length-bin samples per corpus **with replacement**, preserving every original ciphertext word's GP rune length and starting page. The GP normalizer uses the repository's existing substitutions including TH, ING/NG, EO, OE, AE, IA, EA, QU→CW, V→U, K→C and Z→S. Source token distributions come from the committed Gibran, Shakespeare and Emerson controls. These are **conditional synthetic plaintext hypotheses**; they do not claim to reconstruct authored prose or infer actual LP2 plaintext.

For each of the **210** original-ciphertext/native-source alignments, the script computes the exact arbitrary-state graph degree and every excluded period, not merely a score.

| Model and statistic across 70 samples | Gibran | Shakespeare | Emerson |
| --- | ---: | ---: | ---: |
| Global codebook: minimum arbitrary states, min / median / max | **128 / 145 / 174** | **63 / 77 / 100** | **110 / 138 / 162** |
| Page-specific codebooks: minimum arbitrary states, min / median / max | **6 / 8 / 10** | **4 / 5 / 8** | **5 / 7 / 9** |
| Global codebook: smallest unbroken cycle \(T\), min / median / max | **1940 / 2341 / 2600** | **1310 / 1738 / 2054** | **1755 / 2124 / 2434** |
| Page-specific codebooks: smallest page-reset cycle \(T\), min / median / max | **45 / 57 / 62** | **32 / 49 / 57** | **44 / 54 / 62** |
| Shared book codebook plus page-reset phase: feasible samples for any \(T\) | **0 / 70** | **0 / 70** | **0 / 70** |

A further independently generated positive control encrypts all **12,956 source-native GP digits** using page-local length-preserving reversible Caesar alphabets, with publicly known page/local position determining the shift. Its **2,896 words** decrypt and re-encrypt exactly. It shows the algorithm does not spuriously reject genuinely changing-state sample ciphers.

**Interpretation:** If ordinary English GP words genuinely align with the source-printed unknown word boundaries, a book-global short-period whole-word cipher is a poor candidate. Distinct page keys would permit much shorter word clocks and sharply fewer separate codebooks. These architecture differences are exact *conditional on each sampled plaintext*, while the numerical ranges themselves reflect the three particular source models and their with-replacement sampling. Alternative plaintext lexicons, poetry, intentionally unique words or different boundaries can radically change them. No original clue presently selects any of these codebooks or clocks.

## 5. State labels are not a recoverable historical key

The \(\lceil\log_2 S\rceil\) bits to **index** distinguishable states do **not** lower-bound the entropy of a cryptographic key. A position-driven state clock needs zero secret bits for its public state index. A tiny seed can generate unbounded output and many effective states through a pseudorandom generator, if an authentic source supplies its algorithm, seed and initialization. In contrast an arbitrary fitted whole-word dictionary has to supply the mappings themselves, potentially thousands of independent entries. Our three fitted-positive-control dictionaries contain about **2,850 distinct word-pair entries** each and deliberately include the original ciphertext.

The original pp49–51 table prints **256 two-character cells**. Its interpretation as 256 independent bytes depends on a *published but unauthenticated* base60 alphabet. Even if accepted as a 256-byte stream (2,048 bits), it cannot serve as an uncompressed independent one-time pad for all original GP rune positions. An ideal independent rune-by-rune GP29 one-time pad for the 12,956 runes has

\[
12{,}956\log_2(29)=62{,}940.00177\ \text{bits}
=7{,}867.50022\ \text{bytes},
\]

roughly **30.73** times 256 bytes, as an entropy benchmark. This is **not a lower bound for seeded PRNG cryptography, compression, a cipher using plaintext constraints, or another source-guided algorithm**.

The SFT explicitly constructs a different mathematical inverse: concatenate any one length-matched sampled GP plaintext, choose the one-time pad \(K_i=C_i-P_i\bmod29\), and re-encrypt the full original **12,956/12,956 runes**. The pad is fitted to known ciphertext, not sourced independently. The same construction works without transmitting or preserving **any printed plaintext word boundary**. This counterexample proves that LP2's extraordinary printed word uniqueness alone cannot force a secret state/key budget for arbitrary reversible encryption.

## 6. Decision for further research

**Completed bounded decision:** A precise, tight arbitrary-state condition and an exact periodic-clock exclusion now separate three architectures under document-matched native source models. Page-specific effective keys can reduce state requirements dramatically; a shared book-wide table with a page-reset clock fails the sampled native registers. Any claim that the 256-cell table is too small for LP2 must specify an independent uncompressed-pad model; it does not follow from word uniqueness.

A plaintext-producing follow-up requires an **independently authentic clue fixing** a word clock/reset policy, complete key generation, and a recoverable actual key. Without such a clue, increasing the number of free state tables only fits more invented plaintexts. If an independent source later shows that unknown-page word boundaries are not true plaintext boundaries, **retire these word-state bounds entirely for that route** and prioritize segmentation-independent clues instead. No plaintext/key/continuation is advanced to [authoritative established results](../results/README.md).
