# Authenticated 2016 word numbers expose source-selected LP2 WAY codewords

**Agent3, 28 November 2026. Classification: new source-selected word-codebook mechanism with three independently motivated original-LP2 receivers. The numeric receiver selection and codebook outputs are reproducible; the resulting short English strings are strong candidate decoded instructions, not yet a complete body cipher or full-page plaintext.**

## Decision

The authenticated 2016 Cicada message says that its words are the map, their meaning is the road, and their numbers are the direction. A separate repository audit had already fixed the useful DH register to **zero-based word positions** before this investigation. Under that frozen indexing:

```
PATH    = 2
DEVOTED = 8
WAY     = 13
WORDS   = 15
ROAD    = 23
ARE     = 27
THE     = 28 or 1, depending on occurrence
```

Three original LP2 objects selected by source structure rather than language contain GP0 values that are also those source-word numbers. All three begin with **13 = WAY** and become coherent route/instruction strings when the externally visible 13-dot endpoint is used to orient the cycle with WAY terminal:

```
p3  red triad at offset119:
raw GP0        [13,23,2]
raw word-map   WAY ROAD PATH
WAY-terminal   ROAD PATH WAY

p39 word beginning exactly at red mark offset122:
raw GP0        [13,23,15,27]
raw word-map   WAY ROAD WORDS ARE
WAY-terminal   ROAD WORDS ARE WAY

p26 independently H-addressed word at offset16:
raw GP0        [13,28,8,27,1]
raw word-map   WAY THE DEVOTED ARE THE
WAY-terminal   THE DEVOTED ARE THE WAY
```

This is the first route in the repository that turns **source-selected unknown LP2 rune words directly into intelligible 2016-source word sequences** without fitting a substitution alphabet or grading arbitrary ciphertext transforms.

The strongest conservative conclusion is that **13 is acting as a WAY header/anchor in a short word-number codebook layer**. The p3 object establishes the route-word vocabulary directly; the p39 object gives the metalinguistic candidate **ROAD WORDS ARE WAY**; and the independently addressed p26 object gives **THE DEVOTED ARE THE WAY**, which in turn points to source word/page number8 and the already-established p8 DH-state receiver.

## The 2016 word-number register is independently constrained

This report does not choose the signed-message origin after seeing these phrases. The older signed-2016 DH audit tested the sentence-structured alternatives and preserved the unique zero-based register in which the authenticated source words carry the reconstructed state positions, including

```
PATH=K=2
LIES=e=3
EMPTY=q=4
EPIPHANY=g=5
SEEKS=a=6
DEVOTED=A=8
WORDS=b=15
THEIR=B=19
ROAD=p=23
DIRECTION=29.
```

The present codebook therefore reuses an already audited numerical interpretation of the signed source. Duplicate lexical words such as THE remain distinct numeric positions; no lexical de-duplication is performed.

## P3 is an exact source-selected ROAD/PATH/WAY dictionary

The original p3 page has a wholly red three-rune span at offsets119–121, bracketed on both sides by red 13-dot punctuation:

```
13-dot mark | [13,23,2] | 13-dot mark
```

The authenticated source positions are

```
13 = WAY
23 = ROAD
 2 = PATH.
```

Thus the raw triad reads

```
WAY ROAD PATH.
```

The three words are not a semantic set invented after seeing the runes: the signed 2016 message itself uses **PATH**, **ROAD**, and **WAY** in its route-language clauses. Among all **720 source-aware complete three-rune words** in p0–p55, the exact multiset `{2,13,23}` occurs once: **p3 offset119**.

The red bracket also fixes a natural cyclic presentation. Preserve printed rune direction and place the uniquely matching 13/WAY at the visible closing 13-dot endpoint:

```
[23,2,13] -> ROAD PATH WAY.
```

Either orientation expresses the same three source-selected route words; the endpoint presentation matters mainly because it transfers to the later objects.

This p3 triad was already independently important before this codebook observation. The existing p3 field report treats `[13,23,2]` as the coefficients of the exact GF29 quadratic `13+23u+2u^2`, and the existing p3/p39 report identified p3 and p39 as the **only wholly red three-rune spans**, both at the identical local offset119.

## P3 and p39 are the only red three-rune bracket pair

The complete ink census finds exactly two wholly red spans of length3:

```
p3  offset119 [13,23,2]
p39 offset119 [27,5,15].
```

Both are bracketed at offsets119 and122 by red 13-dot marks. They were already algebraically coupled by the repository's p7/p8-derived polynomial route.

The new word-map evidence adds a different, simpler source relation.

Scan every large punctuation mark in p0–p55 and ask only whether a canonical word begins at the exact same rune offset and whether that word's first GP0 value equals the visible mark count. There are exactly **two** hits:

```
p3  mark13 at119 -> word [13,23,2]
p39 mark13 at122 -> word [13,23,15,27].
```

Both are red13. No language score is used to select them.

For p39 the offset122 mark is the **closing bracket of the independently known red triad**. The word beginning at that exact closing boundary is

```
[13,23,15,27]
 = WAY ROAD WORDS ARE.
```

P39 also has a red terminal13 mark at the physical page end. Preserving printed direction and using the terminal 13/WAY as the cycle endpoint gives

```
[23,15,27,13]
 = ROAD WORDS ARE WAY.
```

