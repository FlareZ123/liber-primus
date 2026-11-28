# Rune-Poem artwork ordinal navigation: p22 EAR independently points to p28 DH

**Agent37, 28 November 2026. Classification: new source-path convergence, not plaintext recovery.**

## Decision

A single human-readable navigation rule already proposed for the p14 artwork becomes materially stronger when applied to a second, independently characterized image:

> identify a visible object's Anglo-Saxon Rune-Poem stanza, then use that stanza's ordinary one-based ordinal as the ordinary one-based LP2 page ordinal.

This avoids mixing index origins: the 29th Rune-Poem stanza selects the 29th LP2 page, which the repository calls physical **p28**.

On original p22, the artwork is a pixel-certified supine corpse and the page's only adjacent equal-rune pair is **EA EA**. The final/29th Anglo-Saxon Rune-Poem stanza is **EAR**, headed by the same EA rune, and explicitly describes flesh/corpse cooling and choosing the earth/grave. The rule therefore gives:

```
p22 corpse + literal EA EA
  -> EAR
  -> 29th Rune-Poem stanza
  -> 29th LP2 page
  -> physical p28
```

This is important because p28 was selected **independently** by the existing solved-p57/FIND/terminal-23 route. Its source-visible line6 begins `DH`, contains 23 runes, and yields the already reconstructed DH23 teaching state. The p22 route therefore predicts a recipient that was discovered through a different source chain rather than by scoring p22 ciphertext.

No ciphertext receiver follows from this fact. Do **not** feed the DH tuple back into p22 or invent a Rune-Poem key merely because the navigation converges.

## Why EAR rather than a generic mortality gloss

The p22 image alone admits a weaker rival: the Rune-Poem **Mann** stanza also mentions human flesh returning to earth. The original ciphertext supplies an independent discriminator on the same page: p22 has exactly one adjacent identical-rune pair, at offsets 100–101, and it is the GP **EA** rune twice. The existing p22 source report established that this is one of only three EA-EA pairs in the unsolved corpus. EAR is the stanza whose heading rune is EA and whose verse specifically says the corpse (`hraw`) cools and chooses earth as its bed.

The fixed 29-stanza Old English source adds a lexical discriminator: splitting it at stanza boundaries, the literal word `hraw` ("corpse/body") occurs in **exactly one stanza, EAR (29)**. `flæsc` ("flesh") is weaker: it also occurs in Mann and Ac. Thus the source-specific corpse noun, the EAR heading rune, and p22's literal EA-EA doublet converge on the same stanza.

This does not turn the doubled EA into plaintext. It makes EAR a substantially more constrained interpretation of the independently visible corpse than a free synonym search.

## Same ordinal grammar already has a p14 precedent

The exact 29-stanza order equals GP29. In ordinary one-based stanza numbering:

- **Eolh-secg** is stanza 15, corresponding to GP index14.
- **Dæg** is stanza 24, corresponding to GP index23.
- **Ac** is stanza 25, corresponding to GP index24.
- **Ear** is stanza 29, corresponding to GP index28.

The prior p14 Rune-Poem report already proposed the visible plant/day-fly pair as **Eolh-secg / Dæg**, giving project labels p14 and p23. Written without origin mixing, this is simply **15th stanza -> 15th LP2 page (p14)** and **24th stanza -> 24th LP2 page (p23)**. The first component is a self-location; the second points to the opening of the p23–26 five-dot/mayfly chapter.

The present p22 result uses the **same ordinal grammar** and lands on the independently productive p28 DH page. This is a stronger held relationship than inventing a new page-number convention after seeing the p28 result.

## P32 oak checksum: AC's two GP numbers exactly equal the page length

The oak identification has a stronger numerical control than the semantic page pointer alone. In canonical GP29, **Ac is GP0 index24 and has prime weight97**. Original p32 contains exactly **121 runes**:

```
GPprime(Ac) + GP0(Ac)
= 97 + 24
= 121
= original p32 rune count.
```

Equivalently, the visible oak candidate plus the page length gives `121 - 97 = 24`, recovering Ac's own GP0 value. This is useful because **the same stock tree also appears on p55**, but p55 has 76 runes and does not satisfy the relation.

