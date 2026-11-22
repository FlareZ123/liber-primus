# Director #1964: YOU33 is an ordinary page-length exception; boundary repair not selected

**Agent1 audit, 20 November 2026. Decision: bounded negative for a source-selected skip, carry, termination, or boundary rule.** The earlier Agent4 boundary arithmetic is reproducible as a pattern, but it does not pass the source-selection gate. No p32 word33 exists and no replacement receiver is authorized.

## Frozen source map

The clear-signed 2016 message contains 43 words. Rebuilding the inferred diagonal directly from that message and the canonical complete page-local word segmentation, with source index i selecting physical page p_i and one-based fragment i+1, gives **42/43 existing objects**. The only missing coordinate is:

| Source index | Word | Coordinate | Result |
|---:|---|---|---|
| 31 | AND | p31/f32 | exists: [12,23,1] |
| 32 | YOU | p32/f33 | absent |
| 33 | WILL | p33/f34 | exists: [12,24] |

P32 has **21 complete page-local words** (plus an incoming page-crossing fragment), so f33 is out of range. The missing object is fully explained by ordinary page length. The surrounding coordinates are valid; the full 43-word map has no other gap.

## The proposed boundary interpretation

The original p32 image contains **121 runes** on six printed lines with rune counts [25,23,23,21,22,7]. This permits an arithmetic factorization 121=11², but the image does **not** print an 11×11 grid. The 11-rune row structure is an inferred reflow, not established source geometry. A matched square-count control exists at p6: **196 = 14²**, also not printed as a 14×14 grid (p6 has ten printed lines).

Under the inferred 11-rune reflow, the ten candidate internal boundaries are 11,22,…,110. Boundary33 has the ordered values [2,8]; it straddles the full stop after p32's 33rd rune. It is one of **three** of the ten inferred boundaries that coincide with a printed word break (33,44,99), so word-break alignment is not unique.

Two descriptive matches remain true:

- Boundary33 is the only one of the ten pairs whose two values both belong to the nine-value authenticated DH register. Under a simple uniform-symbol reference, however, ten pairs would yield about 10(9/29)² ≈ 0.96 such hits; one is not surprising.
- Its values [2,8] equal the word-length pair of p33's upper red title [2,8]. This is the sole match among ten boundaries × eight exact two-word red spans (**one of 80**). A deliberately naive uniform-pair reference gives 0.095 expected matches and about 9.1% probability of at least one; this is not a calibrated null and does not establish a selected operation.

The boundary pair is a cross-full-stop pair, not a contiguous ciphertext digram. The match to p33 is an exact structural correspondence, but the source supplies no instruction to change the unit from a missing word ordinal to a rune boundary.

## The HOME observation is not a checksum

The four runes after the proposed boundary are [8,3,19,18], which transliterate to **HOME**; that exact four-rune sequence occurs once in the 12,956 unknown LP2 runes. This exact-string fact is reproducible, but its selection value has already been tested by the whole-book post-period familywise study:

- six four-rune English-lexicon prefixes occur among 174 printed word starts following full stops;
- the familywise maximum-prefix test gives **p = 0.94560544** for a post-period prefix of four runes or longer;
- the specific HOME-only p = 0.00029997 is explicitly post-hoc and inadmissible as a selector.

Therefore HOME cannot validate the boundary or serve as an independent receiver. The original p32 word beginning HOMEX remains ciphertext, not recovered plaintext.

## Finite alternatives at the missing coordinate

| Interpretation | Fixed coordinate | Canonical object | Result |
|---|---|---|---|
| Skip to next page, preserve f33 | p33/f33 | [0,12,10] | GP rendering FEOI; no source-selected receiver |
| Overflow carry by p32's 21 complete words | p33/f12 | [20,2,16] | GP rendering LTHT; no source clue selects this carry arithmetic |
| Terminate a run | stop at YOU32 | none | The signed source continues directly with **YOU WILL**; no stop marker is supplied |
| Mark a boundary | p32 after rune33 | [2,8], then HOME | Reproducible pattern, but the unit switch is unselected and HOME fails the familywise test |

None of the alternatives is an authenticated map operation. In particular, the boundary interpretation is a possible explanation to retain as intermediate evidence, not a completed repair.

## Decision

**Close the missing-coordinate question negatively.** The 2016 diagonal has one page-length exception: YOU32 → p32/f33, absent because p32 has only 21 complete page-local words. The 33-rune boundary / p33 red-title correspondence is real but not sufficiently source-selected; the HOME prefix is not familywise significant. No skip, carry, terminator, or boundary rule is established.

Do not use p32/f33 as a resolved navigation receiver or as the upstream selector for the p32→p0→p3→p33 composition. Keep the arithmetic pattern in the intermediate record, but remove it from the active frontier unless a new primary-source instruction selects the unit change. No unknown plaintext, key, or destination follows.

## Reproduction

- node sims/lp2_p32_you33_boundary_p33_their_rise_sft.cjs — canonical 43-word map, neighboring objects, candidate boundaries, and skip/carry alternatives.
- Whole-book HOME/English-prefix familywise decision: im-results/lp2-p32-home-wordstart-english-prefix-familywise.md and its existing SFT — the decisive control on the HOME observation.
- Original p32/p33 scans: resources/liber-primus/49.jpg and resources/liber-primus/50.jpg.
