# THE ORIGINAL opens a low-digit navigation fork to p28 and p33

**Agent10, 19 November 2026. Classification: source-connected navigation advance. No new body plaintext or general cipher inverse is claimed.**

## Upstream objects were fixed independently

Three ingredients existed before this transfer was inspected:

1. p23's five-dot/cardinal/DH route serializes to the hidden-layout phrase **THE ORIGINAL**;
2. p28's source-selected center/word object gives the strong candidate **READ OUT**;
3. p33's independently solved-cardinal/H layout gives **THEIR RISE**.

The p50 navigation operation is also independently fixed outside this observation:

```text
f(n) = low native-base60 digit of p50[n], zero-origin
```

It was selected by the p28 READ OUT self-closure and then transferred into authenticated 2016 source relations. This experiment therefore applies an already selected operation to a previously recovered phrase rather than searching for a new table decoder.

## Direct transfer of THE ORIGINAL

Canonical GP0 values are

```text
THE       = 20
ORIGINAL  = 86
FIND      = 42
MUST      = 51
VERIFY    = 59
```

The original p50 cells give:

```text
THE(20)      -> p50[20] = 1g -> low60(g) = 42 = FIND
FIND(42)     -> p50[42] = 0S -> low60(S) = 28 = physical p28

ORIGINAL(86) -> p50[86] = 1p -> low60(p) = 51 = MUST
MUST(51)     -> p50[51] = 0x -> low60(x) = 59 = VERIFY
```

Thus the two words of the p23 instruction branch without an invented offset or key:

```text
THE      -> FIND -> p28 -> READ OUT
ORIGINAL -> MUST -> VERIFY
```

The second branch then reaches a previously established source state. The original VERIFY-addressed cell is literally:

```text
p50[GP0(VERIFY)=59] = 19 = B
```

and the existing p23 DH handoff is:

```text
B=19 -> p50[19] = 0X -> base60 33 -> physical p33 -> THEIR RISE
```

So the full source-connected fork is:

```text
p23 THE ORIGINAL
  THE      -> FIND -> p28 READ OUT
  ORIGINAL -> MUST -> VERIFY -> B -> p33 THEIR RISE
```

This supplies a second, operation-distinct route from p23 into p33 while simultaneously creating a direct p23-to-p28 route.

## Convention charge

Charge the same finite token-component family relevant to READ OUT:

- base60 versus drop-f base59;
- high versus low token digit;
- zero- versus one-origin digit values.

Require all four semantic/numeric transitions simultaneously:

```text
THE      -> FIND
ORIGINAL -> MUST
FIND     -> 28
MUST     -> VERIFY
```

Across the eight modes, exactly one scores 4/4:

```text
base60 / low digit / zero-origin
```

The closest rival is base59 / low / one-origin at 3/4; it sends FIND to 29 instead of p28. Every other mode scores at most 1/4.

This is useful because the convention was selected before this p23 phrase transfer and the new route reuses it unchanged.

## Evidence boundary

The advance is navigation/state structure, not a claim that the p23 ciphertext body has been decrypted. The phrases THE ORIGINAL, READ OUT and THEIR RISE were already known when this connection was noticed, so this is a post-discovery cross-object consequence rather than a blind plaintext probability.

Still, it removes a real ambiguity in the human solve path:

- p23's recovered instruction now has a concrete consumer under an independently selected p50 operation;
- its first word reselects the independently recovered p28 instruction object;
- its second word passes through two authenticated command words and rejoins the independently reconstructed DH state at B;
- B lands on the already validated p33 state/checkpoint page.

Do not generalize this to arbitrary English-word walks or change component conventions. The next useful step is to ask whether the two selected destination instructions, READ OUT and THEIR RISE, determine a common operation or receiver without another semantic type switch.

## Reproduction

- SFT: `sims/lp2_p23_original_lowdigit_branch_sft.cjs`
- Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-grid-256.json`
- Upstream p23 phrase: `im-results/lp2-p23-fivedot-totient-origin.md`
- Low-digit opcode: `im-results/lp2-p28-readout-lowdigit-selfclosure.md`
- P33 phrase/state: `im-results/lp2-p33-layout-family-their-rise.md`
