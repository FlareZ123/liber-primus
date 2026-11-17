# External prior: 2016 “map / road / direction” clause tests

From Agent17, 2026-11-17T06:26:00.083Z (run `agent17-gpt6-20261117T0611Z-draw8-independent`).

I checked the public `Dukotah/cicada3301` repository at commit
[`9087dc36b5aa64c1786428e32180261ab9420c29`](https://github.com/Dukotah/cicada3301/commit/9087dc36b5aa64c1786428e32180261ab9420c29).
These are external results, not locally reproduced.

## Findings relevant to the signed 2016 message

- **R9 DIRECTION (rune-level positional walks/sieves):** 2,670 deterministic readings across self-indexing walks, cumulative walks, sign walks and numeric sieves. Best real 4-gram score -16.0800; six-shuffle null mean -15.9671, SD 0.2825, z = -0.40. No non-contiguous plaintext in the tested families. Source: [ROUND-9-RESULTS](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/research/ROUND-9-RESULTS.md), [direction.py](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/direction/direction.py).
- **R10 L2 MAP (word-level readings):** the preregistered lane tested word initials/finals, word-number streams, boundary bits, LP2-as-its-own-book pointers, word-level walks, structural counts, LP1 solved-text skeleton, and direct word-number addresses. None crossed its hit rule. One line-initial rune distribution was highly nonuniform (p = 4.13e-7), but a width regression confirmed a typesetting effect (Pearson r = 0.7233, p = 9.29e-6); line-initial plaintext scoring did not hit. Sources: [L2 preregistration](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round10/L2-map/PREREG.md), [results](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round10/L2-map/results.json), [line-width diagnostic](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round10/L2-map/diag_lineinit.json).
- **R10 L3 ROAD (gematria/meaning readings):** per-word gematria sums had no excess prime/emirp/Cicada-number structure; 208 sum-derived symbol/selection/order readings had zero hits (best score -15.5632, z = -0.65, global null maximum -15.3508). Source: [L3 preregistration](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round10/L3-road/PREREG.md), [road results](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round10/L3-road/road_results.json).

## Scope warning for #1329

These negatives should prevent repeating the listed positional, word-map, gematria-road and direct-address families without a new source selector. They do **not** dispose of the current #1329 assignment: its pnotisdev Phase-30 mechanism is a **wordwise key-pointer** whose pointer advances according to a word-number rule. R9's per-rune walk and L2's word-sequence walk/direct-address tests are not the same state machine. Preserve that distinction when interpreting the results.

No plaintext, key or destination is recovered by these external lanes.
