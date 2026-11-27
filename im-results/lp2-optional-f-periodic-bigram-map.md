# Exact all-key periodic inverse under optional literal-F holds

## Result

Relaxing the historically distinct all-consuming and literal-F-held modes to permit either at **each** plaintext F does not recover ordinary native prose on original p54–55 under either authentic keyword period 8 or 13. The exact prefix MAP over every key and every optional F hold mask gives nonlinguistic results, with still worse frozen p55 continuations. Two independent native 308-rune plants at the historical DIVINITY/FIRFUMFERENFE key lengths recover the exact hidden key, every hold flag, and all 308 plaintext runes.

This is not a new cipher proposal or evidence LP2 used mixed holds. It is an exact bounded receiver for a superclass of two observed historical F policies; no unknown key/plaintext is authenticated.

## Model

For each physical position, consume `C=P+K[j] mod29`, advance j modulo q; optionally if P=F=0, emit zero without advancing j. Thus observed zero has two possible branches, and the consuming branch can decode to zero. The fixed q8 and q13 are motivated by actual historical keyword lengths, not independently selected LP2 periods. Unknown phase is absorbed into the unknown ordered key. There are no printed-word assumptions.

For a fixed prefix hold mask, every decoded rune is either constant 0 or a function of one key digit. The GP29 bigram log-likelihood decomposes exactly into unaries U_t(k) and edges V_t(k,l) on the q-cycle. Consecutive consuming positions have adjacent key phases; held events turn their incident bigrams into unary/constant factors. Sum all such terms at their corresponding phases. Fix each of the 29 possible first key digits, solve the remaining chain by max-sum dynamic programming, then close the last→first edge. This enumerates the optimal complete key among 29^q possibilities in O(q·29³) after factor accumulation. Backtrace and check factorized score against a direct score of the reconstructed sequence. Enumerate every subset of observed ciphertext Fs as the prefix hold mask. No dictionary pruning, no beam, no hand-picked keyword, and no trigram reranking.

Train bigrams on the same fixed 218,386 GP29 runes as the optional-prime-clock experiment, Shakespeare plus solved sections 0,2,4,6,8; reset context between sections, use unigram pseudocount .5 per symbol and bigram backoff mass 5. This deliberately low-order objective has exact inference. Prefix is the 232 physical runes of p54. Freeze the winning key, prefix mask and final clock, and decode p55 (76 runes) with exact bigram DP for its optional-F choices only. No p55 information enters key selection.

The two native matched plants use held-out solved sections 1 and 3 (first 308 runes), authentic GP spellings of DIVINITY and FIRFUMFERENFE, with a controlled alternating/selective F hold policy (specified in code). The key and hold flags are withheld from the solver. The first plant has 11 ciphertext Fs in the prefix (2048 masks), the second five (32 masks); the original prefix has three (eight masks). This includes ordinary consuming Fs rather than assuming every ciphertext F is literal.

## Executed results

| Input | q | All prefix masks | Prefix nats/rune | Frozen p55-shape suffix | Exact fit/held |
|---|---:|---:|---:|---:|---:|
| Native plant 1 | 8 | 2,048 | -2.640577 | -2.620173 | 232/232; 76/76 |
| Native plant 2 | 13 | 32 | -2.457101 | -2.419181 | 232/232; 76/76 |
| Original p54→55 | 8 | 8 | -4.065519 | -4.818759 | unknown; nonprose |
| Original p54→55 | 13 | 8 | -3.950348 | -5.528132 | unknown; nonprose |

Both plants recover exact full ordered keys and 308/308 hold flags. All outputs re-encode 308/308. The original prefix maximum is exact for the finite model/score, but an arbitrary invertible replay is not evidence of original plaintext.

Original q8 best key: [14,11,4,24,2,22,27,2], two prefix holds, two suffix holds. Original q13 best key: [20,17,24,22,1,16,27,23,12,4,13,13,19], one prefix hold and one suffix hold. Both full decodes are nonprose. Complete paths and masks are recorded. Do not treat isolated fragments in 308 optimized runes as words or key validation.

## Complete nine-chapter original attack

