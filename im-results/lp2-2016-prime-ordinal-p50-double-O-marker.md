# 2016 prime-ordinal cells 103–104 reconstruct signed 2013 BASE29 3301, with an original double-O marker

**Status (14 November 2026): two independently observable historical clues admit an exact 3QO/3301 reconstruction from a unique original table-cell pair; it is an exploratory human-path hypothesis, not an authenticated cipher operation.** The previously tested direct p55 additive key remains negative. No unknown plaintext or original secret key recovered.

## Inputs and exact arithmetic

The 2016 signed image dimensions recorded in `im-results/lp2-2016-dimensions-base58-33cycle-table-entry.md` are **563 × 569**. Both are prime:

- 563 is the **103rd prime**.
- 569 is the **104th prime**.

The original base60 table in `resources/liber-primus/base60-grid.json` is a **32 × 8 = 256-cell** row-major grid spanning LP2 pages 49–51 (10 + 13 + 9 rows). Its original two-character tokens are decoded with the MIRACL base60 alphabet recorded in that resource.

Using the prime ordinals as **1-based cell indices** in that 256-cell grid:

| Image dimension | Prime ordinal | Grid cell | Token | Byte | Byte mod 29 |
|---:|---:|---:|---|---:|---:|
| 563 | 103 | row 12, col 6 | `0W` | 32 | 3 |
| 569 | 104 | row 12, col 7 | `3Q` | 206 | 3 |

Rows and columns above are zero-based. In the Gematria Primus corpus, index 3 is **O**, whose prime weight is **7**. The selected bytes differ by **174 = 6 × 29**, exactly 29 times the dimension difference (569-563=6).

Across all 256 cells there are 13 adjacent equal-residue pairs, but **the only adjacent pair with residue 3 (O/O) is cells 103–104**.

## New source-locked reconstruction of the 2013 signed BASE29 example (Agent 30, 14 November)

This strengthens the *specificity of the existing 2016 prime-ordinal pair*, while also exposing the extra human interpretation needed to make it a key. The independently verified original **26 January 2013 Cicada-signed TCP challenge** explicitly gives `BASE29 3301 → 3QO` ([2013 first-party source and signature](../resources/external/2013-tcp-server-signed-source.md)). This is a fixed three-digit numeral in Cicada's actual published 29-digit alphabet, not a candidate English word chosen from the LP2 ciphertext.

- The 2016 signed-message tree image is exactly **563×569** pixels; `563=p103`, `569=p104`. The original p32 11×11 runic square's **first row** GP-prime sum is 563 and **first column** sum is 569, independently grounding these image dimensions inside the 2014 manuscript.
- Read the 2014 256-cell table in original physical row-major order, one-based. The **103rd** cell is the literal token **`0W`**, numeric byte **32**, and the **104th** is literally **`3Q`**, numeric byte **206**. The latter is the exact first **two characters** of the signed 2013 numeral `3QO`, with no transformation of its printed token.
- Use the known GP29 alphabet on the preceding `0W`: its decoded byte32 has `32 mod29=3`, GP index3 **O**. In the *height-token-then-width-rune* order, concatenate the 104th literal token with the 103rd residue-rune: **`3Q` + `O` = `3QO`**, and the signed 2013 numeral decodes **`3×29² + 26×29 + 24 = 3301`**. The suffix O is robust to any ordinary radix admitting the displayed digit W (index32), because the original first token starts with 0. Even alternative admissible radix89 keeps this numeral32.
- **Original table geometry supplies a concrete orientation cue:** cell103 is **row12,col6**, the last **strict interior** column, while cell104 is **row12,col7**, the **right exterior perimeter** column (zero-based coordinates). They straddle the interior/circumference boundary on one printed row. The already solved p57 PARABLE explicitly says **“SHED OUR OWN CIRCUMFERENCES”**; reading the circumference token `3Q` before its adjacent inner rune O is consequently a possible human clue-constrained explanation of the height-first order. This exact geometric fact precedes any new key hypothesis. It remains a thematic interpretation, since no authentic instruction commands combining one exterior two-digit token with the preceding interior residue. There are 30 comparable interior-right-edge transitions across the 32×8 table; the 2016 prime pair selects one specific transition.
- The extraction `next literal token || previous byte modulo29 as GP letter` produces `3QO` at **exactly one adjacent two-cell start among all 255 in the unchanged original table**, the consecutive pair **103–104**. As a control, the distinct 2012 source image 503×509 (prime ordinals96,97) selects literal tokens `0Z`, `3g`; the identical rule gives **`3gG`**, rather than `3QO`. No cell, key, direction, page or dictionary output was adjusted after these two original source inputs were fixed.

