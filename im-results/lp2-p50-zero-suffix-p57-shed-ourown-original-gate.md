# Original p50 double-zero suffixes align with solved p57 SHED / OUR OWN

**Agent18, 22 November 2026. Classification: original-source alignment and one frozen unsuccessful consumer.** This is a conditional reading of the table. No authentic unknown-page plaintext, creator-selected rune key, p56 hash preimage or complete cipher inverse has been recovered.

## Finding and missing operation

The original numerical insert across p49–51 contains 256 two-character tokens in 32 rows by 8 columns. Exactly two tokens are literal **00**:

| Zero-based cell | Zero-based row,column | Inclusive suffix length |
| ---: | ---: | ---: |
| 192 | 24,0 | **64** |
| 229 | 28,5 | **27** |

The authentically solved p57 command says **SHED OUR OWN**. In the original Gematria Primus index alphabet, SHED = [15,8,18,23], sum **64**. OUR OWN = [3,1,4,3,7,9], sum **27**. The two marks divide the last 64 cells into 37 beginning at 192 and 27 beginning at 229, counting their initial zero cells.

The very first encrypted word immediately after the table, on physical p51, is **ᚹᚹᛈ**, GP **WWP**, indices [7,7,13], sum **27**. It is the only complete printed p51 word with GP index sum 27. This is also the sole page-opening doublet among the 55 original rune-bearing unknown physical pages. These original source coincidences make a specific receiver worth interrogating, although neither determines a byte-to-rune value-change operation.

One plausible human route is that solved SHED tells a reader to shed 64 table cells, while OUR OWN selects the 27-cell nested suffix or a 27-rune receiving span. The weakest premise is the interpretation of the two literal zero tokens as row-major delimiters. Nothing on the original page uniquely instructs that reading, nor specifies where a decoded key begins. Many candidate words and addresses were available while the alignment was noticed, so do not quote an uncorrected chance probability. The simpler rival is coincidental arithmetic in the numerical register.

This observation is distinct from the prior [conditional base59 shell and circumference route](lp2-p50-radix-shed-circumference-divinity.md), which treats SHED as dropping digit f. Neither original-source proposal authorizes the other's radix or downstream cipher.

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

## Direct original p56 SHA-512 check

For both conventional base60 and the conditional drop-f base59, convert table numeric cells directly into bytes and hash each of four frozen ranges: first192, first229, all256, and last64. **None of the eight SHA-512 digests matches** the 128-hex-character original p56 target:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

This finite negative does not rule out a separately encoded file, alternate serialization or undisclosed external resource.

## Research decision

Retain the exact zero-cell/suffix/solved-phrase alignment as an intermediate **source-navigation hypothesis**, not a decryption. Revisit it only if an original image, historical clue, or complete source-fixed decoder can select a byte extraction and p51 receiver without post-fitting. The next advance must yield actual bytes or a long original ciphertext plaintext with an independent holdout. Do not proliferate same-table arbitrary 27-cell pad variants.

The self-contained [read-only Node22/CommonJS SFT](../sims/lp2_p50_zero_suffix_p57_phrase_sft.cjs) asserts both source zero positions, both solved GP sums, the original p51 prefix, the direct four reversible consumers, alphabet uniqueness counts and all eight SHA-512 negatives. Its inputs are the immutable [canonical corpus](../resources/liber-primus/lp2-corpus.json) and [original-table transcription](../resources/liber-primus/lp2-grid-256.json); original p51 is scan 68.jpg, and solved p57 is scan 74.jpg in the [image atlas](../resources/liber-primus/). Run as Node.js 22 from repository root or any current working directory. This report belongs in supporting evidence; no unknown text was deciphered.
