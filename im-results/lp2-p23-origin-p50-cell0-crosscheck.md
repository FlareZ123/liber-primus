# P23 `THE ORIGIN` candidate meets the canonical p50 origin cell

**Agent42, 19 November 2026. Classification: source-constrained cross-object support for the p23 hidden-layout instruction candidate. This does not decrypt unknown LP2 ciphertext or establish a general p50 state machine.**

## Upstream candidate

The p23 five-dot mirror route selects physical p23 line1 without reading unknown rune values. Its five printed word lengths are

```text
[2,6,3,5,4]
```

and the solved-p56 positive-cardinal serializer

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

maps them to the unique manuscript-wide prefix

```text
THEORIG
```

Appending the visible dot count 5 and the local five-word product 25 gives the previously reported candidate completion

```text
THE ORIGIN
```

The `IN` completion was recognized after `THEORIG`, so it previously lacked an independent consumer.

## Frozen cross-object read

Use the p50 serialization already selected on solved/source controls before this test:

1. zero-based row-major p50 address;
2. printed token in source order;
3. native base60 value;
4. Euclidean `divmod 29`, quotient first;
5. authenticated signed-2016 word positions counted from zero when a quotient is interpreted as a source-word number.

The literal origin of that one-dimensional table is address 0. Its untouched printed token is

```text
p50[0] = 3N
3N_base60 = 203
203 = 7 * 29 + 0
divmod29(203) = [7,0]
```

In the authenticated 43-word 2016 message, zero-based word 7 is exactly

```text
THE
```

Thus the frozen canonical read of the literal table origin is

```text
[THE, 0]
 = THE ORIGIN
```

The low coordinate is literally zero; no synonym, language score, Caesar shift, key search or unknown-page rune value is used.

## Exact tape control

Charge all six authenticated occurrences of `THE` in the signed 2016 text. Their zero-based positions are

```text
[1,7,12,17,22,28].
```

Under the canonical native-base60, forward-token, quotient-first register, scan every one of the 256 original p50 tokens for the predicate

```text
quotient is a zero-based position of THE
and
remainder is 0.
```

There is exactly one hit:

```text
address 0 : 3N = 203 -> [7,0] -> [THE, origin]
```

Because a cyclic shift puts every original token at address0 exactly once, the exact token-multiset cyclic control is

```text
1 / 256 = 0.00390625.
```

This is a conditional selectivity measure for the frozen relation, not a probability of Cicada authorship.

## Conservative convention sensitivity

Although the canonical p50 register was selected independently before this test, charge a wider 16-way sensitivity family anyway:

- radix 60 or 59;
- forward or reversed two-character token;
- quotient/remainder or swapped pair;
- zero-based or one-based signed-word positions.

At the actual origin token `3N`, exactly one of the 16 configurations satisfies `[THE-position, 0]`: the canonical base60 / forward / quotient-first / zero-based convention.

Across all 256 cyclic origin shifts, **14/256 = 0.0546875** shifts admit at least one hit somewhere in that 16-way family. This wider number is the appropriate guard against pretending the relation survives arbitrary reinterpretation.

## Evidence boundary

This result supplies an independent cross-object consumer for the semantic completion `THE ORIGIN`:

- p23 supplies the source-selected `THEORIG` prefix and local `IN` completion;
- solved/source controls had already selected the canonical p50 register;
- the literal p50 origin then returns `[7,0]`, and signed word7 is `THE`.

The p50 cell0 token and its value were public before this cross-check was formulated, so this is **not** a blind prediction. It should be treated as a strong, compact consistency relation rather than a discovery p-value.

The result does not license new p50 pointer walks, alternate radices, or unknown-page decoding. Its useful consequence is narrower: the previously post-discovery suffix that turns `THEORIG` into **THE ORIGIN** now has a separately typed manuscript/source consumer.

The natural compositional phrase with the independently recovered p28 candidate `READ OUT` is `READ OUT THE ORIGIN`, but source order between those two candidate instructions is not yet established. Do not use that English composition to select a new receiver without a separate ordering clue.

## Reproduction

- SFT: `sims/lp2_p23_origin_p50_cell0_crosscheck_sft.cjs`
- Upstream p23 report: `im-results/lp2-p23-fivedot-totient-origin.md`
- Canonical p50 register control: `im-results/lp2-p57-divmod29-register-audit.md`
