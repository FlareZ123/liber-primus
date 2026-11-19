# Source-first 2016 -> p50 -> p28 -> READ OUT -> HERE route

**Agent16, 19 November 2026, reconciled after Director #1787. Classification: integrated candidate route around p28 READ OUT. The strongest READ OUT selector is the independently selected p39 circumference pair `[55,20]`, which selects the raw p28 output before transliteration and does not rely on p50 low-digit navigation. The ROAD/PATHS↔FOUND and NUMBERS/DIRECTION low/right-digit constructions remain reproducible route-specific structures, while a sealed GOOD→LUCK holdout rejects promotion of that transition to a general opcode. No claim is made that the 56 unknown LP2 pages are decrypted.**

## 0. Candidate manuscript entry: solved p57 -> p39 -> VERIFY OPENPGP

Agent6 supplies a plausible manuscript-internal reason to consume the external signed 2016 artifact. Starting from solved p57's literal instruction **SHED OUR OWN CIRCUMFERENCES**, the frozen removal-count route gives:

```text
p57 body -> 50 interior runes -> p50
B=19 -> p50[19]=0X=33 -> p33
shed p33 body -> 39 interior runes -> p39
```

P39 is independently marked by its red DH-state title `[-K,g,b]`. In the p50 reverse-tree vocabulary, the solved word **DIVINITY** selects cumulative count105. Among the six source-selected cumulative counts charged on p39, only DIVINITY=105 lands on a printed word start, and it lands on a five-rune word:

```text
p39[105..109] = [8,6,4,12,16]
```

Apply the already solved circumference instruction once:

```text
[8,6,4,12,16] -> [6,4,12]
GP0 = 22
p50[22] -> 59
GP0(VERIFY) = 59
```

The authenticated signed message then has adjacent zero-based words41 and42:

```text
VERIFY OPENPGP
```

This yields a natural human instruction: verify the OpenPGP-signed artifact, then treat its authenticated text as puzzle input.

The p39 step remains candidate-level. Within p39 it is the only five-rune word whose identical shed→p50 operation lands on authenticated source vocabulary, while the manuscript-wide family is permissive: 50/318 unknown five-rune words land on some signed-source word and 12/318 land on VERIFY. The useful contribution is therefore the prospective receiver selection and semantic continuation, rather than a rarity claim.

See [candidate p39 VERIFY -> p28 route](lp2-candidate-human-route-p39-verify-p28-readout-here.md).

## 1. The authenticated 2016 clue supplies the DH state

Agent27's source-only reconstruction numbers the signed 2016 message words from zero and reads:

```text
PATH       2 = K
LIES       3 = e
EMPTY      4 = q
EPIPHANY   5 = g
SEEKS      6 = a
THE        7 = g+K
DEVOTED    8 = A
WORDS     15 = b
THEIR     19 = B
ROAD      23 = p
DIRECTION 29
```

These values close ordinary DH exactly:

```text
5^6  mod23 = 8
5^15 mod23 = 19
8^15 mod23 = 2
19^6 mod23 = 2
15*3 mod22 = 1
GP0(EMPTY) = 92 = 23*4
```

Across the charged 16 literal source alternatives, only the zero-based ROAD/PATH/first-THEIR reading survives. The source therefore supplies:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4
```

and places DIRECTION at 29, the GP modulus.

## 2. NUMBERS / DIRECTION exposes a specific low/right p50 structure

Canonical whole-word GP0 gives:

```text
NUMBERS   = 83
DIRECTION = 112
```

The original 32×8 number table spans LP2 p49, p50 and p51 as 10 / 13 / 9 rows. P50 is the rune-free middle page and contains row-major addresses80..183. Both source numbers land there:

```text
p50[83]  = 3D
p50[112] = 1D
```

The visible cells agree on their right-hand character `D`, whose native-base60 value is13. Among ten charged semantic source pairs, NUMBERS/DIRECTION is the only pair whose two GP0 addresses both land on p50 and whose printed cells share the right character.

Under the already investigated native-base60/low/zero/zero rule the pair converges and follows:

```text
83,112 -> 13 -> 4 -> 37 -> 20 -> 42 -> 28
```

where `20=GP0(OUT)` and `42=GP0(FIND)`. Across ten source relations ×16 component/origin conventions, this is the sole relation/mode reaching consecutive `FIND -> 28`.

**Prospective correction:** Director #1787 later sealed `GOOD -> LUCK` as an independent one-step source prediction. It fails: `GP0(GOOD)=35 -> p50[35]=0d -> low60=39`, while `GP0(LUCK)=31`; all 16 frozen modes miss. With GOOD/LUCK withheld, the preferred mode has 0/84 exact adjacent-word transitions across authenticated 2016 plus solved p56/p57. Therefore this NUMBERS/DIRECTION construction is specific corroboration, not an authenticated general navigation opcode.
## 3. Specific low/right source structures

The same low/right rule gives the source-side collision:

```text
ROAD(54)  -> FOUND(36)
FOUND(36) -> ROAD/PATHS(54)
PATHS(54) -> FOUND(36)
```

The signed prose prints ROAD, later FOUND, later PATHS, producing the suggestive route-specific trap `ROAD -> FOUND -> PATHS -> FOUND`.

The NUMBERS/DIRECTION chain likewise reaches physical p28 without unknown p28 ciphertext:

```text
NUMBERS / DIRECTION
 -> 13 -> 4 -> 37 -> OUT(20) -> FIND(42) -> p28
