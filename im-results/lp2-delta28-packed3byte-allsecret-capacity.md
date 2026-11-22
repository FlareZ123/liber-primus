# Original GP28 differential stream cannot be conventional fixed-alphabet 5-to-3 byte packing

**Agent 6, 18 November 2026. Status: exact bounded negative on an original-input binary-decoding hypothesis. No recovered unknown-page plaintext, author-selected decoding key or continuation.** Original-source Windows Node.js 22 test **PASS**, [run 44366768614](https://github.com/FlareZ123/liber-primus/actions/runs/44366768614), with a complete 3,000-byte reversible positive.

## The proposed human route

The unchanged 56 unknown LP2 physical pages contain 12,956 GP29 runes and only **86** adjacent equalities. Subtracting the previous ciphertext rune modulo29 leaves 12,869 nonzero steps, each taking one of 28 values. This suggests a *possible* radix-28 digit stream in which zero steps delimit or escape something. The signed 2016 “numbers are the direction” text and the original pp49–51 byte-valued 32×8 table make numerical and binary operations worth examining. **Neither source actually specifies this conversion.**

A particularly economical ordinary binary codec groups **five radix-28 digits per three bytes**: \(28^5=17,210,368\), just above the 24-bit range \(2^{24}=16,777,216\). Each 24-bit word has one canonical five-digit base28 representation. An unknown *fixed* bijection of the 28 nonzero GP29 step values to base28 digits is allowed at no brute-force cost, making this test stronger than testing the literal step numbers.

This is a distinct decoder family from Agent10's already executed [source-derived differential binary test](../sims/lp2_gp28_diff_binary_original_sft.cjs), which checked whole-segment integer conversion and ordinary two-base28-digits-per-byte coding with literal step numbers. The present test instead addresses **five digits to three bytes under every one of the 28! possible fixed secret digit alphabets**.

## A key-independent necessary condition

For the five base28 digits \(d_0,d_1,d_2,d_3,d_4\), each \(0\ldots27\), the integer represented most-significant-first is

\[
V=d_0 28^4+d_1 28^3+d_2 28^2+d_3 28+d_4.
\]

A three-byte result requires \(V<2^{24}\). When \(d_0=27\), the available remainder is
\(2^{24}-27\cdot28^4=181,504\), which lies strictly between \(8\cdot28^3\) and \(9\cdot28^3\).
Therefore **a leading digit27 must be followed by one of at most nine possible digit values, 0 through 8**. Digit8 also has an additional suffix restriction; ignoring it only makes the proposed cipher more permissive.

Let \(\pi\) be *any* secret one-to-one assignment of the 28 observed nonzero step identities to digits 0 through27. Exactly one source step identity \(s\) maps to leading digit27. For that source identity, the set of distinct second-position step identities that immediately follow it in complete five-step groups must have cardinality **at most nine**. Relabeling cannot change this cardinality. Reversing the direction of the original GP29 difference is also absorbed into \(\pi\); reversing the five-digit significance order is tested separately.

Thus a measured minimum of ten or more distinct successors for **every** possible \(s\) decisively excludes the complete unknown fixed-digit-alphabet family, regardless of whether a file signature, natural-language score, or key is known.

## Unchanged original result

Input: [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), all original pp0–55, preserving the physical page slots and the blank numeric p50. Four ordinary delimiter/reset interpretations are tested. For each, all five fixed global starting phases and both significance orders are independently included.

| Nonzero-step framing | Complete 5-digit groups over tested phases | Smallest distinct-successor count, across all 28 possible leading identities and all 10 phase/order tests |
| --- | ---: | ---: |
| Remove zero steps, one continuous book tape | 2,573 | **23** |
| Zero steps separate independent packing blocks | 2,473–2,542 | **24** |
| Restart the nonzero tape at each printed physical page | 2,497–2,539 | **23** |
| Restart at pages and zero-step delimiters | 2,398–2,509 | **22** |

Every measured minimum is greater than the necessary maximum **9**. There is no assignment of the 28 source step symbols to the 28 base28 digit values that makes this fixed five-digit/three-byte codec valid in any of these 40 source-framing/phase/significance conventions. This conclusion is independent of the 256 printed table bytes and any guessed file content.

The [complete read-only CommonJS reproducer](../sims/lp2_delta28_packed3byte_allsecret_capacity_sft.cjs) computes all original minima, asserts the 86 original zero steps and each necessary bound, and constructs an independent 3,000-byte synthetic binary source. The synthetic source is encoded in exact five-digit base28 blocks, relabeled by an arbitrary nontrivial bijection, accumulated to GP29 predecessor-dependent ciphertext, and then inverted **3,000/3,000 bytes**. The source-like plant exhibits the permitted at-most-nine follower structure. The same committed program passed on **Windows Node.js 22** in [run 44366768614](https://github.com/FlareZ123/liber-primus/actions/runs/44366768614).

## What this changes, and what remains open

The apparent base28 digit channel **cannot directly be a fixed-alphabet 5-to-3 byte packer**, even with an entirely unknown static digit key and the listed plausible page/zero group boundaries. A longer binary search should therefore begin from an independently authored opcode rather than trying permutations of this representation.

This does **not** exclude conventional whole-stream radix conversion, a variable-length byte codec, state-dependent digit alphabets, arbitrary per-page phases, added/reordered symbols, a bitstream with cross-group carries, or encrypted text in a different register. The observed anti-adjacency remains unexplained. The test recovers neither original unknown LP2 plaintext nor a key.
