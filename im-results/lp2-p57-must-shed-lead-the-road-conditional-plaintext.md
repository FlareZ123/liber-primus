# Conditional recovery of p0 `THE ROAD` from `MUST SHED` -> `LEAD`

**Agent46, 19 November 2026. Classification: conditional value-changing plaintext recovery on original p0. Neither `THE` nor `ROAD` is used to derive its key. The main unresolved upstream premise remains the candidate `READ OUT` split-word receiver semantics that interpret conventional base60 p50 outputs as p0 rune offsets80 and102.**

## Result

Within the current READ OUT route, solved p57 and the original p50 table now derive a Latin key word **LEAD** before inspecting the target p0 plaintext.

That key then does two jobs:

1. literal `MUST SHED` applied to LEAD leaves inner **EA**, which source-selects the previously retrospective H-packet coordinate `(A,K)`; the resulting packet key `(a,p)=[6,23]` decrypts original p0 offsets103..104 to **THE**;
2. ordinary A1Z26 numbers of the already derived word LEAD, `[12,5,1,4]`, decrypt the next untouched four-rune word at offsets105..108 to **ROAD**.

Exact forward re-encryption reproduces both original ciphertext words.

The recovered phrase is therefore:

```text
THE ROAD
```

This is the same two-word phrase independently present in the authenticated 2016 clue, but that phrase is used only as an external holdout after the keys and plaintext are derived.

## 1. Derive LEAD from solved p57 and p50, without ROAD

The source-selected p57 route already fixes the ordered radix transition:

```text
WE -> MUST -> SHED
base60 -> base59
```

and independently establishes:

```text
GP-prime(MUST) = 186
GP-prime(SHED) = 232
```

Invert those exact values through the printed 32x8 p50 table under their already active numeric states.

### MUST under base60

Value **186** occurs exactly once in the base60 table:

```text
token 36
zero-based cell 3
one-based coordinate row1, col4 = A,D = AD
```

### SHED under base59

Value **232** occurs exactly once in the drop-f base59 table:

```text
token 3u
zero-based cell 92
one-based coordinate row12, col5 = L,E = LE
```

The solved-text order gives coordinate string `ADLE`. Reversing only the two coordinate pairs gives **LEAD**.

This pair-order choice was not accepted merely because LEAD looks good. The complete charged family is:

- all 19 adjacent p57 word pairs;
- all three standard word metrics GP0, GP1, and GP-prime;
- base60/base59 independently for each word;
- forward and reverse coordinate-pair order;
- only exact table values with a unique p50 cell;
- row/column numbers converted by ordinary A1Z26;
- a frozen four-letter English lexicon built from the repository control corpora.

Only **36** typed coordinate strings survive unique-cell inversion. Exactly **one** is an English four-letter word:

```text
MUST / SHED
GP-prime
base60 / base59
AD / LE
reverse pair order
=> LEAD
```

No other adjacent p57 pair, metric, radix pair, or pair order yields an English coordinate word in that family.

Two additional checks distinguish the two possible pair orders:

```text
ADLE -> native GP [A,D,L,E] -> GP0 85 -> p50[85] = 28
LEAD -> native GP [L,EA,D] -> GP0 71 -> p50[71] = 108
```

The forward order therefore routes back to physical p28, while the readable reverse order points to p0 offset108, the end of the later recovered ROAD word. These are post-selection structural checks, not the criterion that produced LEAD.

## 2. `MUST SHED` LEAD's circumference and obtain EA

Apply the clear solved instruction literally to the recovered four-letter word:

```text
LEAD
shed outer circumference L ... D
=> EA
```

EA is not just a Latin bigram. It is one dedicated native Gematria Primus rune:

```text
EA = GP value28
GP-prime(EA) = 109
```

Among the fixed 12 A1 English-key hits from the independent ROAD-key census, **LEAD is the only key word whose inner two Latin letters collapse to one dedicated GP rune**.

## 3. EA derives the previously retrospective packet selector

The candidate READ OUT receiver p0[80..102] contains four complete words. Apply the already established canonical center-preserving word-shell transform

`H(x,y)=(x-y,x+y) mod29`

to those four words and concatenate the results. The fixed 23-rune packet is:

```text
[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]
```

The selected DH23 state is independently:

```text
p=23, g=5, a=6, A=8, B=19, b=15, K=2
```

EA occurs at one-based packet position **17**. It is the **only** packet rune satisfying the prime self-index rule:

```text
GP-prime(EA) mod p
= 109 mod23
= 17
= its packet position
```

Take EA's immediate packet circumference, positions16 and18:

```text
[5,26]
```

Apply the same frozen H:

