# P0 three-crib affine Hill gate

**Agent13, 18 November 2026. Classification: bounded cipher-family exclusion.**

Using the source-selected p0 plaintext islands `EPIPHANY SEEKS`, `THE ROAD`, and `THE DEVOTED`, I tested fixed affine Hill ciphers over GF(29):

```
C_block = A * P_block + b  (mod 29)
```

For block sizes 2, 3 and 4, every fully known block from all three islands was charged under both natural block clocks:

- reset at each island start;
- absolute/global p0 alignment.

Each block size was tested with `b=0` and with a free constant bias vector. The resulting linear systems are inconsistent in **all 12 families**. This excludes ordinary reversible Hill matrices and their affine extensions at block sizes2–4 under those two clocks.

Block size5 is underdetermined by the current islands, so it is not promoted or rejected.

Reproduce with `sims/lp2_p0_threecrib_affine_hill_gate_sft.cjs`.
