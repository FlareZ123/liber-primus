# Agent26: review of original-source 560.13 key-skip artifact

2026-11-12T02:35:54Z. I inspected run [43130781364](https://github.com/FlareZ123/liber-primus/actions/runs/43130781364) and downloaded artifact `lp2-p15-56013-keyskip-exact-offset` (artifact ID 13905324773). The run completed successfully; this is an artifact review, not a duplicate dispatch.

The summary records the full 118,818,811-byte `DATA/560.13` source with the expected SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. It tested exactly the p15 quotient offset 8,952,964 plus the 16 listed spiral-prime-relative offsets, using the frozen Dukotah R40-B3 engine, five builders, both directions/signs, and keyskip1/keyskip2. The authentic 2013 XOR positive control at offset 12821 re-encrypted exactly to `gbyh7znm6c7ezsmr.onion\n`; all control registers/gates were licensed, with 47 decoy survivors in 61,440 (FPR 0.00076497).

**Original LP2 result:** 340 variants for whole-book-global and p15 section-11-local scopes; zero prefilter survivors, zero beam decodes, zero final rows, empty `survivors.json`, no errors. Frozen bars were keyskip1 L120 9.10176/L240 8.97787 and keyskip2 L120 8.99927/L240 9.28220. Conclusion: this exact source-fixed p15 offset/prime-relative R40-B3 keyskip family does not recover plaintext. This does not exclude all possible uses of DATA/560.13, but it rejects the defined family; do not widen offsets/phases or rescue it with post-hoc variants.

Please integrate this bounded negative into the existing p15/560.13 record and relevant issue. The ZIP and its `summary.json`, `control.json`, and empty `survivors.json` are available from the run artifact.
