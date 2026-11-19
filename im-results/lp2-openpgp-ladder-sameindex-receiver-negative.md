# OPENPGP modulus-ladder same-index receiver: prospective negative

**Agent12, 19 November 2026. Classification: sealed original-cipher rejection. No unknown LP2 plaintext recovered.**

## Question

Director Issue #1795 asked whether the authenticated OPENPGP hex-stride modulus ladder can select an untouched unknown LP2 receiver and reversible operation without target-driven tuning.

The source-side route was independently reproduced first. Across the complete 16-case family

- alphabetic-only or alphanumeric signed-message parsing;
- backward or forward stride from OPENPGP;
- base59 or base60 for the NUMBERS modulus;
- zero-based or one-based source positions;

exactly one configuration reproduces both the source chain and role packet:

```text
OPENPGP42 -> NUMBERS26 -> PRIMUS10
N = 0x7A35090F
N mod16 = 15 -> WORDS
N mod60 = 19 -> THEIR
N mod29 = 23 -> ROAD
```

This yields the already source-supported state `p=23,q=4,g=5,a=6,b=15,A=8,B=19,K=2,e=3`.

## Precommit

Before opening any candidate ciphertext values, commit `8186dce2664abb6417e983cc5bb420e0af0153cb` froze one receiver construction in:

`workplace/agent12-openpgp-ladder-receiver-precommit.md`

For each residue role at zero-based source position `r in {15,19,23}`:

1. select project page `p_r`;
2. select zero-based canonical local word `r`;
3. require its rune length to equal the authenticated source role's canonical GP length before revealing rune values.

The metadata-only gate gives:

| r | role | source GP length | selected receiver | receiver length | eligible |
|---:|---|---:|---|---:|---|
| 15 | WORDS | 5 | p15 word index15, ordinal16, offsets71..75 | 5 | yes |
| 19 | THEIR | 4 | p19 word index19, ordinal20, offsets85..87 | 3 | no |
| 23 | ROAD | 4 | p23 word index23, ordinal24, offsets117..124 | 8 | no |

Exactly one receiver survives before values are opened: **p15 offsets71..75**.

The precommitted inverse uses the residue itself as a repeated scalar key:

```text
P_i = C_i - b mod29
b = 15
expected typed output = WORDS
```

Addition, neighboring offsets, changed word origins, H/Hinv, alternate field orders, and language-guided repair were excluded before reveal.

## Blind result

The frozen original receiver is:

```text
C = [10,13,8,27,17]
```

The precommitted subtraction gives:

```text
C - 15 mod29 = [24,27,22,12,2]
WORDS         = [ 7, 3, 4,23,15]
```

This is an exact miss.

The unlicensed addition control is also non-target:

```text
C + 15 mod29 = [25,28,23,13,3]
```

Forward reconstruction of the actual tested inverse is exact:

```text
[24,27,22,12,2] + 15 mod29 = [10,13,8,27,17]
```

so the failure is a hypothesis rejection rather than an implementation failure.

## Decision

Reject the exact **OPENPGP-ladder residue -> same-index page -> same-index word -> repeated residue subtraction** receiver construction.

The source-side modulus ladder remains intact. This result supplies no evidence that its residues act as stationary additive keys on same-index LP2 words. Do not rescue this branch by changing sign, local word origin, adjacent offsets, field serialization, or H orientation after seeing the miss.

A future operational use of the OPENPGP ladder requires a different first-party receiver or key-assembly selector fixed independently before unknown ciphertext values are opened.

## Reproduction

`sims/lp2_openpgp_ladder_sameindex_receiver_sft.cjs`

Windows Node22 manual read-only run: https://github.com/FlareZ123/liber-primus/actions/runs/44463637631
