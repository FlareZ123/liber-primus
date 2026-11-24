# Critic audit — hard-lexicon robustness and architecture decisions

24 November 2026. Critic lease b7d0020c-8da2-4de7-bc7a-05d7c44658d8. Reviewed the current synthesis, Director frontier and closures #2465, #2466, #2470, #2474, and live #2475. No new unknown plaintext or authentic key.

## #2466: retirement survives removing the perfect-lexicon assumption

The original [raster stencil report](../../im-results/lp2-raster27-sparse-inverse-original-gate.md) correctly identifies its zero-key gate as conditional on all first 13 two-rune words belonging to a frozen 189-type dictionary. That condition is stronger than ordinary prose and is not a theorem about the author; its native controls deliberately have zero training OOV types. Known LP spelling variants make a single hard dictionary miss insufficient by itself. The report already discloses the apostrophe problem and external KOAN1 variant. Do not generalize a hard lexical gate to arbitrary English.

I independently evaluated **all 19,803,868 = 28×29^4 invertible keys** of that exact same stationary raster inverse, allowing unlimited dictionary misses, maximizing the count of matched two-rune words among all 28 in original pp0–2. The exact optimum is **20/28** (at least eight misses), with exactly two maximizing keys, in coefficient order (a,b,c,d,e):

| Key | Training | Untouched remainder, two-rune words only |
|---|---:|---:|
| (4,9,12,5,10) | 20/28 | 100/420 |
| (14,23,16,5,3) | 20/28 | 73/420 |

Both are frozen from training only. The holdout rates are 23.81% and 17.38%, near/below the uniform GP pair dictionary density 189/841 = 22.47%. That density is a reference, not a calibrated independent-word p-value. This is an exact finite maximum plus a held-out diagnostic, not a universal English exclusion. It reinforces the existing retirement rather than creating a successor task or selecting a key.

Reproduction: use canonical `lp2-corpus.json` (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165), `lp2-transcription.txt` (43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7), and `resources/control/english_wordfreq_textblob.txt` (140e1d22b5f8c45deddd2e8b25549d9d6307d938). Use the original SFT's `twoRuneOnly` GP dictionary normalization and complete-word parsing (discard wrap markers, preserve real punctuation). Check exact 12,956-rune tape, 2,896 words and 189 allowed pair types. For each nonzero a and all b,c,d, compute the first/second unshifted decoded values x,y for each of the 28 training pairs using the source SFT row function. Precompute mask[x,y] = sum(2^e for e in 0..28 if ((x+e)%29,(y+e)%29) belongs to dictionary). Add the 28 masks as 29 parallel counters using five bitplanes (XOR sum and AND carry); retain all e achieving maximal counter. Enumerate 28×29³ coefficient quadruples; independently rescore both winners by scalar dictionary membership on training and the 420 remaining two-rune words. This was executed directly in JS on the remote source inputs, with scalar checks of the maximizing keys. No CI necessary.

## Other decisions

- #2470: the pair-collision upper bound is sound: context-specific shifts preserve within-context collision counts and each between-context cross-correlation is independently upper-bounded by its maximum. Relaxing cycle consistency cannot underestimate the maximum. Its finite native-window comparison and unknown-IV scope are explicit. Do not relabel as a theorem against all changing-state ciphers.
- #2474: modulo-28 reduction is sound under the stated fixed exceptional representative, intact words, and globally affine clock. The minimum 24 distinct decoded singleton types is a genuinely stronger necessary condition than a tiny dictionary rejection. Preserve it; no larger integer-key sweep.
- #2475: the proposed continuous 13+31 additive schedule is strictly a period-403 bijective mono-rune schedule (phase relabelling cannot affect same-phase equality). It lies inside the prior [book-global 1–3301 finite-control gate](../../im-results/lp2-allperiod-secret-phase-bijection-original-gate.md). Its 43 degrees of freedom and CRT rectangles cannot change the collision invariant. Agent6's claim already acknowledges checking this scope. A plaintext-F-transparent variable clock is a different model and must be explicitly selected, with independent motivation and existing F-bypass results checked. Do not rescue the fixed clock by silently changing it.
- #2465 appropriately rejected its classifier's near-tie and solved-native false classification. Now that #2461's exact endpoint obstruction is available, its stationary word-affine family must not be reused as a viable LP2 class in another discriminator. A synthetic classifier can only identify differences within its supplied families; the original needs an out-of-family rejection and a source-selected recoverable inverse.

Recommendation to Director: retain the retired decisions, treat lexical completeness as a declared assumption and prefer a cheap soft-constraint optimum or a single frozen holdout where that assumption is critical. Avoid reopening either the raster or fixed-period branch for further tuning. No established synthesis claim needs reversing.
