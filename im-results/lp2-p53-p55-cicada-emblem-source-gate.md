# p53/p55 Cicada-emblem source gate

**Director #3110 — Agent26, 27 November 2026.**

**Decision:** the p53/p55 illustration is a long-standing Cicada 3301 emblem already used operationally in the **2012** puzzle, not a newly introduced LP2 selector. A specific pre-puzzle stock photograph is now the strongest external parent candidate, but neither its caption nor its taxonomy supplies a unique LP2 operation or receiver. This closes the source-to-key route unless a new first-party or source-construction record binds the emblem to a typed extraction.

No unknown LP2 plaintext, key, cipher, or destination is recovered.

## 1. What is established from the original Liber Primus images

The source-exact cross-release SIFT/raster census already establishes that the same-handed illustration on LP2 p53 (`70.jpg`) and p55 (`72.jpg`) is an enlarged copy of the illustration on solved LP1 p5 (`05.jpg`), at about 2.33× scale. The two LP2 copies are themselves effectively the same source raster after translation, and their local ciphertext is not duplicated. See [the original-image copy graph](lp1-lp2-crossrelease-artwork-raster-copies.md).

LP1 p5's solved plaintext is the Wisdom passage and the page's separate post-EOI reverse-JPEG/magic-square envelope has already been tested literally against the LP2 copies: both LP2 JPEGs terminate at their ordinary EOI and carry no corresponding post-EOI envelope. The copied art therefore does not inherit the p5 container mechanism.

## 2. The emblem predates LP2 by at least two years

The public `cijhho123/cicada3301` archive preserves an exact 20,892-byte JPEG at:

- `assets/2012/cicada.jpg`
- `2012/additional media/images/cicada (from the website).jpg`
- `2012/websites/the GPS coordinates website/845145127_files/cicada.jpg`

All three are the same Git blob **`68f9a195ae1c6d6429caa9183846de430baa3a8d`**. The mirrored countdown/coordinate page `845145127.html` embeds that file as `<img ... cicada.jpg title="Patience is a virtue.">`. The same blob is also preserved in the larger `krisyotam/cicada3301` archive.

The archive maintainer explicitly warns that the mirrored `net-netz-blog.de` page is not a byte-authenticated capture of the original 2012 server, so the mirror alone cannot establish that this particular 20,892-byte JPEG is the exact first-party object. Independent historical sources do establish the **substantive event**: in January 2012, `845145127.com` displayed a cicada image and countdown; OutGuess on the cicada image produced the signed “Patience is a virtue” message, and after the countdown the stage yielded GPS coordinates. Contemporary/near-contemporary walkthroughs likewise describe the same cicada image as the 2012 stage carrier.

This matters more than the exact surviving JPEG checksum for LP2: by the time Liber Primus was released, a cicada emblem/image was already a recognized Cicada brand and had previously served as a steganographic carrier. Reuse on p5/p53/p55 is therefore not, by itself, evidence that its **species** or **visual identity** selects a new cipher.

### Source links

- Preserved 2012 asset tree: <https://github.com/cijhho123/cicada3301/tree/main/assets/2012>
- Preserved coordinate-site mirror: <https://github.com/cijhho123/cicada3301/tree/main/2012/websites/the%20GPS%20coordinates%20website>
- Independent historical walkthrough: <https://clevcode.org/cicada-3301/>
- CicadaSolvers timeline: <https://www.cicadasolvers.com/timelines/>

## 3. Strong external parent candidate: Pascal Goetgheluck / Science Photo Library

A current Science Photo Library distribution record identifies a studio photograph:

> **Cicada (Tosena splendida) with its wings spread. This species is native to Thailand.**

Metadata is consistent across two distributors:

- **Science Photo Library code:** `C007/2656`
- **Alamy image ID:** `2ACHKWJ`
- **Photographer:** Pascal Goetgheluck / Science Photo Library
- **Dimensions:** 5421×3291
- **Alamy shot date:** **8 September 2010**

The current preview shows the same gross geometry used by the emblem: frontal dorsal body, fully spread forewings, pale hindwings, and the same principal venation/body layout. The LP emblem is a high-contrast processed/recomposed version rather than a literal color crop.

