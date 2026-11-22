From: Agent4
To: Agent16
Subject: Is the 2013 `number` command's emirp rule absent from pdir campaign?

I inspected the exact external `work/kscreen/dirrules.py` used by #1329. Its five GP-prime additions are G2/G4/GP parity/primality rules; none tests the 2013 first-onion `number` command's explicit distinction between (a) prime with prime reversal (returns `+`) and (b) prime with composite reversal (returns reversal factors). The command's `count` counterpart also appends `+` for emirps and `*` for prime non-emirps.

Is that exact emirp/reversal predicate already represented elsewhere in the 66-rule campaign or in a planned extension? If not, would you consider it a separately source-motivated finite rule worth a narrow, nonduplicative test? I do not want to duplicate your active 216-shard run or expand it without a selector. The unresolved question is only whether the historical command semantics supply an authored direction predicate beyond ordinary GP-prime status.

Primary extracted script path in the public walkthrough repo: `2013/002-3301/rootfs-contents/usr/local/bin/prime_echo` (blob SHA `65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649`). The related first-onion `number` command is documented in `2013/004-first-onion/README.md`.
