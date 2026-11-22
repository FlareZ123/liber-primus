# Authenticated 2016 word numbers select a closed GP29 cube operator

**Agent31, 19 November 2026. Classification: strong first-party source selection for the GP29 cube operator used by the p28 READ OUT candidate. The signed source fixes the state, exponent and modulus before unknown ciphertext is consulted. A manuscript-wide raw-numeric census then tests the fixed action without English scoring. Discovery chronology remains post-READ-OUT, so this promotes the mechanism evidence rather than being treated as a blind plaintext probability.**

## Source-fixed operation

The direct zero-based source reading gives `K=PATH=2`, `e=LIES=3`, `A=DEVOTED=8`, `b=WORDS=15`, `B=first THEIR=19`, `p=ROAD=23`, and literal `DIRECTION=29`.

Therefore the authenticated text itself defines

```text
C(x) = x^e mod DIRECTION = x^3 mod29.
```

Across every exponent 1..28, exponent3 is the unique value satisfying the already reconstructed GP29 state chain

```text
K^r=A, A^r=B, B^r=b.
```

The source label `LIES=3=e` therefore selects the same exponent without target fitting.

## Closed source-word cycles

Continuing the fixed map yields

```text
PATH(2)
 -> DEVOTED(8)
 -> THEIR(19)
 -> WORDS(15)
 -> IS(11)
 -> NUMBERS(26)
 -> PATH(2).
```

The first four states are the independently reconstructed `K,A,B,b`; the continuation through **IS** and **NUMBERS** and the return to **PATH** are additional authenticated-source structure.

The modulus orbit is also source-readable:

```text
ROAD(23)
 -> ARE(16)
 -> THE(7)
 -> AND(24)
 -> MEANING(20)
 -> THEIR(25)
 -> ROAD(23).
```

The complete permutation of source word numbers 0..28 is

```text
0
1
2 -> 8 -> 19 -> 15 -> 11 -> 26 -> 2
3 -> 27 -> 21 -> 10 -> 14 -> 18 -> 3
4 -> 6 -> 13 -> 22 -> 5 -> 9 -> 4
7 -> 24 -> 20 -> 25 -> 23 -> 16 -> 7
12 <-> 17
28
```

The nonzero residues outside the four six-cycles are exactly `1,12,17,28`, and all four are **THE** in the signed message. The first29 words contain six THE tokens at `1,7,12,17,22,28`. Holding that multiset fixed, the exact placement fraction is

```text
C(24,2) / C(28,6) = 276 / 376740 = 0.0007326007...
```

and zero-based origin is the sole one of 29 cyclic origins that puts THE on all four short-cycle positions. This calibration was recognized after inspecting the pattern, so it is descriptive evidence rather than a discovery p-value.

## P28 mechanism consequence

This addresses the remaining operator-class gap in the p28 audit. The cube map is now selected by authenticated source word numbers, while p57 circumference grammar independently fixes the action counts once that map is applied to the p28 object:

```text
center singleton: one cube -> exponent3
five-rune word: three nonempty layers -> exponent 3^3 mod28 = 27.
```

Physical state28 is itself a fixed point of the source operation, `28^3 mod29=28`. The remaining local premise is whether the source-selected cube map should act separately on the center singleton and adjacent five-rune word.

## Fresh language-free manuscript census

Apply only the frozen `(3,27)` action to every original unknown five-rune side-object and charge every internal split:

- 627 side-objects;
- five splits each;
- 3,135 configurations.

Require only the independently established low-digit relation `left -> right -> FIND(42) -> p28`. Exactly two raw hits survive:

```text
p25 word30 predecessor, split5|1:
  [3,10,16,3,8] | [20]
  sums 40 | 20
  raw OITOHL

p28 word28 predecessor, split3|3:
  [4,28,23] | [3,1,16]
  sums 55 | 20
  raw READOUT
```

P28 is the sole balanced `3|3` hit and the sole hit on the independently selected terminal page28. The p25 `5|1` collision is preserved as the unconstrained-split rival.

## Consequence

GP29 cubing now has a first-party source derivation. This materially narrows the remaining p28 uncertainty from “why a GP29 power map?” to “why apply the source-selected cube map separately to this exact center/word object?” The evidence remains post-discovery, so a fresh downstream ciphertext consequence is still the cleanest route to final plaintext promotion.

## Reproduction

`node sims/lp2_signed2016_wordnumber_cube_operator_sft.cjs`
