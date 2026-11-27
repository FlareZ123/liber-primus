# P25 cut5 directly selects and decrypts p40 PATHS

**Agent45, 27 November 2026. Classification: source-constrained producer/consumer reconstruction of an existing local plaintext candidate; no blind new plaintext claim.**

## Result

A direct edge now connects the p25 cube/inverse state object to the independently published p40 PATHS inverse without using the failed-general p50 low-digit transition.

The route is:

```text
p14 mayfly/day -> Dæg23 -> p23
p23 THE ONE RISE -> +2 -> p25
exact p24-26 species source -> Ephemerella ignita / specimen5
                           -> Dæg23 / Cēn5
                           -> historical DH p=23,g=5
reflected mayfly + reciprocal -> g^-1 mod23 = 14
Bézout witness                -> e=3 cross-check

p25 unique [K,g] side object
[18 | 3,20,10,11,16]
  cube boundary / reciprocate 5-rune word
-> [3,10,16,3,8 | 20]
  g=5 fixes the cut
-> sums 40 | 20
-> signed indices PATHS | MEANING

40 = PATHS
-> physical p40
-> unique PATHS-state receiver [4,15,14,21]

upstream shell [g^-1 mod p,A,e,-e]
             = [14,8,3,26]
H^-1         = [20,20,12,6]

[4,15,14,21] - [20,20,12,6] mod29
= [13,24,2,15]
= PATHS
```

The result does not discover PATHS blindly: p40 PATHS and its exact local inverse were already published. The advance is that a separate source chain now regenerates its target and complete numeric key without consulting the p40 rune values.

## Why the p25 output is not an arbitrary split

The frozen p25 transformed output is:

```text
[3,10,16,3,8,20].
```

All five possible ordered cuts have sum pairs:

```text
cut1  3 | 57
cut2 13 | 47
cut3 29 | 31
cut4 32 | 28
cut5 40 | 20
```

The p25 object's independently recovered outer state is `[K,g]=[2,5]`, so `g=5` fixes cut5 before any destination is inspected.

For a family control, nevertheless charge **every cut**. The eight resulting values in the authenticated source index range 0..42 are:

```text
3  LIES
13 WAY
20 MEANING
28 THE
29 DIRECTION
31 AND
32 YOU
40 PATHS
```

Use the receiver type already defined by the p40 work: source index `n` selects physical p`n`; on that page require a complete canonical word with the exact rune length and exact GP0 sum of authenticated source word `n`.

Results:

| index | source word | target state | same-state receivers on pN |
|---:|---|---|---:|
| 3 | LIES | len4, GP0 63 | 0 |
| 13 | WAY | len3, GP0 57 | 0 |
| 20 | MEANING | len6, GP0 101 | 0 |
| 28 | THE | len2, GP0 20 | 0 |
| 29 | DIRECTION | len9, GP0 98 | 0 |
| 31 | AND | len3, GP0 56 | 0 |
| 32 | YOU | len3, GP0 30 | 0 |
| **40** | **PATHS** | **len4, GP0 54** | **1** |

The sole hit is p40 offsets71..74:

```text
cipher = [4,15,14,21]
length = 4
GP0 = 54.
```

This control is stronger than merely observing that 40 happens to name PATHS: the alternative p25 cuts do not produce another consumer of the same pre-existing type.

## Exact upstream key

The independently selected historical worked DH state has:

```text
p=23, g=5, A=8, e=3.
```

The reflected-art reciprocal loop supplies:

```text
g^-1 mod p = 5^-1 mod23 = 14.
```

Therefore the numeric p40 shell is fixed upstream:

```text
S = [g^-1 mod p, A, e, -e mod29]
  = [14,8,3,26].
```

The canonical four-rune H map is:

```text
H([k0,k1,k2,k3])
= [k0-k3, k1-k2, k1+k2, k0+k3] mod29.
```

Its inverse yields:

```text
H^-1(S) = [20,20,12,6].
```

This is exactly the previously observed p40 subtraction key. The prior symbolic label `[-b,A,e,-e]` remains numerically true because `-b mod29=14`; the new route does not need to infer that first role from p40 output.

## Exact decryption and replay

```text
cipher = [4,15,14,21]
key    = [20,20,12,6]

plain  = cipher - key mod29
       = [13,24,2,15]
       = P A TH S
       = PATHS.

plain + key mod29
= [4,15,14,21]
= cipher.
```

## Evidence boundary

What is now materially stronger:

- p25 is independently reached from p23 by THE ONE RISE → +2;
- the exact later mayfly source supplies a plausible LP2-local selector for historical DH(23,5);
- the p25 object is the unique manuscript-wide outer `[K,g]` side object in the previously charged 627-object family;
- `g=5` fixes the p25 split;
- all-cut direct-index control selects only p40/PATHS under the pre-existing receiver type;
- the mayfly/DH/inverse packet supplies the complete numeric p40 H-shell before p40 ciphertext values are consulted;
- exact H inversion, decryption and forward replay recover PATHS.

What remains unresolved:

- the species-name semantic reading and reflection→modular-reciprocal step are source-constrained interpretations, not signed instructions;
- assigning cube exponent3 to the boundary and reciprocal exponent27 to the five-rune p25 word is supported by the existing signed-cube operator and side-object work but remains a local two-part application;
- p40 PATHS was known before this chain was assembled, so this is not a blind plaintext probability;
- the mechanism has not yet predicted a fresh second receiver under frozen rules;
- no long p40 body plaintext or general LP2 cipher follows.

The correct next test is a **fresh precommitted receiver**, not another parameter sweep.

## Reproduction

`node sims/lp2_p25_paths40_direct_consumer_sft.cjs`
