# P55 cicada / 13–17-year periodicity: bounded hypothesis audit

**Classification:** intermediate negative result; not an established clue or cipher.  
**Reproduction:** [periodicity SFT](../sims/lp2_p55_periodical_cicada_periodicity_audit.cjs) · [Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44678846421)

## Why test it

The original p55 image contains a cicada and tree illustration; the canonical transcription has 17 printed words on p55; a terminal red 13-dot mark occurs at rune offset76; and the solved p57 text includes `EMERGE`. A human solver could reasonably notice the periodical-cicada association (13- and 17-year broods) and ask whether the manuscript is pointing to a 13/17-cycle. This is a hypothesis about a possible clue, not evidence that the author intended it.

## Discriminating tests

1. **Marker phase.** The corpus contains 30 red 13-dot markers. Their global rune-offset residues modulo13 are `[2,4,4,2,3,1,2,4,2,2,1,1,2]`; page-local offset residues are `[4,1,2,2,2,4,4,4,1,2,2,1,1]`; page-index residues are `[5,3,5,4,2,1,3,5,0,1,1,0,0]`. There is no single phase or concentrated modulo13 placement. The p55 marker is terminal at offset76, not a recurring 13-step boundary.
2. **Period17 repeating-key signature.** For the 12,956 unknown-page GP29 runes (p0–p55), the period17 mean column index of coincidence is `0.0343653` under a global clock and `0.0345609` when the key phase resets per page. The page-reset period17 profile ranks 13th among periods1–40; the global profile is not among the top15. These values are close to the uniform 29-symbol baseline `1/29 ≈ 0.034483`, not a distinctive period17 peak.
3. **Lag17 echo.** The fixed lag17 equality/MI test likewise shows no standout echo; the page-local equality rate is about3.5% and mutual information is about0.012 bits. This does not support a simple repeated 17-symbol clock.
4. **Period13 context.** The separate p0 13-rune red-title Vigenère-key candidate has already failed its fixed source-selected test; this audit does not reopen or retune it.

## Historical fit: both brood cycles occurred in 2014

