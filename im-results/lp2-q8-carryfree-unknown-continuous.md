# Continuous carry-free unknown q8: heuristic controls and exact derivative

## Joint annealing: negative calibration

Same continuous consuming clock and transparent F rule as the fixed-red8 experiment, but the eight shifts and all 29 permutation coordinates are unknown. The controls supply the correct F history, not the key or alphabet. Compare phase maps, which removes the affine gauge ambiguity. The two methods use a word-frequency-weighted smoothed trigram model and a dictionary bonus.

* Single-coordinate moves: independent nonzero change to one shift or swap two permutation coordinates, including F. Native windows ending at indexes 50 and 116; 90 s, 100000 annealing steps per restart, key-move probability 0.22. Control 0 had 4 OOV (outside the nominal 3-OOV bound) and the best state had 28 OOV, 16964097 proposals. Control 1 had 1 OOV and best 24 OOV, 20451073 proposals. Neither recovered the true phase action.
* Block moves: choose a dictionary replacement for one printed word, optionally preserve up to three current legal dictionary matches. Derive homogeneous GF(29) equations pi(c)-pi(p)-k[j]=0, eliminate with a randomized pivot order, sample free coordinates around the current state, reject alphabet collisions, then complete the remaining permutation. Mixed with ordinary swaps/key moves. A replacement and all retained words were asserted exactly after each feasible move. Two native windows ending at indexes 70 and 116 (2 and 1 OOV), 180 s each, 160000 steps per restart, block probability 0.2. Neither recovered the action.

| Plant | truth OOV | best legal OOV | proposals | block attempts | feasible | accepted |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 2 | 25 | 29145601 | 5829479 | 3626731 | 4052 |
| 1 | 1 | 22 | 30546433 | 6110281 | 3677146 | 4703 |

No original run was performed with either uncalibrated method. This is not a mathematical exclusion. These two failed search schemes are not recommended for further unmodified retries.

Reproduction: the gzipped exact local source is [lp2-q8-carryfree-block-anneal-sft.cpp.gz](lp2-q8-carryfree-block-anneal-sft.cpp.gz). Uncompress into sims/ beside lp2_red8_carryfree_continuous_sft.cpp (blob 4f518d0babb8a04be03699d93bef95cfc75f25dd), then compile g++ -O3 -std=c++17. Run executable with resources/control/english_wordfreq_textblob.txt control 180 0 160000 0.2, then control 180 1 160000 0.2. For the first annealer rename block main to block_main and uq_main to main. Source before compression has Git blob SHA 0dfbb3cc5c56a853edf113d86296e9ee90d28527. Dictionary is frozen repository blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938.

## Exact derivative

Reuses Agent12/29/7 affine graph receiver, pinned shared solver blob 504619d3d8f148ac8700011bcac197ed2ceb3d56. Agent11's builder checks the blob and removes only the mandatory scheduled carry-prefix check; the driver keeps the dummy inherited slot empty, supplies no carry or heldout material during fitting, and uses the unaugmented 38,910-form lexicon. Four complete-word anchors suffice to cover any fit with at most three OOV. Global token-support budget propagation is sound for the fixed clock, then inherited exact graph DFS and packing apply. The k0=1 gauge requires a nonzero phase rotated to phase 0, so enumerating starts covers nonzero periodic keys. This is distinct from the completed mandatory-carry unknown-key test.

Calibration run 45812104669: two known-schedule controls, first original-length-profile synthetic words with deliberate OOVs including longest, second coherent native prose window with genuine OOV. Both carry and next sixteen words are withheld; exact action and all training groups, plus held replay, required. No original search until the controls pass. Status at this checkpoint: running.

Sources: sims/build_lp2_q8_carryfree_continuous.cjs and sims/lp2_q8_carryfree_continuous_driver.cpp.
