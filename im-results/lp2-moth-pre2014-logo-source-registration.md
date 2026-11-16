# Source identity of the LP1/LP2 insect: reused Cicada emblem from the 2012 campaign

**Status (Agent 9, 13 November; 2012 campaign extension by Agent 2, 16 November 2026): decisive positive historical image registration; negative as an LP2 plaintext/key route.** Original LP2 p55 contains a scaled copy of the recognizable **Cicada 3301 emblem**. The independently pixel-registered 12 January 2014 cicada-specialist article fixes its public existence before LP2. An additional preserved 2012-campaign site image, tied to the authentic 2012 prime-domain/coordinates step, now places the same emblem in the original puzzle trajectory. This shifts interpretation from a putative new entomological or occult plate to repeated Cicada branding. No source-visible label or operation selects p55 ciphertext ordering, key, plaintext, or destination.

## Earlier 2012 Cicada campaign use (16 November 2026)

The original 2012 prime-domain step computed `509 × 503 × 3301 = 845145127` and sent players to `845145127.com`, where the emblem headed the coordinates prompt **“Find our symbol at the location nearest you”**. The archived page directly references `845145127_files/cicada.jpg` (HTML image title **“Patience is a virtue.”**). A pinned community repository preserves that **20,892-byte JPEG** as both [`assets/2012/cicada.jpg`](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/assets/2012/cicada.jpg) and [the page-relative image](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2012/websites/the%20GPS%20coordinates%20website/845145127_files/cicada.jpg), **Git blob `68f9a195ae1c6d6429caa9183846de430baa3a8d`**. Its visible contour, asymmetric two-part wings, central head/body, and downward stroke match the Jan 2014 independently registered emblem and the LP2 p55 figure. This is an earlier **campaign-use witness**, though the preserved web-page wrapper is a 2015 local-save/Wayback copy; it is not a claim of a surviving 2012 HTTP response.

That same preserved 2012 JPEG has a **1,221-byte PGP clear-signed OutGuess extraction**, [`assets/2012/cicada.jpg.out`](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/assets/2012/cicada.jpg.out), containing **12 coordinates and 3301**. The rendered coordinate page lists **14**; the signed content omits two of them. These are already inventoried, signature-controlled 2012 facts in [the cross-round route](../workplace/2012-845145127-lp2-cross-round-route.md) and [source inventory](../resources/external/2012-845145127/README.md). The signed output directs 2012 geographical retrieval. It does not mention Liber Primus, a 76-rune order, or the reuse of this graphic as a cipher key.

Consequently, the best starting image for an *author-era visual* comparison is the 2012 site's existing Cicada emblem. The archival file is a particularly strong potential **negative control** for hypothesized LP2-only additions. The already registered Jan 2014 emblem and p53 native-page identity test cover broad contours and added black strokes respectively. Further natural-history plate searches should require an independent distinguishing clue; the identity of the animal and old scientific figures alone do not supply the missing LP2 decoder.

## Exact dated source, independent of the manuscript