```text
H(5,26) = [8,2] = [A,K]
```

This derives the ordered coordinate `(A,K)` without consulting THE.

Now use those values as one-based packet positions:

```text
packet[A=8] = 6  = a
packet[K=2] = 23 = p
```

So the packet itself emits the two-rune additive key:

```text
[a,p] = [6,23]
```

### Manuscript-wide selector census

Across all **2,763** four-complete-word windows on unknown p0..p55 under the same canonical shell transform:

- 51 packets have EA at position17;
- 2 of those have EA's immediate neighbors H-map to `[A,K]`;
- exactly **1** also has packet positions `(A,K)` emit `[a,p]`.

That sole full hit is the selected p0 word18 receiver at offset80.

This removes the specific retrospective-selector weakness in the earlier `(A,K)` packet proposal, conditional on the independently derived LEAD -> EA route.

## 4. Decrypt THE without a plaintext crib

The next original p0 ciphertext word after the receiver is offsets103..104:

```text
cipher = [8,12]
key    = [6,23]
```

Subtract in GP29:

```text
[8,12] - [6,23] mod29
= [2,18]
= [TH,E]
= THE
```

Forward verification:

```text
[2,18] + [6,23] mod29 = [8,12]
```

No THE plaintext symbol is used in selecting the key.

## 5. Decrypt ROAD prospectively with LEAD

The next complete ciphertext word is p0 offsets105..108:

```text
cipher = [16,8,25,27]
```

The already source-derived Latin word LEAD has ordinary A1Z26 values:

```text
LEAD = [12,5,1,4]
```

Use those four values directly as the additive GP29 key:

```text
[16,8,25,27] - [12,5,1,4] mod29
= [4,3,24,23]
= [R,O,A,D]
= ROAD
```

Forward verification is exact:

```text
[4,3,24,23] + [12,5,1,4] mod29
= [16,8,25,27]
```

ROAD was not used to derive LEAD in this reconstruction.

## 6. Independent holdouts and forward receiver

The authenticated 2016 message contains the phrase **THE ROAD**. The derivation above does not use that phrase as a plaintext target, so the external match is a holdout.

The selected inner rune EA also has:

```text
GP-prime(EA) = 109
```

and p0 offset109 is exactly the start of the next complete word after ROAD. This is a prospective receiver checksum only. No plaintext is claimed for the word beginning at109.

A separate attempt to continue the earlier ROAD/LEAD self-end rule recursively onto that word fails before decryption: the authenticated two-rune 2016 targets THE/IS/BE yield no English A1 key. Do not force a recursive LEAD decoder.

## Remaining uncertainty

The downstream holdout now discriminates the receiver state more sharply. Starting from the already derived EA prime109, the untouched p0 word at109 has GP0=40. Zero-based signed word40 is PATHS, p50 address40 returns to80 only under conventional base60, and the source-only BEWARE FALSE PATHS triplet pair [b,e]=[15,3] is the exact additive inverse of that word's ciphertext [14,26].

The next two base60 return-to80 branches are source-labeled PATHS and LUCK. Applying the already-clear SHED CIRCUMFERENCES operation to them yields interior GP0 numbers1 and23, which are signed words THE and ROAD. Across all32 return-to80 triples in the manuscript, this PATHS, PATHS, LUCK route and the shed THE ROAD readout occur together exactly once. Base59 gives READ/OUT endpoints79/100 and supplies no competing return-to80 triple. One-based signed-word numbering gives FALSE, FALSE, GOOD with shed HELLO, THE.

This is a strong holdout on previously untouched ciphertext and substantially reduces the earlier base60/output-semantic ambiguity. The remaining uncertainty is concentrated in the p28 READ OUT construction itself and in whether GP0 was intended as the signed-word number operator. The branch readout was recognized after THE ROAD was already known from the authenticated 2016 source and the earlier conditional recovery, so keep offsets103..108 classified as conditional plaintext pending an independent source rule or an untouched prediction outside this local p0 cycle.

See im-results/lp2-p0-ea109-signed-paths-reset.md for the full census and reproducer.

## Reproduction

Primary SFT:

`sims/lp2_p57_must_shed_lead_the_road_sft.cjs`

Supporting SFTs:

- `sims/lp2_p0_road_lead_must_shed_coordinate_sft.cjs`
- `sims/lp2_p0_road_lead_ea_ak_the_sft.cjs`
- `sims/lp2_readout_hpacket_ak_the_inverse_sft.cjs`

The primary Windows Node22 CI rerun was dispatched after broadening the coordinate family to GP0/GP1/GP-prime; CI status should be verified before promotion to `results/`.
