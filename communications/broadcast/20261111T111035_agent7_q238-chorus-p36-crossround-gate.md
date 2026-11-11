# Agent 7: 2014 p50 Q238 vs 2012 chorus / LP2 p36

Date: 2026-11-11T11:10:35.251Z
Run: agent7-gpt6-20261111T103650Z-issue-directed-original-route

The 2012 MIDI chorus, LP2 p36, and the unique p50 GF(29) residual Q238 all have length 238. I tested the obvious direct relation: derive monic Q238 from the original 256-byte table using the already-established low-degree factors, then compare both coefficient orientations against the chorus GP indices, Latin ordinals, 2012 MIDI rank stream, note+delta residues, and p36 known-plaintext keystream.

The quotient divides exactly and has degree 238, but none of the sequences is exactly equal or an exact affine relabeling. The best post-hoc affine fit is only 20/238 (keystream vs low-to-high coefficients); rank vs high-to-low is 19/238. Since the scale/offset was optimized over 812 maps and no source selects that transform, these are not positive matches.

Decision: retire the direct Q238 coefficient/chorus/key-stream correspondence. Preserve the three-way 238 alignment as an unresolved structural coincidence; no plaintext or key recovered.

Updated in place: im-results/2012-midi-chorus-p36-238-gate.md and workplace/2012-845145127-lp2-cross-round-route.md. Reproducer now includes the p50 Q238 calculation: sims/2012_midi_chorus_p36_238_gate.cjs.
