# PARABLE's 55 interior runes as a candidate per-page key tape

**Classification: new original-source structural candidate, with a decisive negative for one direct historical cipher transfer. No unknown LP2 plaintext recovered.**

## A literal human-readable operation

The final clear GP29 page, physical p57, is the PARABLE: “WE MUST SHED OUR OWN CIRCUMFERENCES ... FIND THE DIVINITY WITHIN ...”. This text was also present in the original 2013 `761.MP3` TXXX material, preceding publication of LP2. Removing the *first and last printed GP rune* from every word is a direct, reproducible interpretation of its instruction, with no key fitting.

The unmodified original p57 source has one seven-rune heading **PARABLE** and nineteen body words totaling **88 GP runes**, altogether **95**. Every word is at least two runes long, so each contributes exactly two removed exterior symbols. The heading yields the **five** inner runes `A R A B L`; the 19 body words yield **50** inner runes. Thus all twenty words supply **55** ordered internal symbols.

Separately, physical LP2 p0–p49 are **50 rune-bearing unsolved pages**. P50 is the original 32×8 numeric-only table. Physical p51–p55 are **five** additional rune-bearing unsolved pages. The total is **55**, agreeing with the new p57 inner-rune count, and the **50/5** split agrees with the page split around the table.

This is an exact, source-visible *candidate page-key capacity*. It supplies one fixed GP29 symbol per encrypted page without optimizing any original ciphertext. It is **not** proof of an intentional transfer. The original p57 heading prints *before* the body, whereas the original 50 pre-table pages come before the five post-table pages. Aligning body50→pre-table and title5→post-table requires an extra, currently unsupported two-block reordering. In literal printed order the key tape is title5 followed by body50 instead.

## Exact direct cipher test

One finite historical operation follows from the authentically solved p56: the GP29 prime-totient additive stream with plaintext-F transparency. A candidate p57 interior symbol can supply the page's first **zero-based prime ordinal**, and its prime-totient stream then runs until the page's end. This is a testable, source-shaped hypothesis; the book does not explicitly specify either the page-seed meaning or the reset.

All-path exact reachability retains every possible F-skip branch and requires each nontransparent decoded rune to be non-F, exactly as the solved p56 convention does. Genuine solved p56, seeded with prime ordinal zero, passes as a positive control. Both frozen readings of the 55-symbol p57 key tape were tried on all 55 unchanged unsolved pages:

| Rune-tape alignment | Pages with any full legal inverse | Impossible pages | First p0 contradiction (rune offset) |
| --- | ---: | ---: | ---: |
| Literal p57 title then body | **1** (physical p43) | **54** | 49 |
| Candidate table split, body then title | **0** | **55** | 109 |

The single p43 reachability exception is merely a legal F clock, **not** demonstrated grammatical plaintext; a complete 55-page solution requires all pages. The first 20 runes already exclude 31/55 literal-order pages and 25/55 proposed table-order pages.

A second exact, key-independent bound concerns the weaker scheme where each inner rune selects one fixed Caesar/substitution alphabet per page: for all possible 55 independently chosen GP29 permutations, **any specific plaintext rune** can occupy at most **767/12,956 = 5.92004%** of the printed unknown-page positions, because each source page's largest ciphertext-rune frequency bounds the count mapped to that plaintext class. This is incompatible with ordinary source-native GP English E frequencies around 12.8%, under unchanged segmentation and one stationary alphabet per page. It does not rule out evolving per-rune keys, a non-GP intermediate register or a page key that seeds a more elaborate cipher.

## Independent all-secret same-seed result

A new exact interpage test is now available in [the separate PARABLE seed-reuse equality gate](lp2-parable55-reused-seed-equality-gate.md). Under either title-first or body-first alignment, exactly **106 original page pairs** share a p57 interior seed. The observed GP rune equality at corresponding page-local positions is **785/22,716 (3.4557%)** or **826/23,150 (3.5680%)**, effectively the **1/29** random baseline, whereas matched independently normalized Gibran/Emerson native-GP English registers yield **5.95–6.33%** equalities. A secret identical bijection applied to both pages at each position must preserve these equalities, whatever its pseudorandom stream and changing alphabet. A native-English planted stream does preserve all counts. This conditionally excludes *any* same-seed, same-page-clock GP29 bijective keystream producing normal source-native English on these pages. Its exact scope is restricted to identical state initialization and output alphabets for equal seeds; page-unique IVs, feedback from differing page plaintext, or non-GP registers remain viable.

## Research decision

Preserve the **50/5 page-key capacity** as a novel candidate interpretation of PARABLE. Its first direct historical receiver, per-page initial-prime index under the authentic p56 F-transparent prime-totient stream, is excluded on the complete original ciphertext. The next necessary input would be a **first-party clue** selecting what each of the 55 interior runes actually controls (and whether the heading belongs before or after the body). Do not freely try 29×55 alternative shifts, row orders or cryptographic layers merely to rescue the count.

Inputs: [exact source rune corpus](../resources/liber-primus/lp2-corpus.json), [page-separated rune transcription](../resources/lp2-transcription.txt), [historical PARABLE and earlier word-circumference analysis](../im-results/instar-circumference-edge-strip.md). [Deterministic original-input SFT and solved p56 positive](../sims/lp2_parable55_pagekey_original_sft.cjs).
