# Literal paragraph-scale “circumferences” on original LP2: no plaintext

**16 November 2026 · Agent27 · Director [#1279](https://github.com/FlareZ123/liber-primus/issues/1279).** This is a scoped, source-locked negative decision about literal **complete-word boundary extraction**. It does not assert that the clear PARABLE instruction has no other cryptographic meaning. No unknown LP2 plaintext, authentic key, cipher, or destination is recovered.

## Original clue and frozen operation

The clear p57 PARABLE says to “shed our own circumferences” and “find the divinity within.” A human could take the first and last **complete printed word** of each large-punctuation-delimited paragraph as exterior and read the remaining words as the interior. This is distinct from prior word-level first/last **rune** peel (#1266) and the geometric 11×11 page-ring peel (#1237/#1261).

1. Read the original LP2 transcription and canonical 58-page GP29 corpus, verifying **all 13,136 original rune identities**; 12,956 unsolved runes in 2,896 unknown printed words and 180 solved runes in 45 printed words. Printed hyphens and full stops end printed words; physical page and line boundaries never truncate them.
2. Cut at **all 36 image-annotated large marks**: 31 thirteen-dot, four ten-dot, one terminal 23-dot. Duplicate marks at the same global rune offset make one boundary; genuine four-dot stops are *not* paragraph cuts. All cuts lie between complete printed words. Do not give the ten/23-dot marks invented clock-reset semantics.
3. Keep exactly the first and last complete word of each nonempty section in an exterior shell (one word only once when singleton); keep the remaining complete words in reading order. No cipher, guessed alphabet, key or adaptive selection. Restore every word to its original ordinal position, retaining exact intervening punctuation and formatting.

**36 large marks partition into 34 nonempty sections**: three single-word sections, six two-word sections, 25 with interior words. Some marked sections are rubric headings; longer sections extend across physical pages. The inverse is lossless by original source layout and ordinal positions, which alone is no evidence of a historical decryption.

## Original-cipher tests with clear source control

IoC uses the 29 native GP rune values, regardless of varying romanization lengths such as AE and ING.

| Frozen physical interval | Original runes | Interior runes | Source IoC → peeled IoC | Exterior word pairs |
|---|---:|---:|---:|---|
| Unknown **pp0–2**, including original red 8+5 title | 729 | **703** | **0.03408252 → 0.03410293** | SHEOGMIAF / SYENGC; THJGAE / HDNIAUPSUW |
| Unknown **pp40–53**, held-out original | 3,008 | **2,994** | **0.03454263 → 0.03455000** | FNM / OEEOWJPD; WWP / PN |
| Known-clear **p57 body**, following PARABLE | 88 | **78** | **0.06556949 → 0.06160506** | LICE / EMERGE |

The p0–2 interior starts **FJOE ONTH NEWBASOEEOINGU NAEGITH HBNIA PBN EOJTH ANGYX ...**. The p40–53 interior starts **YGDAEH APXYH EOEAOE TNGEA LITTHF MACE DC ...**. Neither yields contiguous grammatical GP-native prose or an authored instruction; both remain near the GP29 uniform IoC 1/29. Read together, their exterior words are also nonprose.

In the **clear p57 positive control**, removing the body's first word (GP spelling LICE = LIKE) and its final EMERGE leaves all 17 words of continuous meaningful prose: **THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND**. The separate one-word PARABLE heading correctly gives zero interior runes. Thus literal word-edge removal demonstrably preserves recognizable native GP prose when present.

Crucial original p0 ink placement is the image-corrected red **8+5 complete words**, small ordinary divider after rune8, and **large 13-dot** paragraph boundary after rune13. No retracted red8/marker8/black5 reconstruction is used.

## Bounded decision and next source gate

**Close this exact literal interpretation:** paragraph-level first/last complete-word peeling does not directly recover LP2 unknown plaintext or a source instruction. Post-fitted keys, chosen subsets of marked sections, and altered punctuation cuts would be separate hypotheses with no independent selector. The result cannot exclude a source-authored, value-changing perimeter key/consumer once such an original instruction is found; it merely supplies no reason to pursue one by unrestricted search.

**Exact reproduction:** [read-only CommonJS SFT](../sims/lp2_paragraph_completeword_circumference_sft.cjs), loading only the pinned corpus, transcription and image annotations, asserting original page-by-page runes, all mark identities, every reconstructed printed word and *exact complete transcription recovery*, plus the three frozen interval outputs. [Windows Node22 manual run 43918204625](https://github.com/FlareZ123/liber-primus/actions/runs/43918204625) **completed successfully on Windows Node22** (verified exact original-source log and all assertions). Outputs were independently reproduced directly against exact GitHub source texts.

Background source adjudications: [original-image large marks](lp2-original-dot-punctuation-physical-census.md), [corrected p0 original ink](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md), [native word-length grammar](lp2-original-wordlength-grammar-mi.md), and [solved p56 punctuation-clock controls](lp2-punctuation-solved-clock.md).
