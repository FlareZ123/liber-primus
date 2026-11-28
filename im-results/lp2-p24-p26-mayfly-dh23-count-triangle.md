# P24–26 mayfly rune-count triangle reproduces DH23 e,g,A

**Agent37, 28 November 2026. Classification: new source-level cross-object state lock; no unknown plaintext or cipher receiver recovered.**

## Result

The original p24, p25 and p26 pages form one source-delimited visual family: all three carry the same independently identified mayfly plate artwork. Their exact original GP29 rune counts are:

```
p24 = 270
p25 = 273
p26 = 265
```

The three pairwise absolute differences are therefore:

```
|p24-p25| = 3
|p24-p26| = 5
|p25-p26| = 8
```

These are exactly **[e,g,A] = [3,5,8]** from the independently reconstructed p28 Diffie-Hellman state:

```
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e = g-K = 3
```

The correspondence is edge-specific rather than merely an unordered set:

- p24↔p25 count difference = **3 = e**;
- p24↔p26 count difference = **5 = g**;
- p25↔p26 count difference = **8 = A**.

No plaintext was used to obtain any page count or the p28 tuple.

## Why the p24↔p26 edge is especially constrained

The quantitative artwork study independently established that p24 and p26 have **exactly pixel-identical** left and right mayfly decoration crops; p25 is the same motif with a small (+1,+1) registration difference. The exact-copy pair is therefore p24↔p26.

That exact-copy pair has rune-count difference **5**. Independently:

- the recovered p28 state has generator **g=5**;
- the external mayfly plate identifies the image as Figure4 **specimen5**, *Ephemerella ignita*;
- the chapter opener p23 visibly prints **five black dots**.

Thus the same-art p24↔p26 edge is tied to 5 in three separate source registers: page-length difference, image-source specimen label and visible dot count, while p28 independently labels the same value as DH generator g.

The prior mayfly report already noted the specimen5 / five-dot agreement. The **new** observation is the page-count triangle and its exact [e,g,A] identification.

## Complete contiguous-triple control

The state values [3,5,8] also happen to be consecutive Fibonacci values, so that mnemonic by itself is not evidence for DH. The relevant control asks the exact source question: among all **54 contiguous three-page windows** in original p0–p55, how often do the three pairwise absolute rune-count differences equal the fixed set {3,5,8}?

Exactly one window survives:

```
p24,p25,p26 -> counts 270,273,265 -> differences 3,5,8.
```

No other contiguous triple has that difference set.

This uniqueness is conditional on the already source-selected contiguous mayfly chapter; arbitrary noncontiguous triples are not rare and are not evidence. The manuscript artwork supplies the reason to evaluate this particular consecutive triple.

## Relation to the new Rune-Poem / oak navigation route

A separate source path now points into the same chapter without using these count differences:

- the signed-2016 carrier and p32/p55 share the common oak stock drawing;
- oak -> Rune-Poem **Ac**, GP0=24, GP prime=97;
- p32 has exactly 121 runes, satisfying **97+24=121**, while p55 does not;
- Ac's ordinary stanza ordinal25 / GP0 value24 points naturally to the 25th LP2 page, physical p24.

Thus the p32 oak checksum selects p24 before the p24–26 DH-state triangle is examined. This reduces, but does not eliminate, post-selection risk.

See `im-results/lp2-rune-poem-artwork-ordinal-navigation-gate.md`.

## Ordered terminal-imbalance lock fixes the triangle sign/orientation (Agent3, 28 November 2026)

The earlier result identified the three edge magnitudes but left the sign/order of the triangle as an unresolved source-selection question. Natural manuscript order plus the **terminal p26 red 13-dot mark** now removes that freedom without reading any unknown plaintext.

Keep the page counts in printed order:

```
N24 = 270
N25 = 273
N26 = 265
```

The two signed count edges that terminate at the final illustrated page are

```
N26-N25 = -8  ≡ 21 (mod29)
N26-N24 = -5  ≡ 24 (mod29)
```

and the exact sum of those two inward count gaps is encoded by

```
N24 + N25 - 2*N26
= 270 + 273 - 2*265
= 13.
```

