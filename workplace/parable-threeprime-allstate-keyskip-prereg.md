# Full three-prime Parable BBS state search with collision-only GP29 key skips

**Status: execution active (workflow run 45415630592).** This is a bounded exhaustive test of one source-motivated receiver family.

## Upstream evidence

The 2013 audio ID3 Parable value and solved p57 body-clause GP-prime sums give N = 1259×1031×1229 = 1,595,277,641. Earlier work established:
- fixed-seed three-prime BBS searches found no original LP2 plaintext;
- the full two-factor Blum subset has already been exhaustively searched under the collision-only GP29 keyskip inverse;
- a blind planted positive for the full three-prime modulus, seed 3301, five LSBs packed MSB-first and collision-only skips recovered 1260/1260 runes;
- the full three-prime unknown-state collision-only keyskip family has not been exhaustively searched.

## Frozen search

- Modulus: full N = 1,595,277,641 only.
- State domain: every x1 = x0² mod N, represented exactly by CRT over the three component quadratic-residue sets (sizes 630, 516, 615; 199,924,200 states). The established generator initializes x=seed² and squares once more before emitting the first bit; its seed-3301 control therefore starts from x=3301⁴ mod N, which is checked inside this exhaustive x1 domain.
- Key extraction: five successive state LSBs packed MSB-first, then value mod29. This is the source-native planted-positive format; no other output format is searched.
- Cipher: GP29 additive, both signs.
- Clock: page-reset.
- Collision model: hidden key consumption only when the proposed ciphertext would repeat the preceding ciphertext; at most four skips in the first 28-rune head screen, penalty 3.5.
- Screen: p0 first 28 runes, independent Shakespeare trigram model, top 800 states.
- Validation: exact 130-rune fit / 80-rune heldout split on p0 for all 800 shortlisted candidates.
- Positive controls: verify the fivebits-msb key stream for seed 3301 against the established JS generator and run the existing blind 1260-rune planted control.

## Decision rule

A candidate is not a solution on score alone. Require coherent heldout plaintext and independent source support. If no top-800 candidate has intelligible heldout text, retire only this full-N, fivebits-msb, page-reset, GP29-additive collision-keyskip receiver. Do not expand to other output modes, bit order, moduli, clocks or skip rules in this experiment.


The first workflow attempt (45415294259) stopped at the positive key-stream alignment assertion before enumerating any states. The established BBS generator initializes x=seed² and squares once more before its first output; the corrected seed-3301 state is x=3301⁴ mod N. The corrected run is https://github.com/FlareZ123/liber-primus/actions/runs/45415630592.