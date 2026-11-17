# p0 red-title → p5 word → p54/p55 totient route (candidate)

**Status: unverified navigation hypothesis; no plaintext or key recovered.** Keep this in `im-results/`, not `results/`.

## Reproducible observation

Using the Gematria Primus prime weights in `resources/liber-primus/lp2-corpus.json`:

- The two p0 red-title words are `SHEOGMIAF` and `SYENGC`, with prime-weight sums **347** and **315**.
- Under the candidate base-60 page/word address rule (n=60p+w), with the printed page label (p) zero-based and word ordinal (w) one-based:
  - (315=60\cdot5+15) selects p5 word 15.
  - (347=60\cdot5+47) selects p5 word 47.
- Using the transcription's global word segmentation (a word is assigned to the page on which its first rune occurs), these are:
  - p5 word 15: `REO`, rune indices `[4,12]`, prime weights (11+41=52).
  - p5 word 47: `TD`, rune indices `[16,23]`, prime weights (59+89=148).
- Euler totients give (\varphi(52)=24) and (\varphi(148)=72).
- These values match two independent-looking terminal-page markers: p54's first red rune has GP index **24**, and p55 is original scan/image **72** (`72.jpg`).

The arithmetic is exact. The interpretation is not established.

## Why it is worth one bounded look

The source hooks are unusually well aligned: the 2016 message says words are the map and numbers give direction; the p56 plaintext explicitly names the prime sequence and totient function; the LP2 cuneiform/base-60 material and p50 table supply a plausible sexagesimal context. The p0 title sums also have mean **331** and difference **32**; 331 is the center of the 2014 7×7 square and 32 is the p50 table's row count. The two selected p5 word positions are themselves 32 apart.

A plausible solve-path hypothesis is therefore: use the red-title word sums as base-60 addresses, take the prime-weight sums of the addressed words, apply the explicitly named totient operation, and arrive at p54/p55. This could be a navigation/selector clue rather than a decryption by itself.

## Weakest assumption and controls

The weakest premise is the **base-60 page/word coordinate grammar**. The mixed convention (zero-based printed page label, one-based word ordinal) is natural but not explicitly selected by a surviving instruction. Word segmentation also matters: p5 contains a page-crossing word, so page-local fragments must not silently be counted as complete words. The result above uses global word starts; a different indexing convention changes the selected words and destroys the 24/72 match.

The obvious direct consumers tested in this invocation did **not** decrypt p54/p55: p56-style \(\varphi(p_n)\bmod29\) streams starting at prime ordinals 24 and 72, the 24/72 and 72/24 start/stride variants on p55, and the affine key derived from 24/72. These negatives reject only those specific consumers, not the navigation hypothesis.

## Next decision

Do not launch broad base-60 offset or key searches. First seek an **independent source selector** for this exact page/word convention (or a held-out prediction that the convention fixes before inspecting the target). If no such selector exists, retire the route as a numerical coincidence. If it does, test one frozen, reversible operation on p54/p55 and require authentic plaintext or key material.
