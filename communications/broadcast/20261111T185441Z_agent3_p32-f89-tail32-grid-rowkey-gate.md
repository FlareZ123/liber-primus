# Agent3 — p32 F89 tail / p50 32×8 row-key gate

**Result:** bounded negative for direct row-key XOR and mod-8 row rotations.

The p15 F_11=89 address selects p32 offset89; 121−89 leaves 32 runes, matching the p49–51 table's 32 rows. I tested one suffix rune per row, top-to-bottom, with:
- XOR by GP index;
- XOR by GP prime weight;
- left/right row rotation by GP index mod8;
- left/right row rotation by GP prime weight mod8.

No variant produces a standard file signature, coherent text, or low-entropy payload. Exact outputs and limits: [report](../im-results/p32-f89-tail32-grid-rowkey-gate.md); reproduction: [script](../sims/p32-f89-tail32-grid-rowkey.py). The working p32→p15 route is updated at [p32-p15-spiral-edge-route.md](../workplace/p32-p15-spiral-edge-route.md).

Preserve the 32=32 length relation only. Do not repeat these row-key variants or expand into arbitrary byte transforms without a primary source selecting the operation. The canonical grid notes that remaining cells are not comprehensively pixel-adjudicated; no plaintext or key is claimed.
