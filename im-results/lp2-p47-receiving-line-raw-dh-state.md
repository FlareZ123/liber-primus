# P47→p46→p21 source-selected corridor exposes raw descriptor packets aligned with DH23

**Agent8, 28 November 2026. Classification: source-selected navigation and raw descriptor evidence. The mixed descriptor→DH-role labels are retrospective correspondences, not a frozen serializer. No unknown plaintext, body key, cipher inverse, or destination.**

## Decision

The existing p47 route fixes one source object before this result is read:

```text
cell115 literal 47
  -> physical p47
  -> page-local group47
  -> rune offsets206..211
  -> [19,1,10,27,11,3]
```

Agent7 showed that this selected six-rune group visibly crosses the original printed line9→line10 wrap as

```text
line9   [19]
line10  [1,10,27,11,3]
split   1 | 5
```

and that the selected group alone gives `a=6`, `g=5`, `B=19`, and `p=23`; ordinary DH closure was then used to recover `b=15,A=8,K=2,e=3,q=4`.

Opening **the source-fixed receiving line10 and following its printed carries to the p47 page boundary** removes the need to choose new source locations. The resulting raw descriptor pool is unusually rich in the already-established DH23 values. For reference, that independently known state is

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

Let `F=0`, `A^-1=11 mod29`, and use ordinary field arithmetic only for the short derived expressions printed below.

## Line10: source-fixed raw descriptor pool

The six visible line10 fragments are:

```text
[1,10,27,11,3]
[15,12,25,12,21,4]
[20,12,28]
[16,3,11]
[3,21,13]
[4,8]
```

The first is the continuation of selected group47. The last continues onto line11. The four middle groups are complete on line10. Their elementary visible descriptors are:

```text
fragment lengths   [5,6,3,3,3,2]
                 = [g,a,e,e,e,K]

GP0 sums mod29     [23,2,2,1,8,12]
                 = [p,K,K,1,A,aK]

GP0 products mod29 [7,23,21,6,7,3]
                 = [g+K,p,-A,a,g+K,e].
```

The first complete group on line10, `[15,12,25,12,21,4]`, has endpoints `15` and `4`; the preceding line contributes singleton `19`. Under a **mixed retrospective assignment** across lengths, sums, endpoints, and the preceding singleton, these primitive values can be labeled as all nine DH23 fields. This is a compact correspondence after the source line is fixed, but the statistic class used for each role is not itself selected by the manuscript.

The standard DH identities validate that this mixed assignment is internally consistent:

```text
5^6  mod23 = 8
5^15 mod23 = 19
19^6 mod23 = 2
15*3 mod22 = 1
q=e+1=4.
```

### Matched line10 charge

Across unknown physical p0–p55 there are **594** printed rune lines. Exactly **89** have line10's source-visible framing: six fragments, incoming carry, outgoing carry, and four complete middle groups.

Within those 89:

```text
length vector [5,6,3,3,3,2]              -> p47 line10 only
+ sums [23,2,2,1,8,12]                    -> p47 line10 only
+ products [7,23,21,6,7,3]                -> p47 line10 only
+ first-complete endpoints [15,4]          -> p47 line10 only.
```

The length vector alone is therefore already a singleton in its framing class.

## Line11: the outgoing carry predicts the next state line

Line10's last fragment carries directly into line11, fixing that next line without a page, word, or offset search. Its visible descriptors are:

```text
lengths  [4,3,10,4]
       = [q,e,gK,q]

sums     [16,13,0,19]
       = [AK,b-K,F,B]

products [1,13,28,8]
       = [1,b-K,-1,A].
```

This is a genuine continuation check because the complete state is already available from line10.

Across unknown p0–p55, **22** printed lines have the same framing as p47 line11: four fragments, incoming and outgoing carries, with the two middle groups complete. The observed length vector `[4,3,10,4]` occurs **once**, at p47 line11. Its DH-style annotation `[q,e,gK,q]`, and the analogous sum/product annotations, are interpretive labels applied after the receiver is fixed; adding the raw sum/product vectors leaves the same sole source hit.

## Line12: page-final continuation

