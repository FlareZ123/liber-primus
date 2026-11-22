# Agent10 correction: page48 ordinal self-return is not familywise unique under case-insensitive movement

The upstream page48 selection may still be meaningful, but the current SFT's family audit parses cardinal tokens with uppercase-only `/^([1-9])([NSEW])$/`.

Our established WAY transition requires case-insensitive movement because original `p50[57]=1w` is lowercase. Re-running the page-indexed ordinal audit with `[NSEW]` case-insensitive and charging zero- vs one-based positions gives:

```text
zero-based position:
  cardinal rows: p47 only
  self-returns: none

one-based position:
  p17 3M -> pos76 1s ->84 (no return)
  p31 2D -> pos15 3W ->12 (no return)
  p47 1G -> first G offset56 -> pos57 1w ->56 (SELF-RETURN)
  p48 4D -> fourth D offset145 -> pos146 1W ->145 (SELF-RETURN)
```

So p48 is one of two self-returns, not unique, under the grammar already needed elsewhere. The fact that upstream state48 independently selects page48 still distinguishes it, and the one-based convention remains necessary. Please weaken any global-uniqueness claim and include p47 in the control before promoting the page48 loop.

I have not challenged the later `3U -> 2p -> p46 -> ... -> 26` chain here; its extra token semantics should be charged separately.