That **13 is exactly the count of p26's red terminal large-punctuation mark**, located after rune265. This is not a modulo coincidence: the ordinary integer endpoint imbalance equals the visible mark count. It is the negative sum of the two signed incoming count gaps, not the standard second finite difference. Consequently the natural chronological edge signs are fixed as

```
p24 -> p25 : +3 = +e
p24 -> p26 : -5 = -g
p25 -> p26 : -8 = -A
```

rather than only the unsigned set `{e,g,A}`.

The manuscript-wide source control is finite. Across all 54 contiguous p0–p55 triples, exactly **10** end on a page whose large punctuation lies after its final rune. P24–p26 is the **only** such triple for which the absolute endpoint imbalance equals that terminal mark count. Broadening the comparison to every large mark on the third page gives 30 comparisons and one additional match, p36–p38 with endpoint imbalance10 against an **internal** 10-dot mark at offset186; it is not a terminal closure. Thus the p26 endpoint condition is doing real selection work.

The same geometry now supplies a **typed local H operation**, not merely a convenient presentation. With the already-frozen conditional-local map `H(x,y)=(x-y,x+y) mod29`, apply H to the two source-ordered count gaps that point into a page carrying a terminal large mark. For p26:

```
H(N26-N25, N26-N24)
= H(21,24)
= [26,16]
= [p26, -13] mod29.
```

Both outputs are typed by untouched source metadata: the first is the endpoint's own project page number **26**, and the second is the negative of its terminal red **13**-dot mark. No signed-2016 word, DH label, or unknown rune value is needed to define or validate that target.

This exact predicate is unique in the complete terminal-mark family. Across all **10** contiguous triples whose third page ends in a large punctuation mark, p24–p26 is the only canonical presentation satisfying

```
H(short incoming count gap, long incoming count gap)
= [endpoint page mod29, -terminal mark mod29].
```

Charging all three possible triangle vertices and both input orders gives **60** terminal presentations; the same p26 final-vertex, unswapped presentation is the **only** hit. Thus the visible terminal mark and page number jointly select the vertex, input order and both H channels. This is a source-typed local packet operation; it does not promote H to a manuscript-wide plaintext transform.

The typed packet has a direct body receiver before any language score is consulted. Read `[26,16]` as the ordinary project-page/local-rune coordinate **p26 offset16**. Offset16 is a canonical printed word boundary: the selected word crosses the first physical line break and has five runes

```
GP0 values = [13,28,8,27,1]
(length, sum, product mod29) = (5,19,5).
```

Under the independently reconstructed DH23 tuple this descriptor is exactly

```
[g, B, g] = [5,19,5].
```

The two numeric fields also fix the ordinary coordinate origin rather than leaving a zero/one-based choice. Charge the four conventional interpretations of `[26,16]`: zero-/one-based page numbering crossed with zero-/one-based local rune position. Only **zero-based page p26 + zero-based offset16** lands on any canonical word start; the other three interpretations land inside words. This is source-structural evidence for the exact address before the selected rune values are graded.

The receiver is selective independently of those labels. Parsing all **2,928** canonical p0–p55 words without splitting physical line wraps, exactly **one** word has `(length,sum,product)=(5,19,5)`: **p26 offset16** itself. Thus the page-count packet does not merely return metadata; it lands on a manuscript-unique body object carrying the public DH pair `g=5, B=19` in two elementary descriptors.

Ordinary DH supplies the next state value without choosing a new cipher family:

```
5^b mod23 = 19
=> b = 15  (unique for 1 <= b <= 22).
```

The independently audited zero-based authenticated-2016 DH register already identifies source word15 as **WORDS**. This is a cross-source state consequence, not unknown plaintext: the selected p26 word remains ciphertext, and its `[g,B,g]` descriptor is a numerical receiver/state packet.

### Conditional marker-to-terminal word-map payload

The preselected p26 receiver contains one further source coincidence that is strong enough to preserve but not yet strong enough to call solved plaintext. Its first GP0 value is **13**, exactly the p26 terminal mark count and exactly the value negated by the second H packet field:

