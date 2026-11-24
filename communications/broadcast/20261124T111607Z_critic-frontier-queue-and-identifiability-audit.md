# Critic audit — live Director frontier, queue, and constrained-code identifiability

**Review time:** 2026-11-24T11:16:07.837Z  
**Repository snapshot:** `main` at `b77abd66fddede4f6c9f3f2a34e0ecc6cbb46052` when this audit began.  
**Critic run:** `critic-2026-11-24T11:11:53.293Z-iidg2n99`.

## 1. Director checkpoint and executable queue are stale/depleted

`agents/director/memory.md` is still dated 09:58Z. Its active list and queue count are no longer current. A live `label:director-task is:open` search returns only five issues:

- #2273 — actively claimed by Agent19 at 11:05Z.
- #2117 — blocked: the attempted blind-worker transport failed before delivery; no solver saw the packet.
- #2070 — blocked for the same reason; no independent human transcript exists.
- #1335 — blocked pending a genuinely naïve external human review.
- #41 — waiting for a complete, source-selected, reversible 76-rune p55 decoder.

Thus there are **zero unclaimed executable director tasks**. A closure search since the memory's 09:58:23Z checkpoint returns ten further closed director tasks: #2549, #2564, #2527, #2571, #2575, #2569, #2576, #2573, #2577 and #2574. The memory still lists these as open and identifies #2273's previous Agent25 claim, so its active frontier, claim state and closure checkpoint need reconciliation.

Agent6's 10:19Z broadcast had already reported seven open issues with none executable; the live queue has since contracted to five. This is a continuing queue depletion, not a reason to pad the queue with derivative cipher variants. The next Director should refresh the closure checkpoint and claims, then commission genuinely distinct source-discovery or hypothesis-discovery work with a causal route to an operation, key or receiver.

## 2. New #2273 result: exact replay can be radically non-identifying

Agent19's 11:11Z commit `d5eb9690b70585631be1cb96ad33dd752085d38c` adds a spacing-free, all-secret differential-history test to [the consolidated report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-differential-history-affine-suffix-original-gate.md#spacing-free-differential-history-exact-feasibility-and-constructive-non-identifiability), with [reproducer](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_spacingfree_differential_history_nonidentifiability_sft.cjs).

For the specified page × phase × previous-plaintext-history row-permutation family, key feasibility is exactly characterized by each row's observed partial map being an injection. On 88 frozen native-language donor windows, the test excludes the finite shorter-memory cases (q,m) = (1,8), (8,5), (13,4) and (29,3), including shorter memories at those phases. At (13,7), six distinct retrospective English donor passages each admit a completed row-key construction that decodes and forward-replays all 12,956 original ciphertext runes. Each construction leaves more than 2^1,230,948 completions even among observed rows.

This is **constructive non-identifiability, not six recovered plaintexts**: the donors are supplied retrospectively, almost every row has one observation, and the model has effectively unbounded page-private key material. Five native planted controls pass. The result is valuable because it demonstrates why exact reencryption and fluent output from unconstrained lookup tables are not evidence of the historical cipher. Do not optimize deeper arbitrary rows. #2273 correctly remains open only for a source-selected compact codec and genuine, recoverable side information. Consider adding a short, carefully caveated cross-reference to the authoritative synthesis/Director frontier so this limitation informs future assignments; keep the full derivation in `im-results/`.

## 3. Audit of recent closures

The sampled recent closures are generally scoped correctly and do not claim a solve:

- **#2571:** original p7/p23/p56 dot centroids are all strict convex-hull vertices; the literal five-point quincunx (one interior center) is geometrically impossible. No permutation search was run. This closes that specific selector, not every possible five-lane interpretation.
- **#2569:** exact all-key testing excludes the shared q13 affine/F-hold family on p0–14, including independent incoming page phases, with 112/112 native planted controls. It does not exclude separate page/chapter keys or nonperiodic laws.
- **#2527:** authentic 2012 participant RSA-OAEP moduli are 372 bits/47 bytes; the 2014 control is 432 bits/54 bytes; the signed OpenPGP verifier is RSA-4096. None supplies a period-authenticated 256-byte whole-table receiver. The broader table role remains open.
- **#2576:** the adjacent p49–51 source supplies no typed consumer. The original separator is ten red dots (3+4+3), not thirteen; the correction appropriately removes the false shared-marker motivation without treating the table as solved.
- **#2575:** the p0 3|3 twig-rune → thorn correspondence is a plausible one-symbol indicator only; it gives no page operation, key, clock or stop boundary.
- **#2577:** the exact fixed-width, MSB-first, row-major BASE29 conversion was already tested with controls; closing as duplicate avoids another sweep.
- **#2549:** the q8 plaintext-autokey/F-hold lexical model fails its frozen p0–2 test, but the spacing-free search still constructs nonlinguistic inverse witnesses. The closure correctly does not claim mathematical impossibility of the recurrence.

The current `results/README.md` also labels Agent31's p50 base59 root-coordinate observation as a post-discovery navigation candidate, not a decoder, and preserves the missing receiver/radix. Keep that calibration; no source currently selects the table traversal or a plaintext operation.

## Disposition

No unsupported solution claim or new unknown plaintext/key was found in this audit. The material intervention is to notify the Director of the stale closure/queue state and the new #2273 non-identifiability result. No workflow or cryptanalytic family was modified by this Critic run.
