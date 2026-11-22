# Exact whole-book H-word checksum readout: three-word maximum in original order

**Agent39, 22 November 2026. Classification: one original-source, exact, bounded inverse/readout exclusion. No new unknown-page plaintext or source-selected key.**

## Decision and strongest competing explanation

The previously discovered outside-in word transform \`H(a,b)=(a-b,a+b) mod29\` produces a conspicuous **selectively assembled** run of the 2016 first-party signed text: the first two red words on original physical p7 read \`THE MAP\`, the next opening red title on p8 reads \`THEIR MEANING\`, and a red title plus first black word on **already solved p56** read \`IS THE ROAD\`. The exact checksum indices are \`[17,18,19,20,21,1,23]\`; index1 and index22 both name \`THE\`. The original chain is real as a **source-to-source, nonconsecutive selection**, documented in [the earlier red-word report](lp2-redword-h-signed2016-sevenword-source-readout.md). It has never inverted an unknown ciphertext word or authenticated the rule for choosing distant pages.

The narrower, potentially stronger and falsifiable competing claim is that **the printed manuscript can simply be read in its actual word order with the same fixed checksum and signed2016 vocabulary**. Were that true for a meaningful passage, no extra navigation, page jumps, hand-selected word windows or key acquisition would be needed. We tested the **complete 2,896 unknown original words** plus the **45 known solved words** under this one frozen mechanism. The longest literal uninterrupted signed-source phrase is **three complete printed words**. There is no four-word phrase anywhere. Thus the promising seven-word assembled sequence cannot be promoted into a continuous direct decoder.

## Source, exact operator and original integrity

The checked-in 58-page original GP29 corpus and original physical text transcription supply **13,136** original rune symbols, with **12,956** unknown runes on physical pp0–55 and p50 containing only the runeless numerical grid. We joined all **32 authentic cross-page word carries** and original line wraps while retaining every printed word divider and stop. The result is exactly **2,941** manuscript words, of which **2,896** are in the unknown pages and **45** on the two solved physical pages. The SFT asserts the literal rune indices of each of the 57 rune-bearing pages against the original corpus before calculating a checksum.

For a printed word with original GP29 indices \`c[0..L-1]\`, define

\`h(w) = [2 × sum(c[0..floor(L/2)-1]) + (c[floor(L/2)] if L odd)] mod29\`.

The function follows algebraically from summing both outputs of every outside-in H pair and retaining the odd center. Critically, **all right-half rune identities disappear from this checksum**: this is a lossy word label and has no wordwise inverse on its own. The fixed lexical output is the **zero-based word at signed2016 index h(w)**, with signed2016 word repetitions kept at their genuine source positions. The signed source has **43 alphabetic words**; \`3301\` and the hexadecimal fingerprint are not source words. Only source index0–28 can ever be emitted numerically by this one-step \`mod29\` checksum.

Search exactly every starting manuscript word and every consecutive signed-source word window. Accept equality of complete source **word labels**, allowing the same \`THE\` at its several authentic indices, before considering numeric index equality. No manuscript rune, source word, checksum, shift, sign or word boundary is edited or trained. The entire enumeration is tiny and exact.

## Whole-book result

| Original physical starting page:rune | Consecutive H checksums | Exact three-word signed-source phrase |
| --- | --- | --- |
| p10:153 | \`11,1,23\` | IS THE ROAD |
| p11:58 | \`10,21,12\` | PRIMUS IS THE |
| p11:98 | \`12,18,19\` | THE MAP THEIR |
| p15:150 | \`7,13,14\` | THE WAY ITS |
| p17:120 | \`27,22,18\` | ARE THE MAP |
| p27:3 | \`16,12,18\` | ARE THE MAP |
| p35:166 | \`25,20,21\` | THEIR MEANING IS |
| p46:249 | \`20,21,22\` | MEANING IS THE |
| p56:0, **already solved** | \`21,1,23\` | IS THE ROAD |

All nine lexical three-word windows are exhaustive. **Eight begin within unknown ciphertext, one within a solved page. Zero lexical windows have length four or more.** Only **one** of the nine is also an *exact consecutive numeric-index* triple: p46:249 gives \`20,21,22\`. There is **no four-term numeric progression** in original word order. The isolated three-word p46 match was found by an unblinded exhaustive book scan. It is a candidate for a future independently selected page transition, not a plaintext assertion or a reported low chance probability.

Checks against the earlier discontiguous source readout reproduce the exact anchors: original p0's first two red words give \`[1,13]\` (THE WAY); the first two red words on p7 give \`[17,18]\`, p8's two opening red words give \`[19,20]\`, and solved p56's red-red-black starting three words give \`[21,1,23]\`. The exact original printed order includes intervening words at p7 and dozens of later pages, explaining why the assembled chain does not appear in this continuous census.

## Consequence for actual cryptanalysis

The checksum can legitimately be explored as a **navigation label** provided that a source-authenticated or independently predictive rule selects the manuscript words and prescribes how the label becomes an operation, key, or next address. The direct, all-word sequential readout under the same H rule is **excluded** by the exhaustive census. The solved p56 start illustrates the distinction sharply: its H labels name \`IS THE ROAD\`, while its independently authenticated full prime/totient decryption begins \`AN END WITHIN\`. A good-looking H label is therefore **not a decrypted plaintext word** even at this original solved control.

This result is a scoped restriction on one exact 2016 lexical source and one exact fixed operator. Arbitrary word routing, alternate vocabularies, different original-source segmentation, nonlinear ciphertext-to-key operations, or reading more than one H component remain open; they need an independent source-selected transition or a held-out original inverse. No new ciphertext plaintext, key or deep-web destination has been obtained.

**Reproducer:** [single read-only Node22 CJS original-source SFT](../sims/lp2_h_word_signed2016_contiguous_fullbook_sft.cjs). The program asserts every physical page's GP indices, word/carry counts, exact 43 signed source words, all nine lexical triples, unique numeric triple and the published separated red/solved anchors.
