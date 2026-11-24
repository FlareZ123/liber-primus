# Mixed GP29 plaintext/ciphertext-fed autokey: constructive q13 inverse

**Agent3, 24 November 2026, independent fallback after #2600/#2601.** No recovered unknown-page plaintext. Both hidden native control keys and 152 withheld runes recovered exactly. The frozen original p54–55 predictive transfer fails linguistically; the broader mathematical family is feasible and has not been excluded.

## Mechanism and why it is distinct

The independently solved LP1 ciphers supply period-13 additive state and the authentic plaintext-F hold. Earlier direct plaintext-fed and ciphertext-fed autokey attacks are separate cases, not a test of simultaneous feedback. This bounded constructive search grants both components an unknown nonzero coefficient and an arbitrary offset, with no plaintext crib or printed word boundaries. No original clue establishes this joint recurrence; the source prior is the historical additive/F clock, not the proposed joint feedback law.

For each consuming rune, with a 13-lane circular queue, C=P+K mod29 and the active lane updates as K'=aP+bC+d mod29. Plaintext F emits zero and holds the entire queue. a,b in 1..28; d in 0..28. The autonomous a+b=0 subfamily is included. The inverse is P=C-K and K'=-aK+(a+b)C+d. Under any fixed literal-F mask every current lane state is an affine function of its own unknown initial seed. Because a is nonzero, the slope never vanishes; at each consuming rune precisely one seed is forbidden by P=0. Intersect its 29-bit support exactly. Sum unigram scores of each allowed lane seed; both the marginal under uniform primer seeds and the maximum over all primers factorize. This avoids searching 29^13 primers. Exact cyclic bigram and trigram MAP then use the existing reusable solver.

## Frozen control/receiver and result

Original p54–55 has 308 runes; train only on the first232, with three ciphertext Fs (eight masks). Hold out all 76 remaining runes. Every one of 8×28×28×29=181,888 model/mask combinations is examined by exact unigram marginal; top128 receive exact bigram MAP, top12 exact trigram MAP. For each candidate, freeze all three coefficients, all13 primer runes, and the selected prefix hold mask. Exhaust every suffix F mask without changing any prefix choice. Rank suffix paths only by native trigram score; exact re-encoding required for every reported continuation. This is exact within each refined model, but **not exhaustive across all models at trigram order**.

The language model excludes both full control sections, includes seven other authentic solved sections (1,444 runes) and the first2,000 GP runes of each of three preserved English donors (Gibran, Shakespeare, Emerson). The short donor extracts include source-front matter; this is a finite scoring model, not a comprehensive natural-language guarantee.

The two independent native plants are selected only to match original prefix ciphertext-zero count3, with two actual plaintext Fs and one encrypted-to-F zero. No output language score selects the primer: deterministic lane-support DP chooses a primer that supplies that count. They are a deliberately workload-matched positive calibration, not random unconditional key recovery statistics.

| Case | Hidden (a,b,d), mask | True model ranks (uni/bi/tri) | Best possible prefix unigram/rune (all models/all primers) | Frozen suffix trigram/rune |
| --- | --- | --- | ---: | ---: |
| Native KOAN1, offset0 | (13,7,2),5 | 1/1/1 | -2.8909413010 | -2.4128472363 |
| Native LOSS OF DIVINITY, offset25 | (28,5,11),6 | 1/1/1 | -2.9789502389 | -2.8412028812 |
| Original p54–55 | unknown | N/A | -3.2572265177 | -5.6094143807 (best of six legal candidates) |

Both best controls recover the exact 13/13 primer, exact 232/232 training runes and exact 76/76 withheld runes; full 308/308 replay. All 181,888 models have some legal original prefix primer, so no general algebraic contradiction. Six of twelve frozen original candidates have a legal full continuation. The best prefix trigram total is -975.6752473059 (a,b,d)=(13,28,7), mask5; its suffix has three legal paths and the best remains nonprose. Its rendered prefix starts ONRPTPCTWEWYWHESJTHANGMITMTHETONGIAHUCELIOXSCLFORBY and the chosen suffix begins NGOERTLXDOENCSIAWREFTOEECTHESEEOFIOELBLCTEOBIADRLLPOEW. These are optimizer outputs, not recovered words.

**Decision:** retire this bounded q13 p54–55 ranked-search prediction; preserve exact per-lane all-primer method for independently selected receivers. The lower all-model unigram maximum is useful finite-LM evidence, not an exclusion of all prose or all mixed-autokey keys. No retuning against this holdout.

[Runnable CommonJS SFT](../sims/lp2_mixed_autokey_q13_fhold_sft.cjs). Directly executed locally in Node22 against source-derived encoded data with all FNV input checks matching repository retrieval; re-run from repository root for full JSON. Local canonical source files were unavailable to shell due DNS restriction; normalized input was transferred from the GitHub tool and checked against independently computed FNV values. No CI run claimed. Ranker was not adapted after original scoring.
