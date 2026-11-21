# LP2 p0–2: 156-word self-indexed map and unique 23-cycle

**Status: intermediate structural finding. No unknown plaintext, key, cipher, or destination has been recovered.**

## Competing inclusive 158-word map (Agent27, 18 November): count choice does not select a key

The 156-body-word graph described below excludes the two red title words; counting those two visible p0 words yields a separate 158-printed-word inventory. The alleged 2013 COUNT selector is now resolved as a false association: the 7 January 2013 IRC transcript's ab=158 is a participant's test of the literal phrase ab through the first-onion count [phrase] command. At line 3940, soulseekah reports a=97*, b=61+, and ab=158; at line 3942 the same participant says “so it did add them up”, then repeats 97+61 at line 3985. Thus 158 is the additive GP value of the two letters, not the number of printed LP2 words. The 2013 transcript is participant testimony, not a Cicada-signed LP2 instruction or raw server response. The separate AfndPJa0 Pastebin is a nine-phrase record and is not the source of ab=158. The inclusive 158-word map remains an analyst-defined alternative; no first-party source selects it over the 156 body-word convention.

With both red words treated as addressable cells, apply the *same* self-indexing formula `f(i)=GPprimeSum(word_i) mod 158`, with source word order and zero-based addressing. The two red heading sums347/315 select one-based **cells32 and158**. The red-title **second** GP-prime sum **315 = 2×158−1** exactly, hence its residue selects the *final* word cell158; the first red title's sum difference **347−315=32** exactly selects its own first word cell32. A second, distinct original body word, **cell109**, also has sum315, and the first track visits it before merging into the second title's cell158. This is an exact, post-observation self-indexing arithmetic alignment across title count, source word count, and route. The 2013 ab=158 COUNT observation is now known to be an unrelated literal-phrase GP-sum test, not an independent link to this map. Neither the graph nor its 5-cycle identifies a cipher/key or establishes creator intent. Two of 158 opening words have prime sum315 (heading cell2 and body cell109). The first track is `32→116→75→109→158→54→56→148`; the second starts at `158→54→56→148`. Both enter the common 5-cycle **148→15→127→64→83→148**. The functional graph has cycles with lengths `[1,1,1,1,2,2,5]`; the five traversed original ciphertext words have GP-prime sums **[488,126,379,240,147]** and rune lengths **[10,2,7,4,3]**, totaling 26, exactly twice the original red-title rune count13. The alignment is post-observation and supplies no source-authorized key consumer.

A page-stratified **100,000-trial deterministic shuffle** of all nonheading words (group lengths57,62,37) with both heading sums fixed produces: the first pointer reaches the second seed in at most four steps in **4,740** cases; both seeds reach the same five-cycle in **4,458**; both selected outcomes in **322** (0.322%). These are targeted feature-selection controls and do not constitute a globally corrected authorship probability. Compared with the 156-body rule's 23-cycle/563/569 alignment, changing only whether the heading belongs to the map changes the entire proposed route. No first-party rule chooses between these alternatives.

To test an immediate authentic LP1/LP2-style cipher consumer, take the common five-cycle's *whole word prime sums modulo29* as a repeated additive key **[24,10,2,8,2]**. On 716 unchanged original p0 black runes, the two GP29 decoding signs yield normalized IoC×29 **1.011380** and **0.987702** (near uniform, no coherent prose). The independent 76 original p55 runes give **0.946316** and **1.129474**. Replacing the key by the concatenated **26 original GP runes** from the same five source words likewise gives p0 black normalized IoC **0.989288/0.992913**, p55 **1.027719/1.139649**, and no readable plaintext. All direct inverses exactly re-encrypt their input, which is a correctness check only. They do not rule out every possible interpretation of the graph, but **these four finite source-derived direct operations fail as plaintext consumers**.

An independent source-window transfer using the *same prime-sum self-pointer*, each chapter's own printed word count and its first two words as seeds yields shared eventual cycles in only **5 of 8 original unsolved chapters**; the remaining three terminate on different cycles. The shared-cycle lengths among the passing chapters vary (5, 37, 26, 2 and 2). Since later chapters need not have two red title words, this is a deliberately broad structural holdout, not a strict title-seed falsification; it supplies **no evidence of a universal 5- or 23-cycle instruction**. The exact cross-section checks are incorporated in the same SFT. 

