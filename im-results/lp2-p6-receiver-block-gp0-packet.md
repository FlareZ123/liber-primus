# P6 Fehu/title packet matches all four scheduled receiver-block GP0 sums

**Agent17, 28 November 2026. Classification: target-rune-blind aggregate receiver constraint and p40 tie-break. The serializer was recognized after the corridor receivers were known, so this is a finite post-discovery mechanism result, not plaintext authentication.**

## Result

P6 already supplies the source-tail block schedule through its printed red-title word lengths:

```text
[q,1,q,K] = [4,1,4,2].
```

Apply that same partition to the eleven already selected manuscript receivers p32..p42, after only the independently established marker removals on p36, p41 and p42. The prepared receiver GP0 values are:

```text
p32..p35  [5,28,6,3]
p36       [16]
p37..p40  [9,1,18,25]
p41..p42  [6,6]
```

The four scheduled receiver-block sums are therefore:

```text
Cblock = [13,16,24,12].
```

This is an exact literal p6 red-title packet. Let `F=0` be the adjacent large red Fehu, let the first red-title word be

```text
W1 = [24,16,14,17],
```

and the terminal red-title word be

```text
W4 = [14,12].
```

With the repository's frozen pair map `H(x,y)=[x-y,x+y] mod29`,

```text
H(F,W1[1]) || [W1[0],W4[1]]
= H(0,16) || [24,12]
= [13,16,24,12]
= Cblock.
```

Equivalently in the established p6 state notation:

```text
Cblock = [b-K,K-b,-g,aK].
```

The relation uses only p6's visible red object and selected ciphertext receivers. It does not use the rune spelling of YOU..OPENPGP, fitted coordinatewise keys, or English scoring.

## Distinction from the q-block edge relation

The published q-block edge result compares corresponding GP0 values in p37..p40 against p32..p35 and obtains the p6 physical-edge packet `[q,K,aK,p-1]`. This result instead collapses **all four schedule blocks**, including singleton p36 and terminal p41/p42, to four block totals and matches those totals directly to a Fehu/title-rune packet.

```text
q-block lane delta:
GP0(C37..40)-GP0(C32..35) = [q,K,aK,p-1]

all-block checksum:
sum GP0(C) inside [q,1,q,K] blocks = [b-K,K-b,-g,aK].
```

## Target-rune-blind p40 tie-break

The p6 block3 residue/arity grammar fixes p37 start146, p38 start57 and p39 start132 uniquely. On p40 it leaves exactly three complete four-rune candidates with start residue13:

```text
start13   GP0=3
start71   GP0=25
start216  GP0=27.
```

Substitute each candidate into the full four-block receiver checksum:

```text
p40 start13   -> [13,16, 2,12]
p40 start71   -> [13,16,24,12]
p40 start216  -> [13,16,26,12].
```

Only start71 equals the literal p6 packet. This supplies an aggregate tie-break independent of the separate p6 address71 route and without using `GP0(PATHS)`.

P32 remains unresolved by this checksum: its two residue/arity candidates at starts1 and30 both have GP0=5, so the existing first-full-stop endpoint is still needed to choose start30.

## Finite p6-visible family charge

Because the exact field roles were recognized after the corridor, charge a broader visual family. Use all eleven runes printed in the p6 red title. Let `x`, `y` and `z` independently range over all eleven title positions, including repeats. Form

```text
H(F,x) || [y,z] = [-x,x,y,z]
```

and grant all 24 coordinate permutations. This is

```text
11^3 * 24 = 31,944 labeled constructions
```

which collapse to **5,856 distinct numeric four-vectors**.

Test the three p40 residue/arity candidates while holding every other scheduled receiver fixed. Exactly one resulting checksum belongs to this broad family:

```text
start13   [13,16, 2,12]  -> no
start71   [13,16,24,12]  -> yes
start216  [13,16,26,12]  -> no.
```

The successful direct printed-order representation is

```text
x = W1[1] = 16
y = W1[0] = 24
z = W4[1] = 12
[-x,x,y,z] = [13,16,24,12].
```

This is a bounded post-discovery charge, not a discovery-wide probability.

## Block-total key-sum consequence

The source-only p6 corridor selector established authenticated-source block GP0 totals

```text
Pblock = [13,6,18,18].
```

Subtracting source totals from receiver totals gives the aggregate additive-key sums:

```text
Cblock - Pblock
= [0,10,6,23]
= [F,K*g,a,p].
```

Under frozen H4 this is

```text
H4([0,10,6,23])
= [6,4,16,23]
= [a,q,K-b,p].
```

This is an aggregate constraint only. It does not specify any page's complete ordered key.

## Evidence boundary and decision

Preserve:

```text
p6 schedule [q,1,q,K]
+ independently selected/prepared receivers p32..p42
-> receiver block GP0 sums [13,16,24,12]
-> exact visible p6 packet H(F,W1[1]) || [W1[0],W4[1]]
-> broad title-family charge rejects both wrong p40 residue candidates.
```

This materially strengthens the claim that p6 organizes receiver state across the **entire** 11-page corridor rather than only supplying isolated local scalars. It also removes address71 as the sole tie-break for the block3 residue grammar under this post-discovery family.

It does **not** authenticate YOU..OPENPGP as unknown plaintext. The central remaining gate is an authored ordered serializer that predicts complete value-changing keys, preferably before target scoring or on a genuinely fresh receiver.

## Reproduction

Run:

```text
node sims/lp2_p6_receiver_block_gp0_packet_sft.cjs
```

The SFT reconstructs canonical page-local words, the p6 red title, all scheduled receiver preparations used here, the three p40 residue/arity candidates, the four block totals, and the complete 31,944-label / 5,856-vector visual family.
