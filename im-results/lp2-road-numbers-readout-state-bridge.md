# ROAD's NUMBERS-shaped receiver returns to READOUT through a raw H-state packet

**Agent22, 19 November 2026. Classification: post-location receiver-content bridge on the independently selected ROAD zero-bracket route. The p0 receiver location and seven-rune shape are source-selected upstream; its values had already been exposed before this H-shell/sum consequence was recognized, so this is mechanism/state corroboration rather than blind plaintext recovery.**

## Authenticated NUMBERS independently selects the AND/THEIR-shaped pair

Before using the selected seven-rune receiver's values, the signed 2016 source supplies a stronger direction rule directly.

The relevant authenticated phrase is:

```text
... THE ROAD, AND THEIR NUMBERS ARE THE DIRECTION.
```

Canonical:

```text
GP0(NUMBERS) = 83
p50[83] = 3D
```

Decode the same printed token under the two live p50 alphabets:

```text
base59(3D) = 190
base60(3D) = 193
```

With one-based p0 receiver semantics:

```text
190 - 1 = 189
193 - 1 = 192
```

Both are exact adjacent p0 word starts:

```text
p0 word42: 189..191, length3
p0 word43: 192..195, length4
```

Those lengths are exactly the GP lengths of the **two words immediately preceding NUMBERS** in the authenticated source:

```text
AND   -> 3 GP runes
THEIR -> 4 GP runes
```

This test uses only authenticated source words, canonical GP arithmetic, the original p50 table, and original p0 word boundaries. It does not use either receiver's rune values.

### Complete source-family charge

For every authenticated 2016 source-word occurrence:

1. compute whole-word GP0;
2. use GP0 as the zero-based p50 cell;
3. decode that printed token in base59 and base60;
4. charge zero- and one-based p0 receiver origins;
5. require both radix outputs to be exact p0 word starts and adjacent;
6. compare their GP-lengths with the two immediately preceding authenticated source words.

Only **three** source words produce any adjacent dual-radix p0 pair:

```text
PRIMUS  / zero -> starts122,124 -> lengths2,3
NUMBERS / one  -> starts189,192 -> lengths3,4
OPENPGP / one  -> starts173,176 -> lengths3,1
```

Only **NUMBERS** matches its two preceding source-word lengths:

```text
AND THEIR = [3,4].
```

This is a source-only, familywise selector for the same p0 pair independently reached by the ROAD base29 branch. It materially strengthens the intended reading of **“their numbers are the direction”**: the word NUMBERS itself supplies the p50 address whose two numeric interpretations point back to the AND/THEIR-shaped pair.

### The preceding p0 word computes NUMBERS before the pair is opened

The immediately preceding original p0 word, offsets183..188, has ciphertext `[0,20,7,12,16,25]`.

Its exact H shell is:

```text
[4,25,4,7,24,19]
= [K^2,p+K,K^2,g+K,p+1,B].
```

The ordered shell occurs **once among all 252 complete unknown six-rune words**. Its coordinate sum is `83 = GP0(NUMBERS)`.

Charge this against the complete three-case authenticated family that produces any adjacent dual-radix p0 word-start pair:

```text
source    preceding-shell sum    equals source GP0?
PRIMUS            68                    no
NUMBERS           83                    yes
OPENPGP           91                    no
```

Thus NUMBERS alone has a local predecessor packet that computes its own GP0 state. Then `p50[83]=3D` points to the immediately following length-3/length-4 receiver pair. This gives a self-contained direction opcode: state packet -> 83 = NUMBERS -> 3D -> AND/THEIR-shaped pair.
The p0 word43 plaintext remains ambiguous between current inverse families; this result authenticates the **source-label/receiver-shape relation**, not the receiver letters.

## NUMBERS token state derives AND and a new THEIR family

The addressed token has another independent state identity:

```text
p50[GP0(NUMBERS)] = p50[83] = 3D
```

Read its visible components against the already fixed p28/GCD state:

```text
3 = e = b^-1 mod(p-1)
GP(D) = 23 = p
```

Across all authenticated 2016 source-word occurrences whose addressed p50 token has a nonzero leading digit and a GP-readable second character, **NUMBERS is the only one whose token is exactly (e,p)**.

The token therefore fixes:

```text
H(p,e) = [p-e,p+e] = [20,26].
```

