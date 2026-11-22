# First-order previous-cipher state: all-secret GP29 capacity obstruction

**Established original-input finite-family decision, 13 November 2026, Agent9.** The [source-exact CommonJS test](../sims/lp2_prevcipher_state_allsecret_capacity_sft.cjs) passed independent original-input [Windows / Node22 Actions run 43521284606](https://github.com/FlareZ123/liber-primus/actions/runs/43521284606). No unknown LP2 plaintext, creator key or original decoding instruction was recovered. This is a distinct one-step state architecture, independent of the prior cumulative checksum and first-*word*-rune stationary affine-feedback models.

## Why this operation was tested

The manuscript's 12,956 unknown GP29 runes have unusually few identical neighbours. An understandable, lossless nonrepeat architecture would use the immediately **previous printed ciphertext rune** to select a substitution alphabet for the next rune. The source exposes nine red-illustration visual chapters and original printed word boundaries. The complete permissive model for each word interior is

~~~text
C[w,j] = sigma[chapter(j), C[w,j-1]](P[w,j]), j >= 1.
~~~

Every one of the 9×29 visible chapter/previous-cipher-rune states receives its own **arbitrary, entirely unknown 29-symbol bijection**, independently of the others. Every printed word's first ciphertext rune is granted as an *unencoded, free seed*. This extra freedom deliberately favours the candidate mechanism. Cicada did not publish an instruction selecting this particular decoder; the result constrains a mathematically well-defined candidate family rather than demonstrating author intent.

## Exact all-secret occupancy result

For each observable state (chapter q, preceding ciphertext glyph s), form its original output count row N[q,s,c]. Whatever alphabet permutation is chosen, the maximum number of plaintext E tokens in that row is the largest one of its 29 ciphertext output counts. The maximum plaintext E+O is the sum of its two largest counts. Optimizing every secret row independently gives exact, key-agnostic upper bounds.

| Independent secret alphabet scope | Max possible E | Max possible E+O | State rows with 29 distinct ciphertext outputs |
| --- | ---: | ---: | ---: |
| 29 preceding-cipher-rune states globally | **578** | **1,086** | **26** |
| 261 preceding-cipher-rune × nine chapter states | **1,068** | **1,938** | **1** |

The manuscript supplies exactly **10,060 original within-word successor pairs** in **2,896 complete printed words** and 12,956 runes. The nine chapter sizes, fixed from original red artwork, are [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308] runes. The method ignores all 2,896 printed word initials and preserves any original unmarked page-word continuations.

**Language-independent positive witness of alphabet size 29.** The original eighth visual chapter (zero-based index 7) has a state in which the preceding printed cipher glyph is GP index **18 (E)** and its next printed glyph covers **every GP index 0–28**. The SFT independently indexes and asserts the first original zero-based rune offsets of all 29 next symbols:

~~~text
[9803,11785,12093,10617,9726,9762,11742,9730,10032,9995,10631,10337,10556,10060,9778,10020,9746,9681,11103,11425,11822,10952,10784,10827,10925,9710,10091,10321,12446]
~~~

In any **deterministic, one-plaintext-symbol-to-one-cipher-rune encoder** using only that previous-visible-cipher-rune and chapter as state, each output value at the fixed state requires a different available plaintext symbol. Thus the authentic data require **at least 29** underlying symbols in one state. A direct 26-letter Latin alphabet is impossible under this entire architecture, even if the secret statewise lookup table is nonbijective. Native GP29 English, which uses all 29 source orthography tokens, remains possible in alphabet size, subject to the separate occupancy bound.

## GP-native English and full positive inverse

The source-calibrated native GP orthography (including the solved LP1 single-rune ING and IO) maps **149,072** word tokens from the three pinned Gibran, Emerson and Shakespeare control texts. Using **exactly the 10,060 original interior positions** conditioned on printed word lengths, the reference predicts **1,487.4447 plaintext E** and **2,289.2256 E+O**. The original's absolute maxima under every set of 261 secret chapter/state alphabets are **1,068 E** and **1,938 E+O**. That deficit rules out this mechanism for the specified native-English register. The reference expectation is a model-dependent likelihood benchmark, not a universal lower bound for every possible English composition.

A positive control encrypts matching source-native English words with one independent **nonlinear bijection per chapter/state**:

~~~text
sigma[chapter, previous](plain) =
    (plain^5 + 7*previous + 3*chapter) mod 29.
~~~

The first original ciphertext rune of each word acts as a freely supplied seed, as it does for the candidate. All **10,060/10,060** native GP plaintext interior symbols decode exactly through the inverse tables. The positive plant has **1,499 actual E** and **2,388 actual E+O**, both below its generated ciphertext's independent capacities **1,742 E** and **3,032 E+O**. This ensures the test can accept genuine native-English signal under a real secret state-dependent encoder instead of merely rejecting uniform-looking sequences.

## Boundary-aware source resets: a sharper decision

The original rune-free numeric **p50** is a strong candidate for an additional source-visible register reset. If the cipher is granted independently secret alphabet rows after p50 while preserving all nine visual chapters, the original capacity becomes **1,109 E / 2,015 E+O**. The original chapter7 complete 29-output witness splits, yet **six state rows still produce 28 distinct glyphs** in the resulting ten segments. Therefore a p50-only reset **does not** rescue a direct 26-Latin-letter deterministic codebook. Even the weaker max-distinct constraint continues to require at least **28 plaintext symbols** in one fixed state. The English E/EO deficit also persists.

### Smallest possible additional chapter-local rekeying under physical page boundaries

The chapter-wise maximum numbers of distinct successor ciphertext values under a single predecessor-state row are precisely **[19,24,27,28,23,25,25,29,11]** for the nine original visual chapters. A deterministic 26-symbol underlying register requires **at most 26** different outputs in *every* state row. Chapters 2, 3 and 7 (zero-based) therefore each need at least one additional reset before this necessary condition could hold. An exhaustive dynamic program over **every contiguous physical-page partition inside each visual chapter** establishes that **exactly three extra page-start resets** suffice to eliminate this *cardinality* obstruction. One mathematically minimal set is at physical pages **[10,16,45]**, independently starting new state codebooks. This is a capacity upper-bound witness and **does not provide** three authentic keys, a credible authored reset instruction, English lexical consistency, or even a sufficient condition for any particular plaintext.

The same DP, granting every extra segment **29 independent arbitrary secret GP29 alphabets**, maximizes E and E+O capacities separately for each permitted number of extra page-start resets. The original 55 rune-bearing pages and nine chapter boundaries are held fixed.

| Extra physical-page resets beyond the nine original visual chapters | Best-case maximum E | Best-case maximum E+O |
| ---: | ---: | ---: |
| 0 | 1,068 | 1,938 |
| 4 | 1,259 | 2,254 |
| 5 | 1,300 | 2,319 |
| 9 | 1,450 | 2,568 |
| **10** | **1,485** | **2,628** |
| **11** | **1,519** | **2,687** |

The source-native reference's expected **1,487.4447 E** tokens require at least **11 additional page-level rekeys** under this model, *even when every possible page-boundary partition and every secret alphabet permutation is optimised*. Only **five** such rekeys are needed to reach the separate expected **2,289.2256 E+O** threshold. One E-maximizing 11-reset partition starts new alphabets at original physical pages **[1,11,18,20,25,29,35,42,44,46,51]**. It is an algorithmic capacity construction, **not** an authored key schedule or a proposed decipherment.

These reset thresholds are conditional on the declared word-length-and-position-calibrated **native-English reference demand**. A very E-sparse authentic text, a different language, hidden state or a different transport can evade the English bound. The independently exact Latin26 cardinality condition has its own weaker three-reset threshold. The distinction determines the useful next research question: a first-order visible-state explanation of ordinary English requires many independently signaled changes of secret codebooks, beyond the obvious p50 interruption or the nine artwork chapters.

## Consequence for the solve path

A **fixed first-order previous-visible-cipher-rune substitution**, even with 261 independent arbitrary secret alphabet mappings and independently restored word initials, cannot explain the original unknown corpus as ordinary source-native GP-English under this specified length/position model. It is *strictly* impossible as a 26-letter deterministic state-only encoder. This narrows the range of simple no-repeat-generating explanations without searching keys.

Possible alternatives include additional hidden state, per-word independent rekeying, page-local rekeying, plaintext-dependent states, extra symbols or escapes, variable-length transport, compression, non-English writing or a source-provided secret stream. Source-authored selection of such a mechanism or actual recovered plaintext remains necessary.

**Reproduce:** [source-exact CJS SFT](../sims/lp2_prevcipher_state_allsecret_capacity_sft.cjs), [passed manual Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/43521284606), [original corpus](../resources/liber-primus/lp2-corpus.json), [transcription with original boundaries](../resources/lp2-transcription.txt). Distinct earlier architecture exclusions: [running GP checksum state](lp2-running-checksum-anyalphabet-capacity.md) and [first-rune per-word affine feedback](lp2-wordseed-allsecret-affine-feedback-gate.md).
