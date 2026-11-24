# Five numbered cuneiform passages: source-square tests and SHED navigation

**Status (24 November 2026, consolidated):** All five originally numbered passages (139/91/98/96/129 runes, 553 total) remain undeciphered. Exact joint lexical inversion now excludes arbitrary shared per-column affine GP29 keys, including optional mixing by either literal historical 5×5 square. The follow-up covers all 24 possible early historical Fehu-transparent key-clock alignments as well. The independent source-backed clue remains that the authenticated 2014 1033-sum and 3301-sum five-by-five squares have determinants 3 and 10 modulo29; their products are invertible and have order 28 in GL(5,29), but the fixed 28-clock receivers remain negative. Agent2 has now tested one further exact, source-motivated candidate: apply the 2014 SOME WISDOM word-prime-sum operation to item3's 25 original ciphertext words and compare row-major with the third Stage10 5×5/1033 square. The 25 sums do not match either source 5×5 square, their row/column/diagonal sums do not equal 1033, and the cell multiset does not match. This rejects only the direct word-sum transfer to ciphertext words. The conditional Oxford Shuruppak repeated formula also fails all five numbered starts under every q8 additive/F-hold key and phase, independently of printed spacing; the source-edition selector remains missing. No unknown plaintext, authentic key, or final destination is recovered.

## Exact shared-affine five-track inverse, including fixed historical square mixing (24 November 2026)

**Decision:** retire the shared per-column affine GP29 receiver at the numbered first-rune starts, including its two fixed original-square mixing variants, within the tested finite native lexical register. This strictly extends the earlier shared-additive #2150 model: both multiplier and shift may change arbitrarily at every aligned position. The five original labels fix the lane order and alignment, while the cuneiform 1033/3301 pair motivates the two literal historical 5×5 matrices. There is no claim that these clues authenticate the model.

For the five plaintext and ciphertext rune vectors at column t, test C_t=M(a_t P_t+b_t 1) over GF(29), where a_t is any nonzero rune residue, b_t any rune residue, and M is I, the literal 3301 square, or the literal 1033 square. With D=M^-1 C, choose two distinct D_i,D_j. The other three plaintext values must satisfy P_k=P_i+(D_k−D_i)(D_j−D_i)^-1(P_j−P_i). If all D values coincide then all P values coincide. This is exact cancellation of all secret column parameters.

The five source spans are p36 [99,238), p37 [0,91), p37 [91,189), p37 [189,228) plus p38 [0,57), p38 [57,186). The SFT asserts all 553 source runes, 30/20/25/19/28 printed words and common 91-rune overlap. The finite lexicon contains 38,920 distinct GP sequences: the pinned TextBlob word-frequency forms with at least two Latin letters, all valid single/digraph/ING rune encodings after GP normalization, A/I/O and exact pinned solved-native words. Seven singleton runes are NG/OE/TH/A/I/O/T. Partial words use only fragments at the exact source word length and offset.

The shortest interval meeting a layout-only heuristic expected-count threshold 0.01 is [62,67), zero-based common columns 62–66. The log estimate −7.15129 comes from dictionary fragment cardinalities and the original word lengths, without reference to ciphertext values; it is only a search heuristic, not a calibrated probability. Exhaustive joint trie search checks all compatible two-lane assignments, infers the other three algebraically, and memoizes impossible states. There is no beam or key pruning.

| Fixed M | Original lexical witnesses | Tuple transitions explored | Matched-layout positive |
| --- | ---: | ---: | --- |
| Identity | 0 | 70,732 | Unique 25/25 runes |
| Historical 3301 square | 0 | 118,890 | Unique 25/25 runes |
| Historical 1033 square | 0 | 69,613 | Unique 25/25 runes |

The matched-layout control independently draws frequent dictionary words matching every original word length and encrypts with independently random affine column states. A second exhaustive search excluding the first witness establishes uniqueness. Each found tuple replays its ciphertext. The additional genuine solved-native control with different word layout survives feasibility, but its first witness at the same absolute offsets matches only 2/25 planted runes; short-window identification is layout-dependent. The original zeros are exact within the stated dictionary and preserved word framing. This does not exclude changed segmentation, other registers, independent lane keys or genuinely different cross-lane mixing. No original plaintext or key recovered.

[Executable CommonJS SFT](../sims/lp2_cuneiform_fiveunit_shared_affine_square_csp_sft.cjs), code commit `ce325bf30286f096d1cd0d00f7fd1d1b5e7745a0`. Executed against the current repository source files in the invocation's JavaScript runtime; no CI run is claimed. Do not repeat key/multiplier/shift schedule searches inside this exact model.

### Authentic Fehu-transparent clock extension — all legal prior alignments

The solved LP1/p56 convention allows a plaintext Fehu (GP0=0) to appear unchanged without advancing the cipher key; a ciphertext Fehu may also be an encrypted non-Fehu. Therefore the fixed raw-position affine rejection alone does not cover shared key clocks when individual lanes have held Fehu symbols.

The exact full five source units have literal ciphertext-F positions (zero-based) `[[32,91,99,113],[67,89],[14,17,76,82],[50],[13]]`. On the common *consuming-key* interval [51,67), every possible preceding hold history reduces to a raw-index shift vector (h1,0,h3,h4,h5) with h1∈{0,1}, h3∈{0,1,2}, h4,h5∈{0,1}. This gives **24** distinct alignments, covering all 32 early binary Fehu decisions (the two lane3 choices of one hold induce the same alignment). In every alignment there is no physical ciphertext Fehu inside the interval; each compared plaintext rune must be non-F. The next literal F in lane2 is raw67, strictly outside the interval. Earlier lexical constraints are deliberately relaxed: any full valid decode would still have to satisfy at least one of these local alignments.

For each alignment the same layout-only selection algorithm picks one 5- or 6-column subinterval inside [51,67), using no rune-value scoring. The joint trie solver rejects every compatible tuple path for all three fixed mixing matrices, allowing arbitrary affine coefficients per consuming column:

| Fixed M | Surviving F alignments | Exact explored tuple transitions |
| --- | ---: | ---: |
| Identity | 0/24 | 1,460,068 |
| Historical 3301 square | 0/24 | 1,731,204 |
| Historical 1033 square | 0/24 | 1,637,887 |

An independent matched-layout planted control uses genuine held plaintext Fs at raw slots `[[32],[],[14],[50],[13]]`, then encrypts the consuming five-lane columns with random shared affine keys, applies the respective fixed matrix, and reinserts transparent F symbols. All three controls recover the unique **25/25** actual non-F plaintext runes in their selected window [62,67), confirmed by excluding the first witness and searching again; the inverse tuple replay is exact. This is a full finite all-mask obstruction for the described historical F-hold variant, not an assertion that the author used such a variant. It leaves changing segmentation, other plaintext registers, independent lane clocks and other reversible architectures open.

[CommonJS F-hold SFT](../sims/lp2_cuneiform_fiveunit_shared_affine_fskip_sft.cjs), commit `e46603899eafb36425933e03cf422ba3aa829e07`. Both original results and positive controls were executed against the repository files in the JavaScript runtime. No CI run is claimed. No unknown plaintext or authentic key recovered.

## Historical text/edition selection gate (Agent17, Director #2481, 24 November 2026)

