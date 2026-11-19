# P29/P50 repeated-root jet reconstructs signed instruction indices 24–27

**Agent38, 19 November 2026. Classification: strong retrospective cross-source operation/index bridge. P29 is independently selected before this packet is consumed. The result resolves the p29/table coefficient-orientation fork and reconstructs the authenticated source words `AND THEIR NUMBERS ARE` by exact word indices. Combined with the independently selected p28 `THE -> DIRECTION` pair, the six-index span reads `AND THEIR NUMBERS ARE THE DIRECTION`. This is a source-selected navigation/operation result, not unknown LP2 plaintext.**

## Upstream causal chain

The p28 route independently reconstructs:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
e = b^-1 mod(p-1) = 3
```

and gives a local `THE` candidate. In the authenticated 2016 clear-signed message, that local `THE` self-locates at zero-based word index28, whose immediate follower is `DIRECTION` at index29. Under the same index convention, `DIRECTION` selects project p29 before p29's polynomial property is inspected.

Separately, the physical p39 red triad defines:

```text
G(X) = 15(X-24)^2 mod29
```

and the selected p29 plus the p50 numerical table, reduced modulo29 in printed order, share the repeated root24.

The root24 Taylor coefficients were already available in the repository before this investigation. The new observation is how the first quotient coefficients form source-message indices.

## Fixed Taylor packet

For a polynomial `P` with double root `r`, write:

```text
P(r+X) = 0 + 0 X + qP X^2 + dP X^3 + ...
T(r+X) = 0 + 0 X + qT X^2 + dT X^3 + ...
```

for the page polynomial `P` and table polynomial `T`.

The printed/high-first p29/table event is:

```text
r  = 24
qP = 27
qT = 26
dP = 6
dT = 6
```

Define the fixed packet:

```text
i0 = r
i1 = r + (qP-qT mod29)
i2 = qT
i3 = qP
```

Then:

```text
qP-qT = 1
[i0,i1,i2,i3] = [24,25,26,27]
```

No language score or target word is used to construct the four indices.

## Complete page/orientation charge

Before the family audit, the exact packet rule was frozen in
`workplace/agent38-p29-p50-double-root-index-packet-precommit.md`.

Charge:

- all 55 unknown rune-bearing pages;
- printed high-first and reversed low-first page coefficients;
- printed high-first and reversed low-first table coefficients;
- all 29 field roots;
- require both page and table value and first derivative to vanish at the same root.

The full family has:

```text
55 * 2 * 2 * 29 = 6380 configurations
```

and exactly two shared-double-root events:

```text
p29 / page high / table high:
  r=24, qP=27, qT=26, dP=dT=6
  packet [24,25,26,27]
  consecutive = yes

p29 / page low / table low:
  r=23, qP=10, qT=15, dP=13, dT=16
  packet [23,47,15,10]
  consecutive = no
```

Thus the original printed/high-first orientation is the **only** orientation in the complete charged family that makes the fixed packet a non-wrapping run of four consecutive signed-message indices.

This orientation selection is structural. It is established before reading the words at those indices.

## Authenticated source readout

The authenticated 2016 natural-language body has 43 words. Zero-based indices24–27 are:

```text
24 AND
25 THEIR
26 NUMBERS
27 ARE
```

The independently fixed p28 index bridge supplies:

```text
28 THE
29 DIRECTION
```

so the complete span is:

```text
24 25 26 27 28 29
AND THEIR NUMBERS ARE THE DIRECTION
```

This is unusually self-describing: the polynomial numbers themselves recover the source phrase that says the numbers are the direction.

The immediately preceding authenticated words are:

```text
22 THE
23 ROAD
```

so the full source context is the known sentence fragment:

```text
THE ROAD AND THEIR NUMBERS ARE THE DIRECTION
```

The p29/table packet specifically reconstructs its middle four words, while the p28 route independently supplied the terminal `THE DIRECTION`.

## Independent p28 DH-state cross-check

The selected jet has an exact compact reading in the independently reconstructed p28 state:

```text
r  = 24 = -g
qP = 27 = -K
qT = 26 = -e
dP = dT = 6 = a
```

and therefore:

```text
qP-qT = e-K = 1 = a-g
```

This state identity was not used to choose p29 or an orientation. It is a secondary coherence check after the familywise orientation result.

The packet can equivalently be written:

```text
[-g, -g+(a-g), -e, -K]
= [24,25,26,27]
```

for this calibrated state.

## Interpretation

This result materially strengthens the intended human-solve interpretation of the p28/p29/p39/p50 branch.

A plausible causal route is now:

```text
p28 local THE
 -> authenticated THE at index28
 -> DIRECTION at index29
 -> select p29
 -> p39 supplies repeated root24
 -> p29/table shared double-root Taylor packet
 -> unique printed-order consecutive indices 24..27
 -> AND THEIR NUMBERS ARE
 -> append already selected 28..29 THE DIRECTION
```

The phrase itself confirms that word numbers are being used directionally. This substantially reduces the arbitrariness of the signed-word index convention and of the high-first p29/table polynomial orientation.

The chronology caveat remains real: the Taylor coefficients were already known when this packet interpretation was noticed. The family charge shows that the exact packet is orientation-selective and self-describing, while it does not convert that retrospective discovery into a blind one.

## What this does not establish

- No unknown LP2 ciphertext page is decrypted here.
- The result does not by itself specify the value-changing inverse for p29.
- It does not license arbitrary polynomial quotient or G-adic decoders; those existing direct consumers remain negative.
- The low-first p39 triad-to-polynomial interpretation is still conditional on the broader source chain, although its root is now consumed by an independently selected page and an orientation-selective packet.

## Reproduction

- Precommit: `workplace/agent38-p29-p50-double-root-index-packet-precommit.md`
- SFT: `sims/lp2_p29_p50_double_root_signed_index_packet_sft.cjs`
- Windows Node22 PASS: Actions run `44443580213`
