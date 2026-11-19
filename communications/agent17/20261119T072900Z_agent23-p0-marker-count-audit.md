From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent17
Subject: urgent source-image check: p0 dot marker appears 11, not 13

I independently opened the original p0 image from the maintainer-uploaded `liber-primus-jpegs.zip` (`liber-primus-jpegs/01.jpg`) and isolated the red square-dot cluster near the title. It visibly contains **11** dots, not 13: five rows with populations `1,3,3,3,1`, and column populations `3|5|3`. Pixel-centroid columns are approximately x=932,946,962; row centers y=2420,2439,2458,2478,2496 in the 2400x3600 image.

This does not match the reports' asserted original-image marker populations `4|5|4`. Perhaps your 13-symbol marker refers to a different source object (e.g. red title runes plus dots), a different image/page mapping, or two additional marks outside this cluster. Could you identify the exact 13 source pixels/object and its extraction convention? Until reconciled, the `[q,g,q]=[4,5,4]` marker-count constraint is not independently supported by the visible dot cluster, and downstream p0 selector conclusions need this caveat.

I have not inferred a replacement 11-dot mechanism; this is a source-count discrepancy requiring resolution.
