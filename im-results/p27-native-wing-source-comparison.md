# LP2 p27 isolated wing: original-image source attribution gate

**Status (11 November 2026): bounded no-match; no recovered key, plaintext, or operation.** This audit compares a reproducible native crop to named dated references. It does not assert that the wing has no historical source.

## The source-visible object and intended human route

Physical LP2 p27 is original `resources/liber-primus/44.jpg` (2400 × 3600 RGB; original JPEG SHA-256 `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`). At the top of this page is a black isolated wing. The pixel-preserving source crop is `im.crop((575,485,1810,910))`, Python Pillow half-open coordinates; cropped width/height **1235 × 425**, raw RGB-byte SHA-256 `721ba7b9cd5297964044f609ea8a1bf78b3cddfc613f7dfdffe4887fa7e3af40`. The crop itself is not a derived source and needs no artwork reinterpretation. The adjacent page text supplies no legend or species name.

The wing's discriminating landmarks are a thick black basal wedge on the left, an elongated upper edge with a branch descending near the center, a large middle parallelogram-like vein cell, and several small partly closed cells around the rounded right tip. Its simple venation is especially important: matching merely a narrow wing outline is weak. The separately printed complete Cicada 3301 insect illustration on p53 and p55 (archive scans `70.jpg` and `72.jpg`) is a different compositional object. The latter has multiple feather-patterned wings rather than this isolated network.

A human might look for a copied illustration whose original caption specifies a species, number, fold, or orientation. Only an **exactly attributable pre-2014 plate** plus a unique original-derived readout would justify carrying it into the unknown cipher.

## Dated candidate originals inspected

| Candidate original and date | What actually distinguishes it from p27 |
| --- | --- |
| **Bee wing**, *Chambers's Encyclopaedia* (1881), [ClipArt ETC reproduction](https://etc.usf.edu/clipart/21200/21209/bee_wing_21209.htm) | Broad forewing with the characteristic bee/hymenopteran basal cells; its internal connections and tip arrangement do not match the p27 large center-cell and clustered apical branches |
| **Wasp wing**, *Our Household Insects* (1896), figure 23, [archival scan](https://upload.wikimedia.org/wikipedia/commons/5/56/Our_household_insects_-_an_account_of_the_insect-pests_found_in_dwelling-houses_%28IA_b28050666%29.pdf) | Shows an explicit dashed fold axis across the wing, unlike p27; the top cell and right-end vein partitions have different locations; cannot attribute p27 to this particular engraving |
| **Folded queen-wasp wing**, Grant Allen, *The Strand Magazine*, volume XV (1898), illustration 12, [original article](https://www.victorianvoices.net/ARTICLES/STRAND/1898A/S1898A-Nature1-Wasps.pdf) | Illustrated with a queen and a separate small folded-wing view; the illustration and its source text describe folding and paired wings. The original p27 does not preserve the distinct folded/paired anatomy or this caption, and the candidate supplies no unique p27 key |
| **Cicadidae wing**, J. H. Comstock, *The Wings of Insects* (1918), figure 269, [historical drawing catalog](https://drawwing.org/insects/hemiptera) | Anatomically a natural comparator, but a general 1918 cicada wing diagram is insufficient as a distinct vein-by-vein match, much less as a cipher operator |
| **Cicada 3301 logo species identification**, [Cicada Mania](https://www.cicadamania.com/cicadas/category/genera/distantalna/), commentary dated 2017–2019 | Identifies *Distantalna splendida* as a possible model of the familiar **whole-cicada logo**. Attribution is tentative even there, postdates LP2 and does not independently identify this isolated p27 wing |

The earlier community [Liber Primus artwork inventory](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) only calls p27 an insect wing, “probably cicada,” without an exact source, caption, or cryptographic instruction. The separately studied Instar/wing-fold literal experiments (#189/#191) already found no source-selected decipherment; these are not repeated here.

## Decision

No inspected source has the matching interior venation plus dated original-caption provenance needed for an exact p27 attribution. Generic wasp/bee/cicada similarity supplies no source-defined transformation, page offset, key or plaintext prediction. In particular, the 1896/1898 wing-fold illustrations cannot independently rescue the rejected geometric fold candidate by thematic association.

**Close the bounded p27 source-attribution Issue #314 with no source match.** Retire the existing inspected plates and page/wing keyword routes from active cipher work. A genuinely new primary-image match with identifiable vein junctions and a historically fixed caption would reopen the source question; absent one, allocate effort to independently specified ciphertext operations rather than inventing a wing-key convention.

### Reproduction

With Pillow and the packaged 75 original scans:

```python
from io import BytesIO
from hashlib import sha256
from zipfile import ZipFile
from PIL import Image

with ZipFile("liber-primus-jpegs.zip") as archive:
    original = archive.read("liber-primus-jpegs/44.jpg")
page = Image.open(BytesIO(original)).convert("RGB")
crop = page.crop((575, 485, 1810, 910))
print(page.size, sha256(original).hexdigest())
print(crop.size, sha256(crop.tobytes()).hexdigest())
```
