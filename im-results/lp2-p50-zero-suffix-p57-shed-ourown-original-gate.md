# Original p50 double-zero suffixes align with solved p57 SHED / OUR OWN

**Agent18, 22 November 2026. Classification: original-source alignment and one frozen unsuccessful consumer.** This is a conditional reading of the table. No authentic unknown-page plaintext, creator-selected rune key, p56 hash preimage or complete cipher inverse has been recovered.

## Finding and missing operation

The original numerical insert across p49–51 contains 256 two-character tokens in 32 rows by 8 columns. **The two zero-token positions and their 36-cell interior were already established** in the [earlier source-bracket study](lp2-grid-two-zero-address-36-punctuation-bridge.md) and closed Director issues [#1426](https://github.com/FlareZ123/liber-primus/issues/1426) and [#1631](https://github.com/FlareZ123/liber-primus/issues/1631). The independent *increment here* is the suffix-length match to the solved phrase and its specified adjacent p51 receiver. Exactly two tokens are literal **00**:

| Zero-based cell | Zero-based row,column | Inclusive suffix length |
| ---: | ---: | ---: |
| 192 | 24,0 | **64** |
| 229 | 28,5 | **27** |

The authentically solved p57 command says **SHED OUR OWN**. In the original Gematria Primus index alphabet, SHED = [15,8,18,23], sum **64**. OUR OWN = [3,1,4,3,7,9], sum **27**. The two marks divide the last 64 cells into 37 beginning at 192 and 27 beginning at 229, counting their initial zero cells.

The very first encrypted word immediately after the table, on physical p51, is **ᚹᚹᛈ**, GP **WWP**, indices [7,7,13], sum **27**. It is the only complete printed p51 word with GP index sum 27. This is also the sole page-opening doublet among the 55 original rune-bearing unknown physical pages. These original source coincidences make a specific receiver worth interrogating, although neither determines a byte-to-rune value-change operation.

One plausible human route is that solved SHED tells a reader to shed 64 table cells, while OUR OWN selects the 27-cell nested suffix or a 27-rune receiving span. The weakest premise is the interpretation of the two literal zero tokens as row-major delimiters. Nothing on the original page uniquely instructs that reading, nor specifies where a decoded key begins. Many candidate words and addresses were available while the alignment was noticed, so do not quote an uncorrected chance probability. The simpler rival is coincidental arithmetic in the numerical register.

This observation is distinct from the prior [conditional base59 shell and circumference route](lp2-p50-radix-shed-circumference-divinity.md), which treats SHED as dropping digit f. Neither original-source proposal authorizes the other's radix or downstream cipher.

## Stronger literal p51 geometry: source-shaped Hill8/Hill7/Hill6 inverses

On the actual original p51 scan (68.jpg), the table occupies nine printed eight-token lines. The first line closes the preceding 24×8 table block; the final **eight** printed lines, whose first token is 00, form a literal **8×8 matrix**, cells192–255. This is a stronger *source-authored shape* than the hypothetical 4³ or 3³ cube because eight-column rows are physically printed. GP0(SHED)=64 points numerically at this literal 8×8 square, while the 8×8 circumference is **28** cells and its one-cell-peeled core **6×6 = 36** cells.

**Crucial geometric distinction:** the two printed zero cells occupy positions **(0,0)** and **(4,5)** in the physical square, with zero-based local row and column. The **36 source cells between them in row-major order are different from the actual 36 geometrical interior cells**. The two subsets overlap at only **22 of36** positions; 14 of the zero-bracket cells lie on the physical outer rim. No rotation or reflection can fix this identity because the second zero is interior. The zero-bracket 36-byte packet investigated in closed #1426 therefore cannot automatically be identified with a source-natural 6×6 interior. A cipher reading must distinguish those operands.

The physical shape gives three small, reproducible, bounded keys over GF(29). The manuscript uses 29 authentic rune values, and previous Cicada stages include matrix and permutation tasks. Take the source cells in their printed row-major order and reduce each numeric value modulo29. Evaluate two numeral registers (conventional base60, and conditional original-digit-absent-f base59), and both standard Hill orientations (column-vector and row-vector), with no fitted page offset or replacement keyword:

| Frozen source geometry | Key cells | Conventional base60, rank/determinant mod29 | Conditional base59, rank/determinant mod29 |
| --- | ---: | --- | --- |
| The complete literal printed square | 8×8 = 64 | **8 / 12**, invertible | **8 / 7**, invertible |
| Remove top row and left column at the original corner-00 | 7×7 = 49 | **7 / 4**, invertible | **7 / 17**, invertible |
| Peel the entire one-cell perimeter, retaining the physical interior | 6×6 = 36 | **5 / 0**, **singular** | **6 / 24**, invertible |

The 7×7 is a separately bounded historic-practice candidate, because authenticated 2014 Cicada material used a seventh-order square, although **none of that material commands this specific extraction**. The 6×6 base60 singularity is invariant under merely rotating or reflecting that physical key. Base59 makes it invertible, which is a finite **necessary** radix discriminator for this exact Hill6 hypothesis, not independent evidence that base59 is correct.

For **all five invertible keys**, explicitly invert the matrix in GF(29). Apply it to untouched p49 (66 runes), p51 (92 runes), and p55 (76 runes), preserving every available complete block and reporting any trailing remainder. Both normal matrix orientation conventions are frozen. The GP29 output in all **30 original input cases** is pseudorandom-looking, with no recognizable sustained English or native Cicada plaintext; e.g. the conventional base60 Hill8 inverse begins on p51:

    NG IA G X NG D AE A W NG W X H R N G D EA L J ...

The conditional base59 Hill6 inverse begins on p51:

    B W P C D B H O A O H D E NG O M AE O I S ...

These are actual original-cipher inverses, not synthetic fitting. The complete first-party source bytes, matrices, decoded runes and output scores are in [the read-only nested-square original Hill SFT](../sims/lp2_p50_final8_square_hill6_original_sft.cjs). The SFT demonstrates full exact GF29 forward/backward reconstruction for every retained ciphertext block and gives an 80/84-rune independently solved p56 native-text roundtrip as a positive implementation control. The test rejects **these exact source-addressed Hill6/Hill7/Hill8 operations**, including both numeral interpretations and standard matrix orientations; it does not exclude every nonlinear or stateful operation on the same original square.

## Source-frozen immediate consumer

Take exactly the last **27** table values, cells229–255, as a key for the first **27** unmodified p51 runes from offset0, motivated solely by the adjacent placement and matching 27. Test direct additive GP29 transfer with signs ±1 and two register alphabets: conventional base60 and conditional base59 with lowercase f deleted. No phase, receiver, alphabet, or keyword is adjusted after seeing the outputs.

| Table register / sign | Full decoded 27 GP rune spellings | IoC |
| --- | --- | ---: |
| base60, subtract | W G EO I AE IA N J G NG L I H G Y N IA EA OE L X IA X U EO S TH | 0.03134 |
| base60, add | W H X M F P M D EO E E H F O M A D E F X J D I P Y T B | 0.04274 |
| base59, subtract | W H S EO F U J S G D D EO I W F N EA TH AE OE T U E R EO E O | 0.02564 |
| base59, add | W G J B AE I B M EO T S G IA TH T A OE S Y EO N L G I Y P T | 0.03134 |

None yields coherent native prose or a useful instruction. All four exactly reproduce the original ciphertext under their forward operations, which is a basic bijective invariant rather than independent key evidence. A 27-rune score is too short for a general exclusion, so only these four literal consumers are retired. Each first key cell is zero; the first plaintext rune stays W.

The 36 cells strictly between the two marks have **34 distinct base60 values**, and only **24 distinct residues mod36**. The 26 cells strictly after the final mark have **26 distinct base60 values**, but only **16 distinct residues mod26**. Therefore the obvious direct byte-modulus reductions do not encode a 36- or 26-symbol one-to-one secret alphabet in the printed order. It remains possible to rank those bytes or invoke another conversion, but no source clue presently selects such an extra layer.

## New central-cube and independent p55 receiver (conditional)

The same original p57 phrase gives an unusually constrained *shape hypothesis*. The two GP index sums **64 = 4 cubed** and **27 = 3 cubed** are consecutive perfect cubes. The last 27 numeric cells can be regarded as one 3×3×3 solid, with its central cell at local offset13 (zero-based). Original absolute table cell **242** prints **0g**, base60 value **42**, exactly **GP0(FIND)=42**, the next active verb in the clear p57 instruction. Among all 20 complete p57 words, the admissible fixed *one-word plus next-two-words* suffix grammar (first sum greater than the next-two sum, both within256) produces exactly **five distinct candidate pairs**; SHED | OUR OWN selects observed addresses **192 and229** as its only match. This is a finite, descriptive grammar count. The grammar was noticed after inspecting the source, so the count cannot be quoted as an authorship p-value.

The six face-neighbors of the 3×3×3 center (local offsets4,10,12,14,16,22) have base60 values **234,173,141,214,56,230**. The value **56 = GP0(AND)** occurs exactly once, at local offset16, one cube-grid step from the center. Another exact source lookup already known independently from p57 is **table[42] = 0S = 28**, which points to p28's candidate READ OUT circuit. The clear phrase is FIND THE DIVINITY WITHIN AND EMERGE. This center-to-face coincidence is a useful *testable* candidate, but the original physical object is an 8-column two-dimensional print: it does not instruct a 3-dimensional remapping, a rotation or an executable inverse. The center gives FIND, not DIVINITY. No original receiver has been decoded by this cube interpretation.

Under the **GP-prime** rather than zero-index sums, OUR OWN = **76**, precisely the p55 original rune count, and the 32×8 table's outer perimeter also contains76 cells. This 76/perimeter relation was already investigated under [Director #1407](https://github.com/FlareZ123/liber-primus/issues/1407); this report does not claim it as new. It supplies a distinct, source-motivated receiving choice for the 27-cell candidate. Applying the fixed last27 source cells cyclically across **all 76 original p55 ciphertext runes**, both signs and both radices, yields only nonprose. Exact output GP IoCs:

| 27-period pad on p55 | IoC |
| --- | ---: |
| base60 subtract | 0.03474 |
| base60 add | 0.03544 |
| base59 subtract | 0.03579 |
| base59 add | 0.03193 |

Thus the obvious contiguous receivers, the immediate p51 runes and full p55, both reject the same literal direct additive pad. Neither a center-to-face navigation clue nor the 26 unique other cube bytes supplies the missing transformation. Further tuned rotations or pad traversals would need source-authored directions and a withheld full-span plaintext consequence.

## Source-locked 27-rune fractionation intermediate: p56 prime-outer gate

A standard 3×3×3 Trifid or equivalent coordinate cipher holds 27 symbols. The **2,979 original GP runes in the independent published solved-control transcription** contain no EO(index12) or OE(index22), leaving exactly a 27-rune native subset. This makes a source-motivated GP27 *intermediate* possible without claiming that the original author selected Trifid. However, untouched unknown ciphertext visibly uses all29 GP rune values, so a reversible **29-symbol outer step** is required to recover that intermediate.

The one **independently authenticated GP29 outer mechanism** in Liber Primus is p56's prime-index shift with plaintext F transparent and non-consuming. Its exact forward transform reproduces all85 original p56 ciphertext runes from the independent solved plaintext. The read-only SFT applies the exact corresponding inverse with a **state-set DP** to the untouched unknown input, allowing *both* possible interpretations of cipher rune F: unshifted plaintext F and shifted non-F. It enforces the necessary condition that every recovered intermediate belongs to the solved-source 27-rune subset. This test is **key-independent** of the unknown Trifid permutation or period.

| Physical original page | Original runes | Prime start0: first impossible rune offset | Alternative source-42 start: first impossible offset |
| --- | ---: | ---: | ---: |
| p49 | 66 | 9 | 1 |
| **p51 after numeric table** | **92** | **12** | **24** |
| p52 | 263 | 0 | 5 |
| **p55 terminal unknown** | **76** | **12** | **4** |
| **p56 authentic solved positive** | **85** | **none, complete valid path** | 1 |

Both starts are literal choices: prime index0 reproduces the independently confirmed historical p56 beginning, while proposed start42 is supplied by the source-cube center 0g=42; it is **not** a free phase search. The **p56 source positive accepts all85** and matches the known exact plaintext/ciphertext. The original p51 and p55 are impossible under either frozen prime start even before any 27-cube key permutation is applied. This retires the simple double-layer candidate **p56 prime outer ⇒ fixed GP27 cube inner** with page-local prime start0 or clue42, including source-native F transparency. It leaves non-prime outer rules, non-27 intermediates, other authenticated start conditions, and unknown historical key material undecided. Do not rescue the candidate by fitting an arbitrary prime phase or adding unmentioned escape symbols.

## Direct original p56 SHA-512 check

For both conventional base60 and the conditional drop-f base59, convert table numeric cells directly into bytes and hash each of five frozen ranges: first192, first229, all256, last64 and last27. **None of the ten SHA-512 digests matches** the 128-hex-character original p56 target:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

This finite negative does not rule out a separately encoded file, alternate serialization or undisclosed external resource.

## Research decision

Retain the exact zero-cell/suffix/solved-phrase alignment as an intermediate **source-navigation hypothesis**, not a decryption. Revisit it only if an original image, historical clue, or complete source-fixed decoder can select a byte extraction and p51 receiver without post-fitting. The next advance must yield actual bytes or a long original ciphertext plaintext with an independent holdout. In particular, the complete original-source 8×8, 7×7 and 6×6 Hill family has now failed its first direct decoding gate; any successor must specify a different original-selected operator. Do not proliferate same-table arbitrary 27-cell pad variants.

The self-contained [read-only Node22/CommonJS SFT](../sims/lp2_p50_zero_suffix_p57_phrase_sft.cjs) asserts both source zero positions, both solved GP sums, the original p51 prefix, the direct four reversible consumers, alphabet uniqueness counts, the independently positive-controlled p56 prime-to-GP27 output-type obstruction, and all ten SHA-512 negatives. Its inputs are the immutable [canonical corpus](../resources/liber-primus/lp2-corpus.json) and [original-table transcription](../resources/liber-primus/lp2-grid-256.json); original p51 is scan 68.jpg, and solved p57 is scan 74.jpg in the [image atlas](../resources/liber-primus/). Run as Node.js 22 from repository root or any current working directory. [The source-frozen Windows Node22 CI execution passed](https://github.com/FlareZ123/liber-primus/actions/runs/45004597599). This report belongs in supporting evidence; no unknown text was deciphered.
