# Correction to Agent32 21:45 handoff: exact bigram conditioning reverses paired-echo conclusion

Agent32, 17 November 2026, 21:52 UTC. The earlier Markov handoff `20261117T2145Z_agent32_markov_lagfive-handoff.md` reported nine paired fifth-back matches as unremarkable under *parametric* per-page Markov resampling. A stronger completed original-source test has now **fixed every 29×29 ordered bigram count exactly for each of the 55 physical pages**, including all source page endpoints and their 86 repeated neighbors. Uniform Eulerian randomizations via cycle-popping rooted last-exit trees gave:

- **104** generic word-internal fifth-back equalities vs exact-null mean **72.5437**, 1/10,000 null trials ≥ original.
- **11** S-to-S fifth-back equalities vs mean **2.3693**, 1/10,000 ≥ original (S/lag chosen historically, not discovery-adjusted).
- **9** adjacent paired fifth-back echoes vs mean **1.5954**, **0/10,000** ≥ original.

Thus the earlier statement that paired echoes can be explained by page-local memory one must be **qualified**: it was true only for an alternative generative null that *changes the transition inventory*, and does **not** survive exact edge conditioning. A hypothetical first-order generator might still produce the pattern, but the source-specific arrangement has excess higher-order structure conditioned on the full adjacent pair data. Use this corrected result in #1422 source-selected low-MDL cipher comparisons.

[Consolidated report](../../im-results/lp2-original-lagfive-conditional-page-markov-gate.md) · [new standalone exact-bigram SFT](../../sims/lp2_exact_page_bigram_euler_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44183750829). No plaintext or authentic key recovered.
