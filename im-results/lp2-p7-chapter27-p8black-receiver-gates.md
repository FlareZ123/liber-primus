# P7 → chapter27 → p8-black exact receiver gates

**Agent7, 28 November 2026. Classification: a new source-typed 27-rune handoff with three prospectively frozen direct receiver negatives. No unknown plaintext is recovered.**

## Source-selected handoff

Independent original-artifact work now composes without choosing a key length or a distant receiver:

1. P7's five original red-word GP29 products are `[11,26,8,15,2]`.
2. Their printed-order right-circulant inverse has first row `[23,2,5,2,19]`. The p15 source-only state route independently predicts this as `[p,K,g,K,B]`.
3. Those five values are exact chapter-IN labels in the red-rubric SUM→PRODUCT graph, addressing `[p8,p27,p33,p27,p54]`.
4. Take the already-selected first complete black word after each addressed chapter rubric, preserving the repeated p27 address. Their rune lengths are `[3,7,2,7,8]`, so their literal concatenation is **27 runes**:

```text
[27,9,16,
 9,8,6,1,27,8,1,
 12,22,
 9,8,6,1,27,8,1,
 27,23,13,21,1,7,24,19]
```

5. P7 is immediately followed by p8. P8 has **243 black runes**, exactly **9 × 27**. Thus the source path supplies both a concrete 27-rune operand and an exact nine-block black receiver with no key-length, page, phase, or padding search.

This is the strongest receiver typing obtained from the p7/p15/chapter bridge so far. Each direct inverse below was committed **before** inspecting its output.

## Gate 1 — ordinary cyclic additive inverse

Pretarget commit: `97b9865df40d06831d35343316f89a5db97668eb`.

Freeze solved-p56-style subtraction on black p8 only:

`P_i = C_i - K_(i mod 27) mod29`, phase0, continuous, no F bypass.

The inverse replays exactly but is nonprose. Native-GP29 bigram score is **−1.7380065446 nats/rune** versus unchanged p8-black **−1.5222689861**; IoC is **0.0350984593**. Against 2,000 deterministic random period-27 additive keys on the identical receiver, the source key ranks **175/2001** (higher score is better). Retire this exact additive receiver without phase/sign/reset tuning.

Pretarget reproducer: `sims/lp2_p7_chapter27_p8black_additive_pretarget_sft.cjs`.

## Gate 2 — recursive right-circulant inverse

Pretarget commit: `0863fd5196787052efb04e83cc096ad6bec8efaa`.

The upstream p7 operation is itself a printed-order right-circulant. Freeze the identical convention recursively at dimension27, using the literal 27-rune itinerary as its first row and nine source-aligned p8-black blocks.

The resulting GF29 matrix is **full rank 27 with determinant 23**. The determinant's equality to the independently reconstructed modulus `p=23` is an exact structural consequence noticed only after the freeze; it is not used to rescue the cipher result. The exact inverse replays p8 black, but its output scores **−1.7135551043** with IoC **0.0366629256**. Against 1,000 deterministic random invertible 27×27 right-circulants on the same receiver, it ranks **116/1001**. Retire the exact recursive circulant receiver; do not open transpose/reversal/block-origin variants after the negative.

Pretarget reproducer: `sims/lp2_p7_chapter27_p8black_circulant_pretarget_sft.cjs`.

## Gate 3 — periodic GF29 multiplicative inverse

Pretarget commit: `ba612dcd1aecad2a18a6144763b4ba76441026aa`.

P7's upstream word register is multiplicative in GF29, and every rune in the 27-rune handoff is nonzero. Freeze the direct field inverse

`P_i = C_i × K_(i mod 27)^−1 mod29`

on the same phase-zero black p8 receiver.

Again exact forward replay passes, but the output scores **−1.6601316748**, IoC **0.0360507431**, and ranks **465/2001** against deterministic random nonzero period-27 multiplicative keys. Retire this exact multiplicative receiver without phase/reset/exponent tuning.

Pretarget reproducer: `sims/lp2_p7_chapter27_p8black_multiplicative_pretarget_sft.cjs`.

## Decision

The **handoff itself remains materially interesting**: it composes three independently developed original-artifact structures and produces an exact 27-rune operand whose length tiles the immediately following p8 black body exactly nine times. The three most direct reversible consumers are now bounded negatives.

Therefore preserve:

`p7 red products → printed-order circulant inverse row → chapter-IN addresses → 27 original runes → p8 black243 = 9×27`

as a source-typed structural route, while **retiring cyclic additive, recursive right-circulant inverse, and periodic multiplicative division as its immediate p8-black decoders**. A successor should require an independently visible operation on the 27-rune object rather than tuning these failed families.

Unified grader: `sims/lp2_p7_chapter27_p8black_receiver_grade_sft.cjs`.
