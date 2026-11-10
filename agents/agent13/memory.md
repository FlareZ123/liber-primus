# Agent 13 research continuity

## Current incarnation: 2026-11-10 05:37 UTC, run agent13-20261110-jpeg-structural-entropy-bc12

Claimed Agent 13 lease in commit `1ace531a825132d3089a12a1ba069e0353dcffbf`. The user prioritizes genuine LP2 plaintext/key recovery over repeated provenance audits.

**New, completed source-clue word-order test:** investigated standard Josephus elimination of intact LP2 ciphertext words, with manuscript-derived steps `5,23,29,53,91,256,809,1033,3299,3301`, each applied forward/inverse within 55 pages, eight sections, or globally. Reused canonical parser with all 32 page-spanning words intact. All 60 settings and 1,500 matched page-inventory shuffles completed in on-demand [Actions run 42766559429](https://github.com/FlareZ123/liber-primus/actions/runs/42766559429). The best original result (global step23 forward, mean log-odds -0.01447353) was exceeded by 1456/1500 null selected-family maxima (p=0.970686). Fixed source-clue 809 p=0.408394. A *real held-out English planted Josephus* was perfectly inverted; correct decoder ranked 1/60. Code `sims/prime_josephus_word_order.cjs`, workflow `.github/workflows/prime-josephus-word-order.yml`, report `im-results/prime-josephus-word-order.md`. No plaintext or key, no plausible lead. Do not extend with unmotivated larger Josephus step scans.

**Other existing research context:** The exact 2^32 Py2.7 MT keyskip1 seed scan is already complete (`im-results/py27-mt-s2-tail.md`), no authentic decipherment. PHP MT classic full-space under 8|5|4 opening crib also complete with no valid 2-word path. LP1 JPEG05 reversed-mirror square pad scans and LP2 grid direct-JPEG pad scans are already done by this identity and Agent38. The 51-rune red p53 passage was exhaustively tested under period-1..11 keys, arbitrary fixed substitution and optional one-rune per word with matched nulls (`im-results/lp2-page53-red-verse.md`). No need to retread. Architectural joint forward model in `im-results/lp2-forward-generator-joint.md` reproduces most measured nonplaintext constraints but fails independently chosen lag6 and lag5 anomalies; it has no demonstrated invertible original-source key.

**Highest-value unexplored direction:** recover key material from independently sourced original 2013–2014 puzzle artifacts or identify a source-clue transform that produces *an explicit, repeatable inverse and a withheld ciphertext plaintext prediction*. The 5x5 square has already been thoroughly searched as a literal stream and as 1033/3301 LCG. Avoid further broad ungrounded seeds.

---

## Prior incarnation and preserved evidence


**Identity claim:** `agents/agent13/.lease.json`, run `agent13-e2ee4d47f05c48fcab667e35e88ee99b`, originally claimed **2026-11-10T02:16:21Z**. Check elapsed time with a real clock after every checkpoint. Do not refresh the lease. At >=70 minutes, push all useful state, then delete and push the lease as final mutation.

## Contribution: numeric affine-order probe

- `sims/affine_triplet_order.cjs`, `.github/workflows/affine-triplet-order.yml`, `im-results/affine-triplet-order.md`; successful Actions [42744399513](https://github.com/FlareZ123/liber-primus/actions/runs/42744399513).
- Input 55 rune-bearing pages (12,956 indices), exact within-page triplets `(C[i-2s],C[i-s],C[i])` for `s=1..8`. Tested modular affine ratio `(z-x)/(y-x) mod29` on all-distinct triplets against 1,000 global alphabet-label permutations, with correction for maximum across 8 lags.
- Strongest at stride2 chi-square **35.30769**, familywise empirical p **0.5904096**. Synthetic 20% recurrence slope2 plant passed, p=0.0066225. Bounded negative, no plaintext.

## Contribution: literal image-pad candidate from LP1 05.jpg

- The **only** original JPEG with appended data is `resources/liber-primus/05.jpg`: **72,700 bytes after EOI**, byte-for-byte the reverse of its first 72,700 bytes. SHA-256 full file `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`, consistent with supplied ZIP. No independently encoded payload in this trailer; provenance/intent is *unknown*.
- Hypothesis: image bytes supply additive mod29 key, possibly with repeat-suppression key skips. Implemented exact skip-aware trigram Viterbi, control-validated, plus fast deterministic 24-rune head screening and full 220-rune confirmation.
- `sims/mirror_jpeg_pad.cjs`: 80 initial configurations + 24 pad-rotation nulls, tested heads on pages 0,1,20,49,51,55. No signal, p=0.64 on page0. Positive control in high-entropy bytes recovered 180/180 and 4/4 skips.
- `sims/mirror_jpeg_offsets.cjs`: **576,328** head candidates covering 72,041 mirrored-trailer starts × original/reversed × {mod29, scaled29} × both signs. Best full220 score **-5.20918**, no readable text. Planted key offset 12345 ranked #1 /72,041, recovered 220/220 and 8/8 skips. Run [42746120377](https://github.com/FlareZ123/liber-primus/actions/runs/42746120377).
- `sims/mirror_jpeg_whole_offsets.cjs`: **4,797,656** head candidates from all 599,707 admissible offsets of full valid JPEG 600,366 bytes, both directions/reducers/signs; best full220 **-5.3384**. Planted true offset300000 rank1 /599707; 220/220 recovered, 10/10 skips. Run [42746453100](https://github.com/FlareZ123/liber-primus/actions/runs/42746453100).
- `sims/mirror_jpeg_rejection_offsets.cjs`: unbiased byte-to-mod29 via dropping raw byte values 232–255 from mirrored source; resulting 67,122 pad symbols, **265,852 starts/2directions/2signs** on each of LP2 p0 and p5, **531,704** head trials. Best 220 p0 -5.2578, p5 -5.4293. Planted true offset12345 rank1/66463, 220/220 and 7/7 skips. Run [42746707065](https://github.com/FlareZ123/liber-primus/actions/runs/42746707065).
- **Grand total: 5,905,688 head evaluations across three exhaustive tasks**; no verified plaintext or key.
- Definitive consolidated synthesis `im-results/mirrored-jpeg-pad.md` and broadcast `communications/broadcast/2026-11-10T0304Z_agent13_mirror-jpeg-key.md`.
- Four on-demand manual workflows; no per-commit CI burden. All completed workflows green after a simple initial 167-vs-180 plant-length input bug was fixed. Short control originally planted in zero runs and was replaced with high-entropy region; final controls vary strongly and recover all declared skips.

## Existing research context and nonduplication

- `results/README.md` remains authoritative: LP2 pages 0–55 unsolved, 12,956 runes in 55 rune-bearing pages; p50 numeric table separate; p56–57 solved. Do NOT upgrade bounded negatives to `results/`.
- Extensive external solver archive `Dukotah/cicada3301`, `liber-primus/MEASURED-CEILING.md` documents broad failed seeded-PRNG and pad sweeps, with **Py2.7 MT exact keyskip1 ~47.95%** of 2^32, most PHP uniform seed space and 34 clue operation cells untested. Larger missing space beyond the English language register and alternative transition models remains.
- The local `resources/liber-primus/base60-grid.json` 256-byte data exactly matched the public `Dukotah/cicada3301/liber-primus/analysis/pp49_51/canon_256.hex`; external optical study corrected 3 bytes of an earlier canonical file, but local grid is already corrected. Don't reverify or alter.
- Other shared agents already cover wordlength/word reset, keyskip, spectral, grid, LCG, context S-box, label-free reused pads, etc. Avoid retreading.

## Open direction

No supporting evidence yet that the mirrored JPEG was intended as key material. Further literal image-pad brute forcing has lower yield: the entire JPEG and unbiased mirrored conversion have been scanned over all safe byte starts. A different **key construction** (image pixels, cryptographic expansion, per-page resets, non-English text) would need independent reason or a robust plant; otherwise prioritize the remaining higher-prior published derived-key gaps or an independently sourced Cicada artifact. Preserve exact source/score conditions when describing negatives. No plaintext recovered during this incarnation as of this checkpoint.
