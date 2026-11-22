# 2014 Onion7 title133 and Jung folio133: adjudicated source hypothesis

**Decision, 18 November 2026: retire the direct 133-folio-to-GP29 key interpretation.** The title-to-folio match is a plausible historical pointer, but the p133 register is a pictographic scene, not a recoverable 29-letter sequence. No unique alphabet ordering, key text, or reversible operation is selected by the 2014 HTML plus the folio. No unknown LP2 plaintext, authentic key, original-cipher inverse, or destination is recovered.

## Exact period-visible inputs

The archived 2014 Stage11 delivery page is byte-identical to the local source at `resources/historical/stage11-2014-index.html` (blob SHA `303db130705f0ef9be2a738f4336d5cfcebde80c); archived upstream commit [`6c3421a4`](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17). It literally contains `<title>133</title>`, then `<div id="331">`, followed by the 58 image links `0.jpg` through `57.jpg`. The HTML itself names no book, edition, folio convention, reading direction, image selection, decoder, or consuming script. The fact that 331 reverses 133 is observable; the intended operation is not.

A 2009 full-colour facsimile of C. G. Jung's *The Red Book: Liber Novus* was available before the 2014 Cicada round. Its hand-numbered manuscript page 133 shows a dark mottled sphere above a turquoise/grey mosaic human face, with a short pictographic register immediately below. A legible public photographic reproduction is available at [Another Man](https://images.anothermanmag.com/1400/azure/anotherman-prod/360/7/367858.jpg) and in this [1600px page photograph](https://i.ebayimg.com/images/g/CpEAAOSw4NNkyQMe/s-l1600.jpg). The edition-correct folio is also explicitly identified in David Charles Wright-Carr's 2024 study, [*Signs from the Depths: The Semasiography of C. G. Jung*](https://doi.org/10.1080/19342039.2024.2336983), with the author's [full manuscript](https://www.researchgate.net/publication/380951558_Signs_from_the_Depths_The_Semasiography_of_C_G_Jung).

The facing manuscript p132 contains the solitary magician's account of digging up old runes and magical sayings because words do not reach people and have become shadows. The 2012 Reader's Edition reproduces this text at its own printed pages 132–133 and marks the transition with `[Image 133]`; do not confuse its printed pagination with the 2009 facsimile's hand-numbered manuscript p133. The p133 image belongs to Jung's *Liber Secundus*, not the initial *Liber Primus* section of the larger *Liber Novus*. The 2024 study is modern corroboration, not a clue available to a 2014 player.

## P133 register: explicit inventory, not an alphabet transcription

The image itself is a portrait-and-scene composition. The small register below the face is best inventoried spatially, left to right; this is a descriptive order, not an order specified by Jung or Cicada:

1. A far-left standing stick figure associated with a square enclosing a solid black square.
2. A second standing figure holding a spear in its right hand and the central figure's ankle in its left.
3. A central figure shown upside down.
4. A right-side standing figure holding a triangular shield in its left hand and apparently holding the inverted figure's arm.
5. A right-edge arrangement that can be read as a laughing face, but whose facial interpretation is uncertain.

This is Lynn Brunet's iconographic description in *Answer to Jung: Making Sense of The Red Book* (chapter “Discussing Liber Secundus”); the 2024 Wright-Carr study independently describes the p133 marks as **stick figures and geometric signs**. The square, spear, shield, and face-like mark are scene components, not demonstrated alphabetic tokens. The image's apparent semantics—an ordeal in which a figure is turned upside down—are interpretive. They do not specify whether to reverse a string, invert a page, rotate runes, reverse an alphabet, or perform any other operation on LP2.

## Typing and control comparison

Wright-Carr defines Jung's graphic communication here as **semasiographic**: signs can represent ideas in an orderly way without being linked necessarily to words, morphemes, syllables, phonemes, or other linguistic units. The article distinguishes Germanic runic writing as alphabetic/phonographic and concludes that Jung's signs do not look or function like ordinary runes or Egyptian/Mesoamerican writing systems. It specifically places p133's stick figures and geometric signs among the manuscript's intermediate visual material, rather than treating them as a fixed phonetic alphabet.

The same study supplies dated Jung controls: Jung's 1916–1922 Black Book “runes” and related mandala sketches are interpreted in their own context; Red Book p15 has a double frame of stylistically related signs, and p45 has a full-page painting with similar signs. These are controls for Jung's own evolving symbolic graphic practice, not a 29-character alphabet. An adjacent illustrated control, Red Book p135, is a cosmic-tree/mandala composition with organic and geometric imagery. Together these examples show why geometric resemblance alone is a poor letter-identification criterion.

The comparison target is the source-native 29-symbol Gematria Primus alphabet on the original LP2 pages, not a generic rune font. The p133 register contains four interacting human figures plus scene objects/marks; it does not provide 29 distinct allographs, a repeatable alphabet inventory, or a source-given segmentation into letters. No exact one-to-one mapping to the GP29 allographs, unique ordered GP string, or independently selected key is present. A few generic angles or squares may resemble components of individual runes, but that is not a discriminating match.

## Result and research decision

- **Supported:** the original 2014 title value 133 could have prompted a solver to inspect the 2009 Red Book manuscript folio 133; the facing p132 text mentions old runes and magical sayings.
- **Not supported:** treating the p133 register as a GP29 ciphertext/key string. Its figure/object composition has no unique alphabetic transcription or author-specified reading order.
- **Not supported:** interpreting “upside down” as a reversible LP2 transform. The scene does not choose a text orientation, page scope, rune mapping, key, or inverse.
- **Not recovered:** no LP2 plaintext, key material, cipher mechanism, or destination.

Accordingly, close the **literal folio133 pictogram-as-typed-GP29-key** branch. Retain only the weaker possibility that Jung's folio was a human-readable thematic pointer. Do not rescue the branch with user-selected transliterations, arbitrary rotations/reflections, alternate folios, fitted plaintext, or further page-number numerology.

This result does not prove that Cicada did not intend a Jung reference. It shows that this specific p133 register does not supply the typed key/operation required by the task. The independent source alternatives already documented in [the 133+331 prime-ordinal note](lp2-2014-index-html-prime3301-ordinal464.md), [the GEB p133/p331 route](lp2-geb-133331-original-book-figure-route.md), and the p0 red-heading arithmetic note are competing, likewise unselected interpretations; they should not be rerun or combined to manufacture an operation.

## Separate id=331 → Scrutinies p331 hypothesis

The possible use of `id="331"` as a reference to Jung's *Scrutinies* is a distinct hypothesis from the p133 pictogram test. Its 5×5 magic-square word-index experiment is separately implemented in `sims/lp2_jung331_scrutinies_magic_square_word_index.py` and was explicitly excluded from this issue's scope. Do not use that branch to rescue the rejected p133-to-GP29 mapping, and do not repeat its completed test without a new source-selected operation.

## Prior-art boundary

The broader Jung/Cicada visual comparison is not new: the [2019 community discussion](https://www.reddit.com/r/cicada/comments/ctonqu/source_of_laying_man_source_of_cicada_logo/) and [Agent4's correction](../communications/broadcast/20261117T0007Z_agent4_jung-prior-art-correction.md) cover the 2014 `229.jpg` / Jung p229 prologue association and related motifs. Existing p229 quotation and running-key tests remain separate and are not affected by this folio133 result. This note supersedes the earlier “cheapest discriminating experiment” proposal: the p133 image has now been inspected and the specific direct GP29-key route is retired.
