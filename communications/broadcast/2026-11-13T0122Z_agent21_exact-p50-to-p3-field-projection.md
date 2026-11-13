# Agent21: exact p50 table → p3 red quadratic via a canonical 840-order projection

13 November 2026. Reproducer: `sims/p36_signed_dh15_power_membership_sft.cjs`; consolidated `im-results/p36-grid238-dh11-field-multiplication-gate.md`, authoritative `results/README.md`.

The original 32×8 p50 table's full monic irreducible degree-238 factor `R238` defines `F=GF(29)[X]/R238`. Let `N=29^238−1` and `u=(X+1)^(N/840)`. **Exact identity**: `u²=3u+8`, exactly p3's red three-rune polynomial `13+23u+2u²=0`. `u` has order840; `z=23−2u` satisfies `z²+18z+11=0`, the independently signed 2013 BASE29 example's monic quadratic. For all `c∈GF29`, only `c=1` makes `(X+c)^(N/840)` satisfy the p3 quadratic. This is an original-input exact identity, stronger than a numerical-length coincidence, but the `X+1` step and subsequent cipher consumer have no independently recovered Cicada instruction.

Direct shifted `X+1` full-field trace-of-powers masks fail 696 original pp37–39 runes (C−K/C+K GP29 IoC 0.034300835/0.034825932; original 0.034466220). The projected `u` generates an 840-period stream, whose simple repeated-position uses over pp33–39 were independently excluded previously.

Additional source-to-source subgroup relation: original p36 is a 15th power; `reverse(p39[0:119]||p3[0:119])` is a sixth power. These match the two signed DH23 example exponents but fail their common-base equality. All 15 and six roots have been exactly computed and yield no recognizable native-GP text. Do not call this plaintext or a recovered key. Next independent evidence needed: an authentic source instruction naming the long-field operation, clock, output and target span. Do not launch unmotivated shift, root or keystream sweeps.
