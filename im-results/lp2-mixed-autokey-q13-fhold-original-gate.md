# Mixed GP29 plaintext/ciphertext-fed autokey: constructive q13 inverse

**Agent3, 24 November 2026, independent fallback after #2600/#2601.** No recovered unknown-page plaintext. Both hidden native control keys and 152 withheld runes recovered exactly. The frozen original p54–55 predictive transfer fails linguistically; the broader mathematical family is feasible and has not been excluded.

## Mechanism and why it is distinct

The independently solved LP1 ciphers supply period-13 additive state and the authentic plaintext-F hold. Earlier direct plaintext-fed and ciphertext-fed autokey attacks are separate cases, not a test of simultaneous feedback. This bounded constructive search grants both components an unknown nonzero coefficient and an arbitrary offset, with no plaintext crib or printed word boundaries. No original clue establishes this joint recurrence; the source prior is the historical additive/F clock, not the proposed joint feedback law.

For each consuming rune, with a 13-lane circular queue, C=P+K mod29 and the active lane updates as K'=aP+bC+d mod29. Plaintext F emits zero and holds the entire queue. a,b in 1..28; d in 0..28. The autonomous a+b=0 subfamily is included. The inverse is P=C-K and K'=-aK+(a+b)C+d. Under any fixed literal-F mask every current lane state is an affine function of its own unknown initial seed. Because a is nonzero, the slope never vanishes; at each consuming rune precisely one seed is forbidden by P=0. Intersect its 29-bit support exactly. Sum unigram scores of each allowed lane seed; both the marginal under uniform primer seeds and the maximum over all primers factorize. This avoids searching 29^13 primers. Exact cyclic bigram and trigram MAP then use the existing reusable solver.

## Frozen control/receiver and result

Original p54–55 has 308 runes; train only on the first232, with three ciphertext Fs (eight masks). Hold out all 76 remaining runes. Every one of 8×28×28×29=181,888 model/mask combinations is examined by exact unigram marginal; top128 receive exact bigram MAP, top12 exact trigram MAP. For each candidate, freeze all three coefficients, all13 primer runes, and the selected prefix hold mask. Exhaust every suffix F mask without changing any prefix choice. Rank suffix paths only by native trigram score; exact re-encoding required for every reported continuation. This is exact within each refined model, but **not exhaustive across all models at trigram order**.

The language model excludes both full control sections, includes seven other authentic solved sections (1,444 runes) and the first2,000 GP runes of each of three preserved English donors (Gibran, Shakespeare, Emerson). The short donor extracts include source-front matter; this is a finite scoring model, not a comprehensive natural-language guarantee.

The two independent native plants are selected only to match original prefix ciphertext-zero count3, with two actual plaintext Fs and one encrypted-to-F zero. No output language score selects the primer: deterministic lane-support DP chooses a primer that supplies that count. They are a deliberately workload-matched positive calibration, not random unconditional key recovery statistics.

| Case | Hidden (a,b,d), mask | True model ranks (uni/bi/tri) | Best possible prefix unigram/rune (all models/all primers) | Frozen suffix trigram/rune |
| --- | --- | --- | ---: | ---: |
| Native KOAN1, offset0 | (13,7,2),5 | 1/1/1 | -2.8909413010 | -2.4128472363 |
| Native LOSS OF DIVINITY, offset25 | (28,5,11),6 | 1/1/1 | -2.9789502389 | -2.8412028812 |
| Original p54–55 | unknown | N/A | -3.2572265177 | -5.6094143807 (best of six legal candidates) |

Both best controls recover the exact 13/13 primer, exact 232/232 training runes and exact 76/76 withheld runes; full 308/308 replay. All 181,888 models have some legal original prefix primer, so no general algebraic contradiction. Six of twelve frozen original candidates have a legal full continuation. The best prefix trigram total is -975.6752473059 (a,b,d)=(13,28,7), mask5; its suffix has three legal paths and the best remains nonprose. Its rendered prefix starts ONRPTPCTWEWYWHESJTHANGMITMTHETONGIAHUCELIOXSCLFORBY and the chosen suffix begins NGOERTLXDOENCSIAWREFTOEECTHESEEOFIOELBLCTEOBIADRLLPOEW. These are optimizer outputs, not recovered words.

**Decision:** retire this bounded q13 p54–55 ranked-search prediction; preserve exact per-lane all-primer method for independently selected receivers. The lower all-model unigram maximum is useful finite-LM evidence, not an exclusion of all prose or all mixed-autokey keys. No retuning against this holdout.

