# GOOD37 state packet predicts and decrypts the next LUCK37 receiver

**Agent3, 19 November 2026. Classification: source-derived predecessor transition and key-schedule compression.** Two structures were established independently before this synthesis:

- GOOD37 selects p36 word37 `[2,22,4,1,20]` with unique H5 shell `[a+g,p-K,q,p,p-1]=[11,21,4,23,22]`;
- LUCK37 selects p37 word37 `[3,2,6,27]`, whose untouched H4 shell is uniquely `[g,p+K,A,a-g]=[5,25,8,1]`, and whose exact LUCK key shell is `[B,0,K,g]=[19,0,2,5]`.

The new result is that the first packet deterministically reconstructs both p37 shells before consuming the p37 plaintext.

## Derive the state needed for the next receiver

Let the already established GOOD37 shell be

```text
G = [a+g, p-K, q, p, p-1]
  = [11,   21,  4, 23, 22].
```

The terminal pair gives the unit difference:

```text
one = p - (p-1) = 23 - 22 = 1.
```

The second coordinate gives the shared secret directly:

```text
K = p - (p-K) = 23 - 21 = 2.
```

The first coordinate is `a+g=11`. The unit difference is also the independently established `a-g=1`. Invert the already fixed pair transform:

```text
H(a,g) = [a-g,a+g] = [1,11]
H^-1([1,11]) = [a,g] = [6,5].
```

Standard DH then gives:

```text
A = g^a mod p
  = 5^6 mod23
  = 8.
```

The same source-number state has

```text
q=4,
B=19,
```

and the GOOD packet itself exposes the simple source-position identity

```text
p-q = 23-4 = 19 = B.
```

No p37 ciphertext value is needed for these quantities.

## Predict the untouched p37 receiver shell

The next numbered source word is LUCK37. Its independently selected p37 receiver is word37.

From the GOOD packet alone, predict:

```text
R_next
= [g, p+K, A, a-g]
= [5,25,8,1].
```

Only after fixing that prediction, inspect the selected p37 receiver:

```text
C37 = [3,2,6,27].

H4(C37)
= [5,25,8,1].
```

The prediction is exact.

The existing p37 census already establishes that this H4 shell occurs once among all 509 complete four-rune unknown words. Thus GOOD37 supplies a predecessor-side explanation for a ciphertext feature that previously appeared only as a local state coincidence.

## Derive the exact LUCK key shell

The same GOOD-derived fields give:

```text
S_key
= [B,0,K,g]
= [19,0,2,5].
```

Invert the fixed H4 transform:

```text
H4^-1([19,0,2,5])
= [12,1,1,22].
```

Subtract this key from the already selected p37 receiver:

```text
[3,2,6,27]
-
[12,1,1,22]
mod29
=
[20,1,5,5]
=
LUCK.
```

The authenticated source independently assigns word37 = `LUCK`.

The existing p37 fixed-key control remains decisive: across all 509 complete four-rune unknown words, all nine distinct authenticated four-rune targets and both signs, this exact key has one hit, p37 word37 -> LUCK.

## Why this changes the p37 interpretation

Previously the p37 report had to discover `[B,0,K,g]` retrospectively inside a complete `10^4` direct-state shell family. The GOOD37 predecessor now supplies the state roles and the next raw-shell prediction from a separately selected manuscript object.

Chronology remains important: this transition was recognized after both local packets were already visible in the shared repository. Therefore it is not a blind discovery probability and does not by itself establish a universal page cipher.

It does remove a substantive mechanism weakness. The LUCK key is no longer merely a compact state fit to the p37 target; it is the output of an explicit predecessor state packet whose independent next-receiver prediction is exactly correct.

The causal chain is now:

```text
GOOD37 numbered coordinate
 -> unique p36 H5 state packet
 -> derive K,a,g,A and next raw shell
 -> LUCK37 numbered coordinate
 -> exact predicted p37 H4 shell
 -> derive [B,0,K,g] key shell
 -> exact LUCK plaintext
 -> raw GP0 38
 -> authenticated BEWARE38 / p38 continuation.
```

## Reproduction

Run:

```text
node sims/lp2_good37_luck37_state_transition_sft.cjs
```

The SFT reconstructs the authenticated source roles, the p36 GOOD37 H5 packet, derives the p37 raw and key shells without using the LUCK plaintext, verifies the selected p37 receiver shell, inverts the key, and checks exact LUCK recovery.
