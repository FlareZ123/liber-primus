# Old English Rune Poem as an LP2 keytext candidate

**Status:** plausible source-selection hypothesis; no unknown plaintext or key recovered. One simple book-index interpretation was tested and failed.

## Why this text is worth considering

1. The original 2013 GP29 source map gives the ordered transliterations `F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA` and assigns the first 29 primes. The Old English Rune Poem has exactly 29 stanzas in the corresponding order: `Feoh, Ur, Þorn, Os, Rad, Cen, Gyfu, Wenne, Hægl, Nyd, Is, Ger, Eoh, Peorð, Eolh-secg, Sigel, Tir, Beorc, Eh, Man, Lagu, Ing, Eþel, Dæg, Ac, Æsc, Yr, Iar, Ear`. The match includes the easily missed `Eþel, Dæg` order at positions 22–23. This is a one-to-one structural match, not merely a shared rune inventory.
2. The external [pnotisdev source registry](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/docs/SOURCES.md) explicitly lists the Anglo-Saxon Rune Poem among public texts not yet downloaded/indexed.
3. The same project's [LP2 solved-page transcription](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/ref/lp_translation.txt) includes `AMASS GREAT WEALTH` (page 0.3.1.1). The poem's first stanza is **Feoh**, whose subject is wealth. The stanza says wealth is a comfort but should be bestowed freely; LP2's maxim may be an inversion or allusion, not a quotation.
4. That transcription also gives `EITHER THE WORDS OR THEIR NUMBERS`, `THE PRIMES ARE SACRED`, `THE TOTIENT FUNCTION IS SACRED`, and `ALL THINGS SHOULD BE ENCRYPTED` on p0. These make a word/number-indexed text hypothesis plausible, but do not specify a complete extraction.
5. Weaker semantic echoes exist for `Nyd` (need), `Peorð` (chance/luck), and `Dæg` (day) in the solved-page transcription. These are common words and are **not** independent evidence.

## Exact source and limitations

- The poem's only surviving textual witness is the 1705 Hickes printing, based on Humfrey Wanley's copy; the original Cotton MS Otho B.X was destroyed in 1731. Bibliographic reference: [Arlima, Anglo-Saxon Rune Poem](https://www.arlima.net/il/anglo-saxon_rune_poem.html).
- An accessible Old English transcription is at [Ragweed Forge](https://www.ragweedforge.com/rpaa.html), with its separate [English translation](https://www.ragweedforge.com/rpae.html). A 1705 facsimile is catalogued at [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rune_poem_Hickes_1705.png); the available image is cropped at the lower end.
- The test below uses the Ragweed Forge Old English transcription as displayed, not a fresh diplomatic transcription of the 1705 print. The translation test uses that site's separate English version. The exact edition and tokenization matter for any word-index experiment; do not mix Old English and modern translation tokens.

## Bounded operation test

**Motivated hypothesis:** if the GP primes and totient clue direct a book-index operation, use the 29 GP prime weights (p_i) as 1-based global word positions in the concatenated Old English poem, or use φ((p_i)) = (p_i-1) as the positions. This is a deliberately simple reading of “words or their numbers”, “primes”, and “totient”; it does not introduce a cipher family.

**Frozen inputs and tokenization:** the first nine stanzas of the linked Old English transcription (159 tokens, enough for every tested position); lowercase; split on non-letter characters; retain Old English letters as letters; stanza order preserved. Prime list: `2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109`.

- **Prime positions (p_i), Old English:** `byþ, frofur, gehwylcum, ðeah, hyt, gif, drihtne, hleotan, ond, hornum, morstapa, byþ, gehwylcum, ys, manna, os, wraþu, witena, ond, on, rinca, sitteþ, mægenheardum, gehwam, oftust, inne, gyfu, and, wraþu`.
- **Totient positions φ((p_i)) = (p_i-1), Old English:** `feoh, byþ, fira, sceal, miclun, dælan, for, domes, anmod, mid, mære, þorn, ðegna, anfeng, reþe, resteð, wisdomes, ond, eadnys, byþ, recyde, ðamðe, meare, cwicera, byrneþ, æþelingas, restaþ, gleng, herenys`.
- **Prime positions (p_i), English translation:** `is, a, to, men, man, it, wish, gain, sight, is, and, a, and, with, great, is, thorn, exceedingly, any, uncommonly, on, the, source, of, a, joy, every, easy, every`.
- **Totient positions φ((p_i)) = (p_i-1), English translation:** `wealth, is, comfort, all, every, bestow, he, to, the, aurochs, proud, is, beast, fights, a, it, the, is, for, touch, severe, them, the, pillar, men, a, to, seems, to`.

Neither source sequence is coherent plaintext. The first eight Old English totient-selected words are a sparse sample from the opening Feoh stanza, which is expected from the low initial indices; that fragment is not evidence of a decryption. The English output is likewise nonlinguistic.

**Decision:** reject this exact global word-index rule. This does **not** reject the poem as a semantic source, nor does it test every possible book cipher. It rules out treating the first 29 GP primes or their totients as a direct 1-based global word-index list and claiming the resulting words are plaintext.

## Human solve-path hypothesis and decisive next test

A plausible player path is: recognize the 29-rune GP alphabet; find the unique 29-stanza Anglo-Saxon Rune Poem in the same order; notice the LP2 wealth maxim points to Feoh; then read the p0 words/numbers, prime, totient, and encryption statements as an instruction to use a text numerically. The creator could plausibly choose this compact, directly rune-indexed source.

The strongest objection is that the poem may only explain rune names and meanings. The wealth maxim selects at most the Feoh stanza; it does not select how to use all 29 stanzas. The prime/totient lines already have a simpler GP29 arithmetic interpretation. No page currently specifies stanza/word/letter coordinates, and the global word-index test failed.

**Next action only if an independent selector appears:** freeze a diplomatic Old English text from the 1705 witness (or a cited scholarly transcription), record stanza boundaries and tokenization, then test one source-selected extraction against at least two independent original ciphertext pages with a third page held out. Require coherent plaintext and an exact reversible encoder. Without that selector, retain the poem as a possible semantic reference and do not launch broad Vigenère, book-cipher, or parameter sweeps.
