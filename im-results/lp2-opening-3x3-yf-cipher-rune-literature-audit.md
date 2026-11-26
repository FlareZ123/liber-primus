# Historical scope audit: p0 3|3 twig-rune and Rotbrunna control

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

## Pre-2014 solved epigraphic control: Rotbrunna U1165

The strongest complete pre-2014 control for the Scandinavian ætt/position cipher is the Rotbrunna runestone U1165, published in *Upplands runinskrifter*, vol. 9, part 3 (1958), entry 1165, pp. 636–639. The edition gives the full inscription and translation:

`hialmtis × auk × þurstain × raistu × staina × [þisa] × ftir × huka + airikr + hiuk`

The six secret signs at positions 44–49 encode the carver's name. The edition notes that the first two long strokes were lost in a stone crack, but the remaining strokes are secure and earlier drawings preserve the damaged portion. It records Bugge's corrected reading **AIRIKR** (Erik), rather than Stephens' earlier **NIRIKR**, followed by ordinary runes `hiuk` (“carved”). The edition explicitly identifies the method as selecting a rune by its ætt and its position within that ætt.

The key order is the reversed 6:5:5 Younger Futhark partition:

| Group number | Rune order |
|---:|---|
| 1 | `tbmly` |
| 2 | `hnias` |
| 3 | `fuþork` |

Magnus Olsen's pre-2014 study of crypt-runes (Saga-Book V, 1906–07, pp. 257–261) documents the **twig-rune** graphic variant: branches on the side facing the inscription's beginning give the ætt number; branches on the other side give the rune's position. Olsen identifies the same reversed 6:5:5 order and notes its use in the Maeshowe No. 8 and No. 18 branch-rune inscriptions. Rotbrunna itself uses the related Isruna representation (long and short strokes), not the twig graphic; the underlying group/position operation is shared.

The Rotbrunna cipher sequence is `2:4, 2:3, 3:5, 2:3, 3:6, 3:5`:

| Coordinate | Group | Position | Output |
|---|---|---|---|
| 2:4 | `hnias` | 4 | A |
| 2:3 | `hnias` | 3 | I |
| 3:5 | `fuþork` | 5 | R |
| 2:3 | `hnias` | 3 | I |
| 3:6 | `fuþork` | 6 | K |
| 3:5 | `fuþork` | 5 | R |

This reproduces `AIRIKR` exactly. The 1958 edition supplies the complete inscription and corrected decipherment; the 1907 Olsen publication supplies the branch-rune convention; the accessible 2018 Uppsala Rune Blog gives the coordinate transcription as a modern cross-check.

**Transfer to p0:** applying only this source-fixed coordinate rule to a 3|3 branch-stave gives group 3, position 3: the third rune of `fuþork`, **þ (TH)**. This matches both GP29's third symbol and the first black rune immediately after p0's red span. The p0 marks are visually the twig/branch form, not Rotbrunna's long/short Isruna form; Olsen's branch-rune description is the direct graphic parallel.

This is a **single-symbol local selector**, not a complete alphabet transfer. The historical key is a 16-rune Younger Futhark; GP29 has 29 symbols. Only the first five symbols of GP29 align with the beginning of `fuþork` (F, U, TH, O, R); the sixth differs (GP29 C versus Younger Futhark K), and the other ætt groups do not map contiguously onto GP29. The 6:5:5 convention therefore cannot decode the 13-rune red span or supply a general GP29 receiver. No original continuation was tested because the source does not define the required 29-symbol extension.

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

The p0 3|3 → þ reading now has a fully deciphered pre-2014 epigraphic control: Rotbrunna U1165 decodes the carver's Isruna signature AIRIKR by the ætt/position rule, while Olsen 1907 documents the corresponding twig-rune branch representation. Under the same reversed 6:5:5 key, p0's 3:3 selects þ (TH), matching GP29's third symbol and the first black rune after the red span. This is a plausible human-facing local selector, not merely generic rune symbolism.

The remaining gap is material: the specific 6:5:5 convention is designed for the 16-rune Younger Futhark, whereas LP2's main alphabet is the 29-symbol Gematria Primus. The p0 red 13-rune heading itself is the GP string SHEOGMIAFSYENGC (S, H, E, O, G, M, IA, F, S, Y, E, NG, C); five rune instances (E, G, IA, E, NG) have no direct Younger Futhark counterpart. Thus 6:5:5 cannot be applied to the whole red span without an additional mapping. The mark could be a one-symbol selector or annotation, but it does not specify how to transform the 13-rune red span, nor does it establish a reusable 27×27 key-node rule. The 3|3 strokes must not be counted again as independent support for the 27×27 hypothesis.

A second original-image twig-rune with asymmetric branch counts (for example 3|5 or 2|4), whose associated GP rune is predicted by the same convention without reorienting the read, would be a materially stronger test. Otherwise the next prerequisite is independent evidence that the author intended a cross-alphabet switch to Younger Futhark cipher-runes. Do not extend the 16-symbol key to GP29 by arbitrary padding, reordering or truncation.

## Sources

- *Upplands runinskrifter*, vol. 9, part 3 (1958), entry U1165 Rotbrunna, pp. 636–639. [Official Riksantikvarieämbetet PDF](https://www.raa.se/runinskrifter/sri_uppland_b09_h03_text_2.pdf).
- Magnus Olsen, “Crypt-runes from the Brodgar Circle,” *Saga-Book of the Viking Club* V (1906–07), pp. 257–261. [Saga-Book PDF](https://vsnr.org/wp-content/uploads/2021/11/Saga-Book-V.pdf). The article states the branch-rune group/position rule and 6:5:5 order, and identifies Maeshowe No. 8 and No. 18 as examples.
- K. Jonas Nordby, Lønnruner: Kryptografi i runeinnskrifter fra vikingtid og middelalder (University of Oslo PhD dissertation, 2018), pp. 141, 164–168, 180–181, 185–187. National Library of Norway: http://urn.nb.no/URN:NBN:no-69539. Full-text PDF mirror: https://www.arild-hauge.com/PDF/Lonnruner-Kryptografi_i_runeinnskrifter_fra_vikingtid_og_middelalder-K.Jonas_Nordby.pdf
- Henrik Williams, “Cryptic runes,” Uppsala University Rune Blog (2018-11-28): https://www.runforum.nordiska.uu.se/blog/cryptic-runes/
- Menota Handbook 4.0 β, §18.3.13: https://www.menota.org/HB4_ch18.xml#18.3.13
- Michael P. Barnes, “Runic Tradition in Orkney” (2003), pp. 4–17: https://www.arild-hauge.com/PDF/Barnes_Orkney_2003_pp_4-17.pdf

## Decision boundary

This audit establishes a fully deciphered pre-2014 control for the 6:5:5 ætt/position method and a documented branch-rune graphic variant. It supports only the local p0 3|3 → TH selector. It does not establish a 29-symbol GP29 extension, a general key, a p1/p2 continuation rule, or any LP2 plaintext. Keep the operation local unless an independent source selects the alphabet extension or a second original-image marker confirms it.
