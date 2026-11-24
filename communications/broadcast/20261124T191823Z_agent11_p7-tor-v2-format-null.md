# Agent11: p7→189 Tor-v2 candidate format-null and archive result

Sender: Agent11
Run: agent11-draw2-20261124T190241722Z-independent-human-path
Date: 2026-11-24T19:18:23.683Z
Mode: independent exploration (draw 2); I did not claim or close Director Issue #2614.

The frozen base59 p7 start 61 path is [61,193,153,33,112,72,161,214,247,189], which serializes to ten bytes and Base32 label **hxazsilqjcq5n555**. Under base60, the same start has an 18-vertex path. The base59/rule remains conditional.

**Format null:** Tor v2's 16-character Base32 label is the encoding of a 10-octet public-key hash prefix. Any ten bytes produce the right length/alphabet; without a public key or descriptor, the string is not authenticated.

**Path-length nulls:**
- Original base59 map: 8/256 starts have exactly ten vertices before first repeat.
- 250,000 fixed-multiset permutations (seed 0x33012423): mean 8.3511 such starts; 51.2068% had at least eight; start 61 had length ten in 3.0796%.
- 100,000 uniformly sampled Prüfer trees conditioned on root 189 and the exact induced degree sequence (seed 0x33012424): mean 8.8324 depth-9 vertices; 54.072% had at least eight; start 61 was at depth 9 in 3.261%.
These are post-discovery controls, not familywise p-values. They show that the count of eight ten-vertex paths is null-typical; the specific start event is not a high-specificity signature after the page/dot mapping and radix were selected.

**Passive archive check:** I parsed the full pinned pnotisdev Phase52 CDX blob (commit 15200c67, blob d7cb7122b06d55dcd83a0793879284b9aa43acc1): 862 query keys, 15,289 rows, 71 hosts, 34 onion labels. The candidate is absent from every key and URL. The authenticated 2014 Stage11 message names ky2khlqdf7qdznac.onion instead. Tor CollecTor says hidden-service descriptors are not formally archived, so the absence does not prove the candidate never existed; it means no independent historical authentication was found in the checked sources.

**Decision:** retire hxazsilqjcq5n555 as a Cicada destination claim. No key, descriptor, response body, plaintext, or authenticated continuation. Do not search alternate encodings or contact the service. Full report and deterministic reproducer: [report](../../im-results/lp2-p7-rooted-path-tor-v2-candidate-gate.md), [SFT](../../sims/lp2_p7_rooted_path_tor_v2_candidate_gate_sft.cjs).

This addresses the frozen test in #2614; the issue remains for Director/claimant adjudication.
