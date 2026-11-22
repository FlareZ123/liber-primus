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

The displayed `(hits+1)/(draws+1)` quantity in the SFT is an **add-one smoothed descriptive tail rate**, 3.3333×10⁻⁵ (solved Cicada) and 6.2497×10⁻⁵ (each independent author). It is **not an upper confidence bound**. For zero matches in independent draws, the **exact one-sided 95% binomial upper confidence limits** are `1 − 0.05^(1/N)`: **9.9853×10⁻⁵** for 30,000 and **1.8722×10⁻⁴** for 16,000. These confidence calculations apply only to the respective specified independently sampled donor models; they are **not** universal p-values for unknown language, other period works, or a manuscript design chosen after seeing statistics. The conclusion also holds exactly for the **full secret alphabet** within the declared synchronous architecture; it is independent of any key recovery attempt.

## An independent clock selected by printed word boundaries

A more flexible source-visible alternative resets the shared alphabet **at each printed word**, rather than consuming one clock tick per continuous rune. Define a completely secret 29-symbol bijection `π_(w,k)` for **word ordinal w** (one through 19, the minimum item word count) and **within-word rune offset k**, shared across the five separately numbered paragraphs. The printed words have different lengths. Only compare two lanes where the same (w,k) actually exists; no invented padding or inferred word join is used. Every compared pair is invariant under this entire unrestricted family of secret alphabets.

The complete original five-unit word-aligned receiver contains **636 cross-message symbol comparisons**, of which only **15** are equal. The ten pairwise counts in the same passage order are **[0,4,2,1,2,3,1,1,1,0]**. Independently sampled GP-native control words matched to all 122 original complete-word lengths yield about 48–51 equality events, with **zero controls as low as 15** in an additional, pre-frozen 18,000 simulations per donor (source-native minimum 24, Gibran minimum 23, Emerson minimum 23, Shakespeare minimum 25). The consolidated reproducer uses the same 30,000 solved and 16,000 per-book draws as the rune-clock gate, with a second fully secret planted positive proving that arbitrary bijections reused by word ordinal and intra-word position preserve the complete equality table. The [updated Windows Node22 test](https://github.com/FlareZ123/liber-primus/actions/runs/45049220495) exercises both clocks.

This second negative is causally useful because **a cipher that restarts at original word boundaries escapes the continuous-stream test**, yet still fails the same independent equality principle. It does not assume equal word lengths across separate passages. If original words are deliberate ciphertext segmentation rather than preserved plaintext words, or if each numbered passage has a different secret alphabet or clock, the model can still be viable. Any further shared-key theory needs an independently supplied alignment, rather than adding fitted resets after seeing the original collision counts.

## The original Cicada plaintext-F bypass cannot repair the common word-reset clock

Cicada's genuinely solved LP2 p56 keyed page supplies a specific, historically demonstrated alternative to ordinary clocking: a **plaintext F (GP index 0)** emits literal ciphertext F and **does not advance the key**. This makes an encrypted ciphertext F ambiguous, because it may also come from a non-F plaintext rune. Any secret-permutation argument that silently treats every ciphertext F as key-consuming would be too strong. The original five numbered sections supply an unusually economical **exhaustive** decision instead.

Among the **first 19 original complete words of every numbered unit** there are **exactly six occurrences of ciphertext F**, distributed across all five units. The SFT considers **all 2⁶ = 64 assignments**, independently marking each F as an unconsumed bypass or an ordinary key-consuming rune. For each assignment the decoder retains only key-consuming ciphertext runes, resets at each printed word, and counts all ten message-pair equalities at the same **word ordinal and consumed-rune clock**. Under every assignment the same hidden 29-bijection at each (word, key-clock) must preserve these equalities. The **most favorable original assignment gives 16 equalities /633 available comparisons**; the unskipped original gave 15/636. The maximum is attained by bypassing only the F at second item's fifteenth word, first rune; all other mask choices achieve at most that value. Crucially, no secret alphabet or guessed plaintext is fitted.

For genuine solved-GP29 plaintext controls, the **true** plaintext F runes are omitted before matching consumed-symbol clocks. The donor word-length profiles are held identical to the original 122 printed words. They yield:

| GP-native plaintext donor | Complete five-lane control draws | Mean matches after genuine F skipping | Smallest observed | Controls ≤ original's generous maximum 16 |
| --- | ---: | ---: | ---: | ---: |
| Genuine solved Cicada GP29 | 30,000 | **50.42937** | 24 | **0** |
| Gibran, *The Prophet* | 16,000 | **49.41731** | 24 | **0** |
| Emerson, *Essays* | 16,000 | **47.87975** | 23 | **0** |
| Shakespeare selection | 16,000 | **49.76781** | 23 | **0** |

A fully secret positive generates native GP29 plaintext, gives each word ordinal and **key-consuming rune offset** an independent arbitrary 29-symbol secret permutation, emits every plaintext F unchanged, and does not advance the clock for F. Filtering by its actual known bypass mask preserves the entire planted cross-message equality table, so this is an **implemented positive of the historically motivated state rule**, not an idealized no-F test.

**Decision:** the exact p56-style plaintext-F no-advance operation is an **insufficient explanation** for the otherwise incompatible **common word-reset secret-alphabet** architecture of these original five paragraphs. Only that architecture and its exhaustive six visible F decision branches are excluded. A continuous shared rune clock with different message drift can produce more matched events and is **not** excluded by this word-specific result; independently keyed alphabets, alternate plaintext registers and encodings remain outside the gate. [Consolidated Windows Node22 PASS, source-exact run 45050192126](https://github.com/FlareZ123/liber-primus/actions/runs/45050192126).

## Consequence for the original five instructions

Both a synchronized rune clock and a separately synchronized original printed-word clock with completely arbitrary changing secret alphabets are sharply disfavored by the original ciphertext equality events. Retire these two broad **shared alphabet/keystream fitting** families as explanations for five ordinary independent GP-native English paragraphs. A decoder employing **separately keyed items, a continuous-runic clock with F-dependent drift, changing plaintext-word boundaries, or variable-width/nonbijective transformations** remains outside the combined source-clock exclusions. The specific historically demonstrated plaintext-F bypass was separately exhausted and rejected on the **shared printed-word-reset** architecture above. The red numbers still identify **order and exact paragraph boundaries**, and do not themselves specify one of the remaining mechanisms.

The shortest causal next step is to find an original 2014-visible instruction that chooses an **opcode and a recoverable clock for the first numbered unit**, decode its complete 139 original runes, and predict the independent 91-rune second item without modifying the chosen law. The separate first-party p49–51 256-cell lookups can be used as a **frozen prospective cross-chapter holdout** after any genuine decryption, not to tune this source's plaintext. If no such source-selected first instruction exists, the five-item cryptographic interpretation remains underdetermined.

**Reproducer:** [source-exact standalone CommonJS/JSDoc SFT](../sims/lp2_cuneiform_fiveunit_sharedclock_allbijection_keyless_sft.cjs). Inputs: canonical GitHub-original LP2 transcription and numeric corpus, solved-GP29 reference, pinned three external English donor texts. Runs read-only on Windows 11 Node22; random seeds, exact original slices, both ten-pair equality tables, independent sampled controls, and both **fully secret, separately planted positives** are asserted by code. GitHub Actions: [continuous-clock PASS45048867225](https://github.com/FlareZ123/liber-primus/actions/runs/45048867225); [two-clock consolidated PASS45049220495](https://github.com/FlareZ123/liber-primus/actions/runs/45049220495); [original F-bypass exhaustive-mask PASS45050192126](https://github.com/FlareZ123/liber-primus/actions/runs/45050192126).