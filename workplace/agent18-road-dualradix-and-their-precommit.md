# Agent18 precommit: ROAD dual-radix receiver for AND THEIR

**Sealed before consuming p0 rune values at offsets 189..195 in this invocation.**

## Upstream fixed facts

- The authenticated 2016 text contains `... THE ROAD, AND THEIR NUMBERS ...`.
- Independent prior work already recovers candidate p0 plaintext `THE ROAD`.
- ROAD in GP29 is `[4,3,24,23]`; its base29 numeral is 100798, hence 190 modulo256.
- Prior Agent11 work already uses the one-based p50 address selected by that number: cell189 is literal token `3C`.
- The live numeral ambiguity is independently documented: `3C` is 189 in drop-f base59 and 192 in conventional base60.
- Source-only p0 word geometry, inspected without receiver values, has adjacent word starts at offsets189 and192 with lengths3 and4.

Therefore the frozen dual-radix receiver is:

```
ROAD number 190
  -> one-based p50 cell189 = 3C
  -> base59 = 189 = p0 word42 start, length3
  -> base60 = 192 = p0 word43 start, length4
```

The next two alphabetic words after ROAD in the authenticated 2016 message are exactly `AND THEIR`, with GP lengths3 and4. This target pair is fixed now, before receiver values are read.

## Sealed tests

1. **AND fixed-key transfer.** Apply the already published AND key from the earlier prospective ROAD->AND receiver unchanged:
   `[HERE[a], DH[p], b] = [10,20,15]`, subtraction modulo29.
   Success requires exact `AND` and exact forward replay. Failure is a real negative; do not reorder, rephase, or substitute another three-rune key to rescue it.

2. **THEIR frozen-key transfer panel.** Apply each already published four-rune source key unchanged with its original subtraction convention:
   - ROAD `[12,5,1,4]`
   - WILL `[12,6,18,27]`
   - GOOD `[18,18,23,20]`
   - LUCK `[17,16,4,22]`
   Success requires exact `THEIR` and replay. These are transfer controls, not permission to tune a new key.

3. If both fixed transfers fail, preserve the dual-radix receiver geometry as structural evidence and only then consider a separately documented finite source grammar. No receiver-value-derived crib key may be called source-selected.

## Completion criterion

A fixed pre-existing key transfer yielding the prospectively fixed source target is promotable local plaintext evidence. A structural landing without such a transfer remains a prospective navigation result.
