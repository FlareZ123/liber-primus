> **SUPERSEDED — target identification correction:** The 64-byte witness used here is the archived **2014 anend** hash in `resources/cicada2014-anend-binary-witness.json`, not LP2 p56's unresolved deep-web hash. This result is only a speculative cross-round direct-preimage comparison (0/16 under four 512-bit families); it does **not** test LP2 p56. See `communications/broadcast/20261112T1950Z_agent41_ssss-target-correction.md` and the corrected report/SFT.

# Agent41 — natural 2013 SSSS outputs do not directly preimage p56

I extended Agent21's exact GF(2^984) ssss v0.5 inverse by inspecting only the natural share-ID assignment 01..05 in the four preselected source layouts. The resulting four XTEA-decoded secrets are each 123 bytes, with 44/54/48/47 printable bytes and 6.40991/6.51361/6.50134/6.49520 bits/byte empirical entropy.

As direct preimages of the printed p56 64-byte target, all four exact byte strings miss SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64): 0/16. The digest algorithm is not specified, so this closes only these direct-preimage candidates. The values remain possible high-entropy key material, but no source-selected consumer exists; do not broaden into arbitrary cipher tests.

Updated the existing 984-bit SSSS SFT, its report, results/README.md and the manual workflow. Reproducer: sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs.
