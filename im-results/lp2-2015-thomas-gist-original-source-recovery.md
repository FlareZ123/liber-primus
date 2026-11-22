# Recovered original 2015 thomasandfriends Gist: page-count inventory, no decoder

**Decision (15 November 2026, Agent 5; Director Issue #1126): ORIGINAL SOURCE RECOVERED AND CLASSIFIED.** The Gist originally cited in the 10 January 2015 Freenode #cicadasolvers conversation is accessible to a native Windows GitHub Actions runner. It contains exactly 58 lines of physical-page rune counts, and **no code, key, sample plaintext, decipherment instruction or destination**. The earlier “unretrievable” classification has been superseded. This closes one historically specific missing-source branch without recovering unknown LP2 plaintext.

## Original period-linked evidence and retrieval

- **2015-01-10 IRC L63659**, speaker `thomasandfriend2`, linked `https://gist.github.com/thomasandfriends/07b0d26589b807c1daa3`. The original IRC source and full archive controls are indexed in [the four-handle audit](lp2-2015-2016-irc-versioned-solver-revisions-source-gate.md).
- GitHub's exact [Gist API object](https://api.github.com/gists/07b0d26589b807c1daa3) returned HTTP **200** on **2026-11-15**, with **one file**, `gistfile1.txt`, and one revision `8941935303bd1236240b14274ec2f658a3859281`, created/committed **2015-01-09T23:59:21Z**. The [original immutable revision](https://gist.github.com/thomasandfriends/07b0d26589b807c1daa3/8941935303bd1236240b14274ec2f658a3859281) is available through native Git and the API. Git `ls-remote` independently confirmed the same SHA as HEAD/master.
- The **exact original 446-byte UTF-8 file** is preserved unchanged at [`resources/historical/2015-thomasandfriends-07b0d26589b807c1daa3.txt`](../resources/historical/2015-thomasandfriends-07b0d26589b807c1daa3.txt). SHA-256 **`6cd90ba33bd0fe684ef19bd526b9392d39c21ed77dac05a4f768ef41da2232b4`**. Original response JSON was additionally preserved as [GitHub Actions artifact 14169253096](https://github.com/FlareZ123/liber-primus/actions/runs/43733125536/artifacts/14169253096).
- The reproducible [Windows Node22 original-source SFT](../sims/lp2_2015_thomas_original_gist_source_sft.cjs) queried the exact Gist API, revisions, canonical/raw URLs and git object alongside a separately accessible original-`huw` Gist positive control. [Successful 2026-11-15 GitHub Actions run 43733125536](https://github.com/FlareZ123/liber-primus/actions/runs/43733125536) records all HTTP statuses and hashes. This resolves prior web-search/GitHub-connector restrictions without inventing source material.

## Independent original page-count comparison

The sole Gist file has the form `0: 208` through `57: 95`: 58 decimal page-number/count lines, no headers and no additional code. Comparing **all 58** values with each `pages[n].indices.length` in the corrected [LP2 source corpus](../resources/liber-primus/lp2-corpus.json) yields exactly **49 agreeing pages and nine disagreements**:

| LP2 page | Original 2015 Gist | Corrected source corpus | Gist − corrected |
| --- | ---: | ---: | ---: |
| 0 | 208 | 262 | −54 |
| 3 | 212 | 217 | −5 |
| 6 | 195 | 196 | −1 |
| 7 | 211 | 208 | +3 |
| 15 | 161 | 159 | +2 |
| 19 | 269 | 271 | −2 |
| 26 | 264 | 265 | −1 |
| 38 | 229 | 228 | +1 |
| 39 | 239 | 240 | −1 |

The historical counts total **13,078**; corrected original image-derived counts total **13,136**, a difference of −58. Both inventories agree exactly that p50 has **zero** runes, p55 has **76**, solved p56 **85**, and clear p57 **95**. The mismatches have the signature of contemporary transcription/counting errors; the source does not describe why they occurred, so any specific mechanism for their origin would be conjecture.

## Result and completion

The exact object is a **2015 participant-created derived inventory** and must remain distinct from the 2014 image bytes. It is reproducible, genuinely contemporary and useful for evaluating inherited numerical-length assertions. It is **not a candidate cipher key**: 58 count values follow the 58 physical pages and contain no output text or inverse. There are no 100-rune unknown-page readouts or source-selected decryption operands on which to run the Issue's blind test, so its positive cryptanalytic criterion is inapplicable.

**Decision:** retire this Gist-as-missing-key route. Avoid re-running exact-ID web searches or speculative pad variants using its page counts; those numbers are derivative of the manuscript, with nine known errors. This does not affect other historically missing sources or the current unsolved state.
