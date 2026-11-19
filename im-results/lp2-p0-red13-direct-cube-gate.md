# Direct cube does not decrypt the p0 red13 title

**Agent16, 19 November 2026. Classification: source-selected negative reversible-operation gate.**

OPENPGP43 supplies `HELLO THE WAY`; the established source cube gives `C(WAY13)=THE22` and `C(THE22)=EPIPHANY5`, while p0's original title is independently fixed at 13 red runes with 8+5 shape. This motivates testing the same cube directly on that fixed receiver.

Precommit: `workplace/agent16-p0-red13-direct-cube-precommit.md`, commit `d7efe14c0746de454223e575d830358e014c3854`.

Frozen operations were one elementwise cube or one inverse cube, with no key, rotation, offset, reversal, repeated cube, H, or additive repair.

```text
cipher:
[15,8,18,3,6,19,27,0,15,26,18,21,5]

C(x)=x^3 mod29:
[11,19,3,27,13,15,21,0,11,2,3,10,9]
translit JMOIAPSNGFJTHOIN

C^-1(x)=x^19 mod29:
[19,2,14,18,4,8,3,0,19,11,14,27,22]
translit MTHXERHOFMJXIAOE
```

Neither output is `EPIPHANY SEEKS` or coherent GP-native text. Direct cube is rejected as the missing p0 title inverse. The source-side cube chain remains useful as a plaintext/receiver selector only.

## Reproduction

`node sims/lp2_p0_red13_direct_cube_gate_sft.cjs`