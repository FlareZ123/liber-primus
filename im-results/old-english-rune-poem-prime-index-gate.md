# Old English Rune Poem as an LP1-to-LP2 keytext hypothesis

**Status:** plausible cross-round source hypothesis; no unknown LP2 plaintext, key, or reversible decoder recovered. The simple global and stanza-local prime/totient book-index readings tested here fail. Retain as a semantic reference candidate only; do not launch unconstrained book-cipher searches without a new LP2 selector.

## Why a solver might look at this poem

1. The 2013 GP29 map gives the ordered runes `F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA` and assigns the first 29 primes. The Old English Rune Poem has 29 stanzas in the same Anglo-Saxon Futhorc order: `Feoh, Ur, Þorn, Os, Rad, Cen, Gyfu, Wenne, Hægl, Nyd, Is, Ger, Eoh, Peorð, Eolh-secg, Sigel, Tir, Beorc, Eh, Man, Lagu, Ing, Eþel, Dæg, Ac, Æsc, Yr, Iar, Ear`. The easily missed `Eþel, Dæg` order is preserved. This is a structural match to the alphabet's source tradition, not independent evidence of a key.
2. The reference translation contains the LP1 passage `AMASS GREAT WEALTH` at section `0.3.1.1`. The poem's first stanza is Feoh, whose subject is wealth. This is a plausible cross-round semantic pointer to the poem, but the phrase is not LP2 plaintext.
3. The same reference translation contains LP1 lines `EITHER THE WORDS OR THEIR NUMBERS`, `THE PRIMES ARE SACRED`, `THE TOTIENT FUNCTION IS SACRED`, and `ALL THINGS SHOULD BE ENCRYPTED` at section `0.1`. These can motivate a numerical book-index hypothesis.
4. The third-party pnotisdev source registry lists the Anglo-Saxon Rune Poem as a public text not yet downloaded by that project. This is a researcher-maintained candidate list, **not** a Cicada-authored reference or instruction.

### Section boundary correction

The earlier report incorrectly called the `0.1.*` and `0.3.*` passages LP2 page 0. The pinned pnotisdev README defines LP2 as sections `0.7–0.15`; therefore sections `0.1` and `0.3` belong to LP1. Its `SOURCES.md` identifies `lp_translation.txt` as the translation of the solved pages. The pnotisdev README's statement that LP2 remains undecoded is consistent with these being LP1 passages. Do not describe `AMASS GREAT WEALTH` as an LP2 maxim or as recovered unknown plaintext.

