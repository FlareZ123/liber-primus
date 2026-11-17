# Original LP2 GP29-word address into Jung *Liber Primus*: two direct source scopes rejected

**Agent34, 17 November 2026. Executed source-constrained original-input decision.** The original 2,896 printed LP2 words give no coherent English under either natural unkeyed address function, using either the complete source reader's edition or the exact *Liber Primus* body. A 19-character source-native planted message was recovered exactly in each. No previously unknown LP2 plaintext, author-selected key, decipherment or continuation destination was recovered.

## Source-selected hypothesis

The authentic 2016 Cicada text describes the book's *words* as a map and its *numbers* as directions; the 2013 signed puzzles demonstrate GP29 numeral handling and GP-prime sums. Jung's *The Red Book: Liber Novus* contains a section explicitly titled *Liber Primus*, historically accessible in English by 2012, making a possible same-title book-cipher donor. **No original Cicada instruction actually names Jung as the key text.** We therefore test one direct human-traceable operation without tuning a key, offset, alphabet, source, page start or plaintext phrase to the result.

For each actual LP2 printed whole word `w = [d0,...,dk]` in canonical GP29 index order, compute either (i) its base29 value modulo source word count or (ii) its GP-prime-weight **sum** modulo source word count, then output the **first letter** of the selected zero-based donor word. Preserve all original 12,956 rune values and all 2,896 intact words, including 32 original page-spanning words. The scheme generates one letter per printed ciphertext word; by itself it is an exact deterministic readout, **not** a one-to-one cipher of original source words, since addresses collide.

Two independent, frozen source scopes were evaluated:

- **Complete** 545-page reader's-edition PDF, 228,597 alphabetic donor words, no internal trim.
- **Precisely titled** *Liber Primus* body, using the document's own bookmark and full heading at PDF zero-based page107 through before the *Liber Secundus* heading at zero-based page199; 41,654 donor words. The PDF TOC also names these on pages2–3, but the later actual body headings are unambiguous. This is a stronger title-specific source selection than the whole-reader control.

The unchanged source file is SHA-256 `5cbb32a6a6033399c8692ac9aaeb148e02a1a0734f4d7a31a90453fbc6073359`; it is downloaded into CI memory and not redistributed.

## Complete executed original outcome

Both direct runs use only the original ciphertext as their message input. The [full-edition completed source run 44182144954](https://github.com/FlareZ123/liber-primus/actions/runs/44182144954) and the [same-title section completed source run 44184388177](https://github.com/FlareZ123/liber-primus/actions/runs/44184388177) passed identical-shaped 19-character planted readouts `LIBERPRIMUSISOURMAP`, exact GP29 original-input parsing and both original unkeyed readouts.

| Donor and fixed word-address function | First 45 original output letters | Source-trained trigram gain per letter | Original output upper-tail among 200 shuffled-letter outputs |
|---|---|---:|---:|
| Whole reader, base29 | `DBBMAMSTAAWTDTJGAAISOIPWTPSBHDTASSTADARJATTIM` | 4.519486 | 0.955224 |
| Whole reader, prime sum | `AXCITTTIINXVFIOSLFRRHSCVCCARXCRFTXTCTIVIVTRRTV` | 4.094629 | 0.164179 |
| Exact *Liber Primus* section, base29 | `OAYJYTTMBAMEMTMTIFFFBAWUIOOLDYADSSWFTTIETCSSB` | 3.275016 | 0.641791 |
| Exact *Liber Primus* section, prime sum | `IMOSVBSHOETAUHIENHCSGEIBUNFDNGSTCTEUFANSSEDATB` | 3.092231 | 0.845771 |

The full 2,896-letter readouts are nonlinguistic; the predetermined intact phrase set `LIBER, PRIMUS, DIVINITY, CIRCUMFERENCE, INSTAR, TUNNEL, PARABLE, EMERGE, ENLIGHTENMENT` yields **zero hits in all four readouts**. Fixed word-by-word source addresses did not expose an English sentence, key instruction or signed payload. A shuffled-letter baseline preserves output letter frequencies; all four source-trained trigram comparisons fall inside or below the shuffled range. These scores are diagnostics, not a formal model-independent exclusion.

## Decision

Retire **these four exact unkeyed word-address transfers**. The direct human-runnable idea, including the correct named subbook boundary, fails to produce original plaintext despite exact native positive controls. Do not rescue it through fitted source offsets, arbitrary byte transformations, new moduli or keyword phase sweeps. A different book cipher with a genuinely source-selected address offset, word-order key, output grammar or donor remains logically possible. The next decision requires first-party independent evidence selecting the missing operation, then a prediction on withheld original LP2 words.

Reproducers: [full reader original SFT](../sims/lp2_jung_liberprimus_wordaddress_sft.py) and [strict section-only original SFT](../sims/lp2_jung_liberprimus_section_address_sft.py), both with manual-only Windows Python3.12 workflows [full](../.github/workflows/lp2-jung-wordaddress-manual.yml) and [section](../.github/workflows/lp2-jung-section-wordaddress-manual.yml). The already completed Jung running-key and wordlength source gates test different candidate operations; none of these tests authorizes general assertions that Jung was or was not the original LP2 donor.
