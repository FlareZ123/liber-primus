# Original p7 red-quartic nonlinear feedback as a direct p8 receiver

**Agent16, 22 November 2026. Decision: bounded source-motivated negative; no unknown plaintext or historical key.**

The source-authenticated five red whole words at the end of physical p7 give GP29 index-products [11,26,8,15,2]. The independently reported p7/p8 red-heading relationship, in ascending order, gives the quartic P(x)=11+26x+8x²+15x³+2x⁴ (mod29), with P(3)=3, P(4)=4 and P'(4)=17. The adjacent physical p8 heading contains the reverse fixed-point word products [4,3] and ends in red rune GP index17. See the source operand and prior selection caveats in `im-results/lp2-p7-p8-original-red-polynomial-fixedpoint.md`. Ascending-degree convention remains an analyst interpretation rather than a signed cipher instruction.

A direct receiver P(plaintext) is impossible because P has only 19 images in GF29 and p8 uses more symbols. Instead test a **reversible nonlinear feedback** consuming the p7 quartic as a whole function:

```
plaintext[i] = (ciphertext[i] + sign * P(previous)) mod29
previous = ciphertext[i-1]  [ciphertext feedback]
        or plaintext[i-1]   [plaintext feedback]
```

The original p8 heading suggests exactly three possible initial previous-value operands, 3,4 and17. Exhaust both signs and both feedback registers, **12 entirely specified** 255-rune decryptions of the unchanged original p8 source. Full-source forward reencryption is exact in all12. The same inverse exactly recovers all95 independently known native-GP runes of solved p57 from 12 artificially encrypted native ciphertext controls, exercising both feedback branches.

All12 original p8 outputs have GP29 IoC **0.03356–0.03638**, with nonlinguistic initial GP transcriptions. For example seed3/sign−/ciphertext feedback begins `J M M EA E I EA OE T IA I X N M G H C OE J OE`; seed4/sign−/cipher feedback changes only the initial rune, beginning `I M M EA E I EA OE T IA I X N M G H C OE J OE`. Neither produces a source-authenticated English plaintext or instruction. Even where a ciphertext feedback output is fully deterministic, exact replay only demonstrates algebraic reversibility, not decryption.

**Result:** This direct p7 quartic word-to-p8 nonlinear additive feedback family is not a recovered LP2 decipherment. More complicated polynomial state machines would require an author-visible independent state/clock or key to justify expanding them; the interesting p7→p8 original red fixed-point identities still provide no authenticated cipher instruction.

**Reproduction:** [original-input one-file Windows Node22 SFT](../sims/lp2_p7_redpoly_p8_nonlinear_feedback_original_sft.cjs), [Windows CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45049279246). This experiment preserves every one of the original255 p8 rune indices, both source polynomial coefficients and genuine95-rune p57 control. All 56 original LP2 unknown pages remain undeciphered.
