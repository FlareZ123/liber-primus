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

The runeless original p50 is a plausible additional source-visible register reset. If the cipher is granted an **independent set of 29 secret alphabet rows after p50** while preserving the nine visual-chapter resets, the original occupancy allowances become **1,109 E / 2,015 E+O**. No fixed state in this *ten-segment* model then emits all 29 output runes, so the **Latin26 alphabet-size obstruction is conditional on persisting the same codebooks across p50**. This extra p50 reset still cannot supply the source-native reference's 1,487.44 E or 2,289.23 E+O expectations.

To learn what added source-visible complexity could rescue the English register, the expanded exact SFT partitions **all 55 rune-bearing original pages** into consecutive segments, preserving all nine original visual-chapter reset boundaries, and permits an arbitrary new set of 29 secret predecessor-state codebooks at **any additional physical-page start**. A dynamic program enumerates *all contiguous within-chapter page partitions* and maximizes the theoretical E and E+O capacities separately for each number of extra resets. This grants the model every favorable page boundary and all 29! possible glyph permutations at each row.

| Extra page-start resets beyond the nine visual chapters | Maximum possible E | Maximum possible E+O |
| ---: | ---: | ---: |
| 0 | 1,068 | 1,938 |
| 4 | 1,259 | 2,254 |
| 5 | 1,300 | 2,319 |
| 9 | 1,450 | 2,568 |
| **10** | **1,485** | 2,628 |
| **11** | **1,519** | 2,687 |

Consequently, the *reference-expected* E occupancy of **1,487.4447** requires at least **11 additional page-boundary rekeys** after the nine visual chapters, even under the most advantageous hidden alphabet choices. The E+O expectation **2,289.2256** separately requires at least **5** extra rekeys. The exact E-maximizing 11-reset example starts new codebooks at physical page numbers **[1,11,18,20,25,29,35,42,44,46,51]**; this set is an *algorithmic upper-bound witness*, not a source-instructed key schedule or proposed solve route. The corresponding ten-reset optimum is **1,485**, two or three E runes short of the rounded reference expectation. These statements concern the specified native-English statistical benchmark. An atypically E-sparse authentic text could demand fewer resets, and a richer hidden-state/transport model lies outside the theorem.

The broader interpretation is causally useful: adding the obvious p50 interruption, or a few chapter-local resets, is insufficient for source-native ordinary English. A first-order observable-state explanation would require frequent independent alphabet changes or a different underlying plaintext distribution, hence **independent source evidence for a substantially more complex schedule** before another original-cipher key search.

## Consequence for the solve path

A **fixed first-order previous-visible-cipher-rune substitution**, even with 261 independent arbitrary secret alphabet mappings and independently restored word initials, cannot explain the original unknown corpus as ordinary source-native GP-English under this specified length/position model. It is *strictly* impossible as a 26-letter deterministic state-only encoder. This narrows the range of simple no-repeat-generating explanations without searching keys.

Possible alternatives include additional hidden state, per-word independent rekeying, page-local rekeying, plaintext-dependent states, extra symbols or escapes, variable-length transport, compression, non-English writing or a source-provided secret stream. Source-authored selection of such a mechanism or actual recovered plaintext remains necessary.

**Reproduce:** [source-exact CJS SFT](../sims/lp2_prevcipher_state_allsecret_capacity_sft.cjs), [passed manual Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/43521284606), [original corpus](../resources/liber-primus/lp2-corpus.json), [transcription with original boundaries](../resources/lp2-transcription.txt). Distinct earlier architecture exclusions: [running GP checksum state](lp2-running-checksum-anyalphabet-capacity.md) and [first-rune per-word affine feedback](lp2-wordseed-allsecret-affine-feedback-gate.md).
