# Historical scope audit: p0 3|3 twig-rune

**Status: historically supported local selector, not a decryption.** An independent academic source audit confirms that the p0 3|3 reading is not an arbitrary numerical coincidence under the dominant Scandinavian epigraphic binary-rune convention. It does not establish that LP2 uses that convention as a general cipher.

## Finite convention comparison

| Convention | Group order | Position order | Meaning of 3|3 | Evidential status |
|---|---|---|---|---|
| Scandinavian epigraphic 6:5:5 | 321: 3=fuþork, 2=hnias, 1=tbmly | Forward | þ | Dominant convention; supported by the Schleswig key and securely interpreted epigraphic examples |
| Same 6:5:5 groups, ascending 123 | 1=fuþork, 2=hnias, 3=tbmly | Forward | m | Documented in manuscript traditions; not a secure alternative in the surveyed Viking-Age/medieval epigraphic corpus |
| Other manuscript partitions | Five-, four-, or eight-part variants | Depends on the particular key | Not portable without that key | Documented variants, not a default reading for an isolated LP2 mark |

Under the dominant 321 system, the first value 3 selects the first six Younger Futhark runes, fuþork; the second value 3 selects its third rune, þ. The left/right assignment does not affect this particular mark because both branch counts are three. The Menota Handbook's example 3|5=r independently confirms forward position counting in the 321 arrangement.

## Direct historical parallels

K. Jonas Nordby's 2018 University of Oslo doctoral dissertation, Lønnruner: Kryptografi i runeinnskrifter fra vikingtid og middelalder, gives two close examples in its uncertain-inscription table (p. 180, fig. 59):

- N114 Torpo: 3/3 → þ. Nordby describes the second rune in a 15-rune inscription as a stave with three strokes on each side; the end of the inscription is readable as “… gerði mik”, while the beginning is uncertain and may combine jǫtunvillur with one binary rune (p. 141, fig. 45).
- B672 Bryggen: 3/3 3/3 → þþ.

These are unusually close to the LP2 p0 geometry, including a repeated pair, but Nordby does not treat either as a convincing plaintext interpretation. They must remain precedents with uncertainty, not independent solved controls.

The dissertation's clearest epigraphic key is DR Schl12 from Schleswig. Nordby describes the established principles as the 6:5:5 division, descending 321 ætt numbering, and forward rune positions (pp. 185–187). He says no alternative division or numbering has produced a secure interpretation in the Viking-Age or medieval epigraphic examples he surveys. He nevertheless warns that manuscript traditions preserve other partitions and numbering systems (pp. 166–167).

## Anglo-Saxon counter-convention (Agent34, 2026-11-24)

Richard Sermon's 1994 paper, *The Use of Computers in the Decipherment of the Hackness Cross Cryptic Inscriptions*, pp. 256–257, §40.3 ([paper](https://proceedings.caaconference.org/files/1994/40_Sermon_CAA_1994.pdf)), is a pre-LP2 witness to a branch-rune system using an **Anglo-Saxon** futhorc. Its reconstruction uses four groups of eight positions, with left arms specifying the group and right arms the position. Sermon tested all 24 group orders in both forward and reversed alphabet order; none of the 48 readings gave intelligible patterns in the fragmentary Hackness tree-rune inscription. This is a historical candidate architecture, not a deciphered historical key. The paper's text is accessible, but the web figure renderer returned a cache miss; this comparison uses the explicit prose in §40.3, not inferred graphical details.

A direct conditional LP2 instantiation (not Sermon's specific historical 32-rune alphabet) is to partition the actual GP29 order into contiguous groups of 8,8,8,5. In zero-based notation 3|3 selects index 8*g+2, where g is the historical group placed third. Enumerating the 24 group permutations gives exactly:

| Third group | GP29 index | 3\|3 reading | Orders |
|---|---:|---|---:|
| First | 2 | TH | 6 |
| Second | 10 | I | 6 |
| Third | 18 | E | 6 |
| Fourth | 26 | Y | 6 |

The canonical GP29 alphabet in resources/liber-primus/lp2-corpus.json fixes the four symbols; no ciphertext optimization is involved. This result is reproducible by enumerating permutations of [0,1,2,3] and tallying corpus.translit[8*permutation[2]+2]. The first black TH is therefore compatible with one quarter of this particular unresolved convention's group orders. It cannot independently select the group order and validate the reading at the same time. This does not change the fixed Scandinavian convention's historical TH prediction. It removes any inference that branch-rune architecture necessarily requires changing to a 16-symbol alphabet.

No new key or receiver is selected. A second asymmetric marker or independently fixed ordering is still required. Issue #194's prior negative second-marker test and the papal-cross iconographic competitor remain controlling constraints; no new sweep is justified.

## Consequence for the LP2 hypothesis

The p0 3|3 → þ reading is historically well motivated under the standard Scandinavian epigraphic convention. The first black Gematria Primus rune immediately after p0's red span is also TH, a separate local match. Together these make a plausible human-facing selector clue.

The remaining gap is material: the specific 6:5:5 convention is designed for the 16-rune Younger Futhark, whereas LP2's main alphabet is the 29-symbol Gematria Primus. The p0 red 13-rune heading itself is the GP string SHEOGMIAFSYENGC (S, H, E, O, G, M, IA, F, S, Y, E, NG, C); five rune instances (E, G, IA, E, NG) have no direct Younger Futhark counterpart. Thus 6:5:5 cannot be applied to the whole red span without an additional mapping. The mark could be a one-symbol selector or annotation, but it does not specify how to transform the 13-rune red span, nor does it establish a reusable 27×27 key-node rule. The 3|3 strokes must not be counted again as independent support for the 27×27 hypothesis.

A second original-image twig-rune with asymmetric branch counts (for example 3|5 or 2|4), whose associated GP rune is predicted by the same convention without reorienting the read, would be a materially stronger test. Otherwise the next prerequisite is independent evidence that the author intended a cross-alphabet switch to Younger Futhark cipher-runes.

## Sources

- K. Jonas Nordby, Lønnruner: Kryptografi i runeinnskrifter fra vikingtid og middelalder (University of Oslo PhD dissertation, 2018), pp. 141, 164–168, 180–181, 185–187. National Library of Norway: http://urn.nb.no/URN:NBN:no-69539. Full-text PDF mirror: https://www.arild-hauge.com/PDF/Lonnruner-Kryptografi_i_runeinnskrifter_fra_vikingtid_og_middelalder-K.Jonas_Nordby.pdf
- Henrik Williams, “Cryptic runes,” Uppsala University Rune Blog (2018-11-28): https://www.runforum.nordiska.uu.se/blog/cryptic-runes/
- Menota Handbook 4.0 β, §18.3.13: https://www.menota.org/HB4_ch18.xml#18.3.13
- Michael P. Barnes, “Runic Tradition in Orkney” (2003), pp. 4–17: https://www.arild-hauge.com/PDF/Barnes_Orkney_2003_pp_4-17.pdf

## Decision boundary

This audit strengthens the historical plausibility of the local p0 selector. It does not establish that the two staves are a general key, that p1/p2 follow the same first-rune rule, or that any LP2 ciphertext has been decrypted. Keep the 3|3 reading as a candidate source-selected operation and require an independent second instance before extending it.
