# LP2 p24–p26 mayfly triptych: no source-aligned shared additive GP29 pad

**Decision, 22 November 2026:** the original three-page insect-artwork triptych does not support the simple 2014-executable hypothesis that its three different GP29 texts were encrypted under one repeated additive rune keystream at a common position clock. The literal page-start and the source-visible first-complete-word clocks both yield differences substantially less native-English-like than all sampled genuine GP29 source controls. Even selecting two unrestricted pagewise Caesar offsets after observing the ciphertext does not improve the result beyond the weakest 200 disjoint original-English controls. **No original unknown-page plaintext, authentic key or new complete cipher has been recovered.** The later spacing-free literal-prime XOR and ordinary-F and literal-F collision-skip beam inverses below fail their original recovery tests. An exact ordinary-F bigram marginal subsequently finds weak positive support for 3/2/1 but no recovered plaintext; see the final section. This opening decision closes only the specifically stated fixed-position additive reuse architecture.

## Human-visible premise and exact source register

Physical LP2 pages p24/p25/p26 correspond to original scans 41.jpg/42.jpg/43.jpg. They repeat a near-identical insect engraving and have similar text lengths **270, 273 and 265 GP29 runes**. Prior [Agent9 triptych word-weave decision](lp2-p24-p26-original-whole-word-weave-all-order-gate.md) excludes value-preserving word-only anagrams; it did not directly test an independent **shared additive pad**, which would instead change rune values. The printed first-line fragments are the ends of authentic cross-page words with exactly **3,2,1** leading runes, respectively. These facts motivate the two pre-specified alignments:

1. **Page-start alignment:** first 264 runes of each page.
2. **Complete-word alignment:** ignore only the respective first 3/2/1 carried runes, and compare the next 264 runes of each page, with the same putative keystream clock at the first full printed word.

Using 264 common positions avoids truncation differences and imaginary runes. Source data: [canonical LP2 page indices](../resources/liber-primus/lp2-corpus.json), [genuine solved GP29 sections](../resources/external/relikd-solved-gp29-native-v1.json).

## Key-independent inverse implication

For distinct pages a,b at equal positions i, if

C[a,i] = P[a,i] + K[i] (mod 29)  and  C[b,i] = P[b,i] + K[i] (mod 29),

then **C[a,i]−C[b,i] = P[a,i]−P[b,i] (mod 29)** for *every possible keystream*, even an unknown high-entropy stream. We therefore do not need to guess K to test this model. The native-source solved-GP symbol distribution f from 2,979 solved reference runes fixes, without fitting ciphertext, the independent-English difference law q[d] = sum_x f[x]f[x−d] for 29 residues. For the three original page pairs at 264 positions each, the score is

L = sum_pairs sum_i log(29 q[(C[a,i]−C[b,i]) mod29]).

L>0 favors the predeclared real-source GP29 difference law over uniform independent masking; a negative L favors uniform. Because real English has sequential dependence and orthographic idiosyncrasies, the decision uses actual native-GP continuous control windows rather than a naive iid chi-square significance claim. Native English is source-calibrated for ING→GP21 and IO→GP27 and checks the independently solved **95-rune p57** exactly. Controls are pinned original text files [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), and [Emerson](../resources/control/emerson_essays_2944.txt), encoded word by word into authentic-source GP spelling.

## Original results and source-native controls

| Exact 3×264-rune register / experiment | Three-pair L | Interpretation |
| --- | ---: | --- |
| Original p24/25/26, **drop 3/2/1 carries** | **−15.2605421444** | 27 of 792 pair-difference observations are zero; χ² against uniform 28.71464646 |
| Original p24/25/26, **page starts** | **−11.7096100691** | Same source-visible page-start alternative |
| Original drop-carry with **literal +3,+2,+1 per-page additive cipher offsets removed** | **−10.5941011770** | The only natural signed numerical variant from the printed carry sequence; still nonprose-like |
| **200 non-overlapping** triples of native Gibran/Shakespeare/Emerson, 264 runes each, stride 300 | **minimum −0.5653341560**, median 17.5020374653 | Zero control triples scored at/below the original source-aligned L |
| **6,000 seeded randomly located** native source triples | **minimum −9.2398935343**, median 16.3598718242 | Zero samples scored at/below the original source-aligned L; overlapping placements are *not* independent tests |
| Original drop-carry, **best two arbitrary constant pagewise Caesar offsets out of all 29²** | **+0.2733377235**, relative offsets [0,17,4] | An *unselected* fitted rival; still below the weakest of the 200 identically optimized disjoint native controls (min +1.2058509874; zero at/below) |
| Original page streams circularly rotated independently 6,000 times | **median −19.3468436581** | 1,589/6,000 wrong-key rotations score as favorably as or better than the actual drop-carry alignment |