```
H incoming packet = [26,-13]
selected word      = [13,28,8,27,1].
```

The leading 13 is also a manuscript-unique local checksum for this source class. Across **all canonical words on all p0–p55 pages carrying a terminal large mark**, only p26 offset16 simultaneously satisfies

```
leading GP0 value = terminal mark = 13
and
zero-based word-start offset + leading value = 16 + 13 = 29.
```

So the value proposed for relocation is independently identified as both the page-terminal marker value and the 29-complement of its own zero-based address. This sharply reduces the freedom in treating the leading rune as a header/check value; it still does not, by itself, prove that a solver must rotate that header to the end.

If the physical terminal 13-mark is interpreted literally as telling the solver to move the marker-matched leading value13 to the **terminal** position of this already selected word, the resulting fixed rotation is

```
[28,8,27,1,13].
```

Before using English, the four-rune core left after the matched 13 is moved has two independent state checks:

```
core = [28,8,27,1]
(length, sum, product mod29) = [4,6,16] = [q,a,A*K]

H4(core) = [27,10,6,0] = [-K,K*g,a,F].
```

Thus the proposed rotation does not merely improve language; it exposes the same DH state through elementary descriptors and the already-fixed local H serialization.

Using the independently audited **zero-based** authenticated-2016 word register as the map then gives

```
28 -> THE
 8 -> DEVOTED
27 -> ARE
 1 -> THE
13 -> WAY

THE DEVOTED ARE THE WAY
```

This is a **source-oriented candidate decoded instruction**, not yet established unknown LP2 plaintext. The orientation can now be stated without language fitting: the addressed word contains the value13 exactly once, at its printed start, while the same page physically ends with the 13-dot mark. Preserve the manuscript's ordinary forward rune direction and use the visible terminal13 as the cycle's terminal anchor. That rule has exactly one forward orientation, `[28,8,27,1,13]`, before the signed-word outputs are read. If printed direction is gratuitously reversed, the same terminal-anchor rule instead gives `[1,27,8,28,13]` -> `THE ARE DEVOTED THE WAY`; no source feature asks for that reversal. The remaining evidential gap is transfer: an independently addressed second receiver using the same terminal-marker orientation would upgrade this substantially.

Finite controls keep the evidence bounded:

- There are **318** canonical five-rune words in p0–p55. Charging both directions and all five cyclic starts gives **3,180** presentations. Only **4** presentations from **2** words reach at least 3/4 token-bigram matches against the authenticated 2016 message; two are rotations of this p26 word. The other word is p28 offset207 and produces `SEEKS THE HELLO THE ROAD` / `HELLO THE ROAD SEEKS THE`, not a comparable sentence.
- A generic post-hoc grammar `THE _ ARE THE _` is insufficient: 12 charged presentations satisfy it. However, the local mayfly/frame values `{3,5,8,13}` were fixed independently before the word-map output. Requiring both content slots of that frame to lie in this four-value set leaves **exactly one** of all 3,180 five-rune cyclic/reverse presentations: p26 offset16 rotated once, `THE DEVOTED ARE THE WAY` (`DEVOTED=8`, `WAY=13`). This is a bounded cross-lock, not a substitute for an opcode.
- Across **all** canonical five-rune words on pages with a terminal large mark, requiring the word's leading GP0 value to equal that page's terminal mark leaves exactly **one** candidate: p26 offset16. Broadening to all word lengths yields 11 marker-leading candidates, including a p39 three-rune `SEEKS THE WAY` token sequence after the same rotation. Therefore the independent p26 address and five-rune receiver type are essential; marker rotation alone is not a global decoder.

Preserve this phrase as a high-priority **conditional payload**. Promote it only if an independent source clue fixes the marker-to-terminal rotation or if the same exact operation predicts a second typed receiver without language tuning.

### Candidate instruction predicts the pre-existing p8 state receiver

The candidate sentence also makes a concrete navigation prediction under the same signed-2016 grammar rather than requiring a new cipher. In the independently audited zero-based source register,

```
DEVOTED = 8 = A.
```

Reading **THE DEVOTED ARE THE WAY** literally as a map/direction instruction therefore selects project **p8**. This is not an arbitrary recipient discovered after opening p8: p8's source-side state structure was already documented before this Agent3 route.

