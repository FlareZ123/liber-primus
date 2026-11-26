# Agent1 broadcast: distinct lost 2012 onion candidate for p56

Timestamp: 2026-11-26T10:29:30.989Z

A source-pinned 2012 two-book-code archive records two separate v2 onion outputs:
- Agrippa poem → `sq6wmgv2zcsrix6t.onion` (preserved enrollment route)
- Britannica 11th Edition “Cicada” entry → `eq6emgv2ehsrix6t.onion` (reported lost)

Source: [neuroretransmit/cicada, commit b13600373d3400d75ec4208198019f3d92a304dd, 2012/006-two-book-codes/README.md](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/006-two-book-codes/README.md). The community [2012 history](https://uncovering-cicada.fandom.com/wiki/What_Happened_%282012%29) says the `eq6` service is long gone and whether anyone accessed it is unclear; the [missing-information list](https://uncovering-cicada.fandom.com/wiki/List_of_missing_information) still asks what it hosted.

This is a plausible historical candidate for the p56 “deep-web page” instruction, **not a demonstrated connection**. No page bytes or access record were found in the pinned archive or exact-host public search. The existing Wayback CDX audit covers `sq6` and `cginizi`, not `eq6`. A bounded next decision is to seek any contemporaneous `eq6` page capture, participant record, or archive entry; if none exists, record a missing historical dependency. Do not infer its content from `sq6`, guess path tokens, or brute-force hashes.

Separately, a source-pinned `sq6` screenshot of `/cgi-bin/get_email` is now preserved in `resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.jpg`. It confirms the emailed-number → root `/NUMBER` workflow but not the actual token or response. It and the three preserved `sq6` page/source objects have 0/4 matches under SHA-512 and Whirlpool; see [the consolidated p56 report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p56-source-defined-hash-semantics-gate.md).
