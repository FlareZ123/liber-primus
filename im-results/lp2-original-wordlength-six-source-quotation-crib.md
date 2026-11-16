# Original LP2 word-length quotation attack: one apparent ten-word match rejected by independent punctuation

**Agent18, 16 November 2026. Evidence class: finite original-cipher direct-plaintext attempt, no recovered plaintext.** All 2,896 original printed LP2 unknown-page word lengths were matched against 153,549 words from six pre-existing literary or Cicada-era text sources. The best raw sequence, ten words from Shakespeare, is incompatible with the independent original manuscript punctuation at **two positions**. No genuine previously unknown LP2 words, key, reversible cipher or next destination have been recovered.

## Original-source solve path

The original 2014 text exposes stable printed-word boundaries even while its 12,956 GP29 rune symbols are encrypted. These word lengths are preserved by every documented solved-LP1/LP2 symbol-for-symbol cipher, though no original instruction proves preservation for the unknown pages. If a passage reproduces a known historical book or literary quotation, a contiguous sequence of native-GP word lengths could identify a plaintext crib *without* guessing the encryption key. This is a source-to-plaintext attack with an observable independent control: punctuation in the source passage must correspond to original ink, as it does in solved text.

Use the existing exact source parser `sims/lp2_word_pages.cjs` to join words over original printed line and page boundaries, retaining original p50 as a rune-free physical page. Convert each control word to the standard GP29 symbol length by greedily reading the longest native multigraph after the already established QU→CW, V→U, K→C, Z→S, ING→NG and IO→IA equivalents. Apostrophes occupy no rune, so remove them for the **length test** and separately test their *presence* against source ink. Never skip words, add free edits, reorder fragments, or fit individual source spellings.

## Exact original-cipher results

| Independently selected source | Source word tokens | Longest exact contiguous rune-word length match |
| --- | ---: | ---: |
| Shakespeare, repository first 300,000 characters | 54,189 | **10** |
| Kahlil Gibran, *The Prophet* | 15,726 | **9** |
| Emerson, repository essays text | 77,773 | **9** |
| Cicada-2013-used *Book of the Law*, chapter I | 1,896 | **7** |
| Cicada-2013-used *Book of the Law*, chapter II | 1,967 | **8** |
| Cicada-2013-used *Book of the Law*, chapter III | 1,998 | **8** |
| **All six texts** | **153,549** | **10, one punctuation-incompatible candidate** |

The single ten-word hit is original words **1565–1574**, crossing physical LP2 **p28→p29**, against Shakespeare source words **50253–50262**:

> one commanding all obey'd of none. Thus hath the course

The native GP29 word-length signature is **[3,8,3,5,2,4,3,3,2,6]** in both sequences. The source passage appears in the Shakespeare text as an original line ending **`none.\nThus`** and contains an internal apostrophe in **`obey'd`**. In original LP2, the corresponding words have the ordinary visible separator **`ᚷᛟᚪᛏ-ᛄᚦᚣ`**, without the source's full stop. Its fourth word occurs on original **p29**, whereas the independent full-JPEG raised-apostrophe census places the only four original unknown-LP2 apostrophes on **p4, p21, p35 and p41**. There is no ink apostrophe on p28 or p29. The two independent mismatches reject this quoted passage under the preserved-punctuation assumption. As further context, the other five corpora have many shorter length matches, so partial skeleton equality by itself is not a decipherment.

This exhaustive search over **these six source files**, with the fixed published GP spelling rules, contains **zero eleven-word matches**, and no ten-word match retaining source punctuation. It does **not** establish a global bound across all literature, languages or cipher schemes, and does not exclude English prose that was originally authored by Cicada rather than copied.

## Reproduction and decision

[Original-source Node22 CommonJS SFT](../sims/lp2_original_wordlength_quote_source_sft.cjs) reads the untouched canonical transcript and six source files, asserts **2,896/12,956**, GP multigraph and contraction normalization, the six exact source token counts/maxima, and independent twelve-word planted self-matches. It freezes the lone ten-word correspondence at unknown source word1565 / Shakespeare word50253 and tests *both* the original `none.` delimiter mismatch and the independently image-adjudicated original apostrophe absence using [the existing source punctuation inventory](../resources/liber-primus/lp2-quote-punctuation-spans.json). No language model, fitted key, postselected phrase extension, new transcription or inferred plaintext is used.

**Decision:** this period-plausible direct quotation route yields no valid plaintext crib in the six audited sources. New work should target an independently named historical book or actual source-selected key material; a growing unconstrained literature search or an attractive eight/nine-rune-length collision is a poor replacement for a reversible original cipher. The original 56 unknown pages remain unsolved.
