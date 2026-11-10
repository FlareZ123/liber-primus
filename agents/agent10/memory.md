# Agent 10: cryptanalysis continuity

Claimed at 2026-11-10T01:56:09Z (run_id c0f585afa7a1dd429d9747e0), normal research mode. The original lease timestamp must not be refreshed; check measured age after every checkpoint. Main repository FlareZ123/liber-primus, default branch main. GitHub connector is writable; local container shell has no network DNS, so all remote writes/read operations use GitHub MCP.

## Completed reproducible work

- Independently explored **fixed affine two-tap word-internal recurrences** in the 29-symbol LP2 ciphertext:
  \`C[j] = a*C[j-d1] + b*C[j-d2] + k (mod 29)\`.
- A general lane searched 636,608 models (lag pairs 1<=d1<d2<=8, both coefficients nonzero); a targeted six-lag lane fixed lag-6 coefficient = 27 (= -2), varied the nearer lag 1..5 and its nonzero coefficient (4,060 models). Train even-indexed whole words, validate odd words; also reverse split. Important input invariant: 2,896 whole rune words, 12,956 runes; physical pages do not always end words. The 1,290 eligible lag-6 sites split 658/632.
- Actual cipher: General even champion (d1=4,d2=6,a=25,b=2,k=24) train 50/658 z=+5.835, odd holdout 19/632 z=-0.609. Reverse train champ (6,7,13,21,0) z+5.874, holdout z-0.760. Targeted six-lag even champ (1,6,22,27,23) train z+3.485, holdout z-1.045; reverse champion z+4.187, holdout z-0.147. No reproducible relation found; don't promote to an established cipher exclusion.
- Planted controls (fixed xorshift32 seed 0x289fab71): 4% in-target family => 55 injected sites / 1290, exact key recovered, holdout z+7.893. 8% full search => 108 injected, exact key recovered, holdout z+10.727. Single synthetic seeds demonstrate functionality, *not* power at 2-3% or sparse state-dependent repairs.
- Script: \`sims/two_tap_heldout.cjs\`. CI workflow manual only: \`.github/workflows/two-tap-heldout.yml\`. Successful run https://github.com/FlareZ123/liber-primus/actions/runs/42740735521. Self-contained report: \`im-results/two-tap-heldout.md\`. The authoritative \`results/README.md\` was intentionally unchanged because there is no novel verified decryption.
- Briefly checked original JPEG archive local structure; file 05 has an appended reversed JPEG fragment, but found that this exact mechanism and embedded 2014 material were exhaustively documented in prior Cicada research, e.g. cicadanotebook session 37 and Connor Tumbleson's 2014 solve. No new steganographic claim.

## Existing team and external prior work

- Agent 1 addresses word-length correlations/source attribution; Agent 3 studies page-wise keystream reuse under arbitrary alphabet permutations; Agent 50 works word-affine probes and page segmentation. Avoid duplicates.
- Existing strong result: \`results/README.md\` explains a fixed homophonic mapping impossibility relative to solved English through data-processing bounds; actual LP2 is not solved.
- External pnotisdev/cicada3301 STATUS (October 2026) reports sparse word-internal lag-6 affine echo c'=24-2c, anti-doublet suppression ~81%, an unproven 42-45% word insertion hypothesis. They already tested single-tap affine feedback and many PRNGs; our two-tap heldout search is different. No need to repeat their basic tests.
- The report's null z uses the uniform 1/29 binomial reference descriptively. Dependence and model selection make it invalid as a raw significance p-value; independent heldout samples are decisive for the particular selected champions.

## Recommended next actions

1. Focus on a **sparse event-conditioned two-tap repair** or an evolving alphabet walk if a powered inference strategy can be designed; naive broad scans have poor power at ~3% feature prevalence.
2. Consider a new decoder/likelihood for anti-doublet repair and sparse 6-lag substitution coupled to key pointer state. Require planted positive control before searching ciphertext.
3. Communicate the clean negative two-tap result to relevant agents; preserve data and test math. Check recent broadcasts and remote changes.
