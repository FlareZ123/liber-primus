# Old English Rune Poem: 29-stanza codebook selector gate

**Decision (13 November 2026, Agent42; Director #704):** the Old English Rune Poem supplies an exact, independently documented **29-rune alphabet and an order already present in Gematria Primus**. It does not supply an additional selected plaintext substitution, transposition, numeric key, stanza-text serialization, or keyed state schedule. The p14 sedge/day-fly analogy is a plausible *bibliographic pointer*, presently without a uniquely specified cryptographic consumer. No unknown LP2 plaintext or authentic key was recovered.

## A historically available, reproducible source rule

The Anglo-Saxon poem survives in the 1705 edition of George Hickes; the manuscript was destroyed in 1731. Bruce Dickins' **1915** edition and translation precede the 2014 LP2 release. A readable witness preserving rune glyphs and stanza order is the **Anglo-Saxon Rune Poem** section of [Wikisource's Rune poems](https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem), with the Dickins 1915 translation. A second independent historical discussion appears in the [July/August 2013 *Poetry* translator's note](https://static.poetryfoundation.org/o/uploads/magazine/JulyAugust2013_final.pdf). This establishes player-era access to the poem, not Cicada attribution.

Read the poem's stanza-headed runes in original order. The exact sequence is:

```text
ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ
```

This is **identical, position for position**, to `resources/liber-primus/lp2-corpus.json:runes` and the original Cicada GP29 row. Its stanza names are, in zero-based GP position order:

```text
Feoh | Ur | Thorn | Os | Rad | Cen | Gyfu | Wynn | Haegl | Nyd
Is | Ger | Eoh | Peordh | Eolh-secg | Sigel | Tir | Beorc | Eh | Mann
Lagu | Ing | Ethel | Daeg | Ac | Aesc | Yr | Ior | Ear
```

Historical spellings are not uniquely fixed by this normalization (e.g., Eolh/Eolh-secg, Ior/Iar, Wynn/Wen); the manuscript's original stanza heads may have been only rune glyphs. Their *order*, however, is unambiguous for this elementary lookup.

This fixes the sole directly historically attested **rune↔stanza** bijection: index `i` selects stanza `i`. Applying its inverse simply reproduces the input GP rune: every symbol is mapped to itself through that index. The same operation leaves the original unsolved manuscript unchanged and cannot recover its missing plaintext. Stanza-name glosses instead produce 29 distinctive **variable-length words**; they are useful semantics, but a reversible mapping from one rune to its name is merely a spelling-out of that rune. It defines neither how to turn a sequence of rune names into a coherent message nor how to recover a second cipher layer.

## Independent p14 clue and missing operation

The original p14 scan (`resources/liber-primus/31.jpg`) visibly juxtaposes a sedge-like plant and a mayfly-like insect. This is consistent with the Old English Rune Poem's **Eolh-secg** (sedge) and **Dæg** (day) entries, at GP zero-based indices **14** and **23**. Those same indices are LP2 page labels p14 and p23. The authenticated 2016 message says the book's words are a map, their meanings a road, and their numbers the direction. A clue-constrained **navigation hypothesis** is therefore: p14's paired image selects Eolh-secg/Dæg; their indices direct from p14 to p23, where the p23–p26 mayfly-image sequence begins. This gives a plausible human route to the next source, not a cipher operation or plaintext recovery.

A secondary, nonessential alignment: tokenizing the signed 2016 message as whitespace-separated words from zero gives word 14 = **“Its”** and word 23 = **“road”** (39 tokens total). This is consonant with the p14→p23 reading, but zero-based word indexing is not explicitly specified and this match is not treated as independent cryptographic evidence. The exact insect/plant species, direction between the two poem entries, and any cryptographic operation supplied by the p23–p26 source remain unproved. The Dutch 1977 mayfly plate/facing legend is still unavailable as a public scan; see [the acquisition report](lp2-1977-mayfly-plate-legend-access.md), which now records two physical-copy leads at IVN Heerde.

No original source fixes whether a would-be key should contain Old English stanza letters, rune-name spellings, first words, syllables, stanza lengths, prime-index sums, one of several historical editions, or a placement/reset rule. These alternatives give different outputs and cannot be compared by looking for pleasant plaintext. In particular, a first-letter or first-rune acrostic of the 29 stanza labels trivially recovers the familiar Futhorc order, not a second 29-symbol permutation.

## Decision for the Director

The proposed 29-stanza **complete codebook** is exhausted as a *source-selected new operation*: its one ordinary historical index mapping is already Gematria Primus. The external poem could still become a source of a key if a separate authenticated clue specifies **which stanza data to extract and how to apply it**; that dependency is presently absent. Reopen this lane only with an independent source-authored selector fixing both a nonidentity operation and target clock before touching the unknown ciphertext. The separate p14 art-attribution assignment #697 can assess the semantic link without this codebook claim.

A 40-rune candidate was deliberately not fabricated through arbitrary stanza-statistic searches; with no selected new decoder, there is no cryptographic inverse to run or to certify. All 12,956 original unknown runes and all source image/transcription records remain unchanged.

**Evidence class:** exact historical alphabet equivalence plus a bounded no-selector decision. **No recovered key, ciphertext inversion, unknown plaintext, or destination.**
