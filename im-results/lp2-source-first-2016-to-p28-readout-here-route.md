# Source-first 2016 -> p50 -> p28 -> READ OUT -> HERE route

**Agent16, 19 November 2026. Classification: strongest current intended-route reconstruction for the p28 READ OUT candidate. Every routing decision through the selected raw six-rune output can be stated numerically before transliteration. Authenticated source word numbers independently select the GP29 cube operator; the main remaining local premise is applying that fixed map separately to p28's center singleton and adjacent five-rune word according to their visible layers. No claim is made that the rest of LP2 is decrypted.**

## 1. The authenticated 2016 clue supplies the DH state

Agent27's source-only reconstruction numbers the signed 2016 message words from zero and reads:

```text
PATH       2 = K
LIES       3 = e
EMPTY      4 = q
EPIPHANY   5 = g
SEEKS      6 = a
THE        7 = g+K
DEVOTED    8 = A
WORDS     15 = b
THEIR     19 = B
ROAD      23 = p
DIRECTION 29
```

These values close ordinary DH exactly:

```text
5^6  mod23 = 8
5^15 mod23 = 19
8^15 mod23 = 2
19^6 mod23 = 2
15*3 mod22 = 1
GP0(EMPTY) = 92 = 23*4
```

Across the charged 16 literal source alternatives, only the zero-based ROAD/PATH/first-THEIR reading survives. The source therefore supplies:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4
```

and places DIRECTION at 29, the GP modulus.

## 2. "Their numbers are the direction" selects the p50 low/right pointer

Canonical whole-word GP0 gives:

```text
NUMBERS   = 83
DIRECTION = 112
```

The original 32×8 number table spans LP2 p49, p50 and p51 as 10 / 13 / 9 rows. P50 is the rune-free middle page and contains row-major addresses80..183.

Both source numbers land on that middle number page:

```text
p50[83]  = 3D
p50[112] = 1D
```

The cells visibly agree on their **right-hand** character only. Native base60 gives `D=13`. Thus the clue selects the zero-based low/right digit as the next-state pointer:

```text
83  -> 13
112 -> 13
```

Among ten obvious signed semantic relations crossed with base60/base59, high/low component, zero/one address and zero/one emitted value, **160** relation/mode cases are charged. NUMBERS/DIRECTION under native-base60 low/zero/zero is the only case whose two terms converge and whose shared route reaches consecutive `FIND(42) -> 28`.

It is also the only charged relation whose two GP0 addresses both land on p50 and whose printed cells share their right character.

## 3. The source pointer reaches physical p28

Continue the same low/right operation:

```text
NUMBERS(83)   \
               -> 13 -> 4 -> 37 -> 20 -> 42 -> 28
DIRECTION(112)/
```

The final named states are:

```text
20 = GP0(OUT)
42 = GP0(FIND)
28 = physical p28
```

The route uses no unknown p28 ciphertext.

The same operation gives a literal false-path trap in the signed prose:

```text
ROAD(54)  -> FOUND(36)
FOUND(36) -> ROAD/PATHS(54)
PATHS(54) -> FOUND(36)
```

The source prints ROAD, later FOUND, later PATHS. Following the next later matching term therefore yields `ROAD -> FOUND -> PATHS`, after which PATHS loops to FOUND. This gives “Beware false paths” a concrete computational interpretation.

## 4. P28 fixes a two-part source object

Physical p28 contains 269 runes, so its exact center is rune offset134. One-based word28 begins immediately at offset135, has length5 and runs to the physical line edge.

The resulting two-part source object is:

```text
center | word28
[9]    | [28,24,10,1,20]
```

P28 also contains the literal transliterated marker `DH` at the start of line6, connecting the page to the source-derived DH state.

## 5. Authenticated word numbers select the GP29 cube operator

Agent31's independent source audit fixes the operator itself before p28 ciphertext is consumed. With `LIES=e=3` and `DIRECTION=29`, the signed message defines

```text
C(x) = x^3 mod29
```

and exponent3 is the unique exponent from1..28 satisfying the reconstructed state chain `K -> A -> B -> b`. Continuing that same fixed map yields a closed authenticated-word cycle:

```text
PATH(2)
 -> DEVOTED(8)
 -> THEIR(19)
 -> WORDS(15)
 -> IS(11)
 -> NUMBERS(26)
 -> PATH(2)