A complete p0–p55 census was run before using the relation as a selector. For every physical unknown page and every GP rune, test the fixed equality `page_rune_count = GPprime(rune) + GP0(rune)`. There are only **two** hits in all 56 pages: p14=137 matches Ear (28+109), and **p32=121 matches Ac (24+97)**.

P14 is an important negative control: its illustration is a rooted stalk plus mayfly-like insect, not a certified corpse/grave image, so the arithmetic family is not a universal artwork-label law. P32 is the sole arithmetic hit whose matched Rune-Poem name agrees directly with the independently sourced image subject, **oak -> Ac**.

The formula itself was recognized after the page length and artwork were known. It is therefore **post-discovery structural evidence**, not a calibrated probability or authenticated cipher instruction. Its value is that it resolves one repeated-art ambiguity without fitting plaintext: under this exact two-number checksum, p32 is selected and p55 is rejected.

Reproducer: `sims/lp2_rune_poem_art_ordinal_navigation_sft.cjs`.


## Mirrored-label branch: p32 Ac -> OE -> p22 Ear -> p28

The p32 tree supplies a second use of the Rune-Poem register. Original-image registration independently shows the p32 common-stock tree is **horizontally reflected**, while the p32 oak identification plus the fixed checksum above selects **Ac/A**. Apply that observed operation to the selected rune label with the independently frozen p2 glyph-reflection map:

```
p32 oak -> Ac / A (GP0 24)
horizontal reflection -> fixed glyph mirror A -> OE
OE = Rune-Poem stanza 23
23rd LP2 page -> physical p22
```

P22 is independently structured: it contains the established **horizontal mirror of solved-LP1 artwork**, a pixel-certified corpse image, and exactly one adjacent equal-rune pair, **EA EA** at offsets 100–101. The Old English source word `hraw` ("corpse/body") occurs only in **Ear**, stanza29, and the same frozen mirror map sends **EA -> EA** (self-mirror):

```
p22 corpse + EA EA -> Ear / EA
fixed glyph mirror EA -> EA
Ear = stanza 29
29th LP2 page -> physical p28
```

P28 is independently selected by the solved-p57/FIND/terminal-23 route and carries the source-reconstructed DH23 state. Thus **p32 -> p22 -> p28** reaches an independently productive recipient without scoring unknown plaintext. It complements the unmirrored **p32 -> p24** Ac-ordinal branch: the separately reported p24–p26 mayfly count triangle reproduces `[3,5,8] = [e,g,A]` from the same p28 DH state. P32 therefore has two source-derived branches converging on one DH register.

This is a **candidate intended navigation composition**, not a recovered ciphertext inverse. Its weakest premise is that the stock-image horizontal reflection was intended to operate on the semantic rune label; a historical solver would need to recognize or recover the source image orientation. The locked part is the convergence: `A -> OE` and `EA -> EA` were frozen from independent original-image glyph work, while p22/p28 properties predate this composition.

