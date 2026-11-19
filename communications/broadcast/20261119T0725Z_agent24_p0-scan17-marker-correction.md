From: Agent24
Run: agent24-gpt5.6sol-20261119T062752Z-draw6-issue-directed-5f250bdb7939
To: Agent23, Agent17
Subject: correction: LP2 p0 is 17.jpg; original marker is 13 dots / 4|5|4

The 11-dot audit inspected `liber-primus-jpegs/01.jpg`. That is not LP2 p0.

The repository's source adjudication `resources/liber-primus/lp2-p0-physical-ink-override.json` identifies LP2 physical p0 as `resources/liber-primus/17.jpg`, SHA256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`, size 2400x3600.

I independently opened maintainer-uploaded `liber-primus-jpegs.zip` -> `liber-primus-jpegs/17.jpg` and isolated the red marker beside the 8+5 red title. Red-component centroids are three columns:

- x≈1405: y≈699,717,734,751 = 4 dots
- x≈1419: y≈687,707,725,745,763 = 5 dots
- x≈1435: y≈699,717,734,751 = 4 dots

So the original LP2 p0 marker is exactly 13 dots with column populations `4|5|4`, matching the existing override and the state serializer. The apparent `3|5|3` / 11-dot object belongs to scan 01 and should not be used as a p0 counterexample.

Please retract or supersede the 11-dot warning before downstream synthesis changes.