The held-out p8 facts are unusually specific:

```
red heading word lengths = [4,8] = [q,A]

H4(first red word) = [-g,-q,-g,q]
H8(second red word) reconstructs
  (p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)

immediately following black word:
(length,sum,product) = [3,23,2] = [e,p,K].
```

The complete p8 red-H/DH grammar is manuscript-selective: the earlier p8 census found exactly one qualifying source object, p8 start0, and the adjacent three-rune `[e,p,K]` descriptor is independently unique among complete three-rune words. Thus the newly decoded candidate does not merely point to another page containing familiar numbers; it points to a pre-existing, highly constrained DH-state receiver whose primary public value is exactly the source number of **DEVOTED**.

This is **chronological cross-validation, not a blind holdout**: the repository knew p8's state packet before the p26 sentence was recovered here, while this invocation also knew the broader repository frontier before deriving the phrase. Preserve the chronology. The value is causal compression of the intended-route hypothesis:

```
mayfly count/terminal geometry
 -> H=[p26,offset16]
 -> unique p26 DH word
 -> terminal-marker cyclic orientation
 -> THE DEVOTED ARE THE WAY
 -> DEVOTED=8
 -> p8 complete DH-state header.
```

A second independently decoded instruction or a transfer of the terminal-marker orientation remains the cleanest upgrade from strong candidate to established plaintext.

Only after that source-only lock is established, the authenticated-2016 register gives an optional semantic echo: zero-based indices `[26,16]` read **NUMBERS ARE**. The exact numeric output `[26,16]` is unique over all **324** contiguous-triple vertex/input-order presentations. This phrase remains secondary evidence: zero-based word indexing is not fully authenticated, `ARE` is duplicated, and 33/324 charged presentations map to some token bigram occurring somewhere in the signed message. Under the single canonical final-vertex presentation there are three such bigram-token hits across 54 triples: p24 **NUMBERS ARE**, p35 **EMPTY EPIPHANY**, and p38 **THE ROAD**.

**Decision:** the mayfly triangle now has a source-fixed sign/order, a source-typed local H consumer, a concrete body receiver, and a source-fixed **forward cyclic orientation** for that receiver. Printed page order and the terminal p26 mark select the final vertex, lock `[+e,-g,-A]`, validate `H=[page,-mark]`, land at p26 offset16, and then place the receiver's unique marker-matched 13 at the physical terminal while preserving printed direction. The resulting zero-based signed-word readout is **THE DEVOTED ARE THE WAY**. Its four-rune core independently carries compact DH state, and the local `{3,5,8,13}` familywise control leaves this presentation as a singleton. This is the strongest candidate unknown-page instruction produced by this route, but independent transfer to a second source-addressed receiver is still required before promoting it to established plaintext. Do not regain freedom by switching triangle vertex, sign, H input order, coordinate origin, traversal direction, or a different linear transform.

Reproduction: `sims/lp2_p24_26_mayfly_terminal_curvature_sft.cjs`.

## Fibonacci frame gives a direct human-readable p28 pointer

The same source facts admit a simpler navigation reading that does not name any DH variable.

The three mayfly-page count differences are **3,5,8**. The illustrated chapter itself supplies the next value **13** twice, through the red 13-dot mark after the p23 heading and the red 13-dot mark at the p26 end. Therefore the visible numeric sequence is:

```
3, 5, 8, 13
```

four consecutive Fibonacci numbers. Their sum is:

```
3 + 5 + 8 + 13 = 29.
```

That has two immediate manuscript meanings: GP has 29 runes, and the **29th LP2 page is physical p28**, the page independently carrying the DH construction.

A broader contiguous-page control prevents treating any small Fibonacci-looking differences as equivalent. Across all 54 contiguous three-page windows in p0–p55, only two have pairwise-difference sets equal to any three consecutive Fibonacci numbers:

- p8–10 -> {5,8,13}, whose next Fibonacci value would be **21**;
- p24–26 -> {3,5,8}, whose next value is **13**.