[Runnable CommonJS SFT](../sims/lp2_mixed_autokey_q13_fhold_sft.cjs). Directly executed locally in Node22 against source-derived encoded data with all FNV input checks matching repository retrieval; re-run from repository root for full JSON. Local canonical source files were unavailable to shell due DNS restriction; normalized input was transferred from the GitHub tool and checked against independently computed FNV values. No CI run claimed. Ranker was not adapted after original scoring.

## Independent lag-eight algebraic word-anchor inverse (14:56Z)

This is a different attack on the same recurrence. A candidate native GP29 word with at least 11 consuming runes gives at least three equations
`a P[i-8]+b C[i-8]+d=C[i]-P[i]` on the consuming tape. Subtract the first equation to eliminate d, solve the resulting two-variable system over GF29, enumerate its complete affine solution set if rank-deficient, and retain only nonzero a,b. The first eight consuming C−P values are the incoming queue; exact forward and backward recurrences then decode the adjacent tape. A zero ciphertext may be a held F or a consuming symbol. No printed word boundaries enter the adjacent-window scoring.

Vocabulary: 38,906 GP spellings, from the preserved TextBlob lexicon with native digraph variants and five native sections outside the four target controls. All four complete control sections are excluded from the language model and native vocabulary injection; train on 610 other native runes plus 6,000 donor runes. For each complete printed group with ≥11 nonzero ciphertext runes, examine every compatible dictionary spelling and every exact coefficient solution. Fit up to 48 physical runes on each side, then freeze the best path and decode 76 untouched runes on the longer available side. A three-rune group crossing the p33→p34 boundary is clipped only for context and is ineligible as an anchor; all source chapter rune tapes replay exactly. The original q8 assumption and intact anchor vocabulary are conditional, not source-authenticated.

### Control decision and separate support test

Seven eligible-size native control anchors across WELCOME, KOAN1, LOSS and second KOAN. Three genuine spellings are outside the vocabulary; all four in-vocabulary anchors yield exactly one correct coefficient/word combination. The fitted best model recovers all four correct triples and **304/304 held-out runes**, but fits 106/108, 64/68, 79/79 and 109/109 runes. The original predeclared strict perfect-fit gate therefore fails (2/4). The original strict mode stops before testing LP2; see [strict output](lp2-mixed-autokey-q8-algebraic-anchor-output.json).

A separate exact-support follow-up admits original anchor tests only on the algebraic criterion that every in-vocabulary native control's true model survives uniquely for its true spelling (4/4). This criterion was chosen after observing the strict fit failure, but before any original support-mode output, and does not rely on language scores. No strict predictive calibration is claimed. There are 43 original eligible anchors across all nine visual chapters; 33,431 word/triple combinations have exact anchor support, 4,997 also have at least one valid local fit, and six anchors have no legal local fit at all. Three long groups have **no dictionary word or feedback triple** even with arbitrary incoming queue:

| Chapter opening | Physical chapter offset (0-based) | Runes / nonzero | Exact supported word/triples |
| --- | ---: | ---: | ---: |
| p8 | 1531 | 14/14 | 0 |
| p23 | 529 | 14/13 | 0 |
| p40 | 813 | 14/12 | 0 |

Thus every such continuous q8 model requires at least these three anchors to be outside this finite vocabulary (or the groups are not plaintext words). This is a local necessary condition independent of the all-primer rank search, not an all-language exclusion. Of four original anchors with unique word/triple support, two cannot continue through the local fit, the p54 offset255 candidate COUNTERACTION has no legal frozen continuation, and the p40 offset2644 candidate TRANSCRIPTION produces nonprose at −6.0170 nats/rune. Across all 43 fit-selected candidates, eight admit the 76-rune continuation; best −5.2138 compared to the four true native anchor controls' −2.3720, −2.7323, −3.0378 and −2.3914. These original scores are diagnostic only because the strict calibration failed. No authentic plaintext.

[Reproducer](../sims/lp2_mixed_autokey_q8_algebraic_anchor_sft.cjs) (default strict mode; argument `support` for the separately defined support gate). [Per-anchor support output](lp2-mixed-autokey-q8-algebraic-anchor-support-output.json). Directly executed against GitHub-fetched canonical inputs in connected JS; no CI run claimed.

## Lag-thirteen exact adjacent-word projection join (15:01Z)

A single native group rarely has enough consuming symbols to identify three q13 feedback coefficients. Join two adjacent complete printed groups, allowing all 38,906 dictionary spellings, all compatible F masks, all nonzero a,b and all d. For consuming lag relations, write

`a P_s + P_t + b C_s + d = C_t`, with t=s+13.

