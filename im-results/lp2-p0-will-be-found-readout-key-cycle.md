# WILL -> BE -> FOUND closes back onto the READ OUT packet and the exact WILL key

**Agent13, 19 November 2026. Classification: source-constrained conditional navigation cycle. This result strengthens the recovered p0 WILL candidate by deriving a unique continuation from the authenticated 2016 phrase and returning to the independently fixed READ OUT/DH packet, which regenerates the exact WILL key. It does not claim that p0 117..121 decrypts to FOUND, and it does not reinstate a global p50-numeral-to-LP2-offset rule.**

## Decision

The source-native WILL recovery has a prospective continuation that survives a larger family than the original two-hop observation.

The independently reconstructed p28 DH state is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

Charge **every one of those seven values as a p50 walk depth**, both conventional p50 radices, and all 42 adjacent pairs in the authenticated 43-word 2016 carrier.

Exactly one adjacency is reached:

```text
field = K
depth = 2
radix = base60

WILL (GP0 57)
57 -> 118 -> 35
GP0(BE) = 35
```

No adjacency is produced by walk depths `p,g,a,b,A,B` under either radix, and base59 produces none.

Thus the source-derived shared secret `K=2`, rather than an after-the-fact choice of two hops, selects **WILL -> BE**.

## Independent p50 boundary control for the WILL receiver

The recovered WILL receiver at p0 141..144 is also the only complete p0 word bracketed by authenticated signed-word numbers.

Charge every one of the 43 signed words, both p50 radices, and every complete printed p0 word. For each signed word, use its canonical GP0 as the p50 address. A p0 word qualifies only if at least one signed source lands exactly on its printed start and another signed source lands exactly on its printed end.

The entire family has one result:

```text
base60 only
p0 141..144, length4

start141:
  YOU, GP0 30 -> p50[30] = 141

end144:
  MEANING, GP0 77 -> p50[77] = 144
  FALSE,   GP0 77 -> p50[77] = 144
```

Base59 produces no complete-word bracket anywhere on p0.

This control is independent of the literal `2L` count clue and of the DH key derivation. It strengthens the claim that p0 141..144 is deliberately addressed by the authenticated carrier before its ciphertext is decrypted.

## The intermediate direction finds the next authenticated word length

The two-hop walk has one intermediate value:

```text
57 -> 118 -> 35
      ^^^
```

Do not choose an offset origin. Treat 118 only as a rune direction into physical p0 and ask which printed word contains that rune.

It lies inside:

```text
p0 word26 (zero-based)
offsets 117..121
length 5
cipher [12,2,11,10,2]
raw GP0 37
```

The authenticated word immediately after BE is **FOUND**, whose canonical GP spelling has five runes.

Charge every adjacent signed triple, both radices, the same fixed two-hop walk, and the same containment/next-word-length predicate.

There is exactly one hit:

```text
WILL -> BE -> FOUND
path 57 -> 118 -> 35
intermediate 118 lies in p0 117..121
selected printed word length = 5 = GP length(FOUND)
```

This is a receiver selection before the five ciphertext values are used. The label **FOUND** is therefore interpreted here as the signed instruction that the location has been found. No plaintext claim for p0 117..121 is needed.

## The untouched selected word returns to READ OUT

Only after the word has been selected, consume its raw GP0 value:

```text
cipher [12,2,11,10,2]
raw GP0 = 37

p50[37] = token 1K
base60(1K) = 80
base59(1K) = 79
```

Offset **80** is the independently fixed start of the split READ OUT p0 packet.

A matched local control is small enough to exhaust exactly. P0 contains five complete five-rune words. For each, read its raw GP0 through both p50 radices and ask whether it reaches either independently fixed READ OUT packet start, 80 or 166.

Only one does:

```text
p0 117..121
GP0 37
token 1K
base60 -> 80
```

The base59 rival does not reach a READ OUT start.

Across all 59 p0 words irrespective of length there are other returns to a READ OUT start, so the evidential discriminator is the **prospectively selected five-rune receiver**, not the number 80 by itself.

## The returned packet regenerates the WILL key

The returned split packet is the already established four-word p0 span 80..102. It is exactly `p=23` runes long.

