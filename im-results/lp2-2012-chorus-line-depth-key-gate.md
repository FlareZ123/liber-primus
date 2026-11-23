# Source-mapped chorus and square word gates

**Disposition: the tested routes do not recover plaintext.** This note records bounded, source-motivated tests distinct from earlier direct chorus-as-key and square-factor-stream experiments. It does not rule out other uses of these artifacts.

## 1. The 2012 chorus as a page-to-line key

The archived 2012 Cicada chorus has 56 words and 238 alphabetic letters. LP2 has 56 unsolved physical pages, p0–p55, with p50 represented by a numeric table rather than rune text. This makes a human-readable mapping plausible: chorus word i selects physical page i, and the word's number/length gives a depth within that page. The p57 parable's instruction to shed circumferences suggests taking the selected line's interior as key material.

The discriminating version tested here was fixed in advance:

1. Map chorus word i to LP2 physical page i.
2. Exclude p50 from rune-page decryption because it is the numeric-only table.
3. Encode each chorus word in native GP29 orthography using the repository's existing encodeWord rules. Its rune length selects the one-based printed line on that page.
4. Remove the first and last rune of that line. Repeat the remaining interior as a page-local additive GP29 key, resetting at each page.
5. Test both key signs with the repository's exact plaintext-F inverse and its fixed external TextBlob English lexicon. This decoder branches on ciphertext F, does not consume key for literal plaintext F, and rejects key-consuming branches that would produce plaintext F.

**Result:** 55 rune-bearing pages received nonempty line keys. Only three pages admitted any valid plaintext-F path under either sign: p12 (3 dictionary words), p32 (2), and p42 (5). The other 52 pages had no valid path for either sign. The three surviving paths account for only 10 dictionary-matched words in total (out of 145 printed words on those three pages); their remaining words are not English. The lexicon contains 29,058 encoded English words. This rejects this exact page/GP-word-length/line-interior/page-reset construction under the source-native cipher family.

The result is stronger than the earlier fixed-phase IoC check: it tests the actual F-transparent state rule and uses the existing word-boundary-aware lexical Viterbi. It does not rule out the chorus serving as a page map with a different, independently motivated operation, nor does it test the special p50 numeric row.

Reproduce from the repository root:

    node sims/lp2_2012_chorus_line_depth_key_gate.cjs

The script reuses sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs; its lexicon and cipher-state implementation are not regenerated or trained on LP2.

## 2. The 7×7 square against p36's 49 words

p36 has 49 words starting on that page; the 2014 7×7 square has 49 cells. I tested the natural row-major pairing, stripped each word's first and last rune, and used either (a) the cell value modulo 29 as a per-word Caesar shift or (b) the cell's NUMBER prime factors mapped to GP prime indices as a repeating per-word key. I also tested the factor-index sum per word with the square's source-derived center-out spiral order, and the raw 49-cell modulo-29 spiral as a repeating key over the rune-bearing LP2 corpus.

None yielded readable language. The p36 word-interior tests cover 138 runes; their IoCs remain non-diagnostic and the readouts are not English. The whole-book 49-symbol key leaves the corpus IoC essentially at its ciphertext baseline. These are bounded negative results, not a proof that the square has no role.

## 3. The 5×5 NUMBER output against p57's parable

The third 5×5 source square produces 19 active cells, 6 plus cells, and 44 prime-factor tokens. The p57 parable body has 19 words; removing each word's first and last rune leaves 50 interior runes. This explains the attractive aggregate count 44+6=50, but it does not establish a mapping:

- only 4 of the 19 active-cell factor-list lengths equal the corresponding p57 word-interior lengths;
- the 50 interiors contain 2 GP F runes, not 6, so the six plus markers are not a one-to-one F encoding;
- the previously noted INSTAR / cell-341 endpoint-factor match remains a single anchor, not a full wordwise correspondence.

Do not promote the aggregate count to a cipher or key. The p57 page remains a clue-bearing plaintext source, not a demonstrated decryption of the unknown pages.

## Research consequence

Retire these exact mappings unless independent source evidence selects a different operation. The most useful result is the F-transparent rejection of the chorus line-depth key; it prevents repeating a plausible but nonproductive page-alignment hypothesis. No LP2 plaintext, key, or intended continuation was recovered by these tests.

**Inputs:** resources/control/cicada2012_blake_chorus.txt, resources/liber-primus/lp2-transcription.txt, resources/liber-primus/lp2-corpus.json, and resources/cicada2014-openpuff-magic-squares.txt.
