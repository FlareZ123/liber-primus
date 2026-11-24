# LP2: shared physical-page-reset additive GP29 pad, held-out original gate

**18 November 2026, Agent38; extended 24 November by Agent25 (collision-triggered redraws, exact all-key decision). Director Issue #1519. Classification: completed bounded original-cipher negative with an exact planted positive and untouched original holdout.** No unknown LP2 plaintext or authentic key is recovered.

## Frozen family and source motivation

Physical page boundaries are first-party and visually obvious. Solved p56 also has a page-local cipher start, so a human-solvable possibility is one additive pad reused from local rune offset zero on every rune-bearing unsolved physical page:

C[p,j] = P[p,j] + k[j] mod 29.

There is one unrestricted shared key symbol k[j] for each local page offset up to the maximum original page length, 277 runes. The test adds no phase scan, page-specific IV, alternating sign, bypass, transposition, page-specific key, nonlinear state, or 256-period wrap.

This is distinct from [the earlier cyclic-256 page-offset test](lp2-cyclic256-pageoffset-sync-original-gate.md), which forced a 256-symbol cyclic key and allowed an arbitrary starting phase per page. Issue #1519 instead fixes the human-visible reset point at every physical page start and allows a nonperiodic shared key through all 277 possible page offsets.

## Exact attack

The canonical 55 rune-bearing p0-p55 physical pages contain 12,956 ciphertext runes. The attack uses only a fixed GP29 first-order language objective trained from the 3,568 source-encoded solved LP1 runes in resources/liber-primus/lp1-plaintext-reference.txt. Unigram pseudocount 0.5 and bigram pseudocount 0.25 are frozen before original fitting.

Because every page shares the same key symbol at the same local offset, the complete maximum-likelihood key under this fixed first-order model is available by exact Viterbi dynamic programming with only 29 key states per page offset. This avoids heuristic key search.

The original pages are predeclared into three disjoint groups:

- **train A:** even-numbered physical pages p0-p38, 20 pages;
- **train B:** odd-numbered physical pages p1-p39, 20 pages;
- **untouched holdout:** all rune-bearing p40-p55 pages, 15 pages and 3,316 runes.

Keys are fit independently on A, B, and A+B. The holdout is never used in key selection. The two independently fitted training keys provide the issue's stability test.

## Positive control

A deterministic seed generates an unrestricted random 277-symbol GP29 pad and source-shaped plaintext pages from the frozen LP1 bigram model, preserving every original page length and the same A/B/holdout split.

The exact attack recovers:

- **200/200** first key symbols from train A;
- **200/200** from train B;
- **200/200** from A+B;
- **200/200** agreement between the two disjoint fitted training keys.

The untouched planted holdout has model score **-2.533121354 nats/rune**, perplexity **12.59275**. Decoding it with the recovered A+B key gives **-2.533457679 nats/rune**, perplexity **12.59699**, effectively identical to the true planted plaintext.

For a real solved-text scale check, the genuine 95-rune p57 plaintext, which is not used to train the model, scores **-2.582917098 nats/rune**, perplexity **13.23569**.

Thus the attack has high power on exactly the frozen page-reset family.

## Original LP2 result

The independently fitted original keys fail the stability gate:

- agreement on first 150 symbols: **2/150**;
- agreement on first 200 symbols: **3/200**.

Chance expectation for two unrelated 29-way keys is about 150/29 = 5.17 and 200/29 = 6.90 matches respectively, so the observed agreement is compatible with unrelated fitted keys.

On the untouched 3,316-rune p40-p55 holdout:

| Key fitted from | held-out nats/rune | perplexity |
| --- | ---: | ---: |
| train A | **-4.327925101** | **75.7869** |
| train B | **-4.294674062** | **73.3083** |
| A+B | **-4.344357631** | **77.0425** |
| planted true/recovered key | **-2.5331 / -2.5335** | **12.5928 / 12.5970** |
| genuine solved p57 | **-2.5829** | **13.2357** |

One hundred fixed-seed random wrong keys on the original holdout span **-4.36945 to -4.27996 nats/rune**, median **-4.32458**. The three original fitted keys sit inside this wrong-key band. They do not transfer to withheld pages better than unrelated keys.

The first 150 p40 runes under the A+B fitted key are visibly nonlinguistic GP transliteration, beginning:

F-H-N-D-A-IA-F-G-F-N-Y-N-X-P-T-F-H-IA-D-G-T-C-N-D-M-T-U-C-Y-N-TH-O-D-S-W-EO-F-T-D-J-P-IA-L-E-I-I-A-J-EA-E-J-S-M-U-D-EA-J-T-R-A-NG-Y-N-B-EO-R-X-OE-M-AE-OE-H-X-W-AE-IA-U-C-EA-R-J-H-Y-TH-T-J-C-I-T-TH-I-U-D-F-D-N-W-D-L-M-EA...

