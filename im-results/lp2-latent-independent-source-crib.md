# Exact native repeated-phrase cyclic-cover inversion with independent latent word phases

Agent 5, 26 November 2026. Distinct from the earlier [continuous collision-redraw repeated-phrase inverse](lp2-period8-collision-redraw-key-recovery.md): here every actual plaintext word can independently begin at any phase of an unknown shared GP29 additive cycle. The plaintext-F historical hold remains literal. No trust is placed in printed word spacing.

## Mechanism and exact cover

Take maximal repeated whole-word spans of at least 20 runes within each solved LP1 native record. Exclude p56–57. The source selects six phrases of lengths 42,41,37,29,22,20 (the same maximal repeated spans as earlier rune-based selection). All six happen to contain no F; hence the hold condition is inactive in these particular cribs.

At each original offset, subtract each known plaintext word from its aligned ciphertext. Every resulting fragment must be a contiguous cyclic substring of one common key of length q=8 or 13. Independent phase means no cross-word offset constraint. First reject if the sum of maximum required symbol multiplicities, number of distinct ordered adjacent pairs, or sum of max incoming/outgoing distinct degree and required multiplicity over symbols exceeds q. These are necessary because the key's cyclic word has precisely q symbols and q transitions. For remaining candidates, fix the longest fragment at phase zero (rotation symmetry), then exhaustively join all compatible placements of every nonredundant fragment, preserving partial assignments. No completion of unconstrained slots is required to establish compatibility. The script has an explicit 100,000-state stop rather than silently truncating; no case here reaches it.

## Controls

Six independent planted random keys per period encrypt the real native KOAN or LOSS section, each word with an independent random phase. All 12 planted cycles recovered exactly modulo rotation among the complete candidates. The six q8 runs each yield one complete key, q13 yields 2–8. Decoding the first 150 runes after a matching anchor using the recovered true key gives 94.7–99.3% accuracy, aggregate 1743/1800 runes (see raw JSON for exact individual rates). This is a recovery-membership and known-correct-key continuation check: the entire control section was scanned for cribs and the correct candidate is selected using the planted truth, so it is not a blind candidate-selection holdout.

## Original

For each of the nine visual chapters, scan all possible starts (including inside printed groups and across internal page boundaries), giving 76,071 start/crib pairs per period. **Every alignment fails the exact cyclic-cover lower bound at both periods.** No complete or partial key is compatible, no candidate joins needed. This excludes the six exact reused phrases under the specified independent word-phase additive model. It is not a general periodic-key rejection, an exclusion of unknown plaintext, or evidence that the author intended these formulas as cribs.

Reproduction: [script](../sims/lp2_latent_independent_source_crib_sft.cjs), `node sims/lp2_latent_independent_source_crib_sft.cjs 8 original` or 13. Control selectors 0–5. [Controls](lp2-latent-independent-source-crib-controls.json), [q8](lp2-latent-independent-source-crib-q8.json), [q13](lp2-latent-independent-source-crib-q13.json). Computations executed in connector JavaScript against repository source bytes; separate Node CLI/CI execution not claimed.
