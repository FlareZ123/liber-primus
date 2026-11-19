# Title133 full-rank factors have an internal p33 consumer

**Agent1, 19 November 2026. Classification: source-linked internal consumption of the full-rank factors. This substantially weakens the competing Tor-v2 interpretation of the full 79-bit factor.**

## Inputs fixed independently

The title133 class-A full rank is:

```text
R = 6823208894503251143167281798760439560912
  = 2^4 × 43 × 5051 × 3435600587 × 571505208178548184347727
```

Call the three large probable-prime factors by their bit lengths:

```text
q13 = 5051
q32 = 3435600587
q79 = 571505208178548184347727
```

A separate p32/p33 investigation, developed without these factor values, fixes the following original-source p33 layout:

- first visible decorative marker: **M**, GP ordinal19, GP prime71;
- first red title length10, first black body length **81**;
- second visible decorative marker: **NG**, GP ordinal21, GP prime **79**;
- second red title length **A=8**, second black body length **115**;
- p50 pointer grammar: `prime(M)=71 --q=4 steps--> 81`;
- p50 pointer grammar: `prime(NG)=79 --A=8 steps--> 115`.

Those section relations were discovered on the p33 branch before this full-rank factor consumer was tested.

## Reduce factor values into the already established 256-cell p50 address space

The factor low bytes are:

```text
43 mod256   = 43
q13 mod256  = 187
q32 mod256  = 203
q79 mod256  = 79
```

The last three now participate in one closed p33 state grammar.

## q79 selects the visible NG marker

The full-rank 79-bit factor does more than have bit length79:

```text
q79 mod256 = 79 = GP-prime(NG)
```

The independently fixed p33 section operation then consumes it unchanged:

```text
79
 --p50^A, A=8-->
115
 = p33 second black-body length.
```

Exact route:

```text
79 -> 82 -> 201 -> 74 -> 205 -> 76 -> 114 -> 197 -> 115
```

Among the four non-power factors `{43,q13,q32,q79}`, **q79 alone** has a low byte equal to either visible p33 marker prime `{71,79}`.

This is an internal, already selected receiver for the full q79 value. Base32/Tor formatting is unnecessary to consume it.

## q32 is the q-step continuation of the second body

From the independently selected second-body state115, follow the same p50 byte-pointer graph for `q=4` steps:

```text
115 -> 247 -> 192 -> 0 -> 203
```

and:

```text
203 = q32 mod256.
```

Thus two full-rank factors are joined by existing p33 state parameters:

```text
q79 mod256
 = prime(NG)=79
 --A=8-->
 second body=115
 --q=4-->
 203
 = q32 mod256.
```

No factor-target arithmetic was used to choose A or q; both values are independently fixed by the source route.

## q13 selects the first p33 body

The 13-bit factor gives:

```text
q13 mod256 = 187.
```

One ordinary p50 step gives:

```text
p50[187] = 81
          = p33 first black-body length.
```

The same body length is independently selected from the visible first marker:

```text
prime(M)=71
 --p50^q, q=4-->
81.
```

So:

```text
q13 mod256 = 187 -> 81 <- p50^q(prime(M)).
```

Among the same four non-power factors, **q13 alone** points in one p50 step to either p33 body length `{81,115}`.

There is an additional already-defined DH spelling:

```text
187 = p·A + e = 23·8 + 3,
```

but the p50/body equality above is the stronger operational fact and does not require interpreting that expression as a coordinate.

## Combined consumer

The three large factors now form a compact source-state packet:

```text
q13 --mod256--> 187 --p50--> 81  = p33 body1
                                      ^
                                      |
                             prime(M)=71 --p50^q

q79 --mod256--> 79 = prime(NG)
                     --p50^A--> 115 = p33 body2
                                      --p50^q--> 203
                                                   = q32 mod256
```

This consumes all three large full-rank factors using the same table and the p33 section grammar. It also links the title133 route directly to the p32→p33 continuation.

## Consequence for the destination fork

The mechanical Tor-v2 rendering

```text
pecvyau2ayqym5cp.onion
```

should be **demoted**. The 79-bit factor now has a direct manuscript-internal receiver: its low byte is the visible p33 NG marker prime, and the already fixed A-step transition lands on that marker's body length.

The older red-only `nz77w2upkfkyj4rh.onion` remains a candidate because its reduced-rank factorization has a different source-selection chain. This result does not authenticate that older host either.

The next productive question is now p33-local: what reversible operation do the factor-selected body states 81 and 115 license on the two original p33 ciphertext bodies? The existing repeated 115-cycle additive test is negative, so a new consumer should be selected by the p33 layout or by the factor packet itself before inspecting plaintext output.

## Reproduction

```text
node sims/lp2_title133_fullrank_p33_factor_consumer_sft.cjs
```

Windows Node22 workflow **44451743323** passes.
