# P6 13-dot row as coordinate opcode: prospectively frozen one-sparse lift fails the q-block plaintext holdout

**Agent 9, 28 November 2026. Classification: target-rune-blind source-visible coordinate-opcode negative for Director issue #3400. The complete key rule and raw outputs were committed before authenticated q-block plaintext grading.**

## Updated premise

Director narrowing after #3408 excludes the older 18 direct/H4/H2-adjacent decoder variants as complete keys: none satisfies more than one of the eight independently frozen q-page key sums. This test therefore uses a genuinely different operation derived from the p6 13-dot geometry itself.

## Source-visible coordinate selector

The established p6 receiver program reads the 13-dot stencil in printed column-major, top-down order:

- left column rows 0..3 -> p30..p33;
- center column rows 0..4 -> p34..p38;
- right column rows 0..3 -> p39..p42.

For the eight q-block pages the already-selected receiver arities and dot rows are:

q1 p32..p35: n=[3,4,2,5], row=[2,3,0,1]
q3 p37..p40: n=[4,6,5,4], row=[3,4,0,1].

Every printed top-down zero-based row is already a valid coordinate index, with no modulo or wrap. The natural source-visible rivals reject themselves before plaintext: top-down one-based indexing is out of range on p32, p33 and p37; bottom-up zero-based indexing is out of range on p34.

## Frozen complete-key rule

Each page already has an independently frozen additive key sum sigma. The minimal way for a single stencil dot to lift that scalar into an ordered word is the one-sparse vector:

K[row] = sigma; all other K[j] = 0.

Then P=C-K mod29. This automatically preserves every page checksum while using the dot geometry as the missing coordinate opcode.

Before any authenticated q-block target rune comparison, issue #3400 comment 7238698664 froze the rule and exact keys:

p32 [0,0,4]
p33 [0,0,0,0]
p34 [0,0]
p35 [0,25,0,0,0]
p37 [0,0,0,7]
p38 [0,0,0,0,0,0]
p39 [28,0,0,0,0]
p40 [0,0,0,0].

Raw ciphertext/key outputs were then committed separately, before target grading, in commit 38984d391d739c89d46531743427d47e721d07db. Generator commit: 510403a757b2d4986c610f052c538a9a3907755f.

## Holdout result

After the pretarget commits, grade against authenticated signed-2016 q-block words YOU WILL BE FOUND / LUCK BEWARE FALSE PATHS.

Result:

- exact words: 0 / 8;
- rune coordinates: 1 / 33;
- the sole coordinate agreement is p32 position1.

Thus the stencil row does not act as a one-sparse coordinate selector for the page-key sum.

## Post-open diagnostic boundary

After the miss, fitted q-block keys were exposed only for diagnosis. None of the eight exact fitted keys is an exact authenticated-2016 source-word vector or canonical H image. A global GF29 affine law using current ciphertext, mirrored ciphertext, aligned p6 title scalar, companion scalar, coordinate index, dot row, arity and constant also has no exact solution on all 33 fitted coordinates. These post-open checks are not prospective evidence and are not promoted as independent exclusions beyond their exact families.

## Decision

The p6 4/5/4 stencil remains a strong receiver-address program and the complete page-key-sum tape remains a real necessary checksum. The most literal source-visible dot-to-coordinate lift fails prospectively. Do not repair it by wrapping invalid row orientations, redistributing the checksum after seeing plaintext, or fitting page-specific exception vectors.

The missing ordered-key opcode remains unsolved. Future work needs a different independently authored coordinate operation; the old 18 variants and this one-sparse stencil-row lift are both closed.

Reproducer: sims/lp2_p6_stencil_row_onehot_pretarget_sft.cjs.
Grader: sims/lp2_p6_stencil_row_onehot_grader_sft.cjs.
