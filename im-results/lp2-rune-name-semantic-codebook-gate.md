# GP29 rune-name semantic codebook: source gate

**Decision:** the Old English Rune Poem is a plausible historical reference for GP29, but the surviving evidence does not select a unique semantic readout or reversible operation. Retire the current semantic-codebook and direct rune-name substitution routes as LP2 decipherment hypotheses; historically attested rebus/terminal-name rules are documented below. No unknown plaintext, key, cipher mechanism, or destination was recovered.

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

1. Map each rune glyph to its rune name. This is an alternate unique label for the same rune identity (not necessarily the same Latin spelling); it adds no new cipher layer, key, or plaintext.
2. Map each rune glyph to the meaning of its poem stanza. A stanza is a multi-line poem, not a single symbol value. No LP2 clue chooses the stanza's first noun, a particular translated gloss, initials, word count, a selected phrase, or any other reduction. Choosing one after looking at unknown output would be an unconstrained fit, not a source-selected codebook.

The poem's 29-stanza structure thus supplies a plausible semantic reference but no single-valued, reversible mapping from ciphertext runes to plaintext symbols. No frozen held-out plaintext prediction can be stated without inventing the missing operation.

## Prior work deliberately not repeated

- Closed Issue [#153](https://github.com/FlareZ123/liber-primus/issues/153) corrected the p32 offset premise and tested the proposed four-rune B/M/IA/NG diagonal against the Old English Rune Poem. The semantic echoes (tree/shoots, person, river-creature/home-in-water, east over waves) did not select a unique direction, page/word address, or destination. The overlapping 318-sum windows also prevent treating that diagonal as a unique selector. See [the consolidated p32 report](tree-prime-canvas-partition.md).
- Agent36's prior source note reports that direct prime-indexed character/word extraction from each of the 29 stanzas (both directions, 0/1-based and modulo-length conventions), cumulative prime steps through the flattened poem, and direct running-key use did not yield a meaningful key. This gate does not repeat those scans. See [the source note](../communications/agent20/20261110T190017Z_agent36_ac-rune-oak-semantic-lead.md).
- The separate p0 branch/stave investigation concerns cipher-rune notation, not a general semantic substitution of GP29. Do not conflate its Younger Futhark 6:5:5 convention with the Anglo-Saxon Futhorc.

## Historically typed rebus and terminal-name conventions — #2645 (Agent34, 24 November)

**Historical precedent positive; direct LP2 receiver negative.** This is distinct from choosing arbitrary meanings or extracting stanza statistics. Pre-LP2 sources document two real operations:

1. **Marked-rune rebus / signature.** Paull F. Baum's 1963 edition, [riddle 68 (Krapp–Dobbie 24)](https://en.wikisource.org/wiki/Anglo-Saxon_Riddles_of_the_Exeter_Book/Annotated/68), gives the original six isolated glyphs `ᚷ ᚫ ᚱ ᚩ ᚻ ᛁ` amidst ordinary Old English writing. The surrounding verse identifies six letters as the name of its sound-mimicking speaker. Rearranging their letter values gives the conventional HIGORÆ/HIGORA (jay/magpie) interpretation; the animal's described behaviour constrains the anagram. The glyphs, explicit count, and answer class are independently available. Cynewulf's four poetic signatures provide a related convention: script-isolated runes spell an author's name while also functioning as words in the surrounding verse ([1911 Britannica](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Cynewulf_(poet))). Greenfield's [1965 discussion](https://www.enotes.com/topics/cynewulf/criticism/criticism/stanley-b-greenfield-essay-date-1965) gives Fates of the Apostles' printed order FWULCYN, with a last-position pun on feoh and a surrounding explicit question about authorship; restore CYNWULF. This is not an unrestricted anagram convention. Niles's [2006 study](https://www.academia.edu/38567259/Cynewulfs_Use_of_Initialisms_in_his_Runic_Signatures) argues that some rune readings are contextual initialisms rather than fixed conventional names. Hence the signatures cannot furnish an independent universal semantic codebook.
2. **Jötunvillur.** A materially closer, actually deciphered historical rune-name operation was published **7 February 2014**, before the May LP2 distribution: [Medievalists.net](https://www.medievalists.net/2014/02/norse-rune-code-cracked/), [Guardian, 12 February 2014](https://www.theguardian.com/books/2014/feb/12/ancient-viking-code-deciphered-runologist-jotunvillur), and [ScienceNorway](https://www.sciencenorway.no/archaeology-history-forskningno-language/mysterious-code-in-viking-runes-is-cracked/1396525). Nordby recognized parallel ordinary/coded names on medieval rune sticks and recovered the substitution of a rune by the rune for the final sound of its name (e.g. U/urr → R; M/maðr → R; K/kaun → N). This is a real historically obtainable algorithm, but is many-to-one and was documented for the Scandinavian rune system, not the GP29 alphabet. No dated evidence links the report to Cicada's authors.

### Original LP2 decision

I inspected the supplied original p0, p56 and p57 JPEGs (archive 17, 73 and 74). p0 has two 3|3 twig marks, an 8+5 red heading, an ordinary red word divider and a large 13-dot separator; the black text begins TH. This agrees with the [source ink override](../resources/liber-primus/lp2-p0-physical-ink-override.json) and the [separate twig audit](lp2-opening-3x3-yf-cipher-rune-literature-audit.md). The twig notation could prompt consulting cryptic-rune literature, including the contemporary Jötunvillur discovery. But the two 3|3 marks only suggest þ under the distinct 6:5:5 convention; neither encodes a rune-name reading direction. The solved clear p57 has an analogous red heading PARABLE and ordinary GP text. Red ink and a counted delimiter can select a heading, but the known control establishes an ordinary heading role without requiring a hidden author name. p0 has no surrounding readable Latin-script carrier, no independently identified answer type, and no explicit instruction to rearrange a selected set. p56's known title AN END is a weak prompt for a terminal operation, not a specification of whose names, which alphabet, or a key consumer.

For a precise bounded obstruction, freeze the literal Old English stanza-opening name spellings of the [Dickins 1915 poem transcription](https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem). This is an **orthographic analogue**, not a claim about reconstructed Old English phonology or a historically attested GP29 variant:

`Feoh Ur Ðorn Os Rad Cen Gyfu Wenne Hægl Nyd Is Ger Eoh Peorð Eolh-secg Sigel Tir Beorc Eh Man Lagu Ing Eþel Dæg Ac Æsc Yr Iar Ear`

- Taking first written characters has only 22 distinct outputs (even retaining Ð and Æ separately). G collapses G/J, I collapses I/NG/IA, and E collapses EO/X/E/OE/EA. The original p0 heading would render as `SHEOGMIF SYEIC` with 450 distinct GP29 preimages for those fixed letters. The p57 clear title renders as PARABLE; this operation does not reveal a different control instruction.
- Taking final written characters and rendering terminal ð as GP TH gives only **11** possible output runes: H,R,N,S,D,U,E,L,TH,G,C. Every full-alphabet page is incompatible with this as the final deterministic substitution. On the original LP2 tape, **8,114/12,956** glyphs lie outside this support; all 55 rune-bearing pages contain at least one contradiction. On p0 alone **165/262** are outside support, including **6/13** red heading glyphs. The actual heading's forward terminal-name rendering is `LLHSUNRH LRHGN` (space placed at the physical 8+5 divider), not a typed instruction. Even allowing an arbitrary subsequent *fixed bijective* alphabet relabeling cannot expand the image beyond 11 symbols; p0 contains all 29. Unmodified historical Younger Futhark cannot emit 29 distinct glyphs either. This excludes a direct terminal-name substitution as the final cipher layer, not an arbitrary later changing-state cipher or a terminal-name-derived key.

The arithmetic and original support test were executed locally/through the connected GitHub corpus reader, not estimated. Reproduce from the repo root with Node (no extra packages); corpus blob at execution was `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`:

```js
const d = require('./resources/liber-primus/lp2-corpus.json');
const names = 'Feoh Ur Ðorn Os Rad Cen Gyfu Wenne Hægl Nyd Is Ger Eoh Peorð Eolh-secg Sigel Tir Beorc Eh Man Lagu Ing Eþel Dæg Ac Æsc Yr Iar Ear'.split(' ');
const terminal = names.map(n => n.at(-1).toUpperCase() === 'Ð' ? 'TH' : n.at(-1).toUpperCase());
const support = new Set(terminal);
const pages = d.pages.filter(p => p.page < 56);
const bad = a => a.filter(i => !support.has(d.translit[i])).length;
const p0 = pages.find(p => p.page === 0).indices;
console.log(support.size, pages.reduce((s,p) => s + p.indices.length,0),
  pages.reduce((s,p) => s + bad(p.indices),0),
  pages.filter(p => bad(p.indices)).length, bad(p0), bad(p0.slice(0,13)));
console.log(new Set(names.map(n => n[0].toUpperCase())).size,
  p0.slice(0,13).map(i => names[i][0].toUpperCase()).join(''),
  p0.slice(0,13).map(i => terminal[i]).join(''));
```

Expected first line: `11 12956 8114 55 165 6`. No English search, arbitrary name synonyms, edition/phase/clock sweep, or stanza-key rerun was performed.

**Director fork:** close #2645 under the missing-independent-selector criterion. The most useful surviving historical lead is the early-February 2014 publication of a real terminal-name cipher, with a known parallel-name witness; it warrants reconsideration only if an LP2-specific parallel plain/coded name or equivalent explicit instruction fixes the register and a separate original receiver. The current source does not do so. Do not commission another arbitrary periodic terminal-name Vigenère search, direct rune-name semantic key, or heading-anagram sweep. No unknown plaintext, key or complete inverse.

## Conclusion

Keep the Old English Rune Poem as a historically plausible interpretive reference and the documented rebus/terminal-name conventions as source context. The present evidence supplies neither an executable LP2 semantic codebook nor an independently selected name-derived key. Reopen only if a primary LP2/Cicada source selects both (a) the semantic convention or stanza interpretation and (b) a specific reversible readout, start, direction, and state. Do not expand to other rune poems, translations, synonyms, or arbitrary stanza-feature sweeps.

## Sources

- Thomas Birkett, “Rune Poem,” *The Encyclopedia of British Medieval Literature* (2017), [University College Cork repository PDF](https://cora.ucc.ie/server/api/core/bitstreams/9cea25e4-fa8f-422a-9d61-f0818c0c76c0/content), especially the discussion of 29 stanzas, the lost witness, editorial rune names, and the poem's enigmatic wordplay.
- Aya Van Renterghem, *The Anglo-Saxon Runic Poem: A Critical Reassessment* (University of Glasgow MPhil thesis, 2014), [full PDF](https://theses.gla.ac.uk/5134/7/2014VanRenterghemMPhil.pdf).
- Tha Engliscan Gesithas, [“The Anglo-Saxon Rune Poem”](https://www.tha-engliscan-gesithas.org.uk/written-and-spoken-old-english/old-english-alphabet-2/the-anglo-saxon-rune-poem/), including the caveat about translation variation and uncertain historical associations.
- Repository source records: resources/liber-primus/lp2-corpus.json, resources/cicada2016-4gq25.md, im-results/tree-prime-canvas-partition.md, and the Agent36 source note linked above.
