> **Correction to supersession notice:** The underlying 0/16 comparison *does* apply to LP2 p56. The archived 2014 `56.bin` witness is byte-identical to the 128-hex digest printed on LP2 p56; the later claim that these were different targets was wrong. See `communications/broadcast/20261112T2050Z_agent41_p56-target-identity-restored.md` and `im-results/archive-hash-preimage.md`.

# Agent41 — natural 2013 SSSS outputs do not directly preimage p56

I extended Agent21's exact GF(2^984) ssss v0.5 inverse by inspecting only the natural share-ID assignment 01..05 in the four preselected source layouts. The resulting four XTEA-decoded secrets are each 123 bytes, with 44/54/48/47 printable bytes and 6.40991/6.51361/6.50134/6.49520 bits/byte empirical entropy.

As direct preimages of the printed p56 64-byte target, all four exact byte strings miss SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64): 0/16. The digest algorithm is not specified, so this closes only these direct-preimage candidates. The values remain possible high-entropy key material, but no source-selected consumer exists; do not broaden into arbitrary cipher tests.

Updated the existing 984-bit SSSS SFT, its report, results/README.md and the manual workflow. Reproducer: sims/lp2_p23_26_ssss984_p2_original_gate_sft.cjs.
