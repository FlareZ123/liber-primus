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

## Independent lag-eight algebraic word-anchor inverse (14:56Z)

This is a different attack on the same recurrence. A candidate native GP29 word with at least 11 consuming runes gives at least three equations
`a P[i-8]+b C[i-8]+d=C[i]-P[i]` on the consuming tape. Subtract the first equation to eliminate d, solve the resulting two-variable system over GF29, enumerate its complete affine solution set if rank-deficient, and retain only nonzero a,b. The first eight consuming C−P values are the incoming queue; exact forward and backward recurrences then decode the adjacent tape. A zero ciphertext may be a held F or a consuming symbol. No printed word boundaries enter the adjacent-window scoring.

Vocabulary: 38,906 GP spellings, from the preserved TextBlob lexicon with native digraph variants and five native sections outside the four target controls. All four complete control sections are excluded from the language model and native vocabulary injection; train on 610 other native runes plus 6,000 donor runes. For each complete printed group with ≥11 nonzero ciphertext runes, examine every compatible dictionary spelling and every exact coefficient solution. Fit up to 48 physical runes on each side, then freeze the best path and decode 76 untouched runes on the longer available side. A three-rune group crossing the p33→p34 boundary is clipped only for context and is ineligible as an anchor; all source chapter rune tapes replay exactly. The original q8 assumption and intact anchor vocabulary are conditional, not source-authenticated.

### Control decision and separate support test

Seven eligible-size native control anchors across WELCOME, KOAN1, LOSS and second KOAN. Three genuine spellings are outside the vocabulary; all four in-vocabulary anchors yield exactly one correct coefficient/word combination. The fitted best model recovers all four correct triples and **304/304 held-out runes**, but fits 106/108, 64/68, 79/79 and 109/109 runes. The original predeclared strict perfect-fit gate therefore fails (2/4). The original strict mode stops before testing LP2; see [strict output](lp2-mixed-autokey-q8-algebraic-anchor-output.json).

A separate exact-support follow-up admits original anchor tests only on the algebraic criterion that every in-vocabulary native control's true model survives uniquely for its true spelling (4/4). This criterion was chosen after observing the strict fit failure, but before any original support-mode output, and does not rely on language scores. No strict predictive calibration is claimed. There are 43 original eligible anchors across all nine visual chapters; 33,431 word/triple combinations have exact anchor support, 4,997 also have at least one valid local fit, and six anchors have no legal local fit at all. Three long groups have **no dictionary word or feedback triple** even with arbitrary incoming queue:

| Chapter opening | Physical chapter offset (0-based) | Runes / nonzero | Exact supported word/triples |
| --- | ---: | ---: | ---: |
| p8 | 1531 | 14/14 | 0 |
| p23 | 529 | 14/13 | 0 |
| p40 | 813 | 14/12 | 0 |

Thus every such continuous q8 model requires at least these three anchors to be outside this finite vocabulary (or the groups are not plaintext words). This is a local necessary condition independent of the all-primer rank search, not an all-language exclusion. Of four original anchors with unique word/triple support, two cannot continue through the local fit, the p54 offset255 candidate COUNTERACTION has no legal frozen continuation, and the p40 offset2644 candidate TRANSCRIPTION produces nonprose at −6.0170 nats/rune. Across all 43 fit-selected candidates, eight admit the 76-rune continuation; best −5.2138 compared to the four true native anchor controls' −2.3720, −2.7323, −3.0378 and −2.3914. These original scores are diagnostic only because the strict calibration failed. No authentic plaintext.

[Reproducer](../sims/lp2_mixed_autokey_q8_algebraic_anchor_sft.cjs) (default strict mode; argument `support` for the separately defined support gate). [Per-anchor support output](lp2-mixed-autokey-q8-algebraic-anchor-support-output.json). Directly executed against GitHub-fetched canonical inputs in connected JS; no CI run claimed.
