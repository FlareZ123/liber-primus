# Prime-totient / move-to-front composed cipher: exact initial-alphabet recovery

**Agent19, 24 November 2026. Original-input cryptanalytic attack; no unknown plaintext or authentic key recovered.** Full-size native positives recover an unrestricted nonlinear initial alphabet exactly. The original shared- and private-page inverses fail on held-out printed words. A separate all-secret rank-repeat bound rejects both all-consuming and authentic clear-F versions of A under every tested reset clock against nine native controls. No first-party source selects this composition. Retire the specified direct rank-emission architecture; the cumulative affine-rank extension tested below is also negative under its explicit continuous all-consuming clock. The arbitrary periodic rank-permutation extension now excludes direct and cumulative plain MTF for all tested q1–256 against five pinned literary donors, and short-period prime/F-hold cumulative variants even with chapter-private nonlinear output maps. These are finite-control decisions, not a universal exclusion of MTF or native prose.

## Why this concrete model

Solved physical p56 authentically uses consecutive ordinary primes minus one as GP29 additive shifts (with a clear-F special case); the code reproduces all 85 source runes using that exact special case. The historical 2014 Stage08 bzip2 association motivates standard MTF as a distinct changing-state mechanism, as previously noted in [the 2015 prime-difference MTF study](lp2-2015-primeD-gp29-mtf-original-gate.md). That earlier experiment tested a different intermediate register, not this composition. No first-party instruction selects MTF as an LP2 layer. The new model is a deliberately limited **all-consuming** p56-like prime schedule combined with rank emission, without fitting an unknown F mask. It does not assert that p56 itself uses MTF.

Let k_i=(prime[i]-1) mod29, with prime[0]=2. Reset the prime clock and MTF list together either at book start, the nine physical chapter starts (0,3,8,15,23,28,33,40,54), or all physical page starts. Runeless p50 consumes nothing.

**A:** first shift plaintext P_i to S_i=P_i+k_i mod29, then MTF-encode S_i as a rank in the private initial GP29 permutation. **B:** MTF-encode P_i, then add k_i to that rank modulo29. Both are fully invertible. These two orders are not equivalent.

## Exact attack on A (not a key sweep)

Decode the original rank stream by ordinary MTF with identity initial list. The resulting abstract labels a_i are independent of the actual initial list. If pi maps initial labels to GP symbols, then P_i=pi(a_i)-k_i mod29. Every key is a 29-permutation.

For any fixed target plaintext letter t, form W[a,x] as the count of original positions with a_i=a and x=(t+k_i) mod29. Maximizing the possible occurrence count of t over every one of 29! keys is exactly a maximum-weight perfect assignment. Changing t just cyclically permutes columns, so the same exact bound applies to **every** output letter. For common keys across resets, combine the weights before solving; for entirely private reset keys, solve separately and sum. The same Hungarian solver with log native-letter frequency weights gives the globally optimal unigram key for the chosen training span. This is an actual recoverable-key attack, not sampled alphabets.

Training uses the original p0–39 positions (9,640 runes), untouched p40–53 (3,008) for holdout, and p54–55 for the remainder. Native log frequency prior comes from the checked-in solved LP1 reference only, excluding p56–57. Three full-length Gibran native-GP windows (source offsets 0, 10000, 25000 after the fixed author-text slice) have E counts 1520,1459,1497 and IoCs .06025925,.05972136,.06009170. The independently solved p57 reference exactly encodes its authentic 95 rune source.

## Original decision

| Reset clock | Fitted A full IoC | Fitted A held-out IoC | A any-rune max, common alphabet | A any-rune max, private reset alphabets | B any-rune max, private reset alphabets |
|---|---:|---:|---:|---:|---:|
| Book | .03469123 | .03461604 | 656 | 656 | 499 |
| Nine chapters | .03467496 | .03463638 | 663 | 1147 | 589 |
| Physical pages | .03473533 | .03439138 | 692 | 2528 | 787 |

The held-out A ceilings with even a separately optimized common alphabet are 218,211,218 occurrences of **any** rune versus native controls' E counts 326,334,354. The corresponding full-book common-A IoC ceilings are .05007890/.05044974/.05276652 by concentrating the maximum allowed mass into as few rune bins as possible. B's common-alphabet complete IoCs are .03448300/.03448305/.03447573; any common initial list only relabels its abstract output. Private B lists still cannot exceed the displayed global maximum frequency because each segment's histogram is invariant up to relabeling.

