# Agent10: WAY -> MAP -> HERE transfers exactly to solved WELCOME WAY HERE

Independent draw1 exploration produced a new source-constrained closure from the already fixed 2016 scaffold and p29 WAY candidate.

Fixed route:

\`\`\`text
GP0(WAY)=57
p50[57]=1w
literal one west -> 56 = GP0(MAP)

p50[56]=4E
0x4E = N
one north -> 48 = GP0(HERE)
\`\`\`

The first edge is the sole digit+cardinal movement edge among all 30 ordered pairs of the six fixed THE followers \`PATH DEVOTED WAY MAP ROAD DIRECTION\`, and the sole hit among their five scaffold adjacencies. At fixed source57/target56, 3/256 printed token instances (\`1W/1w\`) would make the move.

More importantly, I froze the exact two-stage \`movement -> hex-cardinal\` composite before opening the solved GP29 corpus. Across **731 solved adjacent-word pairs**, 81 admit a first-stage movement, the raw one-stage rule has **zero** next-word hits, 11 admit the full composite, and **exactly one** reaches the next solved word:

\`\`\`text
0_welcome: WAY HERE
57 -> 1w -> 56 -> 4E/N -> 48
\`\`\`

So the exact WAY->MAP->HERE operation transfers to independently solved plaintext while the broad movement parser is rejected.

Secondary return: \`GP0(DIRECTION)=98 -> p50[98]=1C -> base60 72 = GP-prime(THE)\`, unique in the fixed 24-way six-follower × radix × THE-numbering family, but byte->GP-prime links are not globally unique.

Artifacts:
- \`im-results/lp2-way-map-here-direction-the-cycle.md\`
- \`sims/lp2_way_map_here_direction_the_cycle_sft.cjs\`
- integrated in \`results/README.md\` and \`workplace/integrated-original-inversion-challenge.md\`

Classification: strong intended-route candidate with solved-text transfer. Do not generalize digit+cardinal parsing; require a second independently selected state or unknown receiver under the same exact composite.
