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


## Equal-length page-pair additive receiver (27 November, Agent21)

The source-selected p14→p23 navigation is provisional: p14's margin stalk is reused on p8–14, and its lateral insect is not the vertical insect on p23–26. See [the source gate](lp2-p14-mayfly-root-stalk-source-gate.md). The exact lengths are p14=137, p55=76, p23=213. Among distinct physical unresolved page pairs, only (14,55) and (32,51) sum to 213 (121+92 for the rival). This is a postselected length coincidence, not a source-authenticated shared-key instruction.

Direct use of p14||p55 as an additive key for p23 yields IoC .0330853 (subtraction) or .0361857 (addition), no prose; original .0318894. Next, give the two streams **every one of 29^213 arbitrary additive pads**: C_A=P_A+K, C_B=P_B+sK (s=+1 or -1), zero-based forward physical order. Exact joint trigram Viterbi, resetting the second language history at its page split, returns nonprose for both signs and both pairs. The score for p14||p55 is -1.892875 / -1.948274 nats per rune. Held native-text matched-pad controls recover only 40–112 of 426 runes across all four cells, and scores overlap the independent-pad controls. The trigram result alone does not establish an exclusion.

A stronger receiver assumes only the complete original printed words come from the pinned TextBlob GP lexicon (29,061 unique words), without assuming any language score or restricting page-edge fragments. Two word partitions overlay to form a forest of interval overlaps. Each edge constrains the shared pad on its intersection; each word candidate determines that pad segment exactly. Bottom-up sum-product over shared-pad signatures counts **every** feasible word/pad assignment exactly (BigInt), with max-product backtracking and replay for nonzero solutions. The algorithm checks the forest property. Source transcription uses the existing '-' and '.' word delimiter convention; no cross-page incomplete words are forced into dictionary entries.

| B stream | Sign s | Complete words A/B | Impossible local overlaps | Failed forest components | Global assignments |
|---|---:|---:|---:|---:|---:|
| p14||p55 | +1 | 45/47 | 8 | 7/12 | 0 |
| p14||p55 | -1 | 45/47 | 10 | 7/12 | 0 |
| p32||p51 | +1 | 45/40 | 6 | 7/11 | 0 |
| p32||p51 | -1 | 45/40 | 7 | 8/11 | 0 |

All 16 matched dictionary-word plants have nonzero assignments; all 16 independent-pad negatives have zero. MAP recovers 294–390 of 426 planted runes, with multiple feasible assignments even for positives. This excludes the two fixed additive reuse geometries **conditional on the finite complete-word register**, not arbitrary English, altered word boundaries, F-hold clocks, or other mechanisms. No source-selected key or unknown plaintext. Do not expand the length coincidence into a menu of unrelated transforms.

Reproduce: [trigram SFT](../sims/lp2_p14_p55_p23_sharedpad_sft.cjs), [trigram raw](lp2-p14-p55-p23-sharedpad.json), [exact word-forest SFT](../sims/lp2_p14_p55_p23_sharedpad_word_forest_sft.cjs), [forest raw](lp2-p14-p55-p23-sharedpad-word-forest.json). Both were executed in connected JS; Node wrappers not independently CI-run.

## Decision for the Director

The proposed 29-stanza **complete codebook** is exhausted as a *source-selected new operation*: its one ordinary historical index mapping is already Gematria Primus. The external poem could still become a source of a key if a separate authenticated clue specifies **which stanza data to extract and how to apply it**; that dependency is presently absent. Reopen this lane only with an independent source-authored selector fixing both a nonidentity operation and target clock before touching the unknown ciphertext. The separate p14 art-attribution assignment #697 can assess the semantic link without this codebook claim.

No source-selected new decoder emerged; the conditional page-pair experiment above returned no valid dictionary inverse. All 12,956 original unknown runes and all source image/transcription records remain unchanged.

**Evidence class:** exact historical alphabet equivalence plus a bounded no-selector decision. **No recovered key, ciphertext inversion, unknown plaintext, or destination.**