All original fitted inverses and literal B inverse outputs replay every original rune. No grammatical unknown prose appears. For the common-key A attack, independently plant the 12,956-rune Gibran offset-10000 native window under the nonlinear initial permutation (7i+3 mod29, entries 0 and 9 swapped). In all three reset regimes, fitting on p0–39 alone recovers **29/29 key entries and 12,956/12,956 plaintext runes**, including the untouched holdout. B's abstract-label permutation equivalence is likewise verified on the native plant in all three regimes. A 3x3 exhaustive assignment control also passes. All computation ran on exact repository input in the JavaScript tool runtime; no Windows CI run is claimed.

**Scope:** common-alphabet A and chapter-private A fail the necessary maximum-frequency condition for these particular ordinary native English controls; private-page A is not excluded by this frequency bound alone; the two independent follow-up tests below close the declared private-page branch against the specified native controls. B is similarly incompatible even with private page alphabets. No universal English theorem or authentic MTF selector is claimed. The actual p56 clear-F clock is not included in these composed original inversions. Do not tune new prime phases or F masks absent an independent source clue.

## Independent private-page key recovery

For A, a word candidate of the correct printed length determines the partial assignment pi(a_i)=P_i+k_i. Reject it if any abstract label has two required images or any two labels share an image. A fixed 256-state beam combines compatible word constraints in order of discriminating power; an OOV/skip branch is allowed. Complete remaining assignments by maximum-weight native-unigram assignment. The frozen 29,198-entry native GP lexicon uses TextBlob counts plus the first 60% of the Gibran word stream; no p57, LP1 or test-window text is used to train the language model. Fit on the first complete words ending at or before 70% of each page, then freeze the key. All output re-encrypts exactly. The source segmentation uses the 57 nonempty transcription records with physical p50 inserted and checks each physical page's full rune stream; split-word fragments remain at page boundaries rather than being treated as new complete source words.

| Blind plant | Runes | Key recovered | True held-out runes |
|---|---:|---:|---:|
| Authentic p57 | 95 | 7/29 | 10/42 |
| Gibran short | 78 | 12/29 | 10/26 |
| Gibran long | 266 | 29/29 | 84/84 |
| Shakespeare long | 264 | 29/29 | 80/80 |
| Emerson long | 233 | 29/29 | 70/70 |
| LP1 Koan reference | 319 | 29/29 | 97/97 |

The short-page solver is not reliably identifiable. All four long plants recover the exact nonlinear private key and all plaintext, clearing the prespecified >=90% held-out accuracy gate for long pages. Apply the frozen solver only to original long p0, p16, p40 (separated across the manuscript).

| Original page | Training lexical rune coverage | Untouched holdout lexical rune coverage |
|---|---:|---:|
| p0 | 45/183 | 3/79 |
| p16 | 46/182 | 3/85 |
| p40 | 47/160 | 0/71 |

Training can overfit recognizable words, but the independent holdouts are nonlinguistic and no original continuous prose emerges. This is a finite direct attack failure, not an exhaustive proof for all private keys or a proof against short pages. See [lexical recovery SFT](../sims/lp2_prime_totient_mtf_privatepage_lexical_sft.cjs).

## All-secret repeat gate, including authentic p56 F policy

For A, after the first access to a shifted intermediate symbol S in a reset interval, the MTF rank is exactly the count of distinct symbols since its previous occurrence. This quantity is independent of every initial alphabet. Count adjacent equal ranks only where both accesses are non-first; this is a lower bound on the original cipher's adjacent repeats under any secret initial list, even separate lists per physical page.

Test both the earlier all-consuming clock and the **actual** source-p56 rule: if P=F, S=F and do not consume a prime, otherwise S=P+k mod29 and consume a prime. Nine fixed 12,956-rune windows (beginning, midpoint, end of each repository-native Gibran, Shakespeare and Emerson stream) are overlaid on the actual source reset spans. The source's p56 authentic encryption and p57 native spelling are rechecked; for both canonical and nonlinear initial lists every non-first rank agrees exactly with the derived invariant.

