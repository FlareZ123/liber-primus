# P40→p50 central W3 mirror-shell hypothesis fails its frozen outer-shell prediction

**Agent44, 28 November 2026. Classification: prospective 0/2 rejection. The exact outer-shell prediction was frozen at commit `cf19014f317d76c73c4fd052af7ba1e4a1eaed97` before p50 cells42/45 were read.**

Run: `agent44-draw10-20261128T115152Z-6bd05dd5-directed`.

## Source-fixed inputs already known before this freeze

1. P6 block3 is the printed four-rune word
   `W3=[a,-K,b,K+b]=[6,27,15,17]`.
2. P40 is the terminal page of that q=4 block.
3. Independent p40 geometry now selects p50 physical cell43=(row5,col3).
4. The p40–p55 frame independently selects horizontal reflection, so cell43 pairs with cell44=(row5,col4).
5. The already-opened central pair tokens are cell43=`1D`, cell44=`3o`.
6. Under ordinary source-era base60, their integer residues mod29 are
   `[73,230] mod29 = [15,27] = [b,-K]`,
   exactly **reverse(W3 inner pair)** `reverse([-K,b])`.
   Base59 gives `[14,23]=[-b,p]` and does not satisfy this W3-inner relation.

## Frozen operation and prediction

Treat row5's four horizontal mirror shells as a center-out serialization of the current
p6 block3 word. The central shell (cells43,44) already supplies the reversed inner pair.
The immediately outer shell is therefore fixed **before lookup**:

```text
W3 printed        [ a, -K,  b, K+b ] = [ 6,27,15,17 ]
central 43,44                     -> [ b,-K ] = [15,27]
outer   42,45 must                -> [ K+b,a ] = [17,6]
```

**Locked prediction:** using the same base60→integer→mod29 reading,
- cell42 residue must be **17 = K+b**;
- cell45 residue must be **6 = a**.

Acceptance is exact **2/2**. No alternative radix, reflection orientation, cyclic shift,
sign change, or page-specific exception will be introduced after reveal.

If the prediction fails, the central `[b,-K]` match is classified as structural coincidence
and this W3 row-shell serializer is retired. If it succeeds, charge the complete row-shell
family and demand a further untouched consequence before promoting it to a cipher/key rule.

## Reveal and decision

After the freeze, the original p50 source table was opened exactly once at cells42 and45:

```text
cell42 token 0S = 28 base60 -> residue28
cell45 token 1l =107 base60 -> residue20
```

The frozen prediction was `[17,6]`; the observed pair is **[28,20]**, so the result is **0/2 exact**. The central cell43/44 relation `[b,-K]` is therefore not evidence for a four-rune W3 row-shell serializer. No alternative radix, orientation, cyclic shift, sign, or expanded shell is tried after reveal.

This leaves the independently selected p40→cell43 handoff intact while removing one tempting p6-block3 interpretation of the reflected row. Future cell43 consumers need a different source instruction; the direct “central inner pair → next outer pair” grammar is closed.

Reproducer: [`sims/lp2_p40_p50_w3_mirror_shell_sft.cjs`](../sims/lp2_p40_p50_w3_mirror_shell_sft.cjs).
