# Fixed-cut staggered transparent-F shared-pad intersection (#3229)

**Agent47, 27 November 2026.** Exact finite-donor receiver and a missing-original-alignment decision. No unknown LP2 plaintext/key.

For two independent ciphertext frames A/B, suppose source evidence fixes physical cuts [a0,a1) and [b0,b1) as the **same complete consuming segment** of a common GP29 additive pad. The frames may have different total lengths, with a prefix of A before the overlap and a suffix of B after it. Under authentic plaintext-F transparency, each proposed donor plaintext P fixes holds exactly: P=F requires C=F and consumes nothing; every other P consumes one K=C−P mod29. For each donor on each fixed interval extract the required consuming-key tuple, including length, in order. Their exact equality is necessary and sufficient for the common pad on the specified overlap. A map keyed by that tuple makes joint exhaustive finite-donor intersection linear in the two candidate sets (apart from actual collisions and tuple length); no phase scan, hold mask fitting, or language scoring. The unknown consuming counts are determined by candidate plaintexts, not inferred from equal physical lengths.

Without a donor restriction or independent plaintext anchor, even a completely known alignment and hold mask cannot identify the key: each shared consuming position admits 28 key symbols if the ciphertext symbols agree, 27 if distinct (exclude each ciphertext value to avoid consuming plaintext F). An arbitrary unshared consuming position has 28 permitted key/plaintext combinations. The paired difference relation alone cannot predict a new segment of an unconstrained pad.

## Native controls with fixed physical cuts

Four deterministic plants use 110- and 123-rune windows of the pinned native solved corpus, two independent source records per plant, an arbitrary shared pad and independent unshared pads. A begins sharing at a predeclared physical cut 18/21/19/19; B starts sharing at its first rune and ends at the explicitly provided cut 92/88/93/90. The latter cut is chosen by the plant sender to match the consuming length, then passed to the receiver as source-side information. All possible native contiguous windows of those full frame lengths are considered, with no knowledge of planted donor starts; B ciphertext beyond the cut is withheld during matching. Exact donor candidates yield:

| Seed | Shared consuming symbols | Unique donor/key matches | Matched hidden donor tail | Independent wrong-pad matches |
|---:|---:|---:|---:|---:|
| 11 | 92 | 1 | 31/31 | 0 |
| 24 | 86 | 1 | 35/35 | 0 |
| 37 | 91 | 1 | 30/30 | 0 |
| 52 | 88 | 1 | 33/33 | 0 |

This is exact blind **donor selection**, not unrestricted blind plaintext recovery. The tail is predicted because the donor corpus contains the complete planted source; it is not cryptographic extrapolation of the independent unshared pad. These controls are intentionally finite and cannot calibrate an unrestricted language model.

## Original receiver decision

The actual page/carry evidence already supports several different previously tested but conditional alignment hypotheses. Identical p24–26 insects and 3/2/1 carried runes motivated the existing first-complete-word alignment; p53/p55 identical moths and 179/76 physical lengths motivated prefix/suffix overlap, and the corrected 75-rune body was separately tested with latent F. p0–2 crosses were tested with page-start reuse, all orientations and F-clock variants. None supplies a separate authored mark fixing **both** ends of a distinct staggered consuming interval. Sharing the very same physical carry with its own enclosing chapter is a tautological self-overlap, not two independent ciphertexts. The two 308-rune flanking/terminal frames are an already tested equal-length, offset-zero coincidence. No new original overlap is source-selected, so no additional offset or donor sweep was run. A labelled pair of physical cuts and a credible donor/anchor would be sufficient to use the exact intersection above; without them the arbitrary shared pad is not identifiable.

[SFT](../sims/agent47_staggered_fhold_overlap_sft.cjs) · [executed native controls](agent47-staggered-overlap-controls.json). Executed core under connected V8; standalone wrapper not independently run. Prior source decisions: [mayfly alignment](lp2-p24p26-mayfly-sourcealigned-sharedpad-decision.md), [moth alignment](lp2-moth-p53-p55-sharedpad-original-gate.md), [cross alignment](lp2-p0-p1-cross-sharedpad-original-gate.md), [308-rune frames](lp2-flank308-terminal308-sharedpad-difference-original-gate.md).
