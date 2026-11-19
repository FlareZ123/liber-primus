# Title133 factor43 self-selects a signed-word road into p32/p33

**Agent1, 19 November 2026. Classification: source-linked word-number roadmap. The full title133 factorization now has an internal linguistic consumer in addition to the p33 factor-byte consumer. No unknown plaintext is claimed.**

## Fixed inputs

The class-A title133 full rank factors as:

```text
R = 2^4 × 43 × 5051 × 3435600587 × 571505208178548184347727
```

The authenticated 2016 signed message contains exactly **43 words**. That count is itself an exact factor of the rank, so the three remaining large factors have a natural source register: reduce them modulo the signed-word count and use the residues as zero-based word positions.

This consumer is distinct from the later modulo256 p50 factor consumer. It needs no Tor formatting and no arbitrary modulus.

## Factor modulo 43 selects three authenticated words

In increasing factor size:

```text
5051 mod 43                       = 20 -> MEANING
3435600587 mod 43                =  3 -> LIES
571505208178548184347727 mod 43  = 23 -> ROAD
```

Thus the full rank self-selects:

```text
MEANING | LIES | ROAD
```

These are all words from the authenticated sentence, and two are especially close to the source's own operational language:

```text
THE PATH LIES EMPTY
...
THEIR MEANING IS THE ROAD
```

The semantic observation is descriptive. The operational tests below use only the fixed indices and previously established graph/table rules.

## The frozen signed-word direction graph carries them to ROAD

The previously established direction graph is:

```text
next_i = low60(p50[i]) - i - GP_length(word_i) mod29.
```

The factor-selected words follow:

```text
MEANING20 -> MAP18 -> ROAD23
LIES3     -> THE28 -> HELLO0 -> MAP18 -> ROAD23
ROAD23
```

So their graph distances to ROAD are:

```text
[2,4,0] = [K,q,0].
```

The state values `K=2` and `q=4` were independently fixed before this factor-word consumer.

This is a compact source-level interpretation of the selected words: MEANING and LIES converge onto ROAD under the manuscript's already frozen DIRECTION graph.

## Their numbers point into p32 and p33

Now take the canonical whole-word GP0 values:

```text
GP0(MEANING) = 77
GP0(LIES)    = 63
GP0(ROAD)    = 54
```

Follow the already established base60 p50 byte-pointer road for exactly the fixed generator depth `g=5`.

### MEANING

```text
77 -> 144 -> 125 -> 20 -> 102 -> 32
```

So:

```text
GP0(MEANING) --p50^g--> physical p32.
```

The starting value **77** is independently the literal unwrapped p32 SURFACE-exit state from the fixed NE q=4 path:

```text
INSTAR TUNNELING TO THE [SURFACE]
                         |
                         +-> outside-square state77
```

Thus the factor-selected word MEANING names the same numeric state that the p32 geometry reaches without using the factorization.

### LIES

```text
63 -> 51 -> 59 -> 69 -> 73 -> 79
```

So:

```text
GP0(LIES) --p50^g--> 79
```

and **79** is independently the GP prime of the visible p33 **NG** section marker.

### ROAD

```text
54 -> 156 -> 52 -> 86 -> 111 -> 115
```

So:

```text
GP0(ROAD) --p50^g--> 115
```

and **115** is independently the p33 second black-body length.

The factor-selected words therefore land on a nested receiver chain:

```text
MEANING -> p32
LIES    -> p33 NG-marker prime
ROAD    -> p33 second-body length
```

## Endpoint collision controls

The p50 endpoints alone are not unique across the 43-word source, so do not reverse-select the words from the endpoints.

At depth g=5:

```text
endpoint32 : MEANING, FALSE
endpoint79 : LIES, NUMBERS
endpoint115: ROAD, BE, GOOD, PATHS
```

The discriminating selector is the **factor modulo43 residue**, which fixes MEANING/LIES/ROAD before the p50 endpoint is inspected.

## Relation to the full-rank p33 factor packet

A separate test already established:

```text
q79 mod256 = 79 = prime(NG)
79 --p50^A--> 115 = p33 body2
115 --p50^q--> 203 = q32 mod256

q13 mod256 = 187
p50[187] = 81 = p33 body1
```

The new modulo43 consumer independently reaches the same p33 second-body state through source words:

```text
q79 mod43 = ROAD index23
GP0(ROAD)=54
54 --p50^g--> 115.
```

So state115 is now selected by two materially different projections of the same full-rank factorization:

1. factor-byte / visible-marker route:
   `q79 mod256 = prime(NG)=79 --A-->115`;
2. factor-word / authenticated-language route:
   `q79 mod43 = ROAD --GP0,g-->115`.

That convergence substantially strengthens **p33 body2 as the next cryptanalytic receiver**.

## Decoder consequence

The most literal new key hypothesis is to use the selected word `ROAD` itself on the p33 second body. A repeated GP29 additive/subtractive ROAD key was tested immediately after this route was found:

```text
ROAD = [4,3,24,23]
```

Both signs remain nonlinguistic and have IoC near raw ciphertext. This simple decoder is rejected; do not widen it into arbitrary ROAD-derived key schedules.

The useful result is the receiver selection, not a recovered body plaintext.

## Decision

Treat the title133 class-A factorization as an **internal word-number roadmap**:

```text
factor43 register
 -> MEANING / LIES / ROAD
 -> frozen direction graph and GP0 numbers
 -> p32 / NG79 / p33 body115
```

This further demotes the mechanical full-q79 Tor-v2 rendering. The next valuable experiment should operate on the now multiply selected p33 body115 with an independently source-selected reversible operation. Do not generate additional destination strings or fit new arithmetic to state115.

## Reproduction

```text
node sims/lp2_title133_factor43_wordroad_sft.cjs
```

Windows Node.js 22 workflow **44452721403** passed.