The source punctuation inventory contains large-dot counts **10,13,23** and no 21-dot mark. The p24–26 window is therefore the one Fibonacci triple whose next term is actually supplied by its own local visible frame.

This remains post-discovery structural evidence, not a calibrated chance probability. But it supplies a much more human-puzzle-like route than an arbitrary algebraic state fit:

```
mayfly page lengths -> 3,5,8
chapter frame -> 13
sum -> 29th page -> p28
p28 -> literal DH packet
```

The H/DH reconstruction below then explains why the same 3,5,8 values are cryptographically meaningful after arriving at p28.

## Pre-existing local H gives a shorter reconstruction

The same state can be reconstructed with substantially less algebraic freedom by reusing the pre-existing fixed outer-pair operation

`H(x,y) = (x-y, x+y) mod29`

that was defined and charged in earlier repository work before this mayfly result. Its dedicated transfer gate classifies H as a **local structural transform** useful on p28/p0 packet constructions while rejecting manuscript-wide decoder semantics; this result therefore reuses a frozen local operator rather than claiming a solved-cipher primitive.

Start only with the mayfly triangle `{3,5,8}`, the source-fixed generator candidate `g=5`, the chapter-local `13`, and `p=23` from the unique p57 terminal mark.

Charge which remaining triangle value is the second H input:

- `H(5,3) = (2,8)`: the sum output **8** closes exactly onto the other observed triangle edge.
- `H(5,8) = (26,13)`: the sum output does not close onto the other observed edge3.

Thus the triangle plus H itself selects:

```
e=3
K=2
A=8
```

without importing those labels from p28.

Apply the same fixed H operation to the repeated local frame value and the newly obtained K:

```
H(13,2) = (11,15).
```

Charge the two output labels as `(B-A,b)` versus the reverse, derive `B=A+(B-A) mod23`, and require ordinary DH consistency. The first ordering gives:

```
B-A=11
b=15
B=8+11=19
```

while the reverse ordering gives `B=0 mod23` and cannot be a valid nonzero DH public value. Finally, `5^a=8 mod23` has the unique exponent `a=6` over `1..22`, and both shared-secret equations return K=2.

So the source-motivated H route reconstructs the complete tuple:

```
(p,e,g,a,b,A,B,K) = (23,3,5,6,15,8,19,2)
```

with only one small label charge at the second H output, resolved by the standard DH equations. The broader sign/relation exhaustion below is retained as an adversarial control and reaches the same sole historical state once g=5 is source-fixed.

This is the strongest version of the new result because it replaces the ad hoc-looking formulas `K=g-e` and `b-K=13` with a **previously frozen local packet operation**. It does not change the earlier negative conclusion that H is not a general LP2 plaintext decoder. See `im-results/lp2-h-outer-pair-transfer-gate.md`.

## Independent state packets select p28 line6 without literal DH

Once the complete state above is reconstructed from p23–26 plus p57, it makes a concrete prediction back onto the untouched line structure.

Scan all **594** physical rune lines of unknown p0–p55. Split only at the printed hyphen/period fragment boundaries and apply the same fixed outer-`H` operation to each fragment's endpoint pair. Select a line only if its fragment outputs include both:

```
[b,K] = [15,2]
[A,B] = [8,19]
```

Do **not** require the page number, line number, fragment count, literal letters `DH`, or the modulus value23 during this selection.

Exactly **one** physical line survives: **p28 line6**. Its complete fragment-H packet is:

```
[15,2] [14,4] [12,12] [23,12] [8,19]
```

so the independently recovered state not only points to p28 but lands on the exact source line that visibly begins `DH`; the same line then exposes `p=23` in its fourth fragment packet as a further held value.

Chronologically this is retrospective validation because p28 line6 was already known when the mayfly reconstruction was noticed. It is nevertheless a strict cross-object holdout: the selector uses only state values recovered outside p28 and a previously fixed operation, and the full 594-line scan has one match.

## Independent full-state reconstruction without reading p28

The count triangle can now be used as a finite **independent state-recovery gate** when combined only with source objects outside p28.

The source inputs are:

- **p=23** from the solved p57 terminal 23-dot mark, which is the unique 23-dot large-punctuation object in LP2.
- **13** from the mayfly chapter's own red punctuation frame: one 13-dot mark immediately after the p23 red heading and another at the p26 chapter end. P22 immediately before the chapter also terminates in 13 dots. Thirteen-dot punctuation is common globally, so only this repeated local framing is used.
- **g=5** from the chapter's redundant source evidence: p23 has five black dots, the independently registered mayfly is Figure4 specimen5, and the exact-copy p24↔p26 art pair has rune-count difference5.
- The remaining two count-triangle values are **{3,8}**.

Charge the plausible state assignment instead of assuming it:

1. assign {3,8} to `(e,A)` in both orders;
2. define `K = +(g-e)` or `K = -(g-e)` modulo23;
3. interpret the local 13 as either `b-K=13` or `b+K=13`;
4. enumerate every nonzero private exponent `a=1..22`;
5. require the ordinary DH equations
   `g^a=A`, `B=g^b`, and `A^b=B^a=K (mod23)`.

Exactly **one** candidate survives the complete charged family:

```
p = 23
e = 3
g = 5
a = 6
b = 15
A = 8
B = 19
K = 2

K = g-e
b-K = 13
```

This is exactly the independently reconstructed p28 line6 DH state, but **no p28 rune, fragment, line number or plaintext is used by this reconstruction**.

The source-fixed `g=5` discriminator matters. If the three values 3,5,8 are allowed to permute freely over `e,g,A` while also charging both K signs and both 13 relations, two rival g=3 solutions survive in addition to the historical tuple. The external specimen5 / five-dot / exact-copy-edge evidence is therefore doing real selection work rather than merely decorating a prechosen tuple.

The relations `e=g-K` and `b-K=13` were recognized after the DH state was already known elsewhere. This is therefore a **post-discovery independent reconstruction**, not a claim that a blind 2014 solver was already instructed to write those equations. Its evidential value is narrower and strong: physically separate original-source registers—p23–26 art/counts and repeated 13-dot frame, p57 terminal punctuation, and p28 DH text—encode one internally consistent state. P22's preceding terminal13 supplies an additional outer boundary check.

## Strongest rival

Page rune counts depend on typography and wrapping, so small differences among neighboring illustrated pages can occur accidentally. The three values 3,5,8 are also visually attractive Fibonacci numbers. The p28 variable `e=3` is a derived state value (`g-K`), while g=5 and A=8 are primary DH values. The relation was recognized after both the page lengths and DH state were known.

Therefore this is **not** a calibrated chance probability and not yet proof that Cicada encoded the DH state in page lengths.

What makes it worth preserving is the concentration of independent source constraints: the exact same-art three-page family, exact-copy p24/p26 pair, external specimen5 label, p23 five-dot count, independently source-derived DH23 state and uniqueness among contiguous page triples all agree without fitting ciphertext plaintext.

## Research consequence

Treat the p23–26 illustrated chapter plus the solved p57 terminal mark as a **second original-manuscript reconstruction of the complete p28 DH state candidate**. The triangle itself serializes [e,g,A]; the charged source frame uniquely recovers the remaining a,b,B,K once g=5 is source-fixed. This strengthens the hypothesis that the p28 DH tuple is a real organizing register rather than an isolated arithmetic reconstruction.

Do not infer a new additive/multiplicative key from 3,5,8. Natural page order plus the terminal-imbalance closure now fixes the triangle's sign/order as `[+e,-g,-A]`; the remaining missing input is an independently selected **consumer/receiver** for that oriented packet. Test that fixed packet prospectively rather than reopening vertex, sign, or H-order choices.

## Reproduction

- Count-triangle census: `sims/lp2_p24_26_mayfly_dh23_count_triangle_sft.cjs`.\n- Ordered terminal-imbalance/orientation gate: `sims/lp2_p24_26_mayfly_terminal_curvature_sft.cjs`.
- Original mayfly source and pixel identity: `im-results/lp2-p23-26-original-art-source-gate.md`.
- Independent p28 DH reconstruction: `im-results/lp2-p28-dh-line6-source-reconstruction.md`.
