# READ OUT p0 receiver contains a unique radial DH23 signature

**Agent 1, 19 November 2026. Classification: strong post-discovery structural signature on the independently selected READ OUT receiver. The odd-radius readout was recognized after the receiver had been selected, so this is not treated as a prospective p-value.**

## Frozen receiver and field operation

The p28 candidate plaintext **READ OUT** already selects p0 offsets **80..102** through the established split GP0→p50→p0 grammar:

- `GP0(READ)=55 -> p50[55]=80`;
- `GP0(OUT)=20 -> p50[20]=102`.

That receiver is exactly 23 runes long and has center offset **91 = F = 0**.

The independently established p28 shell decoder uses

`H(x,y) = (x-y, x+y) mod29`.

Read only the already fixed first component, left-minus-right, on concentric pairs around the p0 center.

## Exact signature

At odd radii 1,3,5,7 from center91:

| radius | left | right | left-right mod29 | independent DH label |
| ---: | ---: | ---: | ---: | --- |
| 1 | 26 | 21 | **5** | `g` |
| 3 | 13 | 11 | **2** | `K` |
| 5 | 14 | 24 | **19** | `B` |
| 7 | 25 | 10 | **15** | `b` |

Thus the ordered radial output is exactly:

`[5,2,19,15] = [g,K,B,b]`

from the independently reconstructed p28 DH23 state

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

No relabeling or value shift is used.

## Whole-corpus census

Scan every center on unknown pages p0..p55 with at least 11 runes available on both sides. There are **11,746** eligible centers, including **418** whose center rune is F.

Apply the exact same ordered left-minus-right calculation at radii 1,3,5,7.

The exact sequence `[5,2,19,15]` occurs **once** in the full unknown corpus:

- p0 center91, the READ OUT-selected receiver.

The reversed-orientation sequence `[24,27,10,14]` occurs **zero** times.

This census measures how distinctive the observed four-value signature is after its radial pattern was noticed. It does not account for the exploratory freedom that led to choosing odd radii, so it should not be converted into a discovery-wide significance claim.

## Consequence

The split READ OUT continuation now lands on a p0 object with three independent source-linked properties:

1. it is the only p50-reachable 23-rune whole-word-bounded p0 interval with exact center F;
2. its four whole-word GP0 residues are the unique ordered `MLCD` Roman window reported by Agent8;
3. its odd concentric H-differences reproduce the fixed DH state `g,K,B,b` exactly and uniquely across the unknown corpus.

The object should be treated as a typed DH/navigation receiver. The radial signature still does not supply a complete letterwise inverse for its 23 ciphertext runes.

## Reproduction

Run:

`node sims/lp2_p28_readout_p0_dh_radial_signature_sft.cjs`

The SFT reconstructs the READ/OUT addresses, p0 center, four radial differences, fixed DH labels, and exact full-corpus uniqueness census.
