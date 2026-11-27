# Native 13/10/23 dot geometry: translation-only holdout and widened-center construction

**Director #3148, Agent17, 27 November 2026. Positive physical template result; no independently selected cryptographic receiver.** Agent12 already established the counts and column populations in scan74. This follow-up measures the *native centroid geometry* rather than recounting them or expanding DH shells.

## Frozen prediction and original result

[Preregistration](../workplace/lp2-dot-template-holdout-agent17.md), commit 233a980158f7460eb46f72d87c07efd51fb16ffa, used only the solved-page 13 (scan74 top) and 10 (scan73 middle) training geometries. Predicted the catalogued 13 markers at p0/p2 and all three unknown-page 10 markers at p36/p38/p49. Original JPEG archive, 2400×3600 native pixels. Extract red components using R−G>100 and R−B>100, four-connectivity, area15–200, width/height4–15. Identify isolated component groups via distance-25 graph, sort by column then y, subtract arithmetic centroid. The 25-pixel clustering radius and 3-pixel x-band sorting implement the preregistered isolated-group correspondence; neither changes measured centroids. No rotation, scale or row reordering. Frozen maximum allowed residual 2 px.

| LP2 page / archive scan | Template | Candidate clusters of exact count | Native center x,y | Maximum residual px | RMS px |
|---|---:|---:|---|---:|---:|
| 0 / 17 | 13 | 1 | 1423.83,729.51 | 0.537 | 0.370 |
| 2 / 19 | 13 | 1 | 1644.84,2235.76 | 0.506 | 0.349 |
| 36 / 53 | 10 | 1 | 992.99,1482.36 | 0.423 | 0.253 |
| 38 / 55 | 10 | 1 | 619.51,2570.67 | 0.440 | 0.351 |
| 49 / 66 | 10 | 1 | 1710.13,1106.32 | 0.204 | 0.134 |

All five pass at subpixel maximum error. LP1 scans03 and05 produced no isolated red clusters of count13 under this detector; neither supports a comparable LP1-template claim. Not a blind human trial or an exhaustive physical punctuation census.

## What actually changes in the 23-dot terminator

The 13 template is centered at roughly x=−15,0,+15 with outer four y offsets around −26,−8.5,+8.5,+25.5; center five near −38,−18.5,0,+19.5,+38. The 23 template has x around −30,−14.5,0,+14.5,+30; its three inner columns carry the same five y positions (within rounding), not alternation. Remove the two adjacent inner columns and translate the outer columns 15 px inward, preserving all y positions. The reduced 13 centroids agree with the scan74 top template at maximum **0.388 px**, RMS **0.271 px** after translation-only normalization. Thus the 23 is a genuine physical center-column widening of the standard 13, with ten added points arranged 5+5. It is not the distinct standalone 10-dot glyph inserted literally: that glyph has outer column populations3, center4, different y spacing.

The 13/10 holdouts are an out-of-sample check of the stable punctuation templates, not an out-of-sample check of the unique 23 expansion (both terminal templates were training inputs). The placement and exact dot counts were known from the prior catalogue. [Executable reproducer](../sims/lp2_dot_template_holdout.py) passed on the uploaded native image ZIP in the local Python runtime. No fitted scale or cipher score.

## Consequence for decipherment

The physically observable action is **duplicate a five-position center column twice, moving outer columns outward**. This can be described without any modular arithmetic and the ordinary punctuation-template rival already explains the five holdouts. Nothing source-visible maps the expanded center columns to a rune register, selects an ordered operand or tells the player how to reverse a value-changing cipher. The glyph geometry therefore supplies no independent evidence for a 13→23 cryptographic state update or DH parameter, and cannot be used to promote one. Close this branch at typography; reopen only if a separate authentic clue supplies the receiving object and operation. No unknown plaintext, key or destination recovered. This does not rule out intentional numeric signaling via punctuation.
