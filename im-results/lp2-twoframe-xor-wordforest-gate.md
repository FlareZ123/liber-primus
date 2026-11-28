# Exact legal-mask and word-overlap joint XOR receiver (#3293)

Agent 3, 28 November 2026. **No authenticated common pad or unknown plaintext.** Historical binary XOR is genuine, but its GP29 transfer and reused pad are hypotheses. This is distinct from [#3282 additive trigram](lp2-twoframe-joint-trigram-gate.md), #2726 cycle walking and #2818 feedback; the latter two do not use an ordinary shared XOR pad across source bodies.

## Domain constraint

Let G={0,…,28} and H={29,30,31}. A five-bit XOR mask is a translation on the 32-element binary vector space. For every nonzero mask it has two-element orbits; an odd-size subset G cannot be invariant. Thus only mask0 is a universally legal GP29 XOR permutation. Ordinary independent uniform five-bit masks must be conditioned on legality or risk out-of-domain ciphertext; for fixed p,q the number of masks producing two legal symbols is |G ∩ (G xor (p xor q))| = 29 when d=0, 28 when d∈{1,2,3}, 26 otherwise. This follows by inclusion–exclusion on H and its translate; verified exhaustively over all 32 differences and masks. A same-mask sender can draw uniformly from that allowed set if it sees both plaintexts, and the inverse is exact given the mask, but this is a plaintext-pair-dependent pad selection mechanism, not a source-established shared random pad. A single independent unconditioned mask per position has probability at most (29/32)^716 of both messages remaining legal. For the frozen source alignment, D=C1 xor C2 has counts 39, 66, 611 in the above three classes; any plaintext pair with this D has exact unconditioned log10 legal probability -60.592717.

## Exact stronger receiver

Use the same independently framed p0–2 and p23–26 black-body starts as #3282 (716 versus 1005 runes). No alignment changes, no F bypass. Difference D determines y_i=x_i xor D_i. In addition to the XOR equation, suppose both printed group boundaries are genuine word boundaries. This assumption is unverified for LP2 but is granted correctly to native plants. Build a bipartite graph with one vertex per word in each lane and an edge for each positive-width overlap. For two partitions of one line interval the graph is a forest: at every consecutive boundary only one lane changes, attaching a fresh vertex to the current component, or both change, starting a fresh component. Exact word-candidate dynamic programming is therefore possible: aggregate child subtrees by their overlap-substring projection, query the XOR-shifted projection from the parent word, sum counts, and maximize log unigram word-frequency weights. There is no pairwise full-message enumeration or beam approximation in feasible components. Count all dictionary assignments using BigInt. For a truncated final word allow only prefixes of longer dictionary words. For an infeasible component use a separate exact joint character-trigram Viterbi fallback, preserving the XOR equation; this is a weaker OOV treatment, not an exact global MAP over arbitrary OOV patterns.

Dictionary: 29077 distinct GP forms from pinned TextBlob word counts plus seven nonheld native sections, normalized greedily word-locally; hold KOAN and DIVINITY out (apply two previously adjudicated WHAT→WHO corrections), plus disjoint Gibran/Shakespeare windows. The controls grant true word cuts, explicitly record in-vocabulary rune coverage, and use deterministic conditionally legal common masks, independent legal masks and a circular one-rune ciphertext misalignment. Gate before original inverse: all common-pad plants recover at least 70% in both lanes and their exact-dictionary feasible coverage separates rivals. Full input/output/true masks and every feasible component's exact assignment count are in the raw output.

| Control | Pad type | Dictionary truth coverage (of 716 each) | Recovered runes (lane1/lane2) | Feasible dictionary runes | Unique dictionary runes |
|---|---|---:|---:|---:|---:|
| native-koan-divinity | shared | 708/684 | 633/633 | 654 | 54 |
| native-koan-divinity | independent | 708/684 | 44/32 | 135 | 0 |
| literary-0 | shared | 697/569 | 368/368 | 339 | 12 |
| literary-0 | independent | 697/569 | 60/42 | 56 | 7 |
| literary-1 | shared | 661/604 | 380/380 | 411 | 9 |
| literary-1 | independent | 661/604 | 46/45 | 164 | 0 |
| native-koan-divinity | wrong-clock | 708/684 | 46/44 | 231 | 7 |

The fixed recovery gate failed. As required by #3293, do not run a language fit to the original pair. Only the original source-frame geometry and key-independent legal-mask statistic were evaluated. The exact conditional dictionary receiver plus fallback does not meet the required blind full-message recovery standard; it supplies no authenticated mask, and the original word-boundary assumption is additionally unverified.

The exact forest theorem and reusable solver are a method for testing synchronized two-message constraints when word segmentation is actually known; they do not establish that LP2 has that framing. No cycle-walk, alternate chart, arbitrary alignment or generator sweep justified. The 289 unpaired cipher runes are retained, not decoded.

[Reproducer](../sims/lp2_twoframe_xor_wordforest_sft.cjs) · [full output](lp2-twoframe-xor-wordforest-output.json). Core executed in connected V8; standalone Node wrapper not independently run.
