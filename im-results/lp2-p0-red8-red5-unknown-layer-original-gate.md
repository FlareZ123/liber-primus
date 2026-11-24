# Exact unknown-key extension of opening 8+5 two-layer F-hold hypothesis

**Result:** Conditional exclusion of arbitrary periodic 8-rune inner and 5-rune outer additive keys (arbitrary initial phases, independent historical F holds), if the fourth black-body printed group is one of the 2171 tested 11-rune native lexicon words. No plaintext recovered. This extends [literal-key tests](lp2-p0-red8-red5-two-layer-fhold-original-gate.md), not a duplicate fixed-key sweep.

## Model and exact search

A layer emits zero and holds its clock for input F=0, otherwise emits (input+key[phase]) mod29 and advances. Inverse outer layer at nonzero c consumes with q=c-k[b] nonzero; at c=0 it may hold q=0 or consume q=-k[b] nonzero. Arbitrary outer key signs are absorbed into unknown residues. Inner layer follows the identical rule. The printed 8+5 rubric motivates periods only. It does not establish that these layers are real.

Enumerate all cyclic period-five classes (including constants) using lexicographically minimum rotations; arbitrary initial phase covers every ordered key. Exact outer reachability uses five-bit phase masks. Let M[x] mark phases where outer key equals x. For nonzero x, s'=rotate(s & ~M[x]); for zero, s'=s | rotate(s & ~M[0]). The table is [nonzero key slots, classes, survive 300 runes, survive all 716 runes]:

| 0 | 1 | 1 | 1 |
| 1 | 28 | 18 | 7 |
| 2 | 1568 | 576 | 104 |
| 3 | 43904 | 8971 | 693 |
| 4 | 614656 | 69775 | 1513 |
| 5 | 3442096 | 201310 | 1124 |

Totals: 4,102,253 classes; 280,651 prefix survivors; 3,442 full outer survivors (including all-zero). This is an exact language-independent outer support reduction, not uniqueness.

Fixing inner rubric word yields zero full joint paths for positive sign; negative sign permits exactly three outer classes: [0,0,0,25,10], [0,0,3,12,19], [0,4,24,3,18]. All three fail native A/I singleton constraints (five one-rune groups). This does not exclude arbitrary inner keys.

## All-secret inner key via anchor

Fourth body group spans offsets 10–20 zero-based, 11 runes. Enumerate all 2171 11-rune encodings of repository TextBlob lexicon plus authentic p57 words, replacing K/Q→C, V→U, Z→S and permitting all single/digraph GP segmentations. Every such word has at least eight non-F symbols. This is a deliberately finite orthographic/lexical hypothesis, not a claim all possible native English is covered.

For each surviving outer key, compute exact forward and backward outer phase support. Enumerate every compatible intermediate q path across the anchor. Rotate unknown inner key so its phase is zero at the anchor. On p=0 require q=0; otherwise impose inner key[phase]=q-p mod29 and advance. Repeated slots must agree. Every candidate determines all eight residues; there are no incomplete key assignments. For each distinct outer class, anchor phase, inner key candidate, run joint 40-phase reachability over all 716 original runes, enforcing inner phase zero and the selected outer phase at the anchor. We **relax** the anchor plaintext constraint during this final support test; thus a failure remains exact and no true anchored solution can be dropped.

Results: 5698 outer anchor paths, 12370358 word/path pairs, 435 distinct anchored key candidates, 0 full joint paths. No singleton constraint was needed for this exclusion.

Three positive controls encrypt the exact 95 source p57 runes under chosen two-layer keys and use its 14-rune anchor (word 14). With the planted outer key supplied, the same anchor inference recovers the actual rotated inner key among the surviving candidates for each control. These are recovery/admission controls, not proof of unique recovery or validation of the outer key search on p57.

## Reproduction

`node sims/lp2_p0_red8_red5_unknown_layer_sft.cjs` from repository root. Executed the same JS experiment against repository source, additionally cross-checked outer enumeration, fixed-inner and anchor results in independent local optimized C++. The first 300 count is a diagnostic; final search uses the complete body. No standalone CI run claimed.

Next: if this model is pursued further, remove dependence on intact printed groups by looking for dictionary anchors at arbitrary rune offsets; alternative inner/outer periods or other cipher families are outside this result. Do not treat the 435 failed keys as decoded plaintext.