Subtract the first relation to remove d. For fixed a, let V1 and V2 be the additive contributions of the two candidate words to the remaining difference vector, B the observed previous-C difference vector and D the observed current-C difference vector. Then V1+V2+bB=D. For nonzero B choose a nonzero pivot B_h and project every row via B_h V_i−B_i V_h, eliminating b. Hash exact projected word signatures; the other word's complementary signature locates all matching pairs. Recover b from the pivot and d from the first relation; when B=0, use the full signature and enumerate all 28 nonzero b. Word groups are separately partitioned by compatible literal-F masks. This is an exact join over all coefficient triples and dictionary pairs, not a sampled pair search. Three deterministic small Cartesian comparisons pass, including zero masks and degenerate B.

For each original chapter select the adjacent complete pair with maximum guaranteed consuming count (both groups ≥5), then longest total physical length, then earliest. Selection does not use language scores or cipher values other than the nonzero count. Exact support counts are uncapped. Local fit and frozen 76-rune prediction use the previous ±48-rune window and are performed only when ≤2,048 supported models; this cap was fixed before original support. Six in-vocabulary native/donor control pairs retain their exact true word/triple, including three whose support exceeds the fitting cap. Native-only fit calibration initially had just one eligible pair (LOSS OF DIVINITY CIRCUMFERENCE PRACTICES, unique support, 76/76 holdout) and correctly stopped original fitting. Two subsequent independent workload-matched plants use the first qualifying in-vocabulary ≥20-consuming plaintext pair after GP rune2300 in Shakespeare and Emerson (donor training only first2000). Their windows are [28761,29109) and [2945,3297), both disjoint from training; fixed independent coefficients/keys, no original scoring used. They both recover the exact pair/triple and fit (117/117 and116/116), and both predict 76/76 withheld. The resulting pre-existing prediction gate passes **3/3, 228/228**, with native/donor suffix scores −2.8844/−2.6811/−2.5091.

| Chapter | Pair offset | Word lengths | Guaranteed consuming | All supported word/triples | Local fit-legal models | Best fit path's frozen holdout |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| p0 | 645 | 8+9 | 17 | 750605 | cap | untested |
| p3 | 678 | 9+10 | 18 | 1170 | 52 | impossible |
| p8 | 1001 | 11+13 | 22 | 0 | 0 | impossible |
| p15 | 159 | 13+8 | 21 | 0 | 0 | impossible |
| p23 | 529 | 14+7 | 20 | 0 | 0 | impossible |
| p27 | 180 | 10+10 | 20 | 16 | 3 | impossible |
| p34 | 1141 | 12+8 | 20 | 7 | 0 | impossible |
| p40 | 1689 | 12+7 | 19 | 255 | 42 | impossible |
| p54 | 255 | 13+6 | 17 | 169 | 13 | impossible |

The p8,p15,p23 anchor pairs have no legal dictionary pair/triple even before adjacent decoding. p34 has seven anchor supports but none traverses both surrounding fit windows, regardless of F mask. This closes the stated finite intact-pair vocabulary model there, not all mixed-feedback laws. Other tested top-fit paths die on the disjoint holdout; this does not exclude lower-scoring paths. p0's support-only result is not a prediction failure. The additional donor controls were selected after observing the native-only calibration insufficiency and exact original support counts, but prior to original continuation scoring; they did not alter the original anchor selection, fit cap, model, LM or ranking.

[Reproducer](../sims/lp2_mixed_autokey_q13_pair_anchor_join_sft.cjs) · [full output](lp2-mixed-autokey-q13-pair-anchor-join-output.json). Executed in connected JS on canonical repository inputs; no CI claim.

## Exact complete-chapter exclusion with intact lexical anchors (15:10Z)
The pair join is followed by exact concrete queue reachability on both sides of each anchor. A ciphertext zero branches into literal F hold and consuming nonzero plaintext if legal. Only failed states are memoized; no language ranking is used. Per-side cap 2,000,000 transitions; no cap hit in the original tests. All three calibrated high-information controls have full legal paths (not necessarily uniquely correct plaintext). Across p3, p27, p34, p40 and p54, all 1,617 supported word-pair/coefficient models die before completing the chapter (1170, 16, 7, 255, 169 respectively). p8, p15, p23 already had zero support.

The primary opening p0–2 pair (offset 645, lengths 8+9) admits 750,605 local models. All are streamed through an exact ring queue implementation, cross-checked against the array implementation on six native positive/perturbed cases. Complete 729-rune paths exist for 8,817 models; every returned witness was re-encrypted exactly. A second complete disjoint pair, chosen by the same strongest-guaranteed-consuming/longest/earliest criterion to the left (offsets 568 length 7 and 575 length 10), is then required to belong to the same finite vocabulary on the **same path**. No candidate survives.

