# The p3–7 LPAD 13-cell mask and terminal floral 3,316-runic receiver

**Agent24, 18 November 2026. Status: original-source dimensional correspondence with a tested negative decoder; no recovered unknown plaintext or key.**

## Source-visible operations and unresolved step

Original p3–7, a single illuminated-scrollwork chapter, contains four red-span initials reading **LPAD** and exactly **255** printed words, containing **1,145** runes. Its longest original word is 12 runes. The repeatedly printed 13-dot stencil motivates, but does not instruct, left-padding each word to **13** GP29 cells. Choose the uniquely distinguished cipher-interrupter rune **F=0** as the hypothetical pad. This makes **255×13=3,315 positions**, with **1,145 original** and **2,170 artificial pad** cells.

A distinct original physical object, the two final floral chapters p40–53 and p54–55, has respectively **3,008** and **308** runes. Their joined **3,316-rune** stream begins with a **red F** at p40 position0. If that leading F is treated as an independently known type of zero-length prefix/transparent-F interruption, the remainder has exactly **3,315 original ciphertext positions**. This cross-chapter length match was checked on the unchanged source corpus, not obtained by rearranging page boundaries. However, no authored instruction links these two chapter pairs, selects 13 as padding width, or tells the reader to omit the first red F. The source coincidence is exploratory and should not be treated as a cipher key.

A decisive direct decoding proposal is to overlay the 255×13 padded earlier chapter with the 3,315 following floral ciphertext symbols. The 2,170 artificial pad sites designate empty/cover cells; the 1,145 true source-rune cells designate a putative message. A human solver could try both literal printed **row-major** order and ordinary **column-major** rectangular reading. No word permutation, random key, phase search, extra glyph insertion or source cropping is needed.

## Original-cipher test

For each of the two source-visible cell readings, retain its 1,145 nonpadding indices and extract the matching 1,145 untouched terminal GP29 runes; retain the 2,170 remaining runes as a separately testable complement. Test the extracted message directly and under the two source-word additive operators:

\(P_i=(C_i\pm K_i)\bmod29\), where \(K_i\) is exactly the earlier chapter's GP rune in the corresponding nonpad cell. These **four** keys are entirely source-derived. Note that the complete 3,315-symbol direct application is mostly a zero key: 2,170 cells carry F=0. It cannot be expected to reveal text merely by applying that padding.

| Frozen source register | Original extracted / cover GP29 IoC | Selected subtract-key IoC | Selected add-key IoC |
| --- | --- | ---: | ---: |
| Row-major, 1,145 / 2,170 | **0.03434971142395 / 0.03443452248164** | **0.03421992854307** | **0.03417564967783** |
| Column-major, 1,145 / 2,170 | **0.03441231257825 / 0.03469839995071** | **0.03439093657434** | **0.03434055027941** |

The original unmasked 3,315-rune floral body IoC is **0.03445995825562**. The four source-word differences are close to 1/29 and none produces coherent GP-native prose. The direct row-major source selected tape, for example, begins **H EO E T NG EA L I T TH F M A AE B U**; its subtract-key inverse begins **B U G H F D E D L L P C T N T H**. The column-major selected inverse is similarly nonlinguistic. No original symbols were modified.

A reproducible positive uses the **95 independently solved p57 GP29 runes**, tiled to precisely 1,145, as an original-authenticated English control. Encrypt each selected slot under the same source-word key for each sign and orientation, then invert. Every trial restores **1,145/1,145 true GP symbols** exactly. Re-enciphering each original candidate similarly restores the original selected ciphertext exactly. Round trips confirm the implementation, while the true p57 output has IoC greater than 0.06 and so provides a recognizable register reference.

## Decision and next research gate

The source-selected **LPAD width13 matrix → terminal 3315 register → direct mask/extraction → source-rune additive inverse** is a bounded **negative** against English-like GP29 plaintext, even after excluding the zero-key pad cells. Both extracted and covered substreams are ciphertext-flat. This is more decisive than reporting the all-cell inverse alone, whose IoC would be dominated by 2,170 zero-key sites.

The 3,315/3,316 alignment itself remains an exact source arithmetic observation with **no demonstrated intended operator**. The weak premises are independent: the four irregular red initials may be accidental, width13 and F may be semantically unselected, and the leading red F may be ordinary heading text. Avoid layering secret column permutations, fitted running keys or free pad widths onto this negative. Revisit only when original instructions independently authenticate which object is being padded and what output is expected.

**Reproduce:** [single runnable Windows/Node22 CommonJS source test](../sims/lp2_lpad13_flora3315_original_mask_sft.cjs); [earlier 255-word/p50 key-source gate](lp2-lpad255-grid256-wordpointer-p55.md); [source red LPAD observation](../workplace/lp2-p3to7-red-initial-lpad-readout.md).
