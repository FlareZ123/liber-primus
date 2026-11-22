# 2014 Onion2 timing: a second contemporary IRC witness resolves the 190–191 interval bridge

**New historical source reconstruction, 11 November 2026.** The 2014 Onion2 output stream was saved in full, but the merged interval record carried only a **30-minute total** for the arrivals of positions **190 and 191**, allowing five 5-minute-unit partitions. A separate independent contemporary watcher in the original `#cicadaops` channel recorded the two intervening site changes. Alignment to a second contemporary `#cicada3301` bot recording byte *lengths* fixes their sequence as **10 then 20 minutes**, or `[2,4]` five-minute units. This is strongly corroborated participant observation, not an authenticated server scheduler or an LP2 cipher key.

## Original witness A: MassoBot site-change clock

The [original archived `#cicadaops` IRC file](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadaops.freenode.log), pinned at `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, records MassoBot beginning at **2014 Jan 07 15:04** and explicitly monitoring `https://cu343l33nqaekrnw.onion`. The author of that participant bot explains on source line **1888**, 19:09: *“the purpose of massobot is to have the times in here, he doesn't log the changes”*. The four bracketing events are:

| Original file line | Archived clock | Bot text |
| --- | --- | --- |
| **1857** | 18:30 | `Data on the site changed in line: [1]` |
| **1864** | 18:40 | `Data on the site changed in line: [1]` |
| **1876** | 19:00 | `Data on the site changed in line: [1]` |
| **1891** | 19:10 | `Data on the site changed in line: [1]` |

This bot records page changes, so each event requires separate evidence for which hex byte was appended.

## Original witness B: BotSottile's independent byte lengths

The [archived `#cicada3301` participant log excerpts](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/003-second-onion/interval-irc-logs.txt) preserve source-original lines and byte counts:

| Original archived line | Time | Direct observation | Position identified |
| --- | --- | --- | --- |
| **2010** | 18:30 | `d6 -- new len: 189` | 189 |
| **2038** | 18:56 | full 190-byte growing prefix, ending `b5`; watcher had reconnected | 190 already exists |
| **2044** | 19:00 | `bc -- new len: 191` | 191 |
| **2056** | 19:10 | `a9 -- new len: 192` | 192 |

The original final 256-byte source independently fixes positions 189–192 as `d6 b5 bc a9`. Source B brackets byte190 between 18:30 and18:56. Source A reports the site change at18:40, selecting byte190's actual observed release minute. At19:00, both source A and source B record change and the explicit appearance of byte191; at19:10 both again agree for byte192. The inferred gaps are therefore **189→190: 10 minutes**, **190→191: 20 minutes**, **191→192: 10 minutes**.

## Resolution, reproducibility and scope

The previously documented bridge allowed five `k` pairs `[[1,5],[2,4],[3,3],[4,2],[5,1]]`; original-source paired timing selects **`[2,4]`**. The [source-record JSON](../resources/cicada2014-onion2-timing.json) now adds a separate `bridge_resolution` with the two raw witness references, line numbers, event times and source-linked byte counts; the **112 original individually observed interval cells and original five bounded variants remain unchanged**. The [standalone clock/countercheck SFT](../sims/onion2_massobot_timing_bridge_sft.cjs) checks both witness contracts against the original final bytes, the inferred intervals, and the pinned original candidate list.

**What remains unknown:** the 2014 server's original code, its true generator state, whether time and byte values shared a PRNG, and most early arrival intervals **1–142**. The watchers did not begin in time to recover those early observations; no speculative interpolation is added. The source-reconstructed split can be passed to any *newly independently discovered* generator model. The existing two timing/byte interleaving sweeps tested all five alternatives, including this one, and remain negative. No original unknown Liber Primus runes were decrypted and no key was authenticated.
