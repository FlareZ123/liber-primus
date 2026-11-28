# Original LP2 punctuation: p27 reassignment and the bounded large-ornament sidecar

**Agent 24, 28 November 2026. Source-level correction and independently testable capacity exclusion; no unknown LP2 plaintext.** The earlier original-pixel source audit in [\`lp2-punctuation-identity-stream.md\`](lp2-punctuation-identity-stream.md) already established **175 physical punctuation marks** on LP2 p0–55 and that p38 is a **three-dot** rather than four-dot mark. The new contribution is a blind complete-image five-shape detector, a correction of the previously ambiguous p27 event, explicit left/right orientations of the three-dot form, and an exact original-book capacity gate for **large-ornament-only** missing-state theories. It does **not** rediscover the preexisting physical total or establish plaintext.

## Physical inventory and p27 correction

All 58 original scans (\`resources/liber-primus/17.jpg\`–\`74.jpg\`) were searched without telling the detector which original text location to inspect. Component geometries used the existing 13-, 10-, 23-dot ornament shapes and two directly image-measured templates:

- four-dot stop \`⁘\`: top \`(0,0)\`, left \`(-15.5,17)\`, right \`(15.5,17)\`, bottom \`(0,34)\` pixels;
- three-dot comma/zigzag: same top/bottom vertical separation with **one** side dot, either left or right at \`y+17\`. Incidental two-dot pairs contained inside complete four-/ten-/thirteen-/twenty-three-dot glyphs are subtracted before identifying standalone three-dot forms.

| Printed punctuation shape | Unsolved p0–55 | Solved p56–57 | Visible dot sites on p0–55 |
|---|---:|---:|---:|
| Large 13-/10-dot ornaments | 31 | 5 (including 23-dot compound) | 394 |
| Four-dot diamond stops | **139** | 2 (p57) | 556 |
| Three-dot zigzag commas | **5** | 1 (p56) | 15 |
| **Total** | **175** | **8** | **965** |

The solved-page large class is four red13/red10 plus one red23, so its printed 58-page total is 36 ornaments; the class counts were already established. Full all-scan totals are **36 large + 141 four-dot + six three-dot = 183 punctuation glyphs**, **1,048 visible components**. Every 4-, 10-, 13- and 23-dot matching cluster is complete at its original expected geometry (largest fitted centroid residual 0.673px for four-dot, 0.661px for large marks). The six independently located three-dot marks are on original p5, p11, p20, p38, p46 and solved p56, all black. The side dot is **left** for p5/p11, **right** for p20/p38/p46/p56. Those are genuinely different physical orientations; no claim is made that they encode a key. The five unknown-page orientations offer at most five binary bits if freely chosen.

**Specific correction to the earlier human audit:** \`im-results/lp2-punctuation-identity-stream.md\` treated derivative event **91** (p27 line7, local rune offset144) as an ambiguous one-square singleton, reporting 138 full diamonds plus one singleton. The actual original **44.jpg** has a complete four-dot diamond centered at **(1694.75,2086.00)** at the end of the seven-rune group and **before** the following rune, exactly matching the literal line7 source \`…ᛗᛁᚻᚣᚹᛞᛚ.ᛟ\`. The next line8 final full stop (event92, local offset166) is independently centered at **(1741.75,2274.00)**. The previously noticed detached square farther to the right cannot be substituted for the four-dot event91: it is not the sole punctuation object at the stipulated between-runes position. The blind image detector recovers both 4-dot shapes; surrounding rune/image order disambiguates them. Thus p27 contributes **two complete printed periods**, not one period plus an unresolved singleton. This changes the *morphological classification* of one event, **not** the already established total of 175 physically printed marks.

The existing corpus contains **180 derivative punctuation records**: drop four nonprinting p15 numeric-row stops (indices57–60) and the truly absent **p37 event125** to obtain 175 printed marks. Preserve p38 event127 as physical but classify it as a **three-dot** comma-form rather than its derivative \`⁘\` label. The original source has 139 complete four-dot stops, five three-dot forms and 31 large ornaments. These corrections matter when deriving keys from exact punctuation event counts or inter-mark gaps; neither p27 nor p38 should be silently erased.

## Direct physical-carrier decision

A constrained-code explanation must account for the **86 adjacent equal GP29 runes in the 12,956-rune unknown register**. An unrestricted 29-symbol input source transmitted in an exactly-86-repeats, book-wide fixed-equality output alphabet would require the exact universal side-state quotient

\[
Q=\left\lceil\frac{29^{12956}}
  {29\binom{12955}{86}\,28^{12869}}\right\rceil
\quad\text{with}\quad\lceil\log_2 Q\rceil=328\text{ bits}.
\]

This is a **conditioned model** (fixed equality count, unrestricted GP29 plaintext), not a universal theorem that LP2 must need 328 secret bits. For the *large-ornament-only position-and-visible-shape* sidecar, deliberately grant more freedom than printed: 31 ornaments may be placed with replacement among **all 2,896 original printed word ends**, and each ornament independently chooses any **six** colors×{10,13,23}-dot appearances. There are at most

\[
\binom{2926}{31}6^{31}=2^{324.1966356\ldots}
\]

distinct 31-mark layouts; even allowing **zero through 31** marks yields only \`2^324.1991852\` states. Both are strictly below the 328-bit universal quotient. If the observed **27 red13, three red10 and one black13** multiplicities are fixed but relocated, the physical type-and-placement channel has only \`2^261.0042584\` layouts. **This exact limited carrier cannot supply a universal unrestricted-GP29 exception register under that fixed-repeat model.**

The original large ornaments' **394** individual dot positions and small four-dot stops' **556** positions do not offer a visible *deletion mask*—all printed instances are complete. The five three-dot comma shapes are an explicitly different punctuation class, not incomplete instances of four-dot stops. **All 965 dots are visible, not 965 independently writable on/off bits.** This leaves other punctuation placement, the actual three-dot orientation register, movable plaintext word breaks, source-restricted grammars, brightness/pixel/JPEG channels, external key material and non-fixed-repeat coding completely open.

## Reproduction, scope and next solve decision

- \`python sims/lp2_punctuation_dot_topology_original_sft.py\` (numpy, Pillow, scipy, opencv-python-headless) searches the original scans for geometry, subtracts nested two-dot artifacts, checks physical vs source-mark classes and lists image coordinates and genuine three-dot directions.
- \`node sims/lp2_large_ornament_only_capacity_sft.cjs\` uses the original GP29 and printed-word register plus exact integer binomial arithmetic. Both scripts use pinned original inputs and no guessed plaintext.
- [Original 13/10/23-dot image audit PASS](https://github.com/FlareZ123/liber-primus/actions/runs/46130036030); [four-dot/capacity integration PASS](https://github.com/FlareZ123/liber-primus/actions/runs/46131389204). The three-dot extension has its own latest manual Actions workflow run.
- Existing per-event human physical analysis and original-image source note: [previous source audit](lp2-punctuation-identity-stream.md), [original archive README](../resources/liber-primus/README.md).

**Decision:** Preserve the new p27 correction as physical source data and stop using generic visible-dot deletion or a large-ornament-only 328-bit sidecar as a route to plaintext. The actual five comma orientations are a small novel discrete source feature, but require an independent human-solvable instruction and a locked ciphertext prediction before promoting them to a key. The bounded tests do not decode any of the 56 unsolved LP2 pages.
