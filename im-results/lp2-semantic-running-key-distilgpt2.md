# Pretrained semantic running-key discrimination — executed decision

**Decision — 26 November 2026:** The fixed-candidate semantic rank gate passes 6/6, but actual ciphertext-only recovery remains 0/6 exact P/K pairs (425/599→493/599 runes). The #3019 symmetric K-boundary audit gives authentic and rival pairs identical boundary-search freedom; the authentic pair wins only 3/6, and the same three rival-over-truth cases remain. The comparator asymmetry is insufficient to rescue the fixed objective. No original LP2 ciphertext scored. Retire this semantic objective/search for original direct running-key inference.

Director #2656 tests whether a long-context model ranks paired native plaintext and natural-language key above wrong exact-replay pairs. Unknown LP2 ciphertext is not scored in this stage.

- Fixed model: [DistilGPT2](https://huggingface.co/distilbert/distilgpt2/tree/f241065e938b44ac52db2c5de82c8bd2fafc76d0), CPU, safetensors, Transformers 4.49.0, PyTorch 2.6.0.
- Control generator derived from the existing role-context SFT blob 7e1599ace9a79025b3ae5ef7379f0b641a5f31d2, preserving training, GP29, no-F additive law, word-boundary and beam rules. New LOSS and Gibran windows are excluded from the n-gram training corpora; pretrained-model corpus exclusion cannot be guaranteed for public-domain works. This is a calibration limitation.
- Fixed rendering: lowercase canonical GP29 transliteration, actual P word boundaries and independent inferred K boundaries; no spelling repair or EOS. Score sum of autoregressive token log probabilities of P and K including beginning-of-text, divided by original rune count.
- Gate: true pair must beat both wrong beams on at least five of six fresh controls; no uniform-pad result may meet the lowest true-pair score. If pass, independent ciphertext-only search and heldout recovery are still required. If fail, retire this scorer under the exact rendering/controls; no original inference.
- SFTs: `sims/lp2_semantic_running_key_controls_sft.cjs`, `sims/lp2_semantic_running_key_distilgpt2_sft.py`. Existing manual Python runner extended with isolated CPU-model job.

## Executed rank gate (25 November 2026)

[Run 45536341040](https://github.com/FlareZ123/liber-primus/actions/runs/45536341040), artifact 14987148780, source commit 608bdf05a218a415fe6fb6a505e5241acc72cdab. All scores are joint nats per original rune (larger is better).

| Control | Runes | True | Wrong 4-gram | Wrong 6-gram | Uniform-pad candidate |
| --- | ---: | ---: | ---: | ---: | ---: |
| LOSS-A | 102 | -4.389912 | -5.285800 | -5.161434 | -6.073362 |
| LOSS-B | 102 | -3.629962 | -5.335529 | -4.928474 | -6.074141 |
| LOSS-C | 97 | -4.161423 | -5.407739 | -5.376733 | -6.085413 |
| GIBRAN-C | 96 | -3.734186 | -4.484140 | -4.378577 | -5.855748 |
| GIBRAN-D | 98 | -4.067075 | -5.387353 | -4.845882 | -5.509839 |
| GIBRAN-E | 97 | -3.594050 | -5.615495 | -5.625189 | -5.895146 |

**Rank gate passed 6/6; uniform false positives 0/6.** Minimum margin over the best wrong pair 0.644390 nats/rune; worst true -4.389912 vs best uniform -5.509839. This establishes candidate discrimination against the sampled alternatives, not blind recovery or a calibrated probability for all possible keys. DistilGPT2 pretraining may contain public-domain passages. The next gate must recover actual hidden P/K runes from fresh ciphertext-only controls with no access to the truth during search. Unknown LP2 remains unscored; no authentic new plaintext or key.

## Stage two: actual ciphertext-only semantic search (frozen after rank gate)

The prior beam's complete candidate ranking does not recover a key by itself. Start from its mode-1 width-128 decode; for each overlapping block, use a width-384 exact-replay n-gram proposal beam with fixed outside P/K state, six-rune right lookahead and free K word boundaries inside the block. Keep top 12 proposals plus up to 12 additional distinct five-rune/segmentation prefixes. Select a patch only if it improves the unchanged full-sequence DistilGPT2 joint score. Three fixed sweeps: 18/9 forward, 24/12 reverse, 12/6 forward (window/stride). No truth passed to the search function. Exact replay of every proposal is required.

Fresh controls: disjoint LOSS words 109–138 and 145–167, plus Gibran word starts 6000/7000/8000/9000, each at least 96 runes. New unrelated held-out Shakespeare/Emerson key windows at respective 65%-split offsets 4600/5400/6200; fixed independent uniform negatives. Neither the stage-one nor old #2598 control text is reused. All sources are outside n-gram training, but pretrained exposure remains possible. The same three-sweep search runs on positives and negatives.

Frozen second-stage gate: at least two of six **full exact rune pairs**, pooled rune accuracy ≥10 percentage points above the unchanged mode-1 baseline, and no uniform result at or above the minimum true-pair semantic score. Report key-boundary accuracy separately. If any criterion fails, do not score original LP2. If it passes, the original interval and independent continuation still need a separately frozen decision. No attempt to infer unseen key material from a prefix without using ciphertext is implied by these constructed blind tests.

SFT: `sims/lp2_semantic_running_key_recovery_sft.py`; exact proposal server: `sims/lp2_semantic_running_key_recovery_server.cjs`. The existing manual Python runner dispatches six independent cases in parallel to keep runtimes bounded. ### Executed stage-two results

[Run 45536706261](https://github.com/FlareZ123/liber-primus/actions/runs/45536706261), source commit 38ab768bc6c80cb68d927cbf2711cf1fd5633313. All six artifact results downloaded and summarized in [executed values](lp2-semantic-running-key-distilgpt2-recovery-summary.json).

| Control | Runes | Baseline correct | Final correct | True score | Final score | Uniform final |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| LOSS-D | 102 | 55 | 77 | -4.344361 | -4.130474 | -5.293666 |
| LOSS-E | 103 | 67 | 76 | -3.617244 | -4.226774 | -5.215554 |
| GIBRAN-F | 102 | 81 | 95 | -4.067862 | -4.062598 | -5.255409 |
| GIBRAN-G | 97 | 73 | 79 | -3.389541 | -3.839098 | -5.209828 |
| GIBRAN-H | 97 | 67 | 80 | -4.289232 | -4.467898 | -5.279035 |
| GIBRAN-I | 98 | 82 | 86 | -3.777223 | -3.741536 | -5.301015 |

- **Accuracy gate:** 425/599 → 493/599 (+11.35 percentage points), passes.
- **Exact pair gate:** 0/6 full P/K rune pairs, 0/6 exact K boundary tapes, fails.
- **Uniform-pad gate:** 0/6 false positives, worst true -4.344361 vs best uniform -5.209828, passes.
- **Objective misranking persists:** LOSS-D, GIBRAN-F and GIBRAN-I all have incorrect optimized candidates above their exact true pair's score. This is not solely a search-pruning problem; improving the optimizer can worsen the mismatch. Other three cases could still be search-limited.

Both streams obey C=P+K mod29 and the unchanged printed P lengths; all candidate updates forward-replay. Partial recovery is a useful improvement, not a demonstration of full key recovery. DistilGPT2's pretraining may contain literary controls, and the rendering is lossy for some GP spellings. The existing independent [manuscript-wide doublet gate](lp2-runningkey-native-doublet-gate.md) is also adverse to the direct independent literary running-key architecture itself (404–533 repeats in additive plants versus 86 original). No original p54–55 scoring is authorized by this failed conjunctive gate. A future source-selected anti-repeat layer, dependent key, or independently constrained inverse would constitute a different premise; simply tuning this semantic search does not.

## Symmetric K-boundary comparator audit (26 November 2026; Director Issue #3019)

The Critic identified a real comparison asymmetry in the stage-two evaluation: the authentic P/K pair was scored with its original key-word boundaries, while each competing proposal could optimize K boundaries. This audit gives both sides the same boundary freedom without changing the DistilGPT2 model, rune pair, plaintext word-length tape, ciphertext or cipher family.

For each of the six saved controls, the true pair and the prior stage-two final rival were separately profiled. Only the K boundary tape varied; every position after the first was eligible. Both received the same bounded search: general-GP 5-gram proposal beam width 384, six-rune right lookahead, at most 24 candidates per window (top 12 plus up to 12 additional distinct first-eight-boundary patterns), and the original three coordinate sweeps (18/9 forward, 24/12 reverse, 12/6 forward). DistilGPT2 scored the full rendered P/K pair; every returned pair was checked against exact C=P+K mod29 replay. The model and revision remained unchanged.

**Rival-minus-true score gaps (nats per original rune):** positive means the rival scores higher; negative means the authentic pair scores higher.

| Control | Before profile | After equal profile | Winner after profile |
| --- | ---: | ---: | --- |
| LOSS-D | +0.213886 | +0.232062 | Rival |
| LOSS-E | −0.609530 | −0.580591 | Authentic |
| GIBRAN-F | +0.005264 | +0.000316 | Rival |
| GIBRAN-G | −0.449560 | −0.449560 | Authentic |
| GIBRAN-H | −0.178669 | −0.179471 | Authentic |
| GIBRAN-I | +0.035688 | +0.035688 | Rival |

**No ranking changed.** The same three cases in which the original recovery selected a rival above truth (LOSS-D, GIBRAN-F, GIBRAN-I) still prefer the rival after equal boundary optimization. GIBRAN-F nearly ties, but the residual gap remains positive. The authentic pair wins 3/6, not the ≥5/6 needed to justify a further recovery gate.

The selected authentic-pair boundary tapes remained close to their actual boundaries:

| Control | Selected / authentic boundaries | Precision | Recall |
| --- | ---: | ---: | ---: |
| LOSS-D | 25 / 24 | 0.960 | 1.000 |
| LOSS-E | 20 / 21 | 1.000 | 0.952 |
| GIBRAN-F | 25 / 25 | 0.920 | 0.920 |
| GIBRAN-G | 27 / 27 | 1.000 | 1.000 |
| GIBRAN-H | 25 / 24 | 0.960 | 1.000 |
| GIBRAN-I | 27 / 27 | 1.000 | 1.000 |

This is a matched-bounds comparator test, **not** a global optimum certificate over all \(2^{n-1}\) K segmentations. The proposal beam and coordinate sweeps are approximate, so a better untested segmentation could still change a score. The bounded result nevertheless rejects the specific claim that the observed three rival wins are explained merely by giving the rival more K-boundary freedom. The fixed semantic objective remains unsuitable for original inference; no original LP2 ciphertext was scored. Do not widen the beam, change the language model, or reopen original scoring without a new source-selected mechanism.

Reproduction: [boundary-profile SFT](../sims/lp2_semantic_running_key_boundary_profile_sft.py), [proposal server](../sims/lp2_semantic_running_key_recovery_server.cjs), [saved-pair input fixture](lp2-semantic-running-key-boundary-profile-inputs.json.gz.b64), and [full output fixture](lp2-semantic-running-key-boundary-profile-output-fixture.json.gz.b64). The decoded input/output JSON SHA-256 values are fd49346669ec90cf52bf12984a398cbc2715eeb5e438af1f78ed713a8c85cde0 and c14f199e41916cc388e01825fea3ec61989bb397abc0f84862d73909101c80e5, respectively. Workflow 45858538867 completed successfully; output artifacts 15136324593, 15137061512, 15136164726, 15137660567, 15135954841 and 15135994727 correspond to LOSS-D, LOSS-E, GIBRAN-F, GIBRAN-G, GIBRAN-H and GIBRAN-I.

