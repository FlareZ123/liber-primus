# Alternate physical-line reversal outside a continuous keyword (#2661)

## Decision and source

Reject the fixed book-wide alternate-line outer reversal followed by q8/q13 additive keyword inverse with latent plaintext-F holds, conditional on the stated contiguous literary register. Five full chapters individually fail both parities and both periods, even granting independent chapter keys and parity. p54–55 is not excluded by the collision envelope; its exact frozen fit/continuation is nonprose. No original key/plaintext. Independent chapter survivors are not algebraically impossible.

Model: first encrypt sequential plaintext with C=P+K[j mod q] mod29 when P≠0; literal F emits F and does not advance j. Then reverse each alternate physical line, carrying its separators; parity is continuous across page seams inside a chapter. The exact inverse undoes the outer reversal first. Use both parity choices (0=reverse zero-based even line indices; 1=odd). No line-specific switches, private line keys, or invented segmentation.

The master transcription chunks page+16 are split on /; only rune-bearing lines are counted. Each page's rune sequence exactly equals canonical corpus. 594 lines, chapter line counts [33,55,79,86,46,65,80,135,15], chapter rune counts [729,1145,1729,1903,1021,1433,1680,3008,308]. p50 is rune-free. Rubrics remain in their physical positions before line reversal; no red/black reset or separate heading key is inferred. The prior #608 and boustrophedon word-length gate preserve intact words and test grammar; #2652 reverses whole printed groups, not physical line sequences. This is a distinct position-changing layer; we use spacing-free receivers to avoid relying on moved word cuts.

## Exact collision relaxation

Delete any subset of observed ciphertext F as literal holds; every other rune consumes. In active order, equality at lags q,2q,3q is invariant under the additive keyword (also any fixed per-phase bijections with literal F holding). The same holds for equality of the two adjacent consuming-rune pairs at these lags. Let R and B sum those rune and bigram coincidences. Dynamic programming retains the last 3q+1 consuming symbols and independently tracks exact min/max R,B; on F it branches hold or consume, otherwise consume. Merge histories with identical suffix by min/max. Thus each interval is exact; their Cartesian product is only a relaxation. 64 brute-enumerated toy mask cases match DP. Maximum 64 simultaneous suffix states in actual source, no caps.

All contiguous windows of each chapter length in frozen native-normalized Shakespeare (217106 runes), Emerson (321327), Gibran (62492) are scanned, not sampled. Greedy GP normalization uses QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA. A donor window must have no more plaintext F than observed ciphertext F; its R,B after deleting literal F must lie inside the exact original intervals. Prefix sums give exact scores for every window. Total 21,477,936 window/model decisions; 17,276,216 satisfy the F count, 21,656 also pass both interval constraints (not necessarily one joint feasible mask).

| Chapter | Runes | Rejected parity/period pairs /4 | Joint interval survivor counts (even q8, even q13, odd q8, odd q13) |
|---|---:|---:|---|
| p0–2 |729|0|2761,495,989,568|
| p3–7 |1145|4|0,0,0,0|
| p8–14 |1729|4|0,0,0,0|
| p15–22 |1903|3|0,0,0,335|
| p23–26 |1021|2|0,274,0,241|
| p27–32 |1433|4|0,0,0,0|
| p33–39 |1680|4|0,0,0,0|
| p40–53 |3008|4|0,0,0,0|
| p54–55 |308|0|13983,223,1061,726|

25/36 pairs reject every eligible donor window. In particular all four combinations fail p3–7, p8–14, p27–32, p33–39, p40–53. This cannot be repaired by choosing parity/period independently in each chapter. Finite donor-register decision, not arbitrary-language proof.

## Constructive spacing-free continuation

Use existing exact cyclic n-gram optimizer `sims/lp2_fhold_cyclic_ngram_map.cjs` (no new key search machinery). For fixed hold mask, allowed key domains forbid consuming P=0. Unigram/bigram/trigram contributions only span consecutive consuming phases, so condition on two adjacent phase keys and optimize the cyclic chain exactly. On p54 all eight F masks are exhausted for each q/parity. Train on solved native text only; freeze best fit key and prefix state posterior; p55 is never used to pick a key, parity or period. All four continuations legally replay, but are nonprose.

| Parity | q | Prefix nats/rune | Suffix nats/rune |
|---:|---:|---:|---:|
|0|8|4.7123|5.8052|
|0|13|4.4619|5.4294|
|1|8|4.7444|5.4436|
|1|13|4.4607|5.2482|

The best prefix candidate (odd q13) has key [27,4,8,24,12,10,4,1,4,9,19,7,17] and p55 transliteration PABDBMLMFUMPTHJJIAIIANGJUNEFINSNGSGLDTRAOPDEOAEHECBNGGLIINGJBIAOEOEHUBTHGJIAHABHAEATDOPIS. Legal replay is not plaintext evidence. This is a global prefix-MAP result, not a proof that every key has nonprose full-span decoding.

## Native controls

Take first 308 native runes, restore authentic native group separators, partition at the actual 15 physical line widths of pp54–55, then apply continuous literal-F keyword and reverse full token lists on the planted parity. These controls retain real word fragments crossing lines and, for two, page seams; mechanically undoing reversal restores all separators. Neither the target's plaintext nor its native section is used in the fit language model. The period is supplied as the control's declared model; infer both parity and unknown key from first232 only. First KOAN and LOSS OF DIVINITY exhaust all 64 fit masks per parity; WELCOME has13 observed zeros and exact bigram ranks all8192 masks, then trigram-refines top64 per parity (not exact global trigram). All three planted parities and all 29 key entries recovered. Freeze key and prefix state posterior then predict76 withheld runes.

| Native plant | q | True parity | Line carries | Page carry | Key | Fit | Suffix | Exact framed replay |
|---|---:|---:|---:|---|---:|---:|---:|---|
|WELCOME|8|0|10|no|8/8|226/232|76/76|yes|
|First KOAN|13|1|11|yes|13/13|232/232|76/76|yes|
|LOSS OF DIVINITY|8|1|9|yes|8/8|232/232|76/76|yes|

The WELCOME fit errors are ambiguous F decisions despite exact keyword; no full training-text recovery claim. All plants include consuming zeros. Original withheld nats/rune are much worse than these known-native controls (2.58,2.34,2.93). 

## Artifacts

- `node sims/lp2_alternate_line_keyword_collision_sft.cjs` — [exact window output](lp2-alternate-line-keyword-collision-output.json)
- `node sims/lp2_alternate_line_keyword_original_sft.cjs` — [frozen original output](lp2-alternate-line-keyword-original-output.json)
- `node sims/lp2_alternate_line_keyword_control_sft.cjs` — [native control output](lp2-alternate-line-keyword-control-output.json)

Executed in connected JS against canonical resource bytes and existing optimizer; no claim of remote CI execution. Scope excludes only fixed alternating reversal outside the fixed continuous periodic cipher, under finite literary comparator or frozen MAP decision. No source instruction selecting boustrophedon is established. No additional line-direction search justified.
