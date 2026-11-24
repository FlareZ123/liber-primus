# 2014 Onion5 → Onion6 → Onion7: GEB book code and LP2 handoff

## Established source sequence

A first-party signed PGP message archived as `2014-01-onion5-liber-primus.asc` contains two images, an audio cue, a list of chapter/coordinate codes, and the terminal marker `ONION`. The three media cues point to **Gödel, Escher, Bach**: the first image depicts Gödel's incompleteness result, the second is an Escher eye image, and the audio is Bach. This is a clue-constrained book selection, not an arbitrary codebook guess.

The archived community decoding interprets each entry as:

`chapter-title abbreviation : dialogue exchange : word : letter`

The decoded characters are:

| Entry | GEB chapter | Character |
|---|---|---:|
| `3PI:6:1:3` | Three-Part Invention | u |
| `LML:1:1:1` | Little Harmonic Labyrinth | t |
| `3` | literal digit | 3 |
| `ETOATS:19:9:1` | Edifying Thoughts of a Tobacco Smoker | q |
| `...AF:5:3:1` | ... Ant Fugue | t |
| `AMO:13:10:1` | **A Mu Offering** (dialogue, p. 231) | z |
| `CC:8:6:1` | Crab Canon | b |
| `CBIA:3:7:2` | Canon by Intervallic Augmentation | r |
| `CFAF:5:23:6` | Chromatic Fantasy, And Feud | v |
| `SPR:1:8:1` | Six-Part Ricercar | s |
| `7` | literal digit | 7 |
| `C[1]:4:5:3` | Contracrostipunctus | d |
| `AWDV:6:2:1` | Aria with Diverse Variations | t |
| `C[2]:2:17:5` | Contrafactus | v |
| `SC:3:17:1` | Sloth Canon | z |
| `AOGS:2:8:1` | Air on G's String | p |

### Coordinate-selected exchange audit

The signed 2014 message supplies the coordinate tokens; the pinned community archive README lists 14 dialogue-coordinate entries in total. This bounded audit checks only the six exchanges selected by the coordinates in #2581, within six of those chapters; it does **not** read or assess the complete dialogue chapters. I checked the six exchanges against the pinned 2014 OCR blob (Git blob `da652686147aa1c8585be659c89d0db60c831571`, at archive commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`). The abbreviated phrases below identify the selected word without reproducing the passages.

| Coordinate | Correct dialogue locus and selected word | What the selected exchange contributes |
|---|---|---|
| `3PI:6:1:3` | *Three-Part Invention*, Tortoise; “Your” → **u** | Agrees that Zeno's impossible flag can nevertheless be beautiful; no executable rule. |
| `LML:1:1:1` | *Little Harmonic Labyrinth*, Tortoise; “This” → **t** | Describes the Ferris-wheel ride as apparent motion without progress; no state machine or grammar. |
| `ETOATS:19:9:1` | *Edifying Thoughts of a Tobacco Smoker*, Achilles; “quite” → **q** | Praises Bach's phrasing (“quite pleasin'”); no encoding or transformation. |
| `...AF:5:3:1` | *... Ant Fugue*, Anteater; “the” → **t** | Identifies the nested picture as “REDUCTIONISM”; semantic interpretation, not a reversible mapping. |
| `AMO:13:10:1` | *A Mu Offering*, Achilles; “Zen” → **z** | Announces that he is studying Zen Buddhism; no operation. |
| `CC:8:6:1` | *Crab Canon*, Tortoise; “But” → **b** | Describes one theme going “backwards and forwards”; this is the only selected exchange that names a formal reading operation. |

**Correction:** `AMO` means *A Mu Offering* (the dialogue beginning on p. 230/231), not *Introduction: A Musico-Logical Offering* (the separate opening essay, p. 3). The earlier table's title was wrong. The 2014 archive README explicitly maps `AMO:13:10:1` to the 13th exchange of *A Mu Offering*, Achilles, word 10 “Zen”.

Among these six coordinate-selected exchanges, only the Crab Canon line explicitly suggests retrograde: for a finite sequence (x=(x_1,\ldots,x_n)), (R(x)=(x_n,\ldots,x_1)). This is a reversible permutation, not a value-changing cipher, key schedule, prime-exponent encoding, or rule for combining two voices. None of the other five selected exchanges describes such a mechanism. No prime-exponent encoding occurs at any of the six selected loci.

