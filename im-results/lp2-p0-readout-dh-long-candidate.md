# P0 READ OUT receiver: DH-state self-encoding and an H→cube LONG candidate

**Agent33, 19 November 2026. Classification: conditional decoder/output candidate. The recovered-looking word LONG is not authenticated plaintext while the READOUT→p0 output/radix semantics and upstream #1689/#1690 gates remain unresolved.**

## Frozen upstream route

Agent1's independently committed READ OUT continuation fixes one untouched receiver before this analysis:

```text
READ  GP0=55 -> p50 byte80
OUT   GP0=20 -> p50 byte102
=> p0 offsets80..102 inclusive
```

The block is exactly 23 runes, begins and ends on printed word boundaries, has exact center `F=0`, and is the only such p0 interval reachable at both ends from the actual p50 byte inventory. The p28 source object that produced READ OUT is likewise a 23-rune center-F line.

The reversible operation family is also frozen upstream. P28 supplies

```text
H(x,y) = (x-y, x+y) mod29
```

with orientation fixed by solved `OUR OWN`; the p27 red19/red13 object then gives `H(19,13)=(6,3)=(a,e)`, selecting the GP29 cube permutation `x -> x^3 mod29`. H therefore precedes the cube selector in the source route.

No new cipher family, key, phase, or alphabet is introduced below.

## The selected receiver self-encodes the DH/cube state

The four printed ciphertext words inside p0 offsets80..102 have:

| p0 word | length | GP0 mod29 |
| --- | ---: | ---: |
| 18 | **3** | **19** |
| 19 | 7 | **20** |
| 20 | **5** | **5** |
| 21 | **8** | **23** |

The recovered instruction itself fixes `GP0(OUT)=20`. Taking that single word OUT leaves

```text
residues = [19,5,23] = [B,g,p]
lengths  = [ 3,5, 8] = [e,g,A]
```

for the independently reconstructed p28 state

```text
p=23, g=5, a=6, A=8, B=19, b=15, K=2, e=3.
```

Across every four-consecutive-word block on original p0..p55, the selected p0 words18..21 are the **only** block with exactly one residue20 whose remaining ordered residue/length pairs are `[(B,e),(g,g),(p,A)]`.

The final pair `(p,A)=(23,8)` is literally the GP indices **D,H** and satisfies the already frozen butterfly:

```text
H(23,8) = (15,2) = (b,K).
```

The first surviving word is independently typed `(B,e)=(19,3)`. Applying its selected exponent3 to the actual three ciphertext runes gives

```text
cube(p0 word18) = [10,23,8] = I,D,H.
```

That exact three-rune result concatenates the independently known p28 word28 center `I=10` and p28 line6 literal prefix `D,H=[23,8]`. Across all **2,928** complete original p0..p55 words, this exact cube output occurs only at the selected p0 word18.

This is structural state recovery. `IDH` is not being claimed as ordinary prose.

## Whole-block source operation yields LONG

Treat the independently selected 23-rune receiver as one reversible object. Apply the already frozen operations in their source order:

1. nested outer-to-inner H shell decode across all 23 runes;
2. GP29 cube each resulting rune.

The first three output GP runes, occupying the source-visible first-word-length slot, are

```text
[20,3,21] = L,O,NG = LONG
```

with `GP0(LONG)=44`.

The full 23-rune output is

```text
LONGTIBOHJPONGSRFGHLUYNOF
```

in inventory transliteration. It is not coherent plaintext as a whole. Only **LONG** is retained as a candidate recovered word.

The decoder is exactly reversible: inverse cube `x^19 mod29`, followed by the inverse H shell map, reconstructs the untouched original p0 offsets80..102 byte-for-byte/rune-for-rune.

A natural reset control loses the hit. Applying the same H→cube transform independently to each of the four printed ciphertext words gives first output `STD`, not LONG. Thus the candidate specifically treats the READ OUT-selected 23-rune receiver as the operation object.

## Original-source controls

Enumerate every original p0..p55 interval that independently matches the receiver's coarse geometry:

- exactly 23 runes;
- begins at a printed-word boundary;
- ends at a printed-word boundary;
- exact center rune F.

There are **23** such intervals. Under the same whole-block H→cube transform:

- only **p0 80..102** has first-three GP0 sum **44**;
- only **p0 80..102** gives the exact first-three output **LONG**.

The second p0 23-rune center-F interval, 166..188, produces `UCF...`, not the candidate.

This matched control is conditional on the already selected receiver geometry. It is not a discovery-wide p-value.

## Independent downstream navigation holdout

Address **44** was already active before this candidate word existed. The solved p57 route has

```text
GP-prime(EMERGE)=300
300 mod256 = 44.
```

Under the frozen post-SHED base59 p50 functional map, address44 follows

```text
44 -> 226 -> 72 -> 161 -> 214 -> 247 -> 189
```

and reaches the fixed point at address189, physical coordinate **(23,5)=(p,g)**, in exactly **6=a** edges. Conventional base60 does not reach that DH root from44.

Therefore the candidate recovered word has a pre-existing non-language consumer:

```text
LONG -> GP0 44 -> frozen base59 path -> DH root (23,5) in a=6 edges.
```

This is a useful external consistency check on the conditional output, while still falling short of an untouched authenticated consumer.

## Decision

Retain **LONG** only as a conditional candidate output word at the start of the transformed p0 80..102 receiver. The surrounding transformed runes remain undeciphered, the whole-block reset is not creator-authenticated, and the upstream READOUT→p0 receiver semantics remain conditional under the Critic audit, so this is not authenticated unknown-page plaintext.

The most important new architectural fact is the receiver's self-encoding state:

```text
take OUT(20) out
remaining (GP0 mod29, length)
= (B,e), (g,g), (p,A)
```

That state reproduces the same DH/cube machinery that selected the receiver, while the H→cube outer output independently re-enters the established navigation graph at address44.

Do not tune the remaining 20 transformed runes with new affine shifts, phases, or language-selected exceptions. A successor should require a source-selected rule that explains the block reset and predicts the next output word or receiver.

## Reproduction

`sims/lp2_p0_readout_dh_long_candidate_sft.cjs`


## Classification boundary

A contemporaneous Critic audit (`communications/broadcast/20261119T001907Z_critic_readout-semantic-chain-boundary.md`) correctly notes that the split READ/OUT continuation changes p50 radix/output semantics and that #1689/#1690 are still auditing upstream premises. This report therefore stays in `im-results/`. It must not be promoted as established plaintext or an established state carrier without a fixed output grammar or a genuinely blind source-authenticated consumer outside the mined p0 receiver.

Windows/Node 22 reproduction passed in Actions run 44428087503.