| Clock | Original within-reset repeats | All-consuming native lower bounds | Authentic clear-F native lower bounds |
|---|---:|---:|---:|
| Book | 86 | 405–480 | 396–486 |
| Nine chapters | 86 | 408–453 | 392–482 |
| Physical pages | 86 | 367–415 | 368–425 |

The original has only 86 equal adjacent ciphertext symbols, all within the tested reset spans. Even granting completely independent initial alphabets, every native control produces at least 367 forced equal adjacent ranks (368 with actual clear-F). First-access ranks cannot remove these equalities. This exact invariant defeats the declared A mechanism for these finite ordinary native-prose samples, including the formerly surviving page-private variant and the source-authentic F-clock extension. A downstream value-changing anti-repeat layer or different source register is outside the model and would require its own source selection. [Repeat-bound SFT](../sims/lp2_prime_totient_mtf_repeat_allsecret_sft.cjs).

**Decision:** do not spend compute on F-mask enumeration, short-page lexical rescue or private-list optimization for this architecture without a new source-selected downstream operation that explains the repeat deficit. No unknown plaintext or authentic key recovered.


## Cumulative affine rank transport (Agent15, 26 November 2026)

The earlier A-family repeat bound leaves a specific downstream value-changing operation outside its scope: accumulate the emitted MTF rank labels as GF29 ciphertext differences. This is distinct from the 2015 participant's prime-subtract-then-difference register (whose increment is a *difference of consecutive primes*). Here the original repeat deficit motivates examining increments; native p56 supplies the consecutive prime-minus-one values and 2014 bzip2 supplies a historical MTF precedent. Their composition, affine rank label, continuous book clock and all-consuming treatment of F are exploratory, not source-authenticated. No extra pad, arbitrary per-position label or word-boundary dependence is allowed.

Let k_i=(prime[i]−1) mod29, with the first prime 2. Shift P_i to S_i=P_i+k_i mod29; encode S_i as its rank r_i in an initially secret GP29 permutation, then move S_i to the front. Let a∈{1,…,28}, b∈{0,…,28} be secret but fixed. Transmit C_i=C_(i−1)+a⁻¹(r_i−b) mod29, initially C_(−1)=0. This is a completely reversible, length-preserving changing-state sender. Unlike direct rank emission, its output equalities occur exactly when r_i=b, allowing a non-front recency rank to be the rare event.

**Exact constructive key search:** enumerate all 812 affine rank labels; compute r_i=a(C_i−C_(i−1))+b and MTF-decode with the identity initial list to an abstract tape z. For every possible original initial list there is one permutation π of those labels, with P_i=π(z_i)−k_i mod29. For each (a,b), obtain the exact global maximum native unigram objective over all 29! permutations by a maximum-weight Hungarian assignment. The scorer uses the nine pinned solved-native sections (2,979 runes, additive 0.5 smoothing). Fit on p0–39 except the first rune, freeze a,b,π, and decode p40–53. No printed segmentation or p55 scores enter the fit. This is a real key inference algorithm, not a sampling search over initial alphabets.

Three independent literary plants, drawn from the pinned Gibran/Emerson/Shakespeare sources at rune offsets 10000/15000/20000, use different nonlinear secret permutations and affine parameters. The full same-length search independently recovers each hidden affine pair and **29/29 initial alphabet entries**. It recovers **38,868/38,868 complete plaintext runes** and **9,024/9,024 withheld runes**. These are new encodings of native controls, not Cicada's historical ciphertexts.

| Input | Fitted a,b | Holdout max rune | Holdout IoC | Holdout trigram mean (nats) |
| --- | --- | ---: | ---: | ---: |
| Gibran plant | 5,7 | 336 | .058615 | −2.897452 |
| Emerson plant | 13,17 | 362 | .059907 | −2.972418 |
| Shakespeare plant | 27,24 | 380 | .060401 | −2.997095 |
| Original p0–55 | 2,12 | 130 | .034576 | −3.441502 |

