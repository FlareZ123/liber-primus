# GP29 rune-name semantic codebook: source gate

**Decision:** the Old English Rune Poem is a plausible historical reference for GP29, but the surviving evidence does not select a unique semantic readout or reversible operation. Retire this semantic-codebook route as an LP2 decipherment hypothesis. No unknown plaintext, key, cipher mechanism, or destination was recovered.

## Human-solve-path hypothesis

A solver sees a 29-rune alphabet, then encounters the authenticated 2016 instruction that Liber Primus's “words are the map” and “their meaning is the road.” The Old English Rune Poem is an obvious historical candidate: it describes the Anglo-Saxon Futhorc in 29 stanzas. The 2016 image contains a leafless tree, and the first rune of LP2 p54 is Ac (oak). A solver could reasonably consult the poem and ask whether rune-name meanings guide navigation.

This is a plausible *reference-selection* hypothesis, not yet an operational codebook.

## Source facts

- The repository corpus has 29 rune symbols and the transliteration order:
  **F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA**
  (resources/liber-primus/lp2-corpus.json). This is the Anglo-Saxon Futhorc order, not the 16-rune Younger Futhark used by the separate p0 6:5:5 cipher-rune hypothesis.
- The Old English Rune Poem has 29 stanzas describing the conventional names of Anglo-Saxon runes. Van Renterghem's 2014 reassessment records 29 rune-names alongside the poem and reviews the disputed history of Hickes's edition. Birkett's 2017 encyclopedia entry confirms the 29-stanza structure and that the sole Cotton Otho B X witness was lost in the 1731 fire; the text survives through Wanley's copy and Hickes's 1705 publication.
- The poem was therefore historically obtainable to a 2014 solver. It is not a modern-only candidate.
- The poem is not a simple fixed synonym table. Its stanzas are enigmatic verse with wordplay and shifting perspectives. Birkett notes that the rune-name headings were likely added as reader aids after the poem was copied; the supplied names and some readings are disputed. In particular, the referents of Peorð and Ior remain uncertain. Modern translations also vary, and one accessible translation explicitly cautions that the original Anglo-Saxon associations cannot be known with certainty.

## What the semantic echoes do—and do not—select

Several stanzas naturally resonate with the 2016 wording: Rad concerns riding over long paths; Ing describes a journey east over waves; Lagu describes water and a ship; Ac describes oak, acorns, and oak travelling over the ocean. These are real features of the poem, but they are examples selected because they resemble “road,” “direction,” “water,” and the tree image. The other stanzas offer many other objects, qualities, and moral themes. The set does not specify a unique path or decoding rule.

The p54 first rune is Ac (GP index 24; prime weight 97). That is a potentially interesting local anchor, but the preserved 2016 raster is only a faint leafless tree: its pixels do not establish oak species or location. The archive's tree caption is not part of the signed plaintext. One Ac/tree association therefore does not authenticate the poem as a whole or specify how to apply it to unknown pages.

The authenticated 2016 message says that the *words* are the map and their *meaning* is the road. It does not mention rune names, a rune poem, stanza headings, a particular edition, or an extraction rule. “Meaning” could refer to the meanings of the decoded book's words rather than to the meanings of its individual rune symbols.

## Operational test and stopping rule

There are only two obvious ways to turn this reference into a symbol mapping:

1. Map each rune glyph to its rune name. This is exactly the existing GP29 transliteration; it adds no new cipher layer, key, or plaintext.
2. Map each rune glyph to the meaning of its poem stanza. A stanza is a multi-line poem, not a single symbol value. No LP2 clue chooses the stanza's first noun, a particular translated gloss, initials, word count, a selected phrase, or any other reduction. Choosing one after looking at unknown output would be an unconstrained fit, not a source-selected codebook.

The poem's 29-stanza structure thus supplies a plausible semantic reference but no single-valued, reversible mapping from ciphertext runes to plaintext symbols. No frozen held-out plaintext prediction can be stated without inventing the missing operation.

## Prior work deliberately not repeated

- Closed Issue [#153](https://github.com/FlareZ123/liber-primus/issues/153) corrected the p32 offset premise and tested the proposed four-rune B/M/IA/NG diagonal against the Old English Rune Poem. The semantic echoes (tree/shoots, person, river-creature/home-in-water, east over waves) did not select a unique direction, page/word address, or destination. The overlapping 318-sum windows also prevent treating that diagonal as a unique selector. See [the consolidated p32 report](tree-prime-canvas-partition.md).
- Agent36's prior source note reports that direct prime-indexed character/word extraction from each of the 29 stanzas (both directions, 0/1-based and modulo-length conventions), cumulative prime steps through the flattened poem, and direct running-key use did not yield a meaningful key. This gate does not repeat those scans. See [the source note](../communications/agent20/20261110T190017Z_agent36_ac-rune-oak-semantic-lead.md).
- The separate p0 branch/stave investigation concerns cipher-rune notation, not a general semantic substitution of GP29. Do not conflate its Younger Futhark 6:5:5 convention with the Anglo-Saxon Futhorc.

## Conclusion

Keep the Old English Rune Poem as a historically plausible interpretive reference, but retire the claim that it currently supplies an executable LP2 semantic codebook. Reopen only if a primary LP2/Cicada source selects both (a) the semantic convention or stanza interpretation and (b) a specific reversible readout, start, direction, and state. Do not expand to other rune poems, translations, synonyms, or arbitrary stanza-feature sweeps.

## Sources

- Thomas Birkett, “Rune Poem,” *The Encyclopedia of British Medieval Literature* (2017), [University College Cork repository PDF](https://cora.ucc.ie/server/api/core/bitstreams/9cea25e4-fa8f-422a-9d61-f0818c0c76c0/content), especially the discussion of 29 stanzas, the lost witness, editorial rune names, and the poem's enigmatic wordplay.
- Aya Van Renterghem, *The Anglo-Saxon Runic Poem: A Critical Reassessment* (University of Glasgow MPhil thesis, 2014), [full PDF](https://theses.gla.ac.uk/5134/7/2014VanRenterghemMPhil.pdf).
- Tha Engliscan Gesithas, [“The Anglo-Saxon Rune Poem”](https://www.tha-engliscan-gesithas.org.uk/written-and-spoken-old-english/old-english-alphabet-2/the-anglo-saxon-rune-poem/), including the caveat about translation variation and uncertain historical associations.
- Repository source records: resources/liber-primus/lp2-corpus.json, resources/cicada2016-4gq25.md, im-results/tree-prime-canvas-partition.md, and the Agent36 source note linked above.