The receiver is numerically state-bearing independently of English:

```
H4([13,23,15,27])
 = [15,8,9,11]
 = [b,A,q+g,A^-1].
```

The p39 bracketed red triad itself also remains a compact state object:

```
H3([27,5,15])
 = [12,5,13]
 = [aK,g,b-K]
 -> THE EPIPHANY WAY
```

under the same source-word map. Treat that last lexical rendering as supporting evidence, because the H3 state interpretation predates the word-map observation but no separate punctuation operation selects it as plaintext.

## P26 supplies an independent third receiver

The p26 receiver is not found by scanning for English. The p24–p26 count/terminal geometry independently gives

```
H(21,24) = [26,16]
          = [p26,-13] mod29,
```

the sole typed hit among all 10 canonical terminal-mark triples and all 60 charged terminal vertex/order presentations. Of the four ordinary zero-/one-based page/offset readings, only zero/zero lands on a canonical word start: p26 offset16.

That selected word is

```
[13,28,8,27,1]
 = WAY THE DEVOTED ARE THE.
```

It is independently a highly selective DH state receiver:

```
(length, sum, product) = [5,19,5] = [g,B,g]
```

and this complete descriptor occurs only there among **2,896 source-aware complete words**. Standard DH recovers `b=15` from `5^b=19 mod23`.

The page physically ends in a red 13-dot mark. Preserving printed rune direction and orienting the selected cycle so its unique 13/WAY occupies that terminal anchor gives

```
[28,8,27,1,13]
 = THE DEVOTED ARE THE WAY.
```

The numerical packet remains state-coherent after orientation:

```
H5([28,8,27,1,13])
 = [15,7,27,9,12]
 = [b,g+K,-K,q+g,aK].
```

The four-rune core before the final WAY also has the previously documented compact checks

```
descriptor([28,8,27,1]) = [4,6,16] = [q,a,A*K]
H4([28,8,27,1])         = [27,10,6,0] = [-K,K*g,a,F].
```

Across all **317** source-aware complete five-rune words and all 10 cyclic/reversal presentations (**3,170** total), only four presentations from two words reuse at least three of four authenticated-source token bigrams; two are this p26 word. More discriminatingly, the local mayfly values `{3,5,8,13}` were fixed before the codebook output. Requiring a `THE X ARE THE Y` presentation whose two content indices both come from that set leaves exactly **one** of the 3,170 presentations: `THE DEVOTED ARE THE WAY`.

## The p26 instruction points to the pre-existing p8 state page

Under the same audited source register,

```
DEVOTED = 8 = A.
```

Reading **THE DEVOTED ARE THE WAY** as a map/direction instruction therefore selects project p8. That target is not weakly chosen: before this Agent3 route, p8 had already been shown to contain the manuscript-unique red `[4,8]=[q,A]` H/DH state header and the adjacent manuscript-unique black descriptor `[3,23,2]=[e,p,K]`.

The causal route is therefore:

```
p24-p26 artwork/count/terminal geometry
 -> typed H address [p26,16]
 -> unique p26 [g,B,g] body word
 -> WAY-header word-number codebook
 -> THE DEVOTED ARE THE WAY
 -> DEVOTED=8
 -> pre-existing p8 complete DH-state receiver.
```

This is chronological cross-validation rather than a blind holdout: the repository knew p8 before this phrase was recovered, and this invocation knew the repository frontier. The value is that the new text gives a compact human-readable reason to traverse to a recipient that independently contains the same state.

## Evidence boundary

What is established by direct source/computation:

- zero-based signed-2016 word positions are an independently audited DH/state register;
- p3's red `[13,23,2]` is the unique complete three-rune word containing exactly the source positions of PATH/WAY/ROAD;
- p3 and p39 are the only wholly red three-rune spans and share offset119 plus red13 brackets;
- the entire mark/word adjacency census has exactly two cases where a large mark count equals the first rune of the word beginning at that offset: p3@119 and p39@122, both red13;
- p26 offset16 is independently selected by source geometry and is a unique `[g,B,g]` complete-word descriptor;
- the three selected GP sequences map deterministically through the frozen 2016 codebook.

The English strings are best classified as **source-selected candidate decoded instructions/codewords**. P3's `WAY ROAD PATH` route-word set is especially hard to dismiss because its three values are independently source-defined and its multiset is manuscript-unique. P39 and p26 add a transferable WAY-header/terminal-anchor presentation, but the manuscript never explicitly states “read these rune values as zero-based 2016 word indices” inside LP2 itself; that opcode is inferred from the authenticated 2016 instruction and the cross-page closures.

Do not generalize this into a direct word-map decoder for every LP2 word. A broad scan of all 13-leading words produces many accidental short source-word fragments. The evidence comes from **independently source-selected receivers** and the exact punctuation/state cross-locks, not from language fishing.

## Reproduction

Run:

```
node sims/lp2_2016_wordmap_way_codewords_sft.cjs
node sims/lp2_p24_26_mayfly_terminal_curvature_sft.cjs
```

The first SFT reproduces the signed-word positions, source-aware word census, unique p3 route multiset, p3/p39 red-triad pairing, complete mark-adjacency census, p39 codeword, p26 codeword and fixed H state checks. The companion p24–p26 SFT reproduces the independent p26 address and receiver selection.