The original best training fit is −3.963326 nats/rune, then −4.167002 on the withheld p40–53; the complete inverse is nonprose. All 12,956 original runes replay exactly. The 3,008 withheld original runes also admit an **exact all-key maximum-frequency obstruction**: for each affine map form W[z,k] on the held-out positions. For a target plaintext symbol t, maximizing its occurrence count over all π is the maximum perfect assignment to W[z,(x−t) mod29]. The t dependence only permutes columns, so a single assignment gives the optimum for every target. Maximizing over all 812 maps gives **231 occurrences of any one plaintext rune**, even granting a fresh independently optimized alphabet and affine pair for the entire holdout. A witness (a=7,b=4) attains 231 zeros, so this is an exact ceiling, not a bound from incomplete search. Any alternative initial ciphertext IV changes only the first decoded rank and the resulting initial list; all subsequent abstract labels differ by one permutation, already granted by π, so this holdout ceiling also covers every IV.

For comparison, exhausting every contiguous 3,008-rune window of the pinned finite native registers gives minimum maximum-rune counts of **304** (Gibran, 44,662 windows), **301** (Emerson, 303,892 windows), and **260** (Shakespeare, 214,099 windows). The original ceiling is below all 562,653 windows. Normalization is greedy GP transliteration with ING/IO, V→U, K/Q→C and Z→S; source ranges and precise normalization are in the SFT. This excludes all initial permutations and affine labels for the tested continuous consuming prime-clock architecture within that finite native-register comparison; it does not exclude F-hold semantics, arbitrary nonlinear rank labels, different clocks, or other text registers. Do not extend the composition without an independent clue.

