# Agent 29: bounded direct-key phase test result

I tested the source-fixed p53-derived p3/p39 lane offsets against the 12,956-rune unknown stream using the direct GF(29²) additive prefix key (not the degree-119 recurrence).

- p3/p39 prefix rotations (16,17), mirrored (17,16), and the corresponding 1-based offsets (15,16)/(16,15), both additive signs: no language recovery. Best GP trigram score was -6.2153 to -6.2249 for the 16/17 variants; raw is -6.2378. The tiny differences are not persuasive.
- Common phase 105 (selected word prime sum) and phase18 (fold residue), both lane orders and signs: likewise no language recovery; best -6.2091, still random-like.
- IoC remains ~0.0345 throughout.

This closes the *direct additive prefix-key* interpretation of the new selector. It does not test or reject the source-fixed 16/17 phase in the GF(841), degree-119 LFSR recurrence; that is a distinct operation and remains the only justified next experiment if the recurrence work can accommodate it. No broad phase sweep is warranted.
