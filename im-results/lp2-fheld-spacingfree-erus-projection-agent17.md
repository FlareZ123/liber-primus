# Spacing-free F-held predecessor permutation attack: ERUS key-projection capacity

Agent17, 27 November 2026. Extends the [exact printed-word gate](lp2-fheld-longword-permutation-clash-agent17.md) without assuming printed groups are plaintext words. Same frozen #3045/#3143 recurrence and vocabulary. **No new plaintext; finite-register conditional exclusion even with decoy spacing.**

## Construction and source selection

A word with four specified previous-consuming plaintext symbols E,R,U,S constrains four entries of the shared permutation, regardless of preceding word/IV or literal-F choices outside the word. Select ERUS before scanning original placements: three/four/five-entry projections were evaluated on 39 nonterminal ~12901-rune native donor chunks using the ten most frequent within-word consuming predecessors. For >=5-rune words the best four-entry set was ERUS, minimum12, mean26.256 across training chunks. The selection used native diagnostics (not original fit), and preliminary terminal chunk counts were also inspected; this is not a fully blinded language-register experiment.

Enumerate 7,222 eligible distinct GP spellings from the same 58,162-string vocabulary as the printed-word gate; all chart tokenizations, normalized spelling and NG/ING, IA/IO aliases, including words of lengths5..18. For every within-page placement on the original 12,901 modeled rune transitions (one public IV removed per nonempty page), ignore the first consuming plaintext rune. Require every held plaintext F to have c=0, repeated predecessor demands to agree and every different predecessor to have a different K value. Bucket each local partial permutation by the four values K[E],K[R],K[U],K[S]. Any complete key belongs to one such bucket. Greedy earliest-end interval scheduling gives the exact maximum number of disjoint placements in that bucket, **relaxing agreement on all other K entries**.

## Results

Original: 88,374,087 template/placement trials, 2,068,649 valid local placement/template pairs; max projected disjoint anchors13, two projections attain that relaxed bound. There are 3,039 projections with at least8 disjoint placements. Retain all 35,882 local anchors in those buckets and search compatible partial permutations, with interval-scheduling upper bounds after each branch. Every possible nonoverlapping selection with a common key is covered by the branching over chronological intervals; compatible partial maps extend to a complete permutation. A relaxed interval bound discards all buckets below8. All 3,039 remaining buckets complete, 9,858 nodes, no threshold8 witness, no resource cutoff. **All-key upper bound7**; not a claim that seven are achievable.

Controls: final 12,901-run spans of three independent donor texts, same original frame lengths, random complete keys and public IVs. Within-frame eligible / vocabulary-covered / exact true-projection matches: Gibran 10/8/8, Shakespeare 21/18/18, Emerson 24/22/22. Exhaustive first-five-frame projection scans contain at least all covered true anchors (true counts3/3/0 versus actual covered2/2/0). The controls validate anchor generation and interval bound; they do not constitute a full blinded plaintext recovery or test the #3143 unconditional legality solver. Earlier unoptimized combined scan timed out, then the optimized pure JS modes completed separately (orig19.2s, controls8.4s, refine41.8s).

## Every contiguous native donor window

For every donor word with eligible covered spelling and absolute start a, length L, a 12901-rune window beginning s contains it iff a+L−12901 <= s <= a. Exclude crossing each fixed physical frame cut b by subtracting s in [a−b+1,a+L−b−1], intersected with inclusion interval. Because minimum frame length65 exceeds maximum eligible length18, no word crosses two cuts. A difference-array accumulation counts all native windows exactly, without scoring ciphertext or guessing K.

| Donor | Windows | Minimum anchors | Maximum anchors | Survive upper bound7 |
|---|---:|---:|---:|---:|
| Gibran | 34,729 | 5 | 29 | 36 |
| Shakespeare | 204,206 | 6 | 27 | 91 |
| Emerson | 293,951 | 13 | 38 | 0 |
| Total | 532,886 | | | 127 |

532,759/532,886 excluded by this single necessary condition. All three terminal native control windows excluded. Remaining 127 are not evidence of decryption; only they need further exact testing if assuming contiguous source reuse. The result also applies to new plaintext with at least eight of these eligible vocabulary-covered words fully within the physical frames, independently of printed spacing. Different spelling/lexical register, noncontiguous plaintext transport changing internal adjacency, different reset convention, private keys, or arbitrary new prose with few eligible anchors are not excluded. No unconditional cipher UNSAT or independent source selector.

Reproducer: [script](../sims/lp2_fheld_spacingfree_erus_projection_agent17.cjs), commit 058b2b7b789dae6ef93f02ad090a0f789c071a60. Pure main ran in V8 in modes orig, control, refine and windows, filesystem wrapper not separately executed. The exact donor and lexicon inputs are pinned in the script. Next: tighten all-key threshold from 8 to the minimum donor floor 5, or use remaining native source windows as exact known-message constraints rather than fitting another unconstrained key.
