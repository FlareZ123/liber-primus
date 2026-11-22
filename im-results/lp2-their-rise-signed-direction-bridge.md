# THEIR RISE turns signed word numbers into an upward p50 direction

**Agent4, 19 November 2026. Classification: source-constrained solve-path bridge. It gives a literal direction operation for the authenticated 2016 wording and supplies a human-facing selector for the DH modulus `p=23` used as the SEEKS pointer depth. The separate prospective PATH depth-p pointer transfer fails and is retained as a boundary.**

## Upstream clues

The established p32 coordinate-number readout terminates at signed zero-based index19:

```text
15 WORDS
16 ARE
17 THE
18 MAP
19 THEIR
```

Independently, p33 now yields hidden text:

```text
THEIR RISE
```

The authenticated signed source contains exactly two THEIR occurrences, at zero-based indices 19 and25. P33 already fixes this origin convention independently: `B=19` is its entry state, and its visible H chain emits 25.

Therefore the literal rise is:

```text
25 - 19 = 6 = a
```

and the second occurrence opens the exact signed clause:

```text
25 THEIR 26 NUMBERS 27 ARE 28 THE 29 DIRECTION
```

This supplies a concrete reading of the hidden instruction: rise from the first THEIR to the second, then consume the authenticated statement that their numbers provide direction.

## Clause-level +a translation

The hidden instruction also has an exact source-text action before p50 geometry is involved. The first THEIR begins:

```text
19 THEIR 20 MEANING 21 IS 22 THE 23 ROAD
```

Adding the rise `a=6` to every index yields:

```text
25 THEIR 26 NUMBERS 27 ARE 28 THE 29 DIRECTION
```

with index24 `AND` acting as the printed separator between the parallel clauses. Thus `THEIR RISE` translates the complete five-word clause `THEIR MEANING IS THE ROAD` into `THEIR NUMBERS ARE THE DIRECTION` by one fixed +6 word-index operation.

The corresponding exact GP0 rises are:

```text
THEIR    -> THEIR       +0
MEANING  -> NUMBERS     +6  = a
IS       -> ARE        +21  = p-K
THE      -> THE         +0
ROAD     -> DIRECTION  +58  = 2*29
```

The positional consequence is more important than these secondary GP0 equalities. It maps `THE22 -> THE28` and `ROAD23 -> DIRECTION29`. The authenticated THE scaffold has only two +a boundary jumps, `1->7` and `22->28`; this hidden instruction independently supplies the later jump. Therefore the signed THE at index28 and DIRECTION at29 can be selected from the first THEIR clause before consulting p28/p29 algebraic properties.

This removes the weakest circular step in the existing p28 THE / DIRECTION p29 selector: instead of choosing THE28 because the current manuscript page is p28, p32 provides THEIR19, p33 provides the +a rise, and the source clause itself carries THE22 to THE28 and ROAD23 to DIRECTION29.

## Literal 32x8 operation

The original p50 object is visibly a 32x8 table, and its width is the reconstructed state value `A=8`. Interpret a signed word's GP0 as a table address and its zero-based word number as an upward row displacement:

```text
destination = GP0(word) - 8 * signed_word_index
```

Across all 43 authenticated words, only eight starts remain in-bounds after this upward motion. Exactly two land on any reconstructed DH state:

```text
index2 PATH   GP0=39   39 - 2*8 = 23 = p
index6 SEEKS  GP0=71   71 - 6*8 = 23 = p
```

No valid downward interpretation under either zero-based or one-based source numbering lands on a DH state. One-based upward numbering makes PATH and SEEKS converge on `b=15` instead; the p33 THEIR positions independently select the zero-based convention because only zero-based positions are `[B,25]=[19,25]`.

The same fixed upward rule gives two secondary source identities:

```text
index3 LIES      GP0=63   63 - e*8 = 39 = GP0(PATH)
index5 EPIPHANY  GP0=121  121 - g*8 = 81 = e^q
```

The first is lexically suggestive because LIES rises onto PATH's address. The second maps the independently p32-selecting EPIPHANY number121 to the established p33 upper-body rune count81. These were observed after the main PATH/SEEKS convergence and are supporting structure.

## Why this matters for the SEEKS route

The authenticated `EPIPHANY SEEKS THE DEVOTED` p50 route was previously unique only after charging every DH state value as the pointer depth. Its winning depth is `p=23`.

The new direction bridge supplies a human-facing way to select that depth before the route is followed:

```text
THEIR RISE
 -> rise = 6 = a
 -> signed word6 = SEEKS
 -> GP0(SEEKS)=71
 -> rise by its number6 rows on width8
 -> 71 - 48 = 23 = p
 -> use p=23 as SEEKS pointer depth
```

PATH independently produces the same state under the same operation, so `p` is not selected only by the SEEKS word.

## Prospective PATH transfer: negative

`workplace/agent4-path-rise-pointer-precommit.md` froze a genuine transfer before the PATH route was opened: use base60 p50 pointers, start at GP0(PATH)=39, and walk exactly p=23 steps. Success required a legal physical LP2 page at the terminal, with no alternate depth, radix, start, reverse walk, early stop, or modulo reduction.

The route is:

```text
39 -> 5 -> 237 -> 32 -> 115 -> 247 -> 192 -> 0 -> 203 -> 68
   -> 199 -> 47 -> 76 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
   -> 203 -> 68 -> 199 -> 47 -> 76
```

The terminal is76, outside physical pages0..57. The prospective transfer therefore fails. The route happens to pass physical p32 at step3=`e`; that was visible only after the terminal gate failed and is not used to rescue the prediction.

## Decision

Preserve the upward-number interpretation as a serious intended-route candidate:

```text
p32 coordinate numbers -> first THEIR at19
p33 hidden text         -> THEIR RISE
next THEIR              -> 25
rise                    -> 6=a -> signed word6 SEEKS
SEEKS number            -> 71
rise by number on p50   -> p=23
p                       -> authenticated SEEKS pointer depth
```

This materially reduces a previously open parameter choice in the SEEKS route. It does not generalize the pointer walk to PATH, and it does not authorize arbitrary vertical motions on p50.

## Reproduction

- SFT: `sims/lp2_their_rise_signed_direction_bridge_sft.cjs`
- Workflow: `.github/workflows/agent4-their-rise-signed-direction.yml`
- Windows PASS with clause-translation assertions: https://github.com/FlareZ123/liber-primus/actions/runs/44457504951
- PATH transfer precommit: `workplace/agent4-path-rise-pointer-precommit.md`
