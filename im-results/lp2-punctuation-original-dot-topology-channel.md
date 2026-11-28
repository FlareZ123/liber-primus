# Original LP2 punctuation has a fixed complete-dot topology, not a visible 394-bit exception sidecar

**Agent 24, 28 November 2026. Classification: new original-JPEG physical-channel exclusion, not plaintext recovery.** This result addresses a specific missing-input possibility from the constrained-coding research, rather than repeating stream-cipher or canonical rank28 sweeps.

## Causal question

LP2 pages 0–55 contain 12,956 runes but only 86 within-page immediate repeated runes. The previously demonstrated universal capacity shortfall of a fixed-repeat, arbitrary-GP29 constrained encoder is **328 bits in one book-wide frame**, **446 bits if page-framed**, and **679 bits if word-framed**; see \`im-results/lp2-enumerative-repeats-punctuation-capacity-original-gate.md\`. Those numbers give the source-driven question: could the physical punctuation glyphs themselves carry the missing per-exception bits, for example by omitting individual dots from their 13- or 10-dot clusters? That possibility is NOT tested by merely counting the glyph-type identities in the text transcription.

The 31 large punctuation ornaments on original unknown pages 0–55 **contain exactly 394 individually visible dot components**: 27 red 13-dot groups, one black 13-dot group, and three red 10-dot groups. If independently switchable, 394 presence bits would exceed the *book-framed* 328-bit side capacity, though not the *page-framed* 446-bit requirement. Therefore checking individual original pixels is an informative test of a possible source carrier, not an unrelated steganographic sweep.

## Original-image decision

Every original JPEG physical scan, \`resources/liber-primus/17.jpg\` through \`74.jpg\`, was searched *blindly* for both red and black groups matching the independently specified 10-, 13-, or 23-dot vector patterns. No punctuation occurrence was supplied to the detector as a region of interest. The resulting inventory agrees with the separately transcribed \`lp2-ink-annotations.json\` at every page/ink/type entry; there are no extra groups or omitted transcribed groups.

| Physical glyph class | All 58 scanned pages | Unknown pages 0–55 |
| --- | ---: | ---: |
| Red 13-dot ornament | 30 | 27 |
| Black 13-dot ornament | 1 | 1 |
| Red 10-dot ornament | 4 | 3 |
| Red 23-dot compound ornament | 1 | 0 |
| **Physical dots** | **466** | **394** |
| **Ornaments** | **36** | **31** |

All 466 dots are present, with **zero per-dot deletions**. All complete arrangements match the same translation-only templates, without any glyph-level rotation, permutation or missing-dot adjustment, with **maximum per-dot fitted-centroid residual 0.661 pixels**. The 10-dot marks on p36/p38/p49 use one fixed ten-dot pattern, and the solved p56 supplies a matching ten-dot control. The solved p57 23-dot ornament is an explicitly distinct fixed 23-point compound pattern, not an instance of a 13-dot marker with ten extra removable dots. The black p7 13-dot marker matches the same physical thirteen-point shape as the red marks.

For an individual-dot presence/deletion code, **all 394 potential bit positions are constant**. Hence the conspicuous original decorations do *not* supply the required 328-bit lossless exception register through missing, added or re-ordered dot components. This is a stronger constraint than the transcribed 13-vs-10 class counts alone. It neither disproves the general constrained-code explanation nor infers any unknown plaintext.

As a limited color sanity check, 453 red dot centers across all pages have median-sampled red-channel mean **191.374**, SD **2.234**, observed range **185–197** (8-bit). Ordinary JPEG and raster alignment effects can readily produce this continuous local variation. **No stronger color-channel exclusion is claimed**: slight authored color, pixel-level brightness variation, low-order bits, and JPEG DCT channels remain open. Equal visible component topology does not imply bit-identical source JPEG patches.

## Reproducer and interpretation

\`python sims/lp2_punctuation_dot_topology_original_sft.py\`, after installing \`numpy pillow scipy opencv-python-headless\`, examines **all 58 original image files**, independently detects all three vector shapes in both ink colors, then checks the resulting full inventory against the derived ink annotation register. It prints all 36 locations, color summary and maximum error. The matching tolerance is 3.15 pixels before subpixel template fitting, with max residual 2px; the observed maximum is only 0.661px. No digit, plaintext, cipher mode, rune transposition, or arbitrary bit threshold is fitted to the answer.

GitHub Actions original-source run: https://github.com/FlareZ123/liber-primus/actions/runs/46129687875 (initial positive execution, 58 original JPEGs). The updated source-independent all-image/all-ink scan supersedes the first source-location-guided version; the later run is linked separately when complete.

**Research decision:** do not treat the 394 printed dots as 394 *author-selectable presence bits*. Conditional arithmetic-coder explanations still need a *distinct, independently sourced sidecar or a source-restricted input alphabet*. Avoid filling any missing sidecar with arbitrary dot-color thresholds chosen to make ciphertext look English. A genuinely new, predeclared brightness/depth channel or original editable compositor object would justify reopening the physical-glyph branch.
