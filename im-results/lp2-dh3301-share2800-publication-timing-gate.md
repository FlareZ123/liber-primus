# DH3301 share 2800: pre-LP2 public-availability gate

**Status:** bounded historical negative, 18 November 2026  
**Issue:** #1576  
**Agent:** Agent11

## Decision

No pre-LP2 public witness of the exact `2800` session field was recovered in the dated corpus surveyed. A surviving contemporaneous public record establishes that solvers knew Cicada had exercised `dh 3301` on 3 March 2013, while its server-status log exposes only command names and timestamps. It contains neither `2800` nor `1067`.

The exact participant-side tuple now preserved in `neuroretransmit/cicada` enters that repository's public Git history on **23 April 2024**, in commit `f403afb9e6db2a2fb3825c7b4801c2af0ddd7228` / PR #14, which added the IRC/client logs. Its adding diff contains `DH 3301`, base `2757`, secret `331`, server public value `1264`, client share `2800`, and shared value `1067`.

Exact searches across the imported archive locate this full tuple only in `irc-logs/clientlog-1362290293-9.txt` among Cicada-relevant records. The imported contemporaneous Freenode corpus supplies no second public-channel copy.

Therefore p57 -> p50 -> `2800` remains useful as a **retrospective identifier** of this preserved 2013 session. Current evidence does not support treating recognition of `2800` as an intended human step available to ordinary LP2 solvers in May 2014.

## Evidence

### Contemporaneous public server test

The Uncovering Cicada page **NEWS! TCP Servers had been tested!** preserves a 3 March 2013 server log with three `dh 3301` invocations followed by `next`. It records no DH parameters, public shares, or shared result. Its archived menu dates the item to **3.3.2013 08:00 GMT**.

- https://uncovering-cicada.fandom.com/wiki/NEWS!_TCP_Servers_had_been_tested!
- https://uncovering-cicada.fandom.com/wiki/Archived_Menu

This proves public awareness of the command family while failing #1576's exact-field requirement.

### Exact tuple in the preserved participant log

- https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/clientlog-1362290293-9.txt

```text
2013-03-03 05:59:34.745 Received line: 'DH 3301\r\n'
2013-03-03 05:59:34.745 Selected base 2757 and secret 331
2013-03-03 05:59:34.745 Sending line: '01 OK 2757 1264'
2013-03-03 06:00:10.962 Received line: '2800\r\n'
2013-03-03 06:00:10.962 Sending line: '03 DATA 1067'
```

The same connection proceeds through `NEXT` to the signed invitation beginning `DO NOT SHARE THIS INFORMATION!`, consistent with participant-side end-stage material.

### Public Git preservation begins in 2024

- https://github.com/neuroretransmit/cicada/commit/f403afb9e6db2a2fb3825c7b4801c2af0ddd7228
- https://github.com/neuroretransmit/cicada/pull/14

GitHub dates the adding commit to **23 April 2024**. Its diff adds the exact `2800` / `1067` lines, and PR #14 lists `irc-logs/clientlog-1362290293-9.txt` among the imported files. This repository proves public preservation from April 2024 onward rather than public availability before LP2.

### Later disclosure pattern

The current Uncovering Cicada 2013 walkthrough says similar final-invitation reports could not initially be confirmed and describes rediscovery around 2020 of an old Pastebin carrying the signed 2013 invitation. A November 2019 Reddit discussion likewise treats the signed 2013 invitation as newly surfaced material. This is contextual evidence only and does not independently date the client log.

- https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_%282013%29
- https://www.reddit.com/r/cicada/comments/dqo7fp/the_leaked_email_with_pgp/

## Search boundary and falsifier

The bounded search covered exact tuple strings and distinctive response lines, the surviving Uncovering Cicada server-test and archive-menu pages, Git history and PR lineage for the current archive, the imported 2013/2014 Freenode/client-log corpus, and exact archive code searches for the tuple components.

This is an evidence-backed absence claim over the surveyed public corpus. A single independently dated public source from before the May 2014 LP2 release that prints client share `2800` in this DH3301 session would reverse the decision.

## Research consequence

Preserve the p57 -> p50 numerical bridge and its selectivity evidence. Do not use “a 2014 player recognizes 2800 as this 2013 DH share” as source-supported intended-path evidence until a pre-LP2 exact-field witness is recovered.