**Decision: retire the specific Shuruppak translation/near-quotation branch until an independent edition selector appears.** The preceding [#2469](https://github.com/FlareZ123/liber-primus/issues/2469) combined two different recensions: the five-unit count belongs to the archaic Early Dynastic text, while the Oxford ETCSL translation used for its donkey/beer crib probes follows the later three-unit recension. The earlier negative word-length tests remain valid for the exact tested phrases, but the five-unit structural argument does not select those English words.

- Original physical p33 (archive scan 50.jpg, 2400×3600, crop x=800..1599/y=2950..3529) and p39 (scan 56.jpg, illustration above the prose) contain the same two rows of stylized numeral wedges. Under the ordinary integer sexagesimal reading, upper row is (17,13), i.e. 17×60+13=1033; lower row is (55,1), i.e. 55×60+1=3301. See [MacTutor numeral conventions](https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_numerals/) and the [French Ministry of Culture's description](https://archeologie.culture.gouv.fr/orient-cuneiforme/en/mesopotamian-mathematics). No separate phonetic name, tablet accession, line coordinate or edition identifier is visible. Historical absolute sexagesimal scale is ambiguous in isolation, but the integer values identify the established Cicada pair. The authentic 2014 Stage7 magic-square file contains both sums; this is a stronger independently documented referent than an unspecified wisdom text. The inscription does not uniquely instruct a downstream cipher.
- The scholarly discussion used by #2469, [Instructions of Shuruppak: The World's Oldest Instruction Collection](https://www.academia.edu/103976396/Instructions_of_Shuruppak_The_Worlds_Oldest_Instruction_Collection), explicitly distinguishes the **archaic** five-unit version (Alster 2005 pp.176–185, line ranges 6–15, 16–25, 26–45, 46–144, 146–165; unit sizes 10/10/20/99/20) from the **classical** three-unit version (Alster 2005 pp.56–100). These are different recensions, not arbitrary subdivisions of one translation. The original five LP2 printed items have 30/20/25/19/28 complete words. The fourth is the shortest by words, whereas archaic unit4 is by far the longest in source lines; this weakens a direct complete-unit identification, without ruling out an abridged or reordered borrowing.
- The pre-2014 [Oxford ETCSL 5.6.1 translation](https://etcsl.orinst.ox.ac.uk/section5/tr561.htm) itself marks the repeated father-to-son introductions at lines 1–13, 76–82 and 146–152 (second and third explicitly labeled). Its [1999 bibliography](https://etcsl.orinst.ox.ac.uk/section5/b561.htm) lists multiple pre-2014 composite editions and numerous different clay witnesses. The archaic five-unit arrangement can be consulted in [Bendt Alster, Wisdom of Ancient Sumer (2005)](https://books.google.com/books/about/Wisdom_of_Ancient_Sumer.html?id=sdtiAAAAMAAJ), and the [1974 monograph](https://ci.nii.ac.jp/ncid/BB06553852?l=en) contains several versions. A later scholarly translation of the formula is not itself a player-accessible 2014 key.
- Historical Cicada edition selection provides a contrast: the 2014 Emerson handoff supplied an identifiable literary riddle and coordinates ([period participant reconstruction](https://github.com/neuroretransmit/cicada/blob/main/2014/001-twitter/README.md)); the 2012 Agrippa handoff has an independently reproducible line-indexed output in a pre-puzzle author-site snapshot ([source reconstruction](https://cicadanotebook.com/sessions/12.html)). Neither precedent implies that any ancient-looking numeral identifies a particular translation. See also [the first-party operation profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md). The genuinely solved LP1 red 1/2 layout remains a closer independent visual precedent for the five LP2 numbered statements.

**Stop gate:** none of the inspected original numeral marks, bibliographic entries, or known source contracts supplies a discriminating text/translation locator. No original cipher values were consulted to select a new quote, no additional translation/offset sweep was run, and no key or plaintext was inferred. A later authenticated named work, manuscript identifier, or edition-specific phrase could reopen a locked crib/adjacent extension; otherwise the next research effort should be on a source-selected reversible cipher rather than further historical quote variants.

## Repeated Shuruppak formula, spacing-free q8 crib recovery (Agent5, Director #2582, 24 November 2026)

**Decision: reject the literal repeated Oxford formula at all five numbered starts under the shortest historically demonstrated periodic GP29/F-hold key (WELCOME q8), even allowing a different key and initial phase for every unit.** This is independent of the earlier intact-word lexical and translation probes. The preceding #2481 recension correction still stands: the Oxford translation has three introductions, not the five archaic units, and gives no independent selector of these English words or their placement at an LP2 unit start.

Freeze the repeated direct-address clause “My son, let me give you instructions: you should pay attention!” from the [Oxford ETCSL 5.6.1 translation](https://etcsl.orinst.ox.ac.uk/section5/tr561.htm), lines 1–13, 76–82 and 146–152. It occurs within each introduction, not at its literal first word; the proposed LP2 first-rune alignment is the conditional hypothesis. Use GP29 V→U, the source-attested INSTRUCTI(A)N / FUNCTION convention (IA rune for IO), with both IO occurrences also independently allowed as separate I,O. Four spellings give lengths 48/49/49/50; all have no plaintext F. No printed word boundaries, offset search, edit tolerance or fitted period enter the test.

For a consuming rune, C_i=P_i+K_{j+i} mod29; the known plaintext-F exception cannot occur anywhere in this fixed crib. Thus D_i=C_i−P_i mod29 must have period eight, regardless of the unknown initial key phase. In particular D_8=D_0 (zero-based), a necessary condition at the ninth rune. The four spellings share the first nine runes, so the same contradiction applies to all of them.

| Numbered unit | Frozen physical start | D_0 | D_8 | Result |
| --- | --- | ---: | ---: | --- |
| 1 | p36:99 | 1 | 24 | fail |
| 2 | p37:0 | 19 | 2 | fail |
| 3 | p37:91 | 4 | 1 | fail |
| 4 | p37:189 | 2 | 27 | fail |
| 5 | p38:57 | 18 | 17 | fail |

**0/20 spelling/unit pairs** admit even an individual q8 key; hence no shared-key pair exists and no original continuation can legitimately be attempted. This excludes all 29^8 possible q8 keys and phases for this fixed first-rune crib, not a different formula, placement, period or cipher.

Positive calibration uses the five genuine repeated question occurrences in the solved first KOAN (corrected native GP tape, offsets 62,174,300,417,574; the two documented WHAT→WHO corrections restore 778 runes). Four deterministic planted q8 keys and independently varied initial phases yield 20 separate recovery cases. The solver receives the ciphertext and exact repeated question, but not planted key/phase or 24-rune continuation. It recovers **20/20 phase-relative keys** (exact up to cyclic rotation). Every one of the 20 true 24-rune continuations is in its exhaustively decoded latent-F path set (480/480 covered); four cases are uniquely determined without a language model, the other sixteen have 2–8 legal paths. All enumerated paths replay exactly. This is key recovery, not a claim of unique plaintext for the ambiguous controls.

[Executable CommonJS SFT](../sims/lp2_shuruppak_repeated_formula_q8_sft.cjs), code commit `e9403b6a224d0604ee52930cf3c999916a4755d6`. Executed in connected JavaScript runtime against canonical ciphertext and pinned solved-native data; no CI run. No unknown LP2 plaintext/key recovered. The exact crib relation is retired; a different source-selected operation is needed.

## Direct item3 word-prime-sum / 5×5-1033 source gate (Agent2, 24 November 2026)

**Motivated by a specific human-visible shape, not a numeric coincidence search:** the third red-numbered unit on p37 contains exactly **25 complete words / 98 runes**. The original 2014 Stage10 form asks for a third square of **order 5, line sum 1033**, and the earlier LP1 SOME WISDOM source demonstrates the exact operation of summing the GP29 prime value of each printed word to reconstruct its 5×5/1033 square. This is a natural direct candidate for item3 as an independent block: preserve its 25 printed words in order, sum the prime values in each word, and compare the resulting 25 cells row-major with the historical 5×5/1033 square. No decryption, rotation, reordering, phase, modulo, offset, or second operation is permitted.

The original item3 boundary is p37 offsets **91–188 inclusive** (zero-based, 98 runes). The original word lengths are:

    [3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3]

The exact 25 GP-prime word sums are:

    [135,212,134,148,269,145,446,138,219,112,111,67,172,233,215,206,117,136,527,218,521,80,374,202,133]

As five printed rows, these sum to:

    row sums:     [898,1060,798,1204,1310]
    column sums:  [1118,922,954,1329,947]
    diagonals:    [1413,1298]

They are **not** the row-major 5×5/1033 square, the row-major 5×5/3301 square, or either square's cell multiset. None of the five row, five column, or two diagonal sums is 1033. This rejects the exact direct operation on the ciphertext words; it does not reject a cipher that must first be inverted before applying the word-prime-sum operation, and it does not authenticate an alternate word boundary or square orientation.

The complete fixed test is [lp2_cuneiform_item3_word_prime_sum_5x5_original_sft.cjs](../sims/lp2_cuneiform_item3_word_prime_sum_5x5_original_sft.cjs). It reads the canonical original GP29 transcription and prime table, asserts 25 words/98 runes, and compares only the two original 2014 order-five squares. The historical 2014 source operation and exact 5×5/1033 square are documented in [2014-magic-square-direction-map.md](2014-magic-square-direction-map.md). **Decision:** do not promote the item3 25-word/5×5 match to an opcode; retain it as a rejected direct-transfer hypothesis.

The distinct **source-number/length hypothesis** uses all **99** original printed integers in the three 2014 magic squares (5×5, 7×7, 5×5) and maps adjacent π-count differences to **98 GP29 shifts**, exactly the **98 original runes of numbered item3**. Frozen historical-file order, direct mod29 subtraction and addition yield original IoCs **0.03618767 / 0.03282138** versus the original item3 **0.03155902**, without coherent prose. The historical square centers remain [809,331,91], with prime counts [140,67,24] and GP letter signature LP from consecutive differences [73,43], but this full-stream application yields no next decoder. The 98→98 agreement is a testable structural match, not an authentic author instruction. A strict complete source/native planted original inverse is saved as [one-file Windows Node22 SFT](../sims/lp2_cuneiform_item3_2014_square99_primecount_sft.cjs), [Windows PASS 45184972145](https://github.com/FlareZ123/liber-primus/actions/runs/45184972145). No traversal, sign phase or key optimizations were performed.

The already-tested 5+7-square complete reversible receiver partitions the 553 original runes into 5×91 column operands and two 49-rune 7×7 blocks. Its exact source/native replay likewise yields nonprose (GP29 IoC **0.03410252** versus native control **0.06094557**); the numerical fit is not an independent authored instruction. [Original 5+7-square SFT](../sims/lp2_cuneiform_fiveunit_5x5_7x7_complete_original_sft.cjs) · [CI PASS 45092273788](https://github.com/FlareZ123/liber-primus/actions/runs/45092273788). The red-list precedent in solved LP1 still supports the competing interpretation of independent philosophical statements. No unknown plaintext, authentic key or final destination has been recovered.

**Scope clarification (20 November 2026):** the negative tests here cover row-wise/additive operations on the 553-rune numbered enclosure. They do not test the distinct 5×5 phi-grid matrix product on the source-selected p36 fragment37, which produces an intermediate DH state packet rather than plaintext; see [the phi-grid state-route synthesis](dh3301_phi29_wisdom_square_selector_audit.md). This clarification does not change any negative result in this report. The fixed p57-SHED transfer still yields the provisional number sequence **[46, 35, 229, 38]** (fifth raw sum 271), and the mixed direct-page/prime-rank interpretation still proposes **[p45, p34, p49, p37, p57]**. The decisive direct continuation has now been tested with the same word-center SHED operation on p45, p34, and p37 in the proposed order: 87 center runes produce non-prose strings, and the page sums remain outside the 256-cell p50 table. Retire the page-number/prime-rank interpretation as a decoder; preserve the five-passage arithmetic and page correspondence only as provisional structural observations. Full details below.


**Complete all-secret five-stream static-matrix gate (Agent32, 23 November 2026):** The five numbered first-91-rune registers admit exactly **732,541** one-dimensional GF29 key rows up to nonzero scale. Exhausting all of them finds a minimum of **22 distinct output symbols** (maximum IoC **0.05616606**), and a **top-three concentration of at most 30**, whereas **301/301** solved-LP1 five×91 author-native registrations contain at least one lane with **≤21 distinct symbols or ≥31 top-three mass**, and all five solved-p57 91-rune windows meet both conditions. Since every possible invertible fixed 5×5 decoder outputs a nonzero projection, no such decoder, even with arbitrary fixed output substitution, can recover a lane meeting either original-impossible native occupancy condition. This is a sharp **conditional original-input exclusion** of the broader unknown-static-matrix premise, not a universal prohibition on 22–29-symbol English, nonstationary key streams, independently keyed items or different alignment. [Full all-key original report and native positive](lp2-five-numbered-allsecret-matrix91-original-capacity.md) · [Node22 Windows PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45263800804).

**Whole-register base29 carried-square original test (Agent32, 23 November):** A distinct cross-stream integer alternative applies each historical 2014 5×5 square over Z/(29^91) to the five entire numbered 91-rune prefix integers, carrying across rune positions. Both 2014 squares, raw/φ cells, printed/transposed orientations, and both digit directions yield 16 exact reversible original models, all with aggregate decoded IoC **<0.037** and maximum individual-lane IoC **<0.041**; all 16 decrypt full 455/455 solved-LP1 source-native plants. No native original text recovered. This tests the BASE29 instruction transfer beyond the previous per-rune GF29 matrix, and retires this direct carried interpretation without requiring the broader unknown-key decoder to fail. [Original source and SFT](lp2-five-numbered-source-square-base29-carry-original.md).

**Five red labels as whole-BASE29 Shamir abscissas (Agent32, 23 November).** The direct x=0 integer interpolation [5,−10,10,−5,1] across the five original 91-digit numbered text registers leaves both digit orders nonprose (IoC **0.0368742 / 0.0283272**), while each exact native 91/91 GP29 polynomial-share positive recovers. This is a carried-integer secret-sharing receiver, mathematically distinct from the previously excluded rune-wise Shamir. No author-selected opcode follows. [Source and SFT](lp2-five-numbered-source-square-base29-carry-original.md).

**Whole-integer header-targeted interpolation (Agent32, 23 November):** The same five printed red numbers 1–5 as putative share abscissas and cuneiform **1033/3301** as *target* coordinates fix two concrete Lagrange rows. Testing full 91-rune BASE29 integers with carries in both digit orientations plus two separate GF29 positionwise interpolations yields **six nonprose originals** (IoCs 0.030769–0.037851), while all four full-register solved-native plants recover exact 91/91. [Original source/algorithm and SFT](lp2-five-numbered-source-square-base29-carry-original.md). No typed author interpolation instruction has been found.

## Human-visible selection and scope

### Previously solved LP1: red numerals as an author's semantic list

The original **first-volume LP1 10.jpg and 11.jpg** provide a particularly direct creator-style control for interpreting the five red LP2 decimal numbers. On original LP1 [p10](../resources/liber-primus/10.jpg), the decrypted surrounding prose says **"WE CONSUME TOO MUCH BECAUSE WE BELEIVE THE FOLLOWING TWO ERRORS WITHIN THE DECEPTION"** and introduces a printed **red numeral 1** mid-page followed by **"WE DO NOT HAVE ENOUGH, OR THERE IS NOT ENOUGH"**. The *next original image*, LP1 [p11](../resources/liber-primus/11.jpg), begins with the same typographic **red numeral 2** introducing the solved statement **"WE HAVE WHAT WE HAVE NOW BY LUCK; AND WE WILL NOT BE STRONG ENOUGH LATER TO OBTAIN WHAT WE NEED"**. Source solved text, preserving the original authorial error BELEIVE: [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt).

Exactly that **physical page-seam/list rhythm** recurs in the unknown LP2: p36 [scan53](../resources/liber-primus/53.jpg) places red **1** below earlier prose, and the next p37 [scan54](../resources/liber-primus/54.jpg) begins with red **2** and continues **3** and **4** before p38 [scan55](../resources/liber-primus/55.jpg) prints **5**. Item 4 genuinely crosses the p37→p38 image boundary. This first-volume, **already decrypted** precedent shows that the author's visible red decimal item labels can introduce **independent philosophical assertions** without indexing shares, key rows or a sequence of cipher operations. The closest human-readable source hypothesis for the unknown five messages is therefore **a numbered set of sayings or claims**, with the exact actual wording still encrypted.

This is a **genre/layout precedent**, not a proof that the five ciphertext items are unrelated, an English plaintext crib, or an operation to decode them. It makes a premise of the more elaborate five-stage-program/Shamir/source-square families less compelling unless a separate original instruction specifies that interpretation. The original five red numerals remain valid physical coordinates for any independent cryptanalytic proposal.

The repeated 1033/3301 cuneiform headers span seven physical LP2 pages (p33–p39), but their artwork is a single repeated template. Existing stronger controls already establish pixel identity and JPEG-DCT identity for the entire shared header on pp34–39; see `sims/lp2_cuneiform_repeated_header_original_sft.py` and `sims/lp2_cuneiform_sixpage_header_dct_sft.c`. No page-private ink variation in that header selects a distinct opcode.  Within that enclosure the authors **printed five red decimal numerals 1–5**, one at the beginning of each successive passage across physical pages 36–38. These five numbered passages are bracketed by **red 10-dot punctuation at p36 rune cut 99** and **p38 cut 186**. Both cuts are independently preserved in the ink annotations. The numeral positions were manually inspected on the original p36, p37, p38 JPEGs (archive files `53.jpg`, `54.jpg`, `55.jpg`; physical LP2 p maps to archive p+17). The SFT checks the canonical line lengths; the native-JPEG readback below independently classifies all 553 target rune identities from p43-only templates.

| Printed red numeral | Source passage, zero-based rune offsets | Source rune length |
| --- | --- | ---: |
| 1 | p36 [99,238) | **139** |
| 2 | p37 [0,91) | **91** |
| 3 | p37 [91,189) | **98** |
| 4 | p37 [189,228) then p38 [0,57) | **96** |
| 5 | p38 [57,186) | **129** |
| **Total** | Physical p36–p38 numbered enclosure | **553** |

A five-passage structure with explicit order 1–5 offers a different, more source-faithful framing than reflowing the aggregate 1,589 runes of seven unequal printed pages into seven imagined 227-rune lanes. The five-boundary **553-rune enclosure had already been documented and used in the 79/78 packet study** (see `results/README.md`); this analysis does not claim discovery of that interval. The genuine 2013 mixed Wisdom square reconstructs the historical 2014 **5×5** square exactly, whose five rows each total 1033, one of the original cuneiform values. This suggests a cheap *specific* historical transfer: use square row number k for printed passage number k. The other cuneiform number 3301 also belongs to the original 2013/2014 source history, but it does not select a byte decoder here.

**Weakest premise:** neither the cuneiform artwork nor the numbered passages explicitly says to transfer the 2014 Wisdom square rows, choose `φ(cell) mod29`, or apply those numbers as cyclic additive keys. The 2013 Wisdom prose praises primes and totient; solved p56 uses a prime-totient GP29 shift, which motivates a single narrow test of this operation. These clues do not authenticate it.

## Independently sourced Blake *First Book* running-key candidate

The historical 2014 1033.jpg collage used **William Blake** imagery, including *The Ancient of Days* (Urizen), and Blake's 1794 illuminated **The [First] Book of Urizen** gives a literal but unconfirmed title parallel to *Liber Primus*. The previously tested Blake *Marriage of Heaven and Hell* and the archived 2014 onion-page Blake HTML title are **different exact source inputs**. The [new finite original-input Urizen source test](lp2-blake-first-book-urizen-runningkey-original-gate.md) freezes the 1,179 GP29 runes of the public-domain Prelude and Chapter I:1–6, and tries two natural entry points, both additive directions and the actually solved Cicada plaintext-F skip rule. All four direct signed inverses on the five authentic **553** numbered runes remain cipher-like (IoC **0.03429253–0.03476426**); the complete all-paths F-transparent inverse becomes **impossible at original rune 5, 7, 83 or 0** for those combinations. The entire independent p0–2 and p40–41 chapters likewise have no legal complete F-transparent paths. The candidate was tested on original sources and passed on [Windows Node22](https://github.com/FlareZ123/liber-primus/actions/runs/45149502622), with a genuine solved p57 native-text positive plant. Reject only this specified key and operation; no unknown plaintext was recovered and the literary coincidence is no cryptographic instruction.

## Five-way full-secret shared-pad plaintext recovery (Agent23, #2150, 22 November 2026)

The source physically prints five numbered GP29 passages. It permits one precise **hypothetical** synchronization: each unit's first rune after its own red Arabic label, with an identical unknown modulo-29 additive pad starting at that ordinal reset. These real units have lengths **139/91/98/96/129**, total **553 runes in 122 words**. The unit-4 page carry is preserved. Explicit source intervals are p36 [99,238), p37 [0,91), p37 [91,189), p37 [189,228) + p38 [0,57), p38 [57,186). Contrary to the initial Issue's wording, **five complete 100-rune lanes are impossible** because printed unit 2 contains only 91 runes. All five can instead be aligned without fitting at their first **91** runes, preserving authentic hyphens, full stops, unit boundaries and all page carries. The final **50 runes** of each 91-rune original interval are reserved for a no-retuning readout.

If the five ciphertexts share an arbitrary unknown pad K, the differences `D_j[i]=(C_j[i]-C_1[i]) mod29` cancel K exactly. The joint candidate is `P_j[i]=(P_1[i]+D_j[i]) mod29`; hence only **29** choices of the reference plaintext glyph remain per source position, irrespective of the 29^91 possible secret pads. A deterministic **2,400-state GP29 four-gram Viterbi-beam decoder** considers all **five** complete plaintext streams simultaneously. Its GP-native language model trains exclusively on **418,649** runes / 104,349 words from the first 70% of each of the preexisting pinned Gibran, Emerson and Shakespeare registers. A fixed 0.4-weight word-edge unigram likelihood uses authentic printed boundaries. No original decipherment, alphabet, private pad, unit phase or language parameter was fitted to these unknown passages.

**Power calibration uses actual solved-Cicada GP29-source plaintext**, independent of the training literature. Five different known-source streams from WARNING, WELCOME, WISDOM, A KOAN and LOSS OF DIVINITY are encrypted three times under independently seeded *shared* random 91-symbol pads, with the true native word-edge clocks. The model reconstructs **450/455** runes on plant 1 and **455/455** on each of plants 2 and 3: **1,360/1,365** total, including **745/750** correct on the reserved last-50 span. Original solved plaintext is fully known to the controls. Nine separately sampled five-text **independent-pad** plants, with their true native word breaks, provide calibrated false-English controls.

| Source | Four-gram joint log likelihood per decoded GP29 rune | Ground truth |
| --- | ---: | --- |
| Five authentic native streams, shared-pad plant A | **−2.12700776** | 450/455 runes recovered |
| Five authentic native streams, shared-pad plant B | **−2.13334059** | 455/455 recovered |
| Five authentic native streams, shared-pad plant C | **−2.13364855** | 455/455 recovered |
| Nine independent-pad plants | **−3.45855436 through −3.41539443** | No reusable pad; spurious English-like fragments |
| **Five original numbered passages** | **−3.45122346** | **No authenticated recovered plaintext** |

The original scores *inside* the independent-pad control range and **over 1.29 log units per rune below** all three known-positive texts. Its first original unit decodes, preserving the source word breaks, as:

```text
TAEE NAU UITERICT GO WEAPRO NIN AESP SEAOEXTR ETU ATEPE NDNGH IN DIEYT REWBCNGNA TRICJ OHE DEXCH THNGNEWE CWITHOR HOF T
```

Another lane starts `CMAI DFTNG BAYYUS UNTHE HENGTHTIATELS PASS OEACOIDS...`. None of the five complete source-shaped reconstructed 91-rune messages gives long coherent native-GP words, and the final50 of every stream is equally incoherent. The exact original 455-symbol modulo29 forward replay holds automatically for any candidate plaintext with the corresponding inferred pad, so replay **does not authenticate** the candidate. This is a decisive source-bound negative on **direct five-way reused fixed-rate additive GP29 English** at red numeral starts, with high-power real-rune positives. It does **not** exclude other language registers, nonlinear state, state keys that change per unit, or author-supplied offsets presently missing from the source. Do not retune word-boundary clock, key phases, or overlaps to rescue this failed direct receiver.

**Reproducer:** [Windows/Node22 original-input five-stream SFT](../sims/lp2_cuneiform_fiveunit_sharedpad_joint_gp_original_sft.cjs). The [successful exact repository Actions run 44978482542](https://github.com/FlareZ123/liber-primus/actions/runs/44978482542) prints all five full original word-break readouts, heldout tails, three planted positive accuracies and all nine negative scores.

## Frozen original-input experiment

The genuine 2014 Wisdom square is

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Applying Euler's totient to each printed cell and reducing modulo 29 produces the five period-five keys:

```text
12 15 10 14  5
 4 24 19 12  6
25 23 14 23 25
 6 12 19 24  4
 5 14 10 15 12
```

For passage k, the source-selected row k starts at phase zero at the beginning of the printed red-numeral passage. Both ordinary Vigenère signs are separately inverted. Both exact *forward reencryption* checks pass for every one of the **553 original runes**. The original five-passage concatenation has IoC **0.03423356** and **1** adjacent identical-rune pair, consistent with the manuscript-wide suppressed-doublet phenomenon.

| Operation on original source | IoC (553 runes) | Adjacent equal outputs | Representative transliteration |
| --- | ---: | ---: | --- |
| As printed | **0.03423356** | **1** | source ciphertext |
| Subtract `φ(cell) mod29`, row reset | **0.03408287** | **17** | `H T TH H M P P N F O OE EA X TH Y ...` |
| Add `φ(cell) mod29`, row reset | **0.03441701** | **20** | `O B OE W F H X F EA P B F C U W ...` |

Decoded per-passage IoCs stay near 1/29: subtraction [0.03159,0.03150,0.03598,0.03640,0.03331]; addition [0.03347,0.03468,0.03450,0.03443,0.03331]. Neither direction yields recognizable source-native English text. The reencryption invariant verifies code correctness, while independent language evidence remains negative. As expected for a varying-position additive operation, it restores ordinary random-like numbers of adjacent duplicates rather than solving the text.

## Source-keyed F-transparent row mask: complete original algebraic obstruction

**Agent49, 15 November 2026.** A historically faithful successor to the direct row-mask negative above has now been executed on all **553 actual original runes**, with no plaintext-language scoring. The authentic solved LP1/p56 cipher rule means plaintext **F** is emitted as ciphertext F and **does not consume the current key symbol**. The direct row mask above advanced on every glyph; this exact extension instead keeps *every legal advancing/nonadvancing F history* at every position, using the same five independently printed Wisdom-square totient rows, modulo29, starting at the five original red passage numerals. The original source still does **not** prescribe this transfer; the test asks only whether it is algebraically possible.

At every original GP29 ciphertext rune `C` and current row phase `j`, there are at most two branches: (1) `C=0` can stand for literal plaintext-F and leave phase unchanged; (2) `P=(C−sign·K[j]) mod29` **must be nonzero** and advances phase. This fully includes any accidental ciphertext F produced by encryption of non-F. All possible phase histories are tracked exactly, without choosing bypass locations, English text or a key-clock alignment by score.

| Cipher sign | Passage 1 (139 runes) | Passage 2 (91) | Passage 3 (98) | Passage 4 (96) | Passage 5 (129) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `C=P+K` | **8** | **29** | **12** | **88** | **28** |
| `C=P−K` | **4** | **7** | **61** | **38** | **4** |

Each entry is the **zero-based first original-rune position at which no legal F-interruption history remains**. None of the ten passages reaches its genuine original end. This stronger incompatibility requires neither a presumed plaintext word nor a language IoC threshold. A complete GP-native positive plant, using authentic solved p57 runes and the identical key/sign/length for each of the ten models, retains a legal forward-produced path through all source positions. Thus the negative is specific to the original ciphertext, not a coding impossibility for this cipher family.

**Decision:** the historical **Wisdom-square row-totient Vigenère mask plus the actual plaintext-F nonadvancing rule** cannot be the complete GP29 encoder of any of these five numbered passages at the printed source phase. No alternate secret phase or extra pad is inferred. Do not repeat the same key transfer under newly guessed bypass locations; all legal bypass locations are already exhausted. The larger unknown cuneiform cipher remains unresolved.

[Exact original-input CJS SFT with all-branch inverse and 10 complete GP-native positives](../sims/lp2_cuneiform_ftransparent_2014_wisdom_row_sft.cjs).

## Five-passage column mixing under the solved prime-totient key

A separate finite inverse addresses the source-interpretive **MIX** word identified by the historically mapped p36/p55 Wisdom-square route (see [direction-map source analysis](2014-magic-square-direction-map.md#nested-word-sum-instruction-candidate-mix)). The manuscript visibly enumerates exactly five passages with rune lengths **139, 91, 98, 96, 129**. Read their first runes in number order 1→5, then their second runes in the same order, continuing column-by-column and skipping exhausted passages. Reverse-number order 5→1 is the opposing direction. This is an invertible, variable-height five-column interleave with no guessed fillers or fitted indices.

The only next cryptographic operation in this bounded test is the known solved-p56 **GP29 prime-totient key**: for the j-th runic symbol in the mixed sequence, `k_j=(prime(j+1)-1) mod29`, starting at the first prime 2 and resetting at the source 10-dot enclosure. Both additive signs were tested. The unchanged as-printed sequence is the baseline, giving six exact models. The original 553-rune stream has IoC **0.03423356**, and the candidate inverses yield:

| Read order | Subtract shift IoC | Add shift IoC |
| --- | ---: | ---: |
| As printed | **0.03418115** | **0.03479702** |
| Column interleave 1→5 | **0.03466599** | **0.03462012** |
| Column interleave 5→1 | **0.03476426** | **0.03482323** |

All six outputs have no discernible GP-native plaintext opening and remain near the uniform 29-symbol IoC of 0.03448. The exact inverses fully restore all **553/553** original symbols. These results reject only the specified interleave followed by a source-reset direct prime-totient additive mask. The source does not authenticate the meaning of MIX, the columnwise reading rule, or application of p56's otherwise page-specific key to the numbered passages. No unknown plaintext or key was recovered. [Single-file reproducible test](../sims/lp2_five_numbered_mix_primephi_sft.cjs) reads the canonical source, asserts five authentic boundaries, verifies both lossless interleaves, and pins the six original IoCs.


## Word-level MIX interleave under the exact p56 F-transparent rule — verified negative (19 November 2026)

The source-visible prompt is the five red-numbered passages on p36–38; the 2014 Wisdom-square route supplies the *interpretive* candidate word `MIX`. This remains a human-solve hypothesis, not authenticated plaintext or an author directive. The cheapest whole-word reading is round-robin interleaving: take word 1 from passages 1–5, then word 2, continuing and skipping exhausted passages. Both 1→5 and 5→1 orders are tested.

The five original passage intervals contain **553 GP29 runes in 122 complete printed words**, with passage word counts **[30,20,25,19,28]**. The word-level interleaves preserve each word internally and are verified bijections: the SFT records original source positions, reconstructs the complete 553-rune input exactly, and confirms that all five source intervals and word boundaries match the canonical transcription.

The consumer is the solved p56 prime-totient GP29 shift with its exact plaintext-F transparency rule. For successive primes (p_j=2,3,5,ldots), the key is (k_j=\varphi(p_j)\bmod29=(p_j-1)\bmod29), starting at phase zero once for the complete 553-rune stream. A literal plaintext F emits ciphertext F without consuming a key position; every non-F plaintext rune consumes one. The inverse dynamic program retains **all** legal histories at ciphertext F, branching between literal transparency and non-F decryption. Both arithmetic signs are tested.

**Original-input outcome:** every one of the ten fixed variants reaches an empty legal-history set. The first impossible position is zero-based in the transformed stream:

| Input ordering | (C=P+K) | (C=P-K) |
| --- | ---: | ---: |
| As printed | **1** | **13** |
| Rune round-robin 1→5 | **31** | **21** |
| Rune round-robin 5→1 | **29** | **14** |
| Whole-word round-robin 1→5 | **1** | **9** |
| Whole-word round-robin 5→1 | **45** | **7** |

These are exact reachability contradictions, not language-model scores. The DP implementation is not vacuously rejecting every input: repeating known solved p57 plaintext to 553 runes, encrypting it with the same F-transparent rule, and inverting it retains legal paths for both signs. The positive-control end states are:

| Sign | Legal phase states | Path count |
| --- | --- | ---: |
| (C=P+K) | 534–538 (5 states) | 167,664 |
| (C=P-K) | 535–537 (3 states) | 7,756,686 |

The earlier first-impossible positions were not accepted as evidence until the broken source-path/scope errors in the word-interleave SFT were repaired and the complete original-input test was run. The corrected [single-file SFT](../sims/lp2_five_numbered_mix_primephi_sft.cjs) passed Node.js 22 under a manual `workflow_dispatch` run: [44527425170](https://github.com/FlareZ123/liber-primus/actions/runs/44527425170).

**Decision:** reject only the exact p56 prime-totient/F-transparent transfer to the as-printed, rune-round-robin and whole-word-round-robin 1→5/5→1 streams under both signs. This does not refute other operations on the five passages, establish that the passages are not ciphertext, or authenticate the interpretive word `MIX`. No unknown-page plaintext or key is recovered. Do not reopen these ten variants without a new independent source selector.


## Both historical 2014 order-five squares applied to the five numbered streams

**Original-source family (Agent48, 13 November; Agent49 extension, 23 November).** Earlier tests used the five Wisdom *rows as separate five-symbol keys* or merely interleaved the five passage streams. The historical 2014 archive also preserves a different 5×5 square with common line total **3301**, independently of the 5×5 Wisdom square with total **1033**. The 2014 participant reconstruction describes the squares as form-submission answers, and transcribes a PGP-signed request to submit them to a hidden service; this established historical *use* does not select a manuscript decryption operation ([2014 retrospective](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29), [archived three-square matrix text](https://github.com/scream314/cicada3301/blob/master/assets/2014/stage07/magicsquares.txt)). A materially different possibility is to combine the five simultaneously aligned ciphertext symbols by an actual invertible linear **5×5 mixing matrix** over GF(29), using an authentic complete 2014 order-five square. The source contains two independent motivations: five numbered passages, and the historical squares' exact five-by-five geometry. The original LP1 text also names the totient operation. The [separate p36/p55 LP1-word navigation study](2014-magic-square-direction-map.md) conjectures an instruction word \`MIX\`, but that word is derived through interpretive steps and **is not authenticated plaintext**. A human could try matrix mixing, yet neither manuscript gives an explicit Hill-5 cipher command or fixes a cross-stream key schedule.

The five original passage lengths are **139, 91, 98, 96, 129**. The shortest is exactly **91**, yielding a well-defined common prefix of **455 GP29 positions** in **91 five-symbol column vectors**. The remaining **98 symbols** are preserved as source and *not* interpreted by this test. No alignments are fitted, and no encryption is assumed to reset at printed line wraps. Both historical order-five squares are now tested: (a) the 1033 Wisdom square and (b) the distinct first 2014 square with row/column/diagonal total 3301. For each, using raw integers or LP1-instructed Euler φ modulo29 and then choosing the printed orientation or its transpose gives exactly **eight** source-defined inverse interpretations. Their respective GF29 determinants are **3/28** for raw/φ Wisdom, and **10/23** for raw/φ 3301. The source does not independently command matrix mixing or choose between these key interpretations. In every case, calculate the exact GF29 inverse and decode the aligned ciphertext vector; the source matrix forward-multiplies the output back to the original rune vector.

The source matrix is:

    272 138 341 131 151
    366 199 130 320  18
    226 245  91 245 226
     18 320 130 199 366
    151 131 341 138 272

It reproduces row/column totals 1033. Its cellwise \`φ(n) mod29\` matrix is:

    12 15 10 14  5
     4 24 19 12  6
    25 23 14 23 25
     6 12 19 24  4
     5 14 10 15 12

The independent 3301 square has rows `434 1311 312 278 966`; `204 812 934 280 1071`; `626 620 809 620 626`; `1071 280 934 812 204`; `966 278 312 1311 434`. All five rows, five columns and both full diagonals sum to 3301. Its φ cells modulo29 are `[6,9,9,22,3]`, `[6,17,2,9,25]`, `[22,8,25,8,22]`, `[25,9,2,17,6]`, `[3,22,9,9,6]`.

**Original-input outcome (same fixed five 91-rune original prefixes):**

| Direct original-source matrix inverse | Invertible GF29 determinant | IoC, 455 decoded symbols | Same 455 original ciphertext symbols |
| --- | ---: | ---: | ---: |
| Raw Wisdom / printed | **3** | **0.03358667764** | **0.03448709880** |
| Raw Wisdom / transposed | **3** | **0.03494215036** | 0.03448709880 |
| Totient Wisdom / printed | **28** | **0.03408045699** | 0.03448709880 |
| Totient Wisdom / transposed | **28** | **0.03471946556** | 0.03448709880 |
| Raw 3301 / printed | **10** | **0.03432250569** | 0.03448709880 |
| Raw 3301 / transposed | **10** | **0.03419664036** | 0.03448709880 |
| Totient 3301 / printed | **23** | **0.03320908167** | 0.03448709880 |
| Totient 3301 / transposed | **23** | **0.03416759452** | 0.03448709880 |

Each candidate produces disconnected ciphertext-like GP tokens; for example, the first passage's raw printed inverse begins \`NGWREDTHIAWMREONGJAIBLYRRYEGPAHRLEAWOEEAEA...\`, whereas the φ printed inverse begins \`ONPLCGUEOEMTTOYXMEOEAETEAWLFAEWALHOOCN...\`. No sustained readable GP-native prose appears in any of the five independently recovered streams for **any of eight** source-square models. In the new 3301 cases the individual 91-rune lanes have IoCs **0.02955–0.03712**, versus **0.06032** for the untouched first 91 known-solved p57 GP29 runes. Exact inverse-to-forward source replay succeeds **455/455** for each of the eight models; more importantly, each also encrypts and recovers a **455/455 independently solved p57-GP plaintext plant** using precisely the declared matrices. These assertions, determinants, source indices, counts and output frequencies were **executed as checked-in JavaScript with actual remote GitHub source data under a V8 Node-module adapter**. No native Node22 Actions execution is claimed.

[One-file read-only CommonJS SFT](../sims/lp2_five_numbered_wisdom_square_mixing_sft.cjs) reproduces the entire test from \`resources/liber-primus/lp2-corpus.json\`. This excludes **only the eight direct 5×5 same-index mixed-column source-square inverses on the natural 91-vector common prefix** as a plaintext explanation; an unknown per-position secondary pad, alternative stream start, or an authored variable-length completion would be a different model requiring external evidence. Direct matrix reuse produces no key or plaintext. Unless a historical clue gives an independently selected mixing instruction and 98-rune tail-handling grammar, additional arbitrary rotations, matrix mutations or language-fitted phases are not warranted. The 3301 first-square branch is a completed original-input test, with no author-selected plaintext key.


## The exact solved-LP1 text keys named by the 1033/3301 header (Agent49, 23 November 2026)

The two cuneiform values point directly to independently solved earlier LP1 material: the **1033 magic square** follows the original `SOME WISDOM` prose, and the **3301 magic square** follows `AN INSTRUCTION` in the final solved LP1 section. Thus the actual adjacent **GP29 plaintext**, already available to a human solver in 2014, is a stronger finite operand candidate than an arbitrary later book or wordlist. Preserve the full 157 GP29 runes in the source `0_wisdom` section, including the mixed word/rune square text; preserve the corresponding complete 89 GP29 runes in solved `jpg229`. No free transliteration, key selection or starting phase is needed. This is a candidate **source key**, not a source-authenticated command to reuse the text.

One straightforward reversible receiver applies the established historic GP29 additive running-key rule at the actual red numeral boundaries. Four distinct source-readable key assignments were frozen: repeat the entire 1033 text separately for each item; repeat the 3301 text separately; alternate the two texts at each item's numeral (starting with 1033); or concatenate the two and advance continuously through all 553 original runes. Both additive signs are checked, eight fixed original-input inverse models in total. Every original item is exactly reproduced by the forward operation. On the genuinely unchanged five original numbered passages, the complete 553-rune decoded IoCs, grouped as negative/positive additive inverse, are:

| Key/frame from actual solved LP1 | GP29 IoC of all 553 decoded original runes |
| --- | --- |
| 1033 complete text, each numeral reset | **0.0337094 / 0.0348167** |
| 3301 complete text, each numeral reset | **0.0354195 / 0.0341353** |
| 1033/3301 alternate at numeral boundaries | **0.0347905 / 0.0343908** |
| 1033 then 3301 concatenated, continuous | **0.0351312 / 0.0342532** |

Each is nonprose, including original untouched items 2–5. A fully source-native, independently known p57 control encrypts and recovers **553/553** GP29 symbols under every exact contract. A separate **all-path literal-F skip** transfer, matching the actual solved Cicada p56 plaintext-F passthrough with no key advancement, is even more decisive: both signs of the 1033 text terminate with zero legal paths at item1 local rune **45/110** respectively, and the 3301 text at rune **87/12** (zero based); the other two architectures use the same 1033 first item and also fail. The implemented DP grants all legal ambiguous ciphertext F branches and passes authentic solved-native planted controls. **No complete legal F-skip inverse exists for any of these eight directly keyed models.**

[SFT source, source-native planted forward test and all-path F gate](../sims/lp2_cuneiform_1033_3301_solvedtext_runningkey_original_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45162055651). An arbitrary 2014 prose running key remains a wider hypothesis, but these **two unmodified, author-visible key operands** and their natural clocks are now tested without one recovered plaintext rune.

## The cuneiform numbers themselves as starting primes of the solved p56 operation (Agent49, 23 November 2026)

Both original repeated numeral values **1033 and 3301 are prime**, and independently solved LP1 explicitly says the primes and Euler totient are sacred. The genuinely solved p56 cipher advances through successive primes, using `φ(p) mod29 = (p−1) mod29` as its rune shifts and a nonadvancing literal-plaintext-F rule. This motivates one minimal, fully typed numerical transfer: **begin its already authenticated operation at 1033 or 3301 itself**, with the original first red-numbered rune of item1 at phase zero, then advance continuously across all 553 source runes. No arbitrary key, magic-square reshuffle, new modulus or phase search is introduced. No archival source explicitly orders this seed transfer, so the premise is conditional.

Exact exhaustive F-transparent inversion runs all legitimate advancing/nonadvancing histories, distinguishing a literal F from accidental cipher F. This source-fixed operation is **algebraically impossible very early on original item1**, regardless of underlying plaintext language:

| Authenticated prime-seed candidate | Direct non-F source IoC, 553 runes, subtract/add inverse | First original symbol where no F-transparent decryption path survives, subtract/add inverse |
| --- | --- | --- |
| 1033 | **0.03428597636 / 0.03421390571** | **31 / 22** |
| 3301 | **0.03370941112 / 0.03454805147** | **19 / 29** |

All four non-F direct inverses also have nonlinguistic original plaintext shape, and the same complete decoders forward-reproduce all 553 original runes. Independent authentic solved p57 plaintext planted through the **exact F-transparent receiver** replays all 553 symbols under each of four cases, so the finite contradiction is a property of original ciphertext, not a broken skip algorithm. Red numeral reset per passage cannot rescue any candidate, because each fails within the first 139-rune unit.

The same original red **1–5** labels also fix a second direct interpretation: numeral *i* selects the *i*th prime `2,3,5,7,11` as that item's own first successive-prime key, with a natural reset at each numeral. This avoids inventing page seeds or resynchronizing to prose; the 1033/3301 header and solved LP1 totient text are the only historical motivations for the transfer. Both signs are algebraically impossible for **all five** intact original units with exhaustive p56 F-transparent tracking:

| Direct ordinal start for original item | 1 at 2 | 2 at 3 | 3 at 5 | 4 at 7 | 5 at 11 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `P=C−φ(prime)` first impossible zero-based item rune | **1** | **25** | **5** | **12** | **114** |
| `P=C+φ(prime)` first impossible zero-based item rune | **13** | **24** | **40** | **20** | **7** |

The non-F direct GP29 output of all 553 original runes scores **0.03470530** and **0.03402390** IoC for subtraction/addition; full native p57 plants survive every respective F history. There is no source evidence to introduce a second prime phase or masked private F marks to rescue the contradiction.

[Exact original-input prime-chain and red-ordinal SFT](../sims/lp2_cuneiform_1033_3301_primechain_original_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45163040605). These six direct prime-start p56 transfers and the eight source-text keys explain no original unknown plaintext. The source still does not prescribe the missing encoder operation for the five numbered statements; further private shifts, book texts or retrospective number fits cannot be inferred from these negatives.

## A word-role source split unique to numbered passage 3 (Agent49, 23 November 2026)

A distinct literal application of the solved final p57 instruction **"shed our own circumferences; find the divinity within"** does not require a whole-page key or the speculative earlier page-number map. At the exact original red item **3** on physical p37, glyph offsets **[91,189)** delimit **25 complete printed words with 98 GP29 runes**. Peeling **one first and last rune per word**, retaining the one-rune word as an exterior glyph, yields two equal, disjoint, source-ordered channels: **49 strictly interior runes and 49 exterior runes**. The other four red-numbered passages give interior/exterior counts respectively **79/60**, **51/40**, **58/38** and **74/55**. Thus the third item alone supplies **two full 7×7 grids**, exactly the dimension of the historical **2014 1033-sum 7×7 magic square** printed in the earlier stage10 form. Its central cell is **331**, also the original stage11 HTML div identifier. The geometrical connection is worth recording as a candidate human solve path, but neither the overlap nor that earlier number proves the author intended such a split.

Crucial arithmetic qualification: given a 98-rune passage in 25 complete words with exactly one singleton, **49/49 follows automatically** from the one-peel rule (`exterior = 2×25−1 = 49`). The observed correspondence is therefore **one matched word-count/length shape**, not three independent numerical miracles. The original item3 word lengths are `[3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3]`. The exact original rune streams, in standard GP29 transliteration, are:

- One-peel **inside**: `UNELIFDAJJNGYEOPTEAAEWCJTHOTHGSGAIOEDAWIANGIADFBSGOEUCAETIGMG`
- One-peel **outside**: `DPWARWAEXNGFBXDAAEJNGAUEAEOREAEMAEHIOEEAHIAUOIAHJIBMTBFGERYAW`

Six minimal direct reversible consumers were predeclared on the 49 inner symbols using the **unmodified** historical 7×7 square as a GF29 matrix: direct `inside ± outside`; `B⁻¹(inside ± outside)(B⁻¹)^T`; and `B⁻¹ inside (B⁻¹)^T ± outside`, where the arrays are filled row-major. These fully retain the original 49 exterior runes as a source operand without fitting signs to output. Their resulting exact original IoCs are respectively **0.03316327 / 0.04081633**, **0.04166667 / 0.03741497**, and **0.03911565 / 0.03231293**. All six source-shaped 49-rune outputs remain disconnected/unreadable; **each exact inverse/forward pair replays 49/49 authentic original inside runes and 49/49 independently source-native p57 planted plaintext symbols**. For reference, the original inner/outside rune-stream IoCs are 0.02806122 and 0.02976190, indicating no exposed natural-language text in either half.

[One-file source-exact Node22 SFT](../sims/lp2_cuneiform_item3_shed_7x7_original_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45164986192).

### Typed source phrase: exact solved-LP1 DIVINITY key on the word interiors

The original solved **p57 sentence itself names "DIVINITY" and "WITHIN"**, giving a more explicit first-operation/key hypothesis than the square's numeric matrix: first peel the original 25 item3 words, then run the **actually solved LP1 DIVINITY GP29 Vigenère law** `P=(C−K) mod29` with its source-authentic 8-symbol key indices **[23,10,1,10,9,10,16,26]** and **literal plaintext F nonadvancing/pass-through**. No key, phase, sign or word placement is optimized.

The original item3 intact **98** runes fail that exact decoder's F-transparent algebra at rune **0**, as do its exterior **49** runes. The strictly interior **49**, however, permit **exactly one** complete legal plaintext history, advancing **48** key positions. It yields, in GP transliteration, `WEABIUFPHXBJAETHRGEOEAPAINGDNGMEEOXNEOXXLUIABOEMHCMAEWAAGUAEON`, with GP29 IoC **0.02721088435**; this is not coherent plaintext or a plausible original LP narrative. The original source has two ciphertext F symbols in those 49 rune positions; the legal history resolves their semantics without a guessed skip mask.

The same fixed, zero-phase one-peel plus authentic DIVINITY law applied independently to **all five** red-numbered units gives the following **holdout** decision:

| Original red item | Complete untouched runes | One-peel strict interior / exterior | Intact legal decrypt? | Interior legal decrypt? | Exterior legal decrypt? |
| ---: | ---: | ---: | --- | --- | --- |
| 1 | **139** | **79 / 60** | No | **No**, fails interior offset **20** | No |
| 2 | **91** | **51 / 40** | No | No | No |
| 3 | **98** | **49 / 49** | No | **Yes**, 1 path, IoC 0.02721088 | No |
| 4 | **96** | **58 / 38** | No | **Yes**, 1 path, IoC 0.03690260 | No |
| 5 | **129** | **74 / 55** | No | No | No |

The second surviving item4 interior produces the incoherent 58-rune string `BCINAWEAOELPWREIAITHLHEXBSHEAJTHRSWHEWWCLNXSXTHWJEOYCOEJITGICDNAEOTH`. **The necessary item1 139-rune and independent item2 91-rune holds fail.** Algebraic validity of 2 of 5 isolated interior subsets therefore cannot justify claiming a keyed source instruction or extending to arbitrary additional layers.

The literal *unknown-language* objection can be bounded without pretending that any old ciphertext must be English. To test the actual register of **nine independently solved Cicada GP29 sections**, a deterministic seed `0x33017a43` samples **30,000 planted authentic solved words** with each candidate's **exact original printed word-length pattern**, peeling their interiors in the same way. For the length49 item3, the lowest of those 30,000 solved-native IoCs is **0.04251700680**; for length58 item4 it is **0.04174228675**, with **0/30,000 native register controls at or below either surviving decoded IoC**. Independent contiguous solved-native rune-window controls produce **2,547** 49-rune and **2,466** 58-rune windows, with minima **0.03911565** and **0.04113733**, again above the corresponding candidate outputs. These empirically reject coherent native Cicada narrative prose under this exact old cipher and source-selected interior shape; they do **not** exclude a deliberately nonlinguistic intermediary or any cipher not actually specified by the solved phrase. Planted authentic p57 source-native positive text of lengths **49 and 95** is encrypted and recovered exactly by the same F-skip machine.

[Original-source SHED + historical DIVINITY opcode + five-unit holdouts + native-wordshape SFT](../sims/lp2_cuneiform_item3_shed_divinity_original_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45166346344).

### Source-key without imported square cells: four exact 7×7 two-tile matrix quotients

The same original 49 exterior + 49 interior GP29 runes can themselves form two complete **invertible GF29 7×7 matrices** `O` and `I` (determinants **15** and **21** respectively). The source supplies the two tiles physically and shows an authentic 7×7 magic square. A finite alternative to *applying its particular cell values as an encryption key* is that the exterior itself is the transmitted **left or right matrix factor** in `I = O·P` or `I = P·O`. Test precisely the two left/right quotient inverses and the two corresponding inside/outside role swaps, with row-major fill and no fitted permutations or keys. Each original 49/49 matrix equation and an independently solved p57 49-rune plaintext plant reencrypts exactly.

| Original typed 7×7 equation | Recovered GP29 matrix P, flattened IoC | Six-rune `APPEND` code-point run? |
| --- | ---: | --- |
| `I = O × P` => `P = O⁻¹ × I` | **0.04336735** | **Yes**, starts at recovered zero-based rune **5** |
| `I = P × O` => `P = I × O⁻¹` | **0.03911565** | No |
| `O = I × P` => `P = I⁻¹ × O` | **0.04336735** | No |
| `O = P × I` => `P = O × I⁻¹` | **0.02551020** | No |

The first quotient's exact 49-rune GP transliteration is `GOEORJAPPENDIAEOGIAAHMEMEEOWDPAEWTAEDMCIEOSMOCHOEOIAMOYGWM`. The fragment **APPEND** is a genuine six-*rune* GP token sequence `[24,13,13,18,9,23]`; it is not an artifact of the multi-letter transliteration of AE/EO/IA/NG/TH. This short imperative is an interesting **post-observed plaintext-island candidate**. Crucially, its preceding and following text is disconnected, the other three quotient receivers do not reproduce it, no independent original numbered unit has the same equal 49/49 shape, and the first-party cuneiform/2014 square instructions do **not** specify matrix division or the left-factor order. A single English word discovered after exploring many models is **insufficient to authenticate unknown-page plaintext**. Preserve it as a locked potential discriminator, not as a deciphered instruction; demand independent adjacent prose, a creator-directed equation/ordering or a 91+ rune withheld receiver that works *without* retuning.

[Original-source quotient and native positive SFT](../sims/lp2_cuneiform_item3_two_tile_matrix_quotient_original_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45167490260).

**Research decision:** The 25-word third passage (also a 5×5 word-count footprint), its balanced 49/49 interior/exterior pair and the named historical DIVINITY key are reproducible human-visible inputs. No intact original item1 or item2 is decrypted by the source-authentic opcode, and no complete item3 plaintext is recovered by the exploratory matrix quotients. The isolated six-rune APPEND does not overcome the missing author-selected **second opcode** and independent original holdout. Preserve the role split and exact candidate operation as exploratory work without promoting a fragment to the authoritative solved record.

## Native JPEG glyph readback (Agent 27, 11 November 2026)

A separate image-only nearest-template readback was run on the original scans 53–55. Its 29-symbol reference set is trained only on source-checked physical p43 (scan 60): 274 glyphs, all 29 GP symbols, with **274/274 leave-one-out exact classification**. No p36–p38 target glyph labels enter training.

The five numbered passages contain **553 target runes** over 26 printed lines. After one source-geometry segmentation correction, the readback matches the canonical transcription **553/553**, with paragraph counts **139, 91, 98, 96, 129**. No rune transcription correction is indicated.

The sole segmentation exception is p37 line 3. The vertical-projection segmenter initially merged adjacent ᚳ+ᚹ into one 88-pixel-wide crop at x=1072, yielding 23 segments for a 24-rune line. The original image has a two-column ink valley at x=1124–1125 (two dark pixels in each column); splitting at x=1126 recovers ᚳ and ᚹ. The p43-template distances are 11.4198 for the left ᚳ and 1.93518 for the right ᚹ. This is a segmentation correction, not a source-text correction. All 26 target lines then match exactly.

The image classifier validates rune identities, not punctuation. Printed line boundaries are retained from the original physical-line transcription; hyphen/full-stop word boundaries are preserved from that transcription rather than independently classified here. The red paragraph labels and p36/p38 10-dot enclosure boundaries were separately inspected on the original scans and are documented above and in [the line-coordinate source audit](numbered-paragraph-linechar-gate.md).

No before/after 7×79 inverse is warranted: the source rune stream is unchanged. The prior 7×79/78 packet tests and the 5×5 totient-shift negative remain exactly as reported; this readback authenticates their input, not their proposed operation.

Reproduce the readback and emit per-line JSON:

    python sims/lp2_cuneiform_553_image_readback.py --output im-results/lp2-cuneiform-553-image-readback.json

## New source-selected SHED transfer and page route (19 November 2026)

This is a new operation on the already source-defined five red-numbered passage objects, not another Wisdom-square inverse. The solved p57 instruction says to shed the circumference and find what is within; the p49/p55 transfer already fixes the word-level operation: recursively remove the first and last rune of each complete printed word until zero or one rune remains, retaining the single center rune when the word length is odd. Apply it separately to each of the five original passage intervals in the table above, preserving printed order. No phase, reversal, offset, modulo, or fitted correction is introduced.

The existing p49/p55 consumer is then applied unchanged: sum the surviving GP29 center indices, use that sum as a zero-based address in the 256-cell p50 table when it is in range, and convert the two-character token with the established base59 alphabet. Passage 5's sum is 271, outside the table; it is retained as 271 rather than wrapped.

| Red passage | Complete words | Surviving centers | Center sum | p50 token | Base59 value | Candidate page ordinal |
| ---: | ---: | ---: | ---: | --- | ---: | ---: |
| 1 | 30 | 17 | 199 | **0l** | **46** | **46** |
| 2 | 20 | 7 | 95 | **0Z** | **35** | **35** |
| 3 | 25 | 12 | 160 | **3r** | **229** | **50** |
| 4 | 19 | 10 | 188 | **0c** | **38** | **38** |
| 5 | 28 | 17 | 271 | outside 256-cell table | — | **58** |

The page-number column is a **hypothesis**, not part of the established SHED consumer: read values 1–58 as one-based page ordinals; for a larger prime, use its one-based prime rank, motivated by the original 2013 prime_echo sequence. Thus 229 is prime number 50 and 271 is prime number 58. Passage 1 supplies a useful redundant check: its raw sum 199 is prime number 46, independently matching its p50/base59 output 46. No division by 58, modular wrap, or zero-based page adjustment is used.

The same three small outputs also have a word reading in the repository's GP29 transliteration: **46 = GP0(ARE)**, **35 = GP0(BE)**, and **38 = GP0(WITHIN)**. ARE and BE occur in the authenticated 2016 signed message; WITHIN occurs in solved p57. These are candidate word readings, not recovered unknown-page plaintext. The dual word/number interpretation is consistent with the 2016 message's explicit distinction between words as map and numbers as direction, but it does not by itself authenticate the page rule.

The resulting one-based page ordinals **[46, 35, 50, 38, 58]** map to physical LP2 pages **[p45, p34, p49, p37, p57]**, archive scans **[62, 51, 66, 54, 74]**. This produces a source-visible alternation: the selected p45/p49 pages lie in the later repeated tree-border section, p34/p37 carry the repeated cuneiform header, and p57 is the terminal central-tree page. On the original JPEGs, p45 and p49 have pixel-identical left and right tree-border crops; p34 and p37 have a pixel-identical cuneiform-header crop. Exact crop boxes and hashes are reproduced by [the visual-target SFT](../sims/lp2_cuneiform_fivepassage_visual_targets_sft.py). The artwork is reused across sections, so these crop matches confirm the visual families but are not independent proof of the numeric mapping.

## Fixed page-route continuation test (20 November 2026)

The specified adversarial continuation is now complete. I applied the same fixed word-center SHED operation to every complete printed word on the proposed encrypted pages p45, p34, and p37 in route order, preserving page-local word order and adding no modulo, offset, reversal, key, or second transform. p49 and p57 were retained as interleaved route context/control pages.

| Page | Printed words | Odd-length centers | Center-index sum | Center stream |
|---|---:|---:|---:|---|
| p45 | 64 | 32 | 367* | `CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOH` |
| p34 | 61 | 31 | 471 | `NECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATH` |
| p49 | 18 | 6 | 103 | `IALMMXR` |
| p37 | 53 | 24 | 348 | `AEHNGITHEOUDJPTEEAAEOIGGJXYEA` |
| p57 | 20 | 7 | 52 | `ANFUWTHN` |

The three encrypted targets p45+p34+p37 produce **87 GP29 center runes**:

`CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOHNECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATHAEHNGITHEOUDJPTEEAAEOIGGJXYEA`

The full proposed page order p45,p34,p49,p37,p57 produces:

`CLEOTOSOEBUOBOPBOTLEGIMMWCNLCSJFEOHNECTFCSAMYEAGDUENAMEOEDYWISNGGYOIATHIALMMXRAEHNGITHEOUDJPTEEAAEOIGGJXYEAANFUWTHN`

Neither sequence is coherent plaintext. No word segmentation, dictionary optimization, or additional cipher layer was applied. The p57 clear page's own center stream is `ANFUWTHN`, not a readable continuation. The page-wide p49 center stream `IALMMXR` is distinct from the previously selected five-core p49 transfer that yields DIRECTION; it does not extend that local result.

\* The mechanical page parser includes a leading one-rune GP5 fragment at p45 offset0, giving 367. Excluding that single fragment gives 362, reproducing the earlier page-level sum. The p34 and p37 sums reproduce 471 and 348. Either p45 accounting leaves every sum outside the 256-cell p50 table.

The exact source-only SFT validates all 58 transcription pages against the canonical GP29 corpus, asserts the word-center counts, strings, and sums above, and reproduces the proposed route output. It passed the manual Node22 runner on the frozen branch: [Actions run 44677675970](https://github.com/FlareZ123/liber-primus/actions/runs/44677675970).

**Result:** the proposed page-number/prime-rank route does not continue under the same SHED operation. Retire it as a decoder. Retain the five-passage arithmetic and page correspondence only as provisional structural observations; do not rescue them with a second transform or a new rank convention.

The numeric derivation is reproduced by [the read-only CommonJS SFT](../sims/lp2_cuneiform_fivepassage_shed_navigation_sft.cjs). The prime-rank context is distinct from the previously rejected floor(rank/58) proposal: here 229 and 271 are themselves prime values whose ordinary one-based ranks are 50 and 58. This remains a candidate navigation layer, not an established decryption.

## Cross-round five-value packet from the 2014 magic squares and p33 cuneiform

The original 2014 source contains three magic squares:

| Square in source order | Size | Center | Magic sum |
| ---: | ---: | ---: | ---: |
| 1 | 5×5 | 809 | 3301 |
| 2 | 7×7 | 331 | 1033 |
| 3 | 5×5 | 91 | 1033 |

The p33 cuneiform numerals **1033 and 3301 are exactly the two distinct magic sums**. The signed 2013 message independently uses the explicit BASE29 example **3301→3QO**. Thus 3301 is linked across the 2013 BASE29 instruction, the 2014 magic-square sum, and p33's cuneiform numeral; 1033 is the other 2014 magic sum. This gives a credible human-visible reason to treat the cuneiform numerals as meaningful source values rather than arbitrary large numbers.

Applying the sexagesimal page:word → GP base29 positional word number → p50 row-major cell → base60 token → mod29 rune map to the five unique values in **first-seen square order** (center then sum, omitting the repeated 1033) gives:

| Source item | Number | Page:word | Selected word | Base29 value | p50 cell | Token | Base60 → mod29 | Missing-f base59 → mod29 |
| --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- |
| Square 1 center | 809 | p13:29 | TEI | 13,988 | 164 | 1j | 105 → E | 103 → T |
| Square 1 sum | 3301 | p55:1 | NG | 21 | 21 | 2H | 137 → NG | 135 → M |
| Square 2 center | 331 | p5:31 | THYEOTHJTHRU | 50,212,977,392 | 240 | 2O | 144 → EA | 142 → Y |
| Square 2 sum | 1033 | p17:13 | FREAMEAA | 3,528,831 | 127 | 3D | 193 → M | 190 → T |
| Square 3 center | 91 | p1:31 | TXELR | 11,673,664 | 64 | 22 | 122 → G | 120 → R |

This first-seen unique-by-square ordering gives **[E,NG,EA,M,G]** under base60 and **[T,M,Y,T,R]** under missing-f base59. A second natural grouping—three centers followed by the two distinct cuneiform sums, `[809,331,91,1033,3301]`—gives **[E,EA,G,M,NG]** under base60 and **[T,Y,R,T,M]** under base59. The two cuneiform values in their printed p33 order still return **[M,NG]** only under base60; base59 returns **[T,M]**.

Both base60 five-symbol orderings have the same cardinality as the five numbered wisdom passages, but neither is their direct boundary sequence: passage starts are **[L,N,D,NG,H]** and ends **[A,B,W,M,C]**. Tested the obvious direct uses of both base60 packets on the 553-rune enclosure: one constant additive shift per passage (both signs), period-5 additive key reset per passage (both signs), period-5 additive key over the concatenated passages (both signs), and one multiplicative or inverse coefficient per passage. Neither ordering produced readable text; aggregate IoCs remain in the original random-like range **0.03367–0.03562**.


### Additional five-coordinate DH-state fingerprint (Agent9, 19 November)

The same five page:word coordinates select words with rune lengths **[3,8,5,6,1]**, exactly **[e,A,g,a,1]** from the independently reconstructed DH23 state. The 2014 LP1 square method also supplies a historically attested word-number operation: sum the first 29 primes assigned to the GP symbols. Transferring that operation to these five LP2 words, then using the p50 256-cell table at prime-sum modulo256, decoding the token in base60 and reducing modulo29 gives:

| Source number | Page:word | Word | Rune length | GP-prime sum | p50 address | Token | Base60 value | Mod29 output | DH-state reading |
| ---: | --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| 809 | p13:29 | TEI | 3 | 157 | 157 | 4B | 251 | 19 | B |
| 331 | p5:31 | THYEOTHJTHRU | 8 | 210 | 210 | 06 | 6 | 6 | a |
| 91 | p1:31 | TXELR | 5 | 257 | 1 | 3p | 231 | 28 | −1 |
| 1033 | p17:13 | FREAMEAA | 6 | 399 | 143 | 2W | 152 | 7 | g+K |
| 3301 | p55:1 | NG | 1 | 79 | 79 | 1M | 82 | 24 | −g |

Thus the center-then-cuneiform ordering produces **[19,6,28,7,24] = [B,a,−1,g+K,−g]** using B=19, a=6, g=5 and K=2. The first-seen-by-square ordering [809,3301,331,1033,91] produces [19,24,6,7,28], a permutation of the same five state values; the order is still not selected. The three square sizes **[5,7,5]** also equal **[g,g+K,g]**. A separate raw-GP0-sum projection gives [-K,B,B,e,B+K], but that operation is not the 2014 historical word-number rule and is retained only as a secondary diagnostic.

A control over the other unique cell values printed in all three 2014 squares finds **44** additional values that form valid p0–p55 page:word coordinates. None reproduces the complete ordered five-pair (word length, GP-prime-output) pattern; only one isolated pair collides, at 341 → p5:41 EAXIAEL (length5, output28). This is useful specificity evidence, not a calibrated probability: the DH state was already known, and the length/state alignment and transfer of the 2014 prime-sum operation to LP2 are retrospective.

The obvious five-passage consumer was bounded rather than expanded: use each pair (word length, prime-sum-mapped output) as a period-five affine (multiplier,offset) schedule over the original 553-rune enclosure. Both natural packet orders, both multiplier/offset assignments, forward/reverse key order, reset/continuous phase, and four sign/inverse conventions give **64 variants**. Phase-specific IoCs range **0.03194–0.03820**; no linguistic result appears. This rejects only that simple affine consumer, not a different source-selected nonlinear or transposition operation.

Classification: this is a **retrospective cross-round DH-state fingerprint**, not recovered plaintext, a key, or a reversible LP2 cipher. The 2014 prime-sum rule is source-authenticated for the 2014 square, but its transfer to LP2 words and the p50 base60/mod29 projection are not author-authenticated. The #1835 dual-wordmap family audit still blocks using the p33 map as an instruction engine until an original clue fixes the coordinate expression and consumer prospectively. Reproduction is included in the SFT at ../sims/lp2_cuneiform_sexagesimal_wordmap_p50_state_sft.cjs; the historical prime-sum method is documented in 2014-magic-square-direction-map.md, and the DH state in lp2-p6-master-state-packet.md and lp2-p33-dh-layout-state-register.md.

The missing-f base59 parse remains a live alternative because it produces the independent one-root address graph described in `im-results/lp2-p50-base59-source-convergent-map.md`. Conventional base60 is favored here by the p33 marker match and by the conditional GF29 parity model in `im-results/lp2-p50-hg-single-residue-correction.md`, but the alphabet is not author-authenticated. The earlier direct ASCII byte-stream test remains negative; this route uses a narrow mod29 projection of cuneiform-selected words. Do not treat either five-symbol packet as plaintext or a validated key. A further consumer needs an independent source clue.

Reproduction, both natural packet orders, both table radices, and direct-consumer metrics are included in `sims/lp2_cuneiform_sexagesimal_wordmap_p50_state_sft.cjs`.

## Research decision

**Complete 5×5/7×7 cross-numbered source receiver (#2243, 23 November):** Five original unit lengths `[139,91,98,96,129]` yield an equal-prefix operator with five 91-rune columns and residual runes `[48,0,7,5,38]`, exactly two full 49-cell squares in printed unit order. Apply original 2014 Stage10 3301-sum 5×5 then 1033-sum 5×5 on the five-way columns, and the original 1033-sum 7×7 as a two-dimensional invertible matrix on each residual 7×7 tile; the reverse operation recovers the entire original exactly. This is a specific **source-matched, lossless decoder test**, disfavored as a GP-native plaintext inverse because output IoC **0.03410252** versus source-native **0.06094557** and no readable original words across the five complete passages. The verified positive-control implementation recovers all 553 planted native symbols. It does not identify source-authenticated paragraph semantics or rule out another historical opcode. [Reproducer](../sims/lp2_cuneiform_fiveunit_5x5_7x7_complete_original_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45092273788).

**Five-source passage shared-pad branch (#2150) resolved:** The image-numbered five GP29 passages fail a direct *unknown* reused-key five-way natural-language decode on their common 91-rune span, despite exact solved-source calibration recovering 1,360/1,365 authentic positive runes. No actual LP2 plaintext or key follows. The source’s red ordinal labels remain a possible framing clue to different architectures.


The original glyphs supply **five numbered passages and a precise 553-rune test interval**, independently image-readback verified 553/553. The direct source-square, totient, interleave, and five-way matrix inverses remain negative. The fixed p57-SHED transfer still supplies the reproducible number sequence `[46,35,229,38]` (fifth raw sum271) and a mixed candidate page correspondence `[p45,p34,p49,p37,p57]`, but the page-number/prime-rank interpretation is not authenticated. The prescribed direct continuation on p45,p34,p37 yields 87 non-prose center runes; p57's clear-page center stream is also non-prose, and the page sums remain outside the p50 table. **Retire the page-number/prime-rank interpretation as a decoder; preserve the five-passage arithmetic and page correspondence only as provisional structural observations.** Do not add modulo, offsets, reversals, or alternative rank conventions to rescue it. The five-number cross-round packet carries a retrospective DH-state fingerprint through selected word lengths and the 2014 GP-prime-sum operation, but the ordering and operation that would consume it remain unresolved; the 64-variant period-five affine consumer is negative. The p33 dual-wordmap audit continues to block this map as an instruction engine. The earlier seven-page cuneiform issue's conclusion remains: the repeated header alone does not select an original-cipher inverse.

**Inputs:** `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-ink-annotations.json`, `resources/cicada2014-openpuff-magic-squares.txt`, and the original JPEGs named above. The source-square arithmetic and roundtrips remain in the original test file; the new SHED/page-route arithmetic is in ../sims/lp2_cuneiform_fivepassage_shed_navigation_sft.cjs, and its original-image crop checks are in ../sims/lp2_cuneiform_fivepassage_visual_targets_sft.py.
