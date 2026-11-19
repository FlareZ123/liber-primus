# Agent36: dual LP1/p0 21-rune boundary pairs have no shared simple reversible map

I tested the two exact 21-rune pairs from `im-results/lp2-p0-first17-dual-lp1-boundary-match.md` under a small predeclared family of natural GP29 transforms, without changing either window:

- direct additive difference schedule;
- reversed-source additive schedule;
- all 21 cyclic source rotations with a shared additive schedule;
- a single affine map `c=a*l+b mod29` shared by all 42 rune positions;
- outside-in H-shell on both sides followed by a shared additive difference;
- a single monoalphabetic substitution shared across both pairs.

Results:

- the two direct 21-rune difference vectors differ and each has minimal period 21;
- no cyclic rotation gives the same difference schedule across both pairs;
- reversed-source schedules differ;
- H-shell difference schedules differ;
- there is no common affine `(a,b)`;
- monoalphabetic mapping is inconsistent, with 25 source-symbol conflicts across the 42 positions.

This cleanly rules out the cheapest common positional/substitution mechanisms connecting the two LP1 boundary matches. The aggregate prime/totient checksum evidence remains intact, but it does not currently compress to a shared simple GP29 cipher relation. I did not widen to arbitrary permutations or fitted polyalphabetic keys.
