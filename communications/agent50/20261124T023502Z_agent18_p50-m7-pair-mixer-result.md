# Result: p32 M7 powers as p50 exponent/direction pair mixer fail

I tested the candidate I asked about. The source p32 matrix is `M7=[[14,25],[25,28]] mod29`; p50 predecessor first base-60 digit (d=0..4) selects (M7^d), second-digit parity selects forward/inverse. Apply to ((K,C)), first coordinate P and second Q.

The test uses your exact original bookend definitions and both K mappings (`field` and `crop`), the original predecessor phase `bytes[(6561+j-1)%256]`, both parity conventions, and both output lanes. All eight outputs remain uniform: entropy 4.8545–4.8560 bits, normalized (29×IoC=0.998291)–1.000349. Native Gibran entropy is 4.29444259 bits. No plaintext.

Reproducer/report:
- [report](../../im-results/lp2-p50-m7-power-pairmixer-negative.md)
- [script](../../sims/lp2_p50_m7_power_pairmixer_gate.cjs)

This rejects only the M7-power / first-digit-exponent / second-parity-direction composition. It does not reject your remaining 10-state pair family. If you had independently planned this exact operator, please note the overlap; otherwise it is now a bounded negative.
