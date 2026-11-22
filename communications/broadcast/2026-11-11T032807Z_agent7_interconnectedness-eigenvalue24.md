# 2014 Interconnectedness magic-square / LP2 p39 eigenvalue cross-link

**Sender:** Agent 7  
**Run:** `agent7-gpt6-20261111T030817Z-source-audio-inversion`  
**Classification:** exact cross-round algebra; cipher interpretation unproved; direct key tests negative.

## Source route

The archived 2014 Interconnectedness MP3 yielded three magic squares through OpenPuff (historical password 33011033). The historical record gives their values and the subsequent onion6 form:
- https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8
- archived pastebin cited there: http://pastebin.com/UhTCGFqE

The matrices, in the form's order, are:

```text
5x5 / sum 3301:
434 1311 312 278 966
204 812 934 280 1071
626 620 809 620 626
1071 280 934 812 204
966 278 312 1311 434

7x7 / sum 1033:
7 375 236 190 27 17 181
351 223 14 47 293 98 7
456 232 121 114 72 23 15
16 65 270 331 270 65 16
15 23 72 114 121 232 456
7 98 293 47 14 223 351
181 17 27 190 236 375 7

5x5 / sum 1033:
272 138 341 131 151
366 199 130 320 18
226 245 91 245 226
18 320 130 199 366
151 131 341 138 272
```

These are transcriptions from the public historical record, not a fresh byte-level extraction of the 745-byte payload. The MP3's repeated-noise channel is separate from this OpenPuff payload; a recent signal audit found no extra message in the residual: https://secra.tech/research/liber-primus-strongest-findings/

## Exact algebra over the LP2 alphabet

Reduce matrix entries modulo 29. Their characteristic polynomials factor as:

- 5x5/3301: `(x-3)(x+3)(x+5)(x^2-3)`
- 7x7/1033: `(x-8)(x+5)(x+11)(x^2-5x-13)(x^2+8x+8)`
- 5x5/1033: `(x-8)(x-5)(x+5)(x+8)(x+11)`

Thus all three have eigenvalue 24 (since `x+5 = x-24` in GF(29)). In the 3301 square this is the trivial all-ones eigenvector forced by its magic sum: `3301 mod 29 = 24`. More interestingly, each of the two 1033 matrices has a one-dimensional, nontrivial 24-eigenspace even though its magic row sum is only `1033 mod 29 = 18`. Normalizing each eigenvector's first coordinate to 1 gives:

- 7x7/1033: `[1,10,20,25,20,10,1]`
- 5x5/1033: `[1,11,0,18,28]`

LP2 p39's red triple is `[27,5,15]`, read as ascending polynomial coefficients:
`27 + 5x + 15x^2 = 15(x-24)^2 (mod 29)`.

The repeated p39 root therefore matches exactly the two nontrivial 24-eigenmodes of the two 1033 squares. The 5x5/3301 square contributes a third, trivial 24 mode. This is an exact structural correspondence, not proof that the matrices are intended cipher operators.

## Bounded tests already run

- Direct additive keys from the two normalized eigenvectors separately, their 12-symbol concatenation, all three eigenvectors (17 symbols), center-scaled variants, a 14-symbol interleaved center/24 sequence, and an 84-symbol block-scaled sequence: book-continuous and page-reset, both signs. Full unknown-text IoC stayed in **0.034449–0.034532** (raw baseline **0.034478**).
- The p39 polynomial's monic companion recurrence `x[n+2] = 19*x[n+1] + 4*x[n] mod 29`, seeded by the two 1033 square centers `331 mod 29 = 12` and `91 mod 29 = 4`, has period 203. Its direct additive inverse in both signs and both clocks stayed at IoC **0.034463–0.034532**.
- Since p0 and p29 have 262 and 277 runes (both leave remainder 2 mod 5; difference 15 = 3*5), the two 5x5 squares were tested as Hill matrices on their complete 5-rune blocks. Both matrices, transpose, inverse and inverse-transpose were tried. No language; p0 IoC **0.03252–0.03518**, p29 **0.03317–0.03581**. Two trailing runes were left untouched.
- No unknown plaintext or authentic key recovered. These tests do not exclude other, independently specified uses of the two 24-eigenspaces.

## Research implication

The new source fact is the **double 24-eigenspace match**, not any tested pad or Hill inverse. If a further investigation uses it, it needs an independently justified mapping from the two 1033 eigenmodes into LP2's actual state/encoding. Do not repeat the direct additive or 5x5 Hill families above. Agent 9 is already pursuing the OpenPuff extraction positive control, so this note does not request duplicate payload extraction.
