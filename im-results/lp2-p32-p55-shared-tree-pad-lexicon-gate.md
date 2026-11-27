# Source-linked p32/p55 tree: exact shared-pad affine inverse and lexical obstruction

**Current decision, 27 November 2026 (Agents9, 45 and19).** Original p32 and p55 reuse the same tree artwork, independently motivating the comparison. The strongest tested word-preserving native GP29 model allows **any nonzero affine multiplier on each page, any relative page shift, and an unrestricted common additive pad at every consumed position**. All **93** ordinary contiguous placements and **5,952** historical literal-F placements fail a complete joint lexical inverse. The earlier unit-multiplier additive exclusions below remain special cases. Distinct bitwise-XOR common-pad families (all 32 index masks or 128 chart-prime masks, both clocks) also have zero complete lexical assignments; see Agent6 below. A different three-page common affine map with both coefficients changing independently at each rune is feasible but grossly nonidentifying: millions of exact dictionary-compatible original assignments remain even if one fitted tape is fixed. No unknown manuscript plaintext, genuine key or first-party shared-pad instruction was recovered.

## Three-page artwork-linked, spacing-free shared-pad inverse (Agent19, 26 November)

P32/p55 share the tree motif, and p53/p55 independently share the moth motif. These page associations motivate, but do not authenticate, a single three-way shared additive pad. Unlike a two-text cancellation, observing two independent differences at each position constrains the same hidden native plaintext symbol three times. This is an actual joint plaintext recovery attempt under a new three-page coupling, not a re-test of the existing strict two-page word-overlap gate.

Freeze p55's entire 76-rune tape (including its carry); compare every full contiguous placement in p32 (121 runes, 46 starts) and p53 (179 runes, 104 starts). With all-consuming GP29, C32[a+i]=P32[i]+K[i], C53[b+i]=P53[i]+K[i], C55[i]=P55[i]+K[i] modulo29. The two differences determine P32/P53 given P55; K is arbitrary at every position. No original punctuation or word lengths enter. No F bypass, page-constant relative shift, different alphabet, reverse traversal or noncontiguous overlap is allowed.

An exact scaled forward HMM marginalizes all 29 hidden P55 symbols at each step; an order-2 state gives the exact trigram marginal. On the first 48 positions rank all 4,784 placements by the bigram marginal, then rerank a fixed top shortlist by the exact trigram marginal. Freeze the winner before scoring its 28 remaining differences. A fixed-alignment Viterbi inverse reconstructs all three tapes and K and asserts every original paired symbol. Initial pilot (Shakespeare training prefix plus solved-native) found the true alignment rank 4 in one control. A first frozen 64-shortlist/three-rune MAP version achieved 3/4 correct placements but passed the combined 70%-recovery and positive-withheld-gain gate only 2/4; no original data were scored. [First SFT](../sims/lp2_p32_p53_p55_triple_pad_sft.cjs) · [first controls](lp2-p32-p53-p55-triple-pad-output.json).

One independent stronger variant uses 374,413 GP training runes (first 65% of pinned Shakespeare, Gibran, Emerson plus solved-native sections other than p57 PARABLE), a fixed 256-placement trigram shortlist, and an exact tetragram Viterbi with 29^3 states. Each of four fresh independent seeded plants draws three 76-rune windows from the later 70–95% of the three literary tapes, uses a hidden random common additive pad, and random unrelated flanks matching the original length geometry. Calibration is fixed: at least 3/4 plants must select both true offsets, recover at least 54/76 pad symbols and have positive heldout marginal gain relative to uniform independent GP29 differences. Control plaintext is genuine literary slices, not lexicon mosaics.

| Case | True placement rank, bigram→trigram | Correct common pad symbols | Prefix / withheld gain, nats/position |
|---|---:|---:|---:|
| Control 0 | 1→1 | 63/76 | +0.411632 / +0.312741 |
| Control 1 | 7→1 | 61/76 | +0.244490 / +0.000703 |
| Control 2 | 23→1 | 72/76 | +0.346076 / −0.007045 |
| Control 3 | 3→1 | 70/76 | +0.237778 / +0.418824 |
| Original | selected offsets 3,65 (zero-based) | unknown | +0.138652 / **−0.166789** |

The combined gate passes 3/4, all four hidden alignments are correct, and 266/304 pad symbols (87.5%) recover. Each recovered pad symbol gives all three plaintext runes correctly. Apply the frozen receiver to the original; its prefix-best placement is p32 offset3, p53 offset65. Both scores fall below all four true controls. The complete original MAP score is −549.797758; the three outputs are incoherent despite exact forward replay. Examples of incidental words are optimizer effects, not recovered plaintext.

**Decision:** no usable plaintext or shared pad under the three-artwork-linked, all-consuming equal-additive, contiguous forward-placement receiver. The four controls are a small diagnostic, not a universal probability bound. The trigram selection is exact only within its fixed shortlist and the full MAP is exact only conditional on the selected placement. No claim of exhaustive all-offset trigram rejection, or rejection of differently shifted/clocked/noncontiguous/non-additive pads. The two motifs do not imply shared cryptographic state, and no new source selector justifies expanding arbitrary variants.

[Final read-only SFT](../sims/lp2_p32_p53_p55_triple_pad_tetragram_sft.cjs), [control 0](lp2-p32-p53-p55-triple-pad-tetragram-control0.json), [control 1](lp2-p32-p53-p55-triple-pad-tetragram-control1.json), [control 2](lp2-p32-p53-p55-triple-pad-tetragram-control2.json), [control 3](lp2-p32-p53-p55-triple-pad-tetragram-control3.json), [original](lp2-p32-p53-p55-triple-pad-tetragram-original.json). Run the SFT separately with argument 0,1,2,3; only after passing the stated gate run with argument `original`. The exported core ran in connected V8. A combined multi-control computation timed out; separate controls and original completed. A transient commit conflict on original output was retried successfully. No separate standalone Node or CI run.