The natural original-LP2 candidate for the Crab Canon is the paired p13 line structure together with the visible `FOLD` on p14. That candidate is already tested against the original images in [the p13–p14 Crab Canon source-selector decision](lp2-p13-p14-geb-crab-canon-source-selector-decision.md): the first and last six p13 lines each contain 136 runes, but literal forward/retrograde halves agree at only **4/136** positions; five of six corresponding line-pair lengths differ. The physical fold leaves four unpaired glyphs on each side, and the report records the failed p14/p15 continuation tests. Thus the only obvious source-motivated reverse prediction fails on the original unit. The GEB exchange supplies no second operator for combining the voices, no treatment of the overhangs, and no LP2-specific key/alphabet. The p14 word `FOLD` is suggestive but does not fix those missing choices.

These six coordinate-selected exchanges alone do not recover an executable LP2 decipherment. The complete dialogue review below identifies additional operations and tests the complement extension of the Crab Canon.


### Complete selected-dialogue review (Director #2581, 24 November 2026)

The period archive's OCR blob [`da652686147aa1c8585be659c89d0db60c831571`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt) was obtained via its Git object rather than by repeating the six-coordinate excerpt search. The following are the six complete dialogue bodies in the archive, bounded by the next chapter heading; the line ranges are one-based in the pinned OCR, and figures are assessed through their text/captions (not a fresh scan of the typeset figures). OCR errors in isolated lines do not authenticate an exact typeset book-code. No other chapters were used as a key corpus.

| Complete dialogue | Printed pages / OCR body lines | Literal operation or formal model and LP2 selection gate |
|---|---|---|
| Three-Part Invention | 29–32 / 1682–1923 | Zeno's diminishing-distance sequence (initial ten rods, then one rod) and recursive halving; the flag depicts zero as a ring. These describe geometric iteration, not a finite message encoding. LP2 has no independently selected distance register, dyadic split convention, termination or lost-bit rule. |
| Little Harmonic Labyrinth | 103–126 / 5632–6904 | Push/pop has explicit inverse context semantics (one pop per push); a recursive acronym expands by appending a fixed phrase; a nested musical modulation returns to a prior tonic, and the record groove provides a spiral reading analogy. None gives an LP2 token-to-stack-state map or reversible rune update. The red13/black-body section boundary and p15 spiral do not select distinct push/pop tokens, stored frames or a specific musical score-to-rune alphabet. The narrative's deliberate corrupt-context episode is not a recoverable state specification. |
| Edifying Thoughts of a Tobacco Smoker | 480–494 / 27086–27861 | A secret label is integrated into recorded music and a machine separates and screens it; the actual separation formula/key is intentionally unspecified. Later, a video feedback loop composes rotation, scaling, cropping and delay. Fig. 81 explicitly jokes about 13 being prime when explaining the twelve images. LP2's 13-dot markers and spirals are insufficient to select a feedback transform, carrier, registration or hidden label. |
| ... Ant Fugue | 311–336 / 17529–19071 | Explicit multi-scale visual lettering, four interleaved voices, stretto, sustained pedal note and state-dependent signals. The printed MU/holism/reductionism hierarchy has a known visible rendering, but provides no invertible rune-level symbol substitution, lane assignment, or state update for LP2. A deliberately shuffled collection of components loses the prior arrangement in the story. The Fermat parody is not a prime-exponent codec. |
| A Mu Offering | 231–245 / 13221–14092 | A particularly direct typed pipeline: phonetic transcription into four geometric symbols, successive triplets translated to local string folds via a separate Geometric Code, reverse reading using that same book, five legal axiom-like initial strings, and a terminal knot acting as negation (a double knot cancels). The dialogue explicitly withholds the complete phonetic mapping, triplet/fold lookup and manipulation rules. Its hypothetical code is not an invertible GP29 transformation; substituting a real biological codon table would be many-to-one. LP2's five red ordinals and fold imagery do not independently select four input classes, 64 ordered triplets, the codebook or terminal-knot syntax. |
| Crab Canon | 199–203 / 11016–11257 | Reverse order plus speaker exchange; Fig. 43 explicitly presents complementary DNA strands whose base ordering represents dialogue structure. Unlike simple reversal, this motivates a stationary complementary-label involution. The source-visible p13 twelve-line equal halves and next-page visible FOLD select the original pairing test below; no particular GP29 complement table is assumed. |

