# The blurred page-32 and outlined page-55 trees share a source silhouette

**Evidence: original-image geometric correspondence and terminal-page controls, 10–11 November 2026.** The full manuscript still has **no recovered unknown LP2 plaintext or key**. This is an image-side relationship for investigating visual continuity across sections, not a decipherment, cryptographic key, statistically pre-specified clue, or evidence of source instructions.

## Source and method

The archive's original **49.jpg (physical LP2 page 32)** shows an intentionally blurred black tree. Original **72.jpg (physical LP2 page 55)** shows a pale, finely delineated tree over a moth. The corresponding source files are [49.jpg](../resources/liber-primus/49.jpg) and [72.jpg](../resources/liber-primus/72.jpg).

The p55 tree is transformed using **only image operations**, with no ciphertext fitting: extract grayscale, threshold intensity below 240 inside x=[650,1760), y=[1410,2480), retain the largest 8-connected component and fill its single external contour. The p32 source crop is x=[650,1760), y=[2060,3130), then source darkness is `max(0,252-gray)`. Downsample both crops to 30%, apply Gaussian smoothing with sigma=6 low-resolution pixels, and optimize four affine translation/scale parameters against Pearson image correlation (fixed SciPy differential-evolution seed 13 and declared bounds). Pearson is evaluated on an interior crop excluding 20–30 edge pixels. The original p32 blurred tree therefore appears compatible with the **filled silhouette** of the p55 outlined tree under a modest position/scale adjustment.

| Measurement | Observed |
| --- | ---: |
| Unaligned source-image correlation | **0.81454** |
| Affine-aligned source-image correlation | **0.87337** |
| Same search with horizontal reflection of p55 tree | **0.71290** |
| Aligned source-image foreground intersection-over-union (p32 gray<220) | **0.69895** |
| Fitted scales x,y | **0.9561, 0.9779** |
| Fitted shifts in original pixels x,y | **+9.18, +33.83** |
| p55 thresholded outline / filled-silhouette pixel counts | **190,118 / 311,357** |

The identity correlation is already high before optimization; reflected orientation is a **descriptive negative control**, not a formal significance test against all tree art. The two images were selected by visible similarity and the crop, thresholds, fill and Gaussian comparison are analyst-selected. Accordingly, none of the numerical scores should be assigned an independent p-value or used alone to assert Cicada's cryptographic intent.

Exact scans hashed SHA-256:

- `49.jpg`: `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`
- `72.jpg`: `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`

Run [the self-contained geometry reproducer](../sims/tree_outline_blur_registration.py) with Python, NumPy, SciPy and OpenCV; it loads the original images from `resources/liber-primus/` and reports the metrics. This source comparison has been executed locally on the original attached JPEG bytes. No new CI workflow was created.

## Terminal pp53–57 pale-layer controls (Agent 27, 11 November 2026)

The new pale-layer question is narrower than the existing p32/p55 silhouette comparison. On the original scans, the coherent pale central tree is present on **p55 (scan 72) only**; p54 (scan 71) has no corresponding pale central illustration. A fixed crop x=[650,1760), y=[1410,2480) was measured identically on scans 70–74. The fixed mid-gray mask is 180 ≤ gray < 245, with 8-connected components:

| Physical page | Scan | Mid-gray pixels | Components | Largest component |
| ---: | ---: | ---: | ---: | ---: |
| 53 | 70 | 12,343 | 1,920 | 133 |
| 54 | 71 | 65 | 65 | 1 |
| 55 | 72 | 213,499 | 293 | 212,921 |
| 56 | 73 | 5,364 | 2,869 | 31 |
| 57 | 74 | 748 | 155 | 24 |

This isolates one large continuous pale drawing on p55; the matched p53/p54/p56/p57 crop controls contain only fragmented antialiasing or ordinary page ink. The separate known p57 GIMP-stipple insect control (scan 74, crop x=[350,2050), y=[1900,3450), gray < 128) contains 35,210 dark pixels in 574 components, largest 12,821. It is a high-contrast dot field, not the p55 tree's continuous mid-gray line art. The p55 tree is therefore a real illustration, not JPEG background noise or the same GIMP-stipple layer.

The already measured p32/p55 silhouette correspondence above is the only specific tree-to-tree page relation. The p55 tree is visually meaningful, but neither it nor the p53/p55 repeated moth/border motif specifies a branch traversal, root, direction, endpoint, axis-to-rune mapping, or exact rune indices. No source-selected operation follows from the pale drawing. Treat it as an illustrative cross-page motif, not an authenticated cipher key layer. Reproduction: [terminal control script](../sims/p55_pale_tree_terminal_control.py).

## Moth-art reuse control: original p53 to p55 is an unchanged copy

The original lower-page moth illustration on **physical p53 / 70.jpg** is repeated on **p55 / 72.jpg**. The source JPEGs are independently hashed before comparison. Freezing p53's large grayscale crop at x=[600,1850), y=[2720,3160) and locating it inside p55's lower-image search region yields the unique top-left match **(666,2787)**, a translation of **(+66,+67) pixels**. Normalized correlation is **0.999895215**, and the threshold-128 ink-mask intersection-over-union is **0.994094488**. The directly neighboring original p54/71.jpg without this moth scores only **0.222676590** under the identical template and search region.

Across the 550,000 aligned pixels, only **17** differ in grayscale value by more than 10. Every one is at the crop's two rightmost columns and rows y=42–50 (crop-local), where the independent p55 border ornament intrudes. Within the actual moth artwork, differences are ordinary low-amplitude JPEG quantization residual. There is **no source-visible changed moth drawing** between these two pages to support a differential-symbol decoder. This does not exclude payloads in unrelated image regions, source JPEG coefficients, or any unknown ciphertext mechanism.

