# 2014 IRC p56 continuation witness and page-prime-power original-cipher gate

**Decision, 14 November 2026 (Agent9).** No authenticated unknown LP2 plaintext, original key or p56 continuation URL was recovered. Two independent source-bounded questions were answered: (1) whether one **period May–August 2014** IRC speaker left a contemporaneous `.onion` host near discussion of the p56 hash, and (2) whether a **15 June 2014 participant's executable page-number prime-power hypothesis**, which fits both solved p56 and clear p57, can directly invert untouched p55. The host findings are unverified attempts or unrelated links; the **additional global F-transparency hypothesis** fails on all eight p55 F-bypass assignments. The original solved p56 establishes only **one** plaintext-F bypass, so this is a conditional model exclusion rather than an unconditional rejection of a page-power cipher.

## Immutable original evidence and method

The byte-pinned original `#cicadasolvers.freenode.log` source is **18,487,233 bytes**, Git blob **`bdd277c14f94c34b5ae714cd00c238065beeed4e`**, from `neuroretransmit/cicada` original history. The independent `#33012014.freenode.log` is **8,629,610 bytes**, Git blob `a2880b1db31ce523599ef30ca2e55291bf295900`. The source and historical collection scope are documented in [the pinned corpus register](../resources/external/2014-cicadasolvers-freenode-log-corpus.md).

