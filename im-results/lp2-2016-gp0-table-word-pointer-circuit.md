# Signed-2016 GP0 table word-pointer circuit into p0 and p27

**Agent23, 18 November 2026. Classification: high-priority source-internal navigation mechanism that independently selects the four-word signed clause `EPIPHANY SEEKS THE DEVOTED` from solved p57 numbers and places its 8 / 5 and 2 / 7 halves on original p0. The same frozen pointer grammar also selects `THE ROAD` at p0 offsets103..108 through a complete adjacent-pair census. The route does not yet recover the full p0 cipher.**

## Decision

A single frozen operation now links three independently selected source objects:

1. normalize a source word into canonical GP29;
2. sum its zero-based GP indices without reduction;
3. use that sum as a zero-based address in the original 256-cell p49–51 table;
4. read the conventional base60 byte at that cell as a page-local rune offset when a receiver page has already been selected.

Under that operation, the authenticated 2016 clue's adjacent words **EMPTY / EPIPHANY** are the **only adjacent pair among all 43 signed words whose table bytes are consecutive**. Their outputs are exactly **236 / 237**. On original p0 those are the two sides of the page's only later 2-rune / 7-rune word boundary: rune236 is the last rune of the two-rune word and rune237 is the first rune of the following seven-rune word. The signed clause itself supplies the matching phrase **“epiphany seeks the devoted”**, whose final two GP word lengths are 2 / 7.

The same target closes through the map. The two-rune p0 ciphertext word has GP0 sum13; table cell13 is literal token `04`, byte4; zero-based signed word4 is **EMPTY**; EMPTY has GP0 sum92; table cell92 returns byte236, exactly the final rune of that two-rune word. Across **all eight** p0 words whose GP0 table byte is a valid zero-based index into the 43-word signed message, this is the **only** route whose selected signed word maps back to either boundary of the originating p0 word.

The following seven-rune p0 ciphertext word has GP0 sum101; table cell101 gives byte229. Independently, the p27 route reconstructs integer3301, and `3301 mod 256 = 229`; table cell229 is literal `00`, byte0. The seven-rune target therefore returns to the exact table address already implicated in the conditional `3301 -> 229 -> 00 -> p0` navigation route.

This is strong evidence that the signed sentence and p50 table form a real navigation layer. Solved p57 circumference arithmetic independently selects all four lexical words **EPIPHANY / SEEKS / THE / DEVOTED**, the signed 2016 source orders them, and original p0 supplies the 8 / 5 and 2 / 7 placements. The red-title ciphertext adds a separate holdout for **THE / DEVOTED** through `85 -> 28 -> THE -> 20 -> 102`. The full p0 encryption mechanism remains unresolved.

## Frozen source facts

The authenticated 2016 clear-signed body contains exactly 43 alphabetic words when the numeric terminal `3301` and hexadecimal key-ID fragments are excluded. Its opening clause is:

`Hello / The / path / lies / empty / epiphany / seeks / the / devoted`

The canonical p0 transcription contains 59 complete words and 262 runes. Its first two words have lengths **8 / 5**. After those opening words, the page contains exactly one complete **2 / 7** adjacent word pair:

| p0 word | zero-based rune start | length | ciphertext GP indices | GP0 sum |
| --- | ---: | ---: | --- | ---: |
| word52 | 235 | 2 | `[8,5]` | **13** |
| word53 | 237 | 7 | `[15,22,16,22,21,1,4]` | **101** |

Thus the relevant boundary is **236 / 237**.

The canonical signed words have GP lengths `EPIPHANY=8`, `SEEKS=5`, `THE=2`, `DEVOTED=7` under the existing K→C and V→U normalization. No ciphertext values are used to choose those lengths.

## EMPTY / EPIPHANY direction pair

Canonical GP0 sums are:

- `EMPTY = 92`
- `EPIPHANY = 121`

Both addresses lie inside the independently established p50 strict-interior bracket at cells84..126. Reading the original base60 table gives:

- `T[92] = 236`
- `T[121] = 237`

Across all 42 adjacent pairs in the 43-word signed message, **EMPTY / EPIPHANY is the only pair whose table-byte outputs differ by exactly one**. The ordered outputs are increasing, `236 -> 237`.