**Decision:** preserve the fixed pointer mathematics, and treat 156 versus 158 as a real **missing authorial selector**. The 23-cycle is not a unique input-mandated decoder and the five-cycle is not a better decoder. Resist searching more free moduli, key shifts or route permutations until a first-party cue actually fixes the address space, source-key operation and next ciphertext location. [Exact 158-word SFT](../sims/lp2_p0_count158_wordpointer_original_sft.cjs) passed [Windows Node22 run 44374693056](https://github.com/FlareZ123/liber-primus/actions/runs/44374693056); the earlier [156-word SFT](../sims/lp2_13x12_wordmap_23cycle_source_gate.cjs) remains reproducible.

## Question and prior observation

The 2016 signed message frames words as a map, their meanings as a road, and their numbers as directions. An external 27×27 proposal already observed that the canonical p0–2 transcription contains 158 complete words and that removing the two red heading words leaves 156=13×12. This report does **not** claim that factorization as new. See the external [strongest-plaintext-evidence note](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/strongest-plaintext-evidence.md).

The dimensions have plausible selectors: the red heading contains 13 runes, while LP1 p05 explicitly elevates the totient function, and φ(13)=12. The new test is whether the 156 body words form a source-indexed pointer map.

## Reproducible construction

Inputs: `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and canonical parser `sims/lp2_word_pages.cjs`.

Run from repository root:

```sh
node sims/lp2_13x12_wordmap_23cycle_source_gate.cjs
```

The script parses the first three physical page segments using the repository's canonical word parser. It returns 158 complete words and 729 runes. The first two words are the red heading; their combined rune count is 13. Removing those two words leaves 156 body words. For each word w_i, calculate its Gematria Primus prime sum S_i using the corpus `prime` array, and define the zero-based pointer:

`f(i) = S_i mod 156`.

The two heading words seed the map using the same rule:

| Heading word | GP prime sum | Zero-based seed | One-based body-word cell |
|---|---:|---:|---:|
| first red word | 347 | 35 | 36 |
| second red word | 315 | 3 | 4 |

The first seed follows **36 → 56 → 113 → 6**, then enters a 23-cycle. The second seed, cell 4, lies directly on that same cycle. The complete functional graph has exactly two cycles, of lengths **23** and **2**. The 23-cycle is unique.

The cycle, rotated to the entry reached by the first red heading word, is:

| Cycle step | Body-word cell (1-based) | GP prime sum |
|---:|---:|---:|
| 1 | 6 | 220 |
| 2 | 65 | 111 |
| 3 | 112 | 34 |
| 4 | 35 | 336 |
| 5 | 25 | 119 |
| 6 | 120 | 3 |
| 7 | 4 | 563 |
| 8 | 96 | 170 |
| 9 | 15 | 67 |
| 10 | 68 | 209 |
| 11 | 54 | 463 |
| 12 | 152 | 108 |
| 13 | 109 | 244 |
| 14 | 89 | 569 |
| 15 | 102 | 128 |
| 16 | 129 | 237 |
| 17 | 82 | 323 |
| 18 | 12 | 618 |
| 19 | 151 | 277 |
| 20 | 122 | 419 |
| 21 | 108 | 139 |
| 22 | 140 | 143 |
| 23 | 144 | 473 |

The body words with sums **563** and **569** are each unique in the 156-word map, and both lie in this cycle. They occur at cycle steps 7 and 14. The 563 word is also the second red heading word's seed cell.

## Independent source correspondences

- The p57 original-image census records the manuscript's red 23-dot mark; the p57 text also explicitly invokes shedding circumferences. This is a plausible selector for the unique 23-cycle, not proof that the creator intended this graph. See `im-results/lp2-original-dot-punctuation-physical-census.md` and `im-results/lp2-p57-literal-word-circumference.md`.
- The 2016 signed image is 563×569. The independently examined p32 11×11 rune grid has top-row and first-column GP-prime sums 563 and 569. The p32 tree artwork is **not** the same artwork as the signed 2016 image; this is a numerical correspondence, not an image-identity claim. See `im-results/lp2-tree121-signed2016-source-gate.md`.
- As a further, unvalidated direct lookup, 563 mod 121 = 79 and 569 mod 121 = 85 select zero-based p32 cells 79 and 85 (one-based cells 80 and 86), whose transliterations are H and S. This is a possible bridge, not plaintext.
- A full 22-axis p32 prime-sum check yields a third exact 23-cycle intersection: **p32 column 7** (zero-based column6) sums to **463**, matching cycle step11 and original p0–2 body word54. However, the fourth candidate 2013-DH value **499** (p32 column11) occurs **nowhere** among the original 156 p0–2 body-word sums, including the separate two-cycle. This blocks the appealing stronger theory that the complete prior exploratory p32 DH tuple `(563,569,463,499)` is carried as word-prime sums by the opening pointer map. The three numeric correspondences are source-exact and their intended role is still unproved; without 499 and a first-party receiver, no DH value or key is recovered. [Existing exploratory p32-DH report](p32-dh-image-dimensions-parameter-test.md).

## Permutation diagnostic

A deterministic 1,000,000-trial null shuffles the 156 body-word prime sums **within their original starting-page groups** (sizes 57, 62, 37), preserving each page's sum multiset and the two red-heading seeds. Only **93 / 1,000,000** shuffled orderings produce both (a) the two seeds reaching the same 23-cycle and (b) both unique values 563 and 569 lying on that cycle.

This is a targeted permutation diagnostic, **not** a globally corrected p-value. It does not account for searching other moduli, pointer rules, map sizes, or other numerical correspondences. The 13×12 count was already public prior work; the new evidence is the particular prime-sum pointer graph and its source-linked cycle.

## Original full-cycle compass continuation: stopped by missing instructions (Agent25, 17 November 2026)

The numerical pointer cycle itself remains exact. The **optional** p50→p32 compass continuation, however, has no author-selected direction-bit allocation, initial cell or stopping rule. The signed January 2016 message says that words, meanings and numbers supply map/road/direction; its image contains signed text over a faint tree. The archived source record documents that the 2016 image's leafless tree and the p32 blurred tree are **different stock artwork**, and the printed p32 page is not an 11×11 diagram. The 121-ciphertext-rune square and toroidal addressing are reconstructed conventions. No first-party source selects `sum mod256`, `byte & 7` as compass direction, `byte >> 3` as distance, N-first clockwise directions, toroidal wrap, or p32 H as the entry. The 32×8 native p50 table shape makes a five-bit/three-bit interpretation conceivable but supplies neither compass orientation nor a decoding instruction.

### Direct p0-red-heading → p50 table-key interpretation (Agent2, 17 November)

A direct use of the p0 red-heading sums 347/315 modulo256 as endpoints in the 32×8 p49–51 table yields a five-cell vertical path. Both zero-based and one-based indexing conventions, and both GP29 additive signs, fail the original plaintext-F-transparent inverse inside p0; ordinary no-skip IC remains at the uniform baseline. Full cell values, keys, first-impossible positions and positive controls are consolidated in [the p0 red-primecount/p32/p50 source-navigation report](lp2-p0-red-primecount-p32-p50-source-navigation.md) and [the source-native SFT](../sims/lp2_red_heading_p50_column_key_sft.cjs). This rejects only the direct five-symbol additive receiver, not other p50 uses.

The previously published prototype in [the original self-indexed-map SFT](../sims/lp2_13x12_wordmap_23cycle_source_gate.cjs) uses that one explicit convention, starting from p32 zero-based cell33 (H). **Inspect the whole 23-step original route**, without stopping retrospectively on the midpoint X:

| Step | Source word GP prime sum | p50 address0 | p50 byte | p32 cell0 | Read rune |
|---:|---:|---:|---:|---:|---|
| 1 | 220 | 220 | 58 | 40 | S |
| 2 | 111 | 111 | 115 | 76 | W |
| 3 | 34 | 34 | 197 | 96 | S |
| 4 | 336 | 80 | 142 | 90 | NG |
| 5 | 119 | 119 | 184 | 79 | H |
| 6 | 3 | 3 | 186 | 80 | EO |
| 7 | 563 | 51 | 59 | 43 | D |
| 8 | 170 | 170 | 254 | 34 | O |
| 9 | 67 | 67 | 192 | 12 | W |
| 10 | 209 | 209 | 175 | 24 | B |
| 11 | 463 | 207 | 21 | 44 | NG |
| 12 | 108 | 108 | 14 | 54 | X |
| 13 | 244 | 244 | 22 | 52 | N |
| 14 | 569 | 57 | 118 | 49 | A |
| 15 | 128 | 128 | 201 | 19 | IA |
| 16 | 237 | 237 | 32 | 96 | S |
| 17 | 323 | 67 | 192 | 74 | H |
| 18 | 618 | 106 | 31 | 38 | W |
| 19 | 277 | 21 | 137 | 88 | T |
| 20 | 419 | 163 | 82 | 98 | J |
| 21 | 139 | 139 | 13 | 108 | L |
| 22 | 143 | 143 | 152 | 20 | OE |
| 23 | 473 | 217 | 219 | 69 | IA |
The walk requires the extra torus convention immediately: after the first E7 move from (row3,col0) to (3,7), the second SE14 move would exit an ordinary 11×11 square at (row17,col21). Only the **unprinted modulo11 wrap** returns it to cell76. The resulting GP transliteration is `S W S NG H EO D O W B NG X N A IA S H W T J L OE IA`; it contains no complete typed instruction, address or plausible key. The sole encountered X is the already-known step12 p32 cell54, not the original contiguous HOME-X endpoint at cell37. The full traversal ends on **p32 cell69 = IA**, not X.

**New algebraic discriminator: the apparent two-red-heading endpoint agreement is automatic.** The step transition is addition of a vector `v_i = (dr_i, dc_i) × (byte_i >>3)` in the abelian torus `(Z/11Z)^2`. For the 23 unchanged source words, the integer displacement sums are exactly `(-85,+14)`, hence `(+3,+3) mod11`. From p32 H at zero-based cell33 = row3,col0, **every** permutation of the 23 steps must finish at row6,col3 = cell69, including the other authentic red heading's **cycle-step7** entry. Indeed that second start rotates the same sums six places and gives route runes `A B B A C IA U AE B A T U N D X U TH F B S H X IA`; its step12 is U at p32 cell112, yet its step23 is the same IA at cell69. The shared endpoint is a mathematical invariant of toroidal vector addition and **cannot serve as an independent manuscript prediction**.

The midpoint X is a retrospective stop choice (the other red heading's step12 is not X) and one of five X glyphs in p32's 121 original runes. The preceding 93/1,000,000 null result was conditional on the separately chosen 23-cycle/563/569 features and does not turn the multi-hop compass semantics into authored instructions.

**Distinct 23-hop raw-heading control (Agent25, same date).** A second, source-natural interpretation counts **23 source pointer hops directly from each red-heading seed**, without silently discarding the first seed's three pre-cycle words. The first red word starts at body cell36, taking prime sums `367,268,317` before entering the cycle; the second starts at cell4 and immediately traverses the cycle. Keeping the **same previously fixed** p50 5+3 compass and p32 H-start torus, the first route gives

`IA W P AE W G TH N AE U IA G G E OE M H E G E L X W`

and the second gives

`A B B A C IA U AE B A T U N D X U TH F B S H X IA`.

Both reach *some* p32 X at **step22**, but **different** original X cells (zero-based **61** and **68**), and they finish at **W/cell60** versus **IA/cell69** at step23. The second also reaches an X at step15/cell61; the first has no other X. This is a new coincident penultimate-X observation for **two different 23-word multisets**; the commutative-endpoint theorem above does **not** explain it.

To measure the relevant degree of postselection without repeating the original million-shuffle pointer-cycle test, [the source-complete raw-heading 23-hop SFT](../sims/lp2_wordmap23_twoheading_rawseed_source_sft.cjs) fixes both original pointer tracks and p32's five X positions, then permutes the **unchanged 256 original p50 byte values globally** 100,000 times (seed `0x2113301`). **4,017/100,000** permuted tables yield an X on *some same step* for both headings, and **178/100,000** yield a same-step X specifically at step22; the latter is a **post-hoc** penultimate-point rate and cannot be used as a preregistered p-value. The more appropriate scan-wide null is about **4.02%** before accounting for search across compass split, orientation, start and stop, all still unsourced. A matched-value synthetic table of constant byte34 correctly sends p32 H at index33 to the actual HOME-X glyph at index37 on step1. The two complete 23-step readouts remain nonprose, with no recovered key or authenticated endpoint. This extra raw-heading interpretation is retained as exploratory evidence, **not** a revival of the compass decoder.

**Decision for Director #1361:** retire the conjectural **23-cycle→p50 byte bit-split→toroidal p32 compass** *decoder* absent a new independently dated first-party compass opcode or predeclared destination test. Preserve the exact opening 23-cycle and 563/569 checksums separately, with their explicit retrospective selection limits. A second red heading, reordering the commutative steps or stopping at an attractive intermediate X supplies no additional cryptographic evidence. No unknown plaintext or key has been recovered.

## Bounded direct terminal p55 inverse from the original cycle (Agent22, 17 November)

The opening red heading's GP-prime-sum rule yields 23 cyclic *body-word prime sums*:

```text
220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473
```

There is a simple direct key consumer that does not require the exploratory p50 compass or a hidden alphabet: the authentic known p56 GP29 additive rule and transparent plaintext-F. Take **each one of the 23 word sums modulo 29** to obtain exactly 23 GP key symbols. Repeat them against the **76 original p55 ciphertext runes** in their printed order. Try the two independently headed starts: the first red word enters the 23-cycle at body cell6; the second red word starts at body cell4, step7 of that same cycle (zero-based key rotation6). Both documented GP addition signs are finite controls, giving **four** entire original-cipher key/operation decisions. No fitted key phase, table offset, phrase or trigram screen determines the key.

The F-transparent inverse retains every legal state: plaintext F must emit ciphertext F **without consuming** the next key symbol, while ciphertext F may also be an encrypted non-F rune and consume a key. This is stricter than ordinary GP29 addition and captures all eight possible transparent/consumed choices for the three p55 ciphertext Fs.

| Author-derived cycle starting point | GP inverse sign | Earliest F-rule contradiction at zero-based p55 rune | Full legal inverse paths | Direct no-bypass GP IoC |
| --- | --- | ---: | ---: | ---: |
| First red heading, 23-cycle entry | Subtract | none | 1 | 0.03438596 |
| First red heading, 23-cycle entry | Add | **6** | 0 | 0.04035088 |
| Second red heading, cycle step7 | Subtract | **1** | 0 | 0.03298246 |
| Second red heading, cycle step7 | Add | **6** | 0 | 0.03087719 |

The sole fully legal candidate (first-heading, subtraction) consumes **74** of the cyclic key symbols. Its 76-rune recovered GP-index stream has IoC **0.03543860**, near the uniform-ciphertext baseline, and reads in unpunctuated native GP transliteration:

```text
RUXOEREOCEINPXJPPFOELHEBPGHJCNOETIAOEBEASNGLWYJOENFHNGEAJXNJDCEJOOOEGGOIGYMBUMDGJTXDGEOUW
```

This is no coherent GP-native original plaintext. Its **exact forward reencryption** is expected for any legal wrong key and is verified, so a round trip is not evidence of a solution. A separate genuine solved-p57 **76-rune plaintext** is planted with each exact key/sign and recovered among all legal inverse states in **4/4** source-native positive controls. The test operates on all 76 original p55 runes, reproduces the 729-rune 158-word first-three-page parse, red word sums347/315, 156-word pointer rule, both original cycle starts, all printed F positions and its fixed sign decisions.

### A second, image-dimension-anchored 23-rune receiver

The source graph's **563** and **569** word-prime sums occur at cycle steps 7 and14. They independently equal the GP-prime sum of the **top row and left column**, respectively, of the original **11×11 p32 rune grid**. These also match the 563×569 dimensions of Cicada's 2016 signed image, a numerical correspondence recognized before this receiver was constructed. Consequently a human-visible alternative to using each 23-cycle sum directly as a GP shift is to take its remainder modulo **121** as an address in the original p32 grid, collecting **23 ciphertext rune indices** as a possible key. This original first-three-page→p32 chain is an *inferred source operation*; neither the original image nor the signed text explicitly says to use a modulo121 lookup or p55 receiver.

The only address convention controls are **zero-based remainder** `S mod121` and **one-based cell count** `(S−1) mod121`. For each, use the first or second red heading's exact starting cycle step, both arithmetic signs, the same authentic p56 transparent-plaintext-F rule, all p55 F branches, and no key fitting. This is **eight** source-fixed, full-76-rune exact inverse tests; all eight separately recover a 76-rune planted solved-p57 passage under their matching key and sign.

| p32 address count | 23-cycle start | GP inverse | First impossible original p55 rune (zero-based) | Full legal paths |
| --- | --- | --- | ---: | ---: |
| Zero-based | first heading | subtract | 37 | 0 |
| Zero-based | first heading | add | 67 | 0 |
| Zero-based | second heading | subtract | 65 | 0 |
| Zero-based | second heading | add | 0 | 0 |
| One-based | first heading | subtract | 56 | 0 |
| One-based | first heading | add | none | **1** |
| One-based | second heading | subtract | 10 | 0 |
| One-based | second heading | add | 24 | 0 |

The one surviving **one-based/first-heading/add** inverse is entirely legal and reencrypts to the unmodified original, but reads as incoherent GP transliteration:

```text
OEAIAIAPJECCBJWAEPNJITHLNGMXEAEATHFOEIAAEYGRDDMPNGYWNAEFAJEADMPINGEDLTHTNUXUOLYSRBGPGDNGEOERAEGT
```

Its legality is an expected property of a possible wrong additive key, not confirmation of the rule.

**Decision:** Both direct source-cycle candidates and the additional p32-addressed source-cycle key fail to recover p55 plaintext. Across **twelve** complete source-fixed inverse/sign/address cases, **two** are fully syntactically legal under the authenticated F rule, and neither is readable GP prose. This retires the specific 23-period direct key and zero/one-based p32 lookup consumers, while preserving the original 23-cycle observation as a provisional possible key source. Further arbitrary rotations and compound transforms need a fresh author-authenticated clue. [Node22 original-input SFT](../sims/lp2_wordmap23_cycle_p55_native_inverse_sft.cjs) · [Windows original-source workflow](https://github.com/FlareZ123/liber-primus/actions/runs/44086567597) (previous 4-case revision queued) · [later 12-case workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/agent22-prime-even-rune-original-manual.yml) (manual dispatch queued; verify final result before treating as CI-passed).

## Literal p57 PARABLE "within" receiver on the 23 original cycle words (Agent45, 17 November)

A new, *nonarithmetical* consumer of the original word cycle is motivated by the authentic clear p57 instruction to **shed circumferences and find what lies within**. The 23-cycle already fixes the *exact* p0–2 body-word positions and their order. Take their printed GP29 runes unchanged. A word's circumference is its first and last rune, so one literal operation removes those endpoints and concatenates the remaining runes of the 23 cycle words in cycle order. An alternative literal "within" reading selects the central rune of each word; even-length words have two noninterchangeable central choices. No added keystream, word regrouping, symbol substitution, direction sweep, recovered spacing or tuned key phase is permitted.

All **23** cycle words total **119 original runes** and have lengths
`[4,2,2,8,5,1,11,3,3,3,9,2,5,10,2,7,6,11,3,7,3,3,9]`. Exactly **five** words have length one or two and contribute no runes after removal of both endpoints, leaving **74** inner runes. The unspaced, exact source-GP transliteration of the 74 is:

```text
BNGMJROLTHJIEWBASOEEOINGDOSOEWEAOELFEJEAFINIACYEAIXBGJPFSEOAEPTFPUNGYNGXEAEOLDHBYWCLWEADUD
```

The two independently declared 23-rune centre readouts are:

```text
Left of centre for even lengths:
BFHJJUSDOSEAOJIAEAGSUEADYWEA
Right of centre for even lengths:
NEARRJUSDOSEAAEJCWGEOUEADYWEA
```

No complete readable instruction or authentic plaintext emerges. The [read-only source-native CommonJS SFT](../sims/lp2_wordmap23_parable_within_sft.cjs) asserts the 158 original words, 729 rune positions, 347/315 heading sums, exact 23-cycle, all 119 rune sources and the 74/23/23 strings. Three planted native GP29 clear-p57 controls recover the chosen within/centre symbols exactly. They confirm the extraction semantics, **not** a historical encryption mechanism.

**Decision:** this directly tests the literal source-suggested word-interior receiver without adding arbitrary key hypotheses. It is a bounded negative for the **23-cycle → within-word instruction** route. The numerical 23-cycle and 563/569 correspondences survive as structural observations; they remain without a source-authenticated plaintext consumer. Do not introduce an unmotivated reordering or second cipher to rescue these outputs.

## Two exact whole-word/interior length receivers, original p32 and p55 (Agent24, 17 November 2026)

A distinct source-grounded geometric observation relates the *contents* of the same 23-cycle to **two** authentic original pages. This uses the already recorded [literal within-word operation](../sims/lp2_wordmap23_parable_within_sft.cjs) and p32's separately established 121-rune count; neither component is newly discovered here.

The 23 original selected words contain **119 runes** (one singleton word and four two-rune words). Removing each word's first and last rune produces exactly **74** interior runes. Original physical **p32 has 121 runes** and **p55 has 76**. The two separately identified tree-art pages are themselves **23 physical pages apart** (55−32), equalling the pointer cycle's length; their specific upright tree-image correspondence predates this test ([independent original-image registration](lp2-p32-p55-blurred-tree-correspondence.md)). This is an additional page-selection rationale, not an authenticated numerical opcode. Taking **one GP29 symbol from each of the two red opening headings** gives both exact full-length keys, without cycling or truncation:

| Source-selected readout | Length | Complete original receiver |
| --- | ---: | --- |
| Two heading-derived GP symbols + all 23 whole words in pointer order | `2+119=121` | p32, all 121 original runes |
| Same two symbols + 23 words with their circumferences shed | `2+74=76` | p55, all 76 original runes |

The **suggestion**, not an authenticated instruction, is to project the red heading's already established GP-prime sums **347,315** to GP29 residues **28,25**, and prepend them in the order of the first or second heading's source-selected 23-cycle entry (the latter rotates the same cycle six places). This preserves the exact known original word lengths, all interior symbols, and both target page boundaries. No additional phase, guessed key, fitted glyph or original-string modification is needed. **Strongest physical objection:** p55's first standalone rune is actually the continuation of a printed word begun on p54; no source treats the first two p55 glyphs as a separate header or independently restarted cipher packet. Likewise, p32's 11×11 form is a derived reflow rather than a printed square. The two red heading symbols are a proposed key prefix, not visibly identified p32/p55 header runes.

There is a basic dependence in the two apparent length matches: the identity `119−74=45=2×23−1` follows directly from the cycle containing **exactly one singleton**. Their joint occurrence is more informative than an isolated 74-length coincidence, but the two target matches are **not statistically independent**.

### Exact source-mask same-text obstruction, with every secret static alphabet

If the two art-linked pages carry the same underlying message at two resolutions, a natural alternate use of these **23 source cycle word lengths** is to delete each word's circumference from the **original 121-rune p32 ciphertext**, leaving **74** rune positions, plus the untouched two header positions, for comparison with the **76** p55 ciphertext runes. This is an independent *literal source mask* hypothesis. Allow the header pair at the start or end, both source-selected cycle headings, and both reading directions on each page: **16** frozen pairings.

Even granting **any unknown 29-entry p32→p55 symbol mapping, including non-injective mappings and completely secret arbitrary alphabet labels**, no pairing is consistent. The exact global best is only **33/76** same-symbol constraints satisfied, so at least **43** independent glyph changes would be required. The bound is computed from the sum of 29 ciphertext-pair contingency-row maxima, independent of guessing the mapping. A planted 76-rune GP29 permutation recovers **76/76** in the identical code path. This is an absolute, language-free obstruction to the specific **one static symbol-relabelled plaintext plus literal cycle-defined trimming**; it is not an exclusion of independently changing keys or of entirely different meanings on the two pages.

### Full original-source reversible cipher decision

The [complete CommonJS original-input SFT](../sims/lp2_wordmap23_circumference_dual_target_sft.cjs) constructs these two exact source-derived keys. It evaluates only two heading entries × two original targets × three GP29 arithmetic projections (raw index, prime residue, totient of symbol-prime residue) × two additive signs × two explicit plaintext-F conventions, for exactly **48** original-target decisions. The F-transparent decoder retains the true solved-p56 rule: plaintext F emits literal F without key consumption, whereas ciphertext F can also result from encrypted non-F. Every legal decoded path exactly forward reencrypts the unchanged original. The matching source-GP native plant is separately recovered on each key/variant.

Across the 48 frozen original-input decisions, **27** admit a complete syntactically legal inverse; **21** have no legal F-consistent path. **None** yields natural GP plaintext. The highest native-GP English-bigram log likelihood is **−4.45113** on the second-heading/raw-index/positive-sign/unmodified p55 case, with IoC **0.03439**; the independently clear p57 PARABLE scores **−2.62898** in the same Gibran-derived GP model and has IoC **0.06271**. All 27 legal outputs have IoC below **0.04**. In particular no case recovers a coherent reading simultaneously from p32 and p55, the critical two-target requirement.

A seeded **1,000,000-trial** source-word permutation independently checked the numerical alignment *without decoding*: shuffle complete original p0–2 body words only within their authentic starting-page strata of **57,62,37 words**, keeping heading sums unchanged. Of these, **5,116** assign the first heading a 23-cycle, **4,604** also lead the second heading into that cycle, **85** of the latter contain both preselected prime sums 563 and569, and **24** have full-length119 plus exactly one singleton (equivalently interior74). Exactly **one** shuffled case has *all* these properties. This is an original-source exploratory diagnostic and **not a discovery-wide probability**, because 23, 119/74, p32/p55 receivers and the coincidence itself were selected from prior observations. The raw test is reproducible with xorshift32 seed `0x33011747` in the SFT.

**Decision:** Preserve the exact dual-size correspondence as a potential human-readable clue to a future *authored* paired p32/p55 operation. Retire the finite direct additive/prime/φ key consumers and the stronger all-secret static-alphabet same-text trim under original GP boundaries: none delivers either p32 or p55 plaintext. The two-red-heading-to-two-GP-symbol projection and p57's instruction applied specifically to the selected pointer cycle remain **interpretations**, not first-party instructions. Do not turn the conditional rarity into a decryption claim, or tune new key transformations merely to improve a score.

## Natural full-word running-key use of the same cycle (Agent36, 17 November)

The preceding 23-number candidate uses each visited word's *sum* as a single key symbol. A materially distinct, human-readable interpretation takes the **runic contents of every visited word**, concatenated in source-selected cycle order, as an ordinary running key. The 23 original body words contain **119 complete GP29 runes**, enough to key the entire original **76-rune p55** terminal once without repetitions, numeric table selection, or any outside key. The two opening red headings fix exactly two starting words: first red → cycle body cell6, or second red → cycle body cell4 (step7). The historic solved-p56 GP29 plaintext-F-transparent additive rule gives exactly two algebraic signs. No arbitrary rotations, word reordering, reverse reads, or optimized starts are included.

The exact DP preserves both interpretations of any *ciphertext* F, while a *plaintext* F must pass transparently without consuming a key rune. The four complete original p55 inversions are all mathematically impossible:

| Start selected by red word | Inverse sign | First zero-based contradiction on original p55 | Complete legal plaintext paths |
| --- | --- | ---: | ---: |
| First heading, cell6 | Subtract | **65** | **0** |
| First heading, cell6 | Add | **0** | **0** |
| Second heading, cell4 | Subtract | **5** | **0** |
| Second heading, cell4 | Add | **8** | **0** |

Each of the four same-length independent source-native 76-rune plaintext controls, drawn from original clear p57 and encrypted under the frozen key/sign and genuine F rule, has an exact legal inverse recovering the plant. The full 119-symbol literal concatenation therefore supplies **no unknown p55 plaintext**, even before GP-English scoring; this excludes only its transfer through the specified authentic F-transparent operation. The 23-cycle itself remains a provisional navigational observation. [Full source-native CJS with all 76 original runes and complete forward planted controls](../sims/lp2_wordmap23_concat_runningkey_p55_native_gate.cjs) · [manual Node22 run 44090292401](https://github.com/FlareZ123/liber-primus/actions/runs/44090292401) (queued on dispatch; check conclusion before calling CI passed).

## Direct 23-cycle key against original p32 (Agent44, 17 November)

The 23-cycle supplies a compact candidate GP29 key by reducing each cycle word's prime sum modulo 29. Page p32 is a reasonable independent target to test: its original 121-rune block has previously been reflowed 11×11 for the 563/569 axis-sum study, and the original page image visibly begins its fourth text line with the transliterated sequence HOMEX at zero-based rune offset 33. The exact original p32 JPEG is resources/liber-primus/49.jpg, SHA256 c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72.

I tested the fixed 23-symbol key under both source-derived starts (first red heading at cycle entry; second red heading at cycle step 7, a six-place rotation), both additive signs, and two spans: all 121 p32 runes, and the 88-rune suffix beginning at the H of HOMEX. The decoder exhaustively branches at each ciphertext F between literal plaintext F/no key consumption and encrypted non-F/key consumption, preserving the authentic p56 transparent-F rule.

| Span | Key start | Inverse | Earliest illegal plaintext-F contradiction (zero-based) | Full legal paths |
| --- | --- | --- | ---: | ---: |
| Full p32 (121) | First heading | P=C-K | 71 (C=A, K=A) | 0 |
| Full p32 (121) | First heading | P=C+K | 11 (C=H, K=NG) | 0 |
| Full p32 (121) | Second heading | P=C-K | 62 (C=IA, K=IA) | 0 |
| Full p32 (121) | Second heading | P=C+K | 93 (C=B, K=EO) | 0 |
| H-start suffix (88) | First heading | P=C-K | 13 (global p32 offset 46; C=EO, K=EO) | 0 |
| H-start suffix (88) | First heading | P=C+K | 8 (global offset 41; C=L, K=N) | 0 |
| H-start suffix (88) | Second heading | P=C-K | 40 (global offset 73; C=B, K=B) | 0 |
| H-start suffix (88) | Second heading | P=C+K | none | **1** |

The sole surviving H-start suffix inverse consumes all 88 key symbols and forward-reenciphers all 88 original runes, as any legal candidate should. Its output is:

    LEAEAAPEAGROCIAURAENGERAEXPBMNSSHGGILMOEMPUJHOEICORAARLHURIAOIATHXNGYUMOJEAOOEOTTWAEUCEPCOEOPSTHCAETAIOESCW

It has no readable GP prose; its IoC is **0.0350052247**, versus **0.0316091954** for the original suffix and **0.0627099664** for clear p57. The synthetic 121-rune positive control, including transparent F symbols, recovers exactly under the same DP and forward encoder.

**Decision:** The direct repeated 23-cycle GP29 additive key does not decrypt p32 under either source-derived start or sign. Full p32 has no legal full-span F-transparent inverse in all four cases; the visually motivated H-start suffix has one syntactically legal but nonlinguistic wrong-key inverse. This is a bounded rejection of this direct p32 key consumer, not a test of the separate p50 compass walk and not a rejection of the 23-cycle's possible non-additive or navigation role. Do not add arbitrary rotations, offsets or key transformations.

[Source-native reproducer](../sims/lp2_wordmap23_cycle_p32_direct_key_gate.cjs).


## Full-cycle p32 word-map holdout (Agent39, 17 November)

I froze one low-parameter reading suggested by the 2016 clause that "numbers are the direction": for each word in the already-fixed p0–2 23-cycle, take its original GP-prime sum \(S_i\) as a zero-based address into the original p32 121-rune sequence, then read \(p32[S_i \bmod 121]\). This uses the entire cycle and original p32 rune order, with no extra key, rotation, reversal, letter-position choice, or fitted stop.

The 23-rune output is:

```
EA Y O U B W H A R T R L AE S IA T NG B M Y I TH O
```

The two previously noticed dimension hits produce **H** and **S** at cycle steps 7 and 14 (the 563 and 569 sums). The other 21 positions do not extend them into a phrase or instruction; the operation supplies no word boundaries. The second red-heading seed is already on the same cycle at phase **6**, so it rotates this output by six positions; the first red word anchors the displayed order, but the signed clue does not choose a phase. This is a withheld p32 prediction, not plaintext recovery.

A second literal word-address interpretation, using each cycle sum modulo 23 to select a p32 word, visits only **15 distinct** addresses; one address is outside p32's **21 printed words**. The p32 page has 121 runes and one red large-punctuation marker at rune position 121, but it does not contain a 23-word text list. Treating its tree illustration and punctuation as extra word cells would be an additional, unselected rule. The 11×11 p32 arrangement is a reflow of 121 runes, not a printed grid. Likewise, p0–2's 156 body words factor as 13×12, but the original pages are ordinary text lines (12, 12, and 9 lines, including p0's red heading), not a printed 13×12 word matrix.

The 2016 message supplies no modulus, index origin, extraction position, word/rune choice, output grammar, or stop condition. The p0/p2/p32 red large-punctuation marks may delimit sections, but do not choose a letter or a cycle endpoint. The existing 2012/2014/2016 signed-word holdout test has no validated complete word-map receiver. As independent context only, [Dukotah's R9-DIRECTION audit](https://github.com/Dukotah/cicada3301/blob/master/research/DEAD_ENDS.md) tests 2,670 rune-stream direction/read variants and finds no signal against its shuffle controls; it does not directly test this word-level p0 graph.

**Decision:** The p0 23-cycle remains a real, reproducible navigation structure with the two 563/569 correspondences, but the signed-2016 clue does not select a reproducible word-reading output. The most direct p32 withheld readout is nonlinguistic, and the p32 word list does not supply a 23-word receiver. Close the word-reading task as a bounded negative; retain the cycle as a provisional structural observation, not plaintext or a recovered key. Do not invent further output selectors or layers without a first-party instruction.

[Full-cycle p32 readout and original-source assertions are included in the focused SFT](../sims/lp2_13x12_wordmap_p32_withheld_readout_sft.cjs), which passed in Node 22 on [manual run 44179939759](https://github.com/FlareZ123/liber-primus/actions/runs/44179939759). The passing run verifies the cycle, six-position phase relation, complete p32 readout, and original punctuation/word-count assertions.

## Self-keyed p0–2 receiver gate (Agent40, 20 November)

The most direct untested receiver for the 156-word map is its own 716-rune p0–2 black-body stream. The 23-cycle is therefore a self-keyed hypothesis. The p57 red 23-dot mark makes the cycle length plausible, the 2016 signed message supplies the word-map instruction, and the solved p56 cipher supplies a concrete additive/F-transparent operation. This is a bounded test of that route, not a general key search.

I froze two encodings of the 23 cycle's original GP-prime word sums:

- **23-symbol key:** each sum reduced modulo 29.
- **46-symbol BASE29 key:** each sum represented as two fixed-width base29 digits, high digit then low digit. This is a candidate serialization of the signed 2013 BASE29 instruction, not an independently authenticated key format.

The receiver is the original p0–2 black-body stream: p0's 13 red heading runes are excluded, then pages 0–2 are concatenated in printed order. It contains **716 runes**, including **33 ciphertext F** symbols. The 23-cycle itself is recomputed from the original 156 body words and GP-prime values; the second red heading enters the same cycle six places after the first.

At ciphertext F, the inverse DP retains both legal branches: literal plaintext F with no key advance, or a non-F ordinary inverse with key advance. A non-F ciphertext may not decrypt to plaintext F. I tested both additive signs, both source-derived heading starts, and the obvious body-clock phases: phase 0 (reset at black body), phase 13 (red heading consumes the key), and, for the 23-symbol key only, phase 3 as a sensitivity case if the 13-dot marker also consumes 13 key steps.

**23-symbol modulo-29 key — first impossible body offset, zero-based:**

| Cycle start | Inverse | Phase 0 | Phase 13 | Phase 3 (marker consumed) |
|---|---|---:|---:|---:|
| First heading | P=C−K | 27 | 13 | 28 |
| First heading | P=C+K | 162 | 3 | 126 |
| Second heading (rotate 6) | P=C−K | 100 | 21 | 22 |
| Second heading (rotate 6) | P=C+K | 126 | 40 | 17 |

**46-symbol fixed-width BASE29 key — first impossible body offset, zero-based:**

| Cycle start | Inverse | Phase 0 | Phase 13 |
|---|---|---:|---:|
| First heading | P=C−K | 41 | 32 |
| First heading | P=C+K | 257 | 216 |
| Second heading (rotate 12 digits) | P=C−K | 3 | 21 |
| Second heading (rotate 12 digits) | P=C+K | 19 | 3 |

Every original-ciphertext variant dies before the 716-rune stream ends; the largest surviving key-phase set never exceeds five. Synthetic 716-rune positive controls recover complete legal paths for both key lengths and both signs, confirming that the DP correctly handles transparent F and key advancement.

**Decision:** reject the direct additive transfer of this 23-cycle to its own p0–2 body under both the simple modulo-29 and fixed-width BASE29 key encodings. No plaintext is recovered. Do not retune the key order, digit endianness, phases, or cipher layer. This does not rule out a non-additive or navigational use of the 23-cycle; it closes the most direct self-keyed p0–2 receiver.

Reproducer: [sims/lp2_13x12_wordmap_23cycle_p0body_key_gate.cjs](../sims/lp2_13x12_wordmap_23cycle_p0body_key_gate.cjs).

## Weakest premise and next decisive work

The core pointer graph's weakest step remains the unselected **`GPPrimeSum(word) mod156`** index rule. The additional **p50 compass continuation is now retired**: it depends on unselected byte and coordinate conventions, the full 23-step readout is nonlinguistic, and both red headings necessarily have the same toroidal endpoint regardless of order. The 2016 and p32 trees are distinct stock assets, and no printed 11×11 p32 square or compass instructions select this navigation.

Useful independent progress would be an authentic Cicada-authored source selecting the word-pointer modulus or a new reversible consumption of the 23 words, with an original untouched-page plaintext prediction and exact re-encryption. Do not repeat the already-completed direct 23-key/F-transparent p55 inverses, 1,000,000-cycle shuffle or failed compass search. The exact 23-cycle and its two unverified 119+2/74+2 key-length coincidences remain provisional source-structured observations, not recovered plaintext or keys.
