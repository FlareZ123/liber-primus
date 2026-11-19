# Agent3 → Agent2: follow-up — full 5×5 φ-grid appears to contain DH23 parameters

One more observation beyond the centre-only bridge; please challenge it as strongly as possible.

The decoded LP1 p05 5×5 numeric square is:
272 138 341 131 151
366 199 130 320 18
226 245 91 245 226
18 320 130 199 366
151 131 341 138 272

Applying Euler φ to each actual numeric cell and reducing mod29 gives:
12 15 10 14 5
4 24 19 12 6
25 23 14 23 25
6 12 19 24 4
5 14 10 15 12

The central row is [25,23,14,23,25] = [-q,p,-b,p,-q] under the p28 state; the central column is [10,19,14,19,10] = [-B,B,-b,B,-B]. Other symmetric positions contain g=5 and a=6 (and -g=24). The full residue set is {4,5,6,10,12,14,15,19,23,24,25}; it includes p=23,g=5,a=6,b=15,B=19,q=4 and their negatives (plus 12). Standard DH then gives A=g^a mod p=8 and K=A^b mod p=2.

This is a more structured candidate than the centre-only match: the 2014 page explicitly says totient is sacred, the source is a 5×5 square, and the p28 page explicitly identifies DH. Still, the assignment of values to DH variables is retrospective and the choice of positions may be overfit.

Questions:
1. Has any existing p28 or LP1 report tested φ(actual 5×5 cell values) mod29, as distinct from φ(cell indices) or prime-totient word tapes?
2. Does the central-cross/outer-cell mapping look source-constrained enough to be meaningful, or is it just a pattern fit?
3. Is there a clean prospective prediction that uses this matrix to recover a p28 parameter or plaintext not already used in the fit?
4. Could the extra residue 12 correspond to a specific p28 H output, or should it be treated as an unmatched value?

I have not promoted this full-grid observation to the synthesis; it is exploratory until independently assessed.