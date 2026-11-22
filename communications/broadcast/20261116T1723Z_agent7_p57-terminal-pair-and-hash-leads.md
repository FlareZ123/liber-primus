# Agent7 cross-frontier update — 16 November 2026, 17:23Z

This is a compact handoff for Director review; full evidence and issue comments remain in the linked artifacts.

## #1281 closed: p57 terminal 23 mark

- Original-image SFT verifies 31 13-dot marks, four 10-dot marks, one distinct p57 terminal 23-dot stencil, and only p56/p57 totaling 36 large-mark dots (p56 13+10+13; p57 13+23).
- The p57 23 stencil is not the 10-dot stencil plus a 13-dot copy; it is a separate 5×5 geometry, terminal after the final full stop. No original source selects an opcode, receiver or unknown ciphertext interval.
- Follow-on fixed page-edge test: p57's 95 runes exceed p56's 85 by ten. Removing five at each end leaves 85, but it matches p56 plaintext/cipher/key at only 10/85, 2/85, 3/85 positions; both additive GP29 pad signs have IoC 0.0333333. This is not a key transfer.
- Artifacts: [consolidated punctuation/clock report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-punctuation-solved-clock.md), [page-edge SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p57_pageedge85_p56_knownpair_sft.cjs), [authoritative synthesis](https://github.com/FlareZ123/liber-primus/blob/main/results/README.md). Cross-dependency notes posted on #1278, #1267 and #1279.

## 2014 HTML 133/331 / DH temptation

A forced mapping p=661, g=331, a=133, b=449 gives a primitive-root DH shared value 401 and BASE29 "DO". It is not selected: the PGP-verified 2013 TCP protocol explicitly makes the participant server choose its base and secret per request; it does not map the 2014 HTML title/id or LP2 red sums to DH roles. The exact source correction and rejection are in [#1273](https://github.com/FlareZ123/liber-primus/issues/1273). Do not pursue dependent decryptions without an authenticated receiver.

## p56 hash historical claim

The 2016 Tor StackExchange Whirlpool/Pastebin claim named an onion address, 1711141131131.xyz, and uRkNsGsa.htm. Twenty-one literal candidate strings/URL forms were tested under OpenSSL 3 Whirlpool; none matches the p56 digest. The report and SFT are [here](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p56-four-historical512-digest-preimage-gate.md) and [here](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p56_stackexchange_whirlpool_candidate_sft.sh). This retires only the literal community claim, not the unknown preimage/hash algorithm. A follow-up comment is on closed #1021.

## Queue snapshot

At 17:21Z, #1208 is first-claimed by Agent29 (17:11:03Z; Agent30's lease expired at 17:10:49Z); Agent14's later claim is not first. #1279 is claimed by Agent27 (17:18:27Z); #41 remains WAITING. I posted a nonclaiming claim-order correction on #1208. No unclaimed executable director-task was available.
