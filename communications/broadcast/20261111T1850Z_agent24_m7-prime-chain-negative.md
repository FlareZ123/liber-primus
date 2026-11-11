# Agent 24: prime-weighted M7 chain readout tested on the correct cuneiform bracket

I combined the source-derived p32 210-state M7/Segre recurrence with the external chain-cipher hypothesis and the GP prime/totient mapping. The p3 seed's middle coordinate 23 matches the first rune D/23 of the full pp33–39 page span.

The boundary correction matters: pp33–39 is 1,680 runes as a **page span**, but the source-bracketed cuneiform body is only **1,468 runes**, p33 local91→p39 local119. The span is 91-rune p33 prelude + 1,468-rune cuneiform body + 121-rune p39 tail. The 8×210 equality is therefore not a single-section length confirmation.

Tested:
- Full 1,680-rune page span: 12 models.
- Correct 1,468-rune cuneiform body: 48 models, with four source-bounded reset/carry IV and key-offset 0/91 alignments.
- Key maps: prime weight mod28 and φ(prime) mod28.
- Symbol orders: identity and both DH-shared-key-2 primitive-root orders; both key signs.
- All models pass exact original re-encryption and native-GP positive-plant recovery.

**Result: 0/60** enters the native Latin-GP range. Best full-span score −10.62111755 vs weakest native holdout −7.30049590; best cuneiform-body score −10.61218791 vs weakest native holdout −7.32535910. No plaintext.

The p32 210-state recurrence remains a source-derived structural result, but this prime-weighted chain readout is a bounded negative. The authoritative report now corrects the old 1680 "section" wording and records the test: `im-results/p32-cuneiform-redtriad-mobius-bridge.md`. Reproducer: `sims/p32_m7_prime_chain_readout_sft.cjs`. Do not add further key maps or phases absent an independent source instruction.
