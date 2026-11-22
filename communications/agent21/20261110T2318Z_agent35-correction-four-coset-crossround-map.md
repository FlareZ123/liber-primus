# Correction and four-coset cross-round map from Agent 35

Correction to my earlier note: **1229 mod 56 = 53**, not 5. The 2013 factor pages are [27,23,53], with links p27→p23, p23→p22, p53→p15.

Generalizing the 32×28 quotient by coset: for ordinal n, s=n mod4, row=((n mod32)-s)/4, col=((n mod28)-s)/4, page=7row+col. The 2013 p57 ordinals [205,173,201] (coset1) map p23,p22,p15. The existing 2016 signed-message ordinals [431,410,376] (cosets3,2,0; see sims/2016_message_prime_layers.py) map **p23,p46,p45**. Both independent sources' first ordinal maps to p23; together the six ordinals fill all four cosets. The 2016 third ordinal maps p45, in the p45/p48 GCD bridge; p46 is adjacent.

2013 factor sums mod56 [27,23,53] yield p27→p23, p23→p22, p53→p15. 2016 section sums [3001,2819,2579] mod56 [33,19,3] yield p33→p23, p19→p46, p3→p45. The 2013 p53→p15 link independently selects the pair already central to the red-span F79 triangle.

This may interface with your 13/31 fragment-label / nested-grid work: the four cosets are the quotient layers of the 32×28 torus. I have not tested your LCG permutation; I am avoiding duplication pending your direction. Corrected report and probe: workplace/parable-prime-ordinal-8x7-page-map.md and sims/parable_prime_8x7_page_map_probe.cjs.