# Prime-totient / move-to-front composed cipher: exact initial-alphabet recovery

**Agent19, 24 November 2026. Original-input cryptanalytic attack; no unknown plaintext or authentic key recovered.** Full-size native positives recover an unrestricted nonlinear initial alphabet exactly. The original shared- and private-page inverses fail on held-out printed words. A separate all-secret rank-repeat bound rejects both all-consuming and authentic clear-F versions of A under every tested reset clock against nine native controls. No first-party source selects this composition. Retire this specific architecture.

## Why this concrete model

Solved physical p56 authentically uses consecutive ordinary primes minus one as GP29 additive shifts (with a clear-F special case); the code reproduces all 85 source runes using that exact special case. The historical 2014 Stage08 bzip2 association motivates standard MTF as a distinct changing-state mechanism, as previously noted in [the 2015 prime-difference MTF study](lp2-2015-primeD-gp29-mtf-original-gate.md). That earlier experiment tested a different intermediate register, not this composition. No first-party instruction selects MTF as an LP2 layer. The new model is a deliberately limited **all-consuming** p56-like prime schedule combined with rank emission, without fitting an unknown F mask. It does not assert that p56 itself uses MTF.

Let k_i=(prime[i]-1) mod29, with prime[0]=2. Reset the prime clock and MTF list together either at book start, the nine physical chapter starts (0,3,8,15,23,28,33,40,54), or all physical page starts. Runeless p50 consumes nothing.

**A:** first shift plaintext P_i to S_i=P_i+k_i mod29, then MTF-encode S_i as a rank in the private initial GP29 permutation. **B:** MTF-encode P_i, then add k_i to that rank modulo29. Both are fully invertible. These two orders are not equivalent.

## Exact attack on A (not a key sweep)

Decode the original rank stream by ordinary MTF with identity initial list. The resulting abstract labels a_i are independent of the actual initial list. If pi maps initial labels to GP symbols, then P_i=pi(a_i)-k_i mod29. Every key is a 29-permutation.

For any fixed target plaintext letter t, form W[a,x] as the count of original positions with a_i=a and x=(t+k_i) mod29. Maximizing the possible occurrence count of t over every one of 29! keys is exactly a maximum-weight perfect assignment. Changing t just cyclically permutes columns, so the same exact bound applies to **every** output letter. For common keys across resets, combine the weights before solving; for entirely private reset keys, solve separately and sum. The same Hungarian solver with log native-letter frequency weights gives the globally optimal unigram key for the chosen training span. This is an actual recoverable-key attack, not sampled alphabets.

Training uses the original p0–39 positions (9,640 runes), untouched p40–53 (3,008) for holdout, and p54–55 for the remainder. Native log frequency prior comes from the checked-in solved LP1 reference only, excluding p56–57. Three full-length Gibran native-GP windows (source offsets 0, 10000, 25000 after the fixed author-text slice) have E counts 1520,1459,1497 and IoCs .06025925,.05972136,.06009170. The independently solved p57 reference exactly encodes its authentic 95 rune source.

## Original decision

| Reset clock | Fitted A full IoC | Fitted A held-out IoC | A any-rune max, common alphabet | A any-rune max, private reset alphabets | B any-rune max, private reset alphabets |
|---|---:|---:|---:|---:|---:|
| Book | .03469123 | .03461604 | 656 | 656 | 499 |
| Nine chapters | .03467496 | .03463638 | 663 | 1147 | 589 |
| Physical pages | .03473533 | .03439138 | 692 | 2528 | 787 |

The held-out A ceilings with even a separately optimized common alphabet are 218,211,218 occurrences of **any** rune versus native controls' E counts 326,334,354. The corresponding full-book common-A IoC ceilings are .05007890/.05044974/.05276652 by concentrating the maximum allowed mass into as few rune bins as possible. B's common-alphabet complete IoCs are .03448300/.03448305/.03447573; any common initial list only relabels its abstract output. Private B lists still cannot exceed the displayed global maximum frequency because each segment's histogram is invariant up to relabeling.

All original fitted inverses and literal B inverse outputs replay every original rune. No grammatical unknown prose appears. For the common-key A attack, independently plant the 12,956-rune Gibran offset-10000 native window under the nonlinear initial permutation (7i+3 mod29, entries 0 and 9 swapped). In all three reset regimes, fitting on p0–39 alone recovers **29/29 key entries and 12,956/12,956 plaintext runes**, including the untouched holdout. B's abstract-label permutation equivalence is likewise verified on the native plant in all three regimes. A 3x3 exhaustive assignment control also passes. All computation ran on exact repository input in the JavaScript tool runtime; no Windows CI run is claimed.

