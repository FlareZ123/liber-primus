# Original LP2 word-fed prime-clock inverse

**Decision:** Retire the explicit word numerical sum → prime-minus-one within-word clock receiver under the frozen previous-plaintext, same-plaintext and visible-ciphertext conventions below. All transparent-F variants are algebraically incompatible with the complete original tape even without a language model. Ordinary-F variants converge to mostly unique, near-uniform non-English output. This is a bounded complementary test to #2503; it does not test that issue's cyclic previous-plaintext-rune key and does not identify the historical cipher.

## Human clue and inverse

The 2016 signed message assigns significance to words and their numbers; solved LP1 uses Gematria prime word sums; solved p56 uses consecutive prime-minus-one shifts and transparent plaintext F. A direct combination is to sum the previous recovered plaintext word's Gematria weights, reset the within-word shift clock at that sum, and decode the next word. The authentic sources do not explicitly select this combination, index base, or word direction. Test prime weights (2…109) and ordinary GP0 weights (0…28), a zero-based prime offset or clamped one-based ordinal, and forward/reverse word order while keeping each word's internal rune order.

Let s = sum of prior plaintext word weights, k_j = (prime[max(0,s-offset)+j]-1) mod29 with zero-based prime array. Ordinary F: C=P+k mod29, advance at each rune. Transparent F: P=0 emits 0 without advancing; otherwise C=P+k mod29 and advances. For observed C=0 retain both F-hold and nonzero inverse possibilities; for C nonzero no F branch and P=0 is forbidden. The next-word state depends only on the sum of the decoded word, so deduplication is exact. Each genuine singleton is an independent cut where all 29 possible plaintext weights are granted, removing dependence on any earlier secret. No lexical pruning is used in the transparent-F reachability test. For the ordinary-F arm start just after the first singleton and propagate all 29 possible weights, inspecting only words that are identical under every surviving initial state. Reverse direction means reversing the sequence of complete words, not rune order.

## Exact source result