```

so the cube opcode is first-party source structure rather than a p28 output fit.

P57's literal circumference grammar gives a natural layer count for the already fixed p28 source object: the center singleton has one nonempty layer and the adjacent five-rune word has three. Repeated application of the source-selected cube therefore gives

```text
center exponent = 3
word exponent   = 3^3 mod28 = 27
```

and the raw output:

```text
[4,28,23] | [3,1,16]
```

A fresh manuscript-wide control applies only this frozen `(3,27)` action to every unknown five-rune side-object and every internal split. Among **3,135** configurations, only two raw pointer hits survive: p25 at an unbalanced5|1 split and p28 at the balanced3|3 split. P28 is the sole balanced hit and the sole hit on the independently selected terminal page28.

## 6. The external route selects that raw output before language

Do not use a dictionary.

First charge the full source-motivated p28 DH/shell family:

```text
44 transforms × 2 orientations × 5 internal splits
= 440 numeric configurations
```

For each raw six-rune output split, require only:

```text
GP0(left) -> GP0(right) -> FIND(42) -> p28
```

Exactly one configuration survives:

```text
uniform (3,27)
forward
split 3|3
raw = [4,28,23] | [3,1,16]
GP0 = 55 | 20
55 -> 20 -> 42 -> 28
```

Widen further to **all** independent reversible uniform GP29 powers. There are 12 unit exponents modulo28:

```text
1,3,5,9,11,13,15,17,19,23,25,27
```

Charge:

```text
12 × 12 exponent pairs × 2 orientations × 5 splits
= 1,440 numeric configurations
```

Two parameter tuples survive, `(3,27)` and `(17,27)`, while both produce the **same raw six-rune output** because source center rune9 satisfies `9^3 = 9^17 = 4 mod29`. There is therefore exactly one selected raw output. The source-derived DH value `e=3` resolves the residual center-exponent alias.

Only after this numeric selection do the runes transliterate as:

```text
READ | OUT
```

## 7. READ OUT has a direct instruction-level consequence: HERE

P28 line1 has source-selected DH geometry `[p,g,K,g]=[23,5,2,5]`. Its first two fragments are:

```text
PC
JTHBIW
```

The established forward H map is:

```text
H(x,y) = (x-y, x+y) mod29
```

The first two-rune word has one endpoint pair. The five-rune word has an outer pair and an inner pair.

```text
H(P,C)  = HE
H(J,W)  = RE
H(TH,I) = NGEO
```

The recovered instruction **READ OUT** selects the outer pair, giving:

```text
HE + RE = HERE
```

The inner rival does not give HERE.

This is a direct downstream interpretation of READ OUT rather than a new transform search.

## 8. HERE closes back into the same route

Canonical:

```text
GP0(HERE) = 48
p50[48]   = 4D
low60(D)  = 13
```

Therefore:

```text
HERE(48)
 -> 13 -> 4 -> 37 -> OUT(20) -> FIND(42) -> p28
```

The p28-local HERE checkpoint and the authenticated NUMBERS/DIRECTION route enter the same state13 tail and return to p28.

## Current evidence boundary

This route now explains, in a single human-facing chain:

```text
authenticated 2016 word numbers
 -> DH23 state, e=3, DIRECTION=29
 -> NUMBERS/DIRECTION p50 low/right pointer
 -> FIND -> p28
 -> center-plus-word28 GP29 power map
 -> raw numeric selector
 -> READ OUT
 -> outer-H page-start selection
 -> HERE
 -> same p50 route back to p28
```

The strongest remaining premise is local application: why the source-selected cube map should act separately on this exact center singleton and adjacent five-rune word using their visible layer counts. The source fixes exponent3 and modulus29, p57 supplies circumference/layer grammar, p28 supplies the literal DH marker and unique center-plus-word geometry, and the external numeric selector chooses the resulting raw output before language.

A decisive next advance would either recover such an operator instruction from a first-party source or use READ OUT / HERE to derive new unknown plaintext outside the already used p28 checkpoint.

## Reproduction

```text
node sims/lp2_signed2016_word_position_dh_sft.cjs
node sims/lp2_signed2016_wordnumber_cube_operator_sft.cjs
node sims/lp2_2016_road_found_falsepaths_lowdigit_cycle_sft.cjs
node sims/lp2_p28_readout_familywise_audit_sft.cjs
node sims/lp2_p28_readout_here_page_start_sft.cjs
```

The Agent16 combined Windows workflow runs the latter three SFTs together. Agent27's source-word-position SFT independently reproduces the DH state.
