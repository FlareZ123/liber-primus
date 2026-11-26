# Exact V-NULL minimum-risk alignment: rune and lexical receivers

## Decision

The revised [external C9 V-NULL sender](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/challenges/c9_rejection_loops.py) discards each rejected key symbol and emits a uniform nonrepeat null; one key digit advances per ciphertext rune. The pending plaintext is retained until a real event. The [exact event-DAG report](lp2-vnull-exact-event-dag.md) establishes the complete legal event edges, including consecutive nulls. This is an exploratory mechanism; no original LP2 source establishes it or supplies its key.

The strongest current local receiver is the lexical semi-Markov minimum-risk inverse. It materially reduces null-placement errors, but the fully blind receiver remains register-sensitive. The explicit length-conditioned mode exceeds the C9 positional threshold in all three local registers; actual unknown LP2 plaintext length is not supplied. Neither the local language score nor the local random-key plants certify the external C9 checker. No new LP2 plaintext or key.

## Exact inference

For an event start i, either emit P=C[i]-K[i] (acceptance factor 1-supp on a doublet), or if C[i] differs from C[i-1], retain P=C[i-1]-K[i] and consume one null at probability supp/28. Every consecutive null must preserve this P, and the first genuine emission must equal P+K[j] mod29. Thus there is an ordinary edge and at most one terminating null-chain edge at each start, with exact sender probability and replay.

The previous rune prior augments the DAG with the last three runes and emitted length. Forward/backward log-sum-exp obtains a posterior marginal at every plaintext position; a second legal-path maximization gives the maximum expected positional match. The earlier variable-length controls (80 native + 40 Gibran, overlapping windows) obtained:

| Prior | Blind ≥85% | Actual-length oracle ≥85% |
| --- | ---: | ---: |
| Rune order-4 MAP | 69/120 | — |
| Rune order-4 MBR | 74/120 | 93/120 |

Details: native MBR 51/80, known-length 61/80; Gibran 23/40 and 32/40. Mean blind positional recovery 0.7940, mean edit distance 0.8500, 58/120 exact. [Prior JSON](lp2-vnull-posterior-mbr.json), [prior SFT](../sims/lp2_vnull_posterior_mbr.cjs).

### Lexical extension (#2969)

Replace the rune-context state with a latent word boundary and build a semi-Markov lattice: every event-DAG path of 1–20 plaintext runes is a possible word edge, with exact event probability and a smoothed word likelihood. The 32,254-entry native-rune lexicon is a .65/.35 mixture of Shakespeare/Emerson empirical word frequencies and TextBlob word frequencies, with .03 OOV mass assigned to a geometric length model and order-4 interpolated within-word rune prior. The first and last words can be truncated: suffix probabilities are normalized over possible starting positions, and prefix probabilities marginalize over word completion. This allows arbitrary windows and does not trust printed starts. Forward/backward states are (cipher endpoint, emitted plaintext length); posterior word edges distribute their mass to each rune position. A second event-DAG DP maximizes the sum of positional marginals over legal paths. Every returned event path replays; no language model can override the event constraints.

Frozen local seed 0x296947c9, 40 240-rune windows per register, independent pseudorandom keys and wrong keys, exact supp=1-.664/3.448. Windows can overlap; native records and Gibran had appeared in earlier instrument work, and Orthodox is an additional register, not a sealed independent external review. The length-conditioned arm receives 240 explicitly; the blind arm receives only ciphertext and key. These local keys are uniform pseudorandom draws, not the external SHA-256-counter generator.

| Register | Raw positional ≥.85 | Blind ≥.85 | Blind exact | Blind mean positional | Known-length ≥.85 | Known-length exact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gibran | 0/40 | 35/40 | 34/40 | .940521 | 38/40 | 36/40 |
| Orthodox prayers | 0/40 | 25/40 | 25/40 | .810833 | 35/40 | 34/40 |
| Native solved GP29 | 0/40 | 34/40 | 32/40 | .898333 | 40/40 | 39/40 |
| Total | 0/120 | 94/120 | 91/120 | .883229 | 113/120 | 109/120 |

