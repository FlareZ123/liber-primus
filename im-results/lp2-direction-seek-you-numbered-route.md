# Canonical source-number route: YOU is the sole missing coordinate, while SEEK/AND changes EMPTY to ROAD

**Agent6 correction, 19 November 2026. Classification: source-selected structural route evidence. The earlier p−1 YOU-wrap claim is retracted.**

The source-number diagonal remains real under the repository's canonical printed-word contract, but the earlier page-local parser counted fragments created by physical page boundaries as separate words. Once the 32 words that cross physical page boundaries are kept intact, several local ordinals change. The strongest surviving facts are:

- authenticated source ordinals still give **42/43** direct page/word coordinates;
- **33 YOU** is still the sole missing direct coordinate;
- DIRECTION30 still selects the same exact p29 packet and recovers group order22;
- p32 has **21** complete page-local words, so its length no longer equals group order22;
- the former modulo22 YOU recovery is therefore unsupported;
- corrected SEEK31 and AND32 form a unique lexical center transition
  `THE EMPTY THE -> THE ROAD THE` under the independently fixed zero-based source indexing.

This correction preserves the source-selected route where it survives and removes the conclusions that depended on page-fragment numbering.


## Upstream p28 mechanically selects the governing clause

A later p28 result strengthens the source-selection premise of this corrected route. The held-out `READ OUT THE` ends at offset141. The four complete p28 words immediately following it, offsets142..160, have GP0 residues `[23,19,22,27]` and GP lengths `[4,5,4,6]`. The already fixed forward-H difference half gives source indices `[25,26]` from GP0 and `[27,1]` from lengths. Under the established zero-based authenticated-source register these read:

~~~
THEIR NUMBERS ARE THE
~~~

Across 2,699 canonical page-local four-word manuscript windows, this is the sole fixed difference/difference, GP-first readout producing any contiguous four-word phrase from the authenticated 43-word source. The source contains the phrase once and continues it with `DIRECTION`.

P28 therefore selects the governing instruction before DIRECTION30 is consumed. This strengthens the surviving numbered route below. It does not restore the retired modulo-22 YOU wrap or the old boundary-fragment SEEK packet.

See `im-results/lp2-p28-numbers-direction-readout.md` and `sims/lp2_p28_numbers_direction_readout_sft.cjs`.

## Independent p33-p35 plaintext-candidate convergence

A later layout/receiver result now gives the route's post-YOU suffix a second, materially independent realization.

The numbered diagonal already resumes after the single YOU wrap at:

```text
WILL34  -> project p33
BE35    -> project p34
FOUND36 -> project p35.
```

Independent local research now gives strong plaintext candidates on those same three consecutive project pages:

```text
p33 -> WILL
p34 -> BE
p35 -> FOUND.
```

The page selection is additionally reproduced from p33 itself. Its hidden `THEIR RISE` two-body layout has rune counts81 and115, so literal body rise `115-81=34` selects p34 / signed BE before p34 ciphertext is consumed. The lower p33 RISE title uses cardinals `[3,5]`, whose already established literal rise `5-3=2` selects p35 / signed FOUND. P33 itself is independently selected by the DH/p50 state and carries the existing WILL inverse.

Thus the numbered route and the p33 layout arrive at the same physical/source suffix through different authored objects:

```text
source:           WILL -> BE -> FOUND
numbered diagonal p33  -> p34 -> p35
p33 RISE layout   p33  -> p34 and p35
local inverses    WILL -> BE  -> FOUND
```

This is phrase-level convergence of strong local candidates, not final authenticated plaintext. It materially strengthens the interpretation that the authenticated word numbers are an intended guide through unknown LP2. See `lp2-p33-p35-will-be-found-suffix.md`.

## Canonical word contract

The manuscript contains 2,896 printed words, including 32 words that cross physical page boundaries. For page-local ordinal tests, keep each crossing word intact and exclude it from either page's complete-word list.

That leaves:

```text
2,864 complete page-local words
32 crossing words
2,896 total printed words
```

The relevant complete-word census is:

```text
length2: 448
length3: 716
length5: 311
```

The older per-page parser restarted at every physical page and therefore promoted boundary fragments into local words. That is the source of the obsolete 731/320 counts and several shifted ordinals.

## The direct numbered diagonal still has one failure

For authenticated one-based source ordinal `n`, keep the existing route definition:

```text
physical LP2 page = n
project page       = n-1
canonical local word = n
```

Charge all 43 authenticated source ordinals using complete page-local canonical words.

Exactly one direct coordinate is absent:

```text
33 YOU
 -> physical page33
 -> project p32
 -> canonical word33
 -> absent
```

P32 has exactly **21** complete page-local words.

