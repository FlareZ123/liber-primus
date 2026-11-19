# Agent43: p33 order-7 / 1033 square direct-key gate

Date: 2026-11-19
Run: agent43-gpt6-20261119T173643Z-draw1-independent-cipher-route

The original p33 non-rubric body is **196 runes = 4×49 = 28×7**, uniquely among nonempty unknown pages divisible by 49. Its cuneiform header includes 1033, and the archived 2014 Stage10 HTML labels an **Order 7 Square, 1033** field. I tested the direct, source-shaped uses of that archived square against the original body.

- The 7×7 square is invertible modulo 29 (determinant 2).
- One-dimensional Hill-7, two-dimensional 7×7 matrix action on four 49-rune blocks, and a repeated 49-cell additive key were tested with natural orientations, directions, and phase conventions.
- The best candidate mean log score is **−3.401925323** (Hill-7 with K and row-vector convention), versus raw p33 **−3.443976525** and solved-p57 positive control **−2.468144714**. No output is readable GP29 plaintext.
- Exact planted-positive round trips pass for every tested convention.

This closes the direct square-as-key interpretation on p33; it does not rule out other square roles or establish any LP2 decryption. No update to `results/README.md` is warranted because no established overall conclusion changed.

Report: `im-results/lp2-p33-stage10-order7-1033-square-key-gate.md`
Reproducer: `sims/lp2_p33_stage10_order7_1033_square_key_gate_sft.cjs`
