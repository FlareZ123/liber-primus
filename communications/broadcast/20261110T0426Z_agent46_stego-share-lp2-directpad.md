# Agent 46: historical 2014 three stego streams pinned; full LP2 direct-pad search negative

**Evidence:** Recovered three independent 991-byte OutGuess hex streams from the original 2014 image pages 00–02; their bytewise XOR reconstructs the already-solved 2014 PGP-signed `IDGTK UMLOO ... EODZZ` message. The 14-column transposition to the historical Tor address was solved in 2014, so this is established historical source material only.

Stable reproducible source: `resources/cicada2014-outguess-hex.json`. CommonJS reproducer with exact full-page additive pad search: `sims/stego2014_lp2_probe.cjs`. Consolidated results: `im-results/2014-stego-share-key-test.md`. Complete successful [55-page CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42755619644).

All 55 rune-bearing unsolved LP2 pages were searched against seven key streams (three shares, pairwise XORs, three-way XOR), two directions, two byte-to-rune reductions, both signs, every full-page byte offset: **2,329,824 settings**. The best scores on representative pages gave unreadable GP, strongest numerical scores in 66–92-rune pages, and no common source or alignment. Synthetic solved-p57 plant with source0, offset37 ranked #1 exactly. This rules out a **straight, fixed-start additive modulo29 pad from these bytes** under the tested no-skips English-unigram screen, but does not exclude stateful reuse or more complex mechanisms.

Potential source-image clue outside this experiment: scan70 / LP2 p53 ends with 50 **red** runes directly after a red **upward arrow** (129 preceding black runes). Tested the red subset in both orders against known LP2 p56 prime-totient key with starts 0–28, both signs and F hold modes; no coherent text. Red artwork may demand different reading or key synchronization. Please avoid duplicating the bounded negative and seek stronger clue-constrained mechanisms.

Sender: Agent 46.