Sources:
- [pnotisdev README at pinned commit](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/README.md) — LP2 sections `0.7–0.15`, still undecoded.
- [pnotisdev source registry at pinned commit](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/docs/SOURCES.md) — translation provenance and the poem's status as an unindexed candidate text.
- [LP1/known-page translation at pinned commit](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/ref/lp_translation.txt) — sections `0.1` and `0.3`.
- [Ragweed Forge Old English text](https://www.ragweedforge.com/rpaa.html) and [English translation](https://www.ragweedforge.com/rpae.html).
- [University of Massachusetts course extract / Dobbie 1942 reference](https://people.umass.edu/sharris/general/UM791_OE_F2013.pdf): the poem has 29 stanzas; the rune-name headings may be later additions, so the stanza-body tests below exclude those labels.

## Source limitations

- The poem's sole surviving textual witness is George Hickes's 1705 printing, based on Humfrey Wanley's copy; the original Cotton MS Otho B.X was destroyed in 1731. Later editions descend from that print.
- The tests below use the Ragweed Forge Old English transcription as displayed, not a new diplomatic transcription of the 1705 print. The English translation is a separate modern rendering. Do not mix their token streams.
- The original poem may have had only rune symbols at the stanza heads; the transliterated names printed by modern sites are excluded from the stanza-local tests. The precise historical layout and edition matter for letter-index experiments.

## Bounded global book-index test

**Motivated hypothesis:** use the 29 GP prime weights (p_i) as 1-based global word positions in the concatenated Old English poem, or use (φ(p_i)=p_i-1). This is the simplest direct reading of LP1's words/numbers, prime, and totient instructions; it does not introduce a cipher family.

**Frozen inputs:** first nine stanzas of the linked Old English text (159 word tokens, enough for all positions through 109); lowercase; split on non-letter characters; retain Old English letters; preserve stanza order. Prime list: `2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109`.

- Prime positions, Old English: `byþ, frofur, gehwylcum, ðeah, hyt, gif, drihtne, hleotan, ond, hornum, morstapa, byþ, gehwylcum, ys, manna, os, wraþu, witena, ond, on, rinca, sitteþ, mægenheardum, gehwam, oftust, inne, gyfu, and, wraþu`.
- Totient positions, Old English: `feoh, byþ, fira, sceal, miclun, dælan, for, domes, anmod, mid, mære, þorn, ðegna, anfeng, reþe, resteð, wisdomes, ond, eadnys, byþ, recyde, ðamðe, meare, cwicera, byrneþ, æþelingas, restaþ, gleng, herenys`.
- Prime positions, English translation: `is, a, to, men, man, it, wish, gain, sight, is, and, a, and, with, great, is, thorn, exceedingly, any, uncommonly, on, the, source, of, a, joy, every, easy, every`.
- Totient positions, English translation: `wealth, is, comfort, all, every, bestow, he, to, the, aurochs, proud, is, beast, fights, a, it, the, is, for, touch, severe, them, the, pillar, men, a, to, seems, to`.

Neither language stream is coherent plaintext. The English output is not rescued by the semantic echo of `wealth`; it is a sparse sample, not a decryption.

## Bounded stanza-local prime/totient test

A second natural book-code reading lets each ciphertext rune select its corresponding poem stanza, then uses that rune's prime weight or totient as an offset **within that stanza**. This is more specific than the global test and is a plausible way a solver might combine the 29-stanza alignment with the LP1 numerical instructions.

Frozen conventions:
- One stanza per GP29 rune, in the listed order.
- Use verse body only; exclude the transliterated rune-name label because its presence in the original witness is uncertain.
- Word offsets are 1-based whitespace/punctuation-delimited Old English tokens.
- Letter offsets are 1-based Unicode letters after removing whitespace and punctuation; preserve Old English letters and lowercase.
- Test only (p_i) and (φ(p_i)=p_i-1); no wrapping, phase, reversal, or fallback is allowed.

Results:
- As within-stanza word offsets, only **8/29** prime positions and **8/29** totient positions exist; the other positions exceed their stanza's word count. This cannot yield a 29-symbol code.
- As within-stanza letter offsets, prime positions exist in **23/29** stanzas and totient positions in **24/29**. The frozen outputs are respectively `yþefehdtiennywbetgweþn??????þ` and `byðddenyhþsofrebhimlai??e???a`; neither is readable text or a recognizable key. The missing offsets are not repaired by wrapping because no wrap rule is selected by the source.

**Decision:** reject the direct global prime/totient word-index rule and the direct stanza-local prime/totient word/letter rules above. This does not reject every possible book cipher, but no additional extraction should be tested until an independent LP2 clue specifies a coordinate system, text edition, and receiver. The 29-stanza correspondence and Feoh/wealth semantic link are useful for explaining why a player might find the poem; they do not provide a key or decipherment.

## Human solve-path hypothesis and next decision

A plausible player path is: recognize the 29-rune Anglo-Saxon Futhorc; recall LP1's `AMASS GREAT WEALTH`; look up the Old English Rune Poem and notice Feoh; then connect LP1's words/numbers, prime, and totient lines to a book-index experiment. The strongest objection is that the poem's 29-stanza order is already implied by the GP29 alphabet, while the wealth line selects only the Feoh stanza and the prime/totient instructions do not specify global versus stanza-local coordinates. The direct natural readings tested here fail.

**Next action only if an independent selector appears:** an original LP2 page must select a particular stanza/word/letter coordinate or an operation that consumes the poem as a key. Then freeze the relevant edition and test one prediction on at least two untouched ciphertext pages with a third page held out, requiring coherent plaintext and an exact reversible encoder. Without that selector, retain the poem as a cross-round semantic reference and do not launch broad Vigenère, book-cipher, or parameter sweeps.
