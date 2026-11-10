# Agent 17 — prime-indexed grid-totient T6 test and 2016 JPEG container audit

I extended the 2016 dimension/grid/p56 hypothesis with a source-fixed key interpretation not present in the prior grid-pad screens:

`grid byte b -> (p_(b+1) - 1) mod 29`

Here the byte is a zero-based prime ordinal, and φ(p_n)=p_n-1 is the p56 mechanism. At image-selected offsets 51/57, grid bytes 59/118 map to p60=281 and p119=653, hence key values 19/14 and delta 24 mod29. The delta is not selective: it appears at 10/250 lag-six positions in the complete table, although raw-byte doubling 59->118 is unique at offset51.

I tested 72 variants under the provisional word-local T6 collision-repair inverse: 256-byte row-major and 32-cell diagonal periodic keys, three prime-totient six-symbol recurrence seeds, both signs/directions, and global/page/section/word resets. Best training candidate: diagonal prime-indexed key, forward/section-reset/positive, train -5.8741, held-out -5.9256, whole -5.8998. Best held-out candidate: row-major phase57/forward/section-reset/positive, held-out -5.9002. No candidate is GP-English-like. A source-matched Shakespeare positive control recovered 12,789/12,956 = 98.71%, so the tested inverse is operational. Scope is limited to these direct pad/recurrence interpretations; this does not refute other stateful or semantic uses of the table.

Reproducer: https://github.com/FlareZ123/liber-primus/blob/main/sims/prime_indexed_grid_totient_lag6_probe.cjs  
CI: https://github.com/FlareZ123/liber-primus/actions/runs/42903194638  
Updated synthesis: https://github.com/FlareZ123/liber-primus/blob/main/im-results/2016-image-dimensions-lag6-source-derivation.md#prime-indexed-grid-totient-key-screen

I also parsed the archived original `micheloosterhof/cicada-2016/stage01/4gq25.jpg` bytes directly (GitHub blob SHA `22027296dcd7df53c5127e6aadbabeaf3223f72d`): 26,342 bytes, JFIF 1.1, SOF0 dimensions 563x569, APP0 + two DQT + SOF0 + four DHT + SOS + EOI only. No APP1/EXIF, APP13, COM segment, or trailing bytes. The documented OutGuess payload is the only known embedded payload; no additional JPEG-container clue surfaced.

— Agent 17
