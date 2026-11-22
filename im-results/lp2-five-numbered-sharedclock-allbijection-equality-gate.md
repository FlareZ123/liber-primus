# The five numbered cuneiform passages: key-independent shared-clock equality obstruction

**Agent19, 22 November 2026. Classification: original-cipher, conditional architectural exclusion.** There is still no authenticated unknown-page plaintext, original decipherment key or 2014 author instruction selecting a five-message code. This result excludes a large family of **completely secret, synchronized, position-varying bijective alphabets**, strictly beyond fixed-key, constant-shift, and shared additive-pad attempts. It changes the next research choice: an authentic five-instruction decoder would require independently selected per-item clocks, per-item alphabets, a nonbijective/variable-length codec, or plaintext outside the ordinary solved-Cicada English register.

## Why this architecture is worth distinguishing

Physical original JPEGs `53.jpg`–`55.jpg` (LP2 p36–p38) present red, separate labels **1, 2, 3, 4, 5**. A human might read those as five independently composed messages using **the same evolving cipher alphabet**, reset at each printed label. A different secret 29-rune permutation at every position is an extremely generous model: no key, initialization state, or generator needs to be guessed. Its weakest premise is that all five original plaintexts are ordinary GP29-encoded English sharing the same rune clock. The independent rival is that these paragraphs are separately encrypted sayings or program commands, or possess plaintext-dependent clocks.

Source-register slices, zero-based and half-open (the original printed fourth item carries across page boundaries):

| Red item | Unmodified original GP29 rune locations | Runes | Complete printed words |
| --- | --- | ---: | ---: |
| 1 | p36 [99,238) | 139 | 30 |
| 2 | p37 [0,91) | 91 | 20 |
| 3 | p37 [91,189) | 98 | 25 |
| 4 | p37 [189,228) + p38 [0,57) | 96 | 19 |
| 5 | p38 [57,186) | 129 | 28 |

The **first 91 GP29 runes** of all five intact items provide 910 pairwise same-column comparisons (10 distinct message pairs × 91 rune positions). The exact pairwise equality counts in lexicographic pair order `(1,2),(1,3),(1,4),(1,5),(2,3),(2,4),(2,5),(3,4),(3,5),(4,5)` are **[2,3,1,4,3,5,1,3,1,3]**. Their sum is **26/910 = 2.8571%**. The source has no independently selected clock or key for a common five-message cipher; this is an observable equality constraint, not a proposed decryption.

## Exact mathematical invariant

For five plaintext rune arrays `P_j(i)` and ciphertext `C_j(i)`, suppose a fully arbitrary **secret bijection** `π_i` of all 29 GP runes is used at shared position `i`, independently for each `i=0,…,90` but **reused across the five messages**:

`C_j(i) = π_i(P_j(i))`.

Then, for every pair `j,k`, **`C_j(i)=C_k(i)` if and only if `P_j(i)=P_k(i)`**, because a permutation is injective. Thus the entire ten-pair equality table, not merely its sum, is invariant for **every** member of the enormous unknown-key family `(29!)^91`. Neither a language-model search nor an algebraic inversion can change the source's 26 equality events. A positive control constructs independently secret Fisher–Yates permutations at all 91 positions, applies each to five genuine GP-native plaintext lanes and asserts preservation of the exact count.

## Frozen source-native comparison

Controls sample **exactly the same full complete-word length profiles** as the five printed original messages, GP29-encode donor prose using the repository's native digraph conventions, concatenate each sample's independently selected words, and crop each to its first 91 GP29 runes. The solved-native control uses original-transcribed solved Cicada GP29 text. The other three controls use independent English donors; all are sampled with fixed deterministic `xorshift32` seeds without using the original count to tune a model.

| Independent source | Donor register | Number of five-lane books | Mean equality count /910 | Minimum | Counts ≤26 |
| --- | --- | ---: | ---: | ---: | ---: |
| Genuine solved Cicada GP29 | 9 solved passages, 2,979 runes | 30,000 | **55.47473** | 27 | **0** |
| Gibran, *The Prophet* | 15,733 words | 16,000 | **54.48638** | 29 | **0** |
| Emerson, *Essays* | 77,932 words | 16,000 | **55.72675** | 30 | **0** |
| Shakespeare selection | 55,407 words | 16,000 | **55.17406** | 28 | **0** |

The realized finite-sample upper bound `(hits+1)/(draws+1)` for each source is ≤3.3333×10⁻⁵ (solved Cicada) and ≤6.2497×10⁻⁵ (each independent author). These are empirical matched-register results, **not** universal p-values for unknown language, other period works, or a manuscript design chosen after seeing statistics. The conclusion also holds exactly for the **full secret alphabet** within the declared synchronous architecture; it is independent of any key recovery attempt.

## Consequence for the original five instructions

An identical rune-position clock and common per-position secret alphabet used to write five ordinary independent messages is sharply disfavored by original ciphertext equality events. Retire broad **shared synchronous alphabet/keystream fitting** as the explanation for this five-unit enclosure. A decoder employing **different word clocks, plaintext-F transparency, individually keyed changes, resegmentation, or variable-width transformations** is outside this invariant; this report does not exclude those. The red numbers still identify **order and exact paragraph boundaries**, and do not themselves specify one of the remaining mechanisms.

The shortest causal next step is to find an original 2014-visible instruction that chooses an **opcode and a recoverable clock for the first numbered unit**, decode its complete 139 original runes, and predict the independent 91-rune second item without modifying the chosen law. The separate first-party p49–51 256-cell lookups can be used as a **frozen prospective cross-chapter holdout** after any genuine decryption, not to tune this source's plaintext. If no such source-selected first instruction exists, the five-item cryptographic interpretation remains underdetermined.

**Reproducer:** [source-exact standalone CommonJS/JSDoc SFT](../sims/lp2_cuneiform_fiveunit_sharedclock_allbijection_keyless_sft.cjs). Inputs: canonical GitHub-original LP2 transcription and numeric corpus, solved-GP29 reference, pinned three external English donor texts. Runs read-only on Windows 11 Node22; samples, random seeds, exact original slices, pairwise counts, and a secret-key planted positive are asserted by code. GitHub Actions [manual Node22 run 45048867225](https://github.com/FlareZ123/liber-primus/actions/runs/45048867225).