The visual association is unusually well-timed, not merely generic: Iowa State University Extension documented 17-year Brood III emerging in Iowa, Missouri, and Illinois in 2014 ([11 April 2014 notice](https://yardandgarden.extension.iastate.edu/article/2014/04-11/cicadas.html)); Mississippi State University Extension records 13-year Brood XXII collections in Mississippi in 2014 ([brood distribution and collection history](https://accessibility.extension.msstate.edu/lawn-and-garden/ornamental-plants/distribution-periodical-cicadas-mississippi)). Thus the p55 cicada/tree, its 17 printed words, the terminal 13-dot mark, and p57 `EMERGE` could intentionally point to the **two 2014 periodical-cicada broods**.

This strengthens the motif as a historical/navigation clue. The fixed period17 repeating-key result remains negative; do not turn the 13/17 brood clue into a generic repeating-key search. A distinct candidate navigation consumer has now been identified: the article's 221-year coincidence and 2013–2015 brood sequence can select p50 table cells 221–223, then BASE29 and the signed 2016 word register. This is a conditional word-map route, not a periodic key or a p55 cipher.

## Candidate contemporary source: Science News, 13 July 2013

A much more specific source candidate is Susan Milius's *Science News* feature **“Mystery in Synchrony: Cicadas’ odd life cycle poses evolutionary conundrums”** (13 July 2013; [original issue PDF](https://www.sciencenews.org/wp-content/uploads/sites/2/2024/02/sciencenews20130713-dl.pdf)). It explicitly discusses the 13- and 17-year cycles, the evolutionary family tree of periodical cicadas, and the 2014 emergences of both 17-year Brood III and 13-year Brood XXII. Its page 27 figure contains a branching lineage tree and brood-distribution map. This source predates the May 2014 LP2 release.

This is a concrete candidate for the p55 tree/cicada illustration, 17 printed words, terminal red13 mark, and p57 EMERGE—stronger than a generic insect association. **No exact visual identity or copying relationship has been established.** Direct visual comparison remains uncompleted. A separate candidate table/word-map consumer is described below; it does not establish a pixel-level source match.

## Source-derived 221-year follow-up

The article explicitly states that 13- and 17-year broods synchronize only once every 221 years. This gives one more source-derived number beyond the earlier 1–40 period scan. Treating 221 years as a 221-rune period/lag is only a falsification experiment; the article does not prescribe that cipher operation.

| Test | Result |
|---|---:|
| Global period-221 mean column IC | 0.034793 |
| Uniform 29-symbol baseline | 0.034483 |
| Global period-221 IC rank among periods 1–500 | 103/500 |
| Page-reset period-221 mean column IC | 0.034444 |
| Page-reset period-221 IC rank among periods 1–500 | 160/500 |
| Global lag-221 equality rate | 0.036278 |
| Global lag-221 mutual information | 0.04627 bits |
| Global lag-221 MI rank among lags 1–500 | 185/500 |

The page-reset lag-221 comparison has only 1,685 pairs (3.09% equality; 0.416 bits MI). Nearby lags produce comparable or larger MI, so this sparse statistic is not evidence of a 221-step key.

**Decision:** reject a straightforward global or page-reset 221-symbol repeating-key/synchronization mechanism. This does not reject every possible narrative use of the cicada motif, nor does it test an independently specified map-based extraction.

## Historical source and surviving 2014 data

The magazine page-27 figure attributes its map to T. Sota et al./PNAS 2013 and Magicicada.org; page 28 directs readers to Magicicada.org for sightings and sounds. A later study of Brood XXII reports 5,216 verified presence/absence records collected in 2014 and 992 geolocated crowdsourced records submitted to Magicicada.org between 8 May and 15 June 2014 ([Kritsky et al., 2017, American Entomologist](https://doi.org/10.1093/ae/tmx066); [NSF-hosted paper](https://par.nsf.gov/servlets/purl/10063713)). The authors note that many public submissions clearly belonged to 17-year Brood III in the upper Midwest, rather than 13-year Brood XXII. Therefore the raw 2014 crowd-sourced set is not a clean Brood-XXII-only key.

UConn's retrospective on the site says its citizen-reporting and mapping functions were eventually retired as website technology changed, with citizen-science collection moving to Cicada Safari ([site history](https://draft.cicadas.uconn.edu/about-this-site/)). The 2017 paper and its figures are surviving documentary evidence of the 2014 data, but neither supplies a cipher operation or a unique LP2-selected coordinate.

## Direct image comparison status

The accessible PDF extraction identifies the page-27 figure as a brood-distribution map plus a labelled phylogeny with three lineages (Decula, Cassini, and Decim). It does not provide the figure's original image bytes for a pixel-level comparison with the p55 ornamental tree. No exact image match has been established. The evidence currently supports a thematic/historical association, not a verified copying relationship.
## Candidate table/word-map consumer (20 November 2026)

Treat the article's 221-year coincidence as the first zero-based address in the 256-entry p50 table, and use its 2013–2015 brood sequence for three successive cells. The original p51 tokens at indices 221–223 are 0q, 0p, 2V, decoding to 52, 51, 151. BASE29 gives [1,23], [1,22], [5,6]. In the signed 2016 43-word register, zero-based indexing yields THE ROAD / THE THE / EPIPHANY SEEKS; one-based indexing yields HELLO THE / HELLO IS / EMPTY EPIPHANY. The cells occupy row27, columns5–7 in the 32×8 table. The article's printed page-27 lineage figure and LP2 p27 insect motif are possible cross-references, not proof of the row-major address rule.

The value 151 also occurs at two opposite corners of the 5×5/1033 Stage10 square. The p0 phrase match is unblinded in this invocation. Direct additive GP29 tests using the table-value residues [23,22,6] and the full BASE29 digit stream [1,23,1,22,5,6], with both signs, fail on p55's 43 strict interiors and all 76 p55 runes. This is a candidate navigation/word-map route, not a p55 key or decryption. Reproducer: sims/lp2_cicada_article_row27_wordmap_sft.cjs.

## Interpretation

The fixed 13/17/221 periodic-key hypotheses remain rejected. A separate candidate uses 221 as a table index, not a repeat period, and maps the next two brood-year cells through BASE29 into the signed 2016 word register. It produces a promising set of word pairs, but relies on inferred zero-based table/word origins and does not decrypt p55 or supply a reversible operation. The natural direct additive keys derived from those values fail. No exact image match has been established.

Do not run more unconstrained period-13/17/221 key searches or arbitrary key searches. The useful next decision is an independent, preferably blind evaluation of the article→221→p50→BASE29→2016 word-map route and whether it predicts a withheld LP2 feature. Keep this note in im-results, not results.