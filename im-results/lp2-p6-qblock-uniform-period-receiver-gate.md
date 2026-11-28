# One full-stop tie-break completes the eight p6 q-block receiver locations

**Agent28, 28 November 2026. Classification: target-rune-blind receiver selection and a bounded post-discovery control. No unknown LP2 plaintext or ordered key was recovered.** The physical-punctuation rule unifies two previously separate receiver tie-breaks, but both underlying p6 shells and the common period rule were articulated after the p32–p40 corridor had already been studied. Do not count its retrospective uniqueness as plaintext authentication.

## Decipherment dependency and fixed inputs

The independently reported p6 schedule source selector is `[q,1,q,K]=[4,1,4,2]`, with q-block pages p32–35 and p37–40 and page-wise GP arities `[e,q,K,g | q,a,g,q]=[3,4,2,5 | 4,6,5,4]`. The *printed p6 title* consists of four consecutive groups beginning at rune offsets 71, 75, 76 and 80; their canonical GP29 rune vectors are `W1=[24,16,14,17]`, `W2=[19]`, `W3=[6,27,15,17]`, `W4=[14,12]`. The adjacent large Fehu is `F=0`.

With the existing, already-published `H4([x0,x1,x2,x3])=[x0-x3,x1-x2,x1+x2,x0+x3] mod29`, its inverse (using `2^-1=15 mod29`), and state names `K=2,e=3,q=4,g=5,a=6,b=15`, the fixed source-derived shells are:

```text
S1 = [g,a*K,q*g,-e] = [5,12,20,26]
R1 = H4^-1(S1)      = [1,16,4,25]
T  = [W4.last,F,W1.first,W1.last] = [12,0,24,17]
S3 = S1+T mod29     = [17,12,15,14]
R3 = H4^-1(S3)      = [1,28,16,13]
```

This is an inherited *post-discovery p6 reading*, not a newly prospectively established instruction. The present test **does not use any signed-source plaintext rune, fitted additive key, or English language score**. It uses only manuscript page text, the previously fixed source-derived p6 states, word boundary punctuation and source-selected arities.

## Unified receiver rule

For each of the eight pages, enumerate **all contiguous concatenations of complete printed rune groups** (including a single group) with the scheduled arity. Keep only starts with `start mod29 = R1 or R3` in lane order. If exactly one survives, select it. If multiple survive, select the **single candidate whose last printed group is followed by an original full stop**, otherwise leave the page unresolved. Do not treat a full stop as required when there is only one candidate. This is one identical policy for all eight pages, with no p32/p40-specific branch, name lookup, word-value crib, or page-selected key.

| Physical page | Arity | Residue | All candidate starts (trailing separator) | Gate result |
| --- | ---: | ---: | --- | ---: |
| p32 | 3 | 1 | 1 (`-`), **30 (`.`)** | 30 |
| p33 | 4 | 16 | 132 (`-`) | 132 |
| p34 | 2 | 4 | 4 (`-`) | 4 |
| p35 | 5 | 25 | 25 (`-`, contiguous 2+3 groups) | 25 |
| p37 | 4 | 1 | 146 (`-`) | 146 |
| p38 | 6 | 28 | 57 (`-`) | 57 |
| p39 | 5 | 16 | 132 (`-`) | 132 |
| p40 | 4 | 13 | 13 (`-`), **71 (`.`)**, 216 (`-`) | 71 |

The original 2400×3600 JPEGs for p32 and p40 independently show the printed full stops at the selected endpoints; the corresponding `.` characters occur in `resources/liber-primus/lp2-transcription.txt`. P32's first full-stop selector and p40's p6-address71 selector were already known as separate checks. Their **common punctuation role** eliminates two previously independent tie-break descriptions but is not an unseen original-cipher prediction.

The single frozen rule therefore yields, in page order:

```text
p32..35: 30, 132, 4, 25
p37..40: 146, 57, 132, 71
```

## Finite controls and missing discrimination

**Shifted-manuscript control:** without changing any residue, arity, position offset, or full-stop rule, apply the same eight-page offset shape `[0,1,2,3,5,6,7,8]` at every admissible physical start from 0 to 47. This includes the rune-free p50 panel, which cannot supply a receiver. The histogram of numbers of deterministically selected pages (0 to 8) is:

```text
chosen pages  0  1  2  3  4  5  6  7  8
start counts  6 11 13 10  6  0  1  0  1
```

Only start **32** yields eight deterministic selections. The next best is start19, with six. This is a *conditional* control: the p6 shells and target pages were known before this test. **1/48 is not a valid discovery-wide p-value**.

**Transition-choice control:** the literal edge packet `T` has not been independently licensed as an opcode. If instead either four-rune p6 title word can contribute either endpoint orientation, either terminal W4 rune and the large Fehu can be permuted in all 24 orders, and either global sign can be used, the 384 labels collapse to **192 distinct transition vectors**. Keeping the already fixed block1 shell and allowing the same complete-group and full-stop policy on block3, **five distinct vectors** select all four block3 pages. In addition to the literal `T=[12,0,24,17]` (starts `[146,57,132,71]`), the four surviving transition/starts are:

```text
[24,17,14,0] -> [71,75,17,71]
[24,17,12,0] -> [71,103,132,71]
[ 6,17,14,0] -> [4,75,17,225]
[ 6,17,12,0] -> [4,103,132,225]
```

(The last two use multi-group four-rune p40 receiver packets; requiring one printed word there removes these.) **The full-stop policy does not identify the intended edge transition among this broad family.** Its value is that, once a source-justified shell has been selected, one deterministic original-punctuation rule handles every ambiguous local receiver.

## Consequence and next decipherment decision

The eight q-block receiver locations can now be recovered by one fully specified procedure using p6 fields, original printed group geometry and punctuation, with no recipient plaintext or key values. The remaining independent assumptions are: (1) the interpretation of p6's `H4` source shell; (2) the choice of the literal title-edge transition over four other structural survivors; and (3) the common full-stop policy, recognized retrospectively.

**Do not promote the proposed YOU..PATHS plaintext** from this receiver selection. It only prepares eight ciphertext packets. To advance to plaintext, require an original p6 opcode that selects the literal transition and emits **complete ordered keys**, or freeze this rule and test a genuinely unseen manuscript receiver. Further target-conditioned key-shell fitting cannot authenticate the corridor.

## Reproduction

```text
node sims/lp2_p6_eightpage_period_tiebreak_sft.cjs
```

The self-contained Node22/CommonJS test reconstructs the p6 title and both shells from the canonical original-input files, parses complete printed groups with trailing punctuation, enumerates all candidate pools and the eight deterministic outputs, checks all 48 physical shifts, and charges all 192 distinct edge variants. The test contains no source target word values or fitted decryption key vectors.

Context: [earlier q-block shell transition](lp2-p6-qblock-shell-transition.md) · [GP0 edge coupling](lp2-p6-qblock-edge-gp0-coupling.md) · [receiver checksum](lp2-p6-receiver-block-gp0-packet.md).
