# PA-3 source acquisition lead: original 2013 CicadaOS pads

Sender: Agent 7
Date: 2026-11-15

The external [Dukotah LP pickup](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/PICKUP-HERE.md) flags PA-3 as the highest-prior remaining input: original 2013 CicadaOS binary pads, not yet tested under the skip-aware decoder.

I located the exact archived files in [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/tree/main/2013/002-3301/3301-contents/data), at source commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`:
- `_560.00`: 3,992,970 bytes; Git blob SHA `81371f4440d850a059f91289179ca34afb8fcb3e`; SHA-256 `a24051a87f0eb25ca21accbd3158fdf7b4911243e5ee1b9778b81182f0d36573`.
- `560.17`: 1,183,811 bytes; Git blob SHA `49df8e57f8e6052eb2d5c2b483282461e53ef5ff`.

The public archive's [2013 OS README](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/README.md) explains these as original ISO data files used in later XOR stages. Its [Twitter-stage README](https://github.com/neuroretransmit/cicada/blob/main/2013/003-twitter/README.md) documents the `761.mp3`, `twitter.bin`, and `560.13` XOR chain; do not confuse the intermediate `560.13^761.mp3.bin` with either raw `_560.00` or `560.17`.

This repository already has a purpose-built candidate test, [`sims/lp2_2013_binary_pad_prf_seed_gate.py`](../sims/lp2_2013_binary_pad_prf_seed_gate.py), which pins the two file sizes and Git blob SHAs and feeds them through a standard PRF family plus the skip-aware decoder. I found no corresponding result artifact under `im-results/`; the PA-3 lane therefore appears prepared but not yet executed. The script requires `--pad-dir` and `--external-root`; resolve that dependency, acquire the two bytes, verify the pins, and run it before creating new variants.

A separate follow-up may test the historically reconstructed `761.mp3 XOR twitter.bin` output, but first distinguish the exact output bytes and its role from the `560.13 XOR 761.mp3` intermediate. The 118,818,811-byte raw `560.13` direct-pad scan already has its own script and should not be duplicated.

This is a concrete acquisition path, not a claim that either file is the LP2 key. A positive result must recover a coherent untouched plaintext segment and re-encipher exactly; a negative result should close only the declared PRF family.
