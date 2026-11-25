# LP2: shared physical-page-reset additive GP29 pad, held-out original gate

**18 November 2026, Agent38; extended 24–25 November by Agent25 (collision-triggered redraws, exact all-key reachability decision). Director Issue #1519. Classification: completed bounded original-cipher negative with an exact planted positive and untouched original holdout.** No unknown LP2 plaintext or authentic key is recovered.

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


## Collision-triggered key skip extension (Agent25, 24–25 November)

**Shared reset with collision-triggered key skips (Agent25, 24 November):** the exact all-key lexical inverse over 35,700 length-2–12 GP forms rejects every shared signed additive pad on original p0–39 after just two consumed key digits (5 → 0 surviving prefixes), even with unlimited consecutive collision retries. All singleton and page-carry groups are unconstrained. Dropping every red-ink group still gives 13 → 0; seven black-body page openings p11/12/13/14/18/21/35 independently suffice. Disjoint p40–55 rejects the one-retry model by digit four (23 → 91 → 3 → 0). The formerly surviving 31 unlimited-retry prefixes are now proved nonaccepting by complete finite-state reachability: 354 reachable joint states, 31 self-loops, no accepting state; black-only 1,731 states, no accepting state. Allowing optional transparent F without consuming a key gives 499 and 1,836 states respectively, no accepting state, and also rejects the early p0–39 and early black-only subsets in 6 and 14 states. The eight literal dollar-delimited source sections, tested as a distinct shared-reset hypothesis, have 15 → 2 → 0 prefixes even with unlimited retries. Two original-shaped modular-squaring plants uniquely recover both eight-digit signed keys and admit all disjoint planted late pages. This is a conditional intact-group finite-lexicon exclusion, not a recovered key or plaintext. [Consolidated exact gate](../im-results/lp2-shared-page-reset-additive-pad-heldout-gate.md#collision-triggered-key-skip-extension-agent25-24-november) · [SFT](../sims/lp2_page_reset_collision_keyskip_lexical_sft.cjs) · [raw](../im-results/lp2-page-reset-collision-keyskip-lexical.json).

### Exact receiver and inference

Use one arbitrary signed GP29 pad K restarted at physical rune zero of every frame. The initial predecessor is absent. For a plaintext rune P, an ordinary draw emits C=(P+K[j]) mod29 and consumes one key digit. If the proposed value equals the preceding physical ciphertext rune, the encoder may reject that draw and consume another key digit for the same P. The first draw cannot be rejected. Equal output ciphertext runes are legal. The primary variant permits one retry, the relaxed variant arbitrarily many consecutive retries. No transparent F or other extra state is granted. Both additive signs are absorbed into K.

The image-corrected source parses to 2,896 complete groups, reproducing all 12,956 original GP29 runes. Only complete multi-rune groups entirely within the first 12 physical runes of each reset frame are constrained. The fixed 35,700-form register comprises four repository-pinned dictionary/literary sources and the genuine solved GP register, with both standard digraph and calibrated ING/IO encoding. Singleton words, crossed page fragments and unconstrained positions are free. A prefix is rejected only when no continuation belongs to that finite register. The black-only relaxation removes the lexical constraint from all groups touching red ink; their cipher positions still consume the ordinary clock.

For each successive key digit, enumerate all 29 possible values. Each frame tracks the next physical rune, the dictionary trie node, and any pending collision plaintext. The exact union of ordinary emission and legal retries is retained, independently in each frame. Shared key digits constrain the Cartesian product of frame states; an empty frame rejects that key prefix. There is no probabilistic scoring or beam pruning. At two key digits an independent direct test verifies every admissible pair: P0=C0−K0 and P1 is either C1−K1 (ordinary) or C0−K1 (a rejected collision draw). Both possibilities must match the local dictionary-prefix constraint.

| Scope | One retry: live prefixes | Unlimited: live prefixes | Unlimited, black-only |
|---|---|---|---|
| p0–39 | 5 → 0 | 5 → 0 | 13 → 0 |
| p40–55 | 23 → 91 → 3 → 0 | 23 → 91 → 38 → 31 → 31 → 31 → 31 → 31 | 26 → 234 → 220 → 195 → 195 → 195 → 195 → 195 |

An inclusion-minimal black-only witness consists of seven pages:

| Page | First two original GP indices | Length of first constrained word | Admissible local key pairs | Intersection if this page omitted |
|---|---|---:|---:|---:|
| 11 | 27,15 | 4 | 423 | 9 |
| 12 | 5,10 | 2 | 335 | 6 |
| 13 | 6,2 | 6 | 421 | 6 |
| 14 | 16,11 | 2 | 335 | 5 |
| 18 | 28,24 | 6 | 421 | 8 |
| 21 | 5,25 | 3 | 411 | 2 |
| 35 | 21,16 | 4 | 445 | 6 |

All seven 841-element masks have empty intersection. This witness is minimal by deletion, not necessarily minimum cardinality. The complete late-page reachability extension (Agent25, 25 November) replaces the earlier single-step stall check. For each page prefix maintain the full nondeterministic state set (ciphertext position, lexical trie node, pending plaintext rune or -1). The joint deterministic state is the ordered tuple of those sets, canonicalized by sorting. For each of all 29 possible next signed pad digits, advance each component; an empty component kills the edge, and a completed page is absorbing. A joint state accepts exactly when every page has at least one completed path. Deduplicate joint states across all depths, not merely one depth: the finite graph exhausts every possible finite shared pad, including indefinitely repeated rejected draws. Under optional literal F, take an epsilon closure at every visible zero with no pending plaintext, retaining both the consuming and holding paths; the visible output zero becomes the previous physical ciphertext rune. This is a relaxation, since an accepted consuming collision is also allowed by the older state transition. An empty accepting set therefore excludes the stricter collision-redraw model as well.

| Original scope | Optional F | Reachable states | Legal edges | Self-loops | Maximum shortest depth | Accepting states |
|---|---:|---:|---:|---:|---:|---:|
| p40–55 | no | 354 | 384 | 31 | 10 | 0 |
| p40–55 black-only lexical constraints | no | 1,731 | 1,927 | 195 | 11 | 0 |
| p40–55 | yes | 499 | 547 | 48 | 10 | 0 |
| p40–55 black-only | yes | 1,836 | 2,046 | 208 | 11 | 0 |
| p0–39 | yes | 6 | 5 | 0 | 1 | 0 |
| p0–39 black-only | yes | 14 | 13 | 0 | 1 | 0 |

All six graph searches exhausted before the 30,000-state guard; no depth bound was imposed. The original late-set graph's 31 depth-eight prefixes eventually enter nonaccepting self-loops rather than completing. A native five-rune positive control with exactly three consecutive collision redraws admits its eight-digit key; a four-rune native F-hold control admits its three-digit key. The earlier original-shaped 15-page plant independently admits 180/180 runes. The committed SFT's experiment body was executed against all eight original repository inputs in a JS runtime and reproduced all counts and both new positive controls. [Reachability SFT](../sims/lp2_page_reset_collision_keyskip_reachable_graph_sft.cjs) · [raw results](../im-results/lp2-page-reset-collision-keyskip-reachable-graph.json). Retire the shared physical-page reset, intact-group additive collision-only pad receiver on both independent page partitions, including optional F. This does not address H-decoy, arbitrary OOV words, different page-private keys, a distinct collision reference that ignores literal F, or non-additive receivers.

The distinct literal-dollar reset frames start at original global rune offsets 0,729,1874,3612,5506,6527,7960,9640. All eight have 15 → 2 → 0 prefixes under unlimited retries. The first six independently leave three repeated-key prefixes at digit eight, two of which are fixed-point traps; the six-frame subset alone is not excluded. The complete eight-frame exact rejection uses all sections and is not an untouched holdout.

### Transparent-F and lexical-exception extension

In the genuine solved-page convention, plaintext F appears literally and holds the key clock. On every selected page whose first two ciphertext runes are non-F, no such hold can occur before the first two key draws (the initial predecessor is absent, and the second draw either emits rune two or rejects a repeat of rune one). Allowing zero plaintext in the existing prefix masks only enlarges the feasible set. Consequently the same empty intersection over the seven black-only witness pages also excludes the common reset collision-redraw receiver **with authentic transparent-F holds**, independently of whether the later bypass updates the predecessor.

All 841 relaxed pairs on the 16 qualifying training openings require at least two distinct out-of-register complete words. Exactly eight pairs attain this prefix-only lower bound; adding the five qualifying late openings leaves only [26,7] (fails p18/37) and [27,26] (fails p13/37) at two exceptions. These are not recovered keys: at least two exceptions are necessary even before testing later runes, and the masks optimistically allow consuming plaintext F. The raw data enumerates every attaining pair and failed page. No full-word completion or actual two-exception solution is implied. This is robust to one arbitrary missing word across the selected frames, not to unrestricted spelling changes or other clocks.

### Controls

Two original-shaped synthetic plants use full-modulus modular-squaring seeds 3301 and 1229, opposite signs, actual solved GP forms where available and pinned literary forms otherwise. The model admits every full planted frame. It uniquely recovers the signed eight-digit prefixes [11,9,20,5,2,21,4,18] and [3,2,7,19,4,5,28,20] from p0–39 shapes and admits each on all independent p40–55 shapes. Section-reset controls admit the true prefixes but the first six sections leave 38 and 6 candidate prefixes, respectively. The control geometry is constructed, not untouched contiguous prose. The identical SFT function executed against the repository sources in the connected JavaScript runtime; no independent Actions run is claimed.

### Generator-specific prior

The completed [full-three-prime run 45415630592](https://github.com/FlareZ123/liber-primus/actions/runs/45415630592) screened all 199,924,200 CRT square-residue states (399,848,400 signed candidates), then fully evaluated only 800 shortlisted states. The best held-out score was −5.003249 nats/rune, nonlinguistic, versus the 1,260/1,260 planted control's −2.446623. [Raw report](../im-results/parable-threeprime-allstate-keyskip.json). The raw seed metadata labels seed²=10,896,601 as first state, but the actual first emitted state is seed⁴=993,811,212, checked by the C++ stream-alignment assertion. This is an exhaustive state screen, not an exhaustive full-length decoder. The separate all-key lexical result now retires the shared-page collision-only additive receiver without relying on language-score shortlisting.

**Decision:** retire shared physical-page-reset and literal-dollar-reset additive GP29 collision-only key redraws under the stated complete-group lexical premise, independent of generator. A different reset law, page-private IV, plaintext renderer, out-of-register words or unrelated state/encoding remains outside the proof. Do not rerun generator sweeps for this exact consumer. No unknown plaintext recovered.

## Spacing-free shared-page key recovery with one collision redraw (Agent25, 25 November)

The exact intact-group exclusions above cannot by themselves eliminate H-decoy. This distinct original-key recovery attempt drops every printed separator, retaining only physical page starts as the reset clock. For each page let its arbitrary unknown common GP29 key begin at digit zero. Plaintext F emits literal zero and consumes no key; all other runes consume k; if the additive output equals the preceding *physical* ciphertext rune, consume exactly one additional k and emit the second output even if that also repeats. Both signs are covered by arbitrary signed pad residues. This defines a deterministic reversible-forward model with latent redraw and F alignment. It neither assumes nor supplies an authenticated author operation.

The trigram model is trained on 281,914 GP29 runes from Gibran and Shakespeare (spacing removed; unigram pseudocount1, bigram backoff20, trigram backoff12). At a candidate key prefix, per-page states retain physical position, two plaintext-context runes, pending plaintext or -1 and score. Literal F is an epsilon transition; a collision creates a pending plaintext which must consume exactly one further key digit to emit the observed rune. Every possible next key digit is proposed; retain the best 32 global prefixes and four local states of each pending/nonpending class. Per-rune score is log(29 P(P_i | context)); a pending draw contributes log P until emission. Fixed-key heldout decoding removes all local beam truncation, merging only equivalent decoder state tuples, and checks exact forward replay of every returned original or planted prefix. The beam is a calibrated search, not exhaustive over every 29^40 prefix.

Use only first 64 original physical runes per page, fit 40 key digits independently on even p0–38 and odd p1–39 (20 pages each), then freeze both keys. Test on the opposite training partition and 15 disjoint late pages p40–55 (p50 is rune-free). Four controls use 20 fit and 20 withheld continuous 64-rune windows from disjoint halves of Emerson or the native solved GP corpus, with independent arbitrary hidden key streams. Their source texts are excluded from the trigram fit. Within-half sampling may overlap; these are independent hidden keys and disjoint fit/heldout source halves, not a claim of 80 mutually disjoint windows.

| Plant | Hidden key digits recovered | Withheld legal windows | Correct withheld runes | Heldout log-LR nats/rune |
|---|---:|---:|---:|---:|
| Emerson 1 | 40/40 | 20/20 | 793/797 | +0.993 |
| Native solved 1 | 40/40 | 20/20 | 786/787 | +0.864 |
| Emerson 2 | 40/40 | 20/20 | 802/802 | +0.964 |
| Native solved 2 | 40/40 | 20/20 | 789/791 | +0.837 |

The true key ranked first at all 160 search depths. The seven incorrect withheld runes also occur under the oracle true key, exposing residual alignment ambiguity rather than key error. Every reported prefix re-encrypts exactly. This is an actual hidden-key-recovery positive, not solely a synthetic round-trip.

| Original frozen key and test | Legal windows | Decoded runes | Log-LR nats/rune |
|---|---:|---:|---:|
| Even key on odd pages | 9/20 | 353 | −2.742 |
| Odd key on even pages | 7/20 | 276 | −2.942 |
| Even key on p40–55 | 7/15 | 277 | −2.841 |
| Odd key on p40–55 | 7/15 | 273 | −2.960 |

The independently fitted keys agree at 2/40 positions. Across 64 independent random late-page keys, none legally decodes all 15 windows, best legal-window count is 10, and maximum scored log-LR is −2.201; the fitted original keys have no advantage. Example original even-key late output: FIAEJRUIGPOLSPHSOTROOEDOETHJNTHRUPTLXIAEMUJMDIA. No coherent original text or authenticated key follows.

Decision: the spacing-free single-redraw shared reset receiver also fails a calibrated actual-key attack, so the intact-word dependence of the earlier exact obstruction is not the only reason to retire this simple route. Unlike the finite-state intact-group graph, the spacing-free key search is beam-limited: it is not a universal mathematical exclusion of every possible key or unlimited-redraw H-decoy variant. Other state rules, key resets, transpositions, atypical plaintext and different collision references remain open. Do not repeat this exact model without an independent clue selecting it.

[Node22 CommonJS SFT](../sims/lp2_shared_page_reset_spacingfree_keyskip1_sft.cjs) · [complete raw output including keys, depth ranks, heldout samples and 64 random key checks](../im-results/lp2-shared-page-reset-spacingfree-keyskip1.json). The committed experiment body was executed using all five live repository inputs in a JS runtime; the Node filesystem wrapper was not separately run in CI.
