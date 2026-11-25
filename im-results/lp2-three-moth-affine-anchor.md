# Three-moth affine anchor: exact joint-word obstruction

Agent 11, 2026-11-25. Distinct from the existing p53/p55 additive/XOR shared-pad and shared-plaintext affine experiments.

## Fixed hypothesis

The repeated moth motif occurs on clear LP1 p05 and encrypted LP2 p53 and p55. The upper p05 SOME WISDOM block ends above the moth, before KNOW THIS and the square. Its canonical transcription contains 74 GP29 runes (not the initially estimated 73). Align its whole stream A with the last 74 runes of p53 and p55: zero-based offsets 105 and 2. This end alignment is a chosen hypothesis, not a known instruction.

At each physical position suppose all three pages use the same arbitrary invertible affine map, fixing the clear p05 anchor A. Thus C_s = A + a(P_s-A) modulo 29, a nonzero and allowed to vary independently at every position. There is no periodicity, F hold, guessed key, or offset optimization. If C_s=A then P_s=A and conversely. If both C_s differ from A, eliminate a:
P55 = A + (C55-A)/(C53-A) * (P53-A) modulo 29.
If either equals A, the unary constraints suffice. This is exact for the conditional model.

Use the existing six-source lexical inventory and optional GP29 ligatures from the p53/p55 shared-pad experiment. Keep printed word boundaries, including the full lexical domain for the truncated word at the left edge of each 74-rune window. The overlap graph is a forest (asserted); arc consistency on the binary constraints gives exact satisfiability for these finite domains. No source-language probability ranking.

## Results

Eight planted shared-map controls (random dictionary words matching printed lengths) preserve every true aligned word and are feasible. They force 84,69,77,84,54,83,72,71 of 148 runes, all correct. Eight independent-map controls, each separately fixing the same anchor, are infeasible. These are synthetic word-level controls, not natural contiguous English or evidence of authorial mechanism.

Original ciphertext: infeasible. Arc-consistency removals 58013,801,688,5,0 after unary filtering. Only the disconnected final component retains some support; the single forced value in an infeasible system is not a plaintext claim. No key or unknown plaintext recovered.

This rules out a shared per-position affine map fixing this anchor **only** at the fixed terminal alignment and assuming these printed word boundaries and finite lexical domains. It does not rule out a different relation among the illustrations, another alignment, non-affine or independently keyed maps, OOV words, or decoy boundaries. There is no affirmative historical evidence that a clear page fixes an enciphering map; retire this branch rather than enumerate further alignments without a clue.

Reproduce: `node sims/lp2_three_moth_affine_anchor_sft.cjs`; raw output `im-results/lp2-three-moth-affine-anchor-output.json`. Actual V8 execution; no separate Windows CI. Script 52203335d3d06358aeddcb3d9f6e24905abaa32f; output f53730f83699afb0a0128e15264bf6a5904fe836. The first attempt failed the anchor-length assertion; the exact canonical count was obtained before the calibrated original run.
