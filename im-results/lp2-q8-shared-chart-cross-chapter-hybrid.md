# Shared alphabet, private chapter keys: long-group hybrid receiver

Four dictionary-sampled synthetic controls recover the entire normalized chart, all 36 independently private q8 chapter keys (up to rotation), and admit all 720 untouched true words. Three development seeds plus one fresh control (2014). Original bounded search yields zero complete charts; no unknown plaintext/key, not an exhaustive exclusion.

## Method
Consuming C=pi^-1(pi(P)+k[j]); literal plaintext F holds, consuming ciphertext F legal. Gauge pi(F)=0, pi(U)=1. Arbitrary word starts, independently private chapter keys. The historical LP1 period8 key motivates q8, not this specific shared chart or clock. For a guessed word, active positions eight apart satisfy pi(C_i)-pi(P_i)=pi(C_{i+8})-pi(P_{i+8}). Two guessed words within a chapter give chart-only linear equations for each relative phase. Same-phase equality and zero-shift consistency filter options. GF29 RREF on 27 unknown coordinates, reject forced equal chart coordinates. Join pair states across different chapters without requiring the same shifts. Fallback extends a pair by a third word within its chapter. Rank>=23: enumerate all-different completions with <=4 free coordinates and a 50k node cap. Trie checks held and consuming F branches, requires anchor-chapter >=60% support including seed words. Score sums chapter maxima >=4 distinct-word votes; stop at >=120. Top64 candidate words per group, 28 diverse pairsets, 6m cross joins, 5m local extensions. Heuristic caps limit coverage.

| Input | Random replacements | Cross joins | Local extensions | Charts visited | Score | Exact keys | True holdout admitted |
|---|---:|---:|---:|---:|---:|---:|---:|
|3301|9|5293180|0|1|178|9/9|180/180|
|1033|8|592162|0|9|175|9/9|180/180|
|2016|5|6000000|24593|6|182|9/9|180/180|
|2014 (fresh)|12|39424|0|1|173|9/9|180/180|
|Original|—|6000000|5000000|0|0|—|—|

All four charts 29/29. Seed1033 actual votes178 including chapter with 3 votes omitted from score. Original cross joins 12423 consistent, 7455 rank>=23; local extensions 3656 consistent, 70 rank>=23; zero complete chart permutations; no reached completion hit node cap. No shorter original group scored. Controls independently sample weighted dictionary words, roughly 5% uniformly random non-F replacements (not guaranteed OOV), and 20 untouched length3–8 words per chapter. Holdout truth legality does not imply unique reading. Annealing baseline seed3301 failed, 2/29 coordinates (gauge only), no recovered keys; oracle eta=.01 score312.729 recovered all nine keys; random −139.449, annealed −73.2133.

## Reproduce
187 groups >=9 (1884 runes) from 2896 groups/12956 runes, chapter start offsets [0,729,1874,3603,5506,6527,7960,9640,12648,12956], counts [12,16,30,20,14,23,26,42,4]. Source resources/transcriptions/lp2-image-corrected.txt blob f7b534a33edeb212d427329798438325307463d7: first55 percent-separated pages (p50 omitted), remove whitespace and slash, join page seams, split on non-runes. Full sequence matches resources/liber-primus/lp2-corpus.json blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Dictionary resources/control/english_wordfreq_textblob.txt blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938; 29157 filtered lines match local installed TextBlob FNV1a c7c0f06d, 38910 GP forms. Executed local Linux g++; source/fixture exact blobs match; Windows untested.

```sh
g++ -O3 -std=c++17 sims/shared_chart/hybrid.cpp -o hybrid
./hybrid resources/control/english_wordfreq_textblob.txt im-results/lp2-q8-shared-chart-long.txt 3301 64 28 6000000
# repeat with 1033,2016,2014,-1 (original)
g++ -O3 -std=c++17 sims/shared_chart/chart.cpp -o chart
./chart resources/control/english_wordfreq_textblob.txt im-results/lp2-q8-shared-chart-long.txt 3301 3000 1
```

Extends pooled chart premise of #3046 (short-profile CP-SAT timeout) using long anchors, not a closure of that problem or p54-specific recovery. Avoid unmotivated cap sweeps; require materially improved anchor coverage or independent source evidence.