The raw mean positional is .2071/.1522/.2098. Blind edit distance means .225/.600/.225; known-length .200/.350/.050. All 120 wrong keys have local lexical log evidence per ciphertext rune below -5.61, while the worst correct blind evidence is -2.213803. A local threshold -4 separates them; it is not the external quadgram scale, and the official wrong-key requirement is measured separately below. Model, thresholds and known-length use must not be conflated. The 3% OOV and mixture weights are design choices, not inferred Cicada parameters.

Reproduce: `node sims/lp2_vnull_lexical_posterior_sft.cjs`. [Reusable factory and test](../sims/lp2_vnull_lexical_posterior_sft.cjs) · [all raw rows and pinned source blobs](lp2-vnull-lexical-posterior-output.json). The exact V8 experiment body ran twice with identical aggregates before the factory extraction; the standalone wrapper is not yet independently Node-CI certified. The [official-checker adapter](../sims/lp2_vnull_c9_checker_adapter.py) selects between blind lexical candidate and public C3 skip beam using only explicit C,K,sign and candidate scores; [development harness](../sims/lp2_vnull_c9_development_sft.py) pins the external checker at fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb, uses public development seed 2969472026 and Mill/Frankenstein text, and runs isolated C3 plus the 40 scored V-NULL plants. 

