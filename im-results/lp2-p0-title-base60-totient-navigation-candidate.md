# p0/cuneiform → base-60 word map → p54/p55 totient route (candidate)

**Status: unverified navigation hypothesis; no plaintext or key recovered.** This remains an intermediate finding in `im-results/`, not an established result.

## Reproducible address network

Use the Gematria Primus prime weights and the global word segmentation in `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`. A word is assigned to the page on which its first rune occurs.

The candidate coordinate rule is (n=60p+w), with the printed page label (p) zero-based and the word ordinal (w) one-based.

### p0 red title selects three p5 words

The two p0 red-title words are `SHEOGMIAF` and `SYENGC`, with prime-weight sums **347** and **315**. Their mean is **331** and their difference is **32**.

Under the candidate address rule:

- (315=60\cdot5+15) selects p5 word 15: `REO`, rune indices `[4,12]`, prime sum (11+41=52), so (arphi(52)=24).
- (331=60\cdot5+31) selects p5 word 31: `CEAA`, rune indices `[5,28,24]`, prime sum (13+109+97=219), so (arphi(219)=144), then (arphi(144)=48).
- (347=60\cdot5+47) selects p5 word 47: `TD`, rune indices `[16,23]`, prime sum (59+89=148), so (arphi(148)=72).

Thus the three positions 15, 31, 47 are centered on the address 331, and the totient-derived values (24,48,72) form an arithmetic progression. The extra totient iteration on the center word is a separate hypothesis, not independently selected.

### cuneiform endpoints independently reach p17 and p55

The LP2 cuneiform section's source numbers **1033** and **3301** give two more candidate addresses:

- (1033=60\cdot17+13) selects p17 word 13: `AEP`, rune indices `[25,13]`, prime sum (101+43=144), so (arphi(144)=48).
- (3301=60\cdot55+1) selects p55 word 1: `AEMIW`, rune indices `[25,19,10,7]`, prime sum (101+71+31+19=222), so (arphi(222)=72).

These two totients have mean **60** and difference **24**. They independently reproduce the 48/72 values from the p0-derived route.

### Cross-source convergence

The five selected words (p17w13, p55w1, p5w15, p5w31, p5w47) contain **13 runes total**, matching the 13-rune p0 red title. Their first totients are (48,72,24,144,72), which sum to **360 = 6×60**.

The resulting values have visible source correspondences:

- **24**: p54's first red rune has GP index 24.
- **48**: (7\times7-1), the noncentral cells of the original 2014 7×7 square.
- **72**: p55 is original scan/image 72 (`72.jpg`).
- **331**: the p0 title mean and the center of the 2014 7×7 square.
- **1033**: the cuneiform endpoint and the 2014 square's magic constant.
- **32**: the p0 title difference and the p50 table's row count.

This is a coherent candidate navigation network, not a decryption. The repeated values may be intentional, but their selection could still be post hoc.

## Weakest premise and negative tests

The weakest premise remains the **base-60 page/word coordinate grammar**. The mixed convention (zero-based page label, one-based word ordinal) is natural but not explicitly selected by a surviving instruction. Global word starts are used to avoid counting page-crossing fragments as new words. The 2016 message (“words are the map, meaning is the road, numbers are the direction”) and p56's prime/totient instruction are relevant source hooks; they do not by themselves prove this exact coordinate convention.

The obvious direct consumers tested in this invocation did **not** decrypt p54/p55: p56-style \(\varphi(p_n)\bmod29\) streams starting at prime ordinals 24 and 72; 24/72 and 72/24 start/stride variants on p55; affine use of 24/72; the 13-rune concatenated word key on p0's title and p55; and the five-totient key on p55. These negatives reject only those specific consumers.

A separate attempt to treat the full p175–p464 prime interval as 290 page/word addresses produced 41 out-of-range addresses and is not a supported continuation.

## Next decision

Do not launch broad base-60 offset or key searches. First seek an **independent source selector** for this exact page/word convention and its indexing. Then freeze a held-out prediction before inspecting the target. If no such selector exists, retire the route as a numerical coincidence. If it does, test one reversible p54/p55 consumer and require authentic plaintext or key material.
