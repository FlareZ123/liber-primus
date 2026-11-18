# Signed-2016 GP0 receiver-family census

**Agent15, 18 November 2026. Classification: receiver-selection holdout for the existing GP0/p50 navigation hypothesis. It uses unknown-page ciphertext geometry and authenticated source words, with no candidate plaintext letters in the selection test.**

## Decision

The existing p0 route had a clear unresolved choice: after a signed word is converted by canonical whole-word GP0 into a p50 address and the original table returns a byte, why should that byte be interpreted as a rune offset on **p0** rather than another unknown page?

A full receiver-family census now answers that question for the route's strongest typed closure.

Under the stricter continuous-word convention and conventional base60 table reading, the frozen typed rule

```text
receiver ciphertext word GP0
-> p50 byte
-> zero-based index into the authenticated 43-word 2016 message
-> selected signed word GP0
-> p50 byte
-> receiver word start or end
```

has **exactly one self-closure across all 55 rune-bearing unsolved LP2 pages**:

```text
physical p0 word52
ciphertext GP0 = 13
p50[13] = 4
signed word4 = EMPTY
GP0(EMPTY) = 92
p50[92] = 236
236 = end(p0 word52)
```

The census is independent of the proposed plaintext `THE DEVOTED`. It selects p0 from ciphertext word geometry alone once the GP0/p50/signed-word grammar and base60 interpretation are frozen.

This materially reduces the receiver-choice freedom identified in the Critic audit. It does not establish the candidate p0 plaintext letters, universalize base60, or prove that every p50 output should be interpreted as a page-local offset.

## Frozen family

The reproducer applies the same operation to every rune-bearing unknown physical page. The rune-free p50 table is naturally excluded, leaving 55 receiver pages.

Two word-boundary conventions are charged rather than selected after inspection:

1. **page-local fragments**, matching the earlier p0 implementation, where a page-edge fragment is treated as a local printed word fragment;
2. **contained-only words**, where page boundaries do not terminate a word and only complete words wholly contained on one physical page are eligible.

Both source-supported numeral readings are also charged:

- conventional base60;
- drop-`f` base59.

No receiver-specific phase, offset, key, English scorer, or plaintext phrase is fitted.

## Typed closure

For every eligible receiver word, let its canonical ciphertext GP0 sum be `g`.

1. If `g >= 256`, the word is ineligible.
2. Read the frozen p50 value at address `g`.
3. If that value is not a zero-based index in the 43-word authenticated 2016 message, the word is ineligible.
4. Take that signed word, compute its canonical GP0 sum, and read the p50 value at that address.
5. Count a closure only when this second output is exactly the original receiver word's start or end rune offset.

The strict contained-word, base60 family produces one receiver page with a closure, one closure total, and it is p0 word52 -> EMPTY -> 236. The Windows test asserts this exact uniqueness, so a later corpus or parser change cannot silently preserve a false summary.

## Other receiver events are retained as controls

The same program also performs the broader adjacent-signed-word tests already used on p0:

- exact adjacent word-boundary crossings;
- intervals whose two endpoints are receiver word ends;
- comparison of each enclosed receiver word-length vector against every contiguous phrase-length vector in the authenticated signed message.

These shape tests are intentionally kept separate from the typed closure. Other pages can generate short word-length matches, so the familywise result does **not** promote `THE ROAD` or `THE DEVOTED` to authenticated plaintext. Their status remains conditional on the larger navigation hypothesis and on eventual recovery of the actual p0 value-changing cipher.

## Reproduction

Script:

`sims/lp2_2016_receiver_familywise_census_sft.cjs`

Windows Node22 source test:

- [PASS 44422378212](https://github.com/FlareZ123/liber-primus/actions/runs/44422378212)
- tested commit `1e580fa0259ea59e9f8200fb8a4217d01c5989bf`

The test reads only checked-in canonical resources: the LP2 transcription/corpus, original 256-cell p50 table, and authenticated 2016 signed message.

## Consequence

The strongest current source-supported receiver statement is now narrower and more useful:

> Given the frozen signed-word GP0 -> p50 base60 -> page-local-offset grammar, the typed self-closure selects p0 uniquely across the 55 rune-bearing unknown pages under the strict continuous-word convention.

This is a receiver selection result. The next decisive advance still requires a reversible operation that predicts unknown p0 rune values, or a fresh source-authored output-type rule that connects the navigation state to ciphertext.
