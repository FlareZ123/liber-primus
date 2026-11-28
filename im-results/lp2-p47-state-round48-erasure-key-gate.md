# Candidate p47 DH state fails both calibrated Round48 erasure-channel inverses on p23

**Agent1, 28 November 2026. Conditional negative; no plaintext/key promoted.**

## Evidence premise

The p47 page/group/receiving line is source-fixed, but the Critic audit correctly notes that mapping its heterogeneous descriptors to the complete DH tuple was not prospectively frozen. Therefore this experiment **grants** the candidate state interpretation

```
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4)
```

and asks a downstream question only: if those numbers really are the supplied state/key material, do they unlock either of the two already-calibrated Round48 erasure channels on the p23 receiver selected by that same conditional route?

Receiver is fixed at physical p23, rune offset20: the 193 runes immediately after the complete five-word line. P23's established `THE ORIGIN` instruction fixes key phase0. Two source-visible periodic key packets are charged without rotation or fitting:

- full candidate state, period9: `[23,5,6,15,8,19,2,3,4]`;
- visible p23 line packet, period5: `[2,6,3,5,4]`.

## Mod36 hidden-output channel

Use the repository's existing exact/unbounded hidden-output periodic inverse from
`sims/lp2_periodic_silent_unbounded_inverse_sft.cjs`, unchanged. It models GP29+SPACE plaintext, mod36 output, strict repeat rejection and silent ciphertext states29..35. Same-key held Gibran plants calibrate each period.

| Key | same-key held-native score | original p23 result |
|---|---:|---|
| period9 full state | **-2.00062849** | exact replay path, score **-5.05175409**, 371 inferred plaintext tokens, 178 hidden, max hidden run5 |
| period5 visible line | **-2.06852930** | **no legal beam path past observed rune13** |

The period9 false path begins `NHURL NNOW D THIR ANY ENE DROTUS...`; exact forward replay only proves channel reachability, not plaintext.

## GP29 deletion channel

Use the separate existing strict-repeat + iid deletion inverse from
`sims/lp2_alt29_delete_exact_latent_viterbi_sft.cjs`, with the two keys repeated periodically, phase0, beam900 and at most three deleted plaintext symbols between observed runes.

| Key | original score |
|---|---:|
| period9 full state | **-4.27263557** |
| period5 visible line | **-4.26009625** |

Matched known-key controls in the same run recover 92.53% Shakespeare and 84.12% Gibran retained plaintext at scores **-3.02934 / -3.08207**. Independent wrong-key controls score **-4.05111 / -4.15931**. Both original state-key decodes are at or worse than wrong-key scale.

## Decision

Even granting the mixed-descriptor p47 state interpretation, neither the full nine-field state nor the visible five-field packet acts as the periodic key for the two calibrated Round48 erasure mechanisms on its selected p23 following-text receiver. The mod36 model gives either a grossly non-native replay or an early support failure; the GP29 deletion model sits at wrong-key language scale.

This is a **conditional key-transfer exclusion**, not evidence against the Round48 channel families globally and not evidence authenticating the p47 state grammar. A different source-selected receiver, clock, key representation or external operand remains open.

## Reproduction

`sims/lp2_p47_state_round48_silent_p23_gate_sft.cjs`

The SFT imports the existing channel implementations rather than duplicating them and asserts the native controls and original outcomes above.
