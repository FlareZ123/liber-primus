# Plaintext-conditioned F glyph production-order gate (Director #2526)

**Decision:** the source does not supply an exact visible F-interrupter tag through ordinary glyph silhouette or ink color. Authentic WELCOME and p56 AN END each contain two opposite-label F runes with exactly identical thresholded glyph masks. No unknown-page hold labels, key, or plaintext are inferred.

## Causal hypothesis and exact labels

In the solved plaintext-F-transparent cipher, a plaintext F is emitted unchanged and consumes no key; other runes consume the additive shift, and can themselves encrypt to F. A solver who could distinguish these two source F classes could recover the otherwise latent clock directly. This is a production-order question: a separate pre- or post-encryption tagging pass might leave a different glyph shape or ink, whereas a uniform font applied to the resulting rune string does not. Existing generic allograph and line-width audits do not condition on authentic true-hold labels.

Use exact source-native plaintext and cipher replay for LP1 WELCOME (515 runes; 25 ciphertext F, 11 true holds; key DIUINITY), second KOAN (319 runes; 5 ciphertext F, 2 true holds; FIRFUMFERENFE) and LP2 p56 AN END (85 runes; 5 ciphertext F, 1 true hold; successive prime-minus-one clock). All three exact replays were verified against repository-native source; the F labels are therefore plaintext-conditioned, not guessed from visible ciphertext.

Read original JPEGs 03, 04, 14 and 73 directly from the maintainer's original archive. The fixed ordinary-height connected-component row registration retains only rows whose component counts match the pinned source rune sequence, omitting giant initials, unresolved joins and the small footer. Original crops visually checked: all 22 retained components are genuine F glyphs. This is a deliberately incomplete sample, not a census of all 35 visible F positions. The sample includes 12 WELCOME, 5 KOAN and all 5 AN END F glyphs.

## Exact opposite-label witnesses

All positions below are zero-based page-local rune offsets; image 73 corresponds to physical LP2 p56. Threshold grayscale <150, crop to the component's native bounding box, and compare without rescaling.

| Original JPEG | Ordinary encrypted F position / box (x,y,w,h) | True transparent F position / box | Exact mask disagreement | Mean absolute grayscale difference |
|---|---|---|---:|---:|
| 03 | 47 / (1692,1050,34,114) | 48 / (1730,1050,34,114) | 0 / 3876 pixels | 3.31889 |
| 73 | 47 / (729,1889,35,115) | 56 / (1196,1889,35,115) | 0 / 4025 pixels | 0.68522 |

Both pairs use black ink and the two glyphs in each pair occupy the same physical line. These exact cross-label collisions are stronger than a generic observation that the characters look alike: no deterministic function of their thresholded native bounding masks can classify both labels correctly. Neither position label requires a language guess.

## Frozen simple transfer

Use two fixed nearest-centroid features: (1) the 16x32 area-resampled mask; (2) width/height, ink fraction, mean red-minus-green and mean grayscale of ink pixels, standardized from training data only. Evaluate across original solved objects, not random glyph splits from the same page.

| Training | Held-out | Shape correct | Geometry/color correct | Always ordinary F |
|---|---|---:|---:|---:|
| WELCOME | KOAN | 3/5 | 4/5 | 3/5 |
| WELCOME + KOAN | AN END | 4/5 | 4/5 | 4/5 |
| KOAN | WELCOME | 6/12 | 6/12 | 7/12 |

On p56, both frozen classifiers label the actual transparent F correctly but also classify its identical-mask ordinary F counterpart as transparent. Consequently the hypothesized exact label channel fails even on genuine solved originals. Small samples do not exclude every microscopic, position-dependent, or JPEG-coefficient channel; no independent source selects such a channel here.

## Reproducibility and next decision

[Python SFT](../sims/lp1_lp2_transparent_f_original_glyph_sft.py), source label replay from native LP1/p56 texts and original JPEG crop processing. The full numerical crop/centroid test was executed locally using the original ZIP and pinned replay-derived source labels; the committed reproduction wrapper additionally derives the labels directly from the repository source inputs. No CI claim.

Do not apply a visually derived F-hold assignment to unknown LP2: the observed feature cannot distinguish the exact true labels in two separate solved ciphers. The latent clock remains unresolved; a new observable authored tag or genuine independent key/clock information would change that decision. No unknown original text was tested because the necessary solved-source production-order gate failed.