The **source fixed data** distinguish same-position pad reuse from independent masking. A naive count of short English-looking fragments would not. The observed native-control gap is an empirical calibration under these three actual English books, **not a universal probability that no pad was reused**. The 200 disjoint controls are much more independent than the 6,000 overlapping placement samples.

## Positive and alternate-model controls

- **Exact reversible positive plant:** take three independent contiguous native GP English blocks, encrypt all three with a common deterministic 264-symbol GP29 additive pad, verify exact inverse and full equality of all three pairwise score distributions. PASS.
- **Independent native transcription check:** source-calibrated English GP encoder exactly reproduces the original solved LP2 p57 in all **95/95 runes**. PASS.
- **Two different human-visible phase options:** page start and first complete printed word both tested as frozen clocks; no shift was chosen by maximizing original-language scores.
- **Strong rival:** a different key per page, an unknown nonadditive state or page-specific 29-symbol permutation, a nonnative source language, a plaintext whose page boundaries are unrelated to printed word positions, or an arbitrary unknown clock can evade this test. All remain possible; fitting them without an independent clue would not establish a decipherment.
- **Unrestricted two-Caesar-offset variant:** maximized exactly across 841 possibilities, with matched source controls. Its near-null best value and lack of source key cannot be promoted as evidence for the fitted [0,17,4] offsets.

## Research decision

Retire **equal-position, same additive GP29 pad reused on all three repeated-insect pages**, including literal source first-word trimming and obvious page-carry offsets, as a lead to plaintext in source-native GP English. The repeated art may still select an entirely different intentional relationship, but it supplies no authored additive key or clock beyond these tested options. Continue only if a first-party clue specifies a different state, nonadditive operator or a real shared plaintext/key artifact and yields a prospective original-passage prediction.

**Reproduction:** [Windows-compatible Node.js CommonJS single-file test](../sims/lp2_insect_triptych_sharedpad_sft.cjs), using only the committed immutable source inputs, fixed source-native encoder, seeded controls, exact original rune registers and reversible shared-pad plant. The complete test was executed successfully in a V8 JavaScript runner against exact GitHub repository source bytes on 22 November 2026; no Actions workflow was created. Run locally on a full checkout with Node.js 20+.

## Distinct literal-prime XOR triplet inverse (Agent6, 24 November 2026)

The source identifies three insect pages independently of text statistics. The historical XOR operation, in the literal GP-chart prime register (2–109), is separate from the rejected GF29 addition/affine model. Let each page have arbitrary unknown common seven-bit pad K[t], with code(C_j)=code(P_j) XOR K[t]. Cancel K in the two differences with page24. Each candidate plaintext prime for page24 uniquely determines the other two primes, if both are legal chart values. No pad alphabet or generator is guessed.

A joint weighted three-trie inverse allows **arbitrary plaintext word segmentation** and partial start/end words. The frequency lexicon plus Shakespeare supplies 30,263 GP forms and 269,751 regular/suffix trie nodes; the beam retains up to 4096 triples of trie states, merging identical states by maximum score. The source-visible two alignments above are frozen (264 runes each). Four target-excluded controls use disjoint native Gibran and two disjoint Emerson windows encrypted with a different legal shared XOR pad at each position. The calibration gate (at least 3/4 controls recovering >=80% on every track) passes: three plants recover **792/792** runes each; the fourth **789/792**; all 3,168 selected control positions forward replay exactly. Spaces are inferred and not always correct (rare words may be split); actual GP rune recovery is the metric.

| Alignment | First impossible rune (one-based) | Beam-truncated steps before failure |
|---|---:|---:|
| Page starts 0/0/0 | 75 | 0 |
| First complete printed words 3/2/1 | 83 | 0 |

Because neither original path ever reached the beam cap, the zero state is exact for this finite trie grammar, regardless of word scores. The four controls clipped 3/3/3/7 steps, yet recovered 3165/3168 actual runes. This rejects **both fixed ordinary direct prime-XOR reuse clocks** even when printed word boundaries do not represent plaintext words. It does not exclude a broader language register, OOV words, arbitrary relative page XOR masks, other alignments, literal-F holds, or other ciphers. The source artwork selects the page set, not an authenticated XOR instruction. No original plaintext or key recovered.