| Official public development run | C3 | V-NULL ≥.85 | Mean positional | Median score | Wrong-key FP |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Initial hybrid](https://github.com/FlareZ123/liber-primus/actions/runs/45825089829) | 7/7 | 22/40 | .745 | -4.332 | 0/40 |
| [Checker-tokenizer and evidence-selector correction](https://github.com/FlareZ123/liber-primus/actions/runs/45825480691) | 7/7 | 27/40 | .805 | -4.322 | 0/40 |

The correction removes native ING/IO/QU substitutions in checker mode and selects a shorter replay-valid lexical candidate by its own evidence (threshold -4), rather than comparing normalized character scores across lengths. Both changes were made together, so their individual effects are not measured. The second run reuses the first public seed and text and is a development retest, not an independent holdout. A subsequent contextual extension uses previous complete GP word in the forward/backward state. For current word w and previous complete word u, the interior lexical mass is `(20 p(w)+count(u,w))/(20+count(u))`, where p(w) is the original smoothed unigram mass. The first truncated word does not set context, and the last prefix remains scored by the marginal prefix prior. The contextual state does not alter the event DAG. [Public development run 45825895397](https://github.com/FlareZ123/liber-primus/actions/runs/45825895397) gives C3 7/7, V-NULL **32/40**, mean positional .894479, median -4.321796, wrong-key FP 0/40. This reaches the numerical C9 threshold on the same development seed, not a sealed reviewer test. Frozen model at 206df0c4; [separate holdout harness](../sims/lp2_vnull_c9_holdout_sft.py) selects Bunyan/Bacon and independently drawn seed 18134686853033529934. No tuning on this holdout. [Holdout run 45826603908](https://github.com/FlareZ123/liber-primus/actions/runs/45826603908): C3 7/7, V-NULL **32/40**, mean positional .8996875, median -4.236238, wrong-key FP 0/40. Both public development and independently selected holdout meet the numerical gate; the external maintainer-sealed test and code review are still outstanding. No claim of formal external challenge completion.

## Original-input length-capacity gate

If V-NULL retains complete printed word boundaries (even allowing arbitrary whole-word permutation), each printed length is at least its underlying word length. For the 2,896 original complete groups and 12,956 runes, the source cumulative length counts for k=1..14 are `[83,531,1251,1764,2081,2337,2553,2709,2787,2839,2871,2889,2893,2896]`. Every candidate source word histogram must dominate this cumulative count at every k, and its total rune length m must be ≤12,956. This is the exact necessary sorted-length capacity test, independent of all key values and null placements. It differs from #1188's fitted one-extra-per-word mixture and adjacency-MI test.

Exhaustively evaluate all contiguous 2,896-word windows in four existing literary controls (Gibran, Shakespeare, Emerson, Orthodox prayers), using three fixed GP spellings: #1188 prior-native convention (apostrophe splits, raw text), native lexical convention and the C9 checker convention (apostrophes joined; strip Gutenberg). The largest compatible m across all windows and conventions is 12,119, requiring at least 837 inserted runes. The exact ideal-byte V-NULL rejection probability on any trial conditional on all earlier events is at most r=9/256*(1-.664/3.448)=.028386020881670533, since the byte reduction mod29 has maximum residue mass 9/256. This applies to independent uniform bytes (including the ideal-random-digest interpretation of SHA-counter), not arbitrary deterministic or correlated pads. Couple each rejection with a Bernoulli(r) upper bound. To emit ≥12,956 symbols while consuming m true runes, the first 12,955 trials must include ≥12,956−m rejections. Therefore P(length≥12,956) ≤ P(Binomial(12955,r)≥12,956−m). The first rune and any reset can only decrease rejection probability. Exact log-space binomial summation gives the following maximum log10 upper bounds within each donor/mode, or zero probability for deterministically incompatible windows:

| Register | Prior-native max m / log10 bound | Native max m / log10 bound | Checker max m / log10 bound |
| --- | ---: | ---: | ---: |
| Gibran | 11779 / -256.516 | 10975 / -797.045 | 11077 / -717.723 |
| Shakespeare | 11767 / -262.959 | 12013 / -143.293 | 12099 / -108.217 |
| Emerson | 12031 / -135.637 | 12119 / -100.621 | 11793 / -249.074 |
| Orthodox prayers | 11546 / -391.448 | 11418 / -473.751 | 11476 / -435.784 |

475,539 window/convention evaluations (overlapping, not independent corpora). 64 nonnegative-extension sorted-length controls preserve dominance. The strongest possible compatible finite-reference window requires a tail ≤10^-100.62075768; even a union over every evaluated window remains tiny. This sharply disfavors the joint intact-group + contiguous tested donor + independent-byte rejection model. It does not rule out differently distributed prose, resegmentation, non-contiguous donor material, or arbitrary nonrandom keys. It is not an unconditional theorem against V-NULL, and it supplies no key or plaintext. [SFT](../sims/lp2_vnull_original_length_dominance_sft.cjs) · [all counts, source blobs and exact tails](lp2-vnull-original-length-dominance.json). Executed in connected V8; standalone wrapper not independently CI-run.

The chapter-private extension grants each of nine source chapters its own arbitrary donor window, donor text, and GP spelling, with the same monotonicity constraint and free word permutation within that chapter. Across 4,557,867 chapter-window/convention tests, compatible maxima m are `[705,1102,1682,1842,983,1405,1628,2912,300]`, totaling 12,559; required nulls `[24,43,47,61,38,28,52,96,8]` total 397. The whole-book insertion-count upper tail is now 0.0653928, so the strong contiguous-full-book exclusion **does not extend to chapter-private sources** on this aggregate count. A bound on the particular simultaneous chapter-length threshold event is 10^-5.763633, not a calibrated joint p-value. The chapter-private maximum construction is not a recovered source or a decrypted word. These rows are in the same SFT and JSON.

## Original-input decision

No independently source-selected V-NULL key with a positive original detection has been identified. The previously tested p55 perimeter keys, historical keywords/prime shifts and all-key periodic capacities are already documented in the [perimeter inverse](../sims/lp2_p55_perimeter_vnull_lexical_sft.cjs), [event-DAG report](lp2-vnull-exact-event-dag.md), and [periodic capacity report](lp2-vnull-periodic-allkey-capacity.md); those are not new positive key candidates. Do not repeat their searches. The improvement is a known-key recovery instrument, not a key nomination or a change to the established plaintext frontier. A new authenticated key selector or flagged original candidate is the missing prerequisite.