The new [read-only, pinned-source SFT](../sims/lp2_2014_p56_onion_witness_sft.cjs) inspects only IRC lines directly dated **May through August 2014**, using a frozen literal reference to p56, its digest or the phrase `page that hashes to`. It pairs only 16-character historical Tor v2 hostnames in the same date and within **25 original IRC lines** of a reference. The source-byte SHA/size and a planted same-date positive are checked first. Existing manual-only [workflow](../.github/workflows/lp2-2014-irc-source-manual.yml) [run 43600376343](https://github.com/FlareZ123/liber-primus/actions/runs/43600376343) completed successfully.

The primary log has **243 dated p56 anchors**, **228 dated host-bearing lines**, and **nine host-bearing lines with same-day near context**; the independent `#33012014` archive has **zero** such May–August anchors or hosts. The nine primary-log source lines form these distinguishable groups:

| Exact line, date (2014) | Literal v2 hostname(s) | Source-visible context and evidentiary status |
| --- | --- | --- |
| L183225, May 20 | `gy3hoy5lon4dy6xs.onion` | Nick `nopd` expressly presents a speculative base32 hash idea, calls it unreachable and describes it as a random idea; nearby p56 question L183214 |
| L183925, May 20 | `d3znuqex57otcxil.onion` | Nick `onecool` says only `Trying:`, adjacent to participant p56-formula discussion L183923/L183928; **unverified guess**, no successful response |
| L200869, L200873, June 15 | `2222243pi3jvhgnt.onion`, `222224h72gngmbr4.onion`, `kpai7ycr7jxqkilp.onion`, `kphs2h27tyk6rdg3.onion` | Automated `TaiiwoBot` Pastebin previews; p56 equation discussed eleven to eighteen lines later, no stated page association |
| L200870, L200875, June 15 | `5qlkurngz6rlbhyw.onion` | `e0` describes a Tor onion directory/list count, unrelated to hash-preimage claim |
| L204310, June 18 | `ixoogbkuiypuy2d7.onion` | `Nem0` posts a URL plus surprised emoticon; p56 keystream discussed 22 lines earlier, **insufficient direct linkage** |
| L205579, June 19 | `6b3nwvuihzz4yjks.onion` | `Nem0` posts the host; near a separate `Near` assessment that p56 was practically unencrypted, but no claimed hash match |
| L219865, July 11 | `ky2khlqdf7qdznac.onion` | Known *distributor* of LP2, restated by a participant; later page56 discussion; **explicit negative control** |

The historic plaintext hash directive is visibly cited, e.g. L192527 (May 31), and L206244 (June 19). These logs are original period **participant conversation**, unauthenticated as any creator instruction. The test's same-day 25-line association is deliberately permissive: it discovers candidates and does not establish causal relationships or prove no address exists outside the sampled windows.

## New exact test: June 15 page-prime-power hypothesis

The same 2014 original channel at **L200880 / L200887**, nick `nikkler`, describes a prime-number power formula varying with page number. The statement gives exponents 1 for solved p56 and 0 for clear p57. This independently selects the simplest natural extension to p55: exponent **2**. In source-native 0-based prime indexing, freeze

```
K(page,i) = (prime[i] ** (57 - page) - 1) mod 29
C = (P + K) mod 29   for non-F plaintext
F -> F              without consuming a prime key position (ADDITIONAL HYPOTHESIS)
```

The page number and exponent are **author-independent historical solver conjecture**. The exponent sign is fixed by the IRC author's explicitly stated p56/p57 values, not fitted to p55. The exact solved p56 key is `prime[i]-1`; for p57, `prime[i]^0-1 = 0` leaves every clear rune invariant.

The new [source-original page-power SFT](../sims/lp2_2014_pagepower_p55_ftransparent_sft.cjs) verified the real source data before testing: **p56 decrypts all 85/85 original ciphertext runes** to authenticated `AN END...` plaintext under bypass mask8, and reencryption with that same observed one-position bypass reproduces all 85 ciphertext runes. This solved control does not establish a universal F-escape rule. Clear p57 gives **95/95** identical original runes in both directions. These are meaningful controls for the historically motivated extension, though p56 was already known.

Original p55 has exactly **76 ciphertext runes**, with three ciphertext F glyphs at 0-based positions **15, 25, 41**. Because an F in ciphertext can also represent encrypted non-F plaintext, all **2³ = 8** possible literal-F bypass masks were tested. For the **frozen proposed all-transparent-F extension**, every plaintext F would have to emit ciphertext F. This extra global implication is **not established**: solved p56 contains exactly one plaintext F, at local index 56, and it is bypassed. On other pages a plaintext F might instead be encrypted. The following positions therefore disprove the *all-transparent-F extension*, independently of English scoring, but do not disprove every possible page-specific positional bypass schedule.

| p55 literal-F mask | Positions of forbidden decrypted F in original p55 |
| ---: | --- |
| 0 | 28, 54, 57 |
| 1 | 44, 64 |
| 2 | 44, 64 |
| 3 | 33, 56 |
| 4 | 28, 44, 64 |
| 5 | 56 |
| 6 | 56 |
| 7 | 33, 46 |

**All eight violate the tested universal transparent-F rule.** Each still has a positional-mask Vigenère inverse if plaintext F is permitted to undergo normal encryption at other locations. The best 76-rune output has index of coincidence **0.03543860**, offering no convincing plaintext under this simple extension. This is a bounded negative for the specific rule, without a cryptographic impossibility claim for unconstrained F handling. The second [Windows/Node22 manually dispatched run 43600830105](https://github.com/FlareZ123/liber-primus/actions/runs/43600830105) passed source controls, mask enumeration and rejection asserts.

## Independent July 28 layered-prime necessary-condition test

The same original IRC archive also records a **28 July 2014** participant discussion at L228577–L228617. `Hydroperoxy` proposes additional encryption layers on successive earlier pages in response to solved p57's prose about shedding layers; `Nem0` suggests p55 `prime*2`, and `lvkm` explicitly suggests `page 57 = prime seq^0, 56 prime seq^1, 55 = prime seq^2`. These are historically contemporary solver proposals, not signed Cicada instructions, and they supply an independent reason to test a stacked p56-style outer layer without inventing its underlying cipher.

A necessary condition **only for a model assuming the additional all-transparent-F rule** and reusing the p56 prime-totient operation as a page-reset outer layer is that at least one bypass mask admits a strict forward inverse under that rule. The same source-code SFT separately tested all eight masks with exponent **1** (the real p56 key), independently of the exponent2 page-power test above. All eight intermediate streams contain F at positions where original ciphertext is non-F, contradicting *this hypothesized all-transparent-F convention*:

| p55 outer phi(prime) literal-F mask | Forbidden intermediate-F positions |
| ---: | --- |
| 0 | 39, 51 |
| 1 | 28, 62 |
| 2 | 28, 62 |
| 3 | 34, 53, 55, 74 |
| 4 | 39, 62 |
| 5 | 28, 53, 55, 74 |
| 6 | 28, 53, 55, 74 |
| 7 | 34, 61 |

**No input stream is compatible with the proposed globally transparent-F outer layer**, irrespective of the hypothetical inner cipher. However, a position-specific skip rule could encrypt plaintext F on p55, which this test does not exclude. Earlier [p55 moth/phi(prime) 25-seam test](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md) verified round-trip algebra by forcing the same positional skip in both directions. Its forward reconstruction is mathematically correct under such a positional convention. The current eight-mask test adds a conditional constraint for the stricter convention and does not supersede that algebraic statement.

## Fork and scope

The **simple page-reset additive prime-power model combined with global F transparency** is excluded for p55. Under ordinary positional skips it produces nonlinguistic outputs, without yet yielding a formal contradiction. The same qualification applies to a strict all-transparent-F p56 outer layer. We still need an independently selected p55 skip rule, clock, key, or register before asserting that an altered version of either idea can actually recover plaintext.

The IRC source-host screen finds no **verified** target within its finite source-context windows; some links are unrelated or explicitly speculative. The known LP2 distributor must not be confused with the p56 hash preimage. There is no basis here to claim that one of the found hostnames is the actual continuation, or that any unseen 2014 participant had deciphered the manuscript.
