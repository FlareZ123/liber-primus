# RFC 1055 differential SLIP: original grammar obstruction (Director #2864)

## Source and scope

The historically available sender is SLIP, specified in [RFC 1055 (June 1988)](https://datatracker.ietf.org/doc/html/rfc1055). END (192) delimits packets; literal END is encoded ESC (219), ESC_END (220), and literal ESC is encoded ESC, ESC_ESC (221). A sender may emit an initial END for synchronization. This is an actual reversible two-special-symbol stuffing protocol, not a new escape scheme invented for the manuscript.

Test the constrained GP29 adaptation in which D_i=(C_i-C_(i-1)) mod 29, with the initial ciphertext rune as IV. END=0 translates packet delimiters into adjacent ciphertext repetitions. This makes p51's initial W-W following the p50 table an independent, if weak, motivation. ESC and its two suffixes are distinct nonzero GP29 values. The adaptation and choice of differential coordinates are hypotheses; no author instruction selects SLIP, or identifies the three nonzero roles. Grant every possible assignment, and allow arbitrary terminal truncation. Unlike earlier COBS, repeat-prefix +1 and two-rune escape tests, this is the actual SLIP sender grammar in differential coordinates.

## Exact test

For each candidate ESC e, count all its interior successor symbols. Every occurrence must be followed by one of exactly two other nonzero symbols. Subtract the sum of the two largest admissible successor counts from the total occurrences. Minimize over e. This exhausts the 28*27*26 ordered assignments without relying on language, keys, spacing, packet lengths, or scoring. A positive minimum proves that no canonical sender output can equal the source. In particular an implementation's permissive recovery from malformed escapes would not furnish an exact inverse.

| Original interval | Runes | END transitions | Minimum malformed escapes over all assignments |
|---|---:|---:|---:|
| p0–55 | 12,956 | 86 | 361 |
| p0–2 | 729 | 4 | 13 |
| p40–53 | 3,008 | 18 | 66 |
| p51–55 | 842 | 5 | 14 |

The p51 initial END observation is therefore insufficient: even on that source-fixed continuation the grammar fails under every role assignment. All four intervals are allowed independent roles; the obstruction remains.

The SFT round-trips a literal RFC byte-alphabet example (including both escaped symbols), and three solved-LP1 native GP29 two-packet controls of lengths 384, 357, 357 with independently chosen roles. All 1,098 input runes are recovered exactly and the grammar minimum is zero. These are implementation controls with known roles, not blind cryptanalytic recovery. The original minima are positive; no canonical inverse, unknown plaintext or key was obtained.

## Decision

Retire the exact SLIP differential receiver, not all constrained coding. No first-party information selects another documented alphabet adaptation or provides a missing sidecar. No fitted exception rule is justified.

- [Executed SFT](../sims/lp2_rfc1055_differential_slip_original_gate_sft.cjs)
- [Full successor counts and control output](lp2-rfc1055-differential-slip-original-output.json)

Executed on the actual repository corpus in the connected JavaScript runtime; standalone Node CI not run.