### First receiver: AND

Charge the complete family `[x, H(p,e)[j], y]`, where x and y are distinct members of `{g,a,b,A,B,K,e}` and j is 0 or 1. This is **84** keys, fixed from the NUMBERS token and the already reconstructed state.

Applying every key to p0 189..191 and scoring only against the distinct authenticated three-GP-rune source words gives exactly one hit:

```text
key = [g,p+e,b] = [5,26,15]
[0,6,9] - [5,26,15] mod29 = [24,9,23] = AND
```

Its H-shell key form is `[B,p-e,p+e]`. This materially upgrades **AND** from a post-target inverse to a source-token/state recovery candidate.

### Second receiver: THEIR

Charge the complete family `[H(p,x)[j], p, K*y, y]` with x,y in `{g,a,b,A,B,K,e}` and j in {0,1}: **98** keys.

Applying every key to p0 192..195 and scoring only against the distinct authenticated four-GP-rune source words gives exactly one hit:

```text
key = [p-a,p,K*g,g] = [17,23,10,5]
[19,12,20,9] - [17,23,10,5] mod29 = [2,18,10,4] = THEIR
```

The key shell is `[K*a,p-1,p-K*g,K^2]`.

This is a substantially more constrained THEIR mechanism than the earlier distinct-field grammar. A competing PATHS inverse at the same p0 receiver remains in the repository, so the current conclusion is **strong THEIR candidate under the NUMBERS-token mechanism**. The decisive next test is whether the two key-family forms can be derived from a common source instruction before another receiver is opened.
## Upstream source selection

The current ROAD branch supplies two independent pieces of geometry.

First, the authenticated ROAD candidate has canonical GP sequence:

```text
ROAD = [4,3,24,23]
base29(ROAD) = 100798
100798 mod256 = 190
one-based direction -> p50 cell189 = 3C
base60(3C) = 192
```

Thus ROAD already selects p0 start192 as the four-rune member of its dual-radix successor pair.

Second, the frozen ROAD source descriptor is:

```text
[p28 rune-line count, HERE-line fragment count, HERE line number, HERE output length]
= [12,5,1,4]
```

Read in source order as zero-based 32×8 p50 coordinates:

```text
[12,5] -> cell101
[ 1,4] -> cell12
```

The table's byte-as-next-address graph gives:

```text
101 -> 229 -> token 00
 12 -> 247 -> 192 -> token 00
```

Cells192 and229 are the only literal `00` tokens. Their strict interior has length:

```text
229 - 192 - 1 = 36
```

The existing ROAD reconciliation uses that independently selected length as a direction from the already selected p0 start192:

```text
192 + 36 = 228
```

Offset228 is exactly a seven-rune word start. The next authenticated ROAD successor after AND THEIR is **NUMBERS**, also seven GP runes. The existing distinct-DH-field inverse family is null at this receiver, so this report does not force a NUMBERS plaintext.

## Raw receiver H shell

The selected p0 word is:

```text
offsets228..234
cipher [25,15,26,1,8,4,16]
```

Apply the already frozen outside-in H operation:

```text
H(x,y) = (x-y, x+y) mod29
```

The complete seven-coordinate shell is:

```text
[9,12,11,19,18,5,1]
```

It has a compact expression in the independently reconstructed p28 state
`p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`:

```text
[ b-a,
  K*a,
  A+e,
  B,
  H(A,B)[0],
  g,
  a-g ]

= [9,12,11,19,18,5,1].
```

The exact seven-coordinate shell occurs **once among all 214 complete unknown seven-rune words**, at this selected p0 receiver.

This expression was noticed after the receiver values were available. Treat it as a state checksum, not a discovery statistic.

## Its numbers point to READOUT

Take the ordinary integer sum of the seven H-shell coordinates:

```text
9 + 12 + 11 + 19 + 18 + 5 + 1 = 75
```

Canonical:

```text
GP0(READOUT) = 75
```

Across all 214 complete unknown seven-rune words, exactly **two** H-shell coordinate sums equal75. The ROAD-selected receiver is one; its exact shell ordering is unique.

Do not send 75 directly to a p0 offset. Reuse the already promoted whole-word GP0 -> zero-based p50 address primitive:

```text
p50[75] = 2v
base60(2v) = 177
```

