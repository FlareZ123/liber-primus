# 2013 first-onion prime-gap source audit

**Current decision (19 November 2026; Agent18 initial audit, Agent25 source correction, Agent1 source recovery):** the raw participant Pastebin identified by the 2016 Uncovering Cicada wiki as “PRIMES TELNET OUTPUT” has now been recovered. It is a source-dated, first-hand participant paste, not a cryptographically authenticated Cicada server response or packet capture. The 180-prime omission and two doubled spaces are therefore contemporary participant observations preserved in an original Pastebin object; whether the original first-onion server emitted them intentionally remains unverified. No LP2 consumer, cipher key or plaintext follows.

## Recovered participant artifact

- Original page: https://pastebin.com/xGY4pbHV
- Raw content: https://pastebin.com/raw/xGY4pbHV
- Pastebin-displayed creation date: **8 January 2013, 07:16:24 AM CDT**. This is site metadata, not a cryptographic timestamp.
- Raw response: **HTTP 200**, **1,387 bytes**
- SHA-256: `591b3cf337c803eef76a16466fa6ebc711aa1f0a3b26d1520573abda89889a94`
- The content begins with the literal command `primes`, followed by a blank line and the numerical output.
- It contains **284 prime tokens**: the first 20 primes (2 through 71), followed by primes with one-based ordinals 201–464 (1,229 through 3,301).
- Exactly **180 consecutive primes** are absent: ordinals 21–200, values 73–1,223.
- Exactly two doubled spaces occur, after **29** and **3,257**, in the snippets `29  31` and `3257  3259`.
- The final printed prime is **3,301**, not 3,299.

The full source classification and reproduction details are in [the recovered original-source report](2013-first-onion-primes-xGY4pbHV-original-source.md). The raw third-party paste is identified by its URL, length and digest rather than republished verbatim.

**Important boundary:** this is an anonymous participant paste labelled as the service's output. It does not preserve the TCP/Telnet transport, remote host/port, session transcript, server binary, author identity or a Cicada signature. The displayed Pastebin creation date is useful source metadata but is not proof that the service generated the bytes on that date.

## Source chronology and corroboration

1. **8 January 2013 — recovered participant paste.** The exact raw xGY4pbHV object above supplies the command, prime sequence, spacing and displayed date.
2. **14 January 2013 — separate missing-primes paste.** [Pastebin 6srsAN1E](https://pastebin.com/6srsAN1E), preserved in [the companion source note](../resources/external/2013-01-14-missing-primes-pastebin.md), lists the 180 omitted primes. It is a separate anonymous participant artifact, not the raw telnet response.
3. **9 May 2016 — Uncovering Cicada wiki export.** The preserved [“Mentioned PRIMES” page export](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/corpus/C-community/wikis/uncovering-cicada/export_cur_00120.xml), page ID 2213, explicitly links xGY4pbHV as “PRIMES TELNET OUTPUT”, links 6srsAN1E as “MISSING PRIMES”, and records the two spacing anomalies and the 71→1229 jump. This shows the association existed by the 2016 revision, but is not a complete revision history or a separate raw session.
4. **24 January 2018 — copied historical witness.** The first [scream314 hints_never_used.md revision](https://github.com/scream314/cicada3301/blob/fa795931b7e50bbb3b90322c8e456bcad8f5f034/hints_never_used.md) repeats the jump and unusual spacing. It corroborates early circulation, not an independent terminal session.
5. **December 2022 — retrospective reconstruction.** The [neuroretransmit first-onion README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) describes reconstructing the site. Its [2022 server.py commit](https://github.com/neuroretransmit/cicada/commit/4b66f55163c98894087ddfbf6d4fa33d6198f0e7) implements an omission of primes 73–1223. This is consistent with the participant paste, but is not independent proof of the original service.

The separate wiki page [“The Telnet Prompt”](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/corpus/C-community/wikis/uncovering-cicada/export_cur_00840.xml), page ID 2189, also links xGY4pbHV. These wiki records are indexes, not signed server evidence.

## Separate primary-source constraints

The original CicadaOS rootfs [prime_echo script](../resources/historical/cicada2013-os-original-prime-echo.sh) is a **different service**. It emits all 464 primes from 2 through 3,301, including 73–1,223, and pauses for two seconds at 1,033 and 3,301. Its complete list does not refute a gap in the separate first-onion telnet interface.

The cryptographically verified [2013 signed TCP-server challenge](../resources/external/2013-tcp-server-signed-source.md) specifies BASE29, DH and NEXT. It does not authenticate the first-onion terminal's PRIMES command or its output.

## LP2 relationship: structural, not a consumer

There are 180 primes in the omitted interval. LP2's p49–p51 numerical table has 180 interior cells; solved p56+p57 contain 180 runes; p55 has 76 runes, matching the table's 76-cell perimeter. These are real count correspondences, but no first-party source selects which prime maps to which cell or rune, supplies a traversal, specifies an encryption operation, or establishes a state reset.

The fixed direct consumers already tested against original data are negative. See [the 180/76 terminal register gate](2013-telnet-missing-primes-terminal-180-76.md), [the p50 interior all-secret XOR gate](lp2-2013-missingprime-p50-inner180-allsecret-xor-gate.md), and [the source-first p50 route](lp2-2013-telnet-180-gap-p50-inner180-source-route.md). Do not run another key search because the 180 counts agree.

## Current decision and remaining gap

The historical participant paste is recovered; **the raw-source-recovery part of this question is complete**. The separate 6srsAN1E list is already preserved and is not needed to establish the 180 values. The unresolved historical question is narrower: whether an original first-onion server implementation or independent contemporaneous session confirms that the participant paste exactly reflects server output, including its spacing and omission. The unresolved cryptanalytic question is separate: no authenticated first-party instruction assigns this sequence to an LP2 receiver or operation.

Preserve xGY4pbHV as source-dated participant evidence, not as a signed Cicada key. Reopen only on an original server artifact, independent raw session, or an independently selected LP2 consumer.