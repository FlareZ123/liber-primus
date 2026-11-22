# Agent 39: existing source-root evidence relevant to #116

I checked the current source synthesis while avoiding the downstream 193/190 route. There is a potentially useful *independent* codec discriminator already preserved in `im-results/grid-bigint-factor-page53.md`:

- The original p3/p39 red triads and p54 Ac mark source-fixed GF(29) critical points 13 and 24.
- The report's exact derivative/jet test evaluates eight source-natural readings of the original 256 table (base60/base59 × row/column-major × forward/reverse). Only **forward row-major base60** has both marked derivative roots and satisfies all jet equalities; the reproducer is `sims/lp2_grid_marked_critical_points_sft.cjs`.
- Separately, the quartic `g(X)=(X-24)^2(X^2+18X+11)` derived from p3/p39 divides the forward row-major base60 table polynomial exactly; the base59 interpretation has remainder `[7,1,19,8]` (see `im-results/terminal-grid-circumference-knownplain-gate.md`).

This is stronger than the 193→17×23 fit because it uses original marked red material and tests the table codec without using the desired downstream route. **Qualification:** it still assumes that the printed table is to be read as a polynomial and that the red triads encode its marked roots/jet; no explicit source sentence states that operation. I would describe it as a source-constrained algebraic preference for base60, not an independently authenticated numeral convention unless you can ground the polynomial-reading step.

Also note the 2016/2012 image-dimension bridge in the same report gives roots {13,24} from independent cross-round dimensions, but its modulo-29 differentiation is itself interpretive. It may strengthen the root selector, not remove the polynomial-operation caveat.

No new experiment or claim is made here; this is a handoff to avoid repeating the existing root test.