[Node SFT](../sims/lp2_p24_p26_prime_xor_triple_word_trie_sft.cjs) · [raw control and original outputs](lp2-p24-p26-prime-xor-triple-word-trie.json). Executed connected JS; no CI claim. Retire the tested family rather than sweeping unselected shifts.

### Complete constant page-relative mask extension

Grant independent constant seven-bit offsets s25,s26 (s24=0), so the adjusted plaintext prime differences are (d25 XOR s25,d26 XOR s26). Enumerate all 16,384 offset pairs and require at least one legal prime triple at **every** one of the first 128 original positions. Both source alignments leave exactly one pair, (0,0), even before evaluating English, and its 136 held-out differences are legal. Thus the above exact zero-state contradictions at 75 and 83 also exclude every constant-relative-mask variant of these ordinary clocks. Four additional disjoint literary controls have exactly one legal full-length planted mask pair, also (0,0); their prefix support counts are 1,2,1,1, and all select the true pair. They recover 3123/3168 runes and replay all 3168. Since all four legal planted masks were necessarily zero, this does **not** demonstrate nonzero-mask recovery in a shorter or different register; it illustrates how restrictive the literal-prime support itself is. No additional original plaintext or key. [SFT](../sims/lp2_p24_p26_prime_xor_relative_masks_sft.cjs) · [raw](lp2-p24-p26-prime-xor-relative-masks.json).

### Latent literal-Fehu holds: three-stream constructive inverse

Transfer the authentic plaintext-F transparent rule: plaintext F (GP index0, chart prime2) emits ciphertext F and consumes no common-pad symbol; non-F plaintext consumes one symbol and may emit ciphertext F. At each common active step, independently enumerate any legal leading literal-F run on each tape, emitting the same F into its word trie; then solve the three-way XOR relation on the next consuming symbols, requiring all three plaintext runes non-F. State is (three physical offsets, three trie nodes), with exact state merging and beam4096, using word probabilities and a uniform legal shared-pad emission factor. Compare 240 common active symbols (all three 264-rune original slices have enough runes for any F-mask); the variable physical endpoint is part of the inferred clock.

Four fresh literary triple controls pass the frozen ≥80% recovery gate. All infer exactly their true consumed lengths [252,244,244], [248,249,243], [242,245,245], [249,245,242], and all true literal-F counts. Rune recovery **2,942/2,948** (six errors, all in the first control), with exact replay. The original page-start alignment consumes [252,248,248] with inferred 12/8/8 holds and score −3748.737 (one clipped step); the complete-word alignment consumes [251,248,248] with inferred 11/8/8 holds and score −3810.915 (**no clipping**, exact maximum within the finite unigram-word model). All original candidates replay but are nonprose, compared to control scores −1902.697 to −1764.095. This is an original predictive language-model failure, not an algebraic impossibility; the lexicon allows many single-rune fragments, and the best output is not a genuine decipherment. Constant relative XOR offsets were not varied in the latent-F clock. [SFT](../sims/lp2_p24_p26_prime_xor_triple_fhold_sft.cjs) · [raw](lp2-p24-p26-prime-xor-triple-fhold.json). No CI claim. Do not extend without an independent authored selector.

### Exact latent-F relative-mask support and constructive key recovery

The literal-prime chart distinguishes Fehu (2, the only even prime) from every non-F active input (odd). In the shared XOR family, the parity of relative masks fixes the relative ciphertext parity at all consuming steps. An exact bitset DP simultaneously carries all 16,384 constant mask pairs and all physical triples of offsets, granting every visible F any legal hold/consume history. At both original source starts, all 240 active steps have exactly **one physical offset triple**, so the complete original clock forces literal holds at every visible F reached. All surviving masks are even; 3,383/3,395 survive the first 128 active positions and **2,852/2,865** survive 240. The independent three-step brute force enumerates all 16,384 masks and matches 4,078 feasible pairs exactly; a 48-active-symbol nonzero-mask plant [0,19,103] retains the true pair. [Exact bitset SFT](../sims/lp2_p24_p26_prime_xor_triple_fhold_allmask_sft.cjs) · [raw](lp2-p24-p26-prime-xor-triple-fhold-allmask.json).

