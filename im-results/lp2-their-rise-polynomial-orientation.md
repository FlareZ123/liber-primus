# THEIR RISE selects the p39 rising-power / root24 orientation

**Agent4, 19 November 2026. Classification: source-visible coefficient-direction selector that strengthens the p28/p29/p39/p50 route. It does not decrypt p29.**

## Result

Physical p39 has one isolated red triad in printed order:

```text
[27,5,15]
```

The independently recovered p33 instruction is `THEIR RISE`. Applied literally to a printed coefficient row, let powers **rise left-to-right**:

```text
27 + 5 X + 15 X^2
```

or high-degree-first storage `[15,5,27]`. Over GF(29):

```text
27 + 5X + 15X^2 = 15(X-24)^2
```

so its unique double root is **24**.

The opposite convention treats the printed row as high-degree-first:

```text
27X^2 + 5X + 15
```

whose unique double root is **23**.

## Independent p29/p50 orientation control

The existing complete p29/p50 double-root audit charges both coefficient directions for both source objects. It has exactly two common-double-root events:

```text
p29 high / p50 high:
  root 24
  qP=27 qT=26 dP=dT=6
  packet [24,25,26,27]
  consecutive signed indices = yes

p29 low / p50 low:
  root 23
  qP=10 qT=15 dP=13 dT=16
  packet [23,47,15,10]
  consecutive signed indices = no
```

The root24 event is already independently distinguished because its fixed Taylor packet is the unique non-wrapping consecutive signed-index run and reads `AND THEIR NUMBERS ARE`. The later `THE DIRECTION` indices28–29 complete the authenticated instruction.

Thus the p39 direction supplied by `RISE` and the independently selected p29/p50 direction converge on the same root24 branch.

## Consequence

The coefficient-orientation fork no longer needs the speculative rule “choose whichever root points to a visually privileged page.” Under the current source chain:

```text
THEIR RISE
 -> p39 printed numbers take rising powers left-to-right
 -> G(X)=27+5X+15X^2
 -> double root24
 -> p29/p50 printed/high-first common-root event
 -> Taylor packet 24,25,26,27
 -> AND THEIR NUMBERS ARE
```

The reciprocal root23 remains a mathematical consequence of reversing all coefficient orders. Its proposed use as a manuscript page pointer has no authored output type and now conflicts with the source-selected rising-power convention. Retire root23 -> p23 navigation unless a later independent source explicitly overrides the coefficient direction.

## Scope

This source selector was recognized after the root24/root23 algebra and Taylor packet were already known, so it is corroborating causal evidence rather than a blind discovery probability. It selects orientation. Existing direct p29 quotient, quotient-pad, G-adic and chapter-key consumers remain negative.

## Reproduction

- SFT: `sims/lp2_their_rise_polynomial_orientation_sft.cjs`
- Workflow: `.github/workflows/agent4-their-rise-polynomial-orientation.yml`
- Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44457869317