Every other source ordinal1..43 has the requested complete word on its numbered page. The unique failure at literal YOU therefore survives the parser correction.

## DIRECTION30 survives unchanged

Source word30 DIRECTION selects physical page30/project p29 and canonical word30:

```text
p29 word30
start108
[11,26,11,18]
```

The fixed outside-in H shell is:

```text
H(11,18) = [22,0]
H(26,11) = [15,8]

=> [22,0,15,8]
 = [p-1,F,b,A].
```

This still recovers:

```text
group order = 22
p = 23
b = 15
A = 8
K = A^b mod23 = 2.
```

The DIRECTION packet is unchanged because no crossing word precedes its local ordinal on p29.

## The earlier YOU modulo22 recovery fails

The old route relied on the equality:

```text
p32 complete words = p-1 = 22.
```

Canonical cross-page parsing gives:

```text
p32 complete words = 21
group order         = 22.
```

The two natural cyclic reductions now disagree:

```text
33 mod group-order22 -> one-based word11
33 mod page-length21 -> one-based word12.
```

The five-rune packet previously cited as wrapped YOU remains at the same physical offsets:

```text
p32 offset59
[2,7,14,27,2].
```

Canonical numbering places it at **word10**, not word11. Group-order reduction therefore no longer selects it.

The old statement that DIRECTION forces a unique p−1 wrap which finds YOU is retracted. P32 still has no justified direct YOU receiver. A later Agent30 result now supplies a different source-visible route that **bypasses p32** and reaches a p33 YOU receiver from the preceding AND object; that route is described below and does not revive the invalid wrap.

## Corrected SEEK31 and AND32

The canonical parser changes SEEK31 because a crossing word earlier on p30 shifts its local ordinal.

SEEK31 now selects:

```text
project p30
word31
start130
[28,4,12].
```

AND32 remains:

```text
project p31
word32
start126
[12,23,1]
= [K*a,p,1].
```

The raw SEEK packet occurs three times among complete canonical words:

```text
p8  word15 start60
p26 word18 start79
p30 word31 start130
```

AND's exact packet remains manuscript-unique:

```text
p31 word32 start126.
```

The earlier claim that SEEK was the unique raw packet `[22,12,22]` is retired.

## SEEK AND changes EMPTY to ROAD

The authenticated DH-role audit independently fixes zero-based source positions as meaningful numeric values. Reuse that convention literally as a number-to-source-word readout.

For SEEK31:

```text
[28,4,12]
source[28] = THE
source[4]  = EMPTY
source[12] = THE

=> THE EMPTY THE
```

For the immediately following AND32:

```text
[12,23,1]
source[12] = THE
source[23] = ROAD
source[1]  = THE

=> THE ROAD THE
```

The two objects therefore preserve the same lexical wrapper while changing only the center:

```text
THE EMPTY THE
THE ROAD  THE
    EMPTY -> ROAD
```

This is a finite-family result. Charge every consecutive pair on the complete 43-word numbered diagonal, require both selected objects to have exactly three runes, require each lexicalized object to have equal outer words, require the outer word to remain unchanged across the pair, and require the center to change.

Under zero-based source indexing there is exactly one hit:

```text
SEEK31 -> AND32
THE EMPTY THE -> THE ROAD THE.
```

Under one-based source indexing there are zero hits.

The only individual zero-based lexicalized three-rune diagonal objects with equal outer words are SEEK31 and AND32 themselves. Their adjacency was fixed by the authenticated source before the lexical readout was inspected.

This is stronger than the retracted `THE THE THE -> THE ROAD THE` claim because it survives the canonical parser and isolates the changed center without selecting one of two adjacent bigrams after the fact.

## A motivated ROAD consumer

The changed center is authenticated source word ROAD at zero-based index23:

```text
source[23] = ROAD.
```

The source instruction says that their numbers are the direction. Reading the newly exposed ROAD through its already audited number therefore points naturally to project **p23**.

That landing has an independent source-constrained structure already present in the repository: p23's five-dot/cardinal layout yields hidden **THE ORIGINAL** and a unique DH-state handoff to p33. Because the p23 result predates this corrected SEEK/AND center transition, treat the connection as retrospective convergence. It is nevertheless a causal consumer with no new numeric choice:

```text
SEEK AND
 -> EMPTY changes to ROAD
 -> ROAD number = 23
 -> p23
 -> independent THE ORIGINAL / p33 handoff.
```

This route deserves prospective testing at the next untouched consumer rather than further tuning of p32 wraps.

## Replacement for the missing YOU coordinate

The canonical correction leaves literal YOU as the sole absent direct page/word coordinate. Agent30 later found a separate continuation from the immediately preceding authenticated corridor, without choosing any p32 word.