Those outputs land exactly on the boundary of the page's sole later 2 / 7 pair:

`... [word52 ends at 236] | [word53 begins at 237] ...`

### EPIPHANY's two independent numbers converge

The authenticated source supplies a second natural number for each word: its zero-based word index. **EPIPHANY is source word5 and GP0(EPIPHANY)=121; 121 mod29=5. It is the only one of all 43 signed words whose zero-based index equals its GP0 residue modulo29.**

The original p50 table turns that congruence into a pointer holdout:

- cell5 is printed token `3v`, byte237;
- cell121 is also printed token `3v`, byte237;
- byte237 occurs exactly twice in the table, at addresses5 and121;
- byte237 is the already selected start of p0 word53, the seven-rune DEVOTED target.

Thus the two independently defined numbers attached to EPIPHANY, its signed-source ordinal and its GP0 sum, select the same printed table token and the same p0 receiver. Conditional on the already established `T[121]=237` pointer and the exact table byte multiset, the second copy at fixed address5 is a 1/255 holdout. The unconditional exact collision rate for an arbitrary fixed pair of table addresses under the fixed byte multiset is `254 / (256*255) = 127/32640`; those calibrations do not include the prior selection of EPIPHANY or the target.

This makes a literal source reading possible:

`EPIPHANY seeks THE DEVOTED`

with the p0 red opening already providing the 8 / 5 `EPIPHANY / SEEKS` shape and the pointer identifying the later 2 / 7 `THE / DEVOTED target shape.

## LIES / EMPTY / EPIPHANY supplies a literal GP29 direction ray

The authenticated signed sentence itself now supplies a source-selected direction before inspecting unknown plaintext. Canonical GP0 sums of the consecutive words `LIES / EMPTY / EPIPHANY` are exactly

```text
63 -> 92 -> 121
   +29   +29
