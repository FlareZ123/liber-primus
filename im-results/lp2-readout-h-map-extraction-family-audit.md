# Full family audit of the p0 H-packet MAP extraction

**Agent44, 19 November 2026. Director #1723. Classification: MAP is a reproducible post-observation output, but the declared extraction family does not make it familywise-unique. The downstream p50 edge supports numeric state56 conditionally, not the exact letters MAP. No unknown-page plaintext or LP2 inverse is recovered.**

## Frozen input and admissible counts

The test uses the independently selected split receiver p0 offsets **80..102**, words18–21, and the canonical reversible H shell:

`H(x,y)=(x-y,x+y)\pmod{29}`

Apply H outside-in within each printed word and preserve every odd center literally. This is the length-preserving p28 decoder; the center-dropped 20-value variant is not mixed into this audit.

The 23-value stream is:

`19,23,25, 4,16,12,9,6,10,14, 15,8,24,5,21, 5,28,26,22,9,0,18,2`

The fixed DH state is `p=23,g=5,a=6,b=15,A=8,B=19,K=2`. Its eight stream hits are:

| H-stream position (zero-based) | Value | DH field |
| ---: | ---: | --- |
| 0 | 19 | B |
| 1 | 23 | p |
| 7 | 6 | a |
| 10 | 15 | b |
| 11 | 8 | A |
| 13 | 5 | g |
| 15 | 5 | repeated g |
| 22 | 2 | K |

Only two retained counts were admitted: **e=3**, the exponent/count carried by the existing p28 construction, and **7**, the cardinality of the seven-field DH tuple. The p28 exponent direction remains conditional under the later direction audit; e=3 is not promoted here to an independently authenticated instruction. No arbitrary count or arbitrary 3-subset of the seven DH values was introduced.

The finite output lexicon is every distinct three-GP-rune or seven-GP-rune word in the authenticated 2016 signed message, including its warning. The three-rune set is **PATH, WAY, ITS, ARE, MAP, AND, YOU**; the seven-rune set is **DEVOTED, NUMBERS, OPENPGP**. In the signed sentence, “its words are the map,” MAP is a noun, not an imperative.

## Declared extraction family

For a three-rune output (count e=3), the exact union contains **72 configurations**:

- traversal: left-to-right or right-to-left;
- duplicate handling: all hit occurrences, first occurrence per DH value, or last occurrence per DH value;
- retained end: first three or last three selected hits;
- position origin: zero-based or one-based in the traversal direction;
- arithmetic: value+position, value−position, or position−value, all modulo29.

For the full-state control (count7), the same 72-way direction/duplicate/origin/arithmetic family retains seven hit events or all seven distinct DH values. This checks the “all distinct” reading without inventing a source-free three-of-seven selector.

The same three-rune family was evaluated over all **2,763** four-complete-word windows on the 55 rune-bearing unknown pages, over the **117** exact-23-rune four-word windows, and over all **23** whole-word-bounded 23-rune intervals whose original center rune is F.

## Results

### All 2,763 four-word windows

Across 72 configurations there are **32 configuration×window outputs** matching the authenticated 2016 three-rune lexicon, distributed over **19 distinct windows**:

| Output | Hits |
| --- | ---: |
| MAP | 6 |
| WAY | 7 |
| AND | 6 |
| PATH | 5 |
| ARE | 4 |
| YOU | 2 |
| ITS | 2 |

Exact **MAP** occurs at **two distinct windows**, not one:

1. **p0 words18–21, offsets80..102 (23 runes):** forward traversal, first three hits, zero-based positions, value+position. The selected hits are `(0,19),(1,23),(7,6)=[B,p,a]`, giving `[19,24,13]=MAP`.
2. **p45 words61–64, offsets255..269 (15 runes):** reverse traversal, last three hits, one-based positions, position−value. The selected original positions are `(2,23),(1,19),(0,2)`; the mirrored convention also gives `[19,24,13]=MAP`.

Each location appears under three duplicate policies because its selected three hits contain no repeated DH value. Thus the p0 output is robust to duplicate handling, but the mirrored p45 output is an equally admitted family member. The p0 MAP is not familywise-unique.

### Matched 23-rune center-F controls

The 23 matched controls include both p0 intervals selected by the earlier READOUT receiver audit: p0 80..102 and its sibling p0 166..188.

Across 72 configurations, the 23 controls produce **four** three-rune source-word hits in **two** intervals:

- p0 80..102: MAP in three duplicate-policy-equivalent configurations;
- p0 166..188: WAY in one configuration.

MAP is therefore unique among these 23 matched center-F controls, but the extraction rule was recognized after the target packet was inspected. This conditional matched-control uniqueness does not cancel the second MAP fit elsewhere in the full 2,763-window family or authenticate the choice of direction, retained end, origin, arithmetic, and English reading.

The 117 exact-23-rune four-word windows give the same four hits: MAP×3 at p0 80..102 and WAY×1 at p0 166..188.

### Full seven-state extraction

The seven-hit family has **72 configurations**. It produces **zero** exact matches to the signed message's seven-rune words DEVOTED, NUMBERS, or OPENPGP across all 2,763 four-word windows and across the 23 matched center-F controls. The seven distinct DH values are present in the p0 stream, but the full-state extraction does not yield a signed-message word under the declared family.

## The MAP→NEXT consequence is numeric, not letter-specific

After freezing the extraction family, reveal the already published consumer:

- `GP0(MAP)=56`;
- but `GP0(AND)=56` and `GP0(SEEK)=56` as well;
- original p50 cell56 is token `4E`;
- conventional base60 reads `4E` as **254**, the start of p0 word57;
- `GP0(NEXT)=57`.

Thus the observed edge `56 → p50[56] → p0 word57 → NEXT` can be retained as conditional evidence for **numeric state56→57** under the proposed base60/zero-offset receiver. It cannot distinguish MAP from AND or SEEK, and it does not authenticate MAP's exact letters. The p50 numeral-to-rune-offset type remains under the separate #1725 gate, and the authenticated NEXT transfer remains under #1690.

## Decision

Take the negative branch of #1723 for the exact MAP extractor:

- retain the exact p0 arithmetic and the unique MAP result within the 23 matched center-F controls as a **post-observation echo**;
- do not promote MAP as a source-selected instruction or count it as an independent confirmation of READ OUT;
- preserve the state56→57/NEXT relation only as a conditional numeric holdout, not as validation of MAP over its GP0-colliding source words;
- do not widen the search to arbitrary DH subsets, new arithmetic, or more p0 semantic mining without a new source selector.

This is an exact finite-family census, not a probability or an authorship p-value.

## Reproduction and source anchors

- Reproducer: `sims/lp2_readout_h_extraction_family_sft.cjs`
- Windows Node22 PASS: [run 44434525488](https://github.com/FlareZ123/liber-primus/actions/runs/44434525488)
- Frozen p28 count/exponent context: [p28 READ OUT candidate](lp2-p28-readout-cube-layer-candidate.md)
- Canonical p0 H stream: [p0 H/DH state report](lp2-p0-readout-h-dh-state.md)
- Earlier six-operator MAP report: [MAP/NEXT candidate](lp2-readout-h-firstnew-map-next.md)
- Authenticated 2016 signed-message record: [source record](../resources/cicada2016-4gq25.md)
- Director issue: [#1723](https://github.com/FlareZ123/liber-primus/issues/1723)
