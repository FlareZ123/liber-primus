# FIND THEIR WAY HERE -> FOUR -> p28 DH packet

**Agent10, 19 November 2026. Classification: strong source-derived instruction/key-state bridge. No unknown ciphertext plaintext is claimed.**

## Source path

The held-out solved-text transfer for the table route lands on the exact WELCOME adjacency \`WAY HERE\`. The surrounding solved plaintext is:

> ... those who **FIND THEIR WAY HERE** ...

Treat those four already-solved words as the next source-selected object. Use the same canonical whole-word GP0 -> zero-based p50 address operation already active in the route:

| solved word | GP0 | p50 token | high digit |
|---|---:|---|---:|
| FIND | 42 | 0S | 0 |
| THEIR | 34 | 3H | 3 |
| WAY | 57 | 1w | 1 |
| HERE | 48 | 4D | 4 |

The high digits are therefore:

~~~text
0, 3, 1, 4
~~~

Read as GP29 rune indices through the canonical transliteration:

~~~text
0 = F
3 = O
1 = U
4 = R

=> FOUR
~~~

No fitted arithmetic, modular reduction, or symbol permutation is used.

## Finite controls

### All solved four-word windows

The nine solved GP29 source records contain **713** contiguous four-word windows. Apply the same fixed rule to every window: GP0-address each word into p50, take the printed high digit, and transliterate the four high digits as GP indices.

Exactly **one** window yields \`FOUR\`:

~~~text
FIND THEIR WAY HERE
 -> [42,34,57,48]
 -> [0S,3H,1w,4D]
 -> [0,3,1,4]
 -> FOUR
~~~

### Component and direction charge

For the fixed source phrase, charge the obvious token-component freedom. At each of the four cells choose either the high or low base60 digit, reject a selected digit outside the GP29 index range, and read forward or reverse.

There are **16** GP-valid configurations. Compare against the complete solved four-GP-rune word lexicon.

Exactly **one** configuration hits any solved four-rune word:

~~~text
high, high, high, high
forward
[0,3,1,4]
FOUR
~~~

Thus the lexical result does not depend on silently choosing among several equally readable component/direction variants.

## FOUR supplies the p28 DH state

The solved corpus itself contains the word \`FOUR\` exactly once, in the solved instruction:

> DO FOUR UNREASONABLE THINGS EACH DAY

More importantly, the two project-native numberings already used elsewhere give:

~~~text
GP0(FOUR)       = 0+3+1+4 = 8
GP-prime(FOUR)  = 2+7+3+11 = 23
~~~

These are exactly the independently reconstructed p28 DH values:

~~~text
A = 8
p = 23
~~~

Among all **272 distinct solved words**, \`FOUR\` is the only word with the pair:

~~~text
(GP0, GP-prime) = (8,23)
~~~

The established reversible H register then gives a direct original-source consumer. Order the pair as \`(p,A)\`:

~~~text
H(p,A)
= H(23,8)
= (23-8, 23+8) mod29
= (15,2)
= (b,K)
~~~

The original p28 literal-DH line's H-stream begins exactly:

~~~text
15, 2, 14, 4, 12, 12, 23, 12, 8, 19
^^  ^^
b   K
~~~

So the readout \`FOUR\` independently regenerates the **first two values of the original p28 DH packet** through the already established H operation.

## Interpretation

This gives a compact human solve-path chain:

~~~text
solved WELCOME: FIND THEIR WAY HERE
 -> GP0-address those four words into p50
 -> read high digits
 -> FOUR
 -> (GP-prime, GP0) = (p,A)
 -> H(p,A) = (b,K)
 -> exact opening of the p28 DH packet
~~~

The result connects solved Liber Primus plaintext, the original p50 table, and the original p28 ciphertext structure without choosing an English target after the numeric output. The uniqueness controls sharply reduce the freedom in the readout.

The unique solved occurrence of \`FOUR\` in “DO FOUR UNREASONABLE THINGS EACH DAY” is a plausible further clue, but applying the same four-word high-digit readout to the four following words does **not** yield a useful continuation. Do not force that branch.

## Decision

Promote \`FIND THEIR WAY HERE -> FOUR -> (A,p) -> H(p,A)=(b,K)\` as a **strong source-derived intended-route candidate** and a new independent authentication of the p28 DH state.

The next useful experiment should use the recovered state packet prospectively on an unopened receiver or explain why the solved phrase instructs the high-digit extraction. Avoid widening to arbitrary solved phrases or mixed token-component searches.

## Reproduction

Run:

~~~text
node sims/lp2_find_their_way_here_four_sft.cjs
~~~

The SFT reconstructs the solved phrase, p50 addresses and high digits, performs the 713-window census, charges all GP-valid high/low and forward/reverse variants, establishes the solved-word numeric uniqueness of FOUR, and verifies \`H(23,8)=[15,2]\` against the original p28 DH line.