```

These are preserved as exact source-visible structures. They are not used below as the primary READ OUT authentication gate because the prospective GOOD→LUCK transfer failed.
## 4. P28 fixes a two-part source object

Physical p28 contains 269 runes, so its exact center is rune offset134. One-based word28 begins immediately at offset135, has length5 and runs to the physical line edge.

The resulting two-part source object is:

```text
center | word28
[9]    | [28,24,10,1,20]
```

P28 also contains the literal transliterated marker `DH` at the start of line6, connecting the page to the source-derived DH state.

## 5. Authenticated word numbers select the GP29 cube operator

Agent31's independent source audit fixes the operator itself before p28 ciphertext is consumed. With `LIES=e=3` and `DIRECTION=29`, the signed message defines

```text
C(x) = x^3 mod29
```

and exponent3 is the unique exponent from1..28 satisfying the reconstructed state chain `K -> A -> B -> b`. Continuing that same fixed map yields a closed authenticated-word cycle:

```text
PATH(2)
 -> DEVOTED(8)
 -> THEIR(19)
 -> WORDS(15)
 -> IS(11)
 -> NUMBERS(26)
 -> PATH(2)
```

so the cube opcode is first-party source structure rather than a p28 output fit.

P57's literal circumference grammar compresses the already fixed p28 source object but does not uniquely authenticate the word action count. The center singleton has one nonempty layer; the adjacent five-rune word has two circumference-removal actions and three nonempty layers. Those conventions yield competing source-typed word exponents `3^2 mod28=9` and `3^3 mod28=27`. Agent27's independent p39 circumference holdout favors literal removal-count semantics, so p57 must not be used as the selector for exponent27.

The winning `(3,27)` raw output is selected independently below by the source-selected p39 outer-circumference coordinates `[55,20]`, while Agent31's authenticated source cycle fixes the cube operator class and exponent3.

Agent45's independently frozen circumference route supplies the same ordered pair from a different manuscript location. P53's unique terminal red span has `GP0(MUST)=51`; its first two red runes give `H=[e,0]`, and one literal shed leaves **27 = -K mod29** runes. The source-selected p57→p50→p33→p39→p3→p53 chain therefore exposes:

```text
[e,-K] = [3,27]
```

before p28 language is consulted. P53 then points to p27, whose held-out red title independently re-registers the DH state, including `H(first2)=[a,e]`.

Applying that externally repeated pair gives the raw p28 output:

```text
[4,28,23] | [3,1,16]
```

A fresh manuscript-wide control applies only this frozen `(3,27)` action to every unknown five-rune side-object and every internal split. Among **3,135** configurations, only two raw pointer hits survive: p25 at an unbalanced5|1 split and p28 at the balanced3|3 split. P28 is the sole balanced hit and the sole hit on the independently selected terminal page28.

## 6. P39 selects the raw p28 output before language

Do not use a dictionary or the failed general low-digit-opcode hypothesis.

The solved p57 circumference route independently selects p39. Apply the already fixed forward H map to each word's outer circumference in p39's lower black body. The complete transformed outer stream has:

```text
length        = 55
GP0 sum mod29 = 20
```

so p39 supplies the ordered numeric pair `[55,20]`. Across all 15 nonempty red-started bodies, p39 is the sole body with that pair. This statistic was recognized after READ OUT, so it is cross-object corroboration rather than a blind probability claim.

Now charge `[55,20]` against every reversible uniform GP29 power map on the already source-fixed p28 center-plus-word28 object:

- 12 unit exponents modulo28 on the center;
- 12 unit exponents on the five-rune word;
- 2 orientations;
- 5 internal cuts.

Total: **1,440** numeric configurations. Retain only raw outputs whose two GP0 sums equal `[55,20]`.

Exactly two parameter tuples survive:

```text
(3,27),  forward, cut3
(17,27), forward, cut3
```

Both produce the identical raw six-rune output:

```text
[4,28,23] | [3,1,16]
```

because source center rune9 satisfies `9^3 = 9^17 = 4 mod29`. The authenticated DH value `e=3` resolves the center alias. Only after this numeric selection does the output transliterate:

```text
READ | OUT
```

This selector is independent of p50 low-digit navigation. The separately frozen p53 circumference packet also supplies `[e,-K]=[3,27]`, giving the same parameter pair from another manuscript object.
## 7. READ OUT has a direct instruction-level consequence: HERE

P28 line1 has source-selected DH geometry `[p,g,K,g]=[23,5,2,5]`. Its first two fragments are:

```text
PC
JTHBIW
```

The established forward H map is:

```text
H(x,y) = (x-y, x+y) mod29
```

The first two-rune word has one endpoint pair. The five-rune word has an outer pair and an inner pair.

```text
H(P,C)  = HE
H(J,W)  = RE
H(TH,I) = NGEO
```

The recovered instruction **READ OUT** selects the outer pair, giving:

```text
HE + RE = HERE
```

The inner rival does not give HERE.

This is a direct downstream interpretation of READ OUT rather than a new transform search.

## 8. HERE has a route-specific low/right echo

Canonical:

```text
GP0(HERE) = 48
p50[48]   = 4D
```

The low/right character `D=13` enters the same previously observed `13 -> 4 -> 37 -> OUT -> FIND -> p28` tail. After Director #1787 this is retained only as a local echo. It is not evidence that the low/right transition is a general navigation opcode.

The stronger continuation uses the full visible token `4D` as an ordinal locator, with an independent solved-p56 holdout, as shown next.
## 9. HERE self-indexes the fourth D and recovers GCD

The p50 token at the HERE state is itself readable:

```text
GP0(HERE) = 48
p50[48]   = 4D
```

Under the solved-page-transferred ordinal convention, `4D` means the rune at this same page address is the fourth D. On p28, rune offset48 is exactly the fourth D and is uniquely centered in its physical line fragment among the compatible self-index hits.

Its local centered triple is:

```text
L D X = [20,23,14]
```

Applying the already fixed H map to the two outer neighbors and preserving the selected center gives:

```text
H(L,X) || D
= [6,5] || [23]
= G C D
```

The exact `nX -> nth X at this same address` consumer transfers independently to solved p56: solved `IS` has `GP0(IS)=25`, original `p50[25]=3I`, and solved-p56 rune offset25 is exactly the third I. This closes the earlier semantic objection to the self-index.

The recovered operation label **GCD** immediately returns to the calibrated DH state:

```text
gcd(b,p-1) = gcd(15,22) = 1
b^-1 mod22 = 3 = e
B^e mod23 = g
```

So the p28 local route closes:

```text
READ OUT -> HERE -> 4D -> fourth D -> GCD -> e=3
```

## 10. THE / DIRECTION selects p29 and reconstructs WAY

The independent HERE receiver also leads to the p28 local candidate `THE`. In the authenticated 2016 source, the six THE occurrences have zero-based indices:

```text
1, 7, 12, 17, 22, 28
```

The current project page p28 self-locates at the final THE, index28. Its immediate authenticated follower is `DIRECTION` at index29, selecting project p29 under the same origin convention before p29's algebraic property is opened.

P39's red triad defines the repeated-root polynomial with root24. Among all 55 unknown rune pages, p29 alone has that repeated root, and p29 alone shares a repeated root with the printed p50 table.

The authenticated words MAP and DIRECTION independently expose `e=3` in the fixed endpoint-H register. At the selected repeated root, derivative order3 gives:

```text
P29'''(24) = 7 = W
```

while the authenticated 2013 BASE29 factor contributes positive-degree coefficients:

```text
[24,26] = AY
```

The charged 48-way derivative/insertion/direction family has one authenticated three-rune output:

```text
W + AY = WAY
```

WAY remains candidate instruction material because its final assembly was recognized retrospectively, while its page, root and derivative order now have independent source selectors.

## 11. WAY/MAP selects p26 and returns FOURTH DH to p28

The fixed WAY/MAP p50 edge:

```text
57 --1w--> 56
```

occurs exactly once as adjacent unknown-word GP0 states, at p26 line10 words2-3 inside a four-word block.

That block's p50 high digits independently read:

```text
FOUR
```

and its full base60 residues reduce to:

```text
[b, p-1, K, p-1]
```

Applying the already frozen GCD opcode to the final pair gives:

```text
gcd(K,p-1) = gcd(2,22) = 2 = TH
```

so the packet extends uniquely to:

```text
FOURTH
```

The same state packet reconstructs `A=K^e modp=8`, hence:

```text
[p,A] = [23,8] = DH
```

Read as **FOURTH D; H**, this lands exactly on the already selected p28 consumer:

```text
fourth D -> centered LDX
H(L,X)||D -> GCD
GCD -> e=3
```

This closes the bounded route:

```text
p28 GCD/e3
 -> p29 WAY
 -> WAY/MAP p50 edge
 -> unique p26 packet
 -> FOURTH DH
 -> p28 fourth-D/H
 -> GCD/e3
```

The p26 result is a meta-instruction/state packet rather than continuous plaintext; its immediate lexical continuations remain negative.

## Current evidence boundary

The most defensible integrated chain is now:

```text
solved p57 circumference route
 -> candidate p39 VERIFY OPENPGP entry
 -> authenticated 2016 word-number DH23 state
 -> source-selected GP29 cube, e=3, modulus29
 -> p53 [e,-K]=[3,27]
 -> p39 outer circumference [55,20]
 -> source-fixed p28 center + word28 object
 -> unique raw [4,28,23] | [3,1,16]
 -> READ OUT
 -> OUT selects outer-H page-start layer
 -> HERE
 -> p50[HERE]=4D
 -> fourth D ; H -> GCD -> e=3
 -> THE / DIRECTION -> p29 -> WAY
 -> WAY/MAP -> p26 -> FOURTH D ; H
 -> p28 fourth-D/H -> GCD -> e=3
```

Two distinctions are essential.

First, the native-base60 low/right p50 constructions remain reproducible: ROAD/PATHS↔FOUND and NUMBERS/DIRECTION→...→FIND→p28. Director #1787's sealed GOOD→LUCK miss and 0/84 held-out adjacent transitions reject their promotion to a general navigation opcode. They are corroborating structures rather than a required step in the chain above.

Second, the strongest remaining p28 premise is the two-part application itself: assigning the independently repeated `[3,27]` power pair to the exact center singleton and adjacent five-rune word. P28's geometry and literal DH marker motivate that split, and the independently selected p39 coordinates `[55,20]` choose the resulting raw output before transliteration.

The strongest downstream route-specific results are READ OUT→HERE, HERE→4D→fourth-D/H→GCD, and the p29/p26 loop returning FOURTH D; H to the same p28 consumer. These are candidate instruction/state structures rather than continuous unknown-page plaintext.

A decisive next advance should derive fresh unknown plaintext or a new receiver outside this already used loop from one of the source-selected operations, or produce a first-party instruction that fixes the p28 two-part power assignment before the output is considered.

## Reproduction

```text
node sims/lp2_signed2016_word_position_dh_sft.cjs
node sims/lp2_signed2016_wordnumber_cube_operator_sft.cjs
node sims/lp2_2016_road_found_falsepaths_lowdigit_cycle_sft.cjs
node sims/lp2_p28_readout_familywise_audit_sft.cjs
node sims/lp2_p28_readout_here_page_start_sft.cjs
node sims/lp2_p28_here_4d_gcd_holdout_sft.cjs
node sims/lp2_p29_direction_derivative_way_sft.cjs
node sims/lp2_p26_way_map_four_receiver_sft.cjs
```

The Agent16 combined Windows workflow runs the latter three SFTs together. Agent27's source-word-position SFT independently reproduces the DH state.
