# Ciphertext duplicate deletion: exact native-F periodic-key receiver

**Decision:** length-changing soft duplicate deletion is a distinct explanation for the adjacent-doublet deficit, not stochastic V-BACK (which preserves length). An exact maximum-path receiver recovers the starting phase on all eight known-key native plants, with 26 total Levenshtein edits in 1,176 planted plaintext runes. Neither historical fixed key recovers original LP2 prose under this receiver. This does not exclude unknown keys, alternative deletion laws or other representations.

## Sender and inverse

For fixed cyclic offsets K and phase s, plaintext F emits 0 without advancing; otherwise emit x=(p+K[s]) mod29 and advance s. After encryption, if x equals the last retained ciphertext rune, delete x with probability .81; otherwise retain it. A retained repeat has probability .19. Deleted ciphertext still consumes the ordinary native key clock. This exploratory model is motivated by observed repeat suppression; no historical deletion instruction is established. It differs from backward/forward skip, redraw and inserted-null models. Printed word lengths need not equal plaintext lengths.

For each observed rune, maximize joint log probability over (key phase, last two plaintext runes). Before the next observed rune, close all possible hidden deletion edges emitting the previous retained ciphertext. Negative log probabilities make deletion edges strictly costly; max-heap relaxation terminates on the finite state space and finds the optimum without a deletion-count cap or beam (floating-point tolerance 1e-12). Then traverse all native-F preimages of the next observed rune, applying log(.19) for a retained repeat. Initial phase is uniform over the complete key cycle. No trailing deletions are modeled after the last retained rune; control prefixes end at the last retained rune. Exact replay includes the chosen deletion path and verifies every original ciphertext rune.

Train interpolated native GP trigram probabilities on the first five records in resources/external/relikd-solved-gp29-native-v1.json, unigram add-.5 and backoff pseudocount 10. Freeze historical WELCOME offsets [23,10,1,10,9,10,16,26] and KOAN offsets [0,10,4,0,1,19,0,18,4,18,9,0,18] from the [validated native key report](lp2-native-key-postshuffle-phase-graph.md). They are candidate LP2 keys, not authenticated LP2 operands.

## Planted and original results

| Key | Donor | Plaintext runes | Deleted | Inferred deletions | Edit distance | Phase recovered |
|---|---|---:|---:|---:|---:|---|
| WELCOME | jpg107-167 |319|15|15|8|yes|
| WELCOME | jpg229 |89|4|3|1|yes|
| WELCOME | p56 |85|0|1|1|yes|
| WELCOME | p57 |95|7|7|0|yes|
| KOAN | jpg107-167 |319|9|10|5|yes|
| KOAN | jpg229 |89|7|6|5|yes|
| KOAN | p56 |85|1|1|2|yes|
| KOAN | p57 |95|4|3|4|yes|

| Key | Original scope | Retained runes | Inferred deletions | Joint nats/retained rune | LM nats/plaintext rune |
|---|---|---:|---:|---:|---:|
| WELCOME | opening body p0–2 |716|70|-4.629842|-4.187652|
| WELCOME | terminal p54–55 |308|26|-4.527928|-4.137909|
| WELCOME | full |12956|1406|-4.570327|-4.092187|
| KOAN | opening body p0–2 |716|87|-4.421130|-3.907831|
| KOAN | terminal p54–55 |308|42|-4.397115|-3.822611|
| KOAN | full |12956|1556|-4.451975|-3.942015|

Controls have genuine held-out native language but artificial ciphertext and known keys. They are not sealed unknown-key controls. All eight phases recovered; one plant exactly recovered. Deletion locations and plaintext are not always identifiable. Full original candidates require ~10.9% and 12.0% additional hidden runes relative to observed length, compared with much smaller planted rates. Their decoded paths remain nonprose. Opening and terminal permit independent starting phases and do not assume printed boundaries are true plaintext boundaries; the full-tape run assumes one continuous key clock across all unknown chapters. Full WELCOME candidate starts `CWHDAEOURMEACBHCHHUCSLUGGSEAUEANYLLUCNGTHOTHDAWEAAAEUNGSJDWHBEOULSTHINGSJIBDPEOHEF`; full KOAN starts `SWEAOBSNLSHEHBCUNGGWFWRDNPNHOWTIAAYEDUNGEONSTHIUEBLDARBLNTHWTHDTHYAEPCRENIAMIGFX`. These are not recovered phrases.

This is a fixed-key negative, not an all-key theorem. The next useful question is whether an unknown-key deletion-aware receiver can recover blind keys or whether an independent historical source selects another key. No new authenticated key, plaintext or destination.

Reproducer: `node sims/lp2_ciphertext_duplicate_deletion_viterbi_sft.cjs`. Core actually executed in connected V8 with exact repository inputs; standalone Node wrapper not separately run.
