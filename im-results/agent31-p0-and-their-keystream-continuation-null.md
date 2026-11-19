# p0 AND/THEIR key concatenation does not continue as a repeating stream

**Agent31, 19 November 2026. Classification: one frozen, source-motivated null test.** This tests only the simplest common-key interpretation of the state-derived AND and THEIR inverses; it does not test or disprove the noncontiguous p50 pointer route.

## Hypothesis

The existing [ROAD/NUMBERS state bridge](lp2-road-numbers-readout-state-bridge.md) gives these state-derived keys for the adjacent p0 words:

- AND at p0 offsets 189–191: [g, p+e, b] = [5,26,15].
- THEIR at p0 offsets 192–195: [p−a, p, K·g, g] = [17,23,10,5].

A simple shared seven-rune keystream hypothesis concatenates them:

`K = [5,26,15,17,23,10,5]`.

The signed 2016 phrase reads “THE ROAD, AND THEIR NUMBERS ARE THE DIRECTION.” If this seven-rune key were a continuous repeating stream, applying it to the immediately following seven original p0 runes would be a natural first holdout.

## Original-corpus test

Source: `resources/liber-primus/lp2-corpus.json`, p0 indices, zero-based offsets.

| Interval | Cipher indices | Key | Plain indices | GP transliteration |
|---|---|---|---|---|
| 189–195 | [0,6,9,19,12,20,9] | [5,26,15,17,23,10,5] | [24,9,23,2,18,10,4] | ANDTHEIR |
| 196–202 | [21,19,0,4,27,24,15] | [5,26,15,17,23,10,5] | [16,22,14,16,4,14,10] | TOEXTRXI |

Both blocks forward-re-encrypt exactly under the same mod-29 addition. The second block is not NUMBERS or another coherent continuation; its rune transliteration is T–OE–X–T–R–X–I.

Minimal reproduction:

```python
key = [5, 26, 15, 17, 23, 10, 5]
cipher = [0, 6, 9, 19, 12, 20, 9, 21, 19, 0, 4, 27, 24, 15]
plain = [(c - key[i % 7]) % 29 for i, c in enumerate(cipher)]
assert plain[:7] == [24, 9, 23, 2, 18, 10, 4]       # ANDTHEIR
assert plain[7:] == [16, 22, 14, 16, 4, 14, 10]     # TOEXTRXI
assert [(p + key[i % 7]) % 29 for i, p in enumerate(plain)] == cipher
```

## Decision

Reject **direct contiguous reuse of the concatenated AND/THEIR key** as the common schedule. The two local inverses may still be correct as word-specific state-derived operations, and the separately addressed NUMBERS receiver at p0 offsets 228–234 remains a distinct candidate. This test does not invalidate the source-only selection of the adjacent 3+4 receiver pair, the p50 token, or the noncontiguous navigation interpretation.

The next meaningful question remains the one in the parent report: can the AND and THEIR key-family forms be derived from one source-selected rule *before another receiver is opened*? Do not rescue this failed stream test with a phase shift, alternate alignment, or new key.
