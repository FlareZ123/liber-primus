# Page-indexed center/word transform: p3 BLUR points toward p28 READOUT and the p9 tree

**Agent8, 19 November 2026. Classification: exploratory navigation hypothesis, not authenticated plaintext or a recovered cipher for p9.**

## Source-constrained operation

The p33 H-rectangle bridge supplies the ordered GP29 power pair (3,27). The p28 READOUT work already applies that pair to a unique page geometry: the unique center rune, followed by the page-numbered word, with p28's 28th word beginning immediately after its center rune.

I tested the fixed extension across pages p1–55: for each odd-length page with a p-th printed word, transform the unique center rune by (x^3\bmod29), then transform the p-th word in order by (x^{27}\bmod29). This gives 30 eligible page outputs. The parser follows the p28 reproducer exactly: only hyphen and period delimit words; slash/newline, ampersand and dollar markers do not.

Two outputs stand out:

| Page | Center offset | p-th word start | Output | GP0 sum | p50 low digit |
|---:|---:|---:|---|---:|---:|
| 3 | 108 | 13 | **BLUR** | 42 | 28 |
| 28 | 134 | 135 | **READOUT** | 75 | 57 |

p28 is the only center-adjacent case in this 30-page odd-center family. p3 is not adjacent: its third word begins at rune offset13, far from the center. Nevertheless, BLUR is the **only exact dictionary-word output** among all 30 candidates against the repository's 29,779-entry TextBlob word list. READOUT is the already-known p28 positive, independently split as READ / OUT by the p39 selector [55,20].

The numeric links use the existing p50 low-digit map (T(x)=\text{grid.bytes}[x]\bmod60):

- p3 BLUR has GP0 42, and (T(42)=28), landing on p28.
- p28 READOUT has GP0 75, and (T(75)=57).
- The p50 orbit from 57 is (57\to58\to26\to53\to51\to59\to9).
- The p28 READ / OUT split follows the already reported (55\to20\to42\to28) route.

This suggests a candidate human route **p3 BLUR → p28 READOUT → p57 → p9**. The p57 solved-page wording “FIND THE DIVINITY WITHIN” makes the p9 page's large tree illustration an attractive visual target. This is not independent authentication of repeated low-digit iteration: the p50 output type remains conditional, and the p3 lexical hit is a post-discovery family scan. In particular, p21's unrelated-looking output also has GP0 42, so the numeric pointer alone does not authenticate BLUR.

## p9 visual follow-up and limits

The p9 original scan is [26.jpg](../resources/liber-primus/26.jpg). Its page has 268 runes, 57 printed words, and a tall tree drawing beside the text. The p9 center is a pair (F,M); applying the same center-pair / word9 extension gives **FSIA**, not plaintext. Thus the page-indexed rule does not itself decrypt p9.

A quick image test applied Gaussian blur radii 3 and 27 to the tree crop; neither visibly revealed lettering. A naive blur-3/Otsu skeleton count initially gave 54 endpoints, apparently matching the ROAD/PATHS state, but that count included small text fragments at the crop edge. Isolating the tree column instead gives 48 endpoints and 34 branch-pixel clusters; the endpoint count also varies with threshold and crop boundary. **Retire the apparent 54-endpoint match** rather than treating it as a key.

A targeted JSteg-style AC-coefficient-LSB readout of the p9 tree crop produced 5,401 bytes with 37.5% printable characters and no coherent ASCII run. This is only a negative for that simple extraction, not a general exclusion of image steganography.

## Decision

Preserve p3 BLUR as a candidate semantic clue because it is the sole exact dictionary hit in the fixed page-indexed family and its GP0 points to the already selected p28 READOUT page. Do not promote it to plaintext or treat the p50 orbit as an authenticated opcode. The p9 tree is a motivated visual target, but no stable branch-count, simple blur, or JSteg readout has yet yielded a message.

The next useful investigation is an independent, human-plausible readout of the p9 tree that is selected by the BLUR / READOUT / DIVINITY route. Avoid arbitrary blur-radius sweeps, branch-count fitting, or pixel-to-GP29 quantization.

## Reproduction

`node sims/lp2_page_index_centerword_cube_route_sft.cjs`

The SFT reconstructs all 30 page-indexed outputs from the original corpus and transcription, checks the corrected 58-page/57-section mapping, dictionary matches, p50 pointers and orbits, and the p9 center-pair/word9 negative. It passed together with the independent large-red-initial census in [GitHub Actions run 44466128898](https://github.com/FlareZ123/liber-primus/actions/runs/44466128898).