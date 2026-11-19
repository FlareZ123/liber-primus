# The authenticated 2016 word positions directly encode the complete DH23 exchange

**Agent27, 19 November 2026. Classification: strongest source-native DH reconstruction found in this invocation. It uses the authenticated 2016 text alone: zero-based word positions, canonical GP0 of EMPTY, and ordinary modular arithmetic. It does not use p50, H, any LP2 unknown ciphertext, or the p28 state as an input. The interpretation was recognized after the DH state was already known, so chronology still requires care.**

## Direct reading

Number the authenticated 2016 message words from zero.

The clue-bearing words land at:

```text
PATH       2
LIES       3
EMPTY      4
EPIPHANY   5
SEEKS      6
THE        7
DEVOTED    8

WORDS     15
THEIR     19
ROAD      23

DIRECTION 29
```

Those positions are exactly a Diffie-Hellman exchange:

```text
K = PATH      = 2
e = LIES      = 3
q = EMPTY     = 4
g = EPIPHANY  = 5
a = SEEKS     = 6
A = DEVOTED   = 8
b = WORDS     = 15
B = THEIR     = 19
p = ROAD      = 23
```

with:

```text
5^6 mod23  = 8  = A
5^15 mod23 = 19 = B
8^15 mod23 = 2  = K
19^6 mod23 = 2  = K
15*3 mod22 = 1
```

Two additional source relations close:

```text
GP0(EMPTY) = 92 = p*q = 23*4
g+K = 5+2 = 7
word7 = THE
```

so the recovered sequence

```text
[K,e,q,g,a,g+K,A]
= [2,3,4,5,6,7,8]
```

indexes exactly:

```text
PATH LIES EMPTY
EPIPHANY SEEKS THE DEVOTED
```

The remaining primary state values index:

```text
b=15 -> WORDS
B=19 -> THEIR
p=23 -> ROAD
```

and `word29 = DIRECTION`, supplying a literal 29 marker in the sentence that says the words' numbers are the direction.

## Finite semantic alternatives

Charge the nearest literal alternatives:

- zero-based versus one-based word numbering;
- ROAD versus PATHS as the modulus word;
- PATH versus PATHS as the shared-secret word;
- first versus second occurrence of THEIR as Bob's public value.

Keep the grammatical assignments fixed:

```text
EPIPHANY -> g
SEEKS     -> a
DEVOTED   -> A
WORDS     -> b
LIES      -> e
EMPTY     -> q
```

and require:

```text
p prime
g^a mod p = A
g^b mod p = B
A^b mod p = B^a mod p = K
b*e mod(p-1) = 1
GP0(EMPTY) = p*q
g+K = position of the intervening THE
```

There are exactly `2*2*2*2 = 16` literal configurations.

Exactly one survives:

```text
zero-based numbering
p = ROAD = 23
K = PATH = 2
B = first THEIR = 19
```

yielding:

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4)
```

One-based numbering fails. PATHS fails as the modulus. PATHS fails as the shared-secret label. The second THEIR occurrence fails as B.

## Human solve-path interpretation

This gives a compact intended-route hypothesis that begins from the authenticated hint itself. Its word numbers enact an ordinary DH exchange:

```text
EPIPHANY^SEEKS mod ROAD = DEVOTED
EPIPHANY^WORDS mod ROAD = THEIR
DEVOTED^WORDS mod ROAD = PATH
THEIR^SEEKS mod ROAD = PATH
WORDS^-1 mod(ROAD-1) = LIES
```

In numeric form these are exactly the equations above.

The language aligns unusually well with the operation:

- **ROAD** supplies the prime modulus;
- **EPIPHANY / SEEKS / DEVOTED** form Alice's exponentiation relation;
- **WORDS / THEIR** supply Bob's exponent/public value;
- **PATH** is the shared destination;
- **LIES** is the inverse exponent;
- **DIRECTION** lands at 29, the GP modulus.

This semantic reading was recognized after the numeric state was already available. Treat it as a reconstructed intended route, while the arithmetic itself is fully source-derived and reproducible.

## Relation to the DIRECTION-29 fold

The separate DIRECTION-29 fold found in the same invocation now has a simpler explanation.

The direct word-position exchange reconstructs the DH tuple. The middle instruction ends on DIRECTION at word29. Folding words30..42 back to residues1..13 pairs `THE/SEEK ... WAY/OPENPGP`. Applying canonical GP0 and frozen H to those 13 aligned pairs reconstructs the same tuple through a distinct five-row packet. Across 4,015,440 shift/orientation/role configurations, only the literal fold/forward-H assignment closes.

Thus the source currently contains three convergent state encodings:

1. direct semantic word positions, with no H;
2. DIRECTION=29 modulo fold plus H on paired GP0 values;
3. repeated/equal-GP0 word-position collisions plus H.

The direct word-position exchange is the simplest human-facing explanation.

## Research consequence

The DH tuple can now be read from a first-party authenticated source independent of unknown LP2 ciphertext. The earlier direction-graph topology remains retrospective in its discovery history, while its comparison tuple now has a source-native derivation outside p28.

The next cryptanalytic gate is to use this source-derived tuple to predict an untouched manuscript operation or receiver. Two immediate five-rune uses of the warning-tail graph packet, direct additive use and odd-H inversion, were tested during this invocation and produced zero authenticated five-rune hits across all 318 unknown five-rune words. Those consumers are retired rather than tuned.

## Reproduction

```text
node sims/lp2_signed2016_word_position_dh_sft.cjs
```

The SFT parses the authenticated message, enumerates the 16 literal semantic alternatives, verifies that exactly one complete DH exchange survives, and checks the indexed clue block and EMPTY/DIRECTION relations.
