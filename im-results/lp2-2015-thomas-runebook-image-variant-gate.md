# January 2015 historical LP2 JPEG mirror: original-cipher revision gate

## Decision and limitation (18 November 2026)

**No creator-relevant changed ciphertext was found in this complete, date-pinned 58-page public mirror.** The first (9 January 2015) commit of [thomasandfriends/Cicada3301Runes](https://github.com/thomasandfriends/Cicada3301Runes/tree/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/pics/runebook) preserves 58 named `pics/runebook/01_-_*.jpg` to `58_-_*.jpg` files. The 2014 contemporaneous [micheloosterhof Stage11](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion) already supplies 58 byte-identical canonical pages, and need not be recomputed. Against the original repository `resources/liber-primus/17.jpg`…`74.jpg`, the complete 2015 mirror contains:

| Relationship to 2014 canonical JPEG | Count | Finding |
|---|---:|---|
| Entire byte-identical JPEG | 0 | Every 2015 file differs in Git blob ID |
| Exact canonical JPEG after omitting its 18-byte initial JFIF APP0 segment | **35** | Identical remaining JPEG bytes, hence identical coded image |
| Different JPEG bytes and decoded RGB | **23** | All dimensions 2400×3600×3; changes uniformly small |
| Strong per-pixel RGB difference (max channel delta ≥24) | **0 of 23** | No large contrast edit found at any pixel |

The 23 JPEGs with RGB differences are physical pages **33–38, 41–42, 45–48, 58–65, 67–69** (2015 mirror image numbers 17–22, 25–26, 29–32, 42–49, 51–53). Their changed-pixel fractions are **4.8673%–8.4206%**, mean absolute per-channel differences **0.121176–0.200166** on an 8-bit scale, and maximum absolute difference **19** (on multiple pages; others 16–18). Across **all 23 pages, no pixel has a channel change ≥24**. The near-identity is consistent with re-encoding/color-conversion rather than an independently published changed stroke, label, rune, page order or inserted high-contrast annotation. This threshold comparison cannot absolutely exclude a deliberately extremely faint change whose RGB delta stays below 24. It rules out a substantial altered ink layer in this examined cohort.

## Source identification and reproducibility

- Historical repository: [thomasandfriends/Cicada3301Runes](https://github.com/thomasandfriends/Cicada3301Runes); earliest and only listed commit [`52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35`](https://github.com/thomasandfriends/Cicada3301Runes/commit/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35), Git committer timestamp **2015-01-09T23:39:25Z**, message “Initial commit.”
- Original candidate files pinned by **Git tree object SHA-1**, checked for each exact HTTP-downloaded blob. Archive image 1 maps to canonical image 17; image 58 maps to canonical 74, without dropped entries.
- Original input: local canonical `resources/liber-primus/{17..74}.jpg` with source-dated canonical images already matched byte-exact to the May 2014 Stage11 participant archive ([original distribution source study](lp2-2014-original-distribution-carrier-gate.md)).
- Original-sized files are compared first by Git SHA-1 on their exact byte payload. The 18-byte `FFE0 0010 JFIF...` APP0 segment after SOI is removed **only** from canonical JPEGs as an exact bytes-test. The remaining images are decoded to full raw **sRGB 2400×3600×3** using `sharp@0.35.5`, never resized or aligned, with pixelwise channel deltas computed and complete SHA-256 RGB digests recorded.
- Reproducer: [`sims/lp2_2015_thomas_runebook_pixels_sft.cjs`](../sims/lp2_2015_thomas_runebook_pixels_sft.cjs). Manual **Windows Node 22 PASS** with all 58 `PAGE` JSON records and the final summary: [GitHub Actions 44345565008](https://github.com/FlareZ123/liber-primus/actions/runs/44345565008), job `134946896541`.

The script prints exact Git object IDs, source paths, original/alternative sizes, and per-page RGB SHA-256 hashes, including 16-bin maximum-channel-difference histograms for all 23 nonidentical decoded pages. The entire finite capture has **35 APP0-only**, **23 low-amplitude RGB differences**, **zero new cipher operand**, and **zero plaintext**. The high-contrast signal does not justify a second image-specific crypto key search.

## What this does and does not close

This closes the source-variant question **for the dated May 2014 canonical Stage11 and the complete January 2015 thomasandfriends runebook cohort**. It does not prove that no unindexed private cache, alternative onion serving epoch or creator-produced revision ever existed. Reopen only upon an independently dated byte-preserving copy whose decoded ink differs materially, or a first-party record showing that a revised rune/image layer was deliberately distributed. The much smaller same-page image-processing differences in the 2015 repo should not be promoted into a secret instruction.

The overall Liber Primus state is unchanged: all **56 unresolved LP2 pages** remain undeciphered; no authentic unknown-page key or destination was identified by this comparison.