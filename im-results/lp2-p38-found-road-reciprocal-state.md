# P38 physically realizes the unique authenticated FOUND ↔ ROAD/PATHS low-digit state

**Agent24, 19 November 2026. Classification: chronology-preserving structural corroboration of the p38 FOUND route and the base60 low-digit operator. No plaintext is assigned to the following three-rune word.**

## Discovery order

This result uses a useful chronology separation.

1. Agent24 first fixed **native base60 / low token digit / zero-origin** as the only forward component convention that self-closes the charged p28 `READ OUT` phrase family.
2. Agent7 then transferred that already selected component operation to a different route and uniquely selected the word immediately after the p38 FOUND receiver, offsets54..56.
3. Only after that transfer was committed did the reciprocal authenticated word-state relation below become apparent.

The semantic interpretation of the p38 successor therefore did not select the operator or the receiver.

## Unique reciprocal state in authenticated/solved words

For every distinct GP0 value represented by the authenticated 43-word 2016 message, solved p56 and solved p57, take the p50 token at that zero-based address and retain its low digit in the native 60-symbol alphabet.

There are **50 distinct addressable GP0 states** in this source corpus.

Exactly one unordered pair is reciprocal under the fixed operation:

```text
36 -> p50[36] = 0s -> low60(s) = 54
54 -> p50[54] = 2a -> low60(a) = 36
```

The source labels are:

```text
36 = GP0(FOUND)              uniquely
54 = GP0(ROAD) = GP0(PATHS)
```

So the source graph contains the unique two-cycle:

```text
FOUND(36) <-> ROAD/PATHS(54)
```

The ROAD/PATHS collision is itself meaningful in the authenticated message, which explicitly distinguishes the road from false paths. The arithmetic does not choose between those two words, so that semantic choice remains unresolved.

## Unique physical realization in unknown LP2 words

Parse the complete unknown p0–p55 stream continuously, preserving words across physical line and page wraps and retaining words wholly contained on one physical page. This gives **2,864** words.

Ask for a word whose pair `(local start offset, ciphertext GP0)` equals either orientation of the unique source reciprocal pair, `(54,36)` or `(36,54)`.

There is exactly one hit:

```text
physical p38
word ordinal10
offsets54..56
cipher runes [5,12,19]
cipher GP0 = 36
local start = 54
```

Thus the word selected by Agent7's independent low-digit transfer physically realizes:

```text
start = 54 = GP0(ROAD/PATHS)
GP0(cipher word) = 36 = GP0(FOUND)
```

This is the word immediately following the strengthened p38 FOUND candidate at offsets49..53.

## Authored section boundary

The original p38 transcription shows these as the last two complete words before the literal numbered marker **5-**, which begins section 5. The three-rune reciprocal-state word ends the preceding numbered section 4.

The physical sequence is therefore:

```text
... [p38 offsets49..53: FOUND candidate]
    [p38 offsets54..56: unique 54/36 reciprocal-state word].
5-  [section 5 begins]
```

This does not yet decrypt the three-rune word. It does provide a compact, source-visible stopping/boundary state at the exact place independently selected by the transferred p50 component operation.

## Relation to the typed p38 route

The earlier global p38 typed closure selects:

```text
cipher word offsets49..53 GP0=95
p50 low component -> signed index35 = FOUND
GP0(FOUND)=36
p50 low component -> 54 = start of next word
```

The new observation explains those last two numbers in the same authenticated source-state vocabulary:

```text
36 = FOUND
54 = ROAD/PATHS
54 -> 36 under the same fixed low-digit transition
```

So the downstream receiver is also a physical realization of the reciprocal source state, rather than merely a boundary whose number happened to be54.

## Evidence boundary

The result strengthens two ideas:

- the base60 low digit is a real candidate state component, because it now supports the p28 READ OUT self-closure and a separately selected p38 source-state realization;
- the p38 FOUND candidate sits at a highly structured source-connected boundary.

It still does **not** authenticate the per-rune HERE/DH key order used for FOUND, and it does not provide plaintext for offsets54..56. The ROAD/PATHS GP0 collision also prevents the state value54 alone from choosing between those labels.

A productive next test is to search for a source-selected operation that consumes the **ordered pair (54,36)** or the section-4 terminus as state, without reopening arbitrary HERE/DH key menus.

## Reproduction

Run:

`node sims/lp2_p38_found_road_reciprocal_state_sft.cjs`

The SFT reconstructs all 50 authenticated/solved GP0 states, proves the reciprocal low-digit cycle is unique, parses all 2,864 contained unknown words, proves the p38 offsets54..56 realization is unique, and verifies its position immediately before the literal section-5 marker. Windows / Node.js 22 reproduction passed in Actions run [44445169282](https://github.com/FlareZ123/liber-primus/actions/runs/44445169282).
