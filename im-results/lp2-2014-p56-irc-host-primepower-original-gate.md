# 2014 IRC p56 continuation witness and page-prime-power original-cipher gate

**Decision, 14 November 2026 (Agent9).** No authenticated unknown LP2 plaintext, original key or p56 continuation URL was recovered. Two independent source-bounded questions were answered: (1) whether one **period May–August 2014** IRC speaker left a contemporaneous `.onion` host near discussion of the p56 hash, and (2) whether a **15 June 2014 participant's executable page-number prime-power hypothesis**, which fits both solved p56 and clear p57, can directly invert untouched p55. The host findings are unverified attempts or unrelated links; the exact cipher proposal fails an authenticated 29-symbol encoder rule on **all eight** F-bypass assignments.

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
F -> F              without consuming a prime key position
```

The page number and exponent are **author-independent historical solver conjecture**. The exponent sign is fixed by the IRC author's explicitly stated p56/p57 values, not fitted to p55. The exact solved p56 key is `prime[i]-1`; for p57, `prime[i]^0-1 = 0` leaves every clear rune invariant.

The new [source-original page-power SFT](../sims/lp2_2014_pagepower_p55_ftransparent_sft.cjs) verified the real source data before testing: **p56 decrypts all 85/85 original ciphertext runes** to authenticated `AN END...` plaintext under bypass mask8, and its strict source-native encoder reproduces the exact 85 ciphertext runes. Clear p57 gives **95/95** identical original runes in both directions. These are meaningful controls for the historically motivated extension, though p56 was already known.

Original p55 has exactly **76 ciphertext runes**, with three ciphertext F glyphs at 0-based positions **15, 25, 41**. Because an F in ciphertext can also represent encrypted non-F plaintext, all **2³ = 8** possible literal-F bypass masks were tested. The original p56 cipher's authenticated property is **plaintext-F implies ciphertext-F**. Therefore any non-F ciphertext position forced to plaintext F is an exact impossibility, irrespective of English scoring.

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

**All eight produce at least one impossible F.** Accordingly all eight fail strict forward reconstruction of original p55; the best 76-rune output has index of coincidence only **0.03543860**, independently demonstrating no coherent original-language passage. The second [Windows/Node22 manually dispatched run 43600830105](https://github.com/FlareZ123/liber-primus/actions/runs/43600830105) passed source controls, mask enumeration and rejection asserts.

## Fork and scope

The **exact** page-reset, GP29 additive, prime-power family selected by the original June 2014 page-number hypothesis is rejected for p55. This establishes that extending p56 by the simplest source-era exponent cannot directly solve the preceding encrypted page. A different clock, signed operation, register, variable-rate symbol transport, or source-selected independent key is outside this finite model, but requires new original evidence before spending additional search resources.

The IRC source-host screen finds no **verified** target within its finite source-context windows; some links are unrelated or explicitly speculative. The known LP2 distributor must not be confused with the p56 hash preimage. There is no basis here to claim that one of the found hostnames is the actual continuation, or that any unseen 2014 participant had deciphered the manuscript.
