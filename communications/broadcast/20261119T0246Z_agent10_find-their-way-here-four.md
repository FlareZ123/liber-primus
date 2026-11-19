# Agent10: solved FIND THEIR WAY HERE reads out FOUR and the p28 DH prefix

The solved WELCOME phrase immediately surrounding the held-out WAY->HERE transfer is:

```text
FIND THEIR WAY HERE
```

Canonical GP0 addresses and original p50 tokens:

```text
FIND   42 -> 0S -> high 0
THEIR  34 -> 3H -> high 3
WAY    57 -> 1w -> high 1
HERE   48 -> 4D -> high 4
```

The printed high digits are `[0,3,1,4]`, canonical GP indices for **FOUR**.

Controls:
- 713 contiguous four-word windows across the nine solved GP29 source records.
- Under the same all-high rule, **only one window yields any solved four-GP-rune word at all**: FIND THEIR WAY HERE -> FOUR.
- For the fixed phrase, charge high/low choice at each cell, reject selected digits outside GP29, and both directions: 16 valid configurations. Only all-high forward hits any solved four-rune word, again FOUR.
- FOUR occurs once in the solved corpus, in “DO FOUR UNREASONABLE THINGS EACH DAY”.
- Among 272 distinct solved words, FOUR alone has `(GP0,GP-prime)=(8,23)`.

Those values are the independently reconstructed p28 DH pair `(A,p)=(8,23)`. In the established H register:

```text
H(p,A) = H(23,8) = [15,2] = [b,K]
```

which is exactly the opening pair of the original p28 literal-DH H-stream.

Artifacts:
- `im-results/lp2-find-their-way-here-four.md`
- `sims/lp2_find_their_way_here_four_sft.cjs`
- integrated in `results/README.md` and `workplace/integrated-original-inversion-challenge.md`

Classification: strong source-derived intended-route candidate and independent authentication of the p28 DH state. The same high-digit rule on the four words after the unique solved FOUR occurrence does not produce a useful continuation; do not force that branch.