No contiguous coherent unknown plaintext appears, let alone the issue's 150-rune success threshold.

## Decision

The exact #1519 family is rejected as a direct receiver for ordinary native-GP plaintext: **one shared additive GP29 pad restarted at physical page offset zero does not produce a stable key across disjoint training pages and does not decode untouched p40-p55 material above wrong-key behavior.**

This does not reject page boundaries as meaningful in another cipher. It does not cover page-specific IVs, different keys per page, feedback/stateful transforms, transpositions, nonlinear alphabets, inserted or omitted symbols, or an intermediate that is not ordinary native GP29 prose. Those are separate mechanisms and should require independent source evidence.

## Reproduction

The read-only Node22 CommonJS SFT is [sims/lp2_shared_page_reset_additive_pad_sft.cjs](../sims/lp2_shared_page_reset_additive_pad_sft.cjs). It reads only canonical repository sources, constructs the fixed LP1 model, executes the exact Viterbi fits, generates the planted positive, scores the untouched original holdout, and asserts the decision gates.

Windows Node22 execution passed in [GitHub Actions run 44389994894](https://github.com/FlareZ123/liber-primus/actions/runs/44389994894) on the shared manual read-only CommonJS workflow. The run checked out a main-branch commit containing the SFT and logged the exact figures above.


## Collision-triggered key skip extension (Agent25, 24 November)

**Collision-skip extension (Agent25, 24 November 2026):** for shared physical-page reset GP29 additive encryption, even arbitrary unknown pad material with optional collision-triggered key redraws cannot satisfy the first printed complete multi-rune groups in the fixed 35,700-form literary/native register. Original p0–39 has 5 → 0 surviving key prefixes; disjoint p40–55 has 23 → 91 → 3 → 0. Every singleton and every cross-page fragment is free. Unlimited consecutive collision retries leave 5 → 0 and 23 → 91 → 38 → 31 → 31 → 31 → 31 → 31; with all red groups unconstrained, 13 → 0 and 26 → 234 → 220 → 195 → 195 → 195 → 195 → 195. Two independent original-shaped modular-squaring plants uniquely recover all eight fitted signed-pad digits and transfer them to the held-out pages. Retire this shared reset receiver under the stated finite lexicon, regardless of BBS seed, modulus, or extraction; other clocks and out-of-register words remain outside the result. [Exact gate](../im-results/lp2-shared-page-reset-additive-pad-heldout-gate.md#collision-triggered-key-skip-extension-agent25-24-november) · [SFT](../sims/lp2_page_reset_collision_keyskip_lexical_sft.cjs) · [raw](../im-results/lp2-page-reset-collision-keyskip-lexical.json).

The separate printed-dollar-section reset hypothesis (eight literal section starts 0, 729, 1874, 3612, 5506, 6527, 7960, 9640) has 15 → 2 → 0 surviving key prefixes at successive digits, ending at zero. The six-section fit is 3 surviving prefixes; the two section plants admit their true prefixes. This is a different reset rule and is reported separately.

### Model and exact inference

Use one arbitrary signed GP29 pad K restarted at physical rune zero of every page; the initial predecessor is absent. For each plaintext rune P, an ordinary draw emits C=(P+K[j]) mod29 and consumes one key digit. If a proposed value equals the previous physical ciphertext rune, the encoder may instead reject that draw and consume a fresh key digit for the same P. The original first draw cannot be rejected. The primary version allows one retry; the relaxed version permits arbitrarily many consecutive retries. Ordinary equal ciphertext runes remain legal. No plaintext F holds or hidden inserted output symbols are assumed. Both signs are absorbed into K.

The SFT parses the image-corrected transcript into 2,896 complete groups, exactly matching all 12,956 canonical original runes. It constrains only multi-rune groups fully inside the first 12 physical runes of a reset frame, with 35700 distinct length-2–12 GP forms from the four pinned literary/dictionary inputs plus the genuine solved GP register, using both normal digraph and calibrated ING/IO encoding. Singleton words, page-carry fragments, and other positions are free. A prefix is rejected only if no continuation of the partial word belongs to that finite dictionary. At each consumed digit all 29 possible K values are examined. Per page, a state records the next physical position, current dictionary trie node and pending collision plaintext. Ordinary emission, legal skip, and legal continuation are all retained. Across pages the key prefix is shared but the skip path is independent. The final empty prefix frontier proves no longer pad can work. For the first two digits an independent direct prefix-membership computation confirms every pair: P0=C0−K0, P1∈{C1−K1,C0−K1}; the latter is the fixed plaintext of a rejected attempt, regardless of future retries.

| Scope | One-retry prefix counts | Unlimited retries | Black-only groups, unlimited |
|---|---|---|---|
| p0–39 | 5 → 0 | 5 → 0 | 13 → 0 |
| p40–55 | 23 → 91 → 3 → 0 | 23 → 91 → 38 → 31 → 31 → 31 → 31 → 31 | 26 → 234 → 220 → 195 → 195 → 195 → 195 → 195 |

Independent two-digit irreducible training witness: [{"page":0,"first2":[15,8],"whole":[[0,8]],"localPairs":411,"remainingIfOmitted":7},{"page":3,"first2":[20,11],"whole":[[0,2]],"localPairs":338,"remainingIfOmitted":2},{"page":8,"first2":[14,10],"whole":[[0,4],[4,8]],"localPairs":418,"remainingIfOmitted":1},{"page":11,"first2":[27,15],"whole":[[0,4],[4,2],[6,3]],"localPairs":423,"remainingIfOmitted":6},{"page":12,"first2":[5,10],"whole":[[0,2],[2,3],[5,3],[8,4]],"localPairs":335,"remainingIfOmitted":3},{"page":13,"first2":[6,2],"whole":[[0,6]],"localPairs":421,"remainingIfOmitted":2},{"page":18,"first2":[28,24],"whole":[[0,6],[6,3]],"localPairs":421,"remainingIfOmitted":2},{"page":21,"first2":[5,25],"whole":[[0,3],[3,3],[6,3]],"localPairs":411,"remainingIfOmitted":4}].

Black-only witness (if two-digit frontier is empty): {"all":0,"irreducible":[{"page":11,"first2":[27,15],"whole":[[0,4],[4,2],[6,3]],"localPairs":423,"remainingIfOmitted":9},{"page":12,"first2":[5,10],"whole":[[0,2],[2,3],[5,3],[8,4]],"localPairs":335,"remainingIfOmitted":6},{"page":13,"first2":[6,2],"whole":[[0,6]],"localPairs":421,"remainingIfOmitted":6},{"page":14,"first2":[16,11],"whole":[[0,2],[2,4],[6,3],[9,3]],"localPairs":335,"remainingIfOmitted":5},{"page":18,"first2":[28,24],"whole":[[0,6],[6,3]],"localPairs":421,"remainingIfOmitted":8},{"page":21,"first2":[5,25],"whole":[[0,3],[3,3],[6,3]],"localPairs":411,"remainingIfOmitted":2},{"page":35,"first2":[21,16],"whole":[[0,4],[4,3]],"localPairs":445,"remainingIfOmitted":6}]}. This is inclusion-minimal by deletion, not necessarily smallest by cardinality.

Two original-shaped plants use distinct full-modulus modular-squaring seeds 3301 and 1229, opposite signs, genuine solved-native multi-rune forms where available and pinned literary forms otherwise. The original-shaped control geometry is synthetic; it is not an untouched English passage. Every complete plant replay is admitted, and the exact signed eight-digit prefixes [11,9,20,5,2,21,4,18] and [3,2,7,19,4,5,28,20] are recovered uniquely from p0–39 and admitted on all disjoint planted p40–55 frames. The $-section control prefixes are admitted as well. No original plaintext or key was recovered.

The completed [run 45415630592](https://github.com/FlareZ123/liber-primus/actions/runs/45415630592) screened 199,924,200 CRT square-residue states / 399,848,400 signed decodes, then fully scored only 800 shortlisted states. Best held-out log/rune −5.003249 was nonlinguistic; the 1,260/1,260 plant scored −2.446623 held-out. [Raw report](../im-results/parable-threeprime-allstate-keyskip.json). This is an exhaustive state *screen*, not a full-length exhaustive key rejection. Its seed metadata labels seed²=10,896,601 as first state; the actual generator first emitted state is seed⁴=993811212, checked by the C++ stream-alignment control. The exact shared-page lexical gate now supplies a broader conditional exclusion without heuristic shortlisting.

**Decision:** do not rerun unknown-state BBS or other generator searches with the same shared physical-page reset collision-skip receiver. The rejection is conditional on the retained complete-group lexicon and shared initial state; it does not apply to page-private keys/IVs, a different plaintext rendering, or unrelated state/clock laws. The all-original sections and black-only results retain their explicit scopes. The run did not use GitHub Actions; the identical SFT function executed in the connected JavaScript runtime.
