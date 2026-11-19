# SEEK selects a p0 AND candidate through the existing READ OUT DH-state tail

**Agent8, 19 November 2026. Classification: strong conditional local plaintext candidate. The receiver is source-selected before its rune values are consumed. The packet-tail assembly and arithmetic sign still require independent authentication.**

## Frozen receiver

The authenticated 2016 message contains `SEEK AND`. Canonical `GP0(SEEK)=56`, and original p50 cell56 is token `4E`.

Charge both live radices and zero/one origin:

| Reading | Offset | Result |
| --- | ---: | --- |
| base60 / zero | **254** | **complete p0 word, length3** |
| base60 / one | 253 | not a word start |
| base59 / zero | 250 | not a word start |
| base59 / one | 249 | not a word start |

The selected original word is p0 offsets254..256:

`[19,4,21]`.

The next authenticated word `AND` has three GP runes:

`[24,9,23]`.

## Existing READ OUT packet emits the exact key suffix

The independently selected split READ OUT receiver at p0 80..102 already has a published H-shell serialization:

`[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]`.

Filtering this existing packet to the seven reconstructed DH-state values gives:

`[B,p,a,b,A,g,g,K] = [19,23,6,15,8,5,5,2]`.

Its final three state-valued entries are therefore:

`[g,g,K] = [5,5,2]`.

At the selected receiver:

```text
[19,4,21] + [5,5,2] mod29
= [24,9,23]
= AND
```

The inverse subtraction exactly reconstructs the original ciphertext.

## Complete direct-DH family

Because the `[g,g,K]` form was recognized after comparing against the target, charge:

`[x,x,y]`, with `x,y` from `{p,g,a,b,A,B,K}`, both signs.

There are 98 cases. Compare each output at the fixed receiver only with the seven distinct authenticated three-rune words `PATH, WAY, ITS, ARE, MAP, AND, YOU`.

Exactly one case hits any authenticated target:

`x=g, y=K, sign=+, key=[5,5,2] -> AND`.

## Whole-manuscript fixed-key control

Freeze `[5,5,2]` and both signs across all **724 complete three-rune words** on the rune-bearing unknown pages, comparing outputs with the same seven authenticated three-rune targets.

Exactly two hits occur:

1. p0 word56, offset254, sign+ -> AND;
2. p24 word46, offset188, sign- -> ITS.

The p0 hit is therefore selective only in conjunction with the independent SEEK receiver.

## Relationship to YOU WILL BE FOUND

The authenticated sentence later gives the already stronger route `YOU WILL BE FOUND`: YOU selects the 2L/WILL receiver and source-derived key; K=2 then selects WILL -> BE; the intermediate table direction selects the FOUND-shaped receiver and returns to READ OUT.

The SEEK result extends that sentence one word earlier. It does not establish a uniform word-by-word decoder: AND shares GP0=56 with SEEK, so the same receiver cannot continue to YOU under the same rule.

## Decision

Retain **AND** as a strong conditional p0 candidate. The receiver is tightly selected, and the existing state packet supplies an exact short key with a 1/98 local family hit. The unresolved premise is the rule “take the final three DH-state-filtered values and use the plus sign.” Require an independent selector for that assembly/sign, or a withheld success of the frozen rule, before promotion.

## Reproduction

Run `node sims/lp2_seek_and_readout_dh_tail_sft.cjs`.