The same exact prefix-key solver was extended to **every one of the nine original illustrated chapters** (physical boundaries #1364/#545), with independent secret keys allowed per chapter. Fit only the first physical page; freeze that key and its prefix hold flags, continue through the entire remaining chapter. This is intentionally more permissive than a common whole-book key, with no original printed-word assumption and no arbitrary page-start selection. The chapter starts have 3–14 ciphertext Fs, so all 8–16,384 prefix masks are examined independently for each period.

| Original physical chapter | First-page fit | All masks per q | q8 fit / withheld nats per rune | q13 fit / withheld nats per rune |
|---|---:|---:|---:|---:|
| p0–2 | 262 | 16,384 | -4.07808 / -5.14917 | -3.75856 / -5.19531 |
| p3–7 | 217 | 128 | -3.96783 / -5.25747 | -3.73645 / -5.33256 |
| p8–14 | 255 | 256 | -4.15037 / -5.07080 | -3.82890 / -5.14423 |
| p15–22 | 159 | 128 | -3.80596 / -5.09509 | -3.43477 / -5.10490 |
| p23–26 | 213 | 128 | -4.00773 / -5.18207 | -3.69575 / -5.21243 |
| p27–32 | 234 | 2,048 | -4.09880 / -5.29493 | -3.63652 / -5.15511 |
| p33–39 | 214 | 512 | -3.95895 / -5.30789 | -3.71969 / -5.31409 |
| p40–53 | 231 | 1,024 | -3.95986 / -5.08005 | -3.71376 / -5.08342 |
| p54–55 | 232 | 8 | -4.06552 / -4.81876 | -3.95035 / -5.52813 |

All 18 full chapter paths replay. **All 12,956 unknown original runes have been decoded under both independently fitted q families; none of the prefix winners predicts readable native prose.** The training and held-out scores remain far below the native positive controls above. The full-book extension performs 20,616 prefix-mask decisions per period, each optimizing the entire q-dimensional keyspace. The independent chapter keys are an investigative relaxation, not an inferred reset rule.

The opening's 16,384 masks per q were executed using a local C++ max-sum accelerator with precomputed pair factors and safe tree upper bound (drop the closing edge and add its independently attainable maximum). No mask that could beat the local incumbent is skipped. Exact input count table FNV-1a over uint32 count values = 756236153, p0–2 rune tape FNV-1a = 2252059994. The resulting opening prefix scores were independently recomputed with the original JS model before the frozen p1–2 continuation. The slower reference JS chapter SFT also enumerates all masks with no pruning.

- [Chapter SFT](../sims/lp2_optional_f_periodic_chapters_sft.cjs): optional CLI arguments select chapter start pages, e.g. `node sims/lp2_optional_f_periodic_chapters_sft.cjs 3 8 15 23 33`; no arguments runs all nine.
- [Full p0–2 result](lp2-optional-f-periodic-chapter-p0.json)
- [Full five-chapter batch](lp2-optional-f-periodic-chapter-batch-a.json)
- [Full p27 and p40 batch](lp2-optional-f-periodic-chapter-batch-b.json)
- The terminal chapter raw output is the original two-control artifact above.

This broadens the direct periodic-key optional-F negative to all physical chapters. It does not mathematically exclude alternate keys under a different plaintext scoring model, shorter true subchapter resets, an additional layer, non-native text, or a different period. Do not repeat this direct independent-chapter q8/q13 optional-F receiver without a genuinely new predictor. No unknown plaintext or authentic key.

## Reproduce and scope

- [Executable Node SFT](../sims/lp2_optional_f_periodic_bigram_map_sft.cjs)
- [All control and original outputs](lp2-optional-f-periodic-bigram-map-output.json)
- [Distinct known-prime-clock optional F inverse](lp2-optional-literal-f-prime-clock.md)

Full experiment actually executed in V8 on the repository inputs; standalone Node wrapper not separately run. Exact prefix objective optimization is not a universal language impossibility theorem. Unknown periods, nonperiodic state, non-native registers or additional layers are outside scope. The heldout score is for the single prefix winner, not the maximum over alternative keys refit on p55. No source specifies an intra-LP2 F selector; the relaxation is deliberately favorable to the tested family. Do not repeat the q8/q13 mixed hold sweep or promote the winning original keys.
