# Q-block base29 address key-serializer gate

**Agent15, 28 November 2026. Classification: exact negative constraint on the fitted p32–p40 q-block key family. This result assumes the currently published receiver addresses and authenticated signed-source labels; it does not authenticate those labels as unknown LP2 plaintext.**

## Motivation

Both q-sized p6 schedule blocks now have complete target-value-blind local receiver addresses:

~~~text
block1 p32..p35 starts [30,132,4,25]
block3 p37..p40 starts [146,57,132,71].
~~~

Write each start as:

~~~text
start = 29*Q + R.
~~~

The resulting address digits are:

| Page | Source | Start | Q | R | fitted raw subtraction key |
| ---: | --- | ---: | ---: | ---: | --- |
| 32 | YOU | 30 | 1 | 1 | [3,0,1] |
| 33 | WILL | 132 | 4 | 16 | [25,5,26,2] |
| 34 | BE | 4 | 0 | 4 | [24,5] |
| 35 | FOUND | 25 | 0 | 25 | [19,14,18,15,17] |
| 37 | LUCK | 146 | 5 | 1 | [12,1,1,22] |
| 38 | BEWARE | 57 | 1 | 28 | [20,7,7,7,13,4] |
| 39 | FALSE | 132 | 4 | 16 | [19,12,19,2,5] |
| 40 | PATHS | 71 | 2 | 13 | [20,20,12,6] |

These raw keys are simply receiver minus authenticated source GP values modulo29.

## Exact address-only collision

P33 and p39 have the same local base29 address:

~~~text
Q=4, R=16.
~~~

But their fitted raw keys disagree immediately:

~~~text
p33 WILL  [25,5,26,2]
p39 FALSE [19,12,19,2,5].
~~~

Therefore no deterministic coordinate stream

~~~text
K_j = F(Q,R,j)
~~~

can generate both fitted keys. The contradiction already occurs at j=0:

~~~text
F(4,16,0) would need to equal both 25 and 19.
~~~

The newly recovered address grammar is consequently a receiver selector, not by itself a key serializer. Any genuine shared serializer must consume at least one additional source-visible input that distinguishes these two uses of address132.

## Low-degree address/source-arity gate

The collision does not exclude a rule that also consumes source arity, block, or q-block slot. To test the simplest such arithmetic route, expand all 33 raw key coordinates into observations over GF(29) and solve exact linear systems for these feature families:

1. affine in `(Q,R,n,j)`: 5 coefficients including the constant;
2. every monomial of total degree <=2 in `(Q,R,n,j)`: 15 coefficients;
3. every degree<=2 monomial after adding q-block identity `b`: 21 coefficients;
4. every degree<=2 monomial after also adding within-block slot `s`: 28 coefficients.

Exact modular ranks are:

| Family | coefficients | rank(A) | rank([A|k]) | Result |
| --- | ---: | ---: | ---: | --- |
| affine Q,R,n,j | 5 | 5 | 6 | inconsistent |
| quadratic Q,R,n,j | 15 | 13 | 14 | inconsistent |
| quadratic + block | 21 | 14 | 15 | inconsistent |
| quadratic + block + slot | 28 | 15 | 16 | inconsistent |

So even after providing the obvious metadata that resolves the p33/p39 address collision, no degree<=2 polynomial over these scalar fields generates the eight fitted raw keys.

This is a model-family exclusion, not a proof against arbitrary nonlinear serializers. It specifically rules out the most direct interpretation of the new base29 addresses as affine/quadratic key coordinates.

## Research consequence

Do not spend additional effort fitting coordinatewise arithmetic directly to `Q,R,n,j`, page block, or slot. The missing selector must be structurally richer: a p6 field/word/geometry choice, an operation on the receiver or authenticated source word as a vector, or a different reversible mechanism.

The receiver-address discoveries remain useful because they sharply separate two questions:

1. **where** p6 points in LP2 — now highly constrained for both q blocks;
2. **how values change at that receiver** — still unauthenticated.

## Reproduction

Run:

~~~text
node sims/lp2_p6_qblock_address_key_serializer_gate_sft.cjs
~~~

The SFT reconstructs the eight receivers and authenticated source GP values, derives all raw subtraction keys, asserts the p33/p39 address-only contradiction, constructs each finite-field design matrix, and reproduces the exact ranks above.
