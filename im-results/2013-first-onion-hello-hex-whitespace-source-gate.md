# 2013 first-onion hello: hex-preserved whitespace, unsigned prime palindrome

**Decision (11 November 2026):** The source-preserved 2013 `hello` hexdump really contains the exact six spaced blank lines **[5,3,2,2,3,5]**. The sequence is mirrored and prime-valued and resembles the separate `forest` message's five runs **[2,3,5,3,2]**, so an intentional authorial convention is plausible. **No independent 2013 original-era capture of the same `hello` bytes, nor any historical instruction assigning this sequence a unique operation or later LP2 key, has been established.** Treat it as an authentic *surviving archive's unsigned transport detail*, not an authenticated key selector or decoded text.

## Exact source bytes and the witness distinction

The local `resources/historical/cicada2013-first-onion-hello.asc` (Git blob `867f15cf3da05d75ff5b1450b571429c1419f656`) has 996 bytes and six blank-line ASCII-space runs after the signed-message header:

| Original line | Zero-based file byte offset | ASCII spaces |
|---|---:|---:|
| 4 | 47 | 5 |
| 6 | 64 | 3 |
| 8 | 105 | 2 |
| 10 | 131 | 2 |
| 12 | 145 | 3 |
| 14 | 154 | 5 |

Independent-format check: the archived first-onion response's **16-line original-looking hex representation**, `neuroretransmit/cicada/2013/004-first-onion/hello.txt` ([source](https://github.com/neuroretransmit/cicada/blob/1f9037324873664116cb3578a3e05ff3dd0300a5/2013/004-first-onion/hello.txt), Git blob `c223cff929874153ea519d832c0ded3ce1e17a23`), decodes to **all 996 identical bytes**, including every `20` and `0a` in the six runs. Its fixed hex-record offsets 0,65,...,975 also reproduce the exact message. This shows the spaces existed before conversion from the *surviving hex representation* into the `.asc` transcript, but the hexdump and the decoded copy belong to the same archive lineage and are **not two independent original-era witnesses**. The archive first committed this record on **2022-12-05**; the README expressly labels the accompanying `server.py` as reconstructed.

An independent repository's `iBotPeaches/cicada_3301/messages/2013/very-good.asc` ([source](https://github.com/iBotPeaches/cicada_3301/blob/a2a5fb053dedeafafff76f1b7735c7c9c74c133b/messages/2013/very-good.asc), Git blob `8bd13123ecb11cb797890b3b84e2e2603a6cc747`) first committed in **2024-01-21**, preserves the same visible message and exact signature but **omits the 20 trailing spaces**. The clean file is 976 bytes. Removing only trailing ASCII spaces before newlines from the preserved 996-byte file yields the cleaned 976-byte file **byte for byte**, signatures included. Therefore OpenPGP's verified cleartext is identical despite the difference. The six lengths are outside the signed content, precisely as cleartext-signature trailing-whitespace canonicalization requires.

The `neuroretransmit` historical hexdump and signature can establish that an archival representation contained spaces, but **cannot establish who first created them**. The `scream314` prior-work ledger [explicitly discussed the same 5-3-2-2-3-5 pattern](https://github.com/scream314/cicada3301/blob/37d83dd2c4bc1e0571e9261042b771c1e2d834ea/hints_never_used.md); that note was added/corrected on **2022-04-24**, well after the 2013 event. It is useful historical prior art, not a contemporaneous independent raw TCP capture.

## Adjacent-source test and possible interpretation

Another distinct 2013 source object `resources/historical/cicada2013-forest-clue.asc` preserves five blank-line runs **[2,3,5,3,2]** (Git blob `78d4eaf01df3e13e8d3aba0a113cee7c76523ce0`). Both lists are palindrome-like and consist of small primes. This makes deliberately designed formatting reasonable as a hypothesis: the earlier 2012 and later 2014 signed-message transports also have documented prime-valued spaces. However this cross-object resemblance does **not** supply a reading order, value-to-operation map, or a bridge to an unknown LP2 rune. The archived ICMP-echo message has **no corresponding positive trailing-space runs**, showing that this formatting was not inevitable across all copies.

**Gate and next decision:** No original-era independently witnessed raw `hello` capture or unique historically supplied downstream decoding rule was recovered in the bounded source search (pinned `neuroretransmit` and `iBotPeaches` archives, `scream314` ledger, and indexed exact-hexdump/2013 retrospective records). Do not perform a whitespace-to-ASCII, variable word-count, coordinate, number-service or p50-key search based only on this palindrome. Retire this sequence as a *free-standing instruction* pending a genuine independent original-era byte witness **and** a source-selected consequence. The 2013 TCP `hello` command, reconstructed in a later archive, is separate from the independently signature-authenticated BASE29/DH/NEXT protocol; this test does not merge the two.