Use the forced clock to rank every even mask pair with an independent Shakespeare GP non-F unigram triple-difference marginal on the first 128 active symbols. Four fresh coherent literary plants choose legal nonzero relative masks before encryption, then independently hide the pad and masks. The frozen selector recovers all four exact pairs [102,58], [118,68], [34,32], [114,56] and the joint trie recovers **2,960/2,966** actual GP runes (three exact trials; six errors in the fourth), with full replay. Original page-start winner [78,0] (prefix −1089.792, withheld −989.145) fails all lexical paths at active126; complete-word winner [80,4] (−1074.732/−992.639) fails at active142. Both have zero clipping. Native true heldout scores −889.907..−869.152. This rejects the frozen predictive selector but not yet every feasible mask; an exact all-mask finite-grammar test is the next decision. [SFT](../sims/lp2_p24_p26_prime_xor_triple_fhold_mask_recovery_sft.cjs) · [raw](lp2-p24-p26-prime-xor-triple-fhold-mask-recovery.json).

## Shared additive stream with collision-triggered one-key retry (Agent6, 25 November 2026)

The repeated mayfly artwork fixes the same two source clocks without inspecting plaintext. Unlike the equal-position shared-pad gate, a common initially aligned GP29 key tape can drift between pages when each page independently rejects a would-be adjacent repeat. This is the ordinary-consuming-F, maximum-one-retry version of the externally motivated keyskip1 mechanism. Its unknown pad is unrestricted; no generator, period, or pagewise shift is fitted.

At a common key tick (k_t), a fresh plaintext (p) emits (c=(p+k_t)\bmod29). If it would equal the previous physical ciphertext rune, it is either accepted with probability (1-s) or rejected with probability (s=0.81288); on rejection, retain (p) and consume the next common key digit to emit unconditionally. The inverse needs no guessed plaintext at a rejection: (p=(c_{\rm prev}-k_t)\bmod29), so a pending retry constrains the next common key exactly to (k_{t+1}=(c_{\rm next}-p)\bmod29). If multiple pages are pending, these constraints must agree. The first rune has no predecessor. Every accepted path stores the common key and per-tick rejection mask; replay checks the rejected collision and every accepted ciphertext symbol. The model intentionally uses no printed word order or segmentation.

Use a width-512 joint beam over three physical cursors, pending runes and four-rune plaintext histories, with deterministic merging of future-equivalent states. The GP29 five-gram model has recursive Dirichlet backoff (alpha=8), trained on the first 80% of each of the same three pinned literary donors; controls are later, disjoint windows. The source-native encoder checks the authentic p57 95/95 runes exactly. The score is the sum of per-selected-plaintext log probabilities relative to a uniform GP29 rune, the collision-coin log factors, and (-\log29) for each key tick. It is a heuristic MAP-path score, **not a marginalized likelihood ratio or p-value**. Cap per-page rejection counts at ceil(N/16), as an explicit finite search bound. The 128-rune gate was fixed at three of four independent shared-pad plants recovering at least 80% of each track before scoring original prefixes.

| N | Shared-pad plant score range | Independent-pad null score range | Recovery gate |
|---|---:|---:|---|
| 128 | -12.843 to 143.893 | -83.101 to -75.628 | 3/4 |
| 264 | 55.603 to 217.407 | -184.085 to -156.286 | 2/4 (failed; original not scored) |

The complete 128-rune control recovery counts are [116,117,115], [122,120,121], [42,41,41], [116,114,115] on three tracks per trial. The full-length controls recover [177,173,177], [157,164,158], [248,253,254], [231,230,232]. In all shared plants the true trace reconstructs every rune and exact forward encryption; every returned blind candidate, including independent-pad and original paths, passes its own replay check. Higher-than-true-path scores in several controls demonstrate residual ambiguity, and lower scores in failed controls demonstrate heuristic pruning.

| Frozen original 128-rune alignment | Score | Inferred rejected key counts (p24/p25/p26) |
|---|---:|---|
| 0/0/0 physical starts | -83.971310 | 8/5/2 |
| 3/2/1 complete-word starts | -78.047011 | 6/8/3 |

Both original scores sit in or below the four matched independent-pad controls' range; their highest-scored rune sequences contain wordlike fragments but no coherent three-track prose. The complete-length calibration failed, so no claim is made about the full 264-rune original under this model. This is a bounded heuristic original-prefix failure, **not** an exhaustive all-key rejection or a proof that the pages use independent pads. The distinct historical F-bypass plus retry clock is examined separately below. No authenticated key or unknown plaintext.

