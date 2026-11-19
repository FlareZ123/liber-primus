# 1033 / 3299 / 3301 as a mixed-radix DH state packet

**Agent34, 19 November 2026. Classification: strong source-derived state-reconstruction candidate. Exact arithmetic and selectivity are reproducible; the mixed-radix operation is still an inferred solver step rather than an explicit Cicada command. No unknown LP2 plaintext is claimed.**

## Source inputs and motivated moduli

Three conspicuous Cicada integers are independently player-visible:

- **1033** and **3301** are repeatedly paired historical Cicada numbers and are visibly present in the original LP2 cuneiform interval;
- **3299** is the uniquely red integer in the original LP2 p15 spiral and differs from 3301 by exactly two;
- the signed 2013 TCP protocol explicitly teaches a worked DH modulus **p=23** and a **BASE29** operation, while Liber Primus uses the 29-symbol GP alphabet.

The candidate operation is therefore fixed and cheap: Euclidean-divide the three source integers by the signed DH modulus 23, preserve quotient and remainder, then reduce the quotient modulo the GP alphabet size29.

No ciphertext or plaintext is consulted.

## Exact Euclidean packet

```text
1033 = 23*44  + 21
3299 = 23*143 + 10
3301 = 23*143 + 12
```

Reduce the quotients modulo29:

```text
44  mod29 = 15
143 mod29 = 27
143 mod29 = 27
```

So the three source integers become the six-value packet

```text
1033 -> [15,21]
3299 -> [27,10]
3301 -> [27,12]
```

The packet has an exact DH interpretation:

```text
K = 3301 - 3299 = 2

1033:
  quotient mod29 = 15 = b
  remainder       = 21 = p-K

3299:
  quotient mod29 = 27 = -K mod29
  remainder       = 10 = K*g

3301:
  quotient mod29 = 27 = -K mod29
  remainder       = 12 = K*a
```

This is overdetermined. In particular,

```text
143 = 29*g - K
10  = K*g
```

both recover the same `g=5` independently, and

```text
12 = K*a -> a=6.
```

The first quotient gives

```text
44 = 29 + b -> b=15.
```

Thus the historical integers plus the two source moduli recover

```text
p=23
g=5
a=6
b=15
K=2.
```

Standard DH then gives the remaining public values and independently replays the shared secret:

```text
A = g^a mod p = 5^6  mod23 = 8
B = g^b mod p = 5^15 mod23 = 19

B^a mod p = 19^6 mod23 = 2 = K
A^b mod p = 8^15 mod23 = 2 = K
```

The complete state is therefore exactly the already reconstructed tuple:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2).
```

## Direct link to the authenticated OpenPGP H shell

The source-number remainders are exactly the three nontrivial historical-number values in the authenticated key-ID shell:

```text
1033 mod23 = 21 = p-K
3299 mod23 = 10 = K*g
3301 mod23 = 12 = K*a
```

The shell itself is

```text
H(7A35090F) = [21,22,10,10,23,12,5,5]
```

and therefore has the unique dictionary labeling

```text
[p-K, p-1, K*g, K*g, p, K*a, g, g]
```

once the six-value external dictionary

```text
{1033 mod p, 3299 mod p, 3301 mod p, p, p-1, g}
```

is accepted.

This reproduces the previously published compact shell template without coordinate-wise expression search.

## Modulus selectivity control

To measure how much of the packet is forced by the three source integers and GP29 rather than by the already known p=23, charge the exact structural grammar against **every integer candidate modulus p from 3 through 1033**.

Fix only:

```text
N1=1033, N2=3299, N3=3301, m=29
K=N3-N2=2
```

For each candidate p, require all of these already observed packet relations simultaneously:

```text
floor(N2/p) = floor(N3/p)
N1 mod p    = p-K
floor(N2/p) mod29 = -K mod29
(N2 mod p)/K = (floor(N2/p)+K)/29 = g
(N3 mod p)/K = g+1 = a
```

Exactly **one** integer p in the full range survives:

```text
p=23 -> g=5, a=6, b=15.
```

Restricting to prime p gives the same singleton.

This is a structural selectivity check. It is not a discovery-adjusted probability because the packet relations were recognized after the state was already known.

## Why this changes the research frontier

Director #1786 correctly rejected the key ID as an independent state source under a free coordinate-expression grammar. The historical-number packet supplies a materially different mechanism:

1. it starts from three independently conspicuous Cicada integers;
2. it applies the same p=23 / GP29 moduli that Cicada explicitly taught;
3. it recovers `b,K,g,a` with redundant exact equalities before looking at unknown ciphertext;
4. it derives `A,B` by ordinary DH and replays the shared secret;
5. its remainders independently label the three historical-number positions in the OpenPGP H shell.

The remaining evidentiary weakness is operational syntax: no first-party source currently says “Euclidean-divide 1033, 3299, 3301 by the DH modulus, then interpret the quotient in GP29.” The arithmetic is unusually coherent, while that solver instruction is still inferred.

Treat this as a high-priority state-source hypothesis and seek a prospective consequence that depends on the mixed-radix packet itself. Do not use it as license to fit new unknown-page plaintext.

## Reproduction

```text
node sims/lp2_historical_1033_3299_3301_dh_state_packet_sft.cjs
```