The source pair is zero-based `30 SEEK / 31 AND / 32 YOU / 33 WILL`. Charge the source GP0 values. `SEEK` and `AND` are the **only adjacent equal-GP0 pair** in all 42 adjacent source pairs, with `GP0(SEEK)=GP0(AND)=56`. That source-only equality selects solved p56 before the p31 inverse is evaluated.

The numbered diagonal already fixes AND32 on project p31 canonical word32 at start126, ciphertext `[12,23,1]`. Original p31 layout supplies a uniquely charged helper packet: the top printed line has `5` chunks / `23` runes; line6 immediately below the AND receiver line has `5` chunks / `21` runes. Lower-to-upper serialization gives `[5,21,23]=[g,-A,p]`. Solved p56's authenticated prime-totient serializer maps it to `[10,14,24]=[-B,-b,-g]`; `H3^-1` gives key `[17,14,7]`, and subtraction recovers exact `AND=[24,9,23]`.

The original-layout construction was charged across all 12 p31 line pairs with equal chunk count, both count orders, both signs and all seven authenticated three-rune targets: **336 configurations, one hit**.

The same winning line pair has lower-to-upper rune rise `23-21=2=K`. A `RISE=+2` page operation was independently established before this p31 result on p33→p35 and p40→p42, and is the preferred p23 `THE ONE RISE` operation p23→p25. Reuse it unchanged: `p31+K=p33`.

Freeze the p31 key `[17,14,7]` across all 716 complete canonical three-rune unknown-book words, the seven distinct authenticated three-rune targets and both signs: **10,024 configurations**. Exactly two hits survive: p31 word32 -> AND and p33 word29 start116 -> YOU. The p33 hit is therefore the sole cross-page transfer of the unchanged key.

This supplies a concrete replacement for the retired p32 wrap: `SEEK AND -> shared GP0 56 -> solved p56 / p31 AND helper -> RISE +2 -> p33 -> fixed key -> YOU`.

P33 then continues internally under the independently recovered `THEIR RISE`: the YOU receiver is canonical word29 and the existing WILL receiver is word35, so `35-29=6=a`, giving `YOU -> WILL`. Independent p34/p35 local results already provide `BE -> FOUND`.

This route does not recover p32 YOU plaintext and does not repair the invalid modulo-22 claim. It resolves the semantic missing-coordinate problem by a different authored path from AND into p33. The equal-chunk merge/order and this p31 application were recognized retrospectively, so preserve the stated family charges and do not generalize the key or page rise without a source selector.

See `im-results/lp2-p31-and-p33-you-rise-will.md` and `sims/lp2_p31_and_p33_you_rise_will_sft.cjs`.

## Direct numbering resumes after YOU

The direct coordinate rule still resumes immediately:

```text
34 WILL  -> p33 word34 start130 [12,24]
35 BE    -> p34 word35 start148 [25,14,18,9,7]
36 FOUND -> p35 word36 start164 [14,5].
```

The old numbered-route BE state expression came from a boundary-shifted word and is retired. This does not invalidate the separate p34 BE plaintext receiver at offsets4..5, which is selected by the THEIR RISE family rather than by numbered-route word35.

The later source ordinal38 LUCK still selects p37 word38 at start146, so the independent p37 LUCK convergence remains available as a downstream coordinate check.

## Evidence boundary

Preserve:

```text
READ OUT THE candidate
 -> authenticated DIRECTION30
 -> numbered p29 word30
 -> exact [p-1,F,b,A] packet

42/43 direct numbered coordinates
 -> only YOU33 is absent

SEEK31 / AND32
 -> THE EMPTY THE
 -> THE ROAD THE
 -> unique fixed-family center transition EMPTY -> ROAD

ROAD source number23
 -> motivated project p23 consumer
 -> independent p23 THE ORIGINAL / p33 state handoff.
```

Retire:

```text
p32 page length = 22
YOU33 forced modulo22 -> word11
old p32 offset59 packet as word11
SEEK31 = [22,12,22]
SEEK raw-packet uniqueness
THE THE THE -> THE ROAD THE
numbered-route BE=[p,a+b,-1,-g].
```

The route still does not constitute unknown-page plaintext recovery by itself. Its value is a source-selected navigation grammar with one striking missing coordinate and one unique parser-correct lexical transition.

## Reproduction

Run:

```text
node sims/lp2_direction_seek_you_numbered_route_sft.cjs
```

The SFT uses the cross-page canonical parser, checks all 43 numbered coordinates, verifies the unchanged DIRECTION packet, rejects the former YOU wrap, exhausts the complete-word length and exact-packet controls, and charges the zero-based versus one-based SEEK/AND lexical-transition family.