[SFT](../sims/lp2_mayfly_shared_keyskip1_joint_inverse_sft.cjs) · [128-rune raw original and controls](lp2-mayfly-shared-keyskip1-joint-inverse.json) · [264-rune calibration](lp2-mayfly-shared-keyskip1-full-length.json). Run `node sims/lp2_mayfly_shared_keyskip1_joint_inverse_sft.cjs` or add `--full`. Executed in connected JavaScript against the repository's pinned source bytes; no CI run or Windows execution is claimed.

### Authentic latent plaintext-F bypass plus collision retry

The historically demonstrated transparent plaintext F rule changes both inter-page alignment and physical predecessor state. The distinct inverse extends the ordinary-F state with exact per-track rejection counts, independently enumerates zero or more leading visible ciphertext F runes as literal plaintext F (no common-key consumption), and requires all consuming plaintext runes nonzero. A pending collision retry forbids intervening F holds because its plaintext is already fixed. The physical predecessor includes literal F; the consuming-predecessor rival is not tested. All literal-F masks are latent, rather than treating every ciphertext zero as a hold. Replays check the literal holds, rejected collision attempts, all accepted outputs and complete cursor termination.

With the same frozen donor split, score, beam width, per-track cap and source clocks, the 128-rune gate again passes 3/4. Plant rune recoveries are [119,115,116], [122,122,124], [42,41,46], [118,114,119]; shared-pad scores range -8.875 to 146.906. Four independent-pad null scores range -97.854 to -66.860. Both fixed original prefixes are in that null band:

| Alignment | Score | Rejected keys | Inferred literal F holds |
|---|---:|---|---|
| 0/0/0 | -89.310949 | 3/8/6 | 2/1/1 |
| 3/2/1 | -82.694166 | 5/7/4 | 0/2/2 |

Both candidate outputs remain nonprose. The disjoint full 264-rune calibration passes only 1/4 (recoveries [78,79,79], [93,86,94], [260,257,260], [162,160,165]); shared scores -40.137 to 249.865, nulls -178.564 to -153.593. Consequently full-length originals remain unscored. The severe gap to the true trace scores in the failed plants is concrete evidence of beam-search limitations, not impossibility of the model.

This removes the direct original-prefix motivation to continue the source-aligned shared additive pad route under both consuming-F and literal-F one-retry clocks. Retire those fixed prefix searches absent an independently selected additional constraint; do not tune beam or threshold against these same originals. No plaintext, key, or authenticated collision mechanism follows.

[Latent-F SFT](../sims/lp2_mayfly_shared_keyskip1_fhold_joint_inverse_sft.cjs) · [128-rune controls and original traces](lp2-mayfly-shared-keyskip1-fhold-joint-inverse.json) · [264-rune controls](lp2-mayfly-shared-keyskip1-fhold-full-length.json). Both modes executed in connected V8, not CI.

### Exact marginalized decision, ordinary consuming F

The earlier five-gram beam fails full-length recovery calibration and cannot determine whether its null-like outputs are due to pruning or lack of a shared-pad signal. A forward dynamic program instead sums over **every permitted key tape and collision-retry alignment** up to the frozen per-track skip cap. Uniform independent pad digits, independent retry coins with s=.81288, and the same donor training split are assumed. Factors are scaled relative to iid uniform ciphertext (29 per emitted rune); the independent-pad denominator uses the same cap and collision model. This is a model likelihood ratio, not a frequentist significance result.

The unigram exact DP uses the three deficits d_j=t-i_j, pending mask and forced next key. A two-rune exhaustive brute calculation agrees (0.18993625723797408). At 128 runes the four shared plants have logLR [-0.0630,5.7084,-2.9412,2.7737], four nulls [-1.5046,-2.0367,-2.8675,-5.0800]. Only 2/4 shared plants positive, so the original is gated out. [Unigram SFT](../sims/lp2_mayfly_shared_keyskip1_exact_marginal_sft.cjs) · [raw](lp2-mayfly-shared-keyskip1-exact-marginal.json).

**Exact first-order Markov compression.** For any active track, the latest selected plaintext equals (C_j[i_j-1]-h) mod 29, where h is the last common key. If the last tick emitted, this follows from the emission; if it rejected, this follows from the rejected collision. The same identity covers a retry emission. Thus one common previous key represents all three plaintext histories rather than independent 29^3 history states. At a pending tick k=h+C_j[i_j]-C_j[i_j-1] mod29 is forced; different pending tracks must agree. Dynamic state is (three deficits, pending mask, previous common key). The exact C++ DP sums all paths with no beam or score pruning. A separate explicit plaintext-history and pending-value recursion matches the compressed calculation on three length-two tapes with actual repeats: 0.10809132164224.

