# Archived “Key Switch” cipher: exact original p0 word-gate decision

**17 November 2026. Outcome: conditional negative, no recovered unknown plaintext.** An otherwise overlooked, potentially contemporary *community* illustration named `Algorithm.png` specifies a dual-key anti-doublet scheme using the literal Gematria keys **DIVINITY** and **CIRCUMFERENCES**. Its own example takes a 1,152-letter excerpt of the *Bee Movie* screenplay and claims eight equal ciphertext adjacencies. The illustration is a solver's experiment, **not** a Cicada-authenticated operation. It survives in the external [historical archive](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/EXTRA%20WIKI%20PAGES/Liber%20Primus%20Ideas%20and%20Suggestions/Algorithm.png), Git blob `ff0491218e17b53bc8c98da22dbc8ec3b9aad911`. That archive placement does not itself establish an exact creation date.

## Operational hypothesis and stronger necessary condition

The image proposes choosing the DIVINITY addition unless it would repeat the preceding encrypted rune, then switching to CIRCUMFERENCES. It prints the 1-based GP29 arrays:

```text
DIVINITY[8]         = [24,11,2,11,10,11,17,27]
CIRCUMFERENCES[14]  = [6,11,5,6,2,20,1,19,5,19,16,6,19,16]
```

Instead of reproducing a defective state machine, the test grants it **more freedom**: at every ciphertext position *either* key may have been used. A proposed plaintext rune must therefore belong to the two-element set `{(C[i]-DIVINITY[i%8])%29,(C[i]-CIRCUMFERENCES[i%14])%29}`. The diagnostic also tests the conventional off-by-one shift of the same pictured 1-based numeric values. This covers every direct plaintext candidate under the image's two fixed clocks even if the switch predicate is unknown. It preserves original printed word lengths and forbids secret midword insertions/deletions or extra alphabet transformations.