Line11's outgoing carry fixes p47's final printed line12. Its visible descriptors are:

```text
lengths  [3,3,11,3,4]
       = [e,e,A^-1,e,q]

sums     [15,11,3,13,18]
       = [b,A^-1,e,b-K,-A^-1]

products [21,14,24,0,19]
       = [-A,-b,-g,F,B].
```

Across unknown p0–p55, **20** page-final lines have the same framing: five fragments, an incoming carry, no outgoing carry, and four complete remaining groups. The observed length vector `[3,3,11,3,4]` occurs **once**, at p47 line12. Its annotation `[e,e,A^-1,e,q]` is retrospective; adding the raw sum/product vectors again leaves the same sole source hit.

Thus the unusual descriptor structure is not confined to the originally noticed line-wrap. The selected group opens a source-contiguous **three-line tail to the page boundary**, and each successive raw length vector is already unique inside its matched source-framing family before sums or products are consulted.

## Cross-page carrier: the source-fixed descriptor corridor continues into p48

P47 line12 does not terminate its final punctuation group at the physical page edge. Under the canonical cross-page parser, its final four runes carry directly into p48's first four runes, giving the source-fixed word

```text
p47 tail   [24,3,24,25]
p48 head   [8,5,10,2]
full word  [24,3,24,25,8,5,10,2].
```

No p48 page scan or word selection is introduced: this is the same punctuation-delimited word already open at the end of the source-fixed tail.

Its raw full-word descriptors are

```text
length  = 8  = A
sum     = 14 = -b
product = 4  = q.
```

The two physical-page halves preserve additional state structure:

```text
p47 half: length4=q, sum18=-A^-1, product19=B
p48 half: length4=q, sum25=-q,     product17=b+K.
```

Applying the already manuscript-native outside-in transform `H(x,y)=[x-y,x+y] mod29` to the complete eight-rune carrier gives

```text
H8 = [22,22,19,17,4,0,13,26]
   = [p-1,p-1,B,b+K,q,F,b-K,-e].
```

This is a stronger boundary handoff than treating p48 as a fresh page receiver: the same open source object carries the descriptor structure across the physical page break.

### P48 receiving line preserves the same raw descriptor pattern

The carried word fixes p48 line1 before the rest of that line is inspected. Its seven visible fragments have

```text
lengths  [4,2,3,3,4,2,4]
       = [q,K,e,e,q,K,q]

sums     [25,17,11,24,11,24,28]
       = [-q,b+K,A^-1,-g,A^-1,-g,-1]

products [17,8,1,28,17,0,3]
       = [b+K,A,1,-1,b+K,F,e].
```

The complete printed line has **22=p-1 runes** and total GP0 **24=-g**.

Among the 32 unknown-page destinations of cross-page words, only **two** first printed lines have this same framing: an incoming page carry, exactly seven visible fragments, and no line carry out. The observed p48 length vector occurs only on **p48 line1**; adding its raw sum and product vectors leaves the same sole hit.

This is the furthest justified extension of the present source object. The carried word itself selects p48 line1; no claim below this boundary should treat later p48 lines as selected without a new cue.

### Cross-page-word charge

The canonical unknown-page parser contains **32** punctuation groups that cross a physical page boundary in p0–p55. Exactly **one** has length8: this p47→p48 carrier. Consequently it is already source-unique under the single predicted field `length=A=8` before its sum, product, half descriptors, or H8 state packet are inspected.

Within the cross-page family, the exact `(length,sum,product)=(8,14,4)`, exact H8 vector, and the paired half descriptors all therefore have the same unique p47→p48 hit.

## Existing p47 pair-address grammar sends the boundary packet to p46

The pre-existing p47 route already interprets adjacent H fields as two-digit BASE29 numerals, reduces them modulo256, and reads the selected p50 token as a literal page number when exactly one legal page token is produced. Applying that **unchanged** consumer to the new boundary H8 packet

```text
[22,22] [19,17] [4,0] [13,26]
```

gives:

```text
pair       BASE29  mod256  p50 token
[22,22]      660     148      46
[19,17]      568      56      4E
[4,0]        116     116      0s
[13,26]      403     147      2r
```

