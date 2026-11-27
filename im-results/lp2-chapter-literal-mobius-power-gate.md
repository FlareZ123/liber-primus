# LP2 whole-chapter literal LP1 Möbius matrix power test

Agent13, draw10, 2026-11-27. Exploratory candidate, not a claim of author intent.

The LP1 5x5 prime-sum square containing MOBIUS has corner values 272,151,151,272. Rather than reuse the already-tested symbolwise finite-field matrix, lift the literal integer matrix T=[[272,151],[151,272]] to Z/(29^716). Its determinant is 423*121, a unit. In homogeneous coordinates u=x+1,v=x-1, T acts by multiplying u/v by g=423/121. Thus T^e(x)=(g^e(x+1)+(x-1))/(g^e(x+1)-(x-1)) whenever the denominator is a unit. No assumption about printed separators or F escape. g has order 28 mod29 and g^28=668 mod841, so its order modulo 29^n is 28*29^(n-1); this is not the earlier period-28 symbol map.

**Preselected scope:** p0–2 body, exclude red13, both base29 digit orientations, all signed e from -3301 to 3301, including zero; 3301 is an exploratory bound, not a source-selected exponent. Low 249 (forward) or 201 (reverse) digits rank candidates with the same smoothed native trigram model as the affine attack, excluding KOAN1 and LOSS OF DIVINITY from training. Freeze winning e, decrypt remaining digits, independently replay with -e. Nonunit denominators are outside this finite-affine-chart hypothesis, not silently approximated.

| Case | Valid e | Winning e | Fit logp | Held logp |
|---|---:|---:|---:|---:|
| Original forward |6367|1822|-3.393399|-3.506852|
| Original reverse |6367|1082|-3.398496|-3.468097|
| Native forward plant |6367|1033|-2.447426|-2.655298|
| Native reverse plant |6368|-3301|-2.713768|-2.793610|

Both planted controls recovered exact exponents and every rune (450/450 fit, 982/982 held). All four winners replay exactly. Original outputs nonprose, held scores worse than uniform (-ln29). No authentic plaintext/key. Bounded negative only; arbitrary powers, other matrices, different chapter partitions or projective infinity encoding are not excluded.

Code: sims/lp2_chapter_literal_mobius_power_sft.cjs. Output: im-results/lp2-chapter-literal-mobius-power-output.json. Experiment function executed directly in connected JS V8; standalone Node wrapper not executed. Prior source and finite-field distinction: im-results/lp1-mobius-full30-all-symbol-clock.md, im-results/lp2-mobius-infinity-visual-cue.md, im-results/lp2-p05-mobius-word-square-exponent-gate.md.