This relaxation is important because the pictured C++ expression indexes `index[i+1]` and `key[(i%period)+1]` without safe terminal handling, and its `continue` branch can leave output unassigned. A rule that discards or overwrites an input symbol is not, by itself, a lossless ciphertext inverse. The broader two-key-dodge noninjectivity obstruction was established independently in [closed issue #274](https://github.com/FlareZ123/liber-primus/issues/274); this historical illustration gives prior context for that family, not an authenticated solution.

## Critical distinction: repaired collision avoidance versus literal historical code

A **correctly implemented last-emitted-output anti-repeat encoder** using the two historical keys could emit a repeated ciphertext only when both additive candidates equal the previous emitted rune, which requires equal key values at that position. Those same-key positions modulo56 are **1,18,29,43**. Original p0 has two repeated-rune events at local indices **122,207**; none of the **112** pairs of key phases makes both positions eligible. At most **12/86** repeated events in the entire original corpus are compatible with a globally phase-adjusted *repaired* model; independently changing key phase on every page increases the maximum to **49/86**. The SFT checks these exact source-input counts.

**These phase contradictions do not rule out the literal C++ program depicted in the historical illustration.** The screenshot's decision predicate compares `P[i+1]+D[i+1]` with `P[i]+D[i]`, and separately compares the two CIRCUMFERENCES outputs. It chooses a key for the present `i` only after those same-key lookahead comparisons; the previously emitted output might have used a different key. Consequently the literal program can emit equal ciphertext even when the source key values at that position differ. Its `continue` can also leave output unassigned, and indexing through `[(i%period)+1]` and `i+1` is unsafe at boundaries. These code defects explain why a strict anti-repeat invariant cannot be attributed to it.

The phase diagnostic therefore only excludes a corrected *last-output* interpretation. The independent original English-word necessary-condition screen below applies to any fixed-length, source-phase output selecting either historical key, regardless of its branch condition, and remains a **conditional** rejection of that word-preserving hypothesis.

## Exact literal lookahead, natural modular-index repair: original p0 has no path

The source code differs from a properly implemented collision-avoidance encoder: at position `i` it compares the hypothetical **DIVINITY current and next** outputs. If they match, it compares hypothetical **CIRCUMFERENCES current and next** outputs, then chooses the current CIRCUMFERENCES output when only the first key would repeat. If both same-key hypothetical pairs repeat, its `continue` fails to assign output `i`. Otherwise it emits the current DIVINITY output. This literal logic is a precisely specified **two-plaintext-symbol local rule**, once its invalid `[(i%period)+1]` array access is repaired to `(i+1)%period`.

A dynamic program was executed over every possible GP29 plaintext symbol pair, requiring the exact original p0 ciphertext rune at each position. It searched all **112 independent constant initial key-phase choices**. Both keys are allowed to explain each ciphertext rune as a necessary precondition, and every candidate plaintext transition must also satisfy the literal source lookahead choice. Skipped/unassigned ciphertext branches are rejected as incompatible with a length-preserving output. Results: **0/112 phase choices** can produce the authentic p0; literal unshifted source phases cease to have any plaintext path at local index **123**; the best phase ceases at index **209**, well before the original p0 length **262**. The [SFT](../sims/lp2_archived_keyswitch_word_gate_sft.cjs) locks all three results.

**Scope:** This is an exact rejection of the **natural modularly repaired source-C++ lookahead grammar with deterministic full-length output**, with no assumption about English, dictionary or intended plaintext. The literal C++ contains undefined out-of-bounds indexing and an unassigned-output branch; arbitrary memory contents or data deletion are outside any reproducible, lossless decipherment model. Do not claim the entire open-ended universe of anti-repeat algorithms is eliminated.

## Actual source-input experiment

The [reproducer](../sims/lp2_archived_keyswitch_word_gate_sft.cjs) parses **p0's original 262 ciphertext runes in 59 source-printed words**, byte-for-byte matching `lp2-corpus.json`. Every original p0 word of at least five GP runes is compared with all GP-transliterated words in the independently sourced **29,157-word TextBlob/Norvig English reference**. The normalizations reproduce the common GP TH/ING/EO/OE/AE/IA/EA conventions and stated historical Latin spelling approximations. The source key phases start at rune zero, exactly as the illustration's `i%8` and `i%14` do. No candidate key values, page phases, or plaintext words are fitted to the source.

| Source-original word class | Image-number arithmetic | One-based correction |
| --- | ---: | ---: |
| p0 words of ≥5 GP runes | 22 | 22 |
| Words compatible with **any** reference English spelling | **0** | **0** |
| Matching source-length synthetic GP-English membership plants | **22/22** | 22/22 not required by plant |

For example, the original first red word has eight runes and produces no lexicon candidate under either arithmetic convention; the same is true of the independently printed long black-body words. The planted positive uses independently selected native lexicon words of the same GP lengths and the fixed first-key addition; it exercises the exact overapproximate word membership test. It is a membership-positive, **not** a demonstration that the historically depicted lookahead decoder is bijective. [Windows Node22 original-source CI run 44145266700](https://github.com/FlareZ123/liber-primus/actions/runs/44145266700) completed successfully.

## Causal decision

The archived source's literal lookahead grammar, with the natural cyclic indexing repair, has no GP29 plaintext path for original p0 under any of 112 constant key-phase pairs. Independently, a corrected last-emitted-output anti-repeat rewrite fails p0's two repeated-rune positions under all 112 key phase pairs. The **literal historical lookahead code does not obey the assumed invariant**, and this phase diagnostic cannot exclude it. Separately, direct word-preserving native GP-English via either source-key addition fails on all 22 original p0 long words. It needs entirely new, independently selected key alignments, hidden character loss or exotic native vocabulary to escape this result. The historical source itself supplies none of these. Its printed doublet rate is a **simulation observation** and cannot infer key material. No original unknown LP2 plaintext, author key, or destination is recovered. Retire this particular 8/14 source-aligned word-preserving mechanism; future effort should start from a **creator-authored operator or actual key-bearing artifact** rather than resuscitate two-key switch variants.