Only the **first** pair yields a literal legal physical-page numeral: **46**.

Reuse the same page/local-ordinal convention that selected p47 group47 from literal `47`. Physical p46 has 61 page-local punctuation groups, so literal `46` selects **p46 group46** before its runes are inspected.

That group is

```text
[10,2 | 17,18,4]
```

and crosses the printed line9→line10 wrap as a **2|3 = K|e** split. Its raw descriptors are

```text
length  = 5  = g
sum     = 22 = p-1
product = 4  = q.
```

Its outside-in H5 packet is

```text
[6,13,17,20,14]
= [a,b-K,b+K,p-e,-b].
```

This receiver is not merely one favorable self-indexed group. Across the 48 unknown-page objects for which one-based `group ordinal = physical page number` exists, p46/group46 is the only `(5,22,4)` hit. Across **all 2,928** page-local groups on p0–p55, it remains the **only** `(length,sum,product)=(5,22,4)` hit and the only exact H5 hit.

This creates a conditional but fully executable backward navigation leg:

```text
p47 selected descriptor tail
 -> p47→p48 boundary H8
 -> first adjacent pair [p-1,p-1]
 -> BASE29/mod256 cell148
 -> literal token46
 -> p46 group46
 -> unique raw descriptor packet aligned with DH23.
```

The condition is the already published pair-address/literal-page convention; no new radix, modulo, page-number rule, or ordinal rule is introduced here.

### P46 repeats the selected-wrap → receiving-line state mechanism

P46 group46 crosses line9→line10, so its complete receiving line10 is fixed by the same source geometry as p47 group47. It contains seven fragments with:

```text
lengths  [3,3,2,3,5,3,4]
       = [e,e,K,e,g,e,q]

sums     [10,12,2,13,2,11,9]
       = [a+q,aK,K,b-K,K,A^-1,g+q]

products [6,3,2,20,0,20,8]
       = [a,e,K,p-e,F,p-e,A].
```

Across unknown p0–p55, **55** printed lines have the same seven-fragment incoming/outgoing-carry framing. The predicted length vector occurs only on **p46 line10**; adding sums/products preserves that singleton.

The outgoing carry fixes p46 line11:

```text
lengths  [3,3,4,2,3,8,1]
       = [e,e,q,K,e,A,1]

sums     [26,26,18,4,2,28,27]
       = [-e,-e,-A^-1,q,K,-1,-K]

products [13,6,2,8,15,0,27]
       = [b-K,a,K,A,b,F,-K].
```

Among the same **55-line framing class**, this length vector is again unique to **p46 line11** before sums/products are read.

Its carry fixes the final p46 line12:

```text
lengths  [2,9,4,8]
       = [K,g+q,q,A]

sums     [26,28,5,13]
       = [-e,-1,g,b-K]

products [17,10,13,0]
       = [b+K,a+q,b-K,F].
```

Only three unknown-page final lines have the same four-fragment incoming-carry framing; the predicted length vector occurs only on **p46 line12**.

This establishes a repeated **source-selection/framing mechanism** rather than a single p47 source-location coincidence:

```text
source-selected wrapped group N
 -> receiving line10
 -> carry-selected line11
 -> carry-selected page-final line12
 -> raw descriptors repeatedly admit compact DH23 annotations.
```

The p46 final word continues across the p46→p47 physical seam. Applying the same adjacent-H-pair BASE29/mod256 consumer to that 11-rune carrier yields p50 tokens `0G,2O,0P,21,3g`. **Exactly one is a legal literal physical-page numeral: 21.** Reusing the same literal-page/self-ordinal convention therefore selects **p21/group21** before its runes are read.

P21/group21 is `[13,8,15,22]` and has

```text
length=4=q
sum=0=F
product=13=b-K
H4=[20,22,23,6]=[p-e,p-1,p,a].
```

Among the 48 self-indexed page/group objects, p21/group21 is the only `(4,0,13)` raw-triple hit. Across all 2,928 page-local groups there is one other raw-triple collision, but the exact H4 packet is unique to p21/group21.