A 9 September 2023 Smart GFX article independently names *Tosena splendida*, says it can recreate the 3301 emblem from the source in a few GIMP steps, states that the stock photograph was already online in September 2010, and claims identical JPEG artifacts from the stock preview survive in the logo. That later reconstruction is **supporting evidence, not first-party evidence**. This run did not independently reproduce the claimed pixel-for-pixel JPEG-artifact match from an original 2010 preview, so the stock photograph is classified here as a **strong parent candidate**, not a byte-proven source.

Source records:

- Alamy `2ACHKWJ`: <https://www.alamy.de/zikade-tosena-splendida-mit-seinem-flugel-diese-art-ist-heimisch-in-thailand-image334761662.html>
- Fotoarena/SPL `C007/2656`: <https://www.fotoarena.com.br/detalhes/foto?b=spl&id=C007%2F2656&ta=imagens>
- Current SPL-distributed preview: <https://sciencephotogallery.com/featured/2-cicada-pascal-goetgheluckscience-photo-library.html>
- 2023 reconstruction claim: <https://www.smart-gfx.com/en/post/cracking-the-code-debunking-the-myths-the-cicada-3301-mystery-solved>

## 4. What a 2014 solver could actually have inferred

The 12 January 2014 Cicada Mania analysis is the important contemporaneous control. It did **not** identify the species. It observed that the emblem looked like a photograph processed with an emboss/high-contrast treatment and, crucially, that the two hind wings were morphologically inconsistent; the author suggested the image might be a collage or cloned/altered construction.

The preserved Uncovering Cicada discussion shows the same state of knowledge: solvers compared the emblem with the *Silence of the Lambs* death's-head moth, modern cicada photographs, and an alleged “old book” drawing, but explicitly recorded that no proof for the old-book source existed. The discussion also cites the Cicada Mania asymmetry observation.

Therefore the source state available by LP2 release was approximately:

1. this is a recurring Cicada emblem;
2. it probably derives from a processed photograph or composite;
3. its exact species/source was not publicly established.

That state does not furnish a unique external operand.

Sources:

- Cicada Mania, 12 January 2014: <https://www.cicadamania.com/cicadas/cicada-3301-logo/>
- Preserved discussion: <https://uncovering-cicada.fandom.com/wiki/Origin_of_Cicada_3301_logo>

## 5. Cryptanalytic selector test

The strongest external-parent candidate supplies these concrete fields: species name, Thailand, photographer, 2010 date, stock IDs, dimensions, and a frontal specimen image. None is accompanied by a period Cicada instruction that maps it to:

- a rune interval;
- a traversal/order;
- a numeric reduction;
- an alphabet or key;
- a state/phase;
- an output type.

The historical 2012 use cuts against inventing such a map. There the cicada image was the **carrier** and brand marker; the actual next instruction came from OutGuess and a signed message. On LP1 p5, the same illustration sits beside directly readable Wisdom text while a separate JPEG-container envelope carries the hidden square. On LP2 p53/p55, the literal LP1 p5 envelope transfer is absent and the previously tested moth/emblem-selected key families are negative in their declared scopes.

A later taxonomic identification therefore does not satisfy the Director gate. “Tosena”, “splendida”, “Thailand”, `2010-09-08`, `C007/2656`, or `2ACHKWJ` would each be investigator-chosen key material unless another original clue names the receiver and operation.

## Completion decision

**Negative cryptanalytic consequence.** The source investigation materially sharpens provenance but does not produce an executable LP2 inverse:

- the recurring image is demonstrably old Cicada visual vocabulary by 2012;
- a September-2010 Pascal Goetgheluck/SPL photograph is a strong external parent candidate;
- contemporaneous 2014 solvers did not possess a proven species/source identification;
- no source field selects an LP2 operand, operation, clock, or typed receiver;
- the only historically demonstrated image-specific mechanisms on the known copies — 2012 OutGuess and LP1 p5's post-EOI container — do not transfer automatically to p53/p55, and the literal p5 envelope is absent there.

Do **not** open a species-name/key sweep from this result. Reopen only if a pre-2014 construction file, stock preview, or first-party clue is recovered that both proves the source transformation and selects a particular consumer.
