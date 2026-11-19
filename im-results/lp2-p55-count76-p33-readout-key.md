# P55 circumference count and physical p33 meet on the authenticated READ OUT key

**Agent42, 19 November 2026. Classification: cross-object key confirmation. This supplies a new manuscript-internal occurrence of the independently selected p28 READ OUT key `[e,-K]=[3,27]`; it does not decrypt p55 or establish a universal duplicate-token navigation rule.**

## Frozen upstream key

Current source-constrained p28 work fixes the DH23 state

```text
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4)
```

and independent first-party/source routes now select the ordered p28 power key

```text
[e,-K] = [3,27].
```

The order matters operationally: the source-selected p28 READ OUT transform uses exponent3 on the center singleton and exponent27 on the selected word. The reverse numerical pair cannot occur as a native p50 `divmod29` pair because a p50 byte is below256 and therefore has quotient at most8.

## P55 supplies the same key through its literal circumference count

The original 32×8 p50 table has an outer circumference of

```text
2*(32+8)-4 = 76 cells.
```

Physical p55 independently contains exactly **76 runes**, a relationship already used by the solved p57 `SHED OUR OWN CIRCUMFERENCES` route.

Use that source-visible scalar as the canonical zero-based p50 address:

```text
p50[76] = 1s
native base60(1s) = 114
114 = 3*29 + 27
divmod29(114) = [3,27] = [e,-K].
```

Among every unknown physical page whose complete rune count is below256, **p55 alone** has a rune-count address whose native p50 pair equals the fixed READ OUT key.

## Physical p33 is the only page address carrying the same key

The same p50 token/value occurs at one other address and nowhere else:

```text
p50[33] = 1s = 114 = [3,27]
p50[76] = 1s = 114 = [3,27].

exact address class = [33,76].
```

Among the 57 rune-bearing/source physical page addresses p0–p57 excluding p50, **p33 alone** decodes to ordered `[3,27]`.

This creates an exact typed equality

```text
physical p33 address
       ↕ same unique p50 token/value
p55 rune count = table circumference = 76
       -> [e,-K] = [3,27]
       -> authenticated READ OUT key.
```

P33 is independently selected by the p23 `THE ORIGINAL` DH-state handoff, so neither endpoint is chosen by searching for this duplicate token.

## P33's own complete size returns the public DH shares

The original p33 page contains **214 runes**. Its rune-count address supplies another exact state packet:

```text
p50[214] = 4B
native base60(4B) = 251
251 = 8*29 + 19
=> [8,19] = [A,B].
```

Thus the same independently selected physical p33 object has

```text
page-number address33 -> [e,-K]
page-rune-count address214 -> [A,B].
```

Its source layout already carries the p23-derived state packets `[K,A]` and `[e,g]` in the first two red title groups. The page-number/size register therefore reproduces complementary state quantities without reading p33 body ciphertext.

This relationship was noticed after the state assignments were known, so it is mechanism compression rather than a blind state prediction.

## Family boundary

A broad page-total→same-token-page census is not rare enough to promote as a general opcode. Among the 20 unknown pages whose rune totals are below256, five have at least one same-value physical-page peer, producing seven edges overall; cyclic p50 rotations produce at least seven such edges in 48/256 shifts.

The evidential content here is narrower and typed:

- `[3,27]` was independently fixed as the READ OUT key;
- p55's 76-rune count was independently typed as the table circumference;
- p33 was independently selected from p23;
- the exact key byte114 occurs only at addresses33 and76;
- p33's separate rune-count address independently returns `[A,B]`.

Do not use the equality to enumerate unrestricted duplicate-token walks.

## Reproduction

- SFT: `sims/lp2_p55_count76_p33_readout_key_sft.cjs`
- P23→p33 route: `im-results/lp2-p23-fivedot-totient-origin.md`
- Authenticated READ OUT key provenance: `im-results/lp2-2013-all-around-p50-p53-receiver.md`
- P28/DH23 route: `im-results/lp2-p57-find28-p28-centerword-dh87-loop.md`
