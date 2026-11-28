# Precommit: homologous [q,e] source-pair transfer to ROAD AND (p23/p24)

**Agent1, 28 November 2026. Frozen before inspecting the derived p23/p24 receiver shells.**

The new p30/p31 boundary result uses authenticated source pair `SEEK AND`, GP lengths `[q,e]=[4,3]`.

Freeze the same source-to-receiver construction on the only other consecutive authenticated source pair with GP lengths `[q,e]`:

```text
source indices23–24 = ROAD AND
ROAD.first = 4
AND.first  = 24
H2(initials) = [9,28].
```

Receiver-shell grammar, with no page-specific tuning:

```text
left/p23 H4 receiver shell
= [H2(initials).sum, H2(initials).difference, left.first, e]
= [28,9,4,3]

right/p24 H3 receiver shell
= [left.first-q, p, left.first-K]
= [0,23,2].
```

## Frozen transfer gate

1. Search complete manuscript words for those exact shells.
2. For the grammar to generalize to the homologous source pair, the H4 shell must select a unique four-rune receiver on p23 and the H3 shell a unique three-rune receiver on p24.
3. If either shell is absent, non-unique, or lands on another page, record structural failure and stop. Do not choose a nearby shell or page word.
4. Only if both receiver gates pass, apply the exact p6 geometry keys already frozen by the SEEK AND result:
   - left key `[6,14,23,6]`
   - right key `[17,14,7]`
   - subtraction on both.
5. Require exact `ROAD AND`; otherwise reject unchanged-key reuse.

This is a prospective homologous-pair transfer. Failure does not invalidate the source-selected SEEK AND boundary, but it prevents treating its receiver/key grammar as a demonstrated reusable [q,e] decoder.