**New executable consequence of the whole Crab Canon dialogue:** all 29 rune labels form one connected non-bipartite graph in both the flat reverse-half pairing (136 original pairs) and physical same-column paper fold (132 original pairs). For any stationary map (f) from GP29 to an arbitrary label set and any involution (J) on labels, the required relation is (f(y)=J(f(x))) on every paired edge. An odd cycle forces a fixed point of (J); connectivity then forces the *entire* rune alphabet to the same label. Each disjoint 68-pair half of the flat pairing independently gives the same collapse. Thus even an arbitrarily secret coarse four-base DNA-style grouping is impossible unless it discards all distinction. A stationary direct rune-to-rune function can satisfy at most 36/136 flat pairs or 37/132 physical pairs. The two other exactly half-balanced 12-line pages p24/p42 give the same full-alphabet collapse under both pairings. Genuine p57-derived bijective and four-class complement plants pass, but these are simulated layouts, not independent historical double-voice examples.

[Full proof, counts, and scope](lp2-p13-p14-geb-crab-canon-source-selector-decision.md#full-dialogue-complement-graph) · [reproducer](../sims/lp2_geb_crab_complement_graph_sft.cjs).

**Decision:** the full six-dialogue scope yields real formal mechanisms, especially a stack and four-symbol triplet grammar, so the earlier six-exchange-only inference is insufficient. However, the literal complement extension is exactly obstructed on the only source-selected receiver considered here; the other formal models lack the authentic LP2 operands and codebook/state update. Do not treat literary analogies as keys. No unknown LP2 plaintext, source-selected inverse, or key was recovered. Reopen the remaining paths only for an independently recovered complete Geometric Code or source-fixed stack/label/voice receiver; this is a missing-prerequisite decision, not an exclusion of all GEB-inspired cryptography.


This gives the 16-character Tor v2 address **`ut3qtzbrvs7dtvzp.onion`**. The first-party message supplies the codes and media; the chapter mapping and extracted letters are documented in the community archive cited below. I have not independently checked every coordinate against a physical copy of GEB, and the PGP signature verification is inherited from the external signature corpus rather than recomputed in this run.

### Remaining eight coordinate-selected dialogues (Director #2596, 24 November 2026)

The signed coordinate list selects fourteen distinct dialogues. The six complete bodies above plus the following eight exhaust that set. Read the full bodies, rather than searching for keywords, from archive Git blob `da652686147aa1c8585be659c89d0db60c831571` at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`. Line coordinates below are one-based in that OCR blob, not printed page numbers. OCR is imperfect; typeset illustrations were not independently reread. The signed book-code identifies the book but does not authenticate all of its operations as LP2 instructions.

| Coordinate / dialogue | Printed pages; OCR lines | Literal operation, input/output/state, and LP2 receiver decision |
|---|---|---|
| CBIA:3:7:2 — Canon by Intervallic Augmentation | 153–157; 8161–8433 | A one-character rightward shift of all spaces reinterprets an unchanged letter tape (8215–8227); requires starting gap positions and edge convention. Separately, signed musical intervals are multiplied by 10/3 and rounded: (-1,3,-1) → (-3,10,-3) → (-10,33,-10). Integer interval sequence and starting pitch are required; rounding and modular wrap cannot simply be inverted on arbitrary inputs. The LP2 space marks do not choose this particular frame shift; the historical Bach audio selects the book, not a rune-to-pitch alphabet or LP2 receiver. Existing [word-length reframing gate](lp2-wordlength-resegment-allsecret-original-gate.md) tests different length-list rotations, not this exact gap displacement. |
| CFAF:5:23:6 — Chromatic Fantasy, And Feud | 177–180; 9613–9815 | Logical conjunction and negation operate on propositions; the narrative illustrates how joining two sentences with an inappropriate connective changes meaning. No symbol-to-proposition codec, truth assignment, or inverse is specified for LP2. |
| SPR:1:8:1 — Six-Part Ricercar | 720–742; 40605–41957 | Recurring themes on new speaker entries, recursive acronyms, initial-letter extraction (including eight-letter RICERCAR variants), and phrase-initial-to-musical-note motifs. The reciprocal programmer/program narrative illustrates role reversal, but gives no executable state transition. LP2 lacks a speaker-entry alphabet or pitch mapping. Prior [line-acrostic gate](lp2-literal-printed-line-acrostic-gate.md), [endpoint gate](lp2-original-line-endpoint-acrostic-gate.md), and [Bach source boundary](lp2-onion5-bach-musical-square-source-gate.md) already constrain literal extraction and unauthenticated musical mappings; no new selector warrants rerunning them. |
| C[1]:4:5:3 — Contracrostipunctus | 75–81; 4095–4564 | Explicit first-letter extraction, reverse-order initials and nested acrostic (4519–4542); also melodic reverse-inversion and a diagonalizing self-defeating phonograph model. The latter requires the receiver's actual architecture and corresponding destructive frequency; the book does not provide LP2 operands. Acrostic inputs require an independently specified set of lines/utterances and order; prior literal line tests already cover ordinary endpoints. No new LP2 scope or extraction layer is fixed. |
| AWDV:6:2:1 — Aria with Diverse Variations | 391–405; 21994–22929 | Prime sums/differences, explicit Collatz transition (odd 3n+1, even n/2, seeds 15 and 27), diagonal extraction followed by decrement, and a search for concealed story-ending padding. The transitions are computable on integers but Collatz is many-to-one and not a rune inverse; an initial value, output rule and stop condition would be needed. The engraved names define a diagonal in the fictional object; LP2's rectangular table has no corresponding bold diagonal selector. Padding detection describes a strategy, not a unique delimiter or payload. No independently selected LP2 seed, diagonal, or state-to-rune mapping. |
| C[2]:2:17:5 — Contrafactus | 633–640; 35745–36235 | Parameterized counterfactual channel selection and near-world addressing. It deliberately contrasts absolute-distance and powers-of-two notions of closeness (128,129,256), but supplies no channel codec or metric-to-ciphertext mapping. Matching LP2 table dimensions or numbers would not determine that missing operation. |
| SC:3:17:1 — Sloth Canon | 681–683; 38556–38696 | A reversed pitch axis and half-speed musical augmentation, implemented in dialogue as verbal inversion and timing. Reversible on a defined pitch/time coordinate system; requires axis, voice partition and time sampling. LP2 has no independently selected such mapping. This is distinct from the Crab Canon's retrograde-complement relation. |
| AOGS:2:8:1 — Air on G's String | 431–437; 24382–24800 | Quining (244xx–247xx): given string x, emit its quotation immediately followed by x itself. The inverse checks exact equality of the two consecutive copies and removes the quoted copy. Quotation marks in LP2 define a concrete receiver class, although not an authenticated instruction to quine. This is the single new executable transfer selected below. |

#### Exact quote-adjacent quine gate

[Pre-test lock](https://github.com/FlareZ123/liber-primus/issues/2596#issuecomment-7138508341): use the seven fixed spans in `resources/liber-primus/lp2-quote-punctuation-spans.json` and only the immediately following equal-length unquoted rune block. Exclude the 68-rune p42 quote because it is immediately followed by the separate 160-rune quotation. No offset/length scan. This is a different repeated-text hypothesis from the [p40/p53 shared-prefix study](lp2-quote-prefix-length-crosslink.md) or external literary quote/key search.

Let A,B be the two aligned n-rune ciphertext blocks, and q the historical key period (8 or 13). For an arbitrary GP29 key K, the authentic transparent plaintext F rule enciphers plaintext zero to zero without consuming a key digit. Consequently a held position can occur only where A[i]=B[i]=0. Enumerate every subset H of those aligned positions. The second occurrence begins m=n-|H| consuming steps after the first, with phase r=m mod q. For non-held positions with consuming index j, exact equality of plaintext requires

`K[(j+r) mod q] - K[j mod q] = B[i]-A[i] (mod 29)`.

Also exclude K[j]=A[i] and K[j+r]=B[i] for consuming positions; otherwise the plaintext would be F and the assumed clock wrong. These difference equations form a graph: assign relative potentials by component traversal, reject inconsistent cycles, then count all 29 possible root offsets minus the union of forbidden values. The product gives the exact number of compatible keys for each mask, with no language assumptions. Arbitrary entry phase is absorbed by rotating the arbitrary key. First ceil(n/2) aligned pairs constrain the candidate family; remaining pairs independently test it. Mask enumeration uses the full publicly observable double-zero structure, so the latter is a held-out relation test, not a blind ciphertext prediction from prefix alone.

The [reproducer](../sims/lp2_geb_quine_fhold_original_sft.cjs) also verifies that the complete transcript's first 12,956 runes match the canonical corpus. Two synthetic positive controls repeat the first 48 actual plaintext runes of LP2 p57 under the historical q8 DIVINITY and q13 CIRCUMFERENCE keys. The true planted key/plaintext appears in both exact candidate lists, including a held F at index 33; each has ten compatible key/plaintext pairs, demonstrating why exact equality alone does not identify the authentic key.

| Original quote [start,end) | n | q8 prefix → full keys | q13 prefix → full keys | Printed gap shape matches? |
|---|---:|---:|---:|---|
| [1659,1677) | 18 | 0 → 0 | 510300 → 0 | No |
| [5459,5478) | 19 | 0 → 0 | 16464 → 0 | No |
| [9715,9727) | 12 | 0 → 0 | 13680936383 → 17 | No |
| [9811,9869) | 58 | 0 → 0 | 0 → 0 | No |
| [10211,10279) | 68 | ineligible | ineligible | Next block is quoted |
| [10279,10439) | 160 | 0 → 0 | 0 → 0 | No |
| [12522,12592) | 70 | 0 → 0 | 0 → 0 | No |

Counts are mask/key pairs. The longest quote has two possible masks (one double-zero at relative index 72); all other eligible spans have one. Eleven of twelve eligible period/span combinations have no algebraic solution even allowing arbitrary word segmentation. The shortest quote admits 17 key/plaintext pairs at q13, all of which the SFT explicitly re-enciphers; no coherent native English reading is established. Its printed internal gaps are [3] versus [5,9], and the second block ends inside a printed word. All six eligible receivers have different internal gap shapes. Thus **no literal punctuation-preserving repeated quotation survives**, even before a language judgment. If word segmentation is independently altered, the short q13 candidate family remains algebraically possible but does not identify a key or meaningful text. There is no original-derived key for any longer span.

**Decision:** the full fourteen-dialogue coordinate set is now audited for formal-operation transfer. The one new selected receiver yields a bounded negative, not a solution. Do not expand the GEB branch into generic recursion, arbitrary offsets, musical encodings or quote hunting without a new independent LP2 selector. Gap shift, interval scaling, Collatz and diagonalization are documented source mechanisms with missing LP2 operands/serialization, not authenticated instructions or broadly excluded cipher families.

## What the destination returned

The archived Onion6 page at `ut3qtzbrvs7dtvzp.onion` contains four plaintext manifesto pages and an instruction to create a Tor hidden service that accepts CGI uploads, then submit the three magic squares and the service URL; it says to work alone. The archived form posts to `/cgi-bin/upload`, names the file field `file`, and exposes the public key at `/key.asc`. This establishes the intended 2014 continuation as an interactive hidden-service submission, not merely a static page.

After the square submission, three additional pages were returned. The first two are decrypted in the historical archive with the Vigenère key **`FIRFUMFERENFE`**, with selected F runes marked by a preceding colon (`:`) to hold the key index, and the key continuing across the page boundary; the third page is plaintext and includes **“Question all things. Discover truth inside yourself. Follow your truth. Impose nothing on others.”** The key is `CIRCUMFERENCE` with C replaced by F. The phrase **“PROGRAM YOUR MIND / PROGRAM REALITY”** occurs in the Onion6-era material and should not be treated as a newly discovered LP2 key.

### Exact two-page marked-F positive control (23 November 2026)

The archived post-square ciphertext pages **107** and **167** contain **226** and **93** runes. The two literal colon characters in page 107 occur at character offsets **68** and **82**, immediately before GP rune offsets **49** and **58**; both following runes are F. With the documented 13-rune key **FIRFUMFERENFE**, subtracting the current key symbol and leaving only those two explicitly colon-marked F runes literal gives:

- page 107 consumes **224** key symbols and ends at phase **3**;
- page 167 starts at phase **3**, continues the same clock, and the full two-page stream consumes **317** key symbols;
- the resulting GP-label string matches the archived corrected-Roman witness exactly after the explicit orthographic normalizations **K→C**, **V→U**, and **DURING→DURNG** (the latter reflects the single GP graph NG).

Resetting the key at page 167 or consuming either marked F fails the witness comparison. This is a reproducible historical positive control for a **source-marked, non-consuming F** rule, not evidence that the same key transfers to LP2.

The two colon markers are also visible in the archived original JPEGs, not only in the runic transcription: [page 107](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/107.jpg) has the small colon glyphs on printed lines **3** and **4**, each immediately before F; [page 167](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/008-sixth-onion/167.jpg) has no colon markers. Their Git blob SHAs at that pinned archive commit are `6105b54496b5afc48c80b83f786f41499b57f2d9` and `32952b7d28028f5fedffceace4de0e7eb688d3d6`, respectively. The images are archive mirrors, not separately PGP-signed page payloads; retain the archive's source caveat.

[Exact control and LP2 marker-census SFT](../sims/2014_onion6_explicit_colon_fskip_lp2_marker_census_sft.cjs).

The signed hidden-service reply points to **`ky2khlqdf7qdznac.onion`**. The archived Onion7 page lists images 0–57; this is the 58-image LP2 release corresponding to the corpus analyzed in this repository. This connects the 2014 submission path to the later LP2 dump, but it does not supply the missing decryption key or plaintext for pages 0–55.

## Direct transfer test to LP2

I tested whether the 2014 Vigenère key itself transfers to the 56 unknown LP2 pages. The historical `Gematria.key_to_shifts("FIRFUMFERENFE")` mapping gives the shift vector `[29,19,25,29,28,10,29,11,25,11,20,29,11]`, i.e. modulo 29:

`[0,19,25,0,28,10,0,11,25,11,20,0,11]`

Applied in standard GP29 order to LP2 pages 0–55, continuous or page-reset, with or without treating every F as transparent, and in both signs, it produces no native prose. The historical 2014 pages use **selected, explicitly marked F skips**. A fresh source-image census finds no literal colon in LP2: seven small punctuation events immediately before F are the ordinary ⁘ full-stop class, and no ⁚ comma event precedes F. There are, however, **two unique large red 13-dot section marks immediately before F at page starts p15 and p40**, at global rune offsets **3603** and **9640**. These are the only page-start F runes, and both are preceded by a red13 mark. This is a reproducible *candidate* selector, but not an authenticated F-skip instruction: red13 is a general section delimiter (the p0 red13/body boundary precedes TH, and other red13 marks precede non-F runes).

The only directly source-selected key candidate in the p0 construction is its 13-red-rune title, **SHEOGMIAFSYENGC**. Using it as the 13-symbol Vigenère key, starting after the p0 red13 boundary and holding only the two red13-marked page-start F runes, produces no recognizable plaintext under either additive sign. This rejects only the untransformed title-as-key hypothesis; it does not prove that the red13 candidate could never select a skip for some independently sourced key. The exact positive control, marker census, and bounded title-key test are reproduced in [the source SFT](../sims/2014_onion6_explicit_colon_fskip_lp2_marker_census_sft.cjs). The direct key-transfer hypothesis is rejected; this does not reject other uses of the historical F-skip precedent.

## Sources

- First-party signed-message archive: [Dukotah/cicada3301, 2014 Onion5 PGP message](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc).
- Signature timeline: [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json).
- Book-code decoding and historical chain: [cicada-solvers, 2014 fifth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/README.md).
- Onion6 pages and upload instruction: [cicada-solvers, 2014 sixth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md); [archived Onion6 post](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ut3qtzbrvs7dtvzp.onion/post/index.html).
- Post-submission pages and Vigenère procedure: [cicada-solvers, square-submission pages](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/009-squares-submission-pages/README.md).
- Signed Onion7 handoff and LP2 release: [cicada-solvers, hidden-service reply](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/010-hidden-service-reply/README.md); [archived Onion7 post](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/ky2khlqdf7qdznac.onion/post/index.html); [cicada-solvers, seventh onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md).