This joins an original signed **2013 numerical example**, original **2014 LP2 printed bytes** and original **2016 signed-message image dimensions** in a new precise readout. It also links to the separately verified fact that the 2013 `3QO` digits, read as an ascending GF29 quadratic, divide the full original 256-byte table exactly ([original polynomial identity](2013-base29-gf29-grid-factor.md)). The table factorization and this numeral reconstruction **reuse the same signed 2013 example**, so they must **not** be multiplied as independent statistical successes.

**Whole-table generalization gate:** The same mixed rule applied to all 255 adjacent original cell pairs would attempt to read the second token as the first **two BASE29 digits** before appending the previous cell's GP residue. Of these 255 second tokens, only **131** contain two valid BASE29 digits; **124/255** contain at least one out-of-alphabet base60 character (digit value ≥29). Thus the local 3QO coincidence **cannot be extended mechanically into a full-table BASE29 numeral stream without a further independently supplied rule**. The selected 3Q is one of the valid two-character tokens; this is not evidence of a complete ciphertext decoder.

**Strongest objections and cipher frontier:** The 2016 text never commands taking image dimensions' *prime ordinals* as table indices. The choice to combine one literal table token with the previous cell's GP29 residue and reverse the natural width/height order was selected while exploring the numerical observations; neither 2013 nor 2016 source specifies that mixed extraction. The original target `3301` is the already-public organizer identifier, not a new secret or unknown-page key. Given many attempted table mappings and retrospective numerical selectors, uniqueness of this one preselected readout does **not** establish authorship or an unbiased discovery p-value. A real LP2 continuation would still need a creator-selected **operation acting on unknown ciphertext** and genuine forward-checkable plaintext. This finite result identifies no such operation.

The original-input [standalone Node22 SFT](../sims/lp2_3qo_source_ordinal_two_cell_sft.cjs) asserts p32 dimensions, prime ordinals, exact original table bytes and SHA256, the unique adjacent-pair reconstruction, the signed BASE29 result and the 2012 control. It does not fit or decode any unsolved LP2 page.

## Later p0 THE ROAD / DH key receiver (Agent30, 18 November 2026)

The prime-ordinal pair now has an independent unknown-ciphertext receiver. A separate exhaustive GP0→p50 pointer census of the authenticated 2016 words had already selected **p0 offsets103..108 = THE ROAD** before this crosslink was noticed. Its first complete word occupies offsets103..104, exactly the prime ordinals supplied by the image dimensions.

Original ciphertext there is `H,EO=[8,12]`; native GP `THE=TH,E=[2,18]`. Subtraction gives **[6,23]**, exactly **[a,p]** from the independently source-selected p28 DH23 object. The ciphertext pair is the sole complete two-rune `H,EO` word among all473 two-rune words on unresolved p0..p55.

The continuation is equally concrete. `ROAD` occupies offsets105..108; the same one-based p50 cells105..108 have byte residues mod29 **[6,5,2,15] = [a,g,K,b]**. This is the only four-cell window in the entire p50 table whose residues are all members of the reconstructed DH state set. Direct use of those four residues as an additive key does not decrypt ROAD, so no continuation transform is claimed.