Read canonical physical p0–55 (exclude the runeless p50 from the transcription's page separators), remove soft line breaks, retain printed punctuation and merge actual page-carry words. Source tape agrees rune-for-rune with canonical corpus: 12,956 runes, 2,896 complete words, 83 singleton cuts. All 16 configurations retain the true known 95-rune p57 planted decode and exactly replay its ciphertext; these are mechanism controls, not evidence of historical use. Ordinary-F forced output also exactly replays each tested original word.

| Weight | Index offset | Word order | Transparent-F cuts ending in contradiction | Shortest contradictory suffix (runes) | Ordinary-F forced words | Forced >=4-rune words matching solved-reference vocabulary | Forced rune IoC |
|---|---:|---|---:|---:|---:|---:|---:|
| prime | 0 | forward | 83/83 | 41 | 2663 | 0/1515 | 0.034455 |
| prime | 0 | reverse | 81/83 | 45 | 2560 | 0/1459 | 0.034463 |
| prime | 1 | forward | 83/83 | 53 | 2558 | 0/1450 | 0.034520 |
| prime | 1 | reverse | 83/83 | 47 | 2654 | 0/1508 | 0.034453 |
| ordinal | 0 | forward | 82/83 | 42 | 2708 | 0/1538 | 0.034472 |
| ordinal | 0 | reverse | 83/83 | 75 | 2607 | 0/1485 | 0.034463 |
| ordinal | 1 | forward | 83/83 | 47 | 2784 | 0/1585 | 0.034464 |
| ordinal | 1 | reverse | 81/83 | 58 | 2800 | 0/1590 | 0.034477 |

All eight hold variants have at least one exact all-state contradiction; even granting arbitrary earlier key material cannot repair them in an unreset continuous run. Some terminal suffixes are too short to reach a contradiction; no universal assertion about independently restarted short chapters follows. The ordinary-F mechanism is bijective per word for a fixed seed; the observed convergence fixes most output independent of unknown seed. Every configuration has zero >=4-rune words matching the small LP1/p57 reference vocabulary and IoC near 1/29. This diagnostic is finite and does not prove incompatibility with every possible plaintext language. Example forced output (prime, offset0, forward): `EO WDTT UNAEJMJTRG ISL OXDS HINGNBA EOOHY MICR NGIAOIJAELEOXTH TOETO EAUTHAEOOCTHD IAUUY DLYCXEEOF BJ RBNGWBOENGNGT IBEY`.

## Same-word plaintext sum and visible ciphertext sums

A simpler human-solvable alternative dispenses with prior plaintext state: the current word's own GP sum selects its own prime clock. Enumerate **all realizable numerical sums for that exact word length**, invert with every corresponding state and retain only plaintext candidates whose sum equals the seed. This can be lossy or ambiguous; an empty candidate set is a language-independent contradiction. All eight cases retain the genuine planted p57 words, including all valid alternative inverses; every such positive candidate exactly replays. The original results below show 1,033–1,162 complete printed words with no inverse in each case. The same fixed prime-clock operation also fails when the solver directly computes the current, previous or next **ciphertext** word's number. Transparent-F visible-sum variants have hundreds of impossible original words; ordinary-F versions have near-uniform rune IoC (0.03444–0.03453), with no >=4-rune word matching the solved-reference vocabulary. Previous/next ciphertext-fed plants retain all p57 words under their true seed. The same-ciphertext-word seed is implicit in forward encryption; no whole-p57 forward plant is claimed for that circular rule.

| Weight | Offset | F mode | Own-plaintext-sum words with zero candidates | Exactly one candidate | Visible-sum impossible words (same / previous / next) |
|---|---:|---|---:|---:|---:|
| prime | 0 | hold | 1116 | 982 | 323 / 365 / 373 |
| prime | 0 | ordinary | 1057 | 1025 | 0 / 0 / 0 |
| prime | 1 | hold | 1162 | 1008 | 340 / 385 / 375 |
| prime | 1 | ordinary | 1095 | 1057 | 0 / 0 / 0 |
| ordinal | 0 | hold | 1066 | 1042 | 354 / 391 / 317 |
| ordinal | 0 | ordinary | 1033 | 1076 | 0 / 0 / 0 |
| ordinal | 1 | hold | 1118 | 1036 | 374 / 371 / 392 |
| ordinal | 1 | ordinary | 1049 | 1055 | 0 / 0 / 0 |

No candidate from any self-keyed arm matches a >=4-rune word in the solved reference, despite allowing multiple alternatives. The exact self-keyed obstruction is independent of language, and independent of any book-level secret or restart. It assumes the published complete-word segmentation and the frozen sum/index/prime shift law. The adjacent visible-word variants omit the one book endpoint whose necessary neighbor is absent. These alternatives exhaust the immediate placement choices for the same numerical prime-clock mechanism, not every possible word-conditioned cipher.

### Exact shared-offset recovery gate

The 83 original singleton words use 28 distinct GP29 ciphertext runes (only index 5 is absent). For a self-keyed word prime clock with any **shared** additional prime-index offset b, a one-rune plaintext x must produce C=x+prime[max(0,b+weight(x))]−1 mod29 (or C=0 for transparent F). Consequently every one of the 28 observed values must occur among the 29 possible outputs, independently of plaintext language. Directly exhaust b from −1 through 12,956 inclusive, covering all offsets from the initial one-based convention through the full original rune count. The following maxima are exact, not estimated:

| Weight | F mode | Maximum covered original singleton values | Best offsets | Complete survivors |
|---|---|---:|---|---:|
| prime | hold | 25/28 | 723 | 0 |
| prime | ordinary | 24/28 | 723, 1747, 1945, 4674 | 0 |
| ordinal | hold | 24/28 | 5164, 6925, 6926, 10986 | 0 |
| ordinal | ordinary | 24/28 | 1016, 5709, 6925, 6926, 8441, 9479 | 0 |

No shared offset in this bounded 12,958-state domain survives the actual original singleton set. This is an inexpensive key-recovery gate: only a complete survivor would justify testing longer words. It does not exclude offsets outside that domain, a changing offset, or a different self-keying mechanism. More generally, deterministic position-independent encryption of a complete one-rune word cannot generate 28 distinct outputs from fewer than 28 distinct plaintext one-rune words, regardless of the key, although that separate language-dependent constraint requires an assumed plaintext register.

## Reproduce

`node sims/lp2_wordfed_primeclock_original_sft.cjs` from repository root. Executed in V8 on exact remotely fetched corpus, transcription and solved reference on 2026-11-24. Source paths: `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp1-plaintext-reference.txt`. All output metrics are computed from those files. No workflow or new dependencies required. No unknown plaintext, authentic new key, or destination recovered.

## Next decision

A different word-fed state law needs independent source selection. Do not generalize these exact negatives to arbitrary nonlinear state updates, arbitrary word segmentation, resets or other prime clocks. A source-specified operand that predicts an untouched word or a known solved passage remains higher value than another free numerical combination.
