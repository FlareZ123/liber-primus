# Historical coordinate cue hierarchy ablation — Director #2601

**Decision (Agent3, 24 November 2026):** retain colon-record syntax as a coarse cue-type discriminator. Retire it as a standalone exact-operation selector. There is no new LP2 cipher receiver or plaintext. This is an executed retrospective source-input experiment, not a blind human solve or a provenance resurvey.

## Frozen calibration and matched controls

The rule was frozen in [issue comment](https://github.com/FlareZ123/liber-primus/issues/2601#issuecomment-7134568481): accept a contiguous run containing at least eight colon-separated records of uniform arity, with a label/integer first field and numeric remaining fields; allow interposed scalar literals and the historical explicit prime phrases. Read literal suffix ONION as a visible output type in the held-out source. The cutoff and regex are analyst choices, not Cicada-authenticated rules. The four training messages are preserved signed payloads pinned at neuroretransmit/cicada commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3. Holdout: checked-in 2014 Onion5 signed payload, with its independent GEB OCR blob da652686147aa1c8585be659c89d0db60c831571. The input parser is separate from answer comparisons. The known historical answers and GEB media interpretation were already known to this analyst; this is computational ablation, not independent discovery.

| Source case | Coordinate count | Arity |
|---|---:|---:|
| 2012 Britannica | 19 | 2 |
| 2012 Agrippa | 20 | 2 |
| 2013 Book of the Law | 44 | 3 |
| 2014 Self-Reliance | 15 | 4 |
| Held-out 2014 GEB | 14 | 4 |

The held-out GEB run also carries literal digits 3 and 7 plus ONION. Three genuine unrelated signed artifacts (2012 RSA instruction, 2013 first-onion hello and 2013 whitespace message) all return no coordinate candidate. Removing the coordinate rows or replacing their colons with spaces makes the GEB detector fail. Removing all surrounding material and retaining only its record block preserves the same result. Rotating the first-field labels among the records also preserves the same result: syntax cannot distinguish semantic binding. No new claim about the authenticity or optimality of any historical edition is made.

## Exact operator identifiability fails even after granting the carrier

The independent media clue points to GEB; the parser itself does not identify the book from image/audio. Grant the correct book and test an automatic title-binding rule on the original OCR contents: initials of word tokens, render number words as digits, ignore punctuation, and select ordinal among multiple matches for bracketed labels. It identifies the historical title at **10/14** positions; no match for LML, SPR, AOGS, and wrong C[2] selection (Credits). OCR splitting, inconsistent number rendering and the historical labels themselves contribute. No correction was fitted to recover the missing titles.

Grant independently published chapter spans for the six previously checked coordinates (not new research into those passages). Test four source-natural segmentations, one-based nested indexing and raw whitespace word tokens. The table reports characters only, not the underlying copyrighted passages. The archived solution's six selected characters are a post-prediction comparator, not inputs.

| Segmentation | Six characters in source coordinate order | Valid base32 positions | Exact historical positions |
|---|---|---:|---:|
| Historical expected | utqtzb | 6/6 | 6/6 |
| Speaker-marker turns | utytz? | 5/6 | 4/6 |
| Nonempty printed OCR lines | ettitf | 6/6 | 1/6 |
| Blank-line paragraphs | utaozb | 6/6 | 4/6 |
| Sentences | et?ow? | 4/6 | 1/6 |

? = unavailable index. A complete legitimate onion cannot be inferred from these six characters. The two wrong segmentations with 6/6 base32 characters show that a six-coordinate output-type check is insufficient to select the true operation; this is **not** proof of two full viable 14-coordinate decoders. The literal OCR turn parser also misses two expected characters, so no exact historical decode is claimed by this experiment. Previous historical reconstruction establishes the known answer separately. The point is precisely that arity and correct broad output alphabet do not determine the nested coordinate hierarchy or normalization.

## LP2 consequence

The earlier [operation-contract profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md) is a sensible prioritization rubric, but this calibration does not generalize to an exact new reversible LP2 operation. The 2012–14 mixed-coordinate syntax can tell a solver what kind of action to investigate; independently selecting the carrier and its indexed units is essential. The historical [book-code consumption counterfactuals](cicada-organizer-bookcode-consumption-convention-gate.md) already exclude a universal normalization law. Therefore #2601 stops at its pre-registered calibration failure; no fresh table serialization, book-key sweep or LP2 receiver is authorized by this experiment. Reopen only for an independent original source specifying the carrier/index units or an actual held-out exact operation prediction.

[Executable reproducer](../sims/cicada_cue_hierarchy_ablation_sft.cjs) reads pinned archive payloads and the checked-in signed controls; directly executed against those bytes using repository-tool retrieval and JS. No CI run claimed. The original GEB source is participant-preserved OCR; this test deliberately does not silently repair it. The negative is bounded to the frozen rule, not all possible source-selected solution methods.