[Cicada Mania, *Cicada 3301 Logo*, 12 January 2014](https://www.cicadamania.com/cicadas/cicada-3301-logo/) displays a 640×389 white-background logo:
[linked original source image](https://www.cicadamania.com/cicadas/wp-content/uploads/2014/01/Cicada_3301_logo1.jpg).
The author explicitly calls it the **3301 logo**, speculates that it was processed by an emboss-like filter, and notes that its left/right hind-wing veins may have been collaged from different sources. The article has an undated subsequent **UPDATE** identifying the pictured insect as *Distantalna splendida*. The date of that update is unknown, and the species identification does not independently date or identify an underlying photograph or natural-history plate. No article text supplies a cipher key or GP29 readout rule.

A separate [Know Your Meme historical entry](https://knowyourmeme.com/memes/events/cicada-3301), first **added 7 January 2014**, independently depicts the recognizable contemporaneous Cicada emblem, but its currently served image may have been updated, so the dated Cicada Mania image is the exact programmatic witness.

The LP2 original p55 is `resources/liber-primus/72.jpg` (2400×3600), SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`. The linked January 2014 source JPEG is **640×389**, SHA-256 **`0a7fb4199ae595802bfd45893107c0122d2d6b662a11cb908f64c19391224829`**, independently downloaded and decoded during a manual Windows CI test. No external JPEG is copied into `resources/` to avoid redistributing uncertain-rights artwork. The source URL, historical date, file hash, comparison script and exact original target are sufficient to reproduce the finding.

## Frozen pixel-registration test

The original LP2 p55 source crop is fixed in source coordinates to `x=650..1849, y=2600..3299` (1200×700), covering its central moth/cicada illustration. Standard OpenCV SIFT (4,000 features, contrast .006), Lowe ratio0.75 and RANSAC similarity-fit tolerance6 pixels register the 2014 logo to the original LP2 image **without using rune text as a fitting target**.

| Diagnostic | January 2014 logo → exact p55 | Wrong-source photographic wing → p55 |
| --- | ---: | ---: |
| Source keypoints | 1,129 | 2,097 |
| Ratio-accepted matches | **580** | 23 |
| RANSAC affine inliers | **561** | 2 |
| Warped-source 7-pixel-tolerance precision | **0.99445527** | 0.17088957 |
| Target-ink 7-pixel-tolerance recall | **0.99365015** | 0.08302829 |
| Fuzzy F1 | **0.99405255** | 0.11175794 |

The fitted transform from 640×389 original web logo to the manuscript's cropped original pixels is approximately uniform **1.838737× scale** and translation `(+36.215, −14.613)`, with an image-axis rotation only ≈0.035°. The wrong-source control is the **other insect-wing photograph attached to the very same January 2014 article**, URL `https://www.cicadamania.com/cicadas/wp-content/uploads/2014/01/cicadawings.jpg`, SHA-256 `b9af8667a7986144cb87f2cca4683d502fc1525e5a2fc12914a79e34ee497b9b`. Its almost absent geometric consensus and poor registered ink overlap exclude a trivial any-insect-photo match. The exact composition includes distinctive asymmetric hind-wings, a curled left-wing lower patch, centrally segmented body and a long downstroke. Both positive and wrong-source images were downloaded from their real dated article location.

This is extremely strong **graphic reuse**, regardless of whether the 2014 article itself obtained the logo from a 2012/2013 Cicada site, another participant, or a third-party mirror. The original artist and ultimate photographic source remain unknown; a dated logo witness is not proof of an earlier independent published scientific plate.

The [fully reproducible manual Windows CI test, run 43429790855](https://github.com/FlareZ123/liber-primus/actions/runs/43429790855) saved its JSON metrics in artifact `lp2-moth-jan2014-logo-registration`. Reproducer: [`sims/lp2_moth_pre2014_logo_registration_sft.py`](../sims/lp2_moth_pre2014_logo_registration_sft.py); [workflow](../.github/workflows/lp2-moth-pre2014-logo.yml). The fixed p55 input, original JPEG checksum, image URLs, source hashes and measured matrix make the claim falsifiable.

## Consequence for decipherment

This exact external source **explains why the same cicada/moth icon appears in original solved LP1 p5 and unknown LP2 p53/p55**, without requiring a 2014 author to have selected a text from a particular entomology book or occult print edition. Repetition of the emblem is consistent with **author branding**. Existing #729 seven-word LP1 p5 phrase-length fit to terminal p55 remains a retrospective, unproved crib; the image registration gives it no new textual authority. Its already-failed Hill, substitution and period25 controls should not be rerun.

The 2014 article's title, **Cicada 3301 Logo**, repeats already-known author identity and number. It provides neither a new publication-specific caption/folio nor an authenticated author-defined mapping of the logo to any segment of p55 ciphertext. Its tentative taxonomy could generate countless arbitrary book or species-word keys and thus fails the source-selector criterion. No reversible key/state for the 75-runic p55 body and incoming p54 NG carry is selected, so the last30 prospective plaintext gate cannot be run without free fitting.

**Decision for Director #757:** an **exact pre-LP2 graphic antecedent was found** and independently proved in original pixels. Retire an invented independent natural-history/occult **plate-caption key route** until a genuinely earlier *specific image source with an authenticated coding instruction* is recovered. Preserve the logo identity as a strong source-context result. Do not claim manuscript decryption, cryptographic key, text crib or puzzle destination.
