# All-secret triplet/quintet block bijections under authentic latent F

**24 November 2026 — independent Agent 2 research.** Extends the fixed consuming-digraph decision (#2628) and closes the authentic-clock limitation in [the earlier literal-bypass block study](lp2-trifid27-allsecret-original-block-collision-gate.md). No unknown plaintext or key. The source-local motivation is the existing 3/5-symbol fractionation hypothesis (the 729-rune opening, five-dot motifs), not an authenticated choice of cipher.

## Exact family

A cipher consumes consecutive groups of b=3 or b=5 **non-F plaintext** runes using a fixed injective map from 28^b inputs to 29^b output tuples. True plaintext F is copied literally in its physical position and consumes no coordinate. Encrypted non-F may emit F. This grants all possible secret block maps, not just Trifid or arithmetic maps. At the start/end of an observed interval an incomplete block may be ignored, permitting any consuming phase. We test both one fixed map over the book and nine independent chapter-private maps. No known plaintext boundaries or printed-word alignment are required.

Any legal consuming mask is a subset of visible ciphertext F sites; all other positions consume. For each potential ordered block type t, enumerate possible subsequences of b consecutive consumed positions by skipping only F. Group identical candidates by their starting position; their number bounds that type's multiplicity. For types with repeated candidates, compute its exact maximum over **all** masks and all initial phases by dynamic programming. A state consists of consuming phase (0..b−1) and whether the current partial block equals the corresponding prefix of t. On F either skip or consume; on other symbols consume. A full matching block contributes one, resetting phase and match. Initialize all phases; incomplete initial blocks cannot match. Accept every terminal phase. This requires 2b states, not exponential enumeration of 458 F decisions.

Let M_t denote each type's exact independent maximum. For any single mask and phase, the number of unordered equal-complete-block pairs is at most sum_t M_t(M_t−1)/2. Independent maximization may combine mutually incompatible masks; it is a conservative upper bound, not a claim that a common mask attains it. The maximal single-block frequency is max_t M_t. Injectivity preserves both statistics for complete plaintext blocks.

## Original outcomes

Original physical p0–55, p50 rune-free, 12,956 runes. Native comparisons use the frozen Shakespeare/Emerson/Gibran GP tokenizer from #2628, 32 evenly spaced length-matched windows per source. For each donor grant every possible initial phase, discard incomplete end blocks, and require only both collision statistics to fit the original caps (even a mismatched consuming length is not rejected). Each chapter has 96 such windows.

| Physical pages | Runes | Triplet pair cap | Triplet passing /96 | Quintet pair cap | Quintet passing /96 |
|---|---:|---:|---:|---:|---:|
| 0–2 |729|9|0|0|35|
| 3–7 |1145|30|0|0|14|
| 8–14 |1729|72|0|0|2|
| 15–22 |1903|97|0|0|1|
| 23–26 |1021|17|0|0|18|
| 27–32 |1433|33|0|0|7|
| 33–39 |1680|57|0|0|3|
| 40–53 |3008|228|0|0|0|
| 54–55 |308|1|7|0|72|

**Every complete aligned quintet is unique within each original chapter for every allowed mask and phase.** In three chapters there are raw duplicate candidate quintets, but exact DP rules out their simultaneous occurrence under a consistent mask and alignment.

For the full book with a common continuous block map, grant any starting phase and all latent F decisions. The comparison also grants every phase for each of the 96 whole-book native windows.

| Width | Original max type | Original collision cap | Minimum native pairs | Passing |
|---|---:|---:|---:|---:|
|3|6|4064|7299|0/96|
|5|2|8|132|0/96|

Even allowing independent keys in all nine chapters and separately choosing the most favorable phase in every chapter of each matched continuous donor, summed original caps are 544 and 0; the donor minima are 1051 and 14 respectively. Zero of 96 whole-book windows passes either width. The shortest local receivers alone do not justify a key search: p54–55 and several quintet scopes remain feasible under these relaxed statistics, and arbitrary full-block maps are unidentifiable there.

## Controls and decision

2,333 exact per-type comparisons against brute enumeration on 160 seeded short examples match. Six independent 1,700-rune native plants, three per width, use injective affine permutations of complete base29 blocks, nonzero arbitrary boundary phases and authentic F bypass; all 10,200 plaintext runes round-trip exactly. True held Fs range 40–48; 47–79 ciphertext Fs are consuming. Both collision invariants are preserved and fall below the computed caps in all six. This tests the clock and block-map inverse, not blind recovery of an arbitrary codebook.

Reproducer: `node sims/lp2_latent_f_polygraphic_allphase_cap_sft.cjs` from root. Exact core executed on fetched original and donor contents in isolated JavaScript; standalone Node wrapper not separately run. [Committed SFT](https://github.com/FlareZ123/liber-primus/blob/6bae8e2b170fdb13012c9b2006ed7c602cbc84a3/sims/lp2_latent_f_polygraphic_allphase_cap_sft.cjs). The result is a conditional exclusion against the specified native comparison register; not a theorem about all English texts, arbitrary changing block maps, variable-width blocks or other hidden symbols. Do not tune width/key or repeat this native comparison without a distinct authenticated operand or new mechanism.
