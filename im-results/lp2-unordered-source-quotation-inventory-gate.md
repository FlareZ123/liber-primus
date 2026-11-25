# Source-selected unordered quotation inventories: exact complete-window test

## Decision

Director [#2677](https://github.com/FlareZ123/liber-primus/issues/2677): no exact unordered whole-word length inventory match for any of the nine complete illustrated chapters or four longer original quotes (13–34 groups). Three tiny quotes (2,4,5 groups) have 212,42,81 matches, respectively, and unrelated literary controls match at these sizes 96.7–100% of the time. No distinctive candidate word multiset survives to a cipher compatibility test. This retires the fixed source register under the intact-shuffled-word hypothesis, not every possible quotation or changed segmentation.

## Frozen sources and distinct test

Use the creator-era part of #333's registered source corpus (11 files, excluding later 2016/2017 messages), the archived 2012 Agrippa poem's pinned derived GP lengths, the exact historically selected Emerson Self-Reliance text (2014 archive, [immutable blob](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/self-reliance.txt), SHA 12a6bc018047a1276e77f2b7f633d5905732fff9) and seven authentic solved LP1 native sections. The exact GEB edition is not pinned in the current source register and was not silently substituted or screened. No other source is added after target scoring. The 20 source series contain 19,460 normalized groups; all repository input blob SHAs are embedded in the SFT, including the original corpus and punctuation spans.

English normalization uses internal apostrophes without extra groups, QU→CW, V→U, K→C, Z→S, greedy ING then TH/EO/OE/AE/IA/EA/NG. Source-native rune lengths use native group punctuation directly and retain internal apostrophes. Genuine p57 gives exact normalized group lengths as a positive check. The old #333 ordered exact crib search, #691's large unrelated quote corpus and #2176 order permutations do not test unordered inventories; this screen deliberately grants *every possible order* to the whole candidate word multiset. It does not permit omitted, inserted or partial words.

Parse original source exactly to 2,896 complete groups and 12,956 rune indices. Use the nine illustrated chapters and seven quote spans from the fixed punctuation annotation, all ending and starting at complete group boundaries. For each of 15 distinct group counts, build an index of the exact full length-count vector for every complete contiguous window of that size within one source series. No joining across source files. There are 264,988 distinct source-window/size pairs (one size shared by two targets).

## Original complete-window results

| Scope | Groups | Runes | Exact candidate windows |
|---|---:|---:|---:|
| p0–2 |158|729|0|
| p3–7 |255|1145|0|
| p8–14 |383|1729|0|
| p15–22 |437|1903|0|
| p23–26 |224|1021|0|
| p27–32 |326|1433|0|
| p33–39 |378|1680|0|
| p40–53 |669|3008|0|
| p54–55 |66|308|0|
| quote [1659,1677) |4|18|42|
| quote [5459,5478) |5|19|81|
| quote [9715,9727) |2|12|212|
| quote [9811,9869) |14|58|0|
| quote [10211,10279) |13|68|0|
| quote [10279,10439) |34|160|0|
| quote [12522,12592) |14|70|0|

All long targets fail exact compatibility, independent of key or group permutation. Tiny targets are nonunique even before language and cipher constraints.

## Calibrated discrimination

2,000 full target-family trials select random unrelated complete Gibran (15,696 words) or Shakespeare (54,189 words) windows of each target size, against the same indexed source register. Tiny two-group match rate 1.000, four-group .9885, five-group .967; 13-group .462, 14-group .389/.3895, 34-group .0075; 66-group .001, and all longer targets zero. At least one hit occurs in **2,000/2,000** full families (because the two-group windows always match). The only actual matches therefore cannot support a distinctive candidate inventory after familywise consideration.

Fifteen independently selected in-register positive windows (one for each size) are permuted before lookup; all 15/15 recover their exact inventory among candidates, showing the method grants all shuffled-word orderings. This is an inventory control rather than actual plaintext recovery. The genuine native LP1 input is part of the source hypothesis, not an independent original LP2 holdout.

No statistically distinctive actual word multiset survives, so the authentic cipher/bipartite compatibility stage is not justified. No unknown plaintext, key or destination.

## Reproduce

Download the pinned Self-Reliance source above; from repository root run:

```
node sims/lp2_unordered_source_quotation_inventory_sft.cjs path/to/self-reliance.txt
```

[Standalone SFT](../sims/lp2_unordered_source_quotation_inventory_sft.cjs), commit 7aa6ff614ecd6e54d009525c1e42c027f536b0c8. The experiment executed from fetched source texts in the JavaScript runtime; no CI run claimed. Do not broaden this into an indiscriminate corpus sweep without new source evidence. An authenticated exact GEB excerpt/edition, genuinely independent known plaintext multiset, or a cipher convention that changes group lengths would be distinct future inputs.
