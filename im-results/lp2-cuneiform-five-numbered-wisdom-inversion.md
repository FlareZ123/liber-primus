# Five numbered cuneiform passages: source-square tests and SHED navigation

**Status (updated 20 November 2026):** The exact printed 553-rune, five-numbered passage enclosure remains independently image-readback verified 553/553. Direct Wisdom-row totient masks, five-passage interleave followed by the p56 cipher, five-way Wisdom 5×5 mixing, and literal ordinal/GF(29) share tests remain negative.

**Scope clarification (20 November 2026):** the negative tests here cover row-wise/additive operations on the 553-rune numbered enclosure. They do not test the distinct 5×5 phi-grid matrix product on the source-selected p36 fragment37, which produces an intermediate DH state packet rather than plaintext; see [the phi-grid state-route synthesis](dh3301_phi29_wisdom_square_selector_audit.md). This clarification does not change any negative result in this report. The fixed p57-SHED transfer still yields the provisional number sequence **[46, 35, 229, 38]** (fifth raw sum 271), and the mixed direct-page/prime-rank interpretation still proposes **[p45, p34, p49, p37, p57]**. The decisive direct continuation has now been tested with the same word-center SHED operation on p45, p34, and p37 in the proposed order: 87 center runes produce non-prose strings, and the page sums remain outside the 256-cell p50 table. Retire the page-number/prime-rank interpretation as a decoder; preserve the five-passage arithmetic and page correspondence only as provisional structural observations. Full details below.

## Human-visible selection and scope

The repeated 1033/3301 cuneiform headers span seven physical LP2 pages (p33–p39), but their artwork is a single repeated template. Within that enclosure the authors **printed five red decimal numerals 1–5**, one at the beginning of each successive passage across physical pages 36–38. These five numbered passages are bracketed by **red 10-dot punctuation at p36 rune cut 99** and **p38 cut 186**. Both cuts are independently preserved in the ink annotations. The numeral positions were manually inspected on the original p36, p37, p38 JPEGs (archive files `53.jpg`, `54.jpg`, `55.jpg`; physical LP2 p maps to archive p+17). The SFT checks the canonical line lengths; the native-JPEG readback below independently classifies all 553 target rune identities from p43-only templates.

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


## LP1 Wisdom 5×5 matrix applied to the five numbered streams

**Agent48's original-source test, 13 November 2026.** The previous tests used the five Wisdom *rows as separate five-symbol keys* or merely interleaved the five passage streams. A materially different possibility is to combine the five simultaneously aligned ciphertext symbols by an actual invertible linear **5×5 mixing matrix** over GF(29), using the visible complete Wisdom square itself. The source contains two independent motivations: five numbered passages, and the authentic 2014 square's exact five-by-five geometry. The original LP1 text also names the totient operation. The [separate p36/p55 LP1-word navigation study](2014-magic-square-direction-map.md) conjectures an instruction word \`MIX\`, but that word is derived through interpretive steps and **is not authenticated plaintext**. A human could try matrix mixing, yet neither manuscript gives an explicit Hill-5 cipher command or fixes a cross-stream key schedule.

The five original passage lengths are **139, 91, 98, 96, 129**. The shortest is exactly **91**, yielding a well-defined common prefix of **455 GP29 positions** in **91 five-symbol column vectors**. The remaining **98 symbols** are preserved as source and *not* interpreted by this test. No alignments are fitted, and no encryption is assumed to reset at printed line wraps. Two **independently supplied** 5×5 invertible matrices are considered: (a) source Wisdom cell integers modulo29, determinant **3**, and (b) the original LP1-instructed Euler φ of each source cell modulo29, determinant **28**. For each, the original printed orientation and its transpose give exactly **four** direct inverse interpretations. In every case, calculate the exact GF29 inverse and decode the aligned ciphertext vector; the source matrix forward-multiplies the output back to the original rune vector.

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

**Original-input outcome:**

| Direct original-source matrix inverse | Invertible GF29 determinant | IoC, 455 decoded symbols | Same 455 original ciphertext symbols |
| --- | ---: | ---: | ---: |
| Raw Wisdom / printed | **3** | **0.03358667764** | **0.03448709880** |
| Raw Wisdom / transposed | **3** | **0.03494215036** | 0.03448709880 |
| Totient Wisdom / printed | **28** | **0.03408045699** | 0.03448709880 |
| Totient Wisdom / transposed | **28** | **0.03471946556** | 0.03448709880 |

Each candidate produces disconnected ciphertext-like GP tokens; for example, the first passage's raw printed inverse begins \`NGWREDTHIAWMREONGJAIBLYRRYEGPAHRLEAWOEEAEA...\`, whereas the φ printed inverse begins \`ONPLCGUEOEMTTOYXMEOEAETEAWLFAEWALHOOCN...\`. No sustained readable GP-native prose appears in any of the five independently recovered streams. Exact inverse-to-forward source replay succeeds **455/455** for each of the four source models; more importantly, each also encrypts and recovers a **455/455 independently solved p57-GP plaintext plant** using precisely the declared matrices. These assertions, determinants, source indices, counts and output frequencies were **executed as checked-in JavaScript with actual remote GitHub source data under a V8 Node-module adapter**. No native Node22 Actions execution is claimed.

[One-file read-only CommonJS SFT](../sims/lp2_five_numbered_wisdom_square_mixing_sft.cjs) reproduces the entire test from \`resources/liber-primus/lp2-corpus.json\`. This excludes **only the four direct 5×5 same-index mixed-column source-square inverses on the natural 91-vector common prefix** as a plaintext explanation; an unknown per-position secondary pad, alternative stream start, or an authored variable-length completion would be a different model requiring external evidence. Direct matrix reuse produces no key or plaintext. Unless a historical clue gives an independently selected mixing instruction and 98-rune tail-handling grammar, additional arbitrary rotations, matrix mutations or language-fitted phases are not warranted.


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

The original glyphs supply **five numbered passages and a precise 553-rune test interval**, independently image-readback verified 553/553. The direct source-square, totient, interleave, and five-way matrix inverses remain negative. The fixed p57-SHED transfer still supplies the reproducible number sequence `[46,35,229,38]` (fifth raw sum271) and a mixed candidate page correspondence `[p45,p34,p49,p37,p57]`, but the page-number/prime-rank interpretation is not authenticated. The prescribed direct continuation on p45,p34,p37 yields 87 non-prose center runes; p57's clear-page center stream is also non-prose, and the page sums remain outside the p50 table. **Retire the page-number/prime-rank interpretation as a decoder; preserve the five-passage arithmetic and page correspondence only as provisional structural observations.** Do not add modulo, offsets, reversals, or alternative rank conventions to rescue it. The five-number cross-round packet carries a retrospective DH-state fingerprint through selected word lengths and the 2014 GP-prime-sum operation, but the ordering and operation that would consume it remain unresolved; the 64-variant period-five affine consumer is negative. The p33 dual-wordmap audit continues to block this map as an instruction engine. The earlier seven-page cuneiform issue's conclusion remains: the repeated header alone does not select an original-cipher inverse.

**Inputs:** `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-ink-annotations.json`, `resources/cicada2014-openpuff-magic-squares.txt`, and the original JPEGs named above. The source-square arithmetic and roundtrips remain in the original test file; the new SHED/page-route arithmetic is in ../sims/lp2_cuneiform_fivepassage_shed_navigation_sft.cjs, and its original-image crop checks are in ../sims/lp2_cuneiform_fivepassage_visual_targets_sft.py.