The frozen 3/4 shared-positive and 4/4 independent-negative sign gate passes both lengths:

| N | Shared logLR values | Independent logLR values | Original 0/0/0 | Original 3/2/1 |
|---|---|---|---:|---:|
| 128 | 0.725682, 5.772469, -5.618858, 0.907400 | -0.392222, -4.597190, -7.194474, -3.961344 | -2.215792 | +1.818191 |
| 264 | 4.619196, 0.873174, 15.815947, 15.936083 | -4.222596, -9.354378, -7.754644, -7.117176 | -2.876062 | +0.803666 |

The full-length complete-word alignment has modestly positive marginal support (exp(0.803666)=2.23 relative likelihood) under this particular first-order model, weaker than its 128-rune result. It is not a decoded text, and it does not justify accepting a reused pad, tuning the alignments, or claiming a universal exclusion: one full-length positive control is similarly weak. The prefix and full-length calculations have different terminal constraints and skip caps, so their difference is not a strict conditional held-out logLR. The five-gram MAP recovery failures remain important. The separate literal-F exact marginal below fails its positive calibration. Preserve 3/2/1 as a weak unresolved source-motivated lead rather than promote it or spend another parameter sweep.

[Input preparation](../sims/lp2_mayfly_shared_keyskip1_bigram_prepare.cjs) · [C++ exact DP](../sims/lp2_mayfly_shared_keyskip1_exact_bigram.cpp) · [raw outputs](lp2-mayfly-shared-keyskip1-exact-bigram.txt). Compile with g++ -O3 -std=c++17; pipe the Node preparation output into the executable (add --full for 264 runes). Input FNV32 hashes are 6ecc5bce and b7cd3918. Executed locally in Linux g++, full-length controls in batches because the single-process command timed out; original batches ran only after the complete calibration passed. No CI claim. The compression is transferable to other independently source-selected shared-pad hypotheses with this collision rule.

### Exact literal-F plus retry marginal: failed positive calibration

The exact shared-previous-key compression also works when literal plaintext F is transparent. Before each consuming key tick, independently enumerate every possible leading ciphertext-zero literal hold; each such hold contributes 29 times the transition probability to F, resets the last plaintext history to F, and consumes no key. Pending non-F plaintext forbids a hold. A non-F consuming event uses the ordinary emission/rejection transition and re-establishes the previous-key compression. Terminal literal holds are integrated without paying for an unused key. The matched independent null is a per-tape Markov DP over physical position, last plaintext and net clock deficit; direct emit has factor P(p|last) times the repeat acceptance factor, and reject/retry adds s/29 times P(p|last).

Unlike the fixed cumulative-retry cap above, this marginal has a finite **net deficit cap** t-i_j <= ceil(N/16) (minimum possible deficit is minus the number of visible F symbols encountered). This includes all feasible latent hold paths inside the clock bound but permits more total rejects when compensated by holds. It is an explicitly different model; do not compare its absolute likelihood directly to the ordinary-F model.

Three two-rune tapes [0,0], [4,0], [0,9] exercise multiple literal and consuming zero alternatives, actual collisions and terminal holds. An explicit plaintext/pending-state recursive enumeration matches the compressed result 3.5099918769149. The four same source-disjoint 128-rune native shared-pad plants (literal F and independent retry coins, true retries [2,3,4], [3,4,3], [3,3,5], [5,7,7]) produce:

| Plant | log common/uniform | log independent/uniform | logLR |
|---|---:|---:|---:|
| 0 | 7.162899 | 9.636169 | -2.473270 |
| 1 | 10.541418 | 12.078124 | -1.536707 |
| 2 | 7.167040 | 9.441413 | -2.274372 |
| 3 | 5.894791 | 6.388281 | -0.493491 |

Zero of four positives pass the required three-positive sign gate. Stop before scoring nulls or originals; this is an inadequate discriminator under the first-order model, not evidence against literal-F reuse. No further tuning on this branch.

[Input preparation](../sims/lp2_mayfly_shared_keyskip1_fhold_bigram_prepare.cjs) · [C++ exact DP](../sims/lp2_mayfly_shared_keyskip1_exact_fhold_bigram.cpp). N=128 input FNV32 23526c1f. Executed locally with g++ -O3 -std=c++17, separate positive-control batches; no CI claim. The earlier sentence that the literal-F exact marginal was untested is superseded by this completed positive-only calibration.
