# P28 READ OUT closes through a p50 low-digit pointer back to p28

**Agent24, 19 November 2026. Classification: strong post-discovery self-closure of the preferred p28 READ OUT plaintext candidate. This supplies an internal p50 consumer that does not require interpreting full p50 numerals as LP2 rune offsets. The low-digit operation was recognized after READ OUT was known, so the result is corroboration rather than a blind plaintext recovery.**

## Result

The preferred p28 candidate already decrypts the exact source-selected center-plus-word28 object to:

`READ OUT`

under the reversible GP29 exponent pair `(3,27)`.

The established whole-word address primitive gives:

```text
GP0(READ) = 55
GP0(OUT)  = 20
GP0(FIND) = 42
```

Read only the **low base60 digit** of the p50 token at each address, using the table's native 60-symbol alphabet and zero-based digit values:

```text
55  -> p50[55] = 1K -> low60(K) = 20
20  -> p50[20] = 1g -> low60(g) = 42
42  -> p50[42] = 0S -> low60(S) = 28
```

Therefore the fixed transition is:

```text
READ(55) -> OUT(20) -> FIND(42) -> p28
```

The intermediate state 42 is independently named by solved p57 **FIND**. The terminal state28 is the same physical p28 that produced READ OUT.

This is a closed, source-readable loop using only GP0 addresses, literal p50 tokens and one repeated token-component operation. It never converts a full p50 numeral into an LP2 rune offset.

## Why this changes the READ OUT branch

The earlier downstream route interpreted:

```text
p50[55] = 1K -> base60 80
p50[20] = 1g -> base60 102
```

as p0 rune offsets. Director #1725 found no creator-authenticated basis for the general p50-numeral -> LP-rune-offset output type.

The new route consumes the same original cells differently and remains internal to the p50 state graph:

```text
token 1K -> its low digit K -> alphabet index20
token 1g -> its low digit g -> alphabet index42
token 0S -> its low digit S -> alphabet index28
```

The final `0S -> 28` step is already compatible with the older FIND -> p28 route because a zero high digit makes the full base60 value and low-digit value identical. The advance is that the same low-digit operation now extends prospectively through the nonzero-high cells `1K` and `1g`.

## Charged p28 phrase family

The existing cube-family control admits all six GP29 cube-orbit exponents

`[1,3,9,27,25,19]`

independently on the predecessor rune and five-rune word. Across:

- 314 eligible five-rune predecessor objects;
- 36 exponent pairs;
- **11,304** transformed objects;

the pinned English register yields **21 two-word parses**.

Apply the same source-order pointer test to every parse:

1. address the first word by GP0;
2. read the selected p50 token component;
3. require that component value to equal GP0 of the second word;
4. continue the same component operation twice;
5. require the last state to equal the physical source page of the phrase.

Under the native base60 low digit with zero-origin values, exactly one of the 21 parses closes:

```text
p28 word28, exponents (3,27)
READ / OUT
55 -> 20 -> 42 -> 28
```

It is also the **only** parse whose first word points to its second word under that forward low-digit operation.

## Competing component conventions

Charge the obvious finite output family:

- base60 versus drop-f base59 alphabet;
- high versus low token digit;
- zero-based versus one-based digit value;
- phrase order forward versus reverse.

This gives 16 modes.

Only one **forward** self-closure survives:

```text
base60 / low / zero-origin / forward
READ OUT on p28
55 -> 20 -> 42 -> 28
```

There is one unrelated reverse-order artifact on p17:

```text
OWE -> ORD
28 -> 30 -> 21 -> 17
```

It appears under both base60 and base59 because the relevant component characters lie before the dropped `f`. It does not compete with the source-order READ OUT instruction.

## Evidence boundary

This result materially strengthens READ OUT because it provides a compact downstream consumer and a closed human-readable route without the rejected full-numeral receiver type.

Its chronology still matters. READ OUT, the p50 table, FIND=42 and p28 were all known before this low-digit interpretation was noticed. The self-closure therefore measures internal compression and familywise discrimination rather than a blind prediction.

The next strongest use is to treat the low-digit p50 transition as a candidate **state-pointer operation** and demand one independently selected consumer outside the READ OUT/FIND/p28 loop before promoting it as a general manuscript opcode.

## Independent authenticated-source transfer

A later source-only audit found that the same native base60 low-digit operation has an independent consumer inside the authenticated 2016 vocabulary. Canonical `GP0(ROAD)=GP0(PATHS)=54` and `GP0(FOUND)=36`; the untouched original table gives `p50[54]=2a -> 36` and `p50[36]=0s -> 54`. Across the complete 16-mode base60/base59 × high/low × address-origin × digit-origin family, this canonical reading is the only mode with any two-cycle among the signed vocabulary's 27 distinct GP0 states, and that sole cycle is `36 <-> 54`.

This supplies the independent external low-digit consumer requested above. The source wording itself distinguishes **the road** from **false paths**, which is a plausible human-facing resolution of the state54 lexical collision. Preserve that semantic reading as interpretation; the source-only numeric cycle is the reproducible fact.

See [authenticated ROAD / FOUND / PATHS low-digit cycle](lp2-2016-road-found-falsepaths-lowdigit-cycle.md).

## Reproduction

Run:

`node sims/lp2_p28_readout_lowdigit_selfclosure_sft.cjs`

The SFT reconstructs the 11,304-member charged cube family from original LP2 data, rebuilds the 21 two-word parses from the pinned English register, charges all 16 token-component modes and asserts the unique forward READ OUT self-closure. Windows / Node.js 22 reproduction passed in Actions run [44443888298](https://github.com/FlareZ123/liber-primus/actions/runs/44443888298).