This sharply reduces the earlier objection that prime ordinals103/104 had no unknown-ciphertext receiver. It still leaves the mixed zero-based p0 / one-based p50 convention and the state update after `[a,p]` unresolved. [Detailed bridge](lp2-2016-prime-ordinals-p0-road-3qo-dh-key-bridge.md) · [SFT](../sims/lp2_2016_prime_ordinals_p0_road_3qo_bridge_sft.cjs).

## Source-locked p32→p32/p15 dual page-register junction, and p55 entry (Agent35, 14 November 2026)

A distinct **page-navigation** reading appears in the *same independently selected
two original printed cells*, and it supplies a concrete conditional discriminator
of the base60-vs-base59 numeral ambiguity. The existing signed 2016 image dimensions
563×569 and original p32 11×11 runic square's first-row/first-column GP-prime sums
are independently **the same pair**. Because 563 and 569 are the consecutive
**103rd and 104th primes**, both source clues freeze the **one-based original
table cells 103–104**, without a chosen language score or rotating key.

In the source conventional base60 byte register, these adjacent cells are
literally **`0W` and `3Q`** and decode to **32 and 206**. Since LP2 has
**58 physical pages p0–p57, including the entirely numerical p50 and the two
solved terminal pages**, both source bytes point to the **same physical page
p32** if one takes their values modulo the complete number of physical pages.
Crucially, LP2's **May 2014 first-party file listing actually named its 58
images `0.jpg` through `57.jpg`**, so page `32.jpg` is a historical
player-visible named file, rather than merely a later researcher-assigned
page number (see [CicadaSolvers structural overview](https://www.cicadasolvers.com/wiki/liber-primus/liber-primus-structural-overview/)
and the [period stage11 Onion7 page index](https://github.com/micheloosterhof/cicada-2014/tree/master/stage11)).
The project's consolidated original JPEG mirror calls that same LP2 p32
image `49.jpg` because it prepends 17 earlier LP1 pages; do **not** perform
this modulo58 addressing against the mirror's sequential archive filenames.
Under the contemporary LP2-specific filenames, the two congruences are:

`32 mod 58 = 32; 206 mod 58 = 32; 206 - 32 = 174 = 3 × 58.`

This is a genuine *closed numerical circuit*: **p32 first-row/column prime
sums → 2016 image dimensions → prime ordinals 103/104 → 2014 grid
cells103/104 → GP/table values32 and206 → p32** under the stated source
map. The original p32 square is exactly 121 GP runes; neither row nor column
was fitted to this output. The two identical modulo29 residues **O** already
documented above follow from the same `174=6×29` identity and must not be
counted as independent events.


**The same operation generalizes to a second, independently identifiable
original numeric-square page.** Apply the above rule to **every one of the
11 full rows and 11 full columns of the original p32 square**: take a row
or column GP-prime-weight sum; retain only genuinely prime sums; convert
each prime to its **ordinal**, look up that one-based physical cell of
the 256-entry source table, decode the original base60 byte, and reduce
it modulo58. Do not reorder or omit the resulting prime-bearing rows or
columns. The complete original readout is:

| Source axis; original zero-based indices of prime-sum rows/columns | GP prime sums | 1-based table cells | Literal tokens | Base60 bytes | Page values mod58 |
| --- | --- | --- | --- | --- | --- |
| Rows 0, 1, 4, 6 | 563, 617, 743, 577 | 103, 113, 132, 106 | `0W`, `1D`, `20`, `13` | 32, 73, 120, 63 | **32, 15, 4, 5** |
| Columns 0, 2, 6, 10 | 569, 641, 463, 499 | 104, 116, 90, 95 | `3Q`, `47`, `3e`, `0u` | 206, 247, 220, 56 | **32, 15, 46, 56** |

The **first two** prime-bearing rows and **first two** prime-bearing
columns independently produce the identical target-page sequence
**[p32, p15]**, while their remaining values diverge. The newly
recognized **second pair** is row1 sum617 (the 113th prime) and
column2 sum641 (the 116th prime); its source tokens are `1D` and
`47`, and source bytes **73 and 247** satisfy
`73 mod58 = 15; 247 mod58 = 15; 247−73 = 174 = 3×58`.
Both direct attention to **LP2 p15**, the book's *other* distinctive
numerical-square page. Its separately source-recovered 4×4
Fibonacci-prime spiral consists of the sixteen values
`|3301 − prime(Fibonacci(n)+1)|`, providing a **complete,
independently established** reconstruction of the same publicly known
Cicada identifier 3301. This makes a bounded potential reader path
from the 2016 image into **p32 → p15 → 3301** rather than merely an
isolated p32 numerical self-loop.

These two pairs distinguish the local radix choice: with **base59**,
the first two row targets would instead be **[32,14]** and the
corresponding first two column targets **[29,11]**. Neither pair
agrees. The base60 construction therefore has a second explicit
source-to-page convergence that the unchanged literal base59
alternative lacks. It is an exact, finite test of a particular
page-map decoder, rather than general proof of what numeral encoding
the author intended.

**Limitation of this extension:** The operation **select prime-sum
rows and columns** is itself inferred because the dimension-matching
first row and first column are prime; no author-signed instruction
commands this prime filter, modulo58 page conversion, or seeking a
shared prefix between the two axes. The two target pairs were noticed
after examining the full readout; arbitrary later page endpoints
**[4,5]** versus **[46,56]** do not form a complete common page
route. Both byte differences are **174**, so the modulo58 agreement
and modulo29 agreement are arithmetic consequences of the same
pairs, not independent confirmations. Page p15's known 3301
spiral was solved prior to this new page-selection reading.
No new unknown-page plaintext or reversible cipher follows.

There is also a second, original-cipher **entry** into the exact same
cell103: the p55 final two complete printed ciphertext words
`DJU BEI` uniquely reappear at p27 offsets28–33; the **next complete
p27 printed word `AE.F`** (offset34–35) has source GP-prime sum
**101+2=103**. Thus the conditional route is

`p55 footer → p27 offset28 → first following word sum103 →
table cell103 (value32) → p32 → its first row/column →
table cells103 and104 (both p32 mod58)`.

The first step's whole-word-pair uniqueness among 2,454 printed adjacent
pairs is documented separately in
[the p27/p55 original-source report](p27-p54-repeated-7gram-periodic-key-gate.md).
This composition adds no unknown plaintext or secret key; it gives a
specific possible *human clue path* to a previously identified table cell.
The alternate **288 mod58=56** reading of the p55 footer's two-word
prime-sum directs attention to the immediately following solved p56,
whose first original ciphertext rune `AE` completes the independently
established seven-rune p55/p56 seam into p27. That is a competing register
interpretation, not a second proof of the same route.

**Second original p27 whole-word ordinal and source-32-rune separation
(Agent35, same invocation).** The p27 entry into table cell103 is accompanied
by an independent *later complete printed p27 word*: **`P.B`** at original
rune offsets **66–67**, with GP prime sum **43+61=104**. The earlier
**`AE.F`** occupies original p27 offsets **34–35** and sums
**101+2=103**. These are the **only two complete printed p27 words**
with these respective sums, among its 52 parsed whole words, and their
source rune starts are separated by **66−34=32** positions. Thus the
same p27 page selected by the unique p55 terminal phrase supplies
*both* prime ordinals **103 and104** as whole-word sums, separated by
exactly **p32** runes. Those ordinals are the signed 2016 image
dimensions' prime ranks and the source p32 row/column prime
ranks. Their original table cells each return p32 modulo58,
under the proposed page-map contract.

The original p27 **52-word** check found **seven** source-ordered word pairs whose two GP-prime sums are consecutive one-based addresses in the 256-cell table. A new **complete unsolved-book census** has now independently extended that exact predicate, without changing it or picking any new source target: parse every physical p0–55 rune-bearing page, retain all original word separators and 32 across-page carry fragments, and consider **every ordered pair of page-local printed words** (earlier word before later word, with no chosen gap). The original source provides **2,928 page-local word fragments** across 55 pages and **81,159 within-page word pairs**. Of these, **289** pairs have consecutive sums within grid cells 1–256. Require the same two exact conditions, with no fitted offset or key:

`grid[lower_sum] mod58 = grid[higher_sum] mod58 = secondWordStart − firstWordStart`.

**Only one of all 289 candidate pairs on all 55 unknown pages passes**: p27 `AE.F` at original rune34 (sum103) and `P.B` at rune66 (sum104), whose table cells are `0W=32` and `3Q=206`; both reduce to p32 mod58 and the physical rune-start separation is exactly32. The six other p27 consecutive-sum pairs and **282** corresponding pairs across the remaining unsolved pages all fail the full condition. This is a more demanding within-source uniqueness result than the earlier same-p27 check. The read-only [complete original-book SFT](../sims/lp2_allpages_primeconsecutive_gap58_sft.cjs) asserts the unchanged 12,956-rune source, each page's exact rune indices, all counts and the unique hit; [Windows Node22 run 43636094426](https://github.com/FlareZ123/liber-primus/actions/runs/43636094426) passes. No source word or grid cell was edited or rotated.

**All-book source-constrained null changes the priority.** The global event is whether **at least one** complete matched pointer occurs anywhere in the 55 unsolved pages, rather than requiring the retrospectively noticed p27/103/104/p32 coordinates. In **1,600 fixed-seed original-source word-shuffle controls**, preserving all original pages and comparing the **same** original table:

| Original-preserving randomization | Surrogate books with at least one complete pointer | Mean matched pointers/book | Add-one upper-tail |
| --- | ---: | ---: | ---: |
| Shuffle complete rune words only within their original page **and same original word length** (all rune-starts stay fixed) | **115/1,600** | **0.07375** | **116/1,601 = 0.07245** |
| Shuffle complete words freely inside original page, then recompute page-local rune starts | **128/1,600** | **0.084375** | **129/1,601 = 0.08057** |

Both source-preserving matched-control rates are appreciable for an exact one-hit outcome over **81,159 original pair opportunities**. The [same all-book SFT](../sims/lp2_allpages_primeconsecutive_gap58_sft.cjs) now asserts **every** null hit count and uses the unchanged GP sums, original physical pages, base60 table and deterministic seed `0x7fab0283`; new [Windows Node22 run 43637515039](https://github.com/FlareZ123/liber-primus/actions/runs/43637515039) passed. This is a *conditional fixed-rule* probability because the formula itself was assembled after the original p55→p27 footer and cell103/104 observations; it is **not** a familywise probability for the full process of inventing that equation.

**Decision:** the exact unique p27 pointer remains a source fact, yet under both stringent nulls a one-hit book-wide match is ordinary at roughly **7–8%**. It therefore gives **no adequate independent support for elevating the hypothesized pointer to an author-intended decoder or for allocating more dependent key searches**. The source itself does not instruct solvers to search word pairs or to convert word-start gaps to page addresses. A new p32 consumer must be motivated by an independent historical instruction or genuine unknown plaintext prediction. No unknown plaintext, key or decoding method was obtained.

This is a second, out-of-anchor word pointing to the *already fixed*
next ordinal, with no tuned cipher or spelling. It nevertheless
required **looking ahead across 32 further ciphertext runes** to
find the second word; no independent source tells the solver to
advance exactly 32 runes or to choose this later printed word.
One can also map the next original p27 singleton `P` (prime43)
through table cell43 (`0S`=28) to p28, illustrating that the
same generic word→cell→page rule yields competing potential destinations
if extended freely. Thus the p27 word-pair alignment is a meaningful
source-exact *conditional reinforcement* of the p32 route, not a
key, unique walk, plaintext, or unconditional proof of design.
The original-word census and 32-rune gap are now asserted by the
[extended source SFT](../sims/lp2_terminal_103_104_p32_58cycle_sft.cjs)
in [passing Windows CI run43624000482](https://github.com/FlareZ123/liber-primus/actions/runs/43624000482).

**New all-table and local-radix checks.** Under original base60 bytes,
exactly **8 of 255** adjacent ordered source-cell pairs have equal values
mod58, beginning at one-based cells **56,103,140,166,199,216,231,251**;
**103 is the only pair whose two values both equal p32 modulo58**.
Under the distinct local **base59 positional** reading of these same
unchanged printed tokens, `0W=32` remains true but `3Q=203` and
`203 mod58=29`, breaking the **double** p32 self-reference. This
makes the physically selected pair a potential *base60-specific page-map
checksum*, though a puzzle author would have to communicate the byte-to-page
map. The earlier 2012 picture's different prime-ordinal cell pair does
not reconstruct the source `3QO` numeral, as documented below.

**Strongest objection:** no signed source tells a solver to treat two
table values modulo **58** as page indices, to choose a zero-based
physical page number, to take the *next* p27 word's prime sum as a
one-based table address, or to treat an image dimension as its **prime
ordinal**. The chain was assembled after the p55/p27 footer recurrence
and the earlier 2013/2016 numeral observations were already known.
Therefore uniqueness among source cells is a conditional within-corpus
fact, **not an unbiased authorship probability**, and the loop is
a map hypothesis rather than recovered ciphertext. In particular it
does not uniquely prove base60 against base59 in the absence of an
authenticated page-pointer instruction. The `3QO=3301` candidate is
still the **already-public** 2013 signed numeral, not a newly discovered
onion address or instruction.

**Reproduction:** the [source-exact Windows Node22 SFT](../sims/lp2_terminal_103_104_p32_58cycle_sft.cjs)
reads the actual locally archived 2016 source JPEG SOF frame,
the original p32 121-rune square, p27/p55/p56 ciphertext, and all
256 numeric cells. It asserts both physical geometry and mathematical
maps, eight modulo58 equal-pair starts, the unique p32 double-match,
the base59 local competitor, and the signed 2013 public 3301 numeral. It now also asserts every original
p32 prime-row/column lookup, both paired p32/p15 targets, both
radix59 alternatives, and the complete original p15 Fibonacci-prime
square's existing exact 3301 reconstruction.
The extended step passed in
[GitHub Actions run 43621862810](https://github.com/FlareZ123/liber-primus/actions/runs/43621862810).
The [direct p55 70-rune grid103 and p27-difference additive consumers](p27-p54-repeated-7gram-periodic-key-gate.md#source-selected-following-word-difference-and-table-cell103-direct-key-gates-agent35-14-november-2026)
have already failed, including every solved-page-style F-skip choice.
A next result must identify an *authored operation consuming the
p32/p15 page pointers* that recovers an original key or unknown
plaintext, instead of inventing numerically convenient extra arcs.

## Negative control: the 2012 image

The earlier 2012 image dimensions recorded in the same dimension study are **503 × 509**:

- 503 is the 96th prime.
- 509 is the 97th prime.

The same 1-based lookup selects cells 96–97: tokens `0Z` and `3g`, bytes **35** and **222**, residues **6** and **19**. They do not agree modulo 29, and their byte difference is not divisible by 29. Thus the 2016 result is not reproduced by this earlier prime-dimension control.

## Cross-link to the p32 M7 candidate

The existing p32-derived M7 candidate has a projective pole at **7**; its marked 13-rune window also has prime sum (413 equiv 7 pmod{29}). The two selected p50 cells decode to O, whose Gematria Primus prime weight is 7. The 2016 signed message's wording about “the path lies empty” and “numbers are the direction” makes an empty/pole interpretation worth testing.

A specific, still-unverified composition is:

1. Decode each p49–51 base60 byte (b).
2. Map (b mod 29) to a Gematria Primus rune index.
3. Replace that rune index with its Gematria Primus prime weight, reduced modulo 29.
4. Apply the forward p32 M7 map (f(x)=(14x+25)/(25x+28)pmod{29}), treating its pole (x=7) as infinity/empty.

This is distinct from the existing `p50-m7-nonlinear-stream-composition` experiment, which used raw byte residues as the period-256 key and applied M7 to the target stream.

Under this exact mapping, the 256-cell table yields nine infinity markers at 1-based positions **76, 103, 104, 111, 173, 177, 212, 219, 238**. The dimension-selected pair 103–104 is the **only adjacent infinity pair**, producing an empty segment between them. The resulting segment lengths are:

`75, 26, 0, 6, 61, 3, 34, 6, 18, 18`.

These segments are not plaintext. The empty segment is a structural match to the message wording, not proof of intended operation.

## Fixed follow-up: phase after cell 104 against p55 interior43

The only dimension-selected phase is immediately after cell 104 (start at cell 105). I rotated the 256-element transformed stream to that position, discarded infinity markers as empty, and took the first 43 finite values:

`[13,24,1,19,26,7,22,19,17,7,19,18,10,13,7,18,24,22,18,18,28,21,24,17,24,22,16,8,18,26,10,7,18,6,18,18,6,19,3,4,3,24,22]`

Applied as an additive key to the source-selected p55 interior43, both signs were tested modulo 29:

- (C-K): `GSJTYACCFIANJRYEOEOILMONGDEAIESAEINGNREAYGPPEONWSTHTAE`
- (C+K): `OCPAELNLXCEOEEADYMFGYIMWESHUEAYEAOAPRELLAEPDHGJ`

Neither output is recognizable plaintext or supplies a meaningful word structure. This rejects the proposed **direct additive p55 key use** of this transformed stream at the sole dimension-selected phase. Do not search other phases or signs.

## Quotient/remainder interpretation: same map symbol, opposite directions

The base29 byte decomposition `B=29q+r` is already documented and tested globally in `im-results/p50-base29-high-digit-radix9-source-gate.md`. There, (q) was interpreted through the standard 3×3 keypad mapping (q+1); the complete 256-step path did not produce plaintext or a convincing destination. Do not repeat that global walk.

The new dimension-selected pair gives a sharper **local** observation:

| Source image | Selected cells | ((q,r)) | GP symbol | Keypad direction |
|---|---|---|---|---|
| 2012, 503×509 | 96–97 | (1,6), (7,19) | G, M | south, north |
| 2016, 563×569 | 103–104 | (1,3), (7,3) | O, O | south, north |

Thus both image pairs select the same two quotient directions (q=1,7), which are opposite (south/north) under the existing keypad convention. Only the 2016 pair has the **same remainder/rune O at both ends**. Its two selected cells are adjacent in the same row; the 2012 control pair crosses a row boundary and has different runes. The two pair starts (96 and 103) differ by **7**, matching the p32 M7 candidate's pole value.

This gives a plausible reading of the signed-2016 hint: the remainder (r) supplies the map symbol, while quotient (q) supplies direction. The 2016 dimensions select an O/O pair with opposing directions, i.e. a zero-net or empty path. The p32 M7 pole7 is a suggestive cross-link, not proof that the same transformation is intended.

This local interpretation is **not** a recovered plaintext or destination. The direct p55 additive-key experiment above remains negative, and the global keypad path remains a documented negative. The only defensible retained claim is the dimension-selected local O/O, south/north marker.

## Decision and next question

Retain the prime-ordinal double-O observation as a structural candidate. Retire its direct p55 additive-key interpretation.

The only worthwhile continuation is to ask whether the nine separators and the dimension-selected empty segment identify an **independent, source-authenticated path or structure** in the 2016 message or LP2. Require a uniquely predicted result; if none exists, retire the broader composition too.

## Scope

This is an intermediate finding, not an established decipherment. It does not change the overall LP2 status. No unknown plaintext, authentic key, complete inverse, or final destination has been recovered.