Independent READOUT receiver work had already fixed p0 **166..188** as a whole-word-bounded 23-rune interval under this exact whole-READOUT/base60 geometry. Its center is:

```text
(166 + 188) / 2 = 177
```

and its length is `23=p`.

So the newly selected ROAD/NUMBERS-shaped receiver returns numerically to the exact center of the independently fixed whole READOUT packet:

```text
ROAD source numbers
  -> p50 zero bracket
  -> length36
  -> p0 start228, seven-rune NUMBERS-shaped receiver
  -> raw H shell [b-a,K*a,A+e,B,H(A,B)[0],g,a-g]
  -> shell-coordinate sum75 = GP0(READOUT)
  -> p50[75] = 2v
  -> base60 177
  -> center of p0 166..188 whole READOUT packet
```

## Returned READOUT state closes back onto THE ROAD

The returned center177 is not a dead pointer. Existing out-of-sample READOUT work already fixes the canonical preserved-center H packet on p0 166..188:

```text
whole READOUT packet boundaries:
[b,A] ... B
= [15,8] ... 19
```

It also fixes the split READ|OUT packet on p0 80..102:

```text
split packet boundaries:
[B,p] ... K
= [19,23] ... 2
```

Among the source-matched center-F packets, the ordered join

```text
166..188 -> 80..102
```

is uniquely selected by the raw boundary equality `B=19`.

The previously frozen one-based packet selector `(A,K)=(8,2)` on the split packet emits:

```text
[packet[A], packet[K]]
= [a,p]
= [6,23].
```

That is the exact additive key for the adjacent original p0 two-rune receiver at103..104:

```text
[8,12] - [6,23] mod29
= [2,18]
= THE.
```

The next original p0 word, offsets105..108, is the independently recovered ROAD receiver:

```text
[16,8,25,27] - [12,5,1,4]
= [4,3,24,23]
= ROAD.
```

So the new bridge closes a larger local loop:

```text
THE ROAD
   |
   | ROAD source numbers
   v
p50 zero bracket
   |
   | interior length36 from p0 start192
   v
seven-rune NUMBERS-shaped receiver at228
   |
   | raw H shell -> state packet -> sum75
   v
READOUT state75 -> p50[75]=2v -> center177
   |
   v
whole READOUT packet166..188
   | unique B boundary join
   v
split READOUT packet80..102
   | frozen (A,K) selector -> [a,p]
   v
THE ROAD
```

This closure uses existing receiver selections and exact forward replays. The newly discovered step remains the post-location reduction of the seven-rune receiver to state75; the downstream READOUT -> THE ROAD route was already present independently.

## Why this matters

The signed NUMBERS word now independently reselects the ROAD branch's adjacent [3,4] AND/THEIR-shaped receiver pair through a unique source-family length match. The ROAD branch also supplied a seven-rune receiver-shape continuation while its value-changing grammar failed. This result gives that receiver a typed use without inventing another plaintext key:

1. ROAD's already frozen source numbers select the two zero endpoints.
2. Their source-selected separation sends the ROAD-selected p0 start192 to a seven-rune word boundary.
3. The raw selected word, under the already frozen H transform, is a compact p28-state packet.
4. Its coordinate sum is the independently known READOUT state75.
5. The promoted p50 address layer returns that state to the independently fixed whole READOUT packet.

This creates a cross-object bridge from the ROAD/2016 route back into the READ OUT/H/DH architecture, and the already frozen READOUT packet join/selector then returns to the local THE ROAD candidate.

## Evidence boundary

The receiver **location and length** are the strongest part of the chain. The seven ciphertext values were already exposed before the H-state formula and sum75 relation were noticed. Therefore:

- do not claim p0 228..234 decrypts to NUMBERS;
- do not use the exact state formula as a blind probability;
- do not infer a global rule that every H-shell sum is a p50 address;
- preserve the sum75 return as a source-linked receiver-content validation that joins two independently developed branches.

A useful next gate is a prospective consumer selected from the READOUT packet by the returned state75, or an independently stated rule that says how a selected raw H-state packet should be reduced to its next direction.

## Reproduction

- `sims/lp2_road_numbers_readout_state_bridge_sft.cjs`
- `.github/workflows/agent22-road-numbers-readout-state.yml`
