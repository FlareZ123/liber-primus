# Source-genealogy gate: Hávamál 138–139 and LP2 p32

**Agent47, 25 November 2026.** Decision: no new source-dependent unknown-page plaintext candidate. This is a bounded negative, not an impossibility claim.

## One candidate considered

The strongest new tree/rune candidate in the indexed pre-2014 source material is **Hávamál stanzas 138–139**. Stanza 138 describes Odin hanging on a tree and receiving runes; stanza 139 continues the rune-acquisition account. The exact source coordinates are the numbered stanzas `138.` and `139.` in `resources/control/havamal_old_norse_source.txt`. Its source provenance is documented in `resources/control/nonenglish_medieval_sources_provenance.md` (the preserved Old Norse text is attributed to Heimskringla.no / editor Guðni Jónsson).

The human solve-path hypothesis is:
1. A solver had the first-party 2013 signed message `resources/historical/cicada2013-forest-clue.asc`, whose text says that one cannot see the forest while looking at the trees.
2. The original LP2 p32 image (`resources/liber-primus/49.jpg`) contains a faint tree behind a 121-rune text.
3. The manuscript is written in runes, so Hávamál 138–139 is a recognizable pre-2014 tree/rune text to consider.

This is a plausible hypothesis to test, not evidence that Cicada selected Hávamál.

## Decisive constraints

- The canonical original corpus records **121** ciphertext runes on LP2 p32 (`resources/liber-primus/lp2-corpus.json`).
- Stanza 138 has 109 ASCII letters after accent stripping and 114 tokens under the following explicitly exploratory GP29 mapping: `þ→TH, ð→D, æ→AE, ö/ø→OE, K→C, V→U`, followed by greedy longest-match GP29 tokenization.
- Stanzas 138–139 together have 179 normalized ASCII letters and 191 tokens under the same mapping.
- Thus neither frozen source interval is an exact 121-symbol whole-page plaintext candidate. The 114-token near-length is not permission to add seven symbols, alter the stanza, or choose an unmotivated edit rule. The mapping itself is not an author-authenticated Old Norse-to-GP convention.
- The 2013 clue does not uniquely identify p32. The original LP2 images also contain tree/branch artwork on pp8–9 (`25.jpg`, `26.jpg`) and a central tree on p55 (`72.jpg`). The clue says “forest” and “trees”; it does not name Odin, Yggdrasil, Hávamál, a stanza, or a page.
- No phrase in Hávamál 138–139 supplies an independently authenticated plaintext crib for p32. Neither the 2013 message nor the Hávamál passage selects a cipher equation, alphabet, key, reset, coordinate origin, or traversal. Consequently no substitution, Vigenère, p56-totient, or transparent-F test is licensed by this witness.

## Phrase-genealogy controls

The source-phrase checks found only already-solved dependencies, not a new unknown-page target:

- LP1 p3–4's “for all that lives is holy” is an adaptation of the 2012 signed Blake chorus, “For every thing that lives is Holy” (`resources/historical/cicada2012-song-is-your-own-path.asc`; source text in `resources/external/cicada2012-blake-marriage-gutenberg45315.txt`). This is a real source relationship, but its target is solved LP1 p3–4.
- LP1 p10/p14's circumference vocabulary has a strong semantic echo in *Liber AL* II:3, which discusses the sphere, centre, and circumference. This relationship is already treated in `workplace/lp1-ego-circumference-p57-authorial-metaphor-selector.md`; its target is solved LP1, not a new unknown page.
- The solved LP2 p57 PARABLE antecedent was excluded from this investigation as required.

The first-party pre-release message scan produced no other distinctive multiword match to solved LP1 prose. Generic fragments such as “we do not have” are not source evidence. Previously tested quotation, word-length, and language-model routes remain excluded under their documented scopes; this investigation did not repeat their corpus sweeps.

## Decision

**No new independently sourced crib, exact unknown-page source unit, or source-selected cipher equation was found.** Hávamál 138–139 is a thematic tree/rune association, not a demonstrated textual dependency. Do not commission a dependent inversion or successor search from this result.

Reopen only if a new first-party selector names the source/edition or fixes a unique target page and a reversible operation, or if an exact original passage with independently fixed coordinates is recovered.
