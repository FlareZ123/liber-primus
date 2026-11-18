# First-onion 2013 HELLO whitespace: independent period witness and unresolved meaning

**Reconciled decision (18 November 2026).** The archived complete first-onion HELLO clearsigned message has six deliberately shaped *or incidental* all-space lines with counts **[5,3,2,2,3,5]**. A separately preserved contemporaneously timestamped **7 January 2013 participant IRC hex dump** matches the *first 936 of its 996 bytes exactly*, including all six space runs. This reverses the former statement that the pattern had no independent period witness. **The spaces still lack an authenticated interpretation or an LP2 decoding rule**, and OpenPGP canonicalization does not sign trailing spaces.

## Source-exact space positions

The full `resources/historical/cicada2013-first-onion-hello.asc` (Git blob `867f15cf3da05d75ff5b1450b571429c1419f656`) has 996 bytes. Its six all-space lines are:

| One-based line | Zero-based byte offset | Spaces |
|---|---:|---:|
| 4 | 47 | 5 |
| 6 | 64 | 3 |
| 8 | 105 | 2 |
| 10 | 131 | 2 |
| 12 | 145 | 3 |
| 14 | 154 | 5 |

The independent [IRC XQ9rJSad participant log](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/f0f03edcb029e94b519efcacf1bf2511353e17c2/2013/additional%20docs/logs/all%20cosmos%20posts%20from%207th%20on%20the%20761%20song%20-%20full%20log.txt) (original timestamps 7 January 2013; Git blob `2d865faeec179d6b5984643d8b2af7efa3269f73`) records a hex-dumped HELLO output at lines 3669–3688. Reconstructing each complete two-hex-digit byte gives 936 bytes; the bytes are **identical at every offset** to the first 936 of the preserved complete clearsigned file. Since all space runs occur at offsets 47–154, this is a *period participant report of those exact bytes*, independent of a later edited clean message. The log is still participant testimony carried by an archive, not raw authenticated TCP or a direct PGP signature over whitespace.

The distinct 16-line [`neuroretransmit` HELLO hex text](https://github.com/neuroretransmit/cicada/blob/1f9037324873664116cb3578a3e05ff3dd0300a5/2013/004-first-onion/hello.txt) decodes to **the same complete 996 bytes** and was first committed on **5 December 2022**. Its derived `.asc` is of the same archive lineage and provides no second independent witness. A separate [`iBotPeaches` clean copy](https://github.com/iBotPeaches/cicada_3301/blob/a2a5fb053dedeafafff76f1b7735c7c9c74c133b/messages/2013/very-good.asc), first committed on **21 January 2024**, is 976 bytes, byte-identical after stripping just the **20 trailing spaces** from the 996-byte copy. These signed *visible texts* agree. The earlier `scream314` [5–3–2–2–3–5 observation](https://github.com/scream314/cicada3301/blob/37d83dd2c4bc1e0571e9261042b771c1e2d834ea/hints_never_used.md), committed April 2022, remains prior art, not period first-party decoding instructions.

## What was and was not recovered

The missing part of the **IRC excerpt** is precisely 60 bytes of signature armor and its closing delimiter; the complete earlier archived 996-byte message has no further cleartext after the IRC-truncated point. See the [consolidated HELLO/CLUE source account](2013-first-onion-clue-hello-original-source.md) and [reproducible source test](../sims/cicada2013_count_irc_control.py).

A distinct original 2013 `forest` message (Git blob `78d4eaf01df3e13e8d3aba0a113cee7c76523ce0`) has five runs **[2,3,5,3,2]**, making a deliberate encoding possible. However the first-onion ICMP echo message lacks corresponding positive trailing-space runs; a 2013 source does **not** give an operand, bit order, operation, destination, or relationship to LP2. The 2013 PGP message authenticates its cleartext after OpenPGP canonicalization, **not its exact trailing spaces**. Therefore this historical formatting remains source-observed but cryptanalytically *unassigned*. No unknown LP2 text, key, or intended continuation follows.
