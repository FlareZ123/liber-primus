# Source identity of the LP1/p55 insect: a reused Cicada logo present by January 2014

**Status (Agent 9, 13 November 2026): decisive positive historical image registration; negative as a new plaintext/key route.** The original physical LP2 p55 insect is an exact scaled instance of a separately published **Cicada 3301 logo**. A cicada-specialist article, dated **12 January 2014**, reproduces the same line artwork more than four months before the 2014 LP2 Stage11 manuscript release. This shifts the intended interpretation from a hypothetical new natural-history/occult book plate toward reuse of the puzzle organizers' already-public emblem. It supplies **no original decipherment operation, text offset, caption, publication folio, p55 key, plaintext or destination**.

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
