# FIND THEIR WAY HERE -> FOUR -> p28 DH packet

**Agent10, 19 November 2026. Classification: strong source-derived instruction/key-state bridge. No unknown ciphertext plaintext is claimed.**

## Source path

The held-out solved-text transfer for the table route lands on the exact WELCOME adjacency `WAY HERE`. The surrounding solved plaintext is:

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

Against the complete solved four-GP-rune word lexicon, exactly **one** all-high output across all 713 windows is **any solved four-rune word at all**. It is `FOUR`, from exactly one window:

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

## FOUR types the existing HERE -> 4D self-index

The solved source phrase ends on **HERE**, and the same GP0-address primitive already used in the route gives:

~~~text
GP0(HERE) = 48
p50[48] = 4D
~~~

The phrase itself has now independently supplied the word **FOUR**. Read together, the source path literally presents:

~~~text
FOUR + D
=> FOUR D
=> p50 token 4D
=> fourth D
~~~

That is exactly the ordinal consumer frozen independently in the earlier p28 HERE holdout. On original p28:

~~~text
rune offset48 = D
D-count through offset48 = 4
~~~

and the same digit-letter self-index mechanism later transferred on solved p56. This gives a plausible human-facing reason to interpret the visible token `4D` ordinally rather than as an arbitrary numeral encoding: the solved phrase that leads to HERE emits the numeral word required by the token.

This does not create a new decryption rule. It links two already validated pieces into a more coherent intended solve path.

## FOUR names the selected p28 source line

The numeric pair has a direct source-level reading before any DH algebra is applied:

~~~text
[GP-prime(FOUR), GP0(FOUR)]
= [23,8]
= [D,H]
= DH
~~~

The independently selected p28 literal-DH line begins with the original rune fragment **DH**, whose canonical GP indices are exactly `[23,8]`. The opposite numbering order gives `[8,23] = HD`, so the visible source fragment fixes the orientation.

Thus the solved-phrase readout does more than reproduce two state values: `FOUR` numerically names the original line it should feed.

## FOUR supplies the p28 DH state

The solved corpus itself contains the word `FOUR` exactly once, in the solved instruction:

> DO FOUR UNREASONABLE THINGS EACH DAY

More importantly, the two project-native numberings already used elsewhere give:

~~~text
GP0(FOUR)       = 0+3+1+4 = 8
GP-prime(FOUR)  = 2+7+3+11 = 23
~~~

Those same two numbers are exactly the independently reconstructed p28 DH values:

~~~text
A = 8
p = 23
~~~

Among all **272 distinct solved words**, `FOUR` is the only word with the pair:

~~~text
(GP0, GP-prime) = (8,23)
~~~

The established reversible H register then gives a direct original-source consumer. Order the pair as `(p,A)`:

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

So the readout `FOUR` independently regenerates the **first two values of the original p28 DH packet** through the already established H operation.

## Interpretation

The FOUR/HERE conjunction also authenticates the existing `HERE -> 48 -> 4D -> fourth D` branch. The DH continuation gives a compact second chain:

~~~text
solved WELCOME: FIND THEIR WAY HERE
 -> GP0-address those four words into p50
 -> read high digits
 -> FOUR
 -> [GP-prime, GP0] = [23,8] = DH
 -> the same pair is (p,A)
 -> H(p,A) = (b,K)
 -> exact opening of the p28 DH packet
~~~

The result connects solved Liber Primus plaintext, the original p50 table, and the original p28 ciphertext structure without choosing an English target after the numeric output. The uniqueness controls sharply reduce the freedom in the readout.

The unique solved occurrence of `FOUR` in “DO FOUR UNREASONABLE THINGS EACH DAY” is a plausible further clue, but applying the same four-word high-digit readout to the four following words does **not** yield a useful continuation. Do not force that branch.

## Decision

Promote `FIND THEIR WAY HERE -> FOUR -> (A,p) -> H(p,A)=(b,K)` as a **strong source-derived intended-route candidate** and a new independent authentication of the p28 DH state.

The next useful experiment should use the recovered state packet prospectively on an unopened receiver or explain why the solved phrase instructs the high-digit extraction. Avoid widening to arbitrary solved phrases or mixed token-component searches.

## Reproduction

Windows Node 22 complete-gate PASS after the literal-DH assertion: [run 44447335966](https://github.com/FlareZ123/liber-primus/actions/runs/44447335966). Final PASS including the FOUR/HERE -> 4D -> fourth-D assertion: [run 44448575206](https://github.com/FlareZ123/liber-primus/actions/runs/44448575206).


Run:

~~~text
node sims/lp2_find_their_way_here_four_sft.cjs
~~~

The SFT reconstructs the solved phrase, p50 addresses and high digits, performs the 713-window all-high lexical census, charges all GP-valid high/low and forward/reverse variants, verifies `HERE -> 48 -> 4D -> fourth D` on original p28, establishes the solved-word numeric uniqueness of FOUR, verifies `[GP-prime,GP0]=[23,8]=DH` against the original p28 line label, and verifies `H(23,8)=[15,2]` against that line's H-stream.