### Authentic literal-F clock at the three physical starts (Agent19)

The known historical F-transparent clock is a materially distinct receiver from the preceding all-consuming alignment. Freeze the first 76 physical runes of p32 and p53 and all 76 p55 runes; the respective original visible-F counts are 3,2,3. For every one of the 256 hold-mask triples, independently compress each tape's consuming clock. At shared pad index t, P_j=(C_j−K_t) mod29 must be nonzero on every still-active tape, while held physical zero runes emit plaintext F and consume no key. A tape that has exhausted its consuming positions imposes no further constraint. Integrate the 29 key choices with an exact first-order Markov forward algorithm, including leading/intervening/trailing Fs. Sum the likelihoods across all masks; divide by the product of the exact independent-pad marginals to form a shared-versus-independent log Bayes factor. No word-boundary assumption.

A first-order MAP pilot distinguishes its shared/independent plant (+7.528/−2.894 total logBF) but recovers only 25/74 common key symbols, with the true hold mask third by marginal likelihood. A distinct fixed stronger receiver keeps the top eight masks by the exact first-order marginal and computes an exact conditional trigram MAP over the last two common key symbols, accounting for the true physical F history on each tape. Compare MAP joint scores across these eight; replay each output. The higher-order mask shortlist is bounded and need not contain the true mask. The BF itself remains exact for the stated first-order model.

Six fresh disjoint-training literary plants have the same physical lengths and exact visible-F counts as original, and each is paired with an independent-pad rival with the same plaintexts and counts. Use the 374,413-rune language register from the preceding test. The gate is 5/6 positive full BFs, 5/6 negative independent BFs, and at least 4/6 positives with at least 70% common-key recovery. Score full76 and first48 separately; full minus prefix BF is a withheld conditional log likelihood ratio.

| Control | Recovered common key | Shared full logBF | Independent full logBF | Shared withheld increment |
|---|---:|---:|---:|---:|
| 0 | 48/75 | +6.211119 | −9.031781 | +2.195678 |
| 1 | 61/74 | +4.729604 | −12.209324 | +1.517034 |
| 2 | 49/74 | +4.175044 | −7.189142 | +3.152644 |
| 3 | 56/73 | +14.684794 | −12.631285 | +3.819103 |
| 4 | 65/73 | +12.455113 | −4.285131 | +4.585745 |
| 5 | 66/73 | +4.513350 | −1.300448 | +0.542756 |
| Original | unknown | +0.368861 | n/a | **−1.665246** |

The gate passes (6/6 positive, 6/6 negative, 4/6 recovery threshold); 345/442 common pad symbols are recovered across plants. All six true shared-pad controls show positive withheld increments; the original first48 BF +2.034107 falls to +0.368861 on full76. The original's selected trigram hold mask is p32 offset42, p53 none, p55 offsets15/25. Its three exact-replaying candidate texts are incoherent. The small positive full BF alone is not a decipherment: it falls below every matched positive, and the continuation moves against the shared model.

**Decision:** no predictive or readable recovery for the fixed physical-start, F-transparent, equal-additive three-pad receiver. This is a calibrated finite diagnostic, not an all-alignment or all-key-family impossibility theorem. The BF assumes uniform independent consuming pad symbols and the fitted first-order language law; conditioned visible-F count controls reduce but do not eliminate model mismatch. No unknown plaintext or key. The complete longer p32/p53 tails remain outside the 76-rune overlap.

[Pilot SFT](../sims/lp2_p32_p53_p55_triple_pad_latent_f_sft.cjs) · [pilot raw](lp2-p32-p53-p55-triple-pad-latent-f-control0.json) · [final SFT](../sims/lp2_p32_p53_p55_triple_pad_latent_f_trigram_sft.cjs) · [control 0](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control0.json) · [control 1](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control1.json) · [control 2](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control2.json) · [control 3](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control3.json) · [control 4](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control4.json) · [control 5](lp2-p32-p53-p55-triple-pad-latent-f-trigram-control5.json) · [original raw](lp2-p32-p53-p55-triple-pad-latent-f-trigram-original.json). Run final SFT separately with argument 0–5, then `original` only after passing the gate. Executed directly in connected V8; standalone Node/CI not separately run.

### All-offset literal-F receiver: three independently gated compiled attempts (Agent19, 27 November)

The fixed-start diagnostic does not exclude other contiguous placements. The following three distinct unknown-offset receivers were compiled with the existing read-only C++17 manual workflow. All 4,784 placements are enumerated at the first-order stage. A trie of held-F group histories shares exactly identical consuming prefixes across the complete latent mask domain; each leaf is one mask triple and its conditional key likelihood is integrated over all 29 key values. Compared with the fixed-start inverse, this is a computational extension, not a new first-party clue. At the original 48-rune prefix geometry there are 1,433,048 mask/placement combinations (count only). Each control uses disjoint-training literary slices, random unrelated flanks and identical original full-tape visible-F counts; its independent-pad rival preserves plaintext, flank and counts.

| Receiver | Fresh pairs | True offsets | Positive criterion | Negative criterion | Key recovery gate | Original |
|---|---:|---:|---:|---:|---:|---|
| Exact first48 all-mask selector, held28 | 4 | 2/4 | 3/4 positive conditional continuation | 4/4 nonpositive continuation | not reached | unopened |
| Exact full76 all-mask selector and average of per-window likelihood ratios | 8 | 5/8 | 4/8 positive log-average ratio | 7/8 nonpositive | not reached | unopened |
| Full76 first-order all-offset shortlist64, trigram top16 masks, conditional exact MAP | 6 | 4/6 | 4/6 positive truncated log-average ratio | 6/6 nonpositive | 1/6 at least 70% common-pad recovery | unopened |

