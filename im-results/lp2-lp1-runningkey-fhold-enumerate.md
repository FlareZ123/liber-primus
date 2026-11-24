# Complete enumeration of the surviving first-release running-key inverses

The preceding frozen exact all-origin F-hold reachability gate yielded 10/108 legal full chapters: 3 in p0–2 and 7 in p54–55; all other original chapters are impossible for every tested key family. Exact BigInt forward path counts (before decoding) total 319 paths, 284 for p0–2 and 35 for p54–55. Test every one, preserving six key tapes, signs, chapter boundaries, all origins and cyclic F-aware semantics. Retain forward reachability table, walk backward from every final cursor through every legal hold/consume predecessor, reconstruct exact plaintext and start cursor; assert each candidate reencryption reproduces every original ciphertext rune and the counted number of paths. Freeze plain GP native add-one trigram score trained on seven source-corrected LP1 sections (no cross-section trigrams); independent p56/p57 known plaintext scores give a permissive reference, use weaker of the two as threshold. No fit on original. Report all original path scores, maximum IoC, exact best candidate and any sustained intelligible output. 12 fixed-origin 100-rune positive plants exercise complete path enumeration and wrap; true path must appear. Since original source and key family are already selected, no new key transforms or short-path searches. A legal path or positive native score alone is not a genuine solution; exact full forward replay and sustained semantic prose are necessary. This is the actual inverse, not a reachability proxy.

## Executed full inverse

Frozen code 0bca32d7. All 12 fixed-origin plants contained their true complete plaintext path, with exact reencryption of every enumerated candidate. Original total **319** complete paths, 284 distinct plaintext tapes in p0–2 and 28 in p54–55 after cross-family deduplication. Every one of the 319 paths forward-replays its entire original chapter under its exact source tape, sign and start cursor. None meets the independent native control scores (p56 -2.833293, p57 -2.798481 nats/trigram). No sustained intelligible plaintext appears. The best original trigram score is -3.378495, maximum original IoC 0.036507. These scores are near uniform GP29; the best outputs contain scattered accidental words but no sustained prose.

| Source tape | Sign | Original chapter | Complete paths | Best start | Best end | Best native score | Max IoC |
|---|---:|---|---:|---:|---:|---:|---:|
| edited LP1 prime | 1 | p54–55 | 7 | 1569 | 1873 | -3.393899 | 0.035281 |
| edited LP1 prime | -1 | p54–55 | 2 | 809 | 1116 | -3.387420 | 0.035027 |
| source-corrected LP1 prime | 1 | p54–55 | 7 | 1567 | 1871 | -3.393899 | 0.035281 |
| source-corrected LP1 prime | -1 | p54–55 | 2 | 809 | 1115 | -3.386644 | 0.035154 |
| printed LP1 index | 1 | p0–2 | 72 | 922 | 1632 | -3.388116 | 0.034908 |
| printed LP1 index | 1 | p54–55 | 8 | 2681 | 189 | -3.378495 | 0.036507 |
| printed LP1 index | -1 | p0–2 | 180 | 537 | 1252 | -3.389390 | 0.034670 |
| printed LP1 prime | 1 | p54–55 | 1 | 44 | 349 | -3.399798 | 0.033758 |
| printed LP1 prime | -1 | p0–2 | 32 | 2101 | 14 | -3.413793 | 0.034855 |
| printed LP1 prime | -1 | p54–55 | 8 | 1360 | 1664 | -3.393569 | 0.036169 |

The all-origin, all-hold inverse is complete for the stated model, not a beam or a language-led search. Unlike a pure feasibility negative, it actually reconstructs and checks all surviving original plaintext candidates. No unknown plaintext or authentic key. It does not exclude other source transformations, a multilayer decoder, or source text used as an indirect key operand. [Compact result](lp2-lp1-runningkey-fhold-enumerate.json) stores each path's origin/end/score/IoC and complete best plaintext per family. Reproducer `node sims/lp2_lp1_runningkey_fhold_enumerate_sft.cjs --original` prints all 319 full candidate tapes. Connected V8 execution, no independent CI.
