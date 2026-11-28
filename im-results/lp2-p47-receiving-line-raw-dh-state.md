# P47 selected line-wrap opens a raw DH23 state block through the p47→p48 boundary

**Agent8, 28 November 2026. Classification: source-selected raw state serialization / navigation evidence; no unknown plaintext, body key, cipher inverse, or destination.**

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

Opening **the source-fixed receiving line10 and following its printed carries to the p47 page boundary** removes that closure dependency and exposes a three-line state block. The state is

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

Let `F=0`, `A^-1=11 mod29`, and use ordinary field arithmetic only for the short derived expressions printed below.

## Line10: direct extraction of every state field

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

The first complete group on line10, `[15,12,25,12,21,4]`, has endpoints `15=b` and `4=q`. Together with the isolated line9 singleton `19=B`, these raw descriptors directly expose **all nine** fields without modular exponentiation selecting any missing value.

The standard DH identities now validate the directly extracted register:

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

Across unknown p0–p55, **22** printed lines have the same framing as p47 line11: four fragments, incoming and outgoing carries, with the two middle groups complete. The state-predicted length vector `[q,e,gK,q]=[4,3,10,4]` occurs **once**, at p47 line11. Adding the state-predicted sums and products leaves the same sole hit.

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

Across unknown p0–p55, **20** page-final lines have the same framing: five fragments, an incoming carry, no outgoing carry, and four complete remaining groups. The state-predicted length vector `[e,e,A^-1,e,q]=[3,3,11,3,4]` occurs **once**, at p47 line12. Adding the predicted sums and products again leaves the same sole hit.

Thus the state serialization is not confined to the originally noticed line-wrap. The selected group opens a source-contiguous **three-line tail to the page boundary**, and each successive line's length vector is already unique inside its matched source-framing family before sums or products are consulted.

## Cross-page carrier: the state block continues into p48

P47 line12 does not terminate its final punctuation group at the physical page edge. Under the canonical cross-page parser, its final four runes carry directly into p48's first four runes, giving the source-fixed word

```text
p47 tail   [24,3,24,25]
p48 head   [8,5,10,2]
full word  [24,3,24,25,8,5,10,2].
```

No p48 page scan or word selection is introduced: this is the same punctuation-delimited word already open at the end of the state block.

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

This is a stronger boundary handoff than treating p48 as a fresh page receiver: the same open source object carries the state serialization across the physical page break.

### P48 receiving line stays in the same raw register

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

Among the 32 unknown-page destinations of cross-page words, only **two** first printed lines have this same framing: an incoming page carry, exactly seven visible fragments, and no line carry out. The state-predicted length vector occurs only on **p48 line1**; adding the sum and product vectors leaves the same sole hit.

This is the furthest justified extension of the present source object. The carried word itself selects p48 line1; no claim below this boundary should treat later p48 lines as selected without a new cue.

### Cross-page-word charge

The canonical unknown-page parser contains **32** punctuation groups that cross a physical page boundary in p0–p55. Exactly **one** has length8: this p47→p48 carrier. Consequently it is already source-unique under the single predicted field `length=A=8` before its sum, product, half descriptors, or H8 state packet are inspected.

Within the cross-page family, the exact `(length,sum,product)=(8,14,4)`, exact H8 vector, and the paired half descriptors all therefore have the same unique p47→p48 hit.

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

The line10 observation was found after inspecting the p47 receiving-line context, so the semantic labels are not a blind discovery probability. Lines11–12 were then examined as the source-fixed continuation to the page boundary; their matched-family censuses quantify specificity but do not turn the post-discovery reading into prospective authorship proof.

The causal improvement is still substantial: the current p47 route no longer needs DH closure to manufacture `b/A/K/e/q`. A human following the already selected group47 can read the whole worked-DH register directly from the immediate line geometry and then watch the same state recur through the two remaining printed lines.

What remains missing is the actual consumer. Nothing in this block yet tells a solver which unknown ciphertext to invert, how to serialize a rune-level key, or which reversible cipher to apply. Do not convert the state block into an unconstrained periodic pad.

Related upstream result: [p47 line-wrap → p23 state line](lp2-p47-linewrap-p23-state-line.md).

## Reproduction

Run:

```text
node sims/lp2_p47_receiving_line_raw_dh_state_sft.cjs
```

The SFT reads only the canonical transcription/corpus, reconstructs the selected group47, directly extracts the state on line10, validates DH, exhausts the matched framing families for lines10–12, and charges the immediate six-rune successor across all complete six-rune unknown-page words.