Frozen gates were respectively (3,3,3)/4; (6,6,6)/8; and (5,5,5,4)/6. The first selector's true ranks were 1,1336,1,2. The second's were 1,1,47,52,1,10,1,1. The third's true bigram ranks were 176,3,2,3,1,1, with true trigram ranks outside shortlist,4,1,1,1,1. The first two compiled runs integrate 2,502,496 and 21,116,576 control mask triples, respectively. The third's shortlisted full-window exact trigram MAP recovers only 56/75,45/74,52/75,40/73 key values on correctly aligned controls. The higher-order stage is not an exhaustive all-offset or all-mask trigram search.

**Interpretation:** failure of blind alignment/recovery calibration, not a rejection of the original at unknown offsets. No original likelihood or MAP was scored by these three receivers; their control maxima cannot be promoted into a decipherment. The full-window average is a log average of per-window shared/independent likelihood ratios (and the field `best_posterior` is the normalized share of those ratios), not a generative full-page Bayes factor unless a common outside-window likelihood is specified. The third receiver sums only the selected placement/mask contributions, so its average is truncated; its normalized shortlist mass is not an exact full-domain posterior. No additional arbitrary phase or language-model retuning justified by this route. The fixed-start and all-consuming negatives above are still valid within their stated calibration limits.

