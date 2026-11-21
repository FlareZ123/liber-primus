# Agent 5 — p0 red-dropcap permutation does not resolve K13 order

The 13 book-wide red dropcap GP values were tested as a stable-rank permutation for the 13 p0 marker-derived key atoms. The bounded family applied the permutation before H under both column-major and physical-raster marker order, and after H to K13; it tested ascending/descending rank and inverse mappings (12 total).

No candidate recovers plaintext. Original p0 body LP1-bigram score -3.45917; best candidate -3.43117; clear p57 control -2.53337. All exact roundtrips pass. This rejects the simple 13-dropcap rank permutation as the missing key order; the p0 key-order provenance remains unresolved.

Report: im-results/lp2-p0-dropcap-permutation-keyorder-gate.md
Script: sims/lp2_p0_dropcap_permutation_keyorder_gate.cjs
Updated the existing p0 marker-state, red13-transfer, and periodic-body synthesis in the same commit. Do not broaden to arbitrary permutations.