Reproducer: [`sims/lp2_p32_p22_mirrored_rune_navigation_sft.cjs`](../sims/lp2_p32_p22_mirrored_rune_navigation_sft.cjs), Windows/Node22 CI PASS [run 46124399413](https://github.com/FlareZ123/liber-primus/actions/runs/46124399413). Supporting p24–p26 convergence: [mayfly DH23 count triangle](lp2-p24-p26-mayfly-dh23-count-triangle.md).


## Authenticated-2016 carrier route: oak -> p24 -> day-fly -> p23

The 2016 signed carrier is unusually relevant because the **authenticated text and the oak image occur in the same object**. The preserved contemporary community walkthrough identifies the faint image as an oak via the exact ClipartBest stock URL; later original-pixel work verifies that the horizontally reflected stock drawing is the same source family used in the signed carrier and LP2 p32/p55. The signed text says:

`Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.`

Apply the ordinal grammar without looking at ciphertext output:

1. **Oak -> Ac.** `Ac` is the 25th Rune-Poem stanza.
2. **25th LP2 page -> p24.** The repository's p24 is the ordinary 25th page of LP2.
3. **p24 is the first page carrying the independently source-identified mayfly artwork.** The exact external plate identifies the repeated p24–26 figure as Figure4 specimen **5**, *Ephemerella ignita*.
4. **Mayfly/day-fly -> Dæg.** `Dæg` is the 24th Rune-Poem stanza.
5. **24th LP2 page -> p23.** P23 is the chapter opener immediately before the first mayfly rendering.
6. **P23 visibly carries five black dots.** That count independently agrees with the external plate's **specimen5** identifier used by the artwork on the following pages.

The last relation is source-level and does not depend on a cipher: the p23 five-dot ornament is reused on p7 and p56, so five dots alone are not a unique "five-share" instruction, but **only the p23 occurrence immediately introduces artwork independently identified as source specimen5**.

This gives a compact candidate hint loop:

```
signed-2016 oak
  -> Ac = stanza25
  -> LP2 page25 = p24
  -> source specimen5 mayfly
  -> Dæg = stanza24
  -> LP2 page24 = p23
  -> five dots = source item5
```

The tree's "oak" label is supported by the 2016-era community source attribution plus modern pixel registration, not by a recovered pre-2016 ClipartBest catalog record. The mayfly-to-Dæg step is semantic rather than an authenticated Cicada label. Therefore treat the loop as a **candidate intended navigation explanation**, not an established decryption.

## Oak and mayfly cross-checks: useful but weaker

The p32/p55/signed-2016 tree family is now tied to a common stock lineage described in the repository as a dead-oak source. Under the same Rune-Poem register, **Ac** ("oak") is stanza25, hence the 25th LP2 page = p24. Original p24 is the first page carrying the independently identified *Ephemerella ignita* mayfly plate art (the p23 chapter opener itself has the five-dot stamp).

Likewise **Dæg** ("day") is stanza24, hence the 24th LP2 page = p23, the opener of that same mayfly chapter. The mayfly/order-name "Ephemeroptera" supplies a historically ordinary "day-fly/one-day fly" semantic association, but this is less exact than the p22 corpse+EA-EA selector and should remain supporting context.

The oak label is also weaker than EAR because the exact period ClipartBest catalog record is not preserved; the common-stock image identity is strong, while its creator-era catalog wording is not.

## Strongest rival and bounded conclusion

The strongest rival is thematic over-reading: GP29 already derives from the Anglo-Saxon Futhorc, so some manuscript art can naturally resemble Rune-Poem nouns. The fixed consecutive-page-pair visual test previously failed, and none of that negative is contradicted here: this is a different grammar, using a picture's semantic stanza as a **page ordinal**, not pairing every adjacent page pair to every stanza.

The p22 route is useful because it makes a **pre-existing independent prediction**: EAR's ordinal selects p28, already selected from p57 and already carrying the DH23 construction. It does not recover unknown plaintext, and it does not authenticate the 2016 "meaning/number/direction" wording as a literal instruction to use artwork.

**Research consequence:** promote **p22 corpse + EA-EA -> EAR(29) -> 29th LP2 page p28** as a candidate human-solve navigation edge worthy of blind validation, retain **p32 oak -> Ac with 97+24=121** as the numeric cross-check selecting p32 over the repeated p55 tree, and preserve the source-composed **p32 Ac/A --horizontal mirror--> OE(23) -> p22 -> Ear(29) -> p28** branch for blind human validation. The ordinary unmirrored Ac ordinal independently enters p24–p26, whose count triangle reproduces p28 DH values [e,g,A]. Keep all failed p6/p7/p8 consumers unchanged. Do not turn these navigation edges into new cipher families without an additional first-party receiver/opcode.

## Reproducible source chain

- Anglo-Saxon Rune-Poem order and exact 29/29 GP29 match: `im-results/lp2-anglo-saxon-rune-poem-source-gate.md`; source text `resources/external/dickins1915-rune-poem-old-english.txt`. The fixed source has 29 stanza blocks; `hraw` occurs only in block29/Ear.
- P22 corpse registration, EAR semantics and literal EA-EA site: `im-results/lp2-p22-corpse-source-plate-decision.md` and `im-results/lp2-p22-ear-name-unique32-p50-row-gate.md`.
- Existing p14 semantic precedent: `im-results/lp2-old-english-rune-poem-codebook-selector.md`.
- Independent p28 selector and DH23 construction: `im-results/lp2-p57-terminal23-p28-dh-modulus-selector.md`.
- Common-stock oak/tree lineage: `im-results/lp2-tree-common-stock-source-reopening.md`.
- Exact p23–26 mayfly source family: `im-results/lp2-p23-26-original-art-source-gate.md`.
