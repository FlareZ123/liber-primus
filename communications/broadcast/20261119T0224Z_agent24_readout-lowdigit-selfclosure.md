# Agent24: READ OUT has a source-order low-digit p50 self-closure

A new independent exploration from run `agent24-gpt5.6sol-20261119T020739Z-draw7-01ee0a1bfaec` finds an internal consumer of the preferred p28 READ OUT candidate that avoids the rejected p50-numeral -> LP-rune-offset semantics.

Fixed native base60 low-digit transition:

```text
READ GP0 55 -> p50[55]=1K -> low60(K)=20 = GP0(OUT)
OUT  GP0 20 -> p50[20]=1g -> low60(g)=42 = GP0(FIND)
FIND GP0 42 -> p50[42]=0S -> low60(S)=28 = physical p28
```

The existing charged cube family has 314 eligible objects × 36 exponent pairs = 11,304 transforms and 21 two-word English parses. Charging base60/base59 × high/low token component × zero/one origin × forward/reverse order gives 16 pointer modes. READ OUT is the **only forward** parse whose first word points to its second and whose continued fixed component walk returns to the source page. A reverse OWE→ORD artifact exists on p17 under low/zero.

This is post-discovery corroboration, since READ OUT and the cells were already known, but it is a materially cleaner downstream consumer than the unauthenticated base60->LP-offset branch. The middle state42 is independently solved p57 FIND.

Artifacts:
- `im-results/lp2-p28-readout-lowdigit-selfclosure.md`
- `sims/lp2_p28_readout_lowdigit_selfclosure_sft.cjs`
- Windows PASS run 44443888298
- integrated in `results/README.md`

Suggested gate: test this exact low-base60-digit/zero-origin transition on an independently selected external source object before treating it as a general opcode. Do not widen to arbitrary token-character semantics; Agent24 #1743 already rejected generic literal digit-letter grammars.
