# External Wulfic 2026 p18/p19 prefixes and P20 source audit

**Status:** the p18/p19 key arrays reproduce short plaintext prefixes only; they are not independently derived keys or full-page decryptions. The published P20 812/166/646 Deor continuation is based on a missegmented, wrongly numbered input and is retired as currently specified.

Sources:
- Wulfic [MASTER_TRACKER.md](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md)
- Wulfic [README.md](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/README.md)
- Wulfic [canonical provenance](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/canonical/PROVENANCE.md)
- Pinned historical artifact: [old pages/page_20/runes.txt](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/0f89de541b/pages/page_20/runes.txt), commit 0f89de541b, Git blob SHA 088f54d1336501d7378bcbf74703981d6358e1c2
- Correct current internal p20: [pages/page_37/README.md](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_37/README.md)

Wulfic's README explicitly classifies p18/p19 as partial and warns that many per-page “solved” labels are false positives from hill-climbing. The tracker calls the keys confirmed, but its own README is the more cautious status. Treat the arrays as hypotheses.

## Reproduction of p18/p19 prefixes

Using resources/liber-primus/lp2-corpus.json, GP29 order, continuous key clocks:

p18 SUB key (53):
[11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24]

Prefix (64 symbols):
BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY

p19 ADD key (47):
[24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28]

Prefix (54 symbols):
REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR

The remaining output of both pages is not coherent language under these arrays. The final four p19 key entries are all 28 (EA), and the arrays are not independently derived. These are prefix-level leads, not verified plaintext.

## Conditional F-skip check

The external tracker specifies a conditional skip only when BOTH the ciphertext rune and current key value are index 0 (F). Tested ordinary Vigenere and this conditional rule:
- p18 has one conditional skip at rune index 230. Prefix unchanged; IoC changes 0.03816 → 0.03917; tail remains gibberish.
- p19 has no conditional skips; output unchanged, IoC 0.03425.

Thus the F-skip convention does not explain the unreadable tails. Reproduction: node sims/external_wulfic_p18_p19_repro.cjs.

## P20: the 812-rune object is not LP2 page 20

The Wulfic tracker describes a P20 prime-position stream of 166 runes and a non-prime stream of 646, followed by Deor/Beaufort and a 2×83 transpose. The historical file behind the 812 count is not internal LP2 page 20.

The pinned pre-canonical artifact pages/page_20/runes.txt at commit 0f89de541b contains 812 rune glyphs. Its accompanying old README labels it as image 20 and reports approximately 812 runes. After Wulfic's canonical rebuild, the page mapping is explicit: scan = 17 + LP2 page. Current scan 20 is LP2 p3 and contains 217 runes; current internal LP2 p20 is scan 37 and contains 269 runes. The tracker's P20 section therefore does not refer to the current canonical p20 input.

The old 812-rune sequence is not corrupted text: it matches exactly a contiguous slice of the current canonical corpus, but the slice is missegmented. It is:
- all of LP2 p3 / scan20: 217 runes;
- all of LP2 p4 / scan21: 261 runes;
- all of LP2 p5 / scan22: 263 runes;
- the first 71 runes of LP2 p6 / scan23.

Thus 812 = 217 + 261 + 263 + 71. It begins at LP2 offset 729 and ends 71 runes into p6, not at a page or section boundary. The rune-only sequence SHA-1 is d6e96026e64beb82a7376ea2cbd082cf1ad72b87. The reproducible mapping/count audit is sims/external_wulfic_p20_mapping_audit.cjs. The original external text is not vendored; its pinned commit and Git blob SHA above identify it.

The claimed 166/646 split is also incompatible with the documented prime-position rule:
- On the 812-rune sequence, zero-based rune positions give 141 prime positions and 671 non-prime positions, not 166/646.
- On actual LP2 p20 (269 runes), the split is 57/212. A 166-symbol 2×83 prime stream cannot be extracted from that page.
- The old raw text file has 988 Unicode code points including delimiters. There are 166 prime raw-character offsets (π(988)), but only 138 of those offsets land on rune glyphs. Counting raw character offsets therefore does not produce a 166-rune stream either.
- The published legacy solver increments its position counter only when it consumes a rune; on the 812-rune artifact that rule yields 141/671, not 166/646.

**Decision:** retire this exact 812/166/646/2×83 Deor pipeline. It applies a prime mask and transposition to a stale multi-page slice mislabeled as P20, and the reported partition does not follow the documented rune-position rule. This does NOT disprove that Deor is relevant or exclude a different, independently source-selected multi-page operation. Any revived Deor route must first specify an original page/group boundary and a prime-index convention from evidence independent of the desired output.

No established result changes. Do not promote the p18/p19 fragments to results/ until a source-derived key and independently validated full-page plaintext exist.