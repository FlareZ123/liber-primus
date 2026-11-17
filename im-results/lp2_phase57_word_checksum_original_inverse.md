# Phase57 six-back overwrite: a one-rune checksum gives a conditional exact inverse, but source word edges do not supply it

**Agent 1, 17 November 2026, Director Issue [#1296](https://github.com/FlareZ123/liber-primus/issues/1296). Evidence status: exact original-cipher ambiguity partition, a deliberately constructed lossless repair-side-channel inverse, and finite original source rejection of an unmasked word-edge checksum. No unknown LP2 plaintext, author-issued checksum/key, recovered cipher or destination.**

## Motivated operation and weakest assumption

Independent [Phase57 research](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md) models the original low adjacent-doublet count and an elevated within-word six-back relation with an otherwise many-to-one overwrite. Its particular observed relation is

`T(C[j-6]) = (24 - 2*C[j-6]) mod 29`,

where `C` denotes the *published* GP29 index. The externally simulated R4 candidate emits `T(C[j-6])` if an unobserved pre-repair rune collides with the preceding emitted rune. It also inserts approximately one extra rune in 45% of words. The original page, source and future ciphertext do not carry an explicit repair flag. Agent 8's [prior exact inverse analysis](lp2-sixback-repair-lossless-original-inversion-gate.md) proved 79 original ambiguity sites and therefore at least `2^79` source tapes for the unaugmented overwrite. Agent 15's [same-pad replay gate](lp2_phase57_samepad_replay_original_gate.md) excluded another proposed attempt to preserve the discarded input by re-emitting under the same key.

A potentially human-tractable repair of this flaw would be **a GP29 word checksum**. Cicada demonstrably used GP prime sums on solved source words; the solved final PARABLE refers to circumferences, while the original printed words give natural checksum units. Those clues do **not** explicitly establish a check rune, choose modular index sum over GP-prime sum, choose a word edge, or specify where a check key is stored. This report tests a small and precise possibility rather than silently assuming it.

## An exact positive inverse on the original ambiguity structure

Use the full canonical 55 unknown rune-bearing pages p0–p55 (physical p50 runeless), **12,956** original ciphertext runes in **2,896** authentic words, joining original printed line and physical-page carries. At every within-word position `j≥6`, where `C[j]=T(C[j-6])` and `T(C[j-6]) != C[j-1]`, there are precisely two locally distinct nominal source values compatible with the published glyph:

* **no repair:** `X[j]=C[j]`;
* **repair:** `X[j]=C[j-1]`, with `T(C[j-6])` emitted.

The original positions have **1,290** eligible six-back opportunities, **79** nondegenerate ambiguous glyphs, distributed among exactly **74** printed words: **69 words with one site**, **five with two**, and **2,822 with none**. No printed word has three or more such ambiguities. The 32 authentic page-carry words are retained.

Suppose one extra, independently recoverable GP29 symbol per affected word stores the additive checksum

`Q = (sum of X[j] over the entire pre-repair word) mod 29`.

For each affected original word, compute `Q` for **every** legal assignment of the two possible source values at its T6 ambiguity sites. **All candidates have distinct checksum symbols in every one of the 74 original words.** All 69 single-site words distinguish both possibilities, and all five two-site words distinguish all four. Therefore *one* 29-way parity symbol is enough, on the original input, to identify every ambiguity flag, for **all `2^79` joint repair patterns**; a word-by-word inverse never needs more than four candidates.

The [single-file CommonJS reproducer](../sims/lp2_phase57_word_checksum_inverse_sft.cjs) independently constructs a mixture of repaired and unrepaired branches, emits **exactly the unchanged 12,956-rune published ciphertext** under both options at every ambiguous site, supplies a *synthetic* modulo29 checksum only to the inverse, and recovers all selected pre-overwrite symbols exactly. This is an **explicit demonstration of how R4-like overwrites could be made lossless by an additional check channel**, not evidence that the source actually contains that channel. Even with these checks, the secret base-cipher key and which plaintext register to decode remain unknown.

The channel requires a worst-case 79 bits of branch information across the book; the 74 appended GP29 check values would carry a more redundant 74-rune representation. The 45% per-word extra-rune rate in Phase57 is large enough in the abstract to accommodate these checks, but its simulated null positions and values are **independent random choices**, not such informative checks. A random null is not an inverse side channel.

## Direct edge-check attempt on the unchanged manuscript

The simplest candidate is that a checksum is itself a printed first or last word rune, appended *after* the loss-prone R4 body. This can be tested from published glyphs without a secret base-cipher key:

1. For each of the 74 words with a full-word ambiguity, provisionally remove either its first or its last original printed glyph as a putative literal check rune.
2. Recompute every valid six-back ambiguity on the shortened word body. Retain only words whose body still has at least one ambiguity needing repair.
3. Enumerate **all** body repair branches, compute `Q` for every resulting nominal word, and accept the original removed rune if it equals any one of the candidates. This grants the hypothesis an optimally chosen hidden repair-branch mask separately per word.

| Hypothetical visible checksum | Original affected words still requiring a check after body shortening | Words matching any allowed repair-branch checksum | Incompatible words |
| --- | ---: | ---: | ---: |
| First printed glyph | **43** | **4** | **39** |
| Last printed glyph | **46** | **4** | **42** |

The lower counts after shortening are expected: the six-back relation is re-evaluated on the shorter body, so some formerly terminal six-back matches are no longer counted as repair-site evidence. In both cases, **most source words needing this channel are irreconcilable even after granting all hidden repair choices**. The literal unmasked per-word first- or last-rune checksum model cannot explain the original 79-site repair ambiguity as a universally available inverse channel.

As an independent coarse diagnostic on the complete source-printed words, the literal end rule `2*C[last] = sum C[all] mod29` holds for only **72/2,896** words of length at least two, versus **80.496** expected under uniform rotations of each original word's existing multiset; no source-wide edge sum is apparent. This coarse test alone would not reject a disguised or keyed check rune, but it corroborates the exact ambiguity-bearing edge gate.

## Stronger all-position original check: most words still cannot be decoded

The Phase57 best-fitting R4 puts its proposed extra null at an unrestricted word-local slot, so restricting checks to printed edges alone could miss it. A second original-only decision therefore grants **one unencrypted checksum glyph at any original printed position**, while preserving the six-back history of the complete transmitted word. The hypothesized check glyph is omitted from the nominal-body sum and cannot itself be overwritten. Every other original T6 ambiguity site may be taken as repaired or unrepaired independently. This is an extremely permissive existential test, since each word may choose its own invisible checksum location and flags to maximize a match.

Three natural literal value grammars follow from the published GP29 chart and the original Cicada GP-prime sum precedent:

| Literal one-glyph check rule | Source-affected words with at least one valid checksum slot/flag pair | Words incompatible with **every** slot and repair-flag assignment |
| --- | ---: | ---: |
| Printed check **GP index** equals body **sum of GP indices mod 29** | **43 / 74** | **31 / 74** |
| Printed check **GP index** equals body **sum of GP prime weights mod 29** | **35 / 74** | **39 / 74** |
| Printed check **GP prime weight mod 29** equals body **sum of GP prime weights mod 29** | **34 / 74** | **40 / 74** |

The permissive index-sum grammar has **54** distinct passing slot/flag pairs across its 43 passing words. **34** passing words have one compatible pair, **nine** have multiple. The two prime-weight grammars have **55** and **47** passing slot/flag pairs respectively. All three source-original tests are frozen in the same [executable SFT](../sims/lp2_phase57_word_checksum_inverse_sft.cjs), which asserts these exact totals.

**Decision:** even granting free placement, these three literal checksum grammars cannot supply universal R4 losslessness on the unchanged original 74 ambiguous words. The construction in the previous section requires a **separately supplied checksum value** and still stands as a valid positive inverse. A checksum encrypted under a hidden stream, encoded across punctuation/boundaries, or computed by another source-selected grammar would be different and remains unresolved. The experiments do not infer that the observed T6 events were actually repair markers.

## What changes for a real decipherment attempt

The prior noninjective overwrite objection is **not** automatically fatal to a *different* R4-like system that provides one word-local repair checksum; the original ambiguous-word distribution actually makes one GP29 check sufficient. This is the useful positive construction. The manuscript's **literal unmasked word endpoints**, however, cannot be that checksum under the frozen rule, and a separate keyed or moved checksum must be specified independently.

The next action is therefore **find an artifact-selected side-channel operand and its exact decoder**, then decrypt a complete untouched word or page and replay the published original under one consistent key. Absent such an input, searching ever more secret pad families under R4 is ungrounded, because the inverse still lacks the repair bits. This narrow result does not reject source-chosen side information embedded in inserted interior glyphs, punctuation, altered word lengths, or a fully bijective no-overwrite cipher; it supplies no justification for an arbitrary checksum/key search.

**Reproduction:** [`sims/lp2_phase57_word_checksum_inverse_sft.cjs`](../sims/lp2_phase57_word_checksum_inverse_sft.cjs). Canonical corpus `resources/liber-primus/lp2-corpus.json`, printed delimiters `lp2-transcription.txt`; assertions cover 2,896 words, 12,956 original rune identities, 32 page-carry words, 1,290 six-back slots, 79 ambiguity sites across 74 words, all 74 unique parity inverses, both original edge gates and the coarse word-end count. The test makes zero network requests and writes no files.
