# Stage11 133/331 affine perimeter key against p55

**Status:** one frozen, source-motivated candidate tested and rejected. No plaintext or key recovered.

## Human-visible hypothesis

Three visible elements motivate a single bounded construction:

1. The original 2013 OS message says “THE KEY IS ALL AROUND YOU.”
2. The original 2014 Stage11 index has `<title>133</title>` and `<div id="331">`; its image links are in release order 0–57.
3. The p49–p51 table is 32×8, so its one-cell perimeter has 76 entries, exactly the 76-rune length of p55. The known p56 cipher supplies a simple, already demonstrated GP29 additive/subtractive operation.

A modern cross-era observation makes the two HTML numbers worth testing, but not treating as established intent: the participant-side `gematria.py` in [neuroretransmit/cicada@ade9a028](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/004-first-onion/gematria.py) maps “THE KEY IS ALL AROUND YOU” to prime sum 931; the signed BASE29 convention gives (931=1\times29^2+3\times29+3=133). The pinned `gematria.py` commit is dated 2024-05-03, and the repository has no declared license: this is a later participant implementation, not a first-party 2013 instruction. The exact 133 match therefore motivates a test but does not authenticate the mapping.

## Frozen operation

- Table: the published 32×8 p49–p51 byte transcription, in printed row-major layout.
- Key source: the 76-cell outer perimeter, clockwise from the top-left corner.
- Affine order: HTML title as start and div ID as stride:
  (i_n=(133+331n)\bmod76). Thus start=57, stride=27, and (gcd(27,76)=1), so every perimeter cell is visited exactly once.
- Byte-to-rune map: table byte modulo 29.
- Receiver: original p55, in its published 76-rune order.
- Operation: the known p56-style subtractive GP29 rule, (P_i=(C_i-K_i)\bmod29). No phase, reset, F skip, reverse, or fitted parameter. Addition is reported only as the inverse-sign control.

The 2014 base60 byte transcription is itself participant-derived; it is used here as the existing published representation, not asserted to be creator-authenticated.

## Result

The [standalone reproducer](../sims/lp2_p50_stage11_133_331_affine_perimeter_p55_sft.cjs) asserts the original dimensions, 76-cell perimeter, full-cycle affine order, and p55 length before printing the exact key and outputs.

- Perimeter length: 76.
- Start: 57; stride: 27; gcd: 1; unique positions: 76.
- Subtractive output IoC: **0.03824561**, versus raw p55 **0.03789474**.
- The 76-rune subtractive output is nonlinguistic and does not form a recognizable directive.
- Additive-sign control IoC: **0.03017544**; likewise nonlinguistic.

The exact key stream and both output strings are emitted by the reproducer. The result does not support a p55 plaintext.

## Decision

Reject this precise interpretation of 133/331 as affine start/stride on the p50 perimeter, followed by direct mod29 subtraction. It is a genuinely source-motivated, low-cost test, but the numbers do not yield a usable key under the simplest established LP2 operation. This does not exclude other meanings of the HTML numbers; any further use needs an independent source instruction specifying the parameter roles or the byte-to-rune operation. Do not tune the start, stride, direction, phase, or encoding to rescue this candidate.
