# An exact reversible 29-symbol anti-doublet cipher and its original LP2 marker-signature gate

**Agent18, 15 November 2026. Classification: demonstrated lossless cipher construction plus source-conditional negative original-cipher test. No unknown LP2 plaintext, author-selected key or deciphering mechanism recovered.** [Windows Node22 original test 43663742055](https://github.com/FlareZ123/liber-primus/actions/runs/43663742055) · [One-file SFT](../sims/lp2_raremarker_feedback29_original_sft.cjs).

## One genuinely reversible 29-symbol mechanism

For all 29 GP indices, choose **one** globally reserved plaintext marker `r` and enumerate the other 28 in their original GP order by ranks 0–27. With the last published ciphertext symbol `C_(i−1)` and any externally recoverable 28-valued phase `k_i`, define

```text
move_i = 0                                  if P_i = r
         1 + ((rank_r(P_i) + k_i) mod 28)    otherwise
C_i = (C_(i−1) + move_i) mod 29

move_i = (C_i − C_(i−1)) mod 29
P_i = r                                    if move_i = 0
      nonmarker[(move_i−1−k_i) mod 28]      otherwise
```

Every phase induces a 29-to-29 bijection. There is no missing 29th plaintext symbol, secret escape-channel, dropped input, collision repair, or output rejection. A printed physical-page start can use an independently known previous state; analysis of the original **ignores** those 55 unobserved preceding symbols. This is a minimal *feasible construction* and **not** evidence that Cicada used this algorithm. The experiment's artificial phase `(11*i+7) mod28` is positive-control scaffolding, not source-suggested key material.

The original-source mask invariant is **independent of every 28-phase value**:

```text
C_i = C_(i−1)  iff  P_i = r.
```

Therefore every genuine original adjacent equal-rune site forces plaintext marker `r` at the *second* position, while every genuine unequal site forbids `r` there, regardless of all secret phases and the other 28 symbol orderings. This is stronger than matching an expected global repeat count.

## Exact original-source mask and native-register gate

On the unchanged 55 unknown rune-bearing physical LP2 pages, the original 12,956 GP29 symbols form 2,896 printed words, with 32 cross-page word carries. Keeping all word positions and treating the first rune of each physical page as unconstrained because its predecessor is outside the page, the source-derived marker masks contain:

| Exact original LP2 event | Count |
| --- | ---: |
| Adjacent equal-rune transitions | **86** |
| Of these, within printed words | **63** |
| Of these, at first rune of next printed word | **23** |
| Printed words containing at least one source event | **85** |
| Printed words containing two source events | **1** |

The single two-event word is printed word index **1476** (zero-based), with length **12** and equal-pair second-position offsets **5 and 11** (zero-based). This two-event mask is particularly discriminating.

The test encodes 149,048 English word tokens from the repository-pinned Gibran, Shakespeare and Emerson source files using the **source-calibrated GP29 alphabet** (including native ING/IO handling). For each candidate marker `r`, it asks whether every exact original word length and required/forbidden marker-position mask is present among reference words of **that same GP length**. There is **no candidate plaintext selection or free phase fitting** in this test.

| Candidate reserved plaintext rune | Original words with compatible original-length reference masks | Original words lacking such reference masks | Expected marker count with original word-length matching |
| --- | ---: | ---: | ---: |
| N | **2,896 / 2,896** | **0** | approximately **880** |
| S | **2,896 / 2,896** | **0** | approximately **944** |
| E | **2,896 / 2,896** | **0** | approximately **1,556** |
| EA, a plausible rare English GP rune | 2,881 / 2,896 | 15 | approximately **96** |
| ING/NG, another plausible rare rune | 2,879 / 2,896 | 17 | approximately **87** |
| Other 24 GP rune choices | At most 2,895 / 2,896 | At least 1 | Varies by rune |

The reference expectations are **descriptive, not posterior probabilities**. They are computed by independently drawing GP-native words from the specified reference length buckets for the exact original word lengths and counting marker positions for which the original predecessor is on the same page. The 86 observed equalities cannot be explained as an ordinary word-length-matched rendering of this three-source English register with any one fixed marker: E/N/S are common in those reference words, while plausible low-frequency markers fail actual required word-position patterns. This does **not** prove impossibility for an unknown manuscript deliberately written with an unusual vocabulary.

### Independent Latin-native sensitivity

The source-pinned [Latin Vulgate GP29 whole-word reference](../resources/control/latin-vulgate-gp-wholewords.txt) supplies **39,785 GP-native Latin tokens**, with *original Latin whole-word boundaries*. The test avoids treating the English source's special ING/IO contractions as Latin instructions. Applying the **same frozen 2,896 original word-length and required/forbidden marker masks** gives:

| Candidate globally fixed plaintext marker | Original printed words with no same-length Latin word-mask match | Matched-length Latin reference expected occurrences |
| --- | ---: | ---: |
| O | **0** | approximately **700** |
| M | **0** | approximately **751** |
| S | **0** | approximately **1,037** |
| T | **0** | approximately **1,134** |
| AE | **20** | approximately **96** |
| EA | **36** | approximately **27** |
| NG | **56** | approximately **11** |
| Other markers | At least one original word unmatched | Varies |

This is a second linguistic register rather than retuning the English controls. In both pinned languages, the only fixed markers meeting **all** original word-position constraints are too frequent in ordinary original-length-matched source prose to explain the **86** ciphertext equalities. Realistically rare markers fail exact source word masks. The result strengthens the **source-conditional exclusion for ordinary English and Latin**, while an atypical prose vocabulary, changed segmentation or different cipher family remains possible. Full 29-marker Latin rows are emitted by the executable test, [successful Windows Node22 run 43666355498](https://github.com/FlareZ123/liber-primus/actions/runs/43666355498).

## Positive control, conclusions and next decision

The same code encrypts a complete **12,956-rune source-native plaintext plant** of the exact original word-length inventory, using marker EA and a known artificial phase; its inverse reconstructs **12,956/12,956** plaintext GP indices. It predicts and observes **108/108** non-page-initial repeated transitions, with no information loss. The exact original-input mask and every marker-row assertion passed on [Windows Node22 run 43663742055](https://github.com/FlareZ123/liber-primus/actions/runs/43663742055).

**Result:** the globally fixed single-marker, 28-phase, additive-ciphertext-feedback architecture is now a *complete, reproducible* candidate family with an original-input **source-conditional failure**. Neither a source-selected `k_i` nor native English/Latin plaintext emerges. Re-fitting phases cannot change the required marker masks, and thus cannot rescue this exact family. A future escape-based proposal must supply **an independently motivated change**: a marker varying with previous state or source-chosen phase, a different plaintext register, a changed word segmentation, or an additional lossless framing operation. The original 86 equalities must remain intact.

This gate is distinct from the existing stationary-previous-ciphertext arbitrary-alphabet exclusions because it retains unrestricted **per-position** nonzero-step phases while deriving a **keyless event-to-one-plaintext-symbol prediction**. It also does not assert that any arbitrary stateful anti-doublet mechanism is excluded.