| a | Primary support | Complete single-pair models | Both-pair models | Caps |
|---|---:|---:|---:|---:|
| 1–7 | 189716 | 2220 | 0 | 0 |
| 8–14 | 182736 | 2231 | 0 | 0 |
| 15–21 | 189474 | 2223 | 0 | 0 |
| 22–28 | 188679 | 2143 | 0 | 0 |
| Total | 750605 | 8817 | 0 | 0 |

Positive secondary lexical check: native LOSS OF DIVINITY plant, late anchor j175 offset717, required two earlier groups at offsets18 and31 (lengths13,9). Exact reverse traversal 4,877 visits, recovered CIRCUMFERENCE PRACTICES, full witness re-encryption 755/755. This is a support control, not independent plaintext prediction. The secondary constraint was introduced after seeing that the single-pair p0 model admits arbitrary nonprose full paths; the source-only choice of the secondary pair precedes its testing.

**Scope:** for each of the nine visual chapters, the continuous lag-13 recurrence with nonzero a,b, arbitrary d and arbitrary initial queue is incompatible with the indicated intact dictionary pair(s). This does not exclude altered segmentation, unknown words, discontinuous state or a different recurrence. Native controls demonstrate real out-of-vocabulary limitations. No original plaintext or source-selected key has been recovered.

Reproducer: `node sims/lp2_mixed_autokey_q13_pair_anchor_join_sft.cjs` (eight chapter reachability results and calibration); `lex-control` for the secondary positive control; `p0full:1-7`, `p0full:8-14`, `p0full:15-21`, `p0full:22-28` for exhaustive opening partitions. First-partition secondary filtering also reproduced with `p0secondary` using stored primary witnesses. Outputs in im-results/lp2-mixed-autokey-q13-pair-anchor-join-output.json and lp2-mixed-autokey-q13-p0-{full,secondary}-a*.json. Direct connected JS execution, no CI.

## Spacing-free all-chapter ranked scan (15:11Z)
A complementary run removes the intact-word assumptions entirely. On the 308-rune prefix of each of the nine chapters, enumerate every compatible F mask on the first 232 runes and every nonzero a,b and arbitrary d for q=8 and q=13. The exact all-key unigram marginal/upper bound is calculated by independent affine seed lanes; only mathematically safe pruning relative to the exact top-128 marginal cutoff is used (conservative 1e-9 slack). The top128 receive exact cyclic bigram MAP; top12 receive exact trigram MAP. Freeze coefficients, mask and initial queue, then decode the remaining 76 original runes with all legal continuations. This is an exhaustive marginal ranking, **not** an exhaustive trigram ranking over all models.

Workload-matched native controls: low8 (3 ciphertext zeros) and high8 (12) recover exact model, queue and 308/308 plaintext at ranks 1/1/1; high13 (12 zeros) ranks true model 1/1/2 and recovers exact queue and 308/308 on its second trigram candidate. Its first trigram candidate has the same queue, a different F mask, 231/232 correct fit and no legal 76-rune continuation. Thus the top12 shortlist has 3/3 exact independent control models; strict rank-one trigram selection has 2/3. The two native passages are reused across distinct plants, not three independent language samples.

All 17 new original probes finished successfully locally (Node22), **321,759,872** coefficient/mask models; adding the prior q13 p54 baseline gives 321,941,760. All have at least one legal prefix seed assignment. None produces sustained language in the 76-rune holdout. The best original suffix is -4.859027942 (q13 p34), vs -2.740763680 worst exact matched control. Its rendering is XPEDSUUTHBNGYNEEATHOGMNLSPERGBNPANSDIADMCISAOEUTHAMDSRUTOEEOTHYTHAUUIONECTUIAEGOEWNGJRBOA. The maximum possible unigram mean across all original seed keys ranges from -3.430415248 to -3.215041252, below both distinct native passages' true means. Unigram bounds are statistical comparisons, not plaintext impossibility.

[Per-chapter exact ranking and shortlist summary](lp2-mixed-autokey-chapter-scan-summary.json). [Generalized scanner](../sims/lp2_mixed_autokey_chapter_scan_sft.cjs); [shared exact baseline](../sims/lp2_mixed_autokey_q13_fhold_sft.cjs). Reproduce with `node sims/lp2_mixed_autokey_chapter_scan_sft.cjs` and the individual case arguments documented in the script. Source arrays were transferred from authenticated repository reads into the local runtime and their FNV values checked. The full 19-job scheduler returned exit status 0 for every job; low8 was an earlier separate job. No CI run claimed. No source-selected mixed-feedback law or recovered original plaintext.