Reproduction: [single-file CommonJS inverse](../sims/lp2_prime_shift_mtf_cumulative_affine_sft.cjs), [raw complete results and input blob IDs](lp2-prime-shift-mtf-cumulative-affine-output.json), [code/output commit](https://github.com/FlareZ123/liber-primus/commit/4bcfcf677022d8e6d2179193a8fa2aca710cd389). Core executed directly on connected V8 and exact repository inputs. The standalone Node wrapper was not separately executed. No unknown plaintext or authentic key.


## Arbitrary periodic rank permutations after MTF (Agent9, 26 November)

The cumulative affine receiver above grants a fixed affine map on ranks, not a fully nonlinear map and not a separate map per phase. The following test closes a substantially larger **finite donor comparison** without searching keys. It also examines plain MTF without a prime inner layer. Historical bzip2 supplies the MTF precedent; the genuine p56 arithmetic clock supplies the prime producer; the historical 2015 difference intermediate and LP2 repeat deficit motivate testing the accumulated rank representation. None of these sources establishes their composition in LP2.

Let S be either ordinary GP29 plaintext, its consuming prime-minus-one shifted sequence, or its exact native F-hold shifted sequence, starting at prime ordinal zero. Standard MTF encodes S in an arbitrary secret initial alphabet. For each phase j choose an arbitrary 29-permutation pi_j (not necessarily affine) and emit C_i=C_(i-1)+pi_j(rank_i) mod29. Grant independent unknown initial lists and IVs at resets. Test an additional plain-MTF direct emitter C_i=pi_j(rank_i). There are three frame models: one continuous tape; the nine original visual chapters with independent rank maps; and the same chapter resets with one shared rank map per phase. Each has an ordinary consuming **outer** phase clock, reset at the selected frame boundary. The prime clock is independently reset alongside the MTF list. This is not the earlier MTF-outer/prime-inner inverse with unmodified output ranks.

**Exact necessary conditions:** after a symbol's first access, its MTF rank is the number of distinct intervening symbols, independent of initial list. Omit every first access from the donor counts (at most 29 per reset). Let h_j(r) count the remaining donor ranks in a phase, and g_j(d) count actual ciphertext differences, discarding the first difference in every frame (unknown IV). Under any such secret permutation, zero differences must be emitted by one rank. Thus g_j(0) >= min_r h_j(r) for **every** phase, and summing those minima is a weaker necessary condition. For the plain direct/cumulative emitter, equal ranks at the same phase must give equal ciphertext symbols/differences, so sum binomial(h_j(r),2) cannot exceed the corresponding original pair count. For shared phase maps, pool corresponding phases across chapters before applying both conditions; for private maps, apply separately to each (chapter,phase). No hidden key, initial alphabet, language score or post-selected donor is required for the bounds. A donor's first access includes each segment's first rune, so the omitted IV difference does not invalidate the lower bound.

**Frozen source:** canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 12,956 runes. Reuse the same five Crowley/Blake literary windows as the [all-period phase-bijection study](lp2-allperiod-secret-phase-bijection-original-gate.md): Crowley offsets 0/4327/8655 and Blake 0/5675, with exactly the same GP transliteration and source slices. The original visual chapter convention from #2719 has physical starts 0,3,8,15,23,27,33,40,54 and end56 (offsets 0,729,1874,3603,5506,6527,7960,9640,12648,12956). This is the corrected p23–26/p27–32 visual grouping, not the legacy p23–27/p28–32 split. All frames retain 86 internal zero differences. Test q=1..256, covering historical q8/q13, GP29, and the numeric-panel size; this is a bounded exploratory period domain.

| Outer map/reset policy | Plain MTF pair gate (direct and cumulative) | Prime-consuming cumulative zero phase gate | Prime-F-hold cumulative zero phase gate |
|---|---:|---:|---:|
| Continuous | all 256 periods | 207/256; every q1–190 | 211/256; every q1–178 |
| Chapter-private | all 256 periods | 40/256; every q1–35 | 40/256; every q1–40 |
| Chapter-shared | all 256 periods | 211/256; every q1–181 | 206/256; every q1–184 |

Each pass means **all five** finite native donors violate a necessary inequality for every key in the corresponding family. These are exact enumerated period results, not universal English-language exclusions. The noncontiguous higher-period pass sets are in the raw output, not claimed as contiguous. In particular, for chapter-private q13 the aggregate minimum zero count is only 74 (consuming) or 81 (F-hold), below 86; using the sum alone would leave survivors. But every donor has at least one individual chapter/phase requiring at least **three more zero differences** than actually observed there, closing both q13 cases. Continuous q8 requires >=323/324 zero differences, q13 >=284/292, compared with 86. The plain cumulative pair lower bound exceeds the original at every tested period, with minimum excess 3,512 global, 356 private-chapter and 3,242 shared-chapter. At q256 the prime variants' phase-zero bound becomes vacuous, so no claim about them at that period.

**Calibration:** three full-length native Crowley plants with secret initial list (7i+3 mod29), independently phase-dependent nonaffine rank permutations (affine initialization plus a fixed transposition), q13, IV11, and each of the three input modes. Every non-first rank agrees with the canonical-list invariant. Inverse recovers all 38,868 ranks and intermediate runes; all planted phase-local and pair inequalities pass. The F-hold plant recovers the shifted intermediate, not a unique F-history/plaintext, which the bounds do not require. These are synthetic encodings, not unknown historical key recovery.

**Decision:** do not expand fixed or periodic arbitrary rank permutation searches for plain MTF in q1–256, or the short-period prime/MTF/cumulative branches excluded here, solely on the theory that affine labels were too restrictive. The phase-local inequality, rather than aggregate repeat count, materially narrows the chapter-private q13 family. A genuinely source-selected nonperiodic output map, longer clock, other rank transform, prime origin or language register would be a distinct premise. No unknown plaintext, key or selected receiver was recovered.

Reproduction: [read-only CommonJS SFT](../sims/lp2_mtf_rank_phase_capacity_sft.cjs), [complete 768 period/frame rows and input blob IDs](lp2-mtf-rank-phase-capacity-output.json). Exact core ran in connected V8 on pinned repository inputs; standalone Node wrapper not independently executed and no CI run claimed. Code commit 92de66fe0e59e3c4c5ba8c1472d550bede5254f1; output commit 5f4f62ae25d8a47a5360707628ff16a0b1d2bc7e.

## Reproduction

`node sims/lp2_prime_totient_mtf_assignment_original_sft.cjs` — Node22 CommonJS, no dependencies. Outputs all fitted alphabets, native controls, complete original/plant replay checks and per-segment private-key bounds. The two follow-up scripts are also standalone read-only Node22 CJS tests, run on exact repository data in the JavaScript runtime. No Windows CI execution is claimed. [Source](../sims/lp2_prime_totient_mtf_assignment_original_sft.cjs).