P21/group21 also lands at the **first rune and first punctuation group of printed line6**. Thus the source-fixed geometry itself reads `page=group=21=-A`, `line=6=a`, `line position=1`, `length=4=q`. Eight of the 48 self-indexed groups lie on line6; p21/group21 is the only one that begins the line.

Because the selected group begins line6, the whole six-group printed line is fixed without another selector. Its descriptors are:

```text
lengths  [4,2,4,4,5,3]
       = [q,K,q,q,g,e]

sums     [0,26,12,11,25,8]
       = [F,-e,aK,A^-1,-q,A]

products [13,17,25,22,6,5]
       = [b-K,b+K,-q,p-1,a,g].
```

Across p0–p55, only **16** printed lines have the same six-complete-fragment/no-carry framing. The observed length vector occurs only on **p21 line6**; adding its raw sums/products preserves that singleton. The whole line has **6 groups**, **22 runes**, total GP0 **24**, and total rune-product **11**. The annotations `6=a`, `22=p-1`, `24=-g`, and `11=A^-1` are compact post-selection correspondences. Thus p21 extends the repeated source-selected line/framing pattern even though its selected group itself does not wrap.

P21/group21 does not cross a printed line. Its two H-pair p50 reads are `3I,3b`, and its start-address117 read is `2p`; none is a legal literal page token. The frozen navigation therefore terminates at **p21**, not at the p46→p47 seam. No p45 continuation is inferred.

## Immediate-successor control

The first complete group after selected group47 is p47 offset212:

```text
[15,12,25,12,21,4]
length=6=a
sum=2=K
product=23=p
first=15=b
last=4=q.
```

Across the canonical **2,864** globally complete unknown-page words, **251** have length6. Exactly two six-rune words have `(sum,product)=(2,23)`: p28 offset26 and p47 offset212. Requiring `(first,last)=(b,q)=(15,4)` leaves **p47 offset212 only**. The successor was fixed by adjacency before this census.

## Evidence boundary

A Critic audit correctly identified the main dependence risk: the source fixation is real, while the semantic readout is mixed. The p47 line10 correspondence uses a preceding singleton, fragment lengths, endpoints, and sums for different roles; product annotations then use derived expressions. Because the established DH atom set plus simple pair sums already covers every residue modulo29, composite labels such as `g+K` or `-A` contribute little independent discrimination. The exact raw vectors and navigation chain are therefore the evidence; the DH equations are consistency checks, not proof that the author specified this mixed serializer.

The line10 observation was found after inspecting the p47 receiving-line context, so the semantic labels are not a blind discovery probability. Lines11–12 were then examined as the source-fixed continuation to the page boundary; their matched-family censuses quantify specificity but do not turn the post-discovery reading into prospective authorship proof.

The causal improvement is still substantial, but narrower than a proven serializer: a human following the already selected group47 reaches a fixed sequence of lines and cross-page carriers whose **raw** length/sum/product/end-point vectors are unusually specific, and the frozen p50 address grammar then navigates `p47 → p46 → p21`. The route no longer depends on choosing a new page, group, phase, or transform after seeing each receiver.

What remains missing is the actual consumer **and a frozen descriptor grammar**. The DH-role annotations switch among lengths, sums, endpoints, a preceding singleton, and derived expressions. Once the DH atom set is known, simple additive labels have weak discriminating value; they must not be counted as independent confirmations. A positive upgrade requires either (1) a descriptor rule frozen before an unseen source-fixed receiver, or (2) an independent first-party opcode that consumes the corridor. Do not convert these correspondences into an unconstrained periodic pad or cipher key.

Related upstream result: [p47 line-wrap → p23 state line](lp2-p47-linewrap-p23-state-line.md).

## Reproduction

Run:

```text
node sims/lp2_p47_receiving_line_raw_dh_state_sft.cjs
```

The SFT reads only the canonical transcription/corpus/grid, reconstructs the selected p47 and p46 corridors, validates the p47→p48 and p46→p47 cross-page carriers, reproduces the p21 terminal receiver, validates DH, and exhausts the matched framing families and group controls described above. Current full SFT passed GitHub Actions run **46149659839** on Windows/Node22.
