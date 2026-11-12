# LP2 p2 vs pp23–26: any stationary binary rune map fails the six-way XOR parity rule

**Classification: original-cipher exact algebraic impossibility for a simple reversible parity architecture. Verified 12 November 2026.** Six original 201-rune strings cannot obey an equal-weight, positionwise six-way XOR equation under **any injective stationary encoding** of the 29 glyphs into a binary field, whatever its size. This is an original-source mechanism exclusion without guesswork about binary key bytes. **It does not recover unknown LP2 plaintext or authenticate any alternative cipher.**

## Visible source and human operation

The original p2 contains precisely **201 GP29 runes**, and the p23–26 visual chapter contains a 16-rune red rubric followed by **1,005 GP29 runes**. The latter can be divided into **five contiguous 201-rune streams**, or alternatively into five interleaved 201-rune streams. The matching length gives a source-observable possible use of the single p2 stream as a parity symbol for five message streams. Six streams could use elementary bytewise XOR parity rather than an unknown large-field Shamir secret-sharing polynomial.

This is a conditional human solve-path hypothesis: the 201 lengths are original observations, but p2 art and the p23 five-dot ornament do **not** instruct an XOR code or link the chapters. A six-way XOR can be tested exactly without presuming a rune alphabet order, a 976/984-bit serialization, a source-selected field degree, or a secret key.

## Complete all-secret test

Let the six original rune strands be s0,...,s5. Suppose there is a *single fixed* rune-to-binary-symbol code f mapping each of the 29 source glyphs into some vector space GF(2)^m, and suppose for every one of the **201 original columns**,

\[
f(s_0[j])\oplus f(s_1[j])\oplus\cdots\oplus f(s_5[j])=0.
\]

It is essential that f be **injective**: distinct original GP glyph identities cannot be merged or the proposed parity representation is not a complete rune-preserving decoder. The size m is unrestricted, so this includes byte encodings and all larger GF(2^m) values.

For each column j form a 29-column GF2 bitmask row, placing a 1 at glyph t if t occurs an **odd number** of times among the six original symbols. Every output bit of the unknown map f must be in the nullspace of the resulting **201×29 binary matrix**. Since there are six symbols per column, the vector of all 29 ones is always in the nullspace, corresponding to the uninteresting map assigning the same output value to every rune.

The decisive question is whether the matrix nullspace contains any **nonconstant** vector. Compute its exact GF2 rank by deterministic bitwise Gaussian elimination, without choosing f or fitting ciphertext. If rank = 28 then the nullspace has dimension 1, consists only of the constant vector, and *every* possible binary output bit of f is constant. In that case no injective f into GF(2)^m exists **for any m**. Conversely, a planted injective five-bit parity code must have at least five independent nullspace vectors, giving rank at most 24.

## Original-input experiment

- Exact source: original numeric [LP2 source corpus](../resources/liber-primus/lp2-corpus.json), physical p2, and five pp23–26 strands after the original red16 heading. Original sizes [213,270,273,265] with 1,005 post-heading body runes.
- Both **contiguous** and **interleaved** five-strand partitions are tested independently.
- For each partition, independently allow every one of the six strands, including p2, to run normally or reverse: **2^6=64** directions. The six XOR terms are unordered, so all 6! strand assignments and all locations of the "parity" strand are algebraically the same equation; they need no separate enumeration.
- Every binary assignment of rune labels, every field degree, every candidate byte-to-rune permutation and every per-bit binary code are handled *simultaneously* by one 29-column linear system per original alignment. There is no cryptographic plaintext scoring and no floating-point threshold.
- Plant control: generate 201 true six-strand XOR columns, using an explicitly **injective** code f(t)=t into GF(32), with the sixth symbol the XOR of the five source symbols. Reject only synthetic columns where the XOR lands on the three unused values 29–31. The planted field bit vectors are checked directly in the actual equation matrix. This validates that the procedure admits a genuine parity stream.

## Exact output

| Original strand layout | Independent six-stream reading directions | Rank of every 201×29 GF2 matrix | Nullity of every matrix | Earliest original prefix establishing rank 28 |
| --- | ---: | ---: | ---: | ---: |
| Contiguous pp23–26, plus p2 | **64/64** | **28** | **1** | 28–41 columns across orientations |
| Interleaved pp23–26, plus p2 | **64/64** | **28** | **1** | 28–40 columns across orientations |

The full six-symbol matrix reaches its maximum possible rank **28** in every one of the 128 original-source orientations. The only binary mapping allowed by all 201 columns maps all 29 rune identities to the same value. Such a mapping destroys the rune information and cannot decode the original manuscript.

The synthetic GF32 planted control satisfies 201/201 real parity equations and has rank at most 24 (at least five independent nullspace bit vectors), demonstrating the discriminator can pass the proposed mechanism.

### Why this exclusion is stronger than a keyed sweep

Any finite search of 29! rune permutations cannot exhaust arbitrary binary field encodings or arbitrary large m. The linear-algebra kernel test does this in one shot. It says that this particular six-way XOR relation is impossible under **all stationary injective rune-to-binary maps** with either body partition and all independent reading reversals. It does not rely on "no readable plaintext" or a chosen dictionary.

The separate [six-point historical SSSS field test](lp2-p2-p23-201-sixshare-ssss-original-gate.md) rejects two different byte-wide weighted five-degree Shamir constructions under specified 1–10 IDs; those models need **not** obey equal-weight XOR and are not disproved by this matrix. The two exclusions address distinct original-cipher hypotheses.

## Reproduction and decision

The [single-runnable Node.js 22 test](../sims/lp2_p2_p23_sixstrand_xor_allsecret_sft.cjs) reads only the canonical original rune corpus, asserts page lengths, computes the exact 128 matrices and ranks, proves the constant kernel relation and tests a genuine planted GF32 injective parity stream. It is attached to the existing [on-demand source-gated workflow](../.github/workflows/lp2-p23-ssss-enumerative.yml) along with the separate historical SSSS experiment.

**Decision:** Retire the simple binary p2/parity-of-five p23 transport under a fixed character encoder, even if its 29 alphabet labels or field size are unknown. Continue only if an independently readable source indicates **position-dependent mappings, weighted binary-field coefficients, cipher-state clocks, altered strand registration**, or some other actual operation that does not imply the falsified stationary parity equation. The equal lengths alone do not supply these missing transformations.
