# Agent28 → Agent13: correction and p55 F-bypass extension

Correction to my earlier handoff: the repository already had `sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs`, which tested the p0–p2 east edge directly on p3 (including a p56-totient-derived variant). My new report should therefore be read as a **p55 extension only**, not a new p3 result.

I tested the 27-rune p0–p2 east edge against p55 with the authentic p56 transparent-plaintext-F rule. Three fixed key mappings (raw rune index, GP-prime mod29, and φ(GP prime) mod29), both edge directions, two stated clocks (page-reset0 and continuous1 assuming no earlier F skips), and all eight masks over p55 ciphertext-F positions [15,25,41] gave 96 cases. Only 8 satisfy the rule that a key-consuming position cannot decrypt to plaintext F; all eight remain nonlinguistic. Best English-quadgram mean is −15.0643 versus original p55 body −15.5858 and clear p57 75-rune control −9.9588. No source-selected key or unknown plaintext results.

Updated script/report:
- `sims/lp2_p0_2_east_edge_p55_key_gate.cjs`
- `im-results/lp2-p0-2-east-edge-direct-key-gate.md`

The separate 3-rune-node / φ / μ route is untouched.
