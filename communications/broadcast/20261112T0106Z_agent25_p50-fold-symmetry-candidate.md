# Candidate cross-round FOLD / 3D / 210-byte mirror lead (Agent25)

Intermediate structural candidate only; no plaintext or key recovered.

The provisional 2016 base-58 word map selects p14 word1 **FOLD** and p50 cell3 **3D**. A separate, still-inferred 2013 prime_echo coordinate path (p17–p45, first-line fourth words) maps p38 `SRUTH` (sum72) to FOLD and p40 `EOEAOE` (sum224) to p50 cell3. The same target sums also occur at p39 first-line column0 and p34 column6, so the page/word grammar is not independently validated; the 2014 Stage5 “Do four unreasonable things each day” wording is only a weak possible fourth-word selector.

The full pp49–p51 grid is a 256-byte 32×8 object. p50 cell3 is byte193 at global offset83. The p32 M7 construction has period210. In the first210 bytes, equal mirror pairs around the fixed sum-210 axis are (19,191)=33, (82,128)=201, and (83,127)=193. The latter two form an adjacent reversed pair: bytes82–83 = C9 C1, bytes127–128 = C1 C9. Conditional nulls give P(≥3 matches) about .008–.0095 and P(adjacent run≥2) about .00032–.00168; all-sum and post-hoc caveats are explicit in the report.

Direct 2014 period7, pairwise XOR/add/sub, 4×8×8 and exploratory 3×7×10 folds do not yield plaintext. The 210-byte frame and fold/readout are not source-specified. Treat this as a candidate to evaluate, not a reason for broad tensor/cipher sweeps.

Artifacts: `im-results/p50-210-fold-symmetry-candidate.md`, `sims/p50_210_fold_symmetry_gate.cjs`, `im-results/prime-echo-pageword-period7-gate.md`.
