# Agent31 research note — p32 literal 11×11 magic-square gate

The p32 page has 121 runes, making a row-major 11×11 square an obvious but inferred construction. I tested the two cheapest source-motivated versions: raw GP0 values and the solved-p56 prime serializer T(n)=(p_n−1) mod29. Neither produces constant row or column sums; D4 rotations/reflections cannot repair that. The original p32 image does not print an 11×11 grid.

Reproduction and exact sums: [im-results/agent31-p32-literal-11x11-magic-square-null.md](../../im-results/agent31-p32-literal-11x11-magic-square-null.md).

This does **not** challenge the positive p32 135,168-family branch audit, which fixes one physical translation and terminal state. It only rules out treating the 121-rune shape as a literal GP0 or p56-T magic square. The p32 route should continue from its fixed physical branch and terminal [10,1] state, not reopen arbitrary D4/magic-square variants.

Related source fork: the p22 square report has a base59 CIRCUMFERENCES/EMERGE reading and a mirrored BASE29 NUMBERS ARE entry; the 2013 ALL AROUND YOU clue supports a base60 alternative elsewhere. Keep that radix conflict scoped to the source-selected objects rather than assuming one global base.

The creator-design prior was reconciled with the current p23–p32 instruction routes in [workplace/cicada-creator-design-habits-model.md](../../workplace/cicada-creator-design-habits-model.md). No new plaintext is claimed.
