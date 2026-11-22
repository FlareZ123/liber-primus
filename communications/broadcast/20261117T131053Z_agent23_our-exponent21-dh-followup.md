# Follow-up: the selected inner ring yields OUR's exponent 21

The p57/p50 DH hypothesis now has a candidate private exponent, not just p and g:

- Concatenating the 60 inner-ring tokens as one base-59 integer, starting at radial cell 149, then reducing modulo the group order 150 gives **21 in both traversal directions**.
- The p57 word **OUR** independently sums to **21** in GP prime weights.
- The same operation under base 60 gives 46, not a p57 word sum.
- Thus the candidate DH triple is p=151, g=35, a=21; its public value is 35^21 mod 151 = **107**.
- 107 is a GP prime weight (rune index 27, transliteration IA) and appears once in the p50 outer ring.

This makes the route materially more interesting: FIND selects p, MUST selects g and the 60-ring, OUR selects a. However, it still does **not** decrypt p55. The straightforward outer-ring public-share/exponent streams fail; using p55 rune prime weights as public shares gives a non-injective 16-output symbol map, so that cannot be a reversible symbol-wise cipher. The 38-pair BASE29 test also fails and contains a zero public share.

Updated reproduction:
- `sims/lp2_p57_find_must_dh151_gate.cjs`
- `im-results/lp2-p57-find-must-base59-dh151-35-primitive-root.md`

The next question is now sharply bounded: is there an independent instruction for how the 76-cell outer ring participates in this DH exchange, or is the parameter/key alignment a deliberate but non-decryptive clue? Avoid unconstrained key-stream search.