The stand-alone [original-image SFT](../sims/lp2_terminal_moth_reuse_sft.py) verifies exact original JPEG SHA-256 for p53, p54 and p55, checks the frozen translation/controls, and prints all measurements. It is a bounded source negative, not a plaintext or key recovery.

## Independent historical context: the signed 2016 tree image

A [contemporaneous January 2016 thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here) explicitly compared the background **oak tree** in 2016 image `4gq25.jpg` with Liber Primus combined archive **49.jpg**. The prior public identification of that relationship must not be presented as a discovery made in this study. The [historical signed-message archive](https://github.com/scream314/cicada3301/blob/master/2016.md) independently documents `4gq25.jpg` as carrying an OutGuess-extracted and PGP-verified message including “Liber Primus is the way” and directions to treat its words, meanings and numbers as a route. The source-image comparison here adds the previously unreported **p55 detailed tree silhouette** to this visual lineage. Neither the text nor original illustration supplies a specified mathematical function mapping tree branches to rune plaintext.

**Direct signed-2016 original raster registration (Agent 43, 11 November 2026).** An independent, finite image comparison now strengthens the old 2016→p32 observation beyond eyewitness appearance. On byte-exact `resources/historical/cicada2016-4gq25.jpg`, examine the faint central tree at x=[130,525), y=[225,455); match original LP2 `49.jpg` p32 crop x=[650,1760), y=[2060,3130), and `72.jpg` p55 crop x=[650,1760), y=[1410,2480), without consulting rune ciphertext or decoded words. Source crops and grayscale responses follow the already established image-side tree locations. The **bounded** optimization uses isotropic scales 0.125–0.265 (step .005), Gaussian sigmas 1.5/3/5, translation within the signed crop, and both horizontal orientations. Signed-image tree pixels have grayscale quantiles 50th=1, 95th=5 and 99th=8; dark writing elsewhere is kept outside the main central crop. Best original-orientation Pearson correlations are **p32 0.903427**, p55 **0.732314**; corresponding reflected bests are **0.795672** and **0.573418**. Independent original-page artwork controls at the same region score **p53 moth 0.384704** and **p57 cicada 0.567360**. A planted same-source tree at scale 0.17 and offset (40,20), with Gaussian noise, is recovered at **0.999984** and exactly the injected transform. The p55 score reaches the scale-search lower boundary, so its optimum is a lower bound within this selected window, not a globally optimized fit. This establishes a strong direct, source-raster resemblance for the 2016 and p32 trees under a declared transform family, and is consistent with previously documented visual reuse. It does **not** establish an independently supplied branch path, raster codebook, threshold, rune inverse, or cryptographic key. No new plaintext results. Reproducer: [single-file image source gate](../sims/2016_tree_identity_sft.py), executed successfully in [GitHub Actions run 43030698047](https://github.com/FlareZ123/liber-primus/actions/runs/43030698047) via the existing [manual derivative workflow](../.github/workflows/dead-tree-commons-derivative-gate.yml) with `probe=signed-tree`. The separately established Commons `DeadTree.jpg` original and its derivative results remain in [the bounded source report](dead-tree-commons-derivative-gate.md); there is no basis to reopen derivative/filter sweeps.


## Kabbalah / Tree-of-Life interpretation: source gate fails

A conditional navigation result in [the 2014 Wisdom-square report](2014-magic-square-direction-map.md#two-original-lp2-cipher-triples-navigate-into-the-2013-wisdom-square) reaches the 2013/2014 square cell **CABAL** from a p55 three-word GP-prime-sum/totient/cardinal-direction construction. That makes “Cabala/Kabbalah” a plausible semantic association, especially alongside p32's 22 page-local words, page number 32, and the repeated tree motif. It does **not** establish a Hebrew or Tree-of-Life decoding rule.

The decisive visual test is absent: original p32 49.jpg is a blurred natural trunk-and-branch tree; p55 72.jpg is the matching outlined tree over a moth; the archived 2016 4gq25.jpg shows a faint leafless oak. None shows a 10-node/22-path diagram, node circles, Hebrew letter labels, or another unmistakable Kabbalah-specific structure. The 2016 signed text says LP words are a map, meanings a road, and numbers directions, but does not name Kabbalah, Hebrew, sefirot, or a 22-path ordering. The 22-word count and page number are therefore not source-selected assignments to Hebrew letters. Gematria Primus has 29 symbols, so a 22-letter correspondence would additionally need an explicit selection/omission rule that no source supplies.

**Decision:** retire the direct Kabbalah/22-Hebrew-path mapping branch. Retain CABAL as a conditional semantic destination in the Wisdom-square route, and retain the p32/p55/2016 tree images as a real visual motif, but do not conflate either with a Tree-of-Life cipher. Do not run Atbash, Albam, free Hebrew substitutions, or path re-ordering. Reopen only if a new primary clue selects the Hebrew alphabet/order or an explicit 10-node/22-path structure.


## Specific bookend-phrase OutGuess test

The original ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` is duplicated on p27 and p55. Since historical Cicada used OutGuess and these pages have source-image connections, a finite source-fixed extraction test used six literal and transliterated forms of that pair as candidate passwords across **all 58** original LP2 JPEGs: `DJUBEI`, `djubei`, `DJU-BEI`, `dju-bei`, `DJU BEI`, and `ᛞᛄᚢᛒᛖᛁ`. The existing pinned extractor passed authentic LP1 and synthetic embedded-message controls.

**Outcome:** **348** new password/image combinations produced **zero** recognizable OpenPGP, gzip, ZIP, PNG or printable-text payloads. **213** had internally consistent but unauthenticated OutGuess length/seed headers, illustrating that such headers are unreliable. These exact six passwords have no supported LP2 extraction under the tested standard OutGuess model. Reproducible [completed CI run 42801260989](https://github.com/FlareZ123/liber-primus/actions/runs/42801260989) used [branch-only key variants](https://github.com/FlareZ123/liber-primus/blob/f2a63632e90cb5b911fe21f1b169db1e68155a35/sims/outguess_lp2_keyed_probe.cjs).

## Reversible cross-page stream-key hypothesis

Because the image comparison identifies **p32 and p55 specifically**, a second test treats the original 121-rune p32 ciphertext sequence as a direct GP29 additive running key for the 76-rune p55 ciphertext, retaining p55's **19 actual word boundaries**. Decode `P_i=(C55_i ± Csource_{offset+i}) mod29` with forward/reversed key direction, both signs, and **46 source offsets**. To control the source choice, repeat the *same* 184 variants on each of the **52** eligible original pages (all sources have at least 121 runes; p55 excluded). The identical search size per source avoids favoring longer page streams. In total, **9,568** exact inversions are scored with one frozen, word-local GP-English trigram language model trained on the first 300,000 characters of `resources/control/shakespeare_first300k.txt` (55,407 original Latin word tokens, 218,800 encoded GP runes).

On original p55, the best **p32** key variant ranks **fourth out of 52 source pages**, score **−353.5903** log units (source offset 34, forward, plus sign), and begins `ASHAXNOCMNRDGFTACEYUSDUW`; it is unreadable. The best source is **p40** (−347.4802), also unreadable. The median per-source maximum score is −369.9293. Neither a key nor plaintext was recovered.

**Exact positive control:** encrypt independently sampled original-layout GP-English words with the original p32 stream at offset 17, source-forward, plus encryption sign. The same unmodified scanner ranks **p32 first** and exactly recovers the offset, direction, and inverse sign; true-plaintext trigram score **−154.9158**. This wide source-language score gap is a useful diagnostic of how far real outputs are from the genuine tested GP-English-keyed mechanism. It is *not* a significance test for every possible cipher or for non-GP language.

Run [the full original-corpus inverse with planted control](../sims/tree_linked_crosspage_pad_inverse.cjs), executed successfully in [GitHub Actions run 42803343324](https://github.com/FlareZ123/liber-primus/actions/runs/42803343324). CI reused an existing workflow with a branch-only command substitution; the verified script and all source inputs are committed on main, and no permanent new workflow was created. This source-constrained direct-key model is now closed.

## A separate moth-page and 256-byte-grid structural candidate

**Exact shared moth artwork (original pixels).** The illustrated moths on source `70.jpg` (physical LP2 p53) and `72.jpg` (p55) are the *same rendered source asset*, translated by precisely **(+66,+67) pixels** from p53 to p55. Source-registered template matching of the 1,180×580 central-moth crop (original p53 x=[615,1795), y=[2680,3260)) to its unaltered p55 image gives Pearson correlation **0.99990225**, with the best match at x=681,y=2747. Across **684,400 aligned pixels**, the mean per-channel RGB difference is **0.446585**, the maximum per-channel difference is **10**, **510,873** pixels are exactly RGB-equal and *zero* show a change greater than 10. A 12×12 deliberate source alteration triggers 144 detected high-difference pixels under the same fixed registration. See [original-image single-file reproducer](../sims/terminal_moth_artwork_identity_sft.py). These near-identical drawings are one reused graphic, not two independent icon clues or a second hidden message in changed moth line art at the tested threshold. The rest of either JPEG and coefficient-domain channels are outside this comparison. The result strengthens the independent *visual selection* of p53/p55 as a pair; it does not select the missing 256-runic key operation or override the negative direct-cipher gates below.


The final section's original images **70.jpg (LP2 p53)** and **72.jpg (LP2 p55)** share the moth and ornamental side-panel composition. Independently verified source transcription and red-ink annotations show **p53 = 128 black + 51 red GP runes**, followed (after intervening p54) by **76 runes on p55**. Thus these image-linked pages contain **128 + (51+76) = 255 GP runes**, an exactly balanced **128 + 127** split. The earlier numerical grid in the same section has **256 bytes** (`resources/liber-primus/base60-grid.json`). Exhaustively enumerating all **1,485** unordered pairs of the 55 rune-bearing unsolved physical pages, **p53 and p55 are the sole pair summing to 255**.

**Source-defined completion of the missing position (Agent 20).** The *intervening* original `71.jpg` (physical p54) has one visibly oversized illuminated **red ᚪ**, the initial rune of its nine-rune heading. In the canonical corpus this exact glyph is **p54 zero-based offset 0, GP index 24 (A)**; the original ink annotations mark p54's red interval [0,9). Selecting that single visually distinguished dropcap supplies the previously missing unit without a guessed grid cell: `128 p53 black + (51 p53 red + 1 p54 illuminated A + 76 p55 runes) = 128 + 128 = 256`. The A occupies **zero-based position 51 of the second 128-rune half**. This uses the original p53–p55 shared border/moth art and the distinctive p54 initial, rather than an arbitrary filler rune. The image-supported selection is still retrospective, and a matching count alone does not establish that the three pages form one cipher block. **Crucially, the existing 128-versus-127 source-paired negative below already tested every possible missing position, including exactly position 51.** Filling this position therefore leaves its severe half-equality and original-grid-pad contradictions intact. The prior 255-byte direct lookup exclusion likewise remains a necessary restriction on any 256-byte static-lookup hypothesis after deleting the distinguished A. This is a sharper source-defined *alignment candidate*, not an authenticated 256-rune message or key.


### Full 256-position value-based lookup gate (Agent 36, 11 November)

The source-visible terminal frame is **179 original p53 runes + p54's enlarged red A (offset 0, GP index 24) + 76 p55 runes = 256**, compared in source order with all 256 bytes of the original p49–p51 32×8 grid. This is a complementary full-frame test to the earlier p53+p55 255-rune/one-missing-cell model. The earlier 255 gate already gives the broader byte→rune exclusion; the new frame additionally tests the reverse rune→byte direction.

For each of four natural grid traversals (row-major, column-major, row-serpentine, column-serpentine), both grid directions and both rune directions, test the most general **fixed value-based lookup** in either direction: grid byte value → GP rune, or GP rune → grid byte value. For any repeated input value, every occurrence must have the same output. The exact minimum substitutions for a model are (256-\sum_x\max_y n[x,y]); this optimizes over every possible fixed lookup table, without assuming an affine, modular, injective, or language-based mapping. There are **32** models total.

**Result:** no zero-error model exists. The best byte→rune lookup still requires **90/256** substitutions (row-major and column-major tie); the row-major optimum has **161** distinct byte inputs, **95** repeated-input constraints and **69** conflicting byte classes (the column-major tie has 67 conflicting classes). The best rune→byte lookup requires **222/256** substitutions; all **29** rune input classes conflict. Deterministic positive controls with arbitrary hidden fixed maps in both directions recover **256/256** with zero contradictions.

This rejects only a **position-independent value lookup** between the printed grid values and the 256-rune terminal frame. The 90/256 byte→rune score is a full-frame cross-check, not a stronger result than the existing 255/256 omitted-cell gate; the new exclusion is the reverse rune→byte direction. It does not reject the observed 256-position framing, a position-dependent codebook, a keyed/stateful/nonlinear transform, or a different source-selected operation. No plaintext or key follows. Reproduce with [the exact original-input lookup gate](../sims/grid256_terminal_composite_lookup_gate.cjs).

### The eight leftover red title runes as a column keyword (Agent 15, 11 November)

**New source-constrained hypothesis; one finite direct negative.** The independently documented one-rune completion above leaves **eight of p54's nine red heading runes unused**. These original eight glyphs follow the enlarged A and transliterate **M NG D IA TH X I M**. They can form a *stable 8-column transposition keyword* for the original **32×8** table without guessed password material. Ascending native GP indices, preserving left-to-right order for the duplicated M, select source column order **[4,6,5,0,7,1,2,3]** (zero-based). This closes a structural loop: p53's contiguous **128 black + 51 red**, p54's enlarged **one A**, and p55's **76 runes** give exactly **256 data positions**, while the *remaining eight* red heading glyphs give a plausible eight-column key. The source linkage is retrospective, and no explicit historical instruction says to sort these runes as a column key or to combine the table as a mod29 pad.

A [single-file original-source test](../sims/terminal_red_heading_eight_column_grid_sft.cjs) uses **all original positions** with no transcription changes. It tries the printed table's original row-major read and three standard keyword column-read/untransposition conventions, with both GP29 additive directions (eight exact original inverses). The untransformed composite ciphertext IoC is **0.03431373**; the eight decoded IoCs are **[0.03425245, 0.03281250, 0.03477328, 0.03523284, 0.03541667, 0.03367034, 0.03382353, 0.03596814]**, all in the ciphertext-like band, with unreadable transliterations. Every case exactly re-encodes the 256 original source rune indices, and an independently sampled native GP-English plant exactly decodes in all four traversals. The straightforward **keyword-permuted grid as a native-GP additive pad** therefore fails; this does not exclude an image-derived key, different plaintext encoding, higher-entropy decryption or nonlinear treatment of the original 256 positions.

### Direct bytewise pad between the p50 grid and 256-rune terminal frame (Agent45, 11 November)

The source-visible terminal frame is exactly **179 p53 runes + p54's enlarged red A (GP index 24) + 76 p55 runes = 256**, matching the **256 bytes** of the p50 grid. This test keeps the original source order on both sides: p50 row-major bytes against p53→p54-A→p55 rune values. The two direct, source-native byte encodings are GP index and GP prime weight. For each, test XOR, `grid+key mod256`, `grid−key mod256`, and `key−grid mod256`—eight fixed models, with no phase, traversal, or permutation search.

| Key encoding | Operation | Printable bytes | ASCII letters | Entropy (bits/byte) | Longest printable run |
|---|---|---:|---:|---:|---:|
| GP index | XOR | 40.625% | 22.266% | 7.12852 | 5 |
| GP index | grid + key | 38.672% | 21.875% | 7.22292 | 4 |
| GP index | grid − key | 39.844% | 18.750% | 7.23009 | 5 |
| GP index | key − grid | 38.281% | 22.656% | 7.23009 | 4 |
| GP prime weight | XOR | 39.453% | 22.266% | 7.21358 | 4 |
| GP prime weight | grid + key | 32.813% | 18.359% | 7.08907 | 4 |
| GP prime weight | grid − key | 36.719% | 18.359% | 7.24881 | 4 |
| GP prime weight | key − grid | 39.453% | 19.141% | 7.24881 | 4 |

No output has a known file signature; printable runs are at most five bytes and all eight outputs are random-like. Each of the eight inverse implementations recovers an independent 256-byte native-text plant exactly. The controls validate the arithmetic, not the hypothesis.

**Decision:** retire only these eight source-order, direct bytewise XOR/additive pad consumers of the 256-frame. The equal-length frame/grid correspondence remains a structural observation, not evidence that this is the intended operation. Do not expand to arbitrary byte transforms, traversal orders, or offsets without an independent source selector. [Reproducer](../sims/grid256_terminal_bytewise_pad_sft.cjs).

### Direct classical columnar transposition of the 256-rune terminal composite (Agent 20, 11 November)

The p54 eight-rune heading key also motivates a distinct, simple operation: transpose the **256 original p53 + p54 enlarged A + p55 runes** as a 32×8 matrix. This is not the previous additive-grid-pad test. The source-fixed column order is **[4,6,5,0,7,1,2,3]**, with zero-based columns, from ascending GP ordinal of p54 local offsets 1–8; equal M runes retain their original left-to-right order. The key runes are **ᛗᛝᛞᛡᚦᛉᛁᛗ**, GP ordinals **[19,21,23,27,2,14,10,19]**. The exact composite offsets are p53 local 0–178 at composite indices 0–178, p54 local 0 (the enlarged ᚪ / A, GP index24) at composite index179, and p55 local 0–75 at composite indices 180–255.

Only the two mutually inverse classical operations were tested:

1. **Read down columns in key order:** for output position j=32k+r, take composite source position i=8r+keyOrder[k].
2. **Undo that columnar permutation:** for row-major output position j=8r+c, take composite source position i=32·keyOrder.indexOf(c)+r.

For either operation, map a composite source index i back to the original page by i<179 → p53/local i, i=179 → p54/local 0, and i≥180 → p55/local (i−180). These formulae specify the complete 256-position source-offset map without changing, dropping, or inserting any rune.

The exact GP-trigram scores (Emerson-trained model) are:

| Readout | Score (nats/rune) |
|---|---:|
| Original 256-rune composite | −11.7872901307 |
| Read down columns in key order | −11.9680599910 |
| Undo the columnar permutation | −11.8008296778 |

Neither direction improves the source; the best is still nonlinguistic. Its first 48 GP-transliterated symbols are IPDEOEOEOJTTDTHCAENUPOEJAEEOEAJTHWRNGFEAEEMEOTOIAEAYFESOEGAEUSDW (the inverse direction). The forward direction begins YOWHEIOESFJJSTOLTSJEOJOONGMIAEAHPEASCUMNOEBNGJXAEEGAEYODAEM. No spaces were inserted and no alphabet substitutions were made.

**Familywise length-matched control:** the trigram model is trained on the first 50,000 GP symbols of the repository's Emerson text. There are **843 disjoint 256-symbol control windows**, starting at 70,000 with stride 300. Each window is passed through both transposition directions and only its maximum score is retained. The familywise maxima have minimum/median/maximum **−10.6608301743 / −10.1174870093 / −9.5802091058**. All **843/843** maxima equal or exceed the best original candidate (−11.8008296778), so the plus-one upper-tail empirical p is **1.000**. This is a finite empirical language calibration, not a universal proof about every possible plaintext language.

**Positive control:** a 256-symbol native-GP sample from Gibran, positions 1024–1279, has score **−8.4176866160**. Both compositions recover it exactly: inverse(read-down(plant)) = plant and read-down(inverse(plant)) = plant. The two original transformations are exact permutations and preserve all 256 positions; this verifies the implementation, not an authentic key.

### Exact 32×8 read-down-columns output

Read each row left-to-right and concatenate the 32 rows to obtain the exact 256-rune output.

~~~text
ᚣᚩᚹᚻᛖᛁᛟᛋ
ᚠᛄᛄᛋᛏᚩᛚᛏ
ᛋᛄᛇᛄᚩᚩᛝᛗ
ᛡᛠᚻᛈᛠᛋᚳᚢ
ᛗᚾᛟᛒᛝᛄᛉᚫ
ᛖᚷᚫᚣᚩᛞᚫᛗ
ᛒᛡᛉᚱᚠᚳᛗᛇ
ᛒᛉᛚᛒᛁᚦᛁᛖ
ᚢᛟᛞᚷᛞᚢᛠᚳ
ᛋᛇᚢᚫᛟᚳᚩᛞ
ᚹᚱᚫᚻᚷᛏᚫᛋ
ᚪᚠᛝᚠᛖᛇᛠᛒ
ᛇᛉᛞᚱᛄᚷᛡᛇ
ᛇᚪᛝᛋᛁᚾᛏᛇ
ᛏᚦᛡᛇᛈᛗᚱᚹ
ᛞᚢᛗᛗᛇᛉᛖᚳ
ᛈᚷᛖᚢᛒᚣᚣᛗ
ᚠᚠᚣᛠᚷᛖᛄᛖ
ᛇᛞᛚᚦᛇᚢᛁᚷ
ᚳᛁᛇᚻᚷᚦᛗᛁ
ᚫᛁᚦᛗᚢᚣᛚᚱ
ᚾᛝᚱᚠᛏᚻᚹᚢ
ᛈᚾᚦᛠᛞᚳᛈᛋ
ᚦᚹᚢᛋᚳᚷᛋᛉ
ᛠᚢᛡᚾᚦᚱᚢᚩ
ᛄᚢᛁᛖᛟᛞᛉᛒ
ᚹᚻᚪᛡᛄᚻᚾᛒ
ᚫᚱᚳᛞᛇᛋᚦᛞ
ᚫᚾᚫᛖᛗᛖᛄᛈ
ᛖᛝᚦᚢᚱᛗᛞᛗ
ᛇᚷᛁᚪᛝᛞᚪᛉ
ᚠᛒᛈᛡᛖᛖᛟᛄ
~~~

### Exact 32×8 inverse-columnar output

Read each row left-to-right and concatenate the 32 rows to obtain the exact inverse 256-rune output.

~~~text
ᛁᛈᛞᛇᛇᛇᛄᛏ
ᛏᛞᚦᚳᚫᚾᚢᛈ
ᛟᛄᚫᛇᛠᛄᚦᚹ
ᚱᛝᚠᛖᚫᛖᛗᛇ
ᛏᚩᛡᛠᚣᚠᛖᛋ
ᛟᚷᚪᛖᚢᛋᛞᚹ
ᚩᚠᛒᛁᛗᛖᛝᛒ
ᚷᛇᚳᚷᛈᚠᛒᛇ
ᚾᛗᚢᛉᛉᚪᚷᚦ
ᚻᚳᚹᚷᛁᛝᚣᚾ
ᛞᚻᚱᛋᚢᚢᚱᚻ
ᛗᛞᛒᛖᚾᛝᛖᚷ
ᚩᚩᛠᛋᚩᛄᛁᛄ
ᚳᛏᚠᛇᛟᛇᚢᚱ
ᛞᚳᛉᚦᚾᚷᛄᛡ
ᛖᚢᛁᚦᚷᚠᚣᛞ
ᛏᚱᛗᛖᛞᛝᛡᛡ
ᚹᛈᚢᛋᚦᚱᛚᚦ
ᛉᚾᚳᚦᛡᛁᚢᚪ
ᛞᚪᛈᛟᚫᚦᛄᛁ
ᛚᛝᚻᚳᚹᛄᛟᛇ
ᚩᚫᛝᛠᛞᚢᛠᚫ
ᚫᛗᛚᛁᛟᚫᛉᛉ
ᛄᛁᛇᛗᛖᚣᚣᛚ
ᛇᚹᛗᚳᚱᛋᛇᛇ
ᚢᛋᛋᛉᛗᚠᚱᛠ
ᛒᛒᛞᛞᚾᛖᚩᛡ
ᛗᛉᛡᛄᛖᚢᛈᚪ
ᛏᛗᛈᚢᚻᛋᛋᛄ
ᛞᛋᚠᛒᚷᚫᚳᚻ
ᛗᛇᛒᛖᛒᚣᚫᚱ
ᛖᚷᚻᛁᚢᛠᛗᚦ
~~~

**Decision:** The 256-rune framing and eight-rune heading key remain source-visible structural observations, but neither standard columnar direction yields plaintext. Retire this two-direction classical transposition. Do not expand to arbitrary column orders, key shifts, byte arithmetic, extra layers, or fitted spacing without a new source instruction.

Reproduce with the committed source-only script: node sims/terminal_p54_eight_column_transposition_sft.cjs.



This exact numerical correspondence is a **source-supported structural observation**, and a natural candidate for a 256-position cipher schedule with one reserved byte. The pages, motif family, byte count and special integer 255 were all considered during exploration, so the uniqueness count is *not* an independent p-value, and a 256-byte cipher schedule remains hypothetical. The two source-fixed p54-keyed classical columnar permutations tested below also fail to recover text. The ornament and final red dot do not yet supply a defined assignment to the unused byte. In particular, a graphic motif matching across pages is not evidence of a shared cryptographic key.

**Finite direct inversion tested:** concatenate original p53 and p55 rune streams in source order, preserve their **65 original words**, and attempt `P_i = C_i ± f(grid[(offset ± i) mod256]) mod29` using all 256 phase offsets, two directions, both signs, and three source-defined byte maps (`byte%29`, `floor(29×byte/256)`, `byte%28`). This is **3,072** explicit, reversible candidate decryptions, scored using a frozen, word-local GP-English trigram reference. The best original decoded candidate scored **−1301.2461** nats and is unreadable. A GP-English source-layout synthetic plant using byte-map 2 and offset 27 recovered the original plaintext **exactly** and selected the true key with score **−484.9839**. The original direct-grid model provides no plaintext; longer stateful grid transformations, missing-symbol interpretations or unknown permutations are outside this finite negative gate.

Reproduce with [the committed CJS inverse and source-layout plant](../sims/grid255_alternating_pages_inverse.cjs), executed successfully in [GitHub Actions run 42804256508](https://github.com/FlareZ123/liber-primus/actions/runs/42804256508). The workflow invocation used an existing workflow temporarily modified on an isolated branch, leaving main's CI definitions unchanged.


### Exact unknown byte-to-rune gate for the 255/256 correspondence

A different literal reading of the source numbers is that the 256 printed bytes form a **direct lookup table for the 255 runes on p53 and p55**, with exactly one grid cell omitted. Give this hypothesis a completely unknown, arbitrary fixed function `f: {0,…,255} → {0,…,28}`; no affine, modular, additive, injectivity, secret-key or GP-English assumptions are needed. A repeated source byte must always emit the same ciphertext rune. For an alignment, collect the observed label counts `n[b,r]`; its **exact minimum number of rune substitutions** is `255 − Σ_b max_r n[b,r]`. Every byte's modal rune attains the bound independently, so this is a constructive optimum over all `29^256` possible lookup tables.

The [source-original exact gate](../sims/grid255_unknown_byte_rune_gate.cjs) covers the complete 255-rune p53-then-p55 input and all **4,096** explicitly specified alignments: four natural 32×8 grid traversals (row-major, column-major, alternating row direction, alternating column direction), both grid-reading directions, both rune-reading directions and each of 256 possible omitted grid cells. The **best of every model needs 83 changes among 255 runes**, at column-serpentine, forward grid direction, reverse rune direction and gap 241. This best alignment contains **161 distinct source byte values**, yielding **94 constraints beyond one occurrence per distinct byte**, and **60 byte classes contain conflicting ciphertext glyphs**. The best direct row-major alignment still needs 85 changes. The result is an exact finite contradiction for all fixed lookup maps in the stated alignments, unaffected by an arbitrary secret relabeling of the 29 runes.

A deterministic control first generates a secret 256-entry byte-to-rune lookup, follows the true column-serpentine/reversed table traversal and omits cell 73. Without access to that lookup, the same original-source minimizer finds **zero contradictions** and reproduces every one of **255/255** planted glyphs. That is a recovery-power check for a genuine direct table, and does not authenticate the table interpretation on LP2.

**Natural 256-to-255 successor-step alternative:** One could instead read the 256 printed grid bytes as **255 successive edges**, avoiding an omitted table cell. Use each adjacent byte pair to form either its difference modulo 29, its sum modulo 29, or its bitwise XOR reduced modulo 29. Permit any hidden fixed mapping from the resulting 29 symbols to the 29 printed runes, all four row/column/serpentine traversals, and both grid and glyph directions (**48 models**). The [same exact gate](../sims/grid255_unknown_byte_rune_gate.cjs) maximizes matches per step-symbol class without knowing that mapping. The most favorable original source is column-major successive difference: at most **58/255** emitted runes are consistent with any fixed map, requiring **197 changes**. The planted unknown lookup applied to the real original grid-difference stream reproduces **255/255** output glyphs and reaches zero contradictory positions. This excludes an otherwise natural exact length-matched **static successive-grid-code** hypothesis; the result does not restrict an independently varying or keyed nonlinear state.

**Multiple-alignment null:** Under 500 seeded shuffles that preserve exactly the original 255-rune histogram, reselect the best of all 4,096 lookup alignments for each shuffled sequence. The minimum-edit null mean is **84.56**, and **110/500** matched shuffles reach **83 or fewer** required changes (add-one lower tail **111/501 ≈ 0.22156**, minimum 78). This refitted source-matched control confirms that even the best original alignment supplies no unusual partial byte-to-rune association. The same [reproducer](../sims/grid255_unknown_byte_rune_gate.cjs) carries the fixed seed `0x533055`, exact shuffler, full-model refit and control assertion. This is a conditional check on a visually motivated, postselected hypothesis, and no discovery-wide p-value is implied.

The direct-table gate is separate from the **two half-message** tests below: those ask whether a 128-symbol latent text is redundantly enciphered across the p53-black and p53-red-plus-p55 halves. The new gate instead asks whether each printed grid byte has a fixed rune output. It closes a source-linked static byte-code interpretation. A stream cipher, position-specific lookup, variable substitution epochs, or other recoverable evolving state remains outside the result.

### Source-fixed parallel-message gate for the 128/127 split

One interpretation of the original **128 black + (51 red + 76 final) = 255** rune structure is a *repeated 128-rune plaintext*: the 128 black p53 symbols and the 127 red-p53-plus-p55 symbols encode the same 128 latent positions, with one position omitted on the second side. Assign the first and second 128 bytes of the printed 256-byte table as independent modulo-29 additive masks, respectively. Exhaust both additive signs, both directions for the 127-rune half, all 128 possible gap positions, whether the table clock skips across the gap, and the three source-bound byte maps (`byte%29`, `floor(29*byte/256)`, `byte%28`). This **6,144-model** family uses the grid in printed order without an analyst-fitted phase rotation. A correct instance must recover **127/127 equal underlying runes** on the original source.

**Observed:** the largest equality count is only **10/127**, so **117/127 plaintext coordinates mismatch** even under the fitted missing-cell interpretation. In 1,000 deterministic segment-preserving null shuffles (51 red and 76 p55 symbols permuted separately), the maximum-equality median is **11/127** and **923/1,000** controls match or exceed the original (add-one 924/1001≈0.9231). This is a finite family exclusion; the null is descriptive and the original section was postselected. An independently generated 128-rune plaintext planted under a true one-missing-cell model returns **127/127** matching coordinates, recovers all **128** source runes, and **exactly re-encrypts all 255** synthetic ciphertext runes. The wrong reversed grid yields only 10/127 for that positive. Source arrays, exact inversion, planted control and fixed-seed shuffles are in [`sims/grid255_paired_shared_plaintext.cjs`](../sims/grid255_paired_shared_plaintext.cjs).

**Stronger, key-independent exclusion from the same fixed 128/127 alignment.** Suppose each half is an *arbitrary unknown bijective substitution* of the same underlying 128-rune text, with a key that is constant globally or independently rekeyed for each physical column of the 8-column original grid. Paired positions within a given key epoch must preserve their equality relation, regardless of unknown alphabet labels. Enumerate the same 128 missing positions and two B reading directions. For each candidate, an **exact maximum-weight bipartite matching** between the observed rune labels finds the largest subset compatible with *some* bijection; its complement is the smallest number of original paired positions that must be changed or discarded.

| Independent substitution epochs, keyed by aligned position mod period | Maximum compatible paired positions (of 127) | Minimum required changed/dropped paired positions |
| --- | ---: | ---: |
| One bookend-wide bijection (period 1) | 37 | **90** |
| Period 2 | 54 | **73** |
| Period 4 | 72 | **55** |
| Eight printed columns (period 8) | 89 | **38** |
| Period 16 | 108 | **19** |

The strongest live source-defined column case has its optimum at reverse B order and a missing symbol at index 67, yet still requires abandoning **38/127 (29.9%)** pairings beyond the supposed single missing location. Key-independent pairwise equality also gives **534 mismatched comparisons out of 8,001** globally in the most favorable alignment and **65 mismatched comparisons out of 945** within the eight columns in their own best alignment. Constructive control ciphertext with independently sampled fixed per-column 29-rune permutations and one true missing position yields an **exact zero-edit** result, and a global-permutation plant likewise yields zero under period 1. The [same reproducible program](../sims/grid255_paired_shared_plaintext.cjs) computes both the additive and unrestricted-bijection gates.

These exact original-input bounds rule out a *single common 128-rune latent message* under either direct printed-grid masking or arbitrary fixed global/column substitution, given source-ordered pairing and one missing B coordinate. Separate messages, position-dependent keys inside columns, transformations changing symbol order and independently determined alternative traversals remain unresolved. The separate **direct 256-byte-to-255-rune lookup** is additionally excluded under four natural grid traversals and one missing byte, even allowing an arbitrary secret lookup table.

### The three numeric-page frames supply 128 two-byte pairs (Agent 15, 11 November)

**Exact source counts; a new page-frame hypothesis, with a bounded negative original-input inverse.** The printed 256-byte table is distributed over **three original numeral pages**, in source order: p49 has **80 bytes = 40 two-byte units**, p50 has **104 = 52 two-byte units** (exactly **13 rows × 8 columns**), and p51 has **72 = 36 two-byte units**. All three counts are even. The visually selected terminal p53–p55 subsequences independently have:

| Original terminal source | Rune count | Candidate numeric-page counterpart |
| --- | ---: | --- |
| p53 black runes | **128** | The total **128** consecutive two-byte units |
| p53 red 51 runes + p54's enlarged red A | **52** | All **52** byte pairs on middle numeric p50 |
| p55 final tree-page runes | **76** | The **40 + 36** byte pairs on the two outside numeric pages |
| p54 remaining eight red heading runes | **8** | Potential fixed keyword for the table's eight columns (separate source candidate above) |

This is a source-observable **2-byte-per-GP-symbol framing candidate** that uses *both* the independently recognized eight-column colored-key hypothesis and the original numeral-page boundaries. All positions are original row-major tokens; no new filler or omitted cipher rune is necessary. It is more specific than the earlier 255/256 count fit, but its **page-pair interpretation was noticed retrospectively**. The source does not instruct solvers to use two raw table bytes as one rune state or to pair the p53 black and colored streams. Numeric-page lengths may reflect page layout, so this exact alignment by itself cannot establish a creator-intended cipher.

A finite direct inverse from the proposed grouping uses each 128-rune black p53 symbol, the 128-rune red+enlarged-A+p55 counterpart, and the corresponding original numeric table *byte pair*: \(\displaystyle P_i=(B_i\pm A_i\pm T_{2i}\pm T_{2i+1})\bmod29\). Two source-motivated serialization orders are specified before scoring: the original printed p49/p50/p51 order, and **center-first p50/p49/p51**, aligning the 52 middle-page byte pairs with the 52 red/enlarged units. All **16** sign/layout cases are reversible and include the full original source. Their GP29 index-of-coincidence range is **0.03198819–0.03912402**. They produce no readable original prose. A frozen Gibran native GP-English control supplies 489 nonoverlapping 128-symbol windows, with **minimum IoC 0.04982776**, and every one of the sixteen deliberately constructed positive controls recovers its planted 128-symbol plaintext exactly. This finite family therefore fails a natural-language criterion on the unknown original data; it does **not** reject a source-specified nonlinear 2-byte state or an alternative language.

The [reproducer](../sims/terminal_p50_two_byte_page_frame_sft.cjs) asserts the 40/52/36 numeric frames, 128/52/76 colored-page frames, original red thirteen-dot placements, all sixteen reversible source models, and independent GP-English native controls. This result is retained here as a **provisional operator-level structural clue** with an explicit failed direct reading, not an LP2 key or decrypted passage.

## Cryptanalytic meaning and next gate

The source evidence links the tree terminating the p27–32 wing-and-tree sequence to the final unsolved p55 tree and additionally permits an exact, provisional **128 numeric-pairs versus 128 black/128 colored terminal-rune** page framing. The newly tested direct two-byte GP29 additive interpretations remain ciphertext-like. The adjacent repeated ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` occurs on p27 and again as the final unsolved pair on p55; this independent observed recurrence is documented in [the existing bookend-phrase study](lp2-repeated-wordpair-structure.md). It could motivate a constrained test of a deliberate chapter bookend, but the previously measured physical-page-preserving recurrence null has p≈0.025. The visual and textual observations are both postselected and must not be treated as mutually independent confirmations.

The p53–p57 control confirms that the p55 pale tree is a real, unique low-contrast illustration, not the p57 GIMP-stipple field or JPEG background noise; the existing p32↔p55 silhouette match remains a visual correspondence only. A useful next step would need an **exact source-derived rule**: for example a specific branch traversal that emits a 29-symbol permutation or a key, predicts a previously unfitted LP2 interval, and re-encrypts it. Neither the blurred image nor the outlined tree currently supplies such a rule. No symbolic branch reading or arbitrary shape interpretation is promoted here.
