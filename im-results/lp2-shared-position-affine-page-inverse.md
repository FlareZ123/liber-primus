# Shared-position affine page inverse (Agent 46)

## Decision and model

The previously tested additive reset at the seven-tree page starts is generalized to an independently unknown invertible affine map at each position, shared by the aligned pages:
`P[j,t] = (a[t] C[j,t] + b[t]) mod 29`, with a in 1..28, b in 0..28. All 812 maps are represented. This is distinct from page-specific constant affine alphabets plus a common additive pad. Repeated tree artwork motivates the seven-page alignment, not the affine operation or reset itself. The all-page extension below is an independently unsupported generalization used to establish an identifiable receiver. Printed word divisions are not presumed in the language receiver.

## Seven tree pages: failed identification, not an exclusion

Physical pages 8..14, 137 runes per page, first six fit, seventh held. The exact 812-state Markov forward/Viterbi receiver uses 2,979 solved GP runes with source-section transitions excluded and keeps the test donor sections out of training. Plant 0 (seed 461101) recovered only 8/137 exact maps, 96/822 fit runes, 11/137 held runes. Fit marginal LLR 0.044052, conditional held LLR 0.035121, fit MAP LLR 1.055453, held MAP LLR -1.425090 (nats/rune relative to uniform). Other exact HMM cases, including original, were not run because identification failed. Reproducer: [exact HMM](../sims/lp2_tree7_shared_position_affine_exact_sft.cjs), commit 094d89bcc3f3934ec0d5fef79b27dc85d81232fc.

An independent intact-printed-word receiver uses arc consistency on all 812 maps per column and 33,394 dictionary GP forms (TextBlob plus solved forms, all singleton runes permitted; incomplete words ignored). Two native plants retained the true maps, but neither had a uniquely identified column or word, with mean domains 567.802920 and 548.197080. Original: 194 complete fit words, mean map domain 563.481752, no unique maps or words, no disjoint contradictory cores against a 9-word OOV allowance. The original is only arc-consistent, not demonstrated globally satisfiable. Plants use a vocabulary containing their donor words, but no donor word order. Reproducer: [lexical AC](../sims/lp2_tree7_shared_position_affine_lexical_sft.cjs), commit ad6f1582efce9131b85ecaede3ff3bf0fd10469a.

## All-page receiver: calibrated blind recovery

Use all 49 original physical pages below 56 with at least 150 runes; first 150 positions. Fit 36 pages; hold every fourth page index in the sorted eligible list starting with index 0 (13 pages). Train unigram (0.5 pseudo-count) and shrinkage-8 bigram models on the 2,979 solved GP runes, respecting section breaks. At each position, integrate all 812 affine maps under a uniform independent prior for the fit marginal and conditional holdout unigram likelihood. Rank the 812 maps on fit unigram score; retain the top 16 and perform exact bigram Viterbi over those domains, using fit data only. Freeze before held evaluation. Replay every rune under the inverse of the selected map. This is a finite shortlist receiver, not exhaustive bigram optimization over all 812 maps.

Three independent native-orthography literary controls use 49 disjoint consecutive 150-rune windows per donor with seeds 461250..461252, none of the donor passages in the solved-GP language model. All maps recovered exactly, and every held rune recovered.

| Case | Fit marginal unigram LLR | Held conditional unigram LLR | Fit MAP bigram LLR | Held MAP bigram LLR | Exact maps | Held runes |
|---|---:|---:|---:|---:|---:|---:|
| Gibran (offset 21788) | .200742 | .359473 | .651038 | .648844 | 150/150 | 1950/1950 |
| Shakespeare (150528) | .182319 | .348679 | .504934 | .462171 | 150/150 | 1950/1950 |
| Emerson (180866) | .214483 | .388577 | .584696 | .551784 | 150/150 | 1950/1950 |
| Original | -.195376 | -.339367 | -.487036 | -1.597110 | unknown | nonprose |

Plant unigram MAP alone found 143, 140, 145 exact maps respectively; all true maps were in every top-16 shortlist. All-page original fit pages: 1,2,3,5,6,7,9,10,11,13,15,16,18,19,20,23,24,25,27,28,29,31,33,34,36,37,38,40,41,42,44,45,46,48,52,53. Held: 0,4,8,12,17,21,26,30,35,39,43,47,54. Original held page 0 begins AE C D OE Y F Y AE S G H F U O M P OE N C B OE NG Y E C S W Y M EO W D J Y S S, not plaintext.

Twelve matched nulls independently permute the 29 ciphertext labels at each column, sharing the permutation across the 49 rows. They preserve column equality partitions, not affine-specific invariants or sequential ciphertext statistics. Fit marginal range [-.200512,-.183562]; conditional held unigram [-.402015,-.341227]; held MAP bigram [-1.781730,-1.531670]. Original marginal held unigram is slightly above all 12 nulls, weak rank evidence (add-one upper tail 1/13), but strongly negative and far from all three native controls. Held MAP bigram is inside the null range, two nulls higher (add-one 3/13). No recovered authentic map or plaintext. [Raw nulls](lp2-allpage-shared-position-affine-equality-nulls.json).

Reproducer: [all-page SFT](../sims/lp2_allpage_shared_position_affine_blind_sft.cjs), commit 60d214a3584db87e7473ef810864d0a7832c753a. Executed all three plants, original, and 12 nulls via connected V8 with read-only Node module stubs; no CI claim. Original marginal exactly integrates the finite per-column iid affine prior; the Markov MAP is restricted to 16 maps per column. This negative retires the calibrated all-page, common position-affine native-prose receiver, not every possible affine architecture, and does not resolve the seven-tree-only model. Do not retune the alignment on these same held pages. A new source-selected clock or independent key information is required for narrower-group inversion.
