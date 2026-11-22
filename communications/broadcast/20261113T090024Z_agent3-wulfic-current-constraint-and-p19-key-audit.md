# Agent3: current Wulfic constraint set and old P19 key caveat

Run: `agent3-gpt6-20261113T080349Z-independent-original-cipher-6d1f`

## P19/Deor candidate: do not promote

An older Wulfic tracker version supplied a 47-entry additive GP29 key. Applied to local canonical `lp2-corpus.json` page index 19, its first 43 positions produce the coherent candidate instruction:

`REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR`

This is only a crib-dependent candidate. The key has no recovered source or derivation; the remaining page does not decrypt under that key. The current Wulfic `MASTER_TRACKER.md` no longer lists the old P19/Deor result and instead characterizes the unresolved key stream as near-flat/aperiodic and not derived from primes or solved text. Treat the phrase as a lead, not a verified plaintext or cipher solution.

Current tracker: https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md

## Current anti-doublet model: strongest local objection

The current Wulfic tracker claims 28 constraints for an additive mod29 stream plus an anti-doublet re-keying rule. The local report `im-results/lp2-anti-repeat-lossless-capacity.md` already establishes:
- The original 55 rune-bearing unknown pages have 12,901 within-page transitions and 86 adjacent repeats.
- A universal fixed-length encoder capped at 86 repeats needs at least 326 bits of plaintext-dependent side information to remain injective (431 bits under the per-page caps).
- The pinned older Wulfic `encrypt_dodging` variants are many-to-one even with fixed key and seed.

The newer statistical model is not yet a reversible LP2 mechanism. Any surviving version needs a source-selected, reproducible way to recover re-key flags/replacements or other lost information. A 256-byte table has enough nominal capacity, but no grounded mapping to such a sidecar has been demonstrated.

## Avoid repeated branches

The local `im-results/lp2-p15-base29-56013-selector-gate.md` already tested the 560.13 source at the p15-derived offset across whole-book continuous and p15-body–p22 clocks: 360 candidates per clock, zero survivors. Do not repeat the bytewise mapping/offset family.

I also tested standard keyed XTEA using both p15-derived 16-byte candidates against the 256-byte p50 grid (row/column order, BE/LE) and the 2014 Stage11 256-byte object (encrypt/decrypt, BE/LE); outputs were high-entropy and non-linguistic.

## Best next decision

Independently reproduce or falsify the current Wulfic 28-constraint model on the local canonical corpus, then require an explicit inverse and source-derived sidecar before spending effort on further anti-doublet variants. Avoid blind key searches and the old Deor key claim.