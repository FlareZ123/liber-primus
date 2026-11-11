# LP2 256-byte table: exact small linear-generator state gate

**Agent 4, 11 November 2026.** Intermediate, bounded original-source negative. This excludes specific possible mechanisms for *extending* the 256 printed bytes into a longer cipher key; it does **not** decode any unknown LP2 plaintext, identify an original creator instruction, or constrain nonlinear/external generators.

## Input and reason for the test

The manuscript's original p49–51 32×8 numerical table is a finite, visible 256-byte sequence under the repository's **conditional radix-60** interpretation. An author might use a short deterministic generator to produce such a table and later apply its continued stream as a key. The prerequisite is therefore exact byte agreement under a historically common, low-state, reversible generator, before any guesses about how its output would decrypt other pages. This is only a candidate route: the source does not itself say "xorshift" or specify a seed/output byte order.

The test uses only [the original-image-aligned source table](../resources/liber-primus/lp2-grid-256.json), SHA256 of 256 radix-60 bytes **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. It includes the already adjudicated original cell readings 45=1l, 50=0l and 246=3I; no new transcription decisions were made.

## Direct-state results

Berlekamp–Massey, applied to all 2,048 bits of four natural table traversals, gives:

| Byte traversal | LSB-first binary linear complexity | MSB-first complexity | Eight 256-step bitplane complexities |
|---|---:|---:|---|
| Printed row-major | 1024 | 1024 | 128,130,129,128,128,128,128,128 |
| Reverse row-major | 1024 | 1024 | 129,127,128,128,129,129,128,128 |
| Printed column-major | 1025 | 1022 | 128,131,128,130,128,129,128,129 |
| Alternate-row reversal | 1024 | 1024 | 128,128,128,129,128,128,128,129 |

These exact observations reject an *unfiltered, directly serialized* binary LFSR with fewer than **1,022** state bits for the eight tested traversal/bit orders, assuming contiguous output; shorter 256-step bitplane linear complexities should **not** be read as evidence for a 128-bit generator.

More specifically, GF(2) Gaussian elimination over **all possible initial states** for two standard fixed recurrences yields inconsistency for every inspected byte-output projection:

| Generator | One byte per state word (low, byte1, byte2, high) | Four bytes per word (little, big) |
|---|---|---|
| Marsaglia xorshift32, shifts (13,17,5) | First impossible byte: 4,3,4,3 | 4,4 |
| Marsaglia xorshift128, shifts (11,8,19) | First impossible byte: 15,14,13,12 | 16,16 |

"First impossible byte" is **zero-based** and means that after accepting every earlier observed bit, the indicated byte contains a linear equation inconsistent with **every** possible 32- or 128-bit initial state. Full details, including contradictory bit and rank, are printed by the reproducer. Every model's independently generated positive plant passes the same complete 256-byte state-feasibility test. The 12 original-state contradictions are deterministic, not p-values or failed heuristic key searches.

## Research decision

Do not attempt to use the printed bytes as a direct continuation of the tested unfiltered small GF(2) LFSRs or these 12 xorshift output conventions. The table can still be an encrypted payload, source for an unrelated operation, output of another generator, or an encoded/compressed key; the radix59 versus radix60 interpretation itself remains unresolved. A new state-recovery effort should first identify an **original source instruction** fixing another generator, output projection or state schedule. No exhaustive generator sweep is warranted solely because these finite examples fail.

**Standalone exact reproducer:** [`sims/lp2_p50_gf2_linear_prng_state_gate_sft.cjs`](../sims/lp2_p50_gf2_linear_prng_state_gate_sft.cjs). It asserts the authoritative byte hash, all stated complexity values, all 12 impossible original-output cases, and every source-shaped planted positive control.