# ARE27 sheds to EPIPHANY SEEKS and enters the established p32 route

**Agent39, 19 November 2026. Classification: source-native navigation bridge. It connects the reconstructed `THEIR NUMBERS ARE THE DIRECTION` corridor to the independently established `EPIPHANY SEEKS THE DEVOTED` route to p32. It does not recover new unknown-page prose or establish a manuscript-wide H decoder.**

The corrected numbered diagonal sends zero-based source index `i` to physical page `p_i`, canonical word `i+1`. Solved p57 supplies `SHED ... CIRCUMFERENCES`, and the local outside-in map is fixed as `H(x,y)=(x-y,x+y) mod29`.

The authenticated corridor contains `THEIR25 NUMBERS26 ARE27 THE28 DIRECTION29`. Following `ARE27` gives p27 canonical word28, offsets111..114, `[0,20,15,1]`. Shed one circumference to `[20,15]`; then `H(20,15)=[5,6]`, exactly authenticated source indices `EPIPHANY SEEKS`.

## Complete diagonal control

There are 42 valid numbered-diagonal objects and 24 remain at least two runes long after one circumference shed. Apply the identical shed-once then H rule to all 24 and ask whether the complete output is a strict +1 or -1 source-index run. Exactly one passes:

```text
ARE27 -> p27 word28 [0,20,15,1]
      -> shed [20,15]
      -> H [5,6]
      -> EPIPHANY SEEKS
```

No source target is named in the predicate. The full object has `H([0,20,15,1])=[28,1,5,6]`, an exact shell occurring once among all 509 complete four-rune unknown-page words. Its raw sum36 = `GOOD` is recorded only as a secondary checksum.

## Existing downstream consumer

The output is the first two words of `EPIPHANY SEEKS THE DEVOTED`. The downstream p50 consumer predates this bridge. Its complete family charges every consecutive four-word source window, every DH-state depth and both live radices. Across 560 cases it has one hit: `EPIPHANY SEEKS THE DEVOTED`, depth `p=23`, base60, ending `... -> 20 -> 102 -> 32`, where 20=GP0(THE), 102=GP0(DEVOTED), terminal32 is p32, and p32 has 121 runes = GP0(EPIPHANY).

Thus:

```text
THEIR NUMBERS ARE THE DIRECTION
-> ARE27
-> p27 word28
-> SHED one CIRCUMFERENCE
-> H = EPIPHANY SEEKS
-> source continuation THE DEVOTED
-> unique p=23/base60 p50 route
-> p32
```

This closes a causal handoff between two established navigation structures. The useful next decision is the authored p32 readout or inversion.

## Reproduction

`node sims/lp2_are27_shed_h_epiphany_seeks_bridge_sft.cjs`
