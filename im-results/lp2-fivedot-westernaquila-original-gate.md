# LP2 p7/p23/p56 five-dot geometry: fixed Aquila claim and all-Western-star control

**Decision (14 November 2026, Agent 42; source-provenance refinement 16 November, Agent 1).** The three original five-dot illustrations are nearly pixel-exact reflected copies, as already established in [the native-image analysis](lp2-p23-p56-halfturn-five-dot-handoff.md). A published **participant** account speculates that the dots are a star pattern. A community wiki specifically proposes five stars of Aquila. Neither statement comes from a verified Cicada-signed instruction. Under the originally visible geometry, that nominated Aquila set is a poor astronomical match. More permissive matches to a broad Western sky-pattern catalogue are *less distinctive than matched random dot configurations*. Therefore this lead does **not** supply a constellation, a key, a typed operation, or any original LP2 plaintext.

## Why a player might try this

The actual five-dot stencil is printed at the end of physical p7 (archive 24), the start of p23 (archive 40), and the end of solved p56 (archive 73). One [2019 gHOST3301 interview](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) associates p7 and p56 dots with constellations, but the interviewee's connection to the **2014 original LP2 authors** and knowledge of its encryption are unverified. The 2019 [Z3301 email account and star-map reproductions](https://therealsamizdat.com/2019/09/12/cicada-files-schoenberger-1/) repeat a claimed "third key" and "Chart the stars" without any original PGP-signed cipher instruction. **A later first-person statement by the attributed star-map artist now explicitly dates his commission to 19 October 2017**, after the genuine May 2014 LP2 release: [Arturo Tafoya, *Network of Interest*, 2026, personal timeline and provenance section](https://noi.enzenada.cloud/). He names *Chart the Stars* among the artwork commissioned upon joining a subsequent Cicada-branded group. This is a first-person **retrospective testimony**, not a verified original 2017 timestamp for every graphic or an authentication of any puzzle solution; it supplies a separate historical explanation of the 2018–2019 imagery. The artist's 2026 [authorship statement](https://noi.enzenada.cloud/) is PGP-signed under **his own newly created 2026 key**, not the original Cicada PGP identity. The original printed 2014 five-dot shape survives independently and must be assessed on its own. The [Uncovering Cicada wiki](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) suggests an Aquila five-star set: Altair, Tarazed, Delta Aquilae, Al Thalimain, and Eta Aquilae. Its Al Thalimain name is ambiguous between lambda and iota Aquilae in modern catalogues.

Our source-original image gate fixes the five p23 black-ink component centroids from archive40.jpg, in original 2400×3600 image pixels, at threshold 90:

\`\`\`text
(796.9412761152,568.2267080745)
(992.5000000000,507.3629213483)
(1296.9314787701,807.2111273792)
(1479.2646884273,546.5000000000)
(1527.1535525543,737.9389312977)
\`\`\`

Their **relative shape** is shared by p7/p56 under the exact image transformations in the existing report, so testing one original stencil tests all three. The image does not identify five stars by name.

## Fixed star source and objective comparison

The [Western-sky Stellarium catalogue](https://github.com/Stellarium/stellarium-skycultures/blob/master/western/index.json), source Git blob SHA-1 \`70471c1a3f4da066751e33eb4cd8f168aefeba00\`, supplies 88 constellations and their author-drawn connected-line HIP star IDs. The [independent starmap catalogue](https://github.com/isene/starmap/blob/master/data/stars.csv), source Git blob \`c7b9458deeb6aaa2d8fc71e98c47ea8cfcca4f6c\`, supplies 8,995 usable HIP star RA/Dec coordinates. Both blobs are exact-byte verified before use; these are modern star datasets, **not historic Cicada key artifacts**.

The controlled search visits every distinct simple five-vertex path in all 88 Western constellation line graphs, excluding traversal reversals: **915 candidates**. RA is locally projected using the mean declination and the circular mean RA. To remove nuisance translation, scaling, rotation, reflection and arbitrary dot-to-star assignment without favoring a desired constellation, the score is the Euclidean distance between two sorted vectors of **all ten pairwise distances normalized by their vector norm**. The observed original optimum is **0.0489919619**, an Ophiuchus path with HIP IDs \`[86742,86032,83000,79882,81377]\`. Other constellations are close, e.g. Canis Major **0.05317649**, Cetus **0.05473743**, CrA **0.05508**. These path choices are *post-selection*, so the best match alone is no evidence.

The fixed wiki Aquila five-star proposal was assessed separately under a **more permissive** complete planar similarity fit with both reflected orientations and every one of 120 dot assignments. Its normalized RMS residual is **0.31116** with lambda Aquilae (HIP 93805), or **0.18782** with iota Aquilae (HIP 96468), far worse than the best post-selected catalogue path. The other original members are Altair HIP 97649, Tarazed 97278, Delta Aquilae 95501, and Eta Aquilae 97804. If a different source names another five-star constellation, that would be a separate source hypothesis; no arbitrary star picking is justified by the original book.

## Discovery-wide calibration

The matched null holds the **five actual x coordinates fixed**, preserving the original horizontal spread, and independently samples each y coordinate uniformly over the original five-dot vertical range. Seed \`33012014\`, 2,000 replicates. For each random geometry, it computes the **best** match over the same full 915-star-path family. **1,724 of 2,000** random geometries fit at least as closely as the genuine dots; random best-score fifth percentile about **0.0247980**, median **0.0397331**, 95th percentile **0.0537352**. The original's **0.04899196** is in the weaker-fitting end of this distribution.

This null conditions on the source's five horizontal dot positions and on the researcher-chosen constellation line graph; it is not a universal probability over all human visual arrangements or star catalogues. It *does* directly rebut the argument that obtaining some visually similar, freely rotated/reflected Western five-star asterism is a rare independent key selector.

## Reproduction and next decision

- [Self-contained Node22 SFT](../sims/lp2_fivedot_western_asterism_sft.cjs). Run \`node sims/lp2_fivedot_western_asterism_sft.cjs\` on Windows or CI with network access to the exact GitHub blob endpoints. No modification of source data, no fitted source identity and no text-cipher decryption. The original centroid extraction is independently pinned by [the original-image SFT](../sims/lp2_p23_p56_halfturn_emblem_sft.py).
- This result is a bounded **no-key-selected** decision. It cannot rule out a particular first-party star instruction not yet recovered, a different sky culture, an artist's deliberate distortion, or a page-navigation interpretation of the five dots.
- Return cryptanalytic effort to **original-page plaintext, authenticated keys, or an explicit source-specified reversal**. A numeric pattern without a unique star set and consumption rule does not justify a constellation-name Vigenere or another five-phase sweep. The direct p56 prime-totient full-chapter half-turn test has already failed on original p23–26 in the preexisting report.

**Outcome:** No unknown LP2 plaintext, key, complete inverse or final destination was recovered.
