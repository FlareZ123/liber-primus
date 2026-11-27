# Fixed disjoint-image GP29 class-rank feedback (#3134)

**Decision:** retire this compact exploratory law. It is a genuinely reversible low-repeat sender, but all 32,400 keys were fitted on each original prefix and its frozen continuation is nonlinguistic. Its key-independent decoded class tape is also atypical of all nine solved-native sections. No source-selected branch operation, authentic key or unknown plaintext.

## Exact law and independent premise

Reuse the literal vowel-label membership of #2625 (not a new optimized linguistic partition): V=[1,3,10,12,18,24,25,26,28], in canonical GP index order; C is the complement. This is the prior operational chart-label convention, **not** a claim that OE and IA are linguistically consonants. Let G_b be its two rank lists (sizes 9 and 20), b=0 for V, b=1 for C, r(P) the within-list rank, and q the previous plaintext class. Initialize q=1 and c_prev=0 at each interval start. Four independent rotations k[q,b] have domains 9,20,9,20.

Sender:
- d = (0 if b=0 else 9) + ((r(P) - k[q,b]) mod |G_b|)
- c = (c_prev + d) mod29
- advance q=b, c_prev=c.

Receiver:
- d=(c-c_prev) mod29;
- b=0 iff d<9; otherwise b=1;
- P=G_b[(d-(0 if b=0 else 9)+k[q,b]) mod |G_b|];
- advance the same public state.

The images of the branches partition GF29 into contiguous difference intervals of sizes 9 and 20. Therefore every output identifies its branch before decoding, no rejection coins, latent sidecar, lost symbols or secret branch flags. The script checks every p, prior c and q, and every local pair of rotations: 10,440 complete local bijections (302,760 symbol checks). This differs from V-NULL insertion, #2625's latent phase clock and the additive arbitrary plaintext-predecessor-map sender: the current plaintext class fixes the image, the previous plaintext class controls only its within-class rank. There is no historical instruction selecting these particular rank lists or rotations.

A zero difference occurs exactly when the current plaintext equals G_0[k[q,0]], so rare mapped vowels can suppress adjacent ciphertext repeats while accumulating output into a nearly uniform marginal. The exact additional prediction is that **the whole plaintext class sequence is visible in successive ciphertext differences for every key**. Hence the family cannot explain low repeats by independently scrambling the class trace.

## Controls and original tests

Inputs: corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and solved-native blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Rune-only processing; no printed word assumptions. Train a smoothed native trigram model on the other solved sections for each plant (unit unigram pseudocount, bigram/trigram backoff strengths 8/12); hidden planted keys never enter the fitting function. Exhaust all 32,400 keys on the prefix, freeze the best key, carry the decoded branch and previous ciphertext across the seam. Exact replay is an implementation invariant only.

| Input | fit / held | exact key | held exact runes | fit / held nats per rune | ciphertext repeats / IoC |
|---|---:|---|---:|---|---|
| Native WELCOME plant | 232/76 | yes | 76/76 | -2.666 / -2.526 | 0 / .033885 |
| Native KOAN plant | 232/76 | yes | 76/76 | -2.207 / -2.269 | 0 / .033652 |
| Native p56 AN END + p57 PARABLE plant | 85/95 | yes | 95/95 | -2.476 / -2.477 | 0 / .032030 |
| Original p54–55 | 232/76 | unknown | no prose | -4.607 / -5.019 | 3 / .033821 |
| Original p40–53 (fit p40–46) | 1863/1145 | unknown | no prose | -4.939 / -5.033 | 18 / .034543 |

All 796 planted runes recover exactly (549 fit, 247 held); all original and plant tapes re-encrypt exactly. The native p56/p57 plant uses authentic decoded runes as a donor, **not** a claim this branch law decrypts the historical p56 ciphertext. No original model tuning after the heldout. p54's 232-rune page split includes its nine red heading runes; the p54→p55 carry remains uninterrupted and no printed-group reset is imposed. The p54→p55 seam has been exposed to prior research and is only an intra-run check. The p40–53 interval is disjoint but not globally unseen. Original best keys [3,16,3,5] and [6,0,3,8] do not produce recognizable text. The report is a finite-family score result, not a universal English impossibility theorem.

Two rival plants on the same donors: the noncumulative phase/class-rank sender emits d directly, giving 4/4/2 repeats but IoCs .05279/.06504/.06108; the cumulative sender with the same rotations for both previous classes gives 0/0/0 repeats and IoCs .03475/.03327/.03507. Low repeats plus near-uniform marginals therefore do not uniquely identify the branch memory. The latter is a fixed zero-difference/rare-rune collision-suppression rival, not a rejection-sampling cipher.

## Key-independent class obstruction

Whole original book p0–55: V=3699/12956 (28.55%), C=9257; class-pair counts VV=1026, VC=2673, CV=2673, CC=6583. Native solved-section V fractions range 32/89 (35.96%) to 146/319 (45.77%); all nine are above the original fraction. The source p54–55 interval yields V=83/308 (26.95%), and p40–53 V=835/3008 (27.76%). The source-independent trace is forced by the decoder, not a language-score fit. In particular the book's C→V transition fraction is 2673/(2673+6583)=28.88%; the nine solved sections' pooled CV/(CV+CC) is 984/(984+699)=58.47%. These finite controls are not independent samples from an established universal plaintext model, but the mismatch gives a mechanistic explanation of the failed inverse and a cheap rejection gate before exploring any wider within-branch permutation key. Do not rescue by retuning the class split, branch origin or clock against these same data.

This specific branch law is rejected as a native-style plaintext receiver. Other output partitions, different public states, and actual source-selected branch semantics remain untested. No unknown LP2 plaintext, authentic key or new destination.

## Reproduction

Run `node sims/lp2_disjoint_class_rank_feedback_sft.cjs` from repo root. [Source](../sims/lp2_disjoint_class_rank_feedback_sft.cjs), [full results](lp2-disjoint-class-rank-feedback.json). The experiment function executed directly in the connected JavaScript runtime; the Node file wrapper was generated from the executed function and has not separately been CI-run. No new workflow.
