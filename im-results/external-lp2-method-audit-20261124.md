# External LP2 attack audit — 24 November 2026

**Decision:** no materially new external method found that currently satisfies the requirement for a source-constrained, executable original-cipher recovery. The strongest claimed plaintext method (the 27×27 three-rune-node route) is already substantially represented and challenged in this repository. The strongest distinct decoder (word-constrained filler Viterbi) has a real implementation and positive synthetic controls, but its published full-page search has no readable page result, and its defining one-filler-per-printed-word rule has no first-party selector. The remaining surveyed repositories contribute statistical constraints or variants already represented locally, not a new key/state recovery route.

This is an audit of a bounded set of public projects and specific files, not a claim that all external research has been exhausted.

## 1. 27×27 three-rune-node / totient–Möbius route

**External source:** [2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption), main commit 3c7921629065a4688aae02403b14c8eb6e12e3d6.

The November update advertises a C++ decoder, 87,115 admissible starting states, 192 ranked readings, and a 39-block / 118-rune route ending in DIE. Its README states that the decoder uses the 27×27 grid, three-rune nodes, totient/Möbius operations, repeated-key subtraction, Reports 00–27, and an English-frequency dictionary. It also states that the exact next location remains open. The C++ ZIP is 495,402 bytes (Git blob SHA-1 d158b5edb5c34366d7b3c9e42e72b2f7d4d4d5f6); it was not executed in this runtime.

This is not a new cipher family relative to the local record. The repository already contains:
- lp2-2026-public-27x27-claim-original-replay.md;
- lp2-2026-external-27x27-original-opening-route-null.md;
- lp2-external-27x27-three-rune-heldout-audit.md;
- lp2-2026-27x27-103cell-claimed-plaintext-source-gate.md;
- lp2-27x27-published-nextblock-branching.md;
- lp2_202611_external_27x27_decoder_static_sft.cjs.

The local next-block analysis already reconstructs the 39th-block ambiguity: 52 distinct next-word candidates survive the tested constraints, with competing 39-block readings including DIE and WINGING. The 27×27 method produces a sparse selected route, not a complete page plaintext; the final word is selected through dictionary ranking and an additional numerical interpretation, while the next location remains unspecified. The C++ port's larger search count and faster implementation do not add an independently sourced key, a unique receiver, or a held-out continuation. Do not reopen the same route as a new external attack.

## 2. Word-constrained filler Viterbi

**External source:** [RiskAverseTech/cicada-ioc](https://github.com/RiskAverseTech/cicada-ioc), main commit f186aec6b3f8129c0e42080d28f29ca29797abb0.

Files inspected: src/wc_decode.py, src/wc_lane.py, src/e56w_n_lane.py, src/e56w_predictions.py, src/e56w_r4n_predictions.py, results/wc_lane.md, results/e56w_n.md, results/README.md, and the top-level README sections describing the model and controls.

This is the closest distinct executable decoder. wc_decode.py tracks a key-offset state and a per-printed-word filler-used flag, permits at most one unkeyed filler per word, handles literal-F transparency, and models key advancement when a draw would create an adjacent ciphertext repeat. wc_lane.py searches three key libraries:
- 7,621 book-derived Vigenère keys, three sign conventions, and two F variants;
- prime streams p[n+s], p[n+s]−1, p[n+s]+1 for 20,000 offsets, three signs, and two F variants;
- sixteen external running texts.

The published full-page report records 31,363,746 decodes:
- book library: 2,514,930 tests, maximum z=3.97, no survivors;
- prime library: 19,800,000 tests, maximum z=6.04, one statistical survivor on p43, but no readable candidate;
- text library: 9,048,816 tests, maximum z=5.93, no survivors;
- total: one survivor, zero plaintext candidates.

The report records 6/6 synthetic controls and the related generator's 30/30 planted controls. Those controls establish power on the planted model, not on LP2. The p43 survivor is explicitly unreadable; a high z-score is not a decryption.

The related E56w+R4n mechanism is a generative/statistical model with a soft repeat-avoiding feedback rule, lag-5 and lag-6 echoes, and fillers. It passes held-out statistical predictions and produces short plant-like fragments, not a page. The decoder wc_lane.py is not the full two-echo mechanism: it is a word-constrained filler/skip decoder over a broad key library.

This is a genuine algorithmic variant not found verbatim in local filenames, but it is not presently a source-constrained attack. The one-filler-per-printed-word state is an extra mechanism parameter, not an instruction recovered from LP2 or a signed Cicada source. The key library is broad rather than selected by a specific first-party clue. The external run already reports no page-level recovery after tens of millions of decodes. The local repository separately contains extensive lag-5/lag-6, echo, adjacent-repeat, null-mask, and source-key tests; importing this model without a new clue would add another fitted channel degree of freedom rather than a new path to plaintext.

**Disposition:** retain as a documented external reference, but do not import as a new attack until a first-party source selects the one-filler-per-word rule or supplies a key/seed that makes the decoder's state recoverable.

## 3. Other bounded external repositories

| Repository / pinned head | Specific material inspected | Assessment |
|---|---|---|
| [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301), 4aba42eeafc7434cec49041d5095bc843e23e964 | AGENTS.md, PICKUP-HERE.md, Round 19 derived-key results, Round 24 skip-by-two results, Round 45 campaign plan and synthesis | The skip_by_two transition is the same key-pointer rejection relation already implemented in sims/grid_keyskip2_viterbi.cjs. The current T7 nonstationary doublet observation and printed-space/word-order analysis are statistical constraints, not key recovery. |
| [pnotisdev/cicada3301](https://github.com/pnotisdev/cicada3301), 15200c67abee106913ba01ff504c5b6e88d16cc7 | PLAN.md and STATUS.md, including channel-screen and word-edge insertion lanes | The channel-screen/filler variants are useful model screens but rely on word-edge assumptions and do not produce a complete page plaintext or a source-selected key. |
| [Leo-Y-Zhang/LiberPrimusAnalysis](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis), 0b907164e95e3a44ee74c1d28efbf4688b770865 | README.md and listed scripts/data | Chain-cipher, Pi-stream, lag, and frequency investigations are statistical/family screens; no reproducible key or plaintext recovery is reported. |
| [ZzNible/cicada3301-liber-primus-findings](https://github.com/ZzNible/cicada3301-liber-primus-findings), e0e77e99e8736082f7808e382f36225e0ef6f646 | README and repository summary | Reports a conditional lag-5 signal but no executable plaintext recovery or key/state source. Local work already has extensive lag-5 and lag-6 tests. |

Web discovery also surfaced a public 27×27 claim and recent T7/lag-5 summaries; these resolve to the repositories above. No additional independently specified key source or complete plaintext mechanism emerged from this bounded search.

## Decision

No method was imported as a new original-cipher recovery:

1. The 27×27 C++ decoder is a faster implementation of a family already replayed and branched locally; its selected 39-block route lacks a unique held-out continuation.
2. The word-constrained filler Viterbi is the strongest distinct decoder, but its per-word filler rule is not source-selected and its own 31.36-million-decode result has zero readable page candidates.
3. The remaining external work is statistical evidence, model screening, or a duplicate of existing local families.

The exact missing dependency for a worthwhile next integration is either (a) a first-party clue that fixes a nonstandard channel rule such as one filler per printed word, or (b) an authenticated key/seed source and state initialization that turns one of these decoders into a deterministic, falsifiable original-cipher attack. Until then, importing another broad key library or dictionary-ranked route would not meet the project's causal-path-to-plaintext standard.

No change to results/README.md is warranted: no new plaintext, key, or cryptographic mechanism has been established.
