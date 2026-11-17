# LP2 word-frame identifiability with original apostrophes and page carries

**Classification:** exact conditional ambiguity result and finite apostrophe-shape test; **no unknown-page plaintext, authored frame key, or decipherment**. Research decision for Director [#1379](https://github.com/FlareZ123/liber-primus/issues/1379). The original printing still supplies a real 2,896-word morphology, but its adjacency-length dependence differs from authentic solved English-GP text. This experiment determines how much of a hidden framing can be inferred from the *source-preserved format* alone.

## Source and fixed boundary rules

Use the unmodified [58-page original transcription](../resources/lp2-transcription.txt), physical LP2 unknown pages p0–55, skipping the rune-free p50 in the text parser. It contains **12,956 GP29 runes, 2,896 words and 32 words continuing over physical page boundaries**. Preserve the order and value of every ciphertext rune, all physical page/rune offsets, line wraps, every non-space textual stop, the six literal decimal digits and every full page-carry word at its original offsets. The original source also contains the four authenticated apostrophes at *rune immediately following tick* global indices **1110, 5138, 8515, 10089**, at p4 `MXI'W`, p21 `AEO'Y`, p35 `PE'T` and p41 `XLJ'C`. Freeze each entire contracted word in the same original start and end offsets, with apostrophe before its final rune. None of these words is asserted to have any particular unknown plaintext.

Construct maximal runs of fully page-contained words sharing the same physical page and fixed punctuation interval. A word that crosses a physical page is an immutable anchor. Inside each block, allow *only* reallocation of the **existing multiset of printed word lengths** to the same number of adjacent slots, keeping the total block rune count, its exact first/last offsets, and every original rune at its original global index. Distinct length orders imply distinct boundary placements; repeated equal lengths do not count multiple times. Then split the four blocks containing apostrophes at their frozen word positions and keep the other segments free to rearrange.

This is a deliberately restrictive subset of possible hidden-space systems: it allows neither new word counts nor new length values, no word permutation, no page carry changes, no rerouting of actual runes, no movement of punctuation stops, and no moving the apostrophe-bearing words. Hence counting its alternatives is a **lower bound on ambiguity** in a more permissive, otherwise unkeyed framing model. It is *not* a lower bound on the bit complexity of a simple source-authored algorithm that might independently select one outcome.

## Exact original-cipher combinatorial outcome

For a block or surviving segment of `n` printed words with length multiplicities `c_l`, the number of unique possible word-break layouts is exactly

```text
                  n!
  possibilities = ---------
                  ∏_l c_l!
```

Multiplying these integer counts over disjoint blocks avoids treating repeated word lengths as distinct choices.

| Source-constrained quantity | Exact or calculated outcome |
|---|---:|
| Rune-bearing unknown physical pages | 55 |
| Printed unknown GP29 runes / words | 12,956 / 2,896 |
| Immutable physical-page carry words | 32 |
| Maximal page-and-stop-contained blocks | 219 |
| Noncarried words inside those blocks | 2,864 |
| Log₂ distinct layouts before preserving four contraction words | **5608.059566420076 bits** |
| Log₂ distinct layouts after freezing all four complete contraction words | **5584.117962312674 bits** |
| Free permutations removed by four contraction anchors | **23.941604107402 log₂ units** |
| Other noncarried words in nontrivial permutation segments | **2,852** |
| Other noncarried words fixed by singleton/constant-length segments | **8** |

Thus even after fixing all source-visible stops, page carries and four contraction-word positions, there are **more than 2^5584 distinct layouts** retaining the same original rune stream and the same within-block word-length multisets. A concrete alternative changes two unequal lengths within one non-anchored block; its inverse restores the source's original boundaries, and the four apostrophe words, punctuation intervals and page carries remain fixed. There is no way to distinguish which layout is intended *from those constraints alone*.

The original printed lengths are not random samples; the bound above is a finite combinatorial statement about alternative layouts of the actual original multiset. Natural-language models or independently sourced cipher-state information may distinguish among layouts, so this is no claim that all 2^5584 alternatives remain linguistically plausible.

## Apostrophe survival under an exact conditional random-frame rival

To discriminate against a **naive independent postcipher frame** model, uniformly shuffle the length multiset within each original fixed page/stop block. Keep each tick at its actual rune offset while asking whether the resulting frame still has a whole 3- or 4-rune word ending exactly one rune after the tick. These are four different original blocks. The joint conditional probability factors across them. A subset-sum dynamic program counts all ways in which a word of the required length could occupy the tick-ending slot; there is no Monte Carlo sampling or fitted parameter.

| Original tick | Source word shape | Block length in words | Probability under conditioned independent lengths |
|---|---:|---:|---:|
| p4, global 1110 | 3+1 | 8 | **0.5** |
| p21, global 5138 | 2+1 | 50 | **0.04107210404199025** |
| p35, global 8515 | 2+1 | 44 | **0.29545454545454547** |
| p41, global 10089 | 3+1 | 15 | **0.02761682761682762** |

The product is **0.0001675642707209625**, about **one in 5,968** conditional random reallocations. Thus the four actual positions disfavor a framing mechanism that independently reallocates printed word lengths while ignoring the apostrophes. They do **not** disfavor a deliberately authored rule that retains apostrophe words, and the result cannot establish that all other 2,892 word boundaries are genuine.

## Invertibility and the original puzzle decision

The [single-file CommonJS source test](../sims/lp2_anchored_frame_identifiability_sft.cjs) reads original transcriptions, enforces all counts and anchor locations, computes exact integer multinomial products, evaluates the tick probabilities through subset-sum combinatorics, constructs a second original-source-compatible framing, and passes an authentic **95-rune solved p57** known-rule test: within each clear-source punctuation block, rotate printed word lengths one position forward, then invert the documented rotation and recover every original boundary. The positive proves that a specified frame grammar is mechanically invertible on original GP text; it does not identify the historical LP2 transformation. [Manual Windows Node22 workflow](../.github/workflows/agent11-anchored-frame-identifiability.yml).

**Causal fork:** A word-framing attack needs a source-visible *specific boundary operator or side key*, independently tied to original LP2 ink, chapter formatting, p50 table content, or an authenticated prior Cicada instruction. Four contractions, 32 page carries and punctuation are powerful fixed tests **after** an operator is proposed, but do not construct it. Without a source selector, arbitrary length permutation consumes thousands of free choices and is an underdetermined search, not a decipherment path. Prefer discovering a real historical rule or a value-changing cipher that produces complete original plaintext. This result leaves paragraph-preserving boundary operations that are explicitly authored or tied to rune values unresolved.