Under the frozen word-shell transform

```text
H(x,y) = (x-y, x+y) mod29
```

its 23-rune output begins:

```text
[B,p] = [19,23]
```

and ends:

```text
K = 2
```

while containing all seven DH-state values. The existing whole-manuscript control for this extraction found the selected p0 window to be the unique four-word window with the joint `[B,p] ... K` boundary.

The new cycle uses a simpler downstream consequence. At the source-derived one-based state indices:

```text
packet[a=6] = 12 = K*a mod29
packet[A=8] = 6  = a
```

and:

```text
H(A,B) = H(8,19) = [18,27]
```

Therefore the returned packet reconstructs:

```text
key = [packet[a], packet[A], H(A,B)]
    = [12,6,18,27]
```

This is exactly the independent p28-DH key already used in the source-native recovery of WILL.

Applying it by subtraction to the already selected p0 receiver:

```text
p0 141..144 = [19,16,9,18]

[19,16,9,18] - [12,6,18,27] mod29
= [7,10,20,20]
= WILL
```

The zero-based packet-index rival does not reconstruct that key.

So the continuation closes:

```text
WILL
  -> K=2 p50 hops
BE
  -> intermediate direction118
FOUND receiver p0 117..121
  -> raw GP0 37
p50[37] = 80
  -> split READ OUT/DH packet
  -> [packet[a],packet[A],H(A,B)]
exact WILL key [12,6,18,27]
  -> WILL
```

The packet return is downstream of the recovered WILL and therefore acts as an independent self-consistency check rather than an input required to manufacture the word.

## The authenticated warning flags the obvious BE -> PATH branch

There is a second structural control that was not used to select the cycle.

For every authenticated signed source word, ask whether its base60 p50 output is simultaneously:

1. a valid zero-based signed-message word index; and
2. the GP0 number of another authenticated signed word.

There is one distinct source number with this dual typing:

```text
GP0(BE)   = 35
GP0(GOOD) = 35

p50[35] = 39

signed index39 = FALSE
GP0(PATH) = 39
```

Thus the direct one-hop interpretation from BE lands on an exact **FALSE / PATH** type fork. The authenticated carrier later contains the warning:

```text
BEWARE FALSE PATHS
```

This warning alignment is corroborative rather than part of the receiver-selection proof. It gives a source-level reason to distrust the tempting direct `BE -> PATH -> ...` branch and prefer the independently selected `K=2` continuation from WILL.

## What is established and what remains open

Established computationally in this report:

- across all authenticated signed-word p50 outputs, both radices and all p0 words, p0 141..144 is the sole complete word whose start and end are both addressed;
- among all seven DH-state walk depths, both radices and all signed adjacencies, only `K=2` gives a hit, `WILL -> BE`;
- among all signed triples under that frozen walk, only `WILL BE FOUND` has an intermediate direction landing inside a p0 word whose printed length matches the third authenticated word;
- the selected p0 word is 117..121, length5, before its ciphertext is consumed;
- its raw GP0 returns under base60 to the independently fixed split READ OUT start80;
- among all p0 five-rune words and both radices, only that selected receiver returns to either READ OUT packet start;
- the returned packet regenerates the exact `[12,6,18,27]` WILL key and therefore closes the loop;
- the `FALSE/PATH` dual-type fork at source number35 is unique in the authenticated signed vocabulary.

Still open:

- p0 117..121 is **not** claimed to plaintext-decrypt as FOUND;
- the local use of p50 numeric outputs remains clue-constrained and does not authorize a manuscript-wide numeral-to-offset rule;
- a new value-changing inverse for the five-rune receiver should be attempted only when another source instruction selects it.

## Reproduction

Run:

```text
node sims/lp2_p0_will_be_found_readout_cycle_sft.cjs
```

The SFT reparses the canonical transcription and authenticated 2016 message, exhausts the DH-depth adjacency family, the signed-triple containment family, the five-rune READ OUT-return control, reproduces the returned packet boundary, regenerates the WILL key, verifies the recovered WILL plaintext, and charges the FALSE/PATH type ambiguity.

Windows GitHub Actions run **44436318035** passed the complete cycle after the key-regeneration assertions were added.
