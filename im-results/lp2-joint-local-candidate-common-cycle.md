# Joint local-candidate common-cycle inverse

## Decision

Do not treat the published local candidate words as jointly validated plaintext. A single arbitrary shared bijective GP29 alphabet with an additive period-8 or period-13 key cannot satisfy the tested whole-book crib set with continuous or page-local phase; q8 also fails with independently chosen word phases. The q13 word-phase searches are capped, not excluded. On p33–39 alone, q13 continuous phase is algebraically feasible, but the complete 864 normalized decoders yield no convincing continuation.

## Inputs and mechanism

Corpus: `resources/liber-primus/lp2-corpus.json` (blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`). The following are existing *hypothetical* aligned plaintext anchors, not new recoveries:

| Page:zero-based rune offset | Candidate |
|---|---|
|0:39|LUCK|
|0:49|GOOD|
|0:117|FOUND|
|2:36|GOOD|
|32:30|YOU|
|33:132|WILL|
|34:4|BE|
|35:25|FOUND|
|37:146|LUCK|
|38:49|FOUND|
|40:71|PATHS|
|38:57|BEWARE (extension)|
|39:132|FALSE (extension)|

Test pi(C)=pi(P)+K[phase] modulo 29, where pi is any permutation of 29 rune labels. Equal-phase edges constrain their differences identically; Gaussian elimination over GF29 with translation gauge pi(0)=0 detects forced collisions. Phase DFS rejects any impossible same-phase input/output edge or forced label equality. This is a relaxation: exhaustion without a surviving leaf is rigorous exclusion; reaching a leaf does not demonstrate an actual permutation. Ordinary all-rune consuming clock. Literal plaintext F bypass contradicts each of the three FOUND anchors immediately.

## Whole-book joint constraints

| Anchors | Period | Continuous | Zero page reset | Arbitrary page phase | Arbitrary word phase |
|---|---:|---|---|---|---|
|11|8|excluded|excluded|excluded (12 nodes)|excluded (418)|
|11|13|excluded|excluded|excluded (2733)|capped (50001)|
|13|8|—|—|excluded|excluded|
|13|13|—|—|excluded (229)|capped (100001)|

Controls planted on matching geometry: all eight known-phase cases retained; seven of eight unrestricted cases reached a relaxation leaf, remaining q13 word case capped without exclusion. A greedy removal process found six-anchor q8 and nine-anchor q13 page-phase exclusion cores; each single deletion then allowed a relaxation leaf, not necessarily a true bijection.

## Exact section-local inversion

Seven aligned anchors on p33–39 (WILL, BE, FOUND, LUCK, FOUND, BEWARE, FALSE) cover 31 of 1680 runes. q8 continuous, zero-page-reset and arbitrary-page-phase models excluded; q8 arbitrary-word-phase survives relaxation. q13 zero-page-reset excluded; continuous and arbitrary page/word phase survive relaxation.

For the surviving continuous q13 model, fix the additional scaling gauge pi(1)=1 (valid for every permutation after translation). All 13 shift phases are observed. Rank is 19 on 28 variables, leaving nine dimensions. Four labels [13,16,21,28] are absent from all crib edges and therefore have no constraint other than bijectivity. Quotient them out: 207 normalized pairwise disequalities, 36 exact observed-label assignments in 331 nodes, no cap. Each extends in precisely 4!=24 ways. Complete set: 864 distinct decoders, 32 shift vectors and 864 distinct decoded streams. Every decoder exactly reproduces all seven anchors and round-trips every one of the 1680 runes.

All 864 were decoded and scored using add-0.5 smoothed bigrams trained on the 2916-rune derived Dukotah R37 LP1 map, excluding every scored edge touching a crib. Rank selection p33–37 versus p38–39 gives:

| Metric | Minimum | Maximum |
|---|---:|---:|
|p33–37 log probability / edge|-4.096761|-3.939535|
|p38–39 log probability / edge|-4.139232|-3.870330|
|All non-crib edges|-4.085782|-3.945378|
|IoC|0.034210|0.034872|

Uniform log probability = -3.367296; clear p57 control = -2.499099 under the same model, IoC 0.062710. The best p33–37-ranked decoder scored -3.976345 on p38–39. Note both subsets contain cribs used in constructing the algebraic candidate set; this is withheld non-crib scoring, not an independent blind-page validation. The best overall rendering begins `IA D J OE G X O N B X B T AE S NG U R C E Y TH IA U U A I J X C J NG IA F A M A AE C H P`, without persuasive prose. The language score is diagnostic, not a mathematical exclusion of all possible plaintext.

## Reproduce

- `node sims/lp2_joint_local_candidate_common_cycle_sft.cjs`; `im-results/lp2-joint-local-candidate-common-cycle-output.json`
- `node sims/lp2_joint_local_candidate_section_cycle_sft.cjs`; `im-results/lp2-joint-local-candidate-section-cycle-output.json`
- `node sims/lp2_section33_39_q13_bijection_sft.cjs`; `im-results/lp2-section33-39-q13-bijection-output.json` (initial four witnesses only)
- `node sims/lp2_section33_39_q13_exhaustive_sft.cjs`; `im-results/lp2-section33-39-q13-exhaustive-output.json` (complete candidate table, full best streams, replay checks)

The exact enumeration is a new finite closure of this conditional mechanism, not a solution to LP2. Avoid further scoring or resampling this set without an independent reason to alter the model. No change to established plaintext. Remaining q13 arbitrary-word-phase cases and mechanisms not constrained by these cribs remain open.
