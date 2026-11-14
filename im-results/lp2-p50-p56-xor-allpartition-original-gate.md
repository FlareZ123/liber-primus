# Whole-table XOR folding cannot reproduce the p56 512-bit digest under any partition

**Agent1, 14 November 2026. Classification: exact all-secret-order original-source exclusion.** The full 256-byte LP2 pp49–51 numerical table and the independently solved p56 64-byte digest have incompatible global XOR parity. No unknown manuscript plaintext, key or target-hash preimage is recovered.

## Source-constrained candidate and stronger mathematical gate

The original grid prints **256 cells**, naturally read as bytes in the canonical base60 interpretation. The solved p56 prints a **128-hex-character, 64-byte** hash. A source-era 2014 Cicada participant program explicitly combined long hex strings by bytewise XOR (the preserved [three-block 2014 program](../resources/external/2014-stage05-three-onion-hex-blocks.txt)); thus folding the 256 numerical bytes into 64 outputs by four-way XOR is one historically motivated operation with exactly matching output size. It is an *exploratory candidate*, since neither the manuscript nor the historical program instructs applying it to the 2014 LP2 grid.

Rather than choose a phase, permutation or specific 4×64 grouping, permit **any secret rearrangement and any partition of all 256 printed byte positions into 64 labeled output groups**, each position used **exactly once**. Require the output byte at each destination to equal the XOR of every source byte assigned to that group. The exact input-byte identity

```text
XOR(output[0..63]) = XOR(input[0..255])
```

holds for **every possible group assignment, even with unknown group sizes**, because bitwise XOR is associative and each byte appears once. This is an exact key-independent necessary condition, with no decoded-text language model, probability threshold, word boundary or search budget.

## Original immutable values

| Original object / radix | Length | XOR of all bytes |
| --- | ---: | ---: |
| Physical pp49–51 numerical table under base60 | **256 bytes** | **0x94** |
| Same printed tokens under the alternative documented base59 alphabet (lowercase f omitted) | **256 bytes** | **0x21** |
| Solved p56 target digest | **64 bytes** | **0x0D** |

Both source table interpretations disagree with the target. The **complete family of exact unweighted XOR-only partition mappings**, including all 4-source/1-target byte groupings, fails without enumerating any permutations. The table's canonical base60 bytes are pinned by SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The independently solved p56 digest is:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

A full 256-byte synthetic original-shaped control is built with the first three 64-byte chunks copied from source and the final 64-byte chunk determined by the exact expected XOR digest. The standard four-chunk fold recovers all **64/64 target bytes**. An independently scrambled 256-position plant, with its assignment indices carried through that permutation, also recovers **64/64**, proving the grouping implementation and order-independent invariant are correct. Two fixed original groupings are shown to fail; the algebra covers the entire arbitrary-partition family.

**SFT:** [`sims/lp2_p50_p56_xor_partition_invariant_sft.cjs`](../sims/lp2_p50_p56_xor_partition_invariant_sft.cjs), Windows Node22, original data and authentic digest. [Manual CI workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/manual-readonly-commonjs-sft.yml).

## Discriminating decision

The printed grid cannot be a direct **unweighted XOR fold** of all source bytes into the p56 target digest under either documented radix, even granting a completely secret input permutation and arbitrary target grouping. This rules out a much larger family than the separately documented [fixed two-bit-plane extraction](lp2-p50-p56-512bit-two-bit-plane-original-gate.md). It does **not** rule out cryptographic hashing, keyed XOR masks, reweighted coefficients, deliberate omitted input cells, new external page bytes or a cipher applied to a different source. Those alternatives need an independent original instruction. Do not rescue this all-partition failure by deleting a retrospectively selected table cell or fitting a secret post-XOR constant.
