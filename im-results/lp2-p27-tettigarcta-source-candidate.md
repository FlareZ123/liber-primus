# p27 Tettigarcta forewing source candidate: exact crop, historical locator, unresolved registration

**21 November 2026, Agent8; Director task #2021.** This report records a new, clue-constrained source candidate for the isolated LP2 physical-p27 wing. It does **not** claim an exact image attribution or a decipherment.

## Candidate sources

### Evans's Tettigarcta forewing

J. W. Evans, “The Morphology of Tettigarcta tomentosa White (Homoptera, Cicadidae),” Papers and Proceedings of the Royal Society of Tasmania, 1940 volume, pp.35–49 (bibliographic citation commonly dated 1941). The paper's printed p.41 contains **Fig.12, “Tettigarcta tomentosa. Forewing.”** The figure labels Sc, R + Sc, and NL. The text says that the subcostal vein fuses with the upper radial-sector branch up to the nodal line, that the radial sector divides before the nodal line, that all four branches of the median vein are developed, that there is a third anal vein, and that the nodal line extends across the wing. [Original paper PDF](https://eprints.utas.edu.au/13273/1/1940-evans-morphology.pdf).

This is a strong locator because it is a **specific isolated cicada forewing with an explicitly labelled nodal line**, not a generic insect-wing resemblance. It offers a plausible human route from the p27 wing image to an anatomical source. But the PDF's text was accessible while its figure raster was not: attempts to retrieve the figure image/screenshot returned access/cache failures. Therefore no pixel registration, vein-by-vein match, or source-authored face order is established.

### Earlier Tettigarcta reference

Adam White's description appears in Edward John Eyre, Journals of Expeditions of Discovery into Central Australia and Overland from Adelaide to King George's Sound in the Years 1840–1, vol. I (1845). The volume's plate list calls Plate III “New Insects” and lists figure 4 as Tettigarcta tomentosa and figure 5 as its pupa; White's descriptive text refers to “pl. 4, fig. 4” and fig. 5. The plate-number discrepancy is preserved rather than silently reconciled. The species description says the wings are clear and somewhat ferruginous at the base. [Gutenberg transcription and plate list](https://www.gutenberg.org/files/5344/5344-h/5344-h.htm); [Wikimedia scan of volume I](https://commons.wikimedia.org/wiki/File:Journals_of_Expeditions_of_discovery_into_Central_Australia,_and_overland_from_Adelaide_to_King_George%27s_Sound,_in_1840-1_(IA_journalsofexpedi01eyre).pdf).

The Gutenberg transcription states that plates are not reproduced. The scan is a primary-image locator, not yet a visual match. The 1845 plate's figure order identifies the adult and pupa; it does not number the fifteen wing faces.

## Original p27 source artifact and exact crop manifest

Primary artifact: resources/liber-primus/44.jpg, **2400×3600** pixels, SHA-256:

c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e

No resizing, rotation, perspective correction, or anisotropic scaling was applied. The complete-wing crop is the tight bounding box of the largest 8-connected ink component (grayscale <160) inside analysis window x=520..1939, y=450..929. Bounds are half-open source-pixel coordinates. The extracted crop is 8-bit grayscale (PIL mode L), with base left and tip right.

| Extract | Source-pixel bbox [x0,y0,x1,y1) | Size | Raw-pixel SHA-256 | PNG SHA-256 |
|---|---|---:|---|---|
| Complete wing | [643,514,1787,858) | 1144×344 | 68727642411ed535df167e55efcb82cb7caf4ccad6e2065139df198c44114d98 | dc780f2c31bb8d40d6b9b3776409108387edb913751b165f8847100ab99c6bb5 |
| Interior face 6 mask | [1011,618,1440,772) | 429×154 | 461f467f141c293ffc5aba2ef717a580e6ec07cdc86a7f28834cc7fb3f613bf4 | 5899acdb98edfef939f016558dcb10104dd5d04690e2e66cb2b6718c104546d2 |
| Interior face 9 mask | [1158,552,1602,721) | 444×169 | a9333ee6d984aa961f51ce9d0fbeb13aa9954d53691997cea4f2fe41e3eeb3ed | b6fa9f15dbfcff5a73dd2a34210d0a4992908ac418130c7a82e19edb24846b4d |

Face masks were extracted from the analysis window using 8-connected components of grayscale >160, retaining area >=200, excluding components touching the crop boundary, and sorting by increasing horizontal centroid. Face 6 has area 31,908 and centroid (1221.40, 698.35); face 9 has area 32,212 and centroid (1378.59, 647.01). Their masked original-grayscale sample hashes are respectively e82529e29e11241bca105924ec8d97049c1fbd02cc854d948a6e369c393c326f and 2f4d5d6d03503ab8fb0a6edecb92cfa6ae649bbd876c66a18e0335d41824a829. Their masked-source grayscale crop hashes are a53bd134c0b4b6b96ffb15700807f5146a6000741e23e72adf0978b14f3fb1e6 and 7eaec04823b396103989117614261ec861614ed4604429e21f4f0cdd9a33010d.

These are analysis labels, not author-printed numbers. The [original 15-face graph report](lp2-p27-original-wing-15face-graph-source-gate.md) documents four possible basal-to-tip Hamiltonian paths. No one is selected by the current evidence.

## What the source does and does not establish

The Evans paper provides a **named anatomical description** and a labelled nodal line. Its labels are vein/line identifiers, not fifteen face numbers or an explicit traversal. The 1845 plate list gives a figure order for specimens, not an order of the enclosed wing faces. The p27 drawing's prominent cross-wing line may be analogous to a nodal line, but that is only a visual hypothesis until the original Fig.12 image is registered.

The prior exact-source comparisons of Moulds 2005/2012 and other designated entomological plates remain negative. They do not exclude this distinct 1940 figure, but neither do they support it. The earlier graph-only result remains important: a symbol-preserving face permutation leaves the original ciphertext histogram and index of coincidence unchanged, so even a confirmed face order would not, by itself, constitute a decipherment.

## Decisive next test

1. Obtain a verified original raster of Evans Fig.12 (or the 1845 Tettigarcta plate).
2. Register it against the original p27 crop using the existing frozen full-span similarity gate; do not use anisotropic warping to rescue a mismatch.
3. If the image match passes, map Sc, R + Sc, and NL onto the p27 graph and determine whether the source actually selects one of the four paths. Freeze that order **before** examining ciphertext output.
4. Require a source-motivated, reversible **value-changing** operation and an independent original-page prediction. A pure face permutation is already insufficient.
5. If the original image fails the exact match or provides no unique order, retire this candidate and do not restart generic cicada/wing/species searches.

**Status:** specific historical source lead; exact raster match unavailable; no source-authored fifteen-face order, key, reversible operation, or LP2 plaintext recovered.