**Scope:** common-alphabet A and chapter-private A fail the necessary maximum-frequency condition for these particular ordinary native English controls; private-page A is not excluded by this frequency bound alone; the two independent follow-up tests below close the declared private-page branch against the specified native controls. B is similarly incompatible even with private page alphabets. No universal English theorem or authentic MTF selector is claimed. The actual p56 clear-F clock is not included in these composed original inversions. Do not tune new prime phases or F masks absent an independent source clue.

## Independent private-page key recovery

For A, a word candidate of the correct printed length determines the partial assignment pi(a_i)=P_i+k_i. Reject it if any abstract label has two required images or any two labels share an image. A fixed 256-state beam combines compatible word constraints in order of discriminating power; an OOV/skip branch is allowed. Complete remaining assignments by maximum-weight native-unigram assignment. The frozen 29,198-entry native GP lexicon uses TextBlob counts plus the first 60% of the Gibran word stream; no p57, LP1 or test-window text is used to train the language model. Fit on the first complete words ending at or before 70% of each page, then freeze the key. All output re-encrypts exactly. The source segmentation uses the 57 nonempty transcription records with physical p50 inserted and checks each physical page's full rune stream; split-word fragments remain at page boundaries rather than being treated as new complete source words.

| Blind plant | Runes | Key recovered | True held-out runes |
|---|---:|---:|---:|
| Authentic p57 | 95 | 7/29 | 10/42 |
| Gibran short | 78 | 12/29 | 10/26 |
| Gibran long | 266 | 29/29 | 84/84 |
| Shakespeare long | 264 | 29/29 | 80/80 |
| Emerson long | 233 | 29/29 | 70/70 |
| LP1 Koan reference | 319 | 29/29 | 97/97 |

The short-page solver is not reliably identifiable. All four long plants recover the exact nonlinear private key and all plaintext, clearing the prespecified >=90% held-out accuracy gate for long pages. Apply the frozen solver only to original long p0, p16, p40 (separated across the manuscript).

| Original page | Training lexical rune coverage | Untouched holdout lexical rune coverage |
|---|---:|---:|
| p0 | 45/183 | 3/79 |
| p16 | 46/182 | 3/85 |
| p40 | 47/160 | 0/71 |

Training can overfit recognizable words, but the independent holdouts are nonlinguistic and no original continuous prose emerges. This is a finite direct attack failure, not an exhaustive proof for all private keys or a proof against short pages. See [lexical recovery SFT](../sims/lp2_prime_totient_mtf_privatepage_lexical_sft.cjs).

## All-secret repeat gate, including authentic p56 F policy

For A, after the first access to a shifted intermediate symbol S in a reset interval, the MTF rank is exactly the count of distinct symbols since its previous occurrence. This quantity is independent of every initial alphabet. Count adjacent equal ranks only where both accesses are non-first; this is a lower bound on the original cipher's adjacent repeats under any secret initial list, even separate lists per physical page.

Test both the earlier all-consuming clock and the **actual** source-p56 rule: if P=F, S=F and do not consume a prime, otherwise S=P+k mod29 and consume a prime. Nine fixed 12,956-rune windows (beginning, midpoint, end of each repository-native Gibran, Shakespeare and Emerson stream) are overlaid on the actual source reset spans. The source's p56 authentic encryption and p57 native spelling are rechecked; for both canonical and nonlinear initial lists every non-first rank agrees exactly with the derived invariant.

| Clock | Original within-reset repeats | All-consuming native lower bounds | Authentic clear-F native lower bounds |
|---|---:|---:|---:|
| Book | 86 | 405–480 | 396–486 |
| Nine chapters | 86 | 408–453 | 392–482 |
| Physical pages | 86 | 367–415 | 368–425 |

The original has only 86 equal adjacent ciphertext symbols, all within the tested reset spans. Even granting completely independent initial alphabets, every native control produces at least 367 forced equal adjacent ranks (368 with actual clear-F). First-access ranks cannot remove these equalities. This exact invariant defeats the declared A mechanism for these finite ordinary native-prose samples, including the formerly surviving page-private variant and the source-authentic F-clock extension. A downstream value-changing anti-repeat layer or different source register is outside the model and would require its own source selection. [Repeat-bound SFT](../sims/lp2_prime_totient_mtf_repeat_allsecret_sft.cjs).

**Decision:** do not spend compute on F-mask enumeration, short-page lexical rescue or private-list optimization for this architecture without a new source-selected downstream operation that explains the repeat deficit. No unknown plaintext or authentic key recovered.

## Reproduction

`node sims/lp2_prime_totient_mtf_assignment_original_sft.cjs` — Node22 CommonJS, no dependencies. Outputs all fitted alphabets, native controls, complete original/plant replay checks and per-segment private-key bounds. The two follow-up scripts are also standalone read-only Node22 CJS tests, run on exact repository data in the JavaScript runtime. No Windows CI execution is claimed. [Source](../sims/lp2_prime_totient_mtf_assignment_original_sft.cjs).
