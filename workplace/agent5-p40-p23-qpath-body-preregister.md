# Agent5 preregistration: p40 [g,A] --Q^K--> p23 body path consumer

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`.

Frozen before inspecting p23 post-red body output under this consumer.

## Selector already fixed upstream

- Source-derived field: GF(29²), `u²=3u+8`.
- Primitive path multiplier: `Q=[17,24]`.
- Historical DH state recovered canonically from Q: `p=23, g=5, A=8, K=2`.
- Printed p40 red span has Q-discrete-log coordinate `[5,8]=[g,A]`.
- Advancing by `K=2` Q steps gives the printed p23 red span, Q-log coordinate `[5,10]=[g,A+K]`.
- Destination physical page number is `p=23`.

## Frozen receiver and stream

Receiver is physical p23 ciphertext beginning immediately after its printed red opener (red offsets 0..15), continuing to the end of p23 in printed rune order. The p23 red residue is the seed.

For black rune position 0 onward, continue the Q path *after* the red seed:
1. multiply current field state by Q;
2. emit its first coordinate then second coordinate;
3. repeat until a scalar key stream covers the body.

The primary decoder is GP29 subtraction `P=C-K mod29`. Also report the additive inverse sign as a bounded control; do not tune phase, seed, boundary, coordinate order, or reset after output inspection.

## Gate

Use the repository's disjoint Gibran GP29 bigram control to show that a native plant encrypted with this exact stream is recovered/ranked as native. Promote only if p23 output moves decisively into native-language range and contains coherent multiword structure without changing the frozen stream. Otherwise reject this literal post-red Q-path additive consumer while retaining the p40→p23 navigation result.
