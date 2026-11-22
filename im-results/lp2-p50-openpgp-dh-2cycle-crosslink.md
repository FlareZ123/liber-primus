# p50 2-cycle / signed OpenPGP / DH23 cross-link

**Status: retrospective cross-source correspondence, not a decryption.** This note records a new selector and exact modular identities on the already-provisional base60 successor-graph interpretation. It must not be promoted to an independently recovered DH state or a plaintext result.

## Exact OpenPGP selector

The authenticated 2016 signed-message body ends:

`Beware false paths. Verify OpenPGP 7A35090F.`

The final body word `OpenPGP` is encoded in canonical Gematria Primus as:

| Symbol | GP index | GP prime weight |
|---|---:|---:|
| O | 3 | 7 |
| P | 13 | 43 |
| E | 18 | 67 |
| N | 9 | 29 |
| P | 13 | 43 |
| G | 6 | 17 |
| P | 13 | 43 |

The GP-prime sum is exactly **249**, with no modular reduction. In the original p50 base60 table, `f(249)=158` and `f(158)=249`: this selects the 2-cycle `249 ↔ 158`. The historical 2014 sexagesimal byte witness preserves both edges exactly. The explicit “Verify OpenPGP” source wording therefore provides a plausible selector for this otherwise small cycle, although the choice of GP-prime sum and pointer semantics remains conditional.

The PGP key ID supplies a secondary alignment: its byte `0x09` is address 9, and `f(9)=249`; 9 is a leaf in the 2-cycle's four-node basin. This is not an independent source because the byte and word occur in the same signed instruction.

## Exact DH23 identities

The existing p28 DH23 reconstruction is `p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4`.

The p50 2-cycle vertices reduce modulo 23 to:

- `158 mod 23 = 20 = 5^5 mod 23 = g^5 mod 23`
- `249 mod 23 = 19 = 5^15 mod 23 = g^15 mod 23 = B`

The directed edges satisfy the p28 exponents exactly:

[
20^3 equiv 19 pmod{23}
]
[
19^{15} equiv 20 pmod{23}
]

Thus `158 → 249` is the DH exponent-`e=3` step on these residues, and `249 → 158` is the exponent-`b=15` step. This is a precise arithmetic match, not merely a cycle-length analogy.

Further alignments on the same provisional graph:

- The 11-cycle contains node 192, and `192 mod 23 = 8 = A`.
- The existing p0 “EPIPHANY SEEKS” additive title-key GP0 checksum is 192, so it selects that same 11-cycle vertex; this is postselected and not independent proof.
- The cycle lengths are 2 and 11, whose product is `22 = p−1`. The shared secret `K=2` has multiplicative order 11 modulo 23. The graph's 2-cycle basin has four nodes, matching the p28 field `q=4`. These are structural correspondences; no claim is made that the 11-cycle is literally the orbit of 2.
- The graph's base29 word-register labels are `249=(8,17) → DEVOTED/THE`, `158=(5,13) → EPIPHANY/WAY`, and `192=(6,18) → SEEKS/MAP`. These words echo the authenticated 2016 message's “epiphany seeks the devoted”, “Liber Primus is the way”, and “words are the map”.


## Original-image visual control

The original scans for physical LP2 pp49–51 are `66.jpg`, `67.jpg`, and `68.jpg` in the uploaded image set; the 32×8 numerical table spans these pages, with p50 on image67. The left and right tree-border crops (including adjacent black dot clusters) are pixel-identical across all three pages at fixed source coordinates. They are a repeated template, not page-specific data or a selector for the 2+11 graph. A generic tree/forest metaphor remains possible, but this visual motif does not independently authenticate pointer-chasing.

## What this does and does not establish

This adds a source-visible reason to inspect the p50 2-cycle: the final explicit word “OpenPGP” has GP-prime sum 249, which is the exact cycle address, and the resulting edge residues satisfy the p28 DH exponents. The 2-cycle is stable in the historical 2014 byte witness.

However:

1. The base60 table-as-successor-map is still a hypothesis; no creator-authored instruction explicitly says to pointer-chase these cells.
2. GP-prime sum was selected after the table graph and DH state were known. Do not call this a blind prediction or independent DH reconstruction.
3. The stronger signed-word low-digit graph is a separate mechanism and has its own Critic caveat about target-aware topology labels; do not conflate the two graphs.
4. Direct 2-cycle residue streams, simple DH power streams, and DH-parameter affine/power transforms do not decrypt the p0 23-rune receiver. The existing p0 core crib `THE DEVOTED SEEKS EPIPHANY` remains unverified.
5. No new plaintext, reusable key, or complete cipher operation is recovered.

**Decision:** retain this as a compact cross-source selector/corroboration for the p50 graph and DH23 state. Do not expand into unconstrained transformations. A next experiment is justified only if a source clue prospectively specifies how the 2/11-cycle state should produce a key or reversible operation on an untouched receiver.
