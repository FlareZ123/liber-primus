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

## All-secret byte-clock linear-state obstruction

The original 2,048-bit serialized BM result above cannot by itself exclude an arbitrary secret 128-bit state feeding eight different output bits per clock. The new [joint-bitplane SFT](../sims/lp2_p50_joint_bitplane_linear_state_sft.cjs) tests that broader family **without knowing any generator taps, initial seed, or linear output projection**.

Suppose an unknown binary state is updated by a fixed GF(2)-linear matrix, s[t+1] = A*s[t], and each consecutive printed byte is an eight-bit linear observation y[t] = L*s[t]. For state dimension d, Cayley-Hamilton guarantees that the **same binary recurrence of order at most d** annihilates every one of the eight visible output bitplanes. This is independent of the secret matrix A and the eight output masks L. Affine state/output maps embed into a homogeneous linear state of dimension at most d+1.

An exact GF(2) linear system simultaneously constrains eight bitplanes at every later byte in the **original printed row-major 256-byte sequence**. The rank calculations use all 256 unaltered source bytes and the already documented SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290:

| Allowed recurrence order | Independent tap rank at first contradiction | First impossible source byte and bit | Result |
|---:|---:|---|---|
| 128 | 128 | byte 144, bit 1 | inconsistent |
| 129 | 125 | byte 144, bit 5 | inconsistent |
| **226** | **225** | **byte 254, bit 2** | **inconsistent** |
| 227 | 227, full rank across 232 equations | no contradiction over the observed 256 bytes | unique high-order fit |

The byte and bit indices are zero-based, with bit zero the least-significant bit. Any recurrence of order 226 or less is also a recurrence of order 226 after padding its unused taps with zeros. Consequently **every possible stationary GF(2)-linear generator of 226 or fewer hidden state bits is excluded** for this exact one-byte-per-state-tick model. Stationary affine generators of up to 225 unknown state bits are excluded after homogeneous embedding. This is an all-secret bound on a complete cipher-generator class, unlike testing one xorshift's predetermined shift constants.

The degree-227 fit has essentially as many free taps as the original byte-clock equations can determine. Its unobserved next-byte extrapolation is 0x63, but there is **no independently sourced 257th byte**, and a 227-tap fit to 256 bytes supplies no authentic key or evidence of intentional linear generation. It must not be used as a recovered continuation. A source-shaped synthetic 128-bit GF(2)-linear state produces 256 bytes that pass the order-128 fit; changing one planted output bit makes the same test fail. Both controls are asserted in the independent CommonJS SFT.

The scope is exact: **one printed byte per state update, unchanged radix-60 byte interpretation, fixed homogeneous or affine GF(2) state update, and linear byte observation**. A 32-bit word generator serialized into four consecutive bytes has another clock; nonlinear output filters, injected errors, ciphertext, independent row keys and source-selected alternate table traversals fall outside this result. No plaintext, true generator, or external key was recovered.

## Research decision

The source table cannot be the direct output of the original twelve tested small-state xorshift conventions. The new all-secret shared-recurrence result additionally excludes **every stationary binary linear byte-clock generator with at most 226 state bits**, even when its taps and output projections are arbitrary secrets. The table could still be an encrypted payload, a source for a nonlinearly generated key, or a different original mathematical object; its radix-59 versus radix-60 interpretation remains conditional. A further generator attack needs an independently visible instruction selecting a distinct output clock, nonlinear state rule, or key consumer. Do not expand into free generator and orientation sweeps solely because the table looks pseudorandom.

**Executable source checks:** [specific-state and serialized-bitplane SFT](../sims/lp2_p50_gf2_linear_prng_state_gate_sft.cjs) and [all-secret common-recurrence SFT](../sims/lp2_p50_joint_bitplane_linear_state_sft.cjs). Both read the unchanged original 32×8 source bytes and exercise genuine generated positive plants.
