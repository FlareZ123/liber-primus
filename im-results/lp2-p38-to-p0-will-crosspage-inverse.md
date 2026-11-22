# P38 state packet -> p0 WILL: a cross-page source-selected inverse

**Agent7, 19 November 2026. Classification: strong cross-page source-constrained plaintext recovery of p0 WILL, conditional on the already source-selected p38 packet.**

This result joins two previously separate routes without using the p0 ciphertext to choose the target word or the key.

The upstream p38 chain had already selected:

```text
p38 offsets49..53
  -> typed p50 closure selects authenticated FOUND
  -> fixed base60/low/zero/forward pointer
  -> p50[GP0(FOUND)=36] = 0s
  -> low60(s)=54
  -> next complete p38 word offsets54..56
```

The selected three-rune word is:

```text
[5,12,19]
```

and the fixed p28 Diffie-Hellman state is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

so the packet is exactly:

```text
[g, K*a, B] = [5,12,19].
```

No p0 ciphertext value is used in this typing.

## The packet selects WILL in two independent output types

Use the already selected base60 low digit operation on the packet's outer fields.

At `g=5`:

```text
p50[5] = 3v
low60(v) = 57 = GP0(WILL)
```

At `B=19`:

```text
p50[19] = 0X
low60(X) = 33 = zero-based signed-word index(WILL)
```

Thus the same packet selects the same authenticated word by two different types:

```text
g -> GP0(WILL)
B -> signed index(WILL).
```

Across all 29×29 residue pairs, only three pairs jointly map to a valid authenticated word by this exact GP0/index rule:

```text
(5,19)  -> WILL
(28,8)  -> YOU
(28,15) -> YOU
```

The actual packet outer pair `(g,B)=(5,19)` therefore selects WILL exactly.

## The authenticated predecessor selects the p0 receiver

WILL is signed-word index33. Its authenticated predecessor is:

```text
index32 = YOU
GP0(YOU)=30
p50[30] = 2L
```

The token has the independently supported literal reading:

```text
WILL contains two L runes.
```

Its conventional base60 numeric value is:

```text
base60(2L)=141.
```

Physical p0 offset141 is the start of a complete four-rune word:

```text
p0 offsets141..144
cipher = [19,16,9,18]
```

and WILL has exactly four GP runes.

This reproduces the earlier local YOU/2L receiver route from a new upstream packet. The later zero-inclusive #1739 census shows why this must remain local: five source adjacencies satisfy the digit/letter-count relation and three compound edges survive receiver geometry (YOU→WILL, FOUND→GOOD, GOOD→LUCK). Its token-multiset and p0-boundary nulls do not license the literal rule as a reusable navigation operator. This does not remove the present WILL selection: the p38 packet has already selected WILL independently by GP0 and signed-word index, and YOU is its authenticated predecessor. Here 2L/base60 is a local receiver address, not a globally unique opcode; the separate GOOD→LUCK receiver at p0 offset39 has no LUCK inverse under the 686-key p28 family. See [the familywise audit](lp2-found-good-luck-navigation-familywise-audit.md).

## The p38 packet reconstructs the exact WILL key

The selected packet supplies:

```text
g   = 5
K*a = 12
B   = 19
```

The fixed state supplies `K=2`. Since 2 is invertible mod29:

```text
a = (K*a)/K mod29
  = 12/2
  = 6.
```

Standard DH gives:

```text
A = g^a mod p
  = 5^6 mod23
  = 8.
```

The fixed H transform gives:

```text
H(A,B) = H(8,19)
       = [18,27].
```

Therefore the packet regenerates the already independently charged WILL key:

```text
[K*a, a, H(A,B)]
= [12,6,18,27].
```

Only after the target, receiver and key have been reconstructed do we consume the p0 ciphertext.

Subtracting gives:

```text
[19,16,9,18]
-
[12, 6,18,27]
mod29
=
[7,10,20,20]
=
WILL.
```

Forward replay is exact.

## The recovered state immediately selects and decrypts p0 FOUND

The shared secret is `K=2`. Apply the already documented full-base60 p50 walk from `GP0(WILL)=57` for exactly two hops:

```text
57 -> 118 -> 35.
```

The endpoint is:

```text
35 = GP0(BE).
```

BE is the authenticated word immediately after WILL.

The intermediate value118 lies inside one complete p0 word:

```text
p0 offsets117..121
cipher = [12,2,11,10,2]
length5.
```

The authenticated word immediately after BE is FOUND, also five GP runes.

Reuse the already frozen p0 FOUND key grammar unchanged. The p38 packet and WILL derivation have already supplied `g=5`, `K*a=12`, `a=6`, `A=8`, and fixed `K=2`:

```text
[K*a, g-a, K*g, a-g, A]
= [12,28,10,1,8].
```

Only after the K-hop has selected the five-rune receiver do we apply that key:

```text
[12,2,11,10,2]
-
[12,28,10,1,8]
mod29
=
[0,3,1,9,23]
=
FOUND.
```

Forward replay is exact.

The p38-selected state therefore executes two exact p0 plaintext inverses in one chain: WILL, then FOUND.

## Relation to the p38 FOUND candidate

The chain does **not** require p38 offsets49..53 themselves to plaintext-decrypt as FOUND.

The p38 five-rune object's ciphertext GP0 and p50 closure select authenticated source word FOUND. That source word's GP0 then drives the independently selected low-digit operator to the reciprocal state packet at54..56. The state packet chooses and decrypts p0 WILL.

The causal path is therefore:

```text
p38 ciphertext structure
 -> authenticated FOUND label
 -> frozen low-base60 pointer
 -> p38 [g,K*a,B] state packet
 -> WILL by GP0 + signed-index agreement
 -> authenticated predecessor YOU
 -> 2L receiver selector
 -> p0 offsets141..144
 -> state-derived exact key
 -> WILL plaintext
 -> K=2 p50 walk
 -> BE
 -> p0 five-rune FOUND receiver
```

## Family and chronology boundary

The important chronological separation is:

- the p38 packet is selected by the READ OUT low-digit rule before its state meaning is used;
- WILL is selected from packet fields before the p0 receiver is decrypted;
- YOU/2L selects the receiver before its ciphertext values enter the inverse;
- the packet regenerates the exact WILL key before decryption.

The exact WILL key form `[K*a,a,H(A,B)]` and the FOUND key form `[K*a,g-a,K*g,a-g,A]` were already known from earlier p0 investigations. Their regeneration from the later p38 packet is cross-object validation rather than blind discovery of either key grammar.

The p38 upstream closure and low-digit pointer remain source-constrained mechanisms without solved-page positive controls of their complete combined grammar. The later #1739 result also retires the literal digit-letter p50 rule as a reusable router; only the local packet→WILL dual-type selection and its predecessor-based receiver are used here. Therefore this result strengthens the causal architecture and the p0 WILL plaintext substantially, while it does not establish a general p50 grammar, global LP2 cipher, or the p38 five-rune plaintext.

## Reproduction

SFT:

`sims/lp2_p38_to_p0_will_crosspage_inverse_sft.cjs`

Workflow:

`.github/workflows/agent7-p38-to-p0-will-crosspage-inverse.yml`

Windows Node22 PASS: initial WILL chain **44446640689**; WILL→FOUND extension **44448785838**

The SFT reparses the canonical unknown stream, proves the p38 reciprocal packet is unique among 2,807 addressable complete words, reconstructs the WILL target and p0 receiver, derives the exact key from the p38 packet, verifies the inverse and forward replay, and executes the K-hop WILL -> BE -> FOUND-receiver continuation.
