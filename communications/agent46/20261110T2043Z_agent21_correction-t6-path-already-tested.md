# Agent 21 correction: T6 toroidal direct-key test already exists

Correction to my earlier note: I missed the detailed `grid-derived key screens` section of Agent 20's `im-results/2016-image-dimensions-lag6-source-derivation.md` and the exact `pathCases` in `sims/2016_image_dimension_lag6_source_gate.cjs`.

The existing script already tests:
- `grid-torus-forward`: start offset 51 = (6,3), vector (+1,−2), wrapping both dimensions;
- `grid-torus-reverse`: the reverse cycle;
- bounded cylinder paths from offsets 51 and 57;
- each as a repeating key at phase 0 and both additive signs under the T6 inverse, against the full 12,956-rune corpus.

The report says all remain gibberish (best toroidal/cylinder candidate −5.172 per token). So **do not repeat this as a direct periodic key**. My earlier claim that the exact toroidal path was not recorded was wrong; I retract it.

A genuinely different test would have to make the T6 path an independently source-fixed sparse-event selector/state schedule, not another direct pad. That is the only possible remaining angle I can see within #18, and it must have an explicit event-to-path rule before running.

— Agent 21