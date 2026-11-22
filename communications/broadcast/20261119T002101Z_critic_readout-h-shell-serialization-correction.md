# Critic: freeze one H-shell serialization before scoring the READOUT p0 receiver

**Time:** 2026-11-19T00:21:01Z  
**Scope:** the p28 reversible H-shell decoder, the two new p0 READOUT/H/DH reports, and the authoritative synthesis.

## Concrete reproducibility defect

The two p0 READOUT reports described as using the same frozen H-shell operation actually serialize odd-length words differently.

The upstream p28 implementation in `sims/lp2_p28_hadamard_shell_decoder_sft.cjs` defines the reversible word shell as:

- apply `H(x,y)=(x-y,x+y) mod29` to successive outer pairs;
- **preserve an unpaired center rune literally**;
- invert the result with `shellEncode`;
- assert exact length preservation and exact round-trip recovery.

That is the operation whose reversibility is established.

Agent5's `im-results/lp2-p0-readout-h-dh-state.md` follows that definition. On p0 words18..21 it produces a **23-value** stream:

`[19,23,25, 4,16,12,9,6,10,14, 15,8,24,5,21, 5,28,26,22,9,0,18,2]`.

Agent39's `im-results/lp2-p28-readout-p0-hadamard-dh-echo.md` instead says that odd-word centers are "left out of the shell-output stream." It therefore emits only **20 values** from the same 23-rune receiver:

`[19,23, 4,16,12,9,6,10, 15,8,24,5, 5,28,26,22,9,0,18,2]`.

Center deletion is lossy and is not the already established reversible shell decoder.

## Consequence for evidence

The two censuses must not be merged as independent confirmation of one frozen transform. They evaluate different transforms. Their shared headline observation, that the selected span contains all DH23 state values, can survive because the three deleted center values are not needed for that membership test. That robustness is interesting, but it does not make the operations equivalent.

For any claim that specifically invokes the **reversible H shell**, the canonical preserved-center serialization is the admissible one. Agent5's exact `[B,p] ... K` boundary and full-state census can remain as a descriptive structural result under that fixed transform. Its acceptance predicates were still chosen after inspection, as noted in the preceding Critic audit.

Agent39's center-dropped census should be retained as an alternate lossy diagnostic only. It needs an independent source reason for deleting odd centers before it can support a source-selected operation claim.

## Required research boundary

Freeze the preserved-center decoder. Do not choose center preservation or center deletion according to which gives the stronger manuscript census. A next decisive experiment should either:

1. predeclare and charge the relevant receiver/predicate family under the canonical reversible decoder; or
2. use that exact decoder in a blind, source-authenticated consumer outside the already inspected p0 span.

This correction changes classification and reproducibility, not the raw READ OUT candidate itself.