- [Prefix SFT](../sims/lp2_triple_latent_f_offset_sft.cpp) · [fixtures](lp2-triple-latent-f-offset-fixtures.json) · [raw](lp2-triple-latent-f-offset-output.json) · [successful CI 45914082826](https://github.com/FlareZ123/liber-primus/actions/runs/45914082826).
- [Full-window SFT](../sims/lp2_triple_latent_f_full_offset_sft.cpp) · [fixtures](lp2-triple-latent-f-full-offset-fixtures.json) · [raw](lp2-triple-latent-f-full-offset-output.json) · [successful CI 45914267041](https://github.com/FlareZ123/liber-primus/actions/runs/45914267041).
- [Higher-order SFT](../sims/lp2_triple_latent_f_trigram_offset_sft.cpp) · [fixtures](lp2-triple-latent-f-trigram-offset-fixtures.json) · [raw](lp2-triple-latent-f-trigram-offset-output.json) · [successful CI 45914597296](https://github.com/FlareZ123/liber-primus/actions/runs/45914597296).

The term "successful CI" describes execution of the frozen tests, not a successful cryptanalytic gate.

### Arbitrarily changing affine common key: constructive nonidentifiability (Agent19, 27 November)

The earlier page-private constant-multiplier plus arbitrary additive-pad model is not the same as a shared changing affine map. For the independently artwork-linked p32/p53/p55, freeze **the final 76 physical runes of each page**, ordinary consuming clock, unchanged printed groups, with a free incoming p55 singleton and dictionary-compatible suffixes of clipped incoming p32/p53 words. At each position let C_k = a_i P_k + b_i in GF29, where a_i is nonzero and both coefficients vary without constraint. Two distinct ciphertext points determine the third plaintext point once the first two plaintext points are nominated: P_z = P_x + ((C_z-C_x)/(C_y-C_x))(P_y-P_x). Coincident ciphertext points require coincident plaintext points, and noncoincident points require noncoincident plaintext. At all 76 original positions at least two ciphertext points differ. Thus before language constraints there are exactly 812^76 distinct possible three-tape plaintext assignments. Artwork links the pages, not this operator or its clock.

A three-trie beam receiver (width256, sqrt-frequency unigram word weights, 40,751 GP word spellings including solved native words) was calibrated against two independent triples of actual solved passages, each with hidden changing nonzero multiplier and offset. Both lost the true path at position1; one ran out of surviving prefixes at position45, the other recovered only 7/10/16 of 76 runes, with a wrong full assignment scoring -293.513824 versus authentic -316.127161. Hence widening the beam cannot make this fixed objective prefer truth in that control. Original scoring was not opened. [Beam SFT](../sims/lp2_tree_moth_triple_affine_trie_sft.cjs) · [beam output](lp2-tree-moth-triple-affine-trie-output.json). A native exact trie-state pilot hit a million-state or history cap; a separate V8 word-constraint attempt timed out, neither supplies an exclusion.

**Constructive hard-constraint inverse.** Use the original printed group boundaries as variables and each contiguous three-word overlap as a factor. Project each finite word domain to that interval; join two projected words through the exact affine relation, taking special care of equal ciphertext points, and retain precisely the supported projections in all three domains. Requeue affected factors. Search the remaining domains with exact forward replay. This is sound arc consistency and bounded backtracking, not a claim of complete enumeration. Both actual solved controls retained their true assignments under root propagation and yielded two alternative dictionary-compatible, nonprose witnesses. The original root still has 134,700 of 136,095 initial candidate entries across 50 variables, **zero forced words**. Minimum-domain-first search timed out; length-weighted log-domain branching found two distinct complete assignments in 31 visits and 50 branches, each replaying all **228/228** original ciphertext runes with a valid shared affine key at every position. Both are nonprose and neither is a decryption. No score-based claims were made from these witnesses.

**Exact ambiguity even given one complete plaintext track.** Fix any one tape from the first original witness, or one actual true native tape from either control. At each position the other two tapes have unary equality/inequality conditions relative to the fixed point; if both ciphertext points differ from it, their plaintext values are related by an invertible affine map. The two remaining printed-word interval partitions form a forest of pairwise overlaps. Exact signature-join count messages sum all supported word assignments in each component, multiply across components, and count distinct rune tapes (not alternative keys or prose interpretations). Clipped suffixes are deduplicated.

| Case | Fix track A | Fix track B | Fix track C |
|---|---:|---:|---:|
| Native control WELCOME / DIVINITY / PARABLE, true fixed tape | 1,126,737 | 12,938,904 | 30,001,296,192 |
| Independent native control WARNING / WISDOM / KOAN, true fixed tape | 34,488,990,000 | 26,628,776,916,698,880 | 8,577,414 |
| Original p32 / p53 / p55, fixed first fitted witness (not truth) | 39,833,856 | 2,304,000 | 1,113,840 |

The original counts are separate conditional lower bounds on the entire unconstrained triple model, **not additive**. They do not imply that any of these dictionaries-only alternatives is genuine language. The controls prove the same failure of identification even with one authentic known plaintext tape and exact native word divisions. At each position two independently known distinct plaintext points would identify the two affine coefficients; one known point still leaves 28 possibilities.

**Decision:** retire the unstructured changing affine common-key receiver as a key-identification mechanism. It is compatible with the original ciphertext, not statistically or mathematically excluded, but cannot select plaintext from its huge exact witness set. A new source-derived schedule fixing at least one affine degree of freedom and independent continuation evidence are required before returning to this family. No new plaintext or authentic key.

Reproduce from the repository root (Node and C++17, Python 3):
```sh
node sims/lp2_tree_moth_triple_affine_gac_input.cjs > input.txt
g++ -O3 -std=c++17 sims/lp2_tree_moth_triple_affine_gac.cpp -o affine-gac
./affine-gac 0 10000 2000 0 < input.txt
./affine-gac 1 12000 2000 0 < input.txt
./affine-gac 2 20000 100000 1 < input.txt > original.log
python sims/lp2_tree_moth_triple_affine_conditional_count.py input.txt original.log
```
The original witness log and count summary are [here](lp2-tree-moth-triple-affine-gac-original.log) and [here](lp2-tree-moth-triple-affine-gac-summary.json). The C++ and Python programs actually ran locally; the canonical repository-derived input builder ran in connected V8 and matched the local 448,746-byte input's FNV64 fingerprint 9cc5ae8c77fb2b88. No standalone CI run is claimed. The input builder and native solver share the finite register used in the beam calibration, including the positive-control words; this intentionally grants lexical coverage and does not simulate a blind language model.

## Distinct bitwise XOR shared-pad inverse (Agent6, 24 November 2026)

The historical XOR operation is a separate hypothesis from GF(29) addition and multiplication. Grant any position-dependent five-bit common pad K and any page-constant relative XOR mask s in 0..31: C_A=P_A XOR K, C_B=P_B XOR K XOR s. Both emitted plaintext and ciphertext symbols must be GP29 indices 0..28. Cancel K, so P_A XOR P_B=C_A XOR C_B XOR s. Exact relative-XOR word-overlap signatures provide a 32-bit candidate set; a complete forest CSP then requires shared word assignments across all overlaps, including one-rune overlaps. No key-stream family is assumed.

| Clock | Placements | Relative mask/placement pairs | Locally surviving pairs | Fully consistent pairs |
|---|---:|---:|---:|---:|
| Ordinary | 93 | 2,976 | 0 | 0 |
| Literal-F (64 feasible mask pairs) | 5,952 | 190,464 | 8 | 0 |

For direct equal-pad s=0, an exact wildcard-word DP across **all 93 ordinary placements**, without the strict local prefilter, requires at least four dictionary exceptions. Histogram for minima 4/5/6/7/8 is 2/43/40/6/2. The two minimum placements represent the same overlap up to the carried rune; p55 reads `U FLAP THE THE PIERRE ASIATIC BE BRAOEFGPXGJEOTH GARLIC COOL THE BETWEEN DFHEAHNY SNG HOURRA EARN OUT`. This is an incoherent constructed assignment, not a decipherment, despite exact replay of 76 paired positions. The wildcard optimum is not asserted for latent-F or nonzero relative masks.

Six dictionary-slot plants retain their true states and match 65–73 paired plaintext runes. Adding the four missing known p57 forms PARABLE, INSTAR, TUNNELNG, CIRCUMFERENCES leaves **all original counts and wildcard minima unchanged**. Two further coherent source plants (normalized LP1 WARNING reference and exact solved p57, with vocabulary supplied but no ordered crib, true alignment/mask supplied) replay all 95 ordinary and 92 consumed literal-F pairs; arbitrary compatible assignments match 63/95 and 56/92, with 57 and 48 positions forced respectively. This validates feasibility and illustrates limited identifiability, not blind alignment recovery. The finite dictionary assumption and source word boundaries remain important; the artwork identifies pages, not an authorial XOR instruction. No historical key or original plaintext recovered.

Reproduce: `node sims/lp2_p32_p55_xor_sharedpad_exact_sft.cjs` and add `--native` for the known-vocabulary sensitivity. [Baseline raw](lp2-p32-p55-xor-sharedpad-exact.json), [native raw](lp2-p32-p55-xor-sharedpad-native.json). Both executed in connected JS against repository inputs; no CI execution asserted.

### Literal Gematria prime-value XOR

Instead of XORing the rune indices, use the printed GP chart's distinct prime values 2–109, with an arbitrary seven-bit common XOR pad and all 128 constant relative masks. The exact overlap-signature/forest solver (including length-one overlaps) with the four added native p57 forms finds **zero local survivors** among 11,904 ordinary and 761,856 literal-F mask/placement combinations. Six dictionary-slot plants retain their true states, matching 68–75 paired runes; known WARNING/PARABLE plants with vocabulary supplied match 82/95 and 74/92, of which 74 and 67 are forced. True alignment and F masks are supplied on these lexical controls. [SFT](../sims/lp2_p32_p55_prime_xor_sharedpad_exact_sft.cjs) · [raw output](lp2-p32-p55-prime-xor-sharedpad-exact.json).

A spacing-free direct-XOR trigram decoder marginalizes legal prime-value partners and corrects for the number of legal pairs (uniform pad conditioned on both outputs being legal). All four Gibran/Emerson planted offsets are recovered by the prefix-only 48-rune selector, but MAP recoveries are only 22, 16, 17 and 17 of 76 paired runes. The frozen calibration gate (at least three correct offsets and three half-plaintext recoveries) fails; the original is deliberately unscored in this version. [SFT](../sims/lp2_p32_p55_prime_xor_spacingfree_sft.cjs) · [raw output](lp2-p32-p55-prime-xor-spacingfree.json). This is a separate finite intact-word rejection and a failed spacing-free decoder calibration, not a general rejection of XOR or a new plaintext claim. Connected JS execution only.

A separate word-aware spacing-free inverse improves recovery by replacing the independent trigram MAP step with a probabilistic two-trie beam over all GP word boundaries (30,263 word forms, 269,751 trie nodes, beam 4096; frequency lexicon plus Shakespeare, no target vocabulary injection). Both tapes allow partial initial and final words. The four same Gibran/Emerson controls at their known alignments recover **67, 42, 60 and 59 of 76** paired runes (228/304), exceeding the frozen gate of three plants recovering at least half. The original then uses the prior frozen 48-rune trigram selector: offset **1**, prefix/continuation scores −6.934/−6.888, margin 3.492. The trie output is incoherent (`WILSON MAN H YOUR WOE WE IN UP IT B F HIM FEWER WRENCH ...` / `DINNG HUGE LEAD THY LEFT BLEW BUT TRUTHFUL BEEN APT CLASPNG ...`) despite exact 76-pair replay. Joint log score −378.832, versus −295.263 to −241.080 on the four controls. The beam is approximate and the recovered control wording contains orientation swaps and other errors; this is a bounded predictive failure, not exact rejection of all possible altered boundaries. No plaintext or key claim. [Word-trie SFT](../sims/lp2_p32_p55_prime_xor_word_trie_sft.cjs) · [raw output](lp2-p32-p55-prime-xor-word-trie.json). Retire this equal-pad branch pending an independent source-selected operation.

### Changed-word-boundary sensitivity (ordinary direct XOR)

A spacing-free forward marginal sums every GP29 pair compatible with each XOR difference, under two independently generated add-0.25 trigram sources trained on the repository Shakespeare tape (217,106 runes). Rank all 46 complete p55 placements on the first 48 paired differences, freeze the winning offset, and evaluate its 28 withheld differences by conditional likelihood. Exact Viterbi reconstructs the best pair on that alignment, with no word segmentation assumption.

Original offset3 wins by only 0.132 total log units; prefix and withheld log likelihood per paired difference are -3.415 and -3.543. Four matched-marginal shuffled controls produce similarly word-like gibberish and heldout scores -3.463, -3.458, -3.466, -3.645. Crucially, four coherent source controls (independent Gibran/Emerson slices, valid conditioned shared XOR keys) recover the correct alignment only **1/4**; true ranks 1/9/8/3. Even the correctly aligned plant recovers only 16/76 paired rune values under Viterbi. The original best sequences contain apparent English fragments but no coherent passage. This model is insufficiently calibrated to rule out changed segmentation or identify plaintext; **do not interpret those fragments as evidence of a decipherment**. [Reproducer](../sims/lp2_p32_p55_xor_spacingfree_sft.cjs), [raw outputs](lp2-p32-p55-xor-spacingfree.json). Connected JS executed; no CI claim.

## Complete affine shared-pad recovery (Agent45)

The distinct extension of the earlier cancellation attack grants

```
C32[i] = a * P32[i] + K[t] + s32  (mod 29)
C55[j] = b * P55[j] + K[t] + s55  (mod 29)
D[t]   = C32[i] - C55[j] = a*P32[i] - b*P55[j] + s  (mod 29)
s      = s32 - s55
```

for every nonzero a,b in GF(29), all 29 s, and an entirely unknown arbitrary shared pad K. This covers 28²×29 = 22,736 affine states per placement, including opposite-sign and distinct-slope page registers. Test the complete original 121/76-rune sources under an all-consuming rune clock and independently under every lexically possible historical plaintext-F bypass mask. Both p32 and p55 begin with a physically carried single-rune fragment; the final full solver grants any allowed GP29 value for these fragments. The p55 leading fragment is included or omitted from the shared clock; all full contiguous overlaps are tried without selecting offset19. Each fully printed word remains a word from the pinned 29,154-entry native-GP lexicon. The artwork selects the page pair, but no source authenticates this affine or shared-pad architecture.

**Constructive inverse.** For each overlapping pair of printed words, take differences relative to the first overlapping rune. For every candidate A-word and nonzero a, normalize the vector a·ΔP32−ΔD by its first nonzero component. Index B-word vectors ΔP55 by the same projective representation; any match determines b from the ratio of those components. The all-zero case grants every nonzero b. The first overlap rune then fixes s. Intersect 29-bit masks for all (a,b) across overlapping word pairs of length ≥3. This exhausts the affine parameters without guessing pad symbols.

Crucially, passing this necessary condition does not prove a common plaintext pair: individual overlaps may select incompatible versions of the same word. Construct the complete bipartite graph of both interval partitions of the shared clock, including overlaps of length one or two. It is a forest: moving along the common clock starts at least one previously unseen word at each new edge. The implementation asserts acyclicity for every tested candidate. For fixed a,b,s, an A-word and B-word are adjacent-compatible iff their overlap signatures a·P32+s−D and b·P55 agree. Exact leaf-to-root domain reduction followed by root-to-leaf assignments either rejects the state or constructs both dictionary passages and a common pad. Every produced witness must forward-replay all original aligned runes. This is complete for the declared finite dictionary/word-boundary model, with no stochastic beam, independent word-fit error or language-score threshold.

| Clock | Placements | Placements passing individual overlaps | Affine state/placement pairs passing individual overlaps | Complete jointly consistent states |
|---|---:|---:|---:|---:|
| All-consuming (any GP29 plaintext glyph) | 93 | 8 | 156 | **0** |
| Literal-F bypass, all 64 lexically possible mask pairs | 5,952 | 112 | 1,592 | **0** |

The joint state space comprises **137,439,120** candidate state/placement pairs before necessary-condition pruning (6,045×22,736). The 1,748 locally admissible states all fail exact joint consistency. No original plaintext was reconstructed, including the earlier postselected offset19.

**Positive controls.** Eight independently planted native-dictionary word-slot pairs use distinct non-unit affine multipliers, nonconstant quadratic common pads, arbitrary page shifts, different placements, and both clock models. Their exact true affine states survive the projective stage (seven unique, one has an extra candidate) and the complete forest solver uniquely identifies the true affine state **8/8**. The solver constructs full overlapping word assignments and replays both ciphertext tapes; arbitrary first-compatible dictionary assignments match 62–75 of 73–76 true pad positions per plant (not complete pad recovery, because short word overlaps can remain ambiguous). These are synthetic dictionary-slot controls, not coherent held-out prose, and they establish the exact constraint mechanism's functionality rather than historical cipher use.

[Read-only Node/CommonJS reproducer](../sims/lp2_p32_p55_allaffine_sharedpad_recovery_sft.cjs), executed directly in the invocation's JavaScript runtime on the unchanged canonical corpus, transcript and dictionary. Pinned code commit [be6f04f0](https://github.com/FlareZ123/liber-primus/commit/be6f04f0d218fa0c3fca6a1f626c643875aa785b).

**Actual soft-lexicon recovery attempt (Agent45).** To test whether a few unusual words alone explain the strict failure, the same forest was solved with a wildcard option at every complete-word vertex. For each of the **156 all-consuming states surviving the earlier local hard-lexicon filter**, an exact weighted tree dynamic program minimizes the number of wildcard words first, then the within-length log-frequency penalty of remaining dictionary words. Wildcard letters are derived from the opposite word where possible; both-wildcard positions remain undetermined. This is a constructive plaintext attack, not a global OOV exclusion: states rejected by the initial hard filter have not been searched under the relaxed vocabulary.

| Minimum wildcard words | States |
|---:|---:|
| 3 | 4 |
| 4 | 98 |
| 5 | 54 |

The best state under that objective has offset45, a=17, b=24, s=10 and three wildcard words, and reconstructs all 76 aligned positions. Its p55 reading is `T CALL THE THE CRASNOE BLUSHNG AM NGBNEOTHPAAEROXJR DINNER WHAT THE ALTHOUGH CAUTERY PO THEODORE LOI WAY`. The paired p32 reading is also incoherent. Exact forward replay here establishes compatibility with an arbitrary fitted pad, not historical plaintext. The four minimum-wildcard states represent two distinct solutions duplicated by inclusion/omission of the carried fragment. No natural-language passage or genuine key emerges. The dynamic-programming implementation is included in the same reproducer at [75848e9b](https://github.com/FlareZ123/liber-primus/commit/75848e9bbce3de5b8a4bd4c9ec75452490fc1c5e).

**Scope and decision.** Retire the whole contiguous, equal-pad, fixed per-page affine-register family for word-preserving native-English plaintext in this finite vocabulary. An out-of-vocabulary word, independently chosen nonaffine page alphabets, changed segmentation, unequal key-consumption laws, noncontiguous pairing or a different encryption architecture can escape the exclusion. It is not a proof that the artwork is irrelevant or that two independent plaintexts cannot be recovered by some other means. Revisit only with a new source-selected operation, not another affine slope/shift or offset search.

## Unit-multiplier additive special case (Agent9, 16 November 2026)

## Exact historically grounded model

Physical p32 / original scan49.jpg has **121 GP runes and 22 printed word fragments**. Physical p55 / original scan72.jpg has **76 GP runes and 17 fragments**, whose first single rune was carried from p54. Original GP-rune F ciphertext sites in the two pages respectively occur at zero-based positions **[29,30,42,114]** and **[15,25,41]**.

Solved p56 demonstrates that a **plaintext F** may be copied as ciphertext F **without consuming a key symbol**. A ciphertext F may alternatively have been produced by ordinary encryption of a non-F plaintext glyph, consuming a key symbol. Thus every one of the four plus three original ciphertext Fs has two possible meanings. Enumerate all **2^7 = 128** selections of literal F sites, with no possibility to skip any non-F ciphertext. A **literal** site fixes plaintext F; every other site must have **non-F** plaintext.

For each page, remove only the hypothesized literal-F sites from its **key-consumption clock**. The resulting stream is tested with the historical additive GP29 encoder:

- For non-F plaintext at consumed-clock position i: C = P + K[i] + s_page (mod29).
- For literal F plaintext: C = 0, the common K clock does not advance.
- K[i] may be a **completely arbitrary secret value** at each clock position, reused between these two pages.
- An additional arbitrary page-static Caesar shift is allowed on each page, with only their relative value relevant. Every **29** relative shift is covered.
- For p55, allow either the entire 76-rune printed physical stream or a clock beginning **after** its carried first rune. In each treatment, place the complete shortened p55 consumed stream at **every available offset** within shortened p32. The placements include the earlier suggested physical p32 offset19, though the F masks make the corresponding clock offset a model choice.

All **29,154** available source-native English GP dictionary entries are preserved under the original **22 and 17 printed fragments**, with standard K→C, V→U, Z→S, QU→CW, ING→NG and IO→IA normalization. Every word candidate must have plaintext F at exactly the selected literal sites, and nowhere else. This is a **finite vocabulary assumption**; original headings, non-English texts, rare proper names or changing word breaks may evade it.

For each pair of source printed words that share **three or more consumed-clock positions**, cancel the unknown K exactly. If C_A−C_B = P_A−P_B+s, then relative GP differences require

(P_B[k]−P_B[0]) = (P_A[k]−P_A[0]) − ((C_A[k]−C_B[k])−(C_A[0]−C_B[0])) mod29.

Index every eligible complete p55 dictionary word by this key-independent relative difference, match against every complete p32 dictionary word, derive all possible s from its first rune, and intersect the 29-element s sets across independent word overlaps. If any overlap cannot realize the remaining s under any secret key, the model is impossible for that placement. No language-model maximization, chosen crib, arbitrary common key, or secret shift is fitted to the unknown plaintext.

## Unmodified original result

All **128** F assignments are visited. Eight of the sixteen p32 masks permit any full native-English words at the relevant lengths; eight of eight p55 masks do. P32 literal-F assignment at physical index42 is incompatible with every dictionary word of its original 11-rune printed word (a testable register-specific local exclusion). Therefore **64** mask pairs proceed to all consumed-clock placements. The complete enumeration covers **5,952** mask/clock/first-fragment configurations. **Zero** retain even one possible relative shift.

The first necessary-condition contradiction for each configuration uses an original matched word-pair length as follows:

| Number of matched consumed rune positions in the contradictory overlap | Placements |
| ---: | ---: |
| 4 | 80 |
| 5 | 406 |
| 6 | 1,162 |
| 7 | 1,680 |
| 8 | 1,216 |
| 9 | 832 |
| 10 | 256 |
| 11 | 320 |
| **All** | **5,952** |

In particular, allowing no F bypass still fails at p32 **offset19**, whether p55 first rune is included or omitted, on six matched-rune word overlaps. Earlier direct no-F analysis separately confirmed **all 93** physical contiguous alignments fail.

The full input/result and per-configuration word-pair consistency are asserted by the **new read-only Node22/CommonJS reproducer** [F-transparent all-mask gate](../sims/lp2_p32_p55_ftransparent_sharedpad_allmask_sft.cjs). It consumes exact canonical GP29 indices and original word punctuation, never writes external bytes, and prints source assertions and contradiction distributions.

## Decoder power and boundary of exclusion

The exact experiment also plants **eight distinct native-English original-word-length plaintext pairs** with actual transparent-F omissions, covering no-F, single/multiple-F combinations, both first-fragment conventions, and several key-clock placements. It encrypts the two streams under one **nonconstant, arbitrary GP29 shared key** and independent page offsets **13 and 21**, verifies all **197 planted source runes** under their true keys, and checks that the same key-blind source-dictionary gate retains the correct relative shift **21**. Key values are picked independently of unknown LP2 ciphertext to keep every nonliteral ciphertext glyph distinct from F; thus the planted literal masks are exactly observable to the gate.

This verifies that the original impossibility is not a misaligned F-clock implementation or a finite dictionary algorithm incapable of recognizing its own architecture. A reader must still keep the result conditional: Cicada did not command reuse of a GP29 pad across these pictures or instruct the solver to preserve encrypted word boundaries. The exact conclusion concerns **contiguous additive shared keys under historically attested F transparency and native-English word divisions only**. It does not exclude other clocks, nonadditive ciphers, altered word division, text compression, unknown languages, independently encrypted pages, external keys, or other source-selected transformations.

**Decision:** retire this complete art-selected same-additive-pad family under unchanged native-English words. Its prior postselected p32 offset19 index-of-coincidence peak is no evidence of actual plaintext within this more historically faithful model. The required next new input is an original authorial instruction or recoverable key that identifies an alternative decoding operation, or genuine unknown-page plaintext suitable for an independent holdout.

## Earlier all-consuming special case and historical evidence

**Earlier all-consuming source-only subset (93 alignments).** The same underlying DeadTree artwork appears in original LP2 physical pages p32 (blurred) and p55 (fine pale linework), providing an independent visual reason to compare the two ciphertext streams. Across **all 93** possible contiguous overlap placements and the two natural treatments of p55's carried first rune, **none** admits full source-native English dictionary words under a single reused additive GP29 pad plus an arbitrary constant relative page shift. No unknown-page plaintext, genuine key or historical encryption operation is recovered.

## Model and original source

- P32: 121 exact original GP29 ciphertext runes, 22 original printed words, scan 49.jpg.
- P55: 76 exact original GP29 ciphertext runes, 17 printed word fragments, scan 72.jpg. Its initial single rune completes a word begun on p54; the test admits that rune in the pad clock (skip0), or discards it before alignment (skip1).
- Place the 76-rune p55 source stream at every available offset 0..45 in p32. For skip1, place its 75-rune remaining stream at every offset 0..46. This is **46+47=93** complete placements, without a ciphertext-selected preferred offset.
- The model is C32=P32+K+s32 and C55=P55+K+s55 modulo29. The reused K may vary arbitrarily at every aligned rune position, so the test knows **none** of its entries. The unknown relative page shift s=s32-s55 is tested exhaustively for all 29 values and must be shared by every overlap. Subtraction removes K and yields C32-C55=P32-P55+s.
- The unchanged original printed rune-word lengths and page boundaries must remain plaintext word boundaries. The lexicon is the repository-pinned TextBlob/Norvig English frequency word list, all 29,154 GP-encodable entries. It applies historically attested ING/IO contractions and the documented conventional GP spelling substitutions.
- For every overlap of three or more runes between two printed words, form the exact ciphertext difference and ask whether *any* two full dictionary words of those original word lengths satisfy it for a given s. Intersect the permitted shift sets across every overlap in decreasing overlap length. An empty intersection is a necessary-condition contradiction independent of K.

The cross-artwork clue selects the **page pair**, though no creator instruction identifies an additive pad, reusable key, offset, or unchanged word segmentation. The all-offset test deliberately grants the conjecture every contiguous clock placement, avoiding selection of the earlier visually suggestive offset19 after seeing an index-of-coincidence peak.

## Original result and decisive cases

**All 93 alignments reject every relative shift.** The first contradiction is witnessed by a printed-word overlap of four to eleven GP runes in every case. Breakdown of first contradictory overlap lengths:

| GP rune overlap | Alignments eliminated |
| ---: | ---: |
| 4 | 2 |
| 5 | 6 |
| 6 | 17 |
| 7 | 24 |
| 8 | 20 |
| 9 | 14 |
| 10 | 4 |
| 11 | 6 |
| **Total** | **93** |

At the prior postselected offset19, with p55 initial rune included, the p32 word7 against p55 word5 overlap has six rune positions beginning at p32 offset34. **None of the 29 shifts allows any full dictionary word pair.** With the first carried rune skipped, the p32 word7/p55 word5 six-rune overlap initially leaves shift18 only; a second six-rune overlap, p32 word8/p55 word7 at p32 offset44, removes that shift. The earlier source-natural alignments at offset0/skip0 and offset0/skip1 also fail, consistent with the original narrower report.

The complete experiment is reproduced by the same consolidated source test, [lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs](../sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs). It verifies exact original page indices and printing, enumerates all 93 offsets and shifts, checks each contradiction, and logs the source-indexed offset19 witnesses.

## Decoder power and scope

An exact synthetic plant uses every original printed word length, selects actual pinned-dictionary GP English words, and encrypts both streams under a nonconstant **common quadratic pad K(i)=(7i²+11i+3) mod29** with independent page offsets13 and21. For **all 93** alignments, the unchanged scanner retains the true relative shift21 and the known synthetic decoder recovers every planted overlapping rune. The original failures therefore do not arise from an off-by-one alignment, an incomplete shift search, or an implementation unable to recognize its proposed architecture.

This rules out **direct English-GP text with unchanged printed word divisions under a contiguous reused additive pad and a single relative page offset**, at every possible placement for this original-image-selected page pair. It cannot reject altered plaintext segmentation, intermediate non-English registers, non-additive/stateful mechanisms, independent pads, secret alphabet permutations or rearranged rune orders. Dictionary coverage is a stated finite condition: a rare word or invented proper name outside the 29,154-entry list could evade a particular overlap. The original imagery does not supply a shared-pad instruction.

**Research decision:** retire the entire finite contiguous placement branch for this directly word-preserving English model. The earlier offset19 differential's anomalous index of coincidence cannot supply an authentic plaintext under that model. Resume only if an independent first-party source identifies a different decoder or a key that changes the assumptions.

## Distinct multiplicative shared-pad inverse (Agent19, 24 November)

The same artwork motivates an unrestricted shared nonzero GF29 multiplier rather than the additive affine pad above. For paired C_A=k P_A and C_B=k P_B, plaintext F=0 iff ciphertext F=0; at two nonzero sites P_A/C_A=P_B/C_B. At a single zero site the other track may choose any native nonzero symbol; two zeros impose no pad constraint. Test both all-consuming and literal-F-holding clocks (F positions exactly known), all contiguous full p55 placements in p32, including or omitting p55's carried leading rune, and arbitrary values at both incoming fragments. The 42,468-spelling native lexicon is the frozen #2602 baseline, including its orthographic variants; no expanded swaps. Every word domain matches its exact F pattern. Exact minimum-OOV forest DP runs on **every** multiplicative alignment, with one wildcard per full word granting arbitrary consistent rune values and secondary within-domain word-frequency cost. Nonzero-ratio overlap signatures permit exact min-cost messages between disjoint word-interval vertices; chosen witnesses construct a shared pad and forward replay every paired original rune.

| Clock | Alignments | All-lexical witnesses | Exact minimum OOV words | Histogram OOV 4/5/6/7/8 |
|---|---:|---:|---:|---|
| All consuming | 93 | 0 | 4 | 2/21/56/12/2 |
| All F holds | 91 | 0 | 4 | 2/21/50/14/4 |

Lowest-cost minimum-OOV consuming placement offset23 (24 when the leading carried p55 rune is omitted), wildcards A7, B7, B8, A13. The p55 witness reads `M ABLY CNG AM UNITED FRENCH THE YEFANCSNGMRBJEO DPRCDF ENUY RIA OCCIPUT NATASHA EX BELLYS BAN BENG`; paired p32 also nonprose. Hold placements require four OOV groups. Fitted witnesses, not plaintext.

Positive calibration: actual WELCOME 35-word prefix (125 runes) and full PARABLE (95 runes), three Fs each, encrypted at offset9 with changing nonzero quadratic shared pad. Exact solver recovers zero OOV, coherent native paired plaintext and **95/95 and 92/92 planted pad positions** under consuming/holding clocks respectively, with exact paired replay. Uses known native sections in frozen dictionary; validates inversion, not out-of-sample language performance or universal identifiability. Same passages in both trials. Artwork identifies page pair, not authenticated multiplication instruction. Retire direct multiplicative family under intact groups and declared register; changed segmentation, distinct power maps and noncontiguous pairing outside scope. Wikimedia DeadTree.jpg actual bytes remain inaccessible and the comparison untested, not a mismatch.

[SFT](../sims/lp2_p32_p55_multiplicative_sharedpad_sft.cjs) · [all outputs](lp2-p32-p55-multiplicative-sharedpad-output.json). Connected JS execution completed, no CI claim. Remote write failed/conflicted after the longer positive control, then preserved by atomic checkpoint retry.

## Independent invertible power registers (Agent19, 24 November)

The nonzero GP29 group has order 28 and primitive root 2. Grant each page an independent invertible exponent (12 choices each), an arbitrary relative phase (28 choices), and an unrestricted common nonzero multiplicative pad. Discrete logarithms turn the shared-pad constraint into an exact linear relation modulo 28. Differential word-overlap signature joins prune the 144 exponent pairs and 28-bit phase masks, followed by exact hard lexical forest inference and paired forward replay. The fixed domain is the same 42,468-spelling native lexicon, preserving each word's exact F pattern and granting arbitrary carried fragments. All 184 complete contiguous alignments under the two clocks and two carry conventions are included: **741,888 register/placement combinations, zero local survivors, zero full witnesses**. Both WELCOME/PARABLE plants with hidden register (3,5,7) recover that register uniquely and all 95/92 shared-pad positions, respectively. These reuse the known passages in the dictionary; no blind original key, original prose, or new historical selector was recovered. Historical DH motivates a test of power maps, not an authenticated instruction to apply them here. Retire this finite intact-word family; no further arbitrary group-map enumeration is warranted.

[SFT](../sims/lp2_p32_p55_power_sharedpad_sft.cjs) · [raw output](lp2-p32-p55-power-sharedpad-output.json).
