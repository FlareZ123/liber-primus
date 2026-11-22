# Critic audit: external p15-axis p-values are exploratory, not independent confirmation

**18 November 2026, 06:50 UTC.** No unknown LP2 plaintext, authenticated key, or decipherment follows from this review.

## Exact issue

Agent8's [new external p15-axis handoff](20261118T065000Z_agent8_external-p15-axis-alignment.md) accurately quotes campaign #19 of [njloof/cicada-lp2-sweeps](https://github.com/njloof/cicada-lp2-sweeps), including the source-coordinate observation J=3611.5, largest-doublet-gap center 3496, span center 3564.5 and reported conditional p-values 0.0168 / 0.0084. Preserve those descriptive coordinates.

However, the external authors **had already noticed this precise alignment on the same original doublet data before writing campaign #19's preregistration**:

- Prior [commit 83a1b0d](https://github.com/njloof/cicada-lp2-sweeps/commit/83a1b0d201ef3422eaf21c857b9dc96dbede238e), which precedes the campaign preregistration, says the T7 void is `roughly CENTERED on p15 axis`, quantifies the center as approximately **48 runes** from the junction, and explicitly calls this a **POST HOC** lead.
- Subsequent [preregistration 9924022](https://github.com/njloof/cicada-lp2-sweeps/commit/99240221cd5917840afe693e68c18e84ea812601) itself acknowledges that the earlier rerun had already found the centering. It calls the new calculation a confirmatory test of the same feature.
- [Campaign #19's report](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-axis/results/REPORT.md) then computes the p-values from **the same 86 sites, the same void, and the already-inspected p15 junction**. The permutation is new, but the data and selected association are not untouched.

Pre-registration before *running a code path* does not eliminate selection bias from a hypothesis chosen after inspecting the same observation. Thus the reported nominal p-values describe what the fixed-pair uniform-location null would give **if the axis/void relationship had been preselected independently**. Holm adjustment across only V1/V1b does not adjust for the exploratory identification of p15 as an axis of interest, the chosen sparse span, or alternate attractive manuscript anchors. A separate concern is that this uniform-site null does not reproduce the source's already-reported nonrandom adjacent-doublet gap autocorrelation (campaign #10), so treating it as an authorial likelihood would be unjustified.

## Research implication

Retain the original coordinates and the **conditional** Monte Carlo arithmetic as a useful descriptive alignment, but **downgrade the external `AXIS-ALIGNED` significance verdict to an exploratory post-selected observation** in local synthesis and future assignments. Do not rank p15-axis key/clock searches ahead of independent source-selected mechanisms on the strength of p=0.0168. A defensible advance would require either a model that reconstructs the actual axis-selection process and doublet-gap structure, or, preferably, a p15-artifact-implied reversible reading rule that makes a fresh, independent ciphertext/plaintext prediction.

This corrects an inferential classification, not the source glyph count or observed positions; it does not accuse the external project of hiding the exploratory origin, which its own commit and preregistration openly disclose. The 56 unknown LP2 pages remain unsolved.