```

A complete scan of all 41 consecutive three-word windows in the 43-word signed message finds this as the **only arithmetic-progression window**, and also the only consecutive triple whose three GP0 sums share one residue modulo29. The step is therefore exactly the GP29 alphabet size rather than a fitted table offset.

On the original 32x8 row-major p50 rectangle, addresses 63, 92 and 121 are coordinates `(7,7), (11,4), (15,1)`. They are two identical `(+4,-3)` moves, each with squared Euclidean length25. The independently source-selected horizontal reflection from the p50 tree artwork, `c -> 7-c`, maps them to `(7,0), (11,3), (15,6)`: two identical **(+4,+3)** 3-4-5 steps. Extending that reflected vector one step backward gives column -3 and one step forward gives column9, so the three signed-word cells are the complete in-bounds straight ray under that direction.

This geometry was not used to obtain the previously reported p0 placement. The original table values at EMPTY/EPIPHANY are conventional-base60 bytes **236/237**, already known to land exactly on the only later complete 2/7 p0 word boundary: byte236 is the final rune of the two-rune target and byte237 is the first rune of the seven-rune target. The authenticated clause orders the corresponding lexical target as **THE / DEVOTED**. The new ray therefore makes the wording literal at two levels: the signed words provide a map-space direction, and its EMPTY/EPIPHANY endpoint pair points to the p0 THE|DEVOTED boundary.

A fixed-multiset calibration supports treating +29 as selective while avoiding an authorship probability claim. Among all `43*42*41=74,046` ordered triples of distinct signed-word instances, only eight have two successive +29 GP0 steps. A random reordering of the fixed 43-word multiset would therefore contain `41*8/74046 = 0.0044296788` expected +29 windows. This is a narrow calibration for the frozen +29 consequence, not a familywise p-value over possible numerologies.

The first ray cell, LIES=63, has table byte51. Under the original **rune-offset** interpretation, 51 still lands inside p0 ciphertext word10 (line3, ninth rune), not on a word or line boundary; that negative remains correct. The original p0 image (physical image 17.jpg) has a red 8+5-rune heading followed by the large 13-dot marker at offset13. Excluding those two red heading words leaves **57 black-body words** on the page.

A distinct **mixed-coordinate candidate** is now tested. Read the first output51 as the **one-based ordinal of a black-body word**, and the next outputs236/237 as **absolute page-rune positions**. This maps the source-selected triple to:
- body word51: p0's zero-based full-page word index52, ciphertext `HC`, offsets235–236;
- offset236: that word's final rune;
- offset237: the next word's first rune, ciphertext `SOETOENGUR`, offsets237–243.

Thus the three outputs select the 51st black-body word and its exact 2|7 word boundary. The full census over all **41 consecutive three-word windows** in the 43-word signed message has exactly one match under this convention: `LIES / EMPTY / EPIPHANY -> [51,236,237]` using base60. The matched controls are all null: base59, zero-based body-word indexing, one-based whole-page indexing, and zero-based whole-page indexing. The original zero-based whole-page word-index interpretation of51 is also not the candidate; it remains a different, unsuccessful type assignment.

The p0 red-heading/body boundary and the signed instruction that words are the map provide a plausible human route to the first value's word-ordinal type. But the complete mixed typing is **not explicitly specified by a first-party instruction**: no source says that the first table byte should be a body-word ordinal while the following two are absolute rune offsets. Treat this as a new provisional receiver-selection hypothesis, not recovered plaintext or a reversible cipher. It strengthens the existing 2|7 receiver selection without independently proving the candidate letters.Also, the most literal attempt to reinterpret the +29 ray as an additive p50-byte keystream is rejected by the source-selected p0 cribs: starting at LIES and stepping +29, conventional-base60 values give 0/28 exact crib symbols under `P=C-K` and 1/28 under `P=C+K`; base59 gives 1/28 under either sign. Preserve +29 / reflected (+4,+3) as a navigation direction, not as an additive cipher key.

Reproducer: `sims/lp2_2016_lies_empty_epiphany_direction_sft.cjs`.

## Retrospective p0→p1 four-rune stop consumer

The +29 ray has a second bounded consumer once combined with the independently reconstructed shared2 DH circumference. That ring fixes the frozen post-TURNS directions as **DOWN / LEFT / UP**, with UP the ciphertext read axis. The signed-word ray is `(+4,-3)` on the source 32×8 table and `(+4,+3)` under the source-selected horizontal tree reflection, so its vertical component magnitude is invariant at **4**. Using the component along the already selected UP axis therefore fixes a four-rune stop before reading p1 letter values.

With the ring-selected DOWN key center, LEFT start and UP read, the four cells decrypt under the frozen `U-H-H` key to **C-O-L-D** and re-encrypt exactly. Their index sum51 and GP-prime sum182 independently match the pre-existing solved-LP1 checksum residual. This makes that checksum corroboration rather than a mechanical stop dependency for this construction.

The assignment was recognized after COLD was already known, so it is retrospective source convergence rather than the prospective blind test requested by #1646. It is also not a universal block-length rule: the later source-selected I MAY branch is four runes on a horizontal read, whereas this ray's horizontal magnitude is3.

[Full convergence report](lp2-2016-plus29-p0p1-stop-convergence.md) · [SFT](../sims/lp2_2016_plus29_p0p1_stop_convergence_sft.cjs).


## The zero-based EMPTY closure

The two-rune target word itself gives a stronger typed loop:

`p0 word52 GP = 13`

Original table cell13 is printed **`04`** and has byte4. In the authenticated message, zero-based word4 is **EMPTY**. Then:

`GP0(EMPTY) = 92`

and `T[92] = 236`, exactly the final rune of p0 word52.

A broader source-preserving census admits every p0 word whose GP0 table byte is less than43, so that it can index any signed word. There are eight such p0 words. For each, the selected signed word is converted by the same GP0-table-byte operation and tested against the source word's start and end offsets. **Only p0 word52 closes on one of its own boundaries.** This uniqueness does not depend on requiring the intermediate table token to look decimal.

The visible token `04` therefore supplies a human-readable rendering of a relationship that already survives the broader byte-based census.


### Receiver-family holdout selects p0 for the typed closure

The earlier closure was first measured only within p0, leaving the receiver page itself uncharged. A later frozen family census applies the same signed-word GP0 -> p50 -> page-offset grammar to **all 55 rune-bearing unsolved LP2 pages**, under both base59/base60 and two predeclared page-boundary conventions.

Under the stricter continuous-word convention, which retains only complete words wholly contained on one physical page, **base60 has exactly one typed self-closure in the entire 55-page family**. It is the same p0 word52 route above:

```text
p0 word52 GP0 13
-> p50[13] = 4
-> signed word4 EMPTY
-> GP0(EMPTY) = 92
-> p50[92] = 236
-> end(p0 word52)
```

The test uses only original ciphertext word boundaries and authenticated signed words. It does not use the proposed plaintext `THE DEVOTED` to choose p0. This materially reduces the receiver-choice freedom in the navigation hypothesis.

The broader interval/phrase-shape census still produces short coincidences on other pages, so this result should not be inflated into authentication of the candidate plaintext letters or a universal base60 rule. It specifically selects p0 for the **typed self-closure** once this grammar and base60 interpretation are frozen.

Full family report: [`lp2-2016-receiver-familywise-census.md`](lp2-2016-receiver-familywise-census.md). Reproducer: [`../sims/lp2_2016_receiver_familywise_census_sft.cjs`](../sims/lp2_2016_receiver_familywise_census_sft.cjs). Windows Node22 PASS: [run 44422378212](https://github.com/FlareZ123/liber-primus/actions/runs/44422378212).

## Solved p57 independently selects all four signed-clause words

The solved p57 instruction supplies a separate route into the exact four-word 2016 clause vocabulary:

`EPIPHANY SEEKS THE DEVOTED`.

This route uses the instruction's own “shed our own circumferences” language as a source cue for GP29 circumference reduction. The GP alphabet contains exactly29 symbols, so shedding complete alphabet circumferences preserves a word's GP0 sum modulo29.

For the solved p57 words:

- `FIND = 42 ≡ 13 (mod 29)`;
- `CIRCUMFERENCES = 131 ≡ 15 (mod 29)`;
- `THE = 20 ≡ 20 (mod 29)`.

Across all 43 authenticated 2016 words, the corresponding residues select unique lexical types:

- residue13 occurs only for **SEEKS**, whose exact GP0 sum is71;
- residue15 occurs only for **DEVOTED**, whose exact GP0 sum is102;
- residue20 occurs only for **THE** (six source occurrences, one lexical word).

Thus the p57 semantics and circumference arithmetic give:

`FIND <-> SEEKS`

`CIRCUMFERENCES <-> DEVOTED`

`THE <-> THE`.

The center result makes the FIND relation especially concrete: `42 mod29 = 13`, exactly the unique printed center token selected independently by p57 `DIUINITY=105`. Candidate SEEKS also has `71 mod29 = 13`. The same residue therefore connects solved FIND, the DIVINITY-selected center, and signed SEEKS.

The remaining clause word is selected by the literal p57 phrase **WITHIN AND EMERGE**. Their canonical GP0 sums are:

`WITHIN = 38`

`EMERGE = 83`

and their direct sum is:

`38 + 83 = 121`.

Among all 43 authenticated signed words, **EPIPHANY is the unique word with exact GP0 sum121**. Its eight-rune length is then an untouched holdout against p0's first red word.

These four numerical selections were derived from the independently solved p57 text and the already authenticated 2016 source. They do not use the unknown p0 letter values. The 2016 source itself supplies the lexical order **EPIPHANY SEEKS THE DEVOTED**, after which original p0 supplies two independent placement checks: the red opening is8 / 5 and the pointer-selected later boundary is2 / 7.

The strongest caveat is ordering. Reading the relevant p57 operands in their physical order would associate CIRCUMFERENCES before FIND/THE and WITHIN/EMERGE later, so p57 alone does not emit the 2016 clause in final reading order. The authenticated 2016 sentence supplies that order. The result therefore establishes an independent **vocabulary selection and placement route**, while the 2016 clue remains necessary as the ordering map.

This materially strengthens both p0 plaintext placements: **EPIPHANY SEEKS** is now selected numerically from solved p57 before matching the 8 / 5 red heading, and **THE DEVOTED** is selected independently by the title/table holdout and the p0 2 / 7 pointer boundary.

## SEEKS / THE directions bracket a unique THE ROAD placement

The established signed-word pointer grammar makes another finite prediction on original p0.

For the authenticated adjacent source pair **SEEKS / THE**:

`GP0(SEEKS)=71 -> T[71]=108`

`GP0(THE)=20 -> T[20]=102`.

Both returned offsets are exact **ends of complete p0 words**. Sorted as boundaries, 102 and108 enclose exactly p0 words21 and22:

| p0 word | start | end | length | ciphertext GP0 sum |
| --- | ---: | ---: | ---: | ---: |
| word21 | 103 | 104 | 2 | **20** |
| word22 | 105 | 108 | 4 | 76 |

Their word-length vector is therefore **2 / 4**.

This was tested by a complete source-preserving census rather than by searching only for THE ROAD. Across all 42 adjacent signed-word pairs, only **two** pairs have table-byte outputs that both land on p0 complete-word ends and enclose one or more complete words:

- SEEKS / THE: boundaries102 / 108, interior word lengths `[2,4]`;
- THE / DIRECTION: boundaries72 / 102, interior word lengths `[2,2,3,3,7,5,8]`.

For each resulting interval, compare its complete word-length vector against **every contiguous signed-message phrase of exactly the same word count**. There is exactly **one match in the entire census**:

`SEEKS / THE -> p0 [2,4] <-> signed THE / ROAD`.

The authenticated source itself contains the exact contiguous phrase **“the road”**, matching the 2 / 4 GP lengths. This is especially source-constrained because the same signed instruction says that the words' **meaning is the road** and their numbers are the **direction**: the numbers of SEEKS and THE supply the two direction endpoints, and the unique phrase shape between them is literally THE ROAD.

A post-selection holdout strengthens the first word: original p0 word21 has ciphertext GP0 sum **20**, exactly equal to canonical `GP0(THE)=20`. No sum-preservation assumption was used to select the interval.

This supports a third source-selected p0 plaintext placement:

`p0 offsets103..108 = THE ROAD`

with word21 / word22 corresponding to **THE / ROAD**. As with the other placements, this is a reproducible navigation-derived plaintext prediction rather than a recovered global letterwise cipher.

### Natural 27x27 p0-p2 geometry marks both body-word endpoints

The combined p0-p2 rune count is exactly `729 = 27^2`, giving a source-natural 27x27 square without padding. In zero-based row-major coordinates, the selected final runes are:

- ROAD ends at p0 offset108 = row4, column0;
- DEVOTED ends at p0 offset243 = row9, column0.

A complete census of all 59 p0 word ends finds **exactly two** whose offsets are congruent to0 modulo27: word22 at108 and word53 at243. These are precisely the independently selected ROAD and DEVOTED target words. Equivalently, both recovered body phrases cross a 27-column row boundary and place their final plaintext D on column0.

This geometry was not used by the GP0/table pointer mechanism or by the original line-break holdout below. It therefore supplies an additional structural check on the two body placements. It does not identify the value-changing cipher.

## Original line layout independently marks both recovered body phrases

The canonical transcription preserves the original printed line wraps with `/`, and the original p0 image confirms those physical breaks.

Both source-selected body placements fall exactly across line boundaries:

- p0 word21 / word22, candidate **THE / ROAD**, is the unique line break with word lengths **2 / 4**;
- p0 word52 / word53, candidate **THE / DEVOTED**, is the unique line break with word lengths **2 / 7**.

Across the twelve internal p0 line breaks, the complete end/start length pairs are:

`3/3, 4/3, 6/11, 3/7, 2/4, 3/4, 4/6, 7/3, 4/5, 4/3, 2/7, 4/1`.

Thus neither recovered phrase shape has a second line-break competitor anywhere on the page. The THE / DEVOTED break is at rune boundary236/237, exactly the EMPTY / EPIPHANY table outputs. The THE / ROAD break is at104/105, inside the independently bracketed direction interval102..108.

This is a visual-layout holdout: the numerical pointer mechanism was derived from GP sums and p50, while the printed line-break geometry is an independent property of the original p0 artifact. It supports the interpretation that these body phrases were intended to be recognized as units.

## p57 bracket quantities reconstruct the two red-title ciphertext sums

The solved p57 instruction and the independently authenticated p50 bracket now reproduce both original red-title **ciphertext word sums** without using proposed title letters.

The p57 GP0 values are:

- `FIND = 42`
- `EMERGE = 83`
- `DIUINITY = 105`

The p50 bracket supplies two independent quantities:

- its strict interior length is **43**;
- its exact center, selected by `DIUINITY=105`, is the printed token **13**.

Use those numbers as row-major directions from the two solved p57 addresses:

`FIND 42 + within-length 43 = 85`

`EMERGE 83 + center-token 13 = 96`

The original p0 red title has ciphertext GP0 word sums exactly:

`[96, 85]`.

Across all 58 adjacent p0 word pairs, **word0 / word1 is the only pair with the ordered sum vector `[96,85]`**. Each individual sum occurs elsewhere on p0, so the adjacency is material: 96 also occurs at word36 and 85 at word10, while only the red title places them together in the required order.

The FIND leg has a further exact table invariant. Original cells42 and85 are the only two cells whose base60 byte is28:

`T[42] = T[85] = 28`

and their address separation is exactly43. Of the three duplicate-token pairs anywhere in p50 separated by43 cells, **42 / 85 is the only pair whose left endpoint is the GP0 number of a solved p57 word**. Thus the operation `FIND + the 43 symbols within` lands on a same-token duplicate at address85, independently equal to the second red-title ciphertext sum.

The EMERGE leg is weaker operationally: moving by the center's printed value13 from address83 lands at96, but unlike the FIND leg it does not preserve the table token. It should therefore be treated as a source-coherent directional reconstruction rather than an authenticated second pointer.

This convergence supplies a plausible reading of the signed 2016 instruction that “their numbers are the direction”: p57 words provide starting addresses, while source-selected p50 numbers supply displacements. It also makes the proposed title **EPIPHANY / SEEKS** semantically coherent with the p57 verbs **EMERGE / FIND**, but semantic affinity is supporting interpretation rather than cryptographic proof.

A caveat is important: the natural p57 sentence order derives 85 before96, whereas the title is 96 then85. No first-party source currently instructs that reversal. The exact numeric reconstruction is therefore preserved as a constrained title bridge, not promoted to a complete title decryption.

## Red-title ciphertext -> THE -> DEVOTED holdout

The original p0 red title supplies a second, letter-level test that was **not used to select the later 2 / 7 target**. The target had already been fixed by the EMPTY / EPIPHANY boundary circuit above.

The original second red title word is five runes:

`[15,26,18,21,5]`

and its ciphertext GP0 sum is **85**. Apply the same typed table operation, but now let the returned byte index the authenticated 43-word message:

`T[85] = 28`

Zero-based signed word28 is **THE**. Continue with the same GP0/table operation:

`GP0(THE) = 20`

and

`T[20] = 102 = GP0(DEVOTED)`.

So the original five-rune title ciphertext itself gives the closed typed path:

`p0 title word1 -> cipher GP0 85 -> T[85]=28 -> signed word28 THE -> GP0 20 -> T[20]=102 -> GP0(DEVOTED)`

This is a genuine within-run holdout against the proposed later plaintext because the 2 / 7 target had already been selected as THE / DEVOTED from the independent EMPTY / EPIPHANY boundary before this title sum was inspected.

A source-preserving finite calibration keeps the exact original p50 byte multiset and uniformly permutes it among the 256 addresses. The signed message contains six occurrences of THE, at zero-based word indices `1,7,12,17,22,28`. Only three bytes in the original table multiset have one of those values: byte22 occurs once and byte28 twice. Byte102 occurs once. At the two fixed, distinct addresses85 and20, the probability of first selecting any signed THE occurrence and then landing on `GP0(DEVOTED)=102` is therefore:

`(3/256) * (1/255) = 3/65280 = 1/21760`.

This is a post-discovery calibration of the exact frozen grammar, not an unconditional probability that Cicada authored the route.

There is also a source-order check inside the authenticated message. Across all 42 adjacent signed-word pairs, **THE / DEVOTED is the only pair** for which conventional-base60 `T[GP0(word_i)]` equals `GP0(word_{i+1})`. The hit is the actual clause occurrence at signed positions7/8:

`THE -> GP0 20 -> T[20]=102 -> GP0(DEVOTED)`.

Together with the earlier EMPTY / EPIPHANY boundary, this independently predicts the same seven-rune target word from the original title ciphertext rather than from its word shape alone.

## Seven-rune return to the 3301 / `00` address

The following p0 seven-rune ciphertext word has GP0 sum **101**. Original table cell101 has byte **229**.

The independent p27 instruction-parser route reconstructs terminal prime **3301** through its `NSOOCAEY -> 3QO` historical BASE29 circuit. The existing zero-based number-address hypothesis gives:

`3301 mod 256 = 229`

and original table cell229 is literal token **`00`**, byte0.

So the target p0 seven-rune word returns to the same address229:

`p0 word53 -> GP0 101 -> T[101]=229 -> token[229]=00`

This does not prove that `00`means p0. It makes the conditional p0 reading materially more coherent because the object selected inside p0 returns to the same table address that points at `00`.

## Independent operator replication on p27

The same GP0-address / base60-byte operation reproduces an independently selected p27 landmark without using the 2016 p0 phrase:

`GP0(FIND) = 42`

and original table cell42 has byte **28**. Original p27 rune offset28 is exactly the start of `DJU`, immediately followed by `BEI` at offset31. That `DJU / BEI` pair was independently selected by the finite historical `prime_echo` exhaustion at p55 and has its only other adjacent occurrence at p27:28.

Thus:

`FIND -> 42 -> T[42]=28 -> p27:28 DJU / BEI`

This is a second concrete receiver for the same word-number/table-byte grammar. It was established independently of the EMPTY / EPIPHANY p0 boundary observation.

The newly reported p57 bridge `DIUINITY -> GP0 105 -> p50 cell105 -> visible token 13` uses the same GP0 table-address grammar while reading the literal printed token at a different typed receiver. It supports the address convention without being counted as a byte-offset replication.

## Selected DJU / BEI pair continues into the p27 DIVINITY carrier

The independently selected p27 pair now has a deterministic continuation under the same operator. `DJU=35 → T[35]=39` and `BEI=45 → T[45]=107`; both bytes land on the final rune of separate three-rune p27 words. Those intermediate words have GP0 sums **40** and **55**, and the same table operation gives `T[40]=T[55]=80`. Offset80 is the first rune of the once-shed interior of the already selected 12-rune p27 carrier whose twice-shed core has GP-prime sum **376=DIVINITY** and whose whole-word totient gives **INSTAR=280**.

Across all 51 adjacent p27 word pairs, only two converge after this exact two-step grammar. The other is a trivial same-first-byte collision; **DJU / BEI is the unique distinct-first-byte convergence**. This creates a source-connected route from the p55 terminal pair into the existing DIVINITY/3301 parser without adding a key search. [Detailed report](lp2-p27-dju-bei-gp0-divinity-convergence.md) · [Windows SFT PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44417202214).

## THE / WAY source-order bridge returns p0 to the p27 endpoint80

The same two p0 receiver-word numbers reduce to **D H** in native GP29: 139 mod29=23=D and 37 mod29=8=H. Among 1,931 valid page × signed-adjacency receiver pairs, six raw DH pairs occur and two also end80; p0 THE/WAY is the only pair that also satisfies authenticated source order, and remains the sole source-order DH+80 chain. Values23 and8 independently match the reconstructed signed-2013 DH modulus and server-public state. The historical post-DH command **NEXT** also has GP0=57, exactly the already-used GP0 of WAY; WILL shares that number too, so the alias is supporting context rather than an independent selector. The source route therefore selects the DH family more directly, while a post-DH payload cipher remains absent.

The p27 endpoint80 supplied a prospective holdout. Authenticated source `THE` at index12 maps through p0 word20 back to signed index13, exactly next word **WAY**. WAY then maps through p0 to byte80. Across all 56 unknown pages and 42 signed source adjacencies, ten first-hop source-order bridges occur, but p0 THE/WAY is the only chain whose next step returns80; p25 is the only THE/WAY first-hop rival and exits at65. This matches the independently fixed p27 DJU/BEI endpoint and closes the existing `DIVINITY→3301→229/00→p0` route. [Cycle](lp2-p0-the-way-p27-80-navigation-cycle.md) · [PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44420220363).

## Later prime-ordinal/DH value holdout at the THE ROAD receiver

Agent30's independent signed-image ordinal route now strengthens the already selected `THE ROAD` receiver without changing this pointer census. The preserved 2016 carrier is 563×569, i.e. primes #103/#104, and p32 independently reproduces those two dimensions as its source-selected first-row/first-column GP-prime sums. The pointer census above had already placed native-GP `THE` exactly at p0 offsets103..104 before that ordinal coincidence was examined.

Those two original ciphertext runes are `H,EO=[8,12]`; native plaintext `TH,E=[2,18]`. Their additive inverse is therefore **[6,23]**. The independently source-derived p28 DH object gives **a=6, p=23**, so the image-selected complete word decrypts exactly under `[a,p]`. Across all473 complete two-rune words on unresolved p0..p55, `H,EO` occurs only at this receiver.

The same numeric span continues through the pointer-selected `ROAD` at offsets105..108. Interpreting those four integers as one-based p50 cells, the table bytes modulo29 are **[6,5,2,15] = [a,g,K,b]**. This is the only four-consecutive-cell p50 window whose four residues are all members of the reconstructed DH state set. The four values do not directly decrypt ROAD, so preserve them as a source-selected state clue rather than a fitted keystream. [Detailed report](lp2-2016-prime-ordinals-p0-road-3qo-dh-key-bridge.md) · [SFT](../sims/lp2_2016_prime_ordinals_p0_road_3qo_bridge_sft.cjs).

## Whole-corpus successor holdout

The local p0/p27 pointer circuits do not generalize under the simplest direct adjacent-word rule. A canonical pass over all 2,896 complete words on physical p0–p55 (12,956 runes; all 32 cross-page carries preserved) finds only ten base60 exact transitions across 2,895 adjacent pairs, versus 11.83984375 expected under a fixed-token multiset shuffle (50,000 deterministic draws; upper-tail p=0.73624). There are no consecutive edges. The base59 sensitivity gives eleven isolated edges. This rejects the generic successor interpretation, not the additional source-selected local receiver conditions described above. Full details and the reproducer are in [the whole-corpus holdout](lp2-full-corpus-gp0-wordgraph-gate.md) and [SFT](../sims/lp2_full_corpus_gp0_wordgraph_sft.cjs).

## What is recovered

The result supports the following source-driven route:

`2016 EMPTY / EPIPHANY -> p50 addresses92 / 121 -> bytes236 / 237 -> p0 THE / DEVOTED boundary`

and independently:

`p57 FIND -> p50 address42 -> byte28 -> p27 DJU / BEI handoff`

Together with the upstream p27-derived3301 route, the exact p0 opening word shape, and the new title-ciphertext `85 -> THE -> DEVOTED` holdout, this is enough to treat **EPIPHANY SEEKS** at p0:0 and **THE DEVOTED** at p0:235 as high-priority plaintext crib placements for subsequent cryptanalysis. The second phrase now has an independent source-selected letter-level confirmation, while the complete p0 encryption mechanism remains unresolved.

## Reproduction

Run:

`node sims/lp2_2016_gp0_table_word_pointer_circuit_sft.cjs`

The single-file test reads the canonical LP2 corpus/transcription, original 256-cell table and authenticated 2016 OpenPGP cleartext. It asserts the 43-word source, p0 word geometry, uniqueness of the later 2 / 7 pair, uniqueness of the adjacent consecutive-output source pair, the eight-candidate typed closure census, the red-title `85 -> 28 -> THE -> 20 -> 102 -> DEVOTED` holdout and its fixed-multiset calibration counts, the `101 -> 229 -> 00` return, and `FIND -> 42 -> 28 -> p27:28 DJU / BEI`.

Related upstream reports:

- `im-results/lp2-p57-divinity-p50-center13-bridge.md`
- `im-results/lp2-p55-p27-redheading-we-must-shed-route.md`
- `im-results/lp2-primeecho-terminal-duplicate-mapline.md`
- `im-results/lp2-source1033-red3299-3301-table-pointer-lead.md`
