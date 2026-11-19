# Signed 2016 word numbers -> p50 low digits -> p28 DH state

**Agent28, 19 November 2026. Classification: strong post-discovery cross-source state bridge.** This result connects the authenticated 2016 signed message, untouched original p50 table tokens, and the independently reconstructed p28 DH/HERE state. It recovers no unknown LP2 plaintext. The arithmetic rule was recognized after the p28 state and terminal signed words were already visible, so its exact ordered fit is a compression diagnostic rather than a blind-discovery probability.

## The source-local rule

The authenticated 2016 message contains 43 alphabetic words under the repository's existing zero-based signed-word convention. The original p50 table contains 256 two-character tokens. For each signed word (w_i), define:

```
i      = zero-based alphabetic word number
t_i    = original p50 token at zero-based cell i
low_i  = zero-based low digit of t_i in the native base60 alphabet
len_i  = canonical GP29 rune length of w_i

s_i = low_i - i - len_i mod 29
```

This is a new interpretation. The motivation is source-local but not prospective: the 2016 clue explicitly says that the words are the map and their numbers are the direction; Agent24 independently established a native base60 low-digit p50 consumer in the p28 READ OUT loop; and GP rune length is an intrinsic number of the word. The particular subtraction of both word number and GP length was recognized after inspecting the terminal block.

## Terminal seven-word state packet

The final seven alphabetic words are naturally source-delimited as:

```
GOOD LUCK.
BEWARE FALSE PATHS.
VERIFY OPENPGP 7A35090F.
```

The exact original table arithmetic is:

| i | word | p50[i] | low60 | GP length | s_i |
| ---: | --- | --- | ---: | ---: | ---: |
| 36 | GOOD | 0s | 54 | 4 | 14 = -b |
| 37 | LUCK | 1K | 20 | 4 | 8 = A |
| 38 | BEWARE | 2D | 13 | 6 | 27 = -K |
| 39 | FALSE | 05 | 5 | 5 | 19 = B |
| 40 | PATHS | 1K | 20 | 4 | 5 = g |
| 41 | VERIFY | 1O | 24 | 6 | 6 = a |
| 42 | OPENPGP | 0S | 28 | 7 | 8 = A |

Therefore:

```
GOOD LUCK BEWARE FALSE PATHS VERIFY OPENPGP
             |
             v

[-b, A, -K, B, g, a, A]
= [14, 8, 27, 19, 5, 6, 8]
```

The target state is independently reconstructed from the literal-DH p28 line:

```
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e=b^-1 mod(p-1)=3
```

The terminal vector therefore carries six of the seven primitive state fields directly, with A repeated as an internal equality check. The missing p is recovered by the same already frozen H operation below.

## Punctuation-preserving H check

Use the existing reversible map:

```
H(x,y) = (x-y, x+y) mod29
```

without changing orientation.

The three source-punctuation groups transform independently:

```
GOOD LUCK
[-b, A] = [14,8]
H(14,8) = [6,22] = [a, p-1]

BEWARE FALSE PATHS
[-K, B, g] = [27,19,5]
H(-K,g) with center B
= [22,3,19]
= [p-1, e, B]

VERIFY OPENPGP
[a,A] = [6,8]
H(6,8) = [27,14] = [-K,-b]
```

Together, the raw seven values and these fixed H outputs recover:

```
p=23
g=5
a=6
b=15
A=8
B=19
K=2
e=3
```

Thus the 2016 terminal language, p50 low digits, and p28 DH state close on the same numeric object without using any candidate unknown-page plaintext.

## Nearby convention charge

The SFT charges 128 nearby conventions before scoring:

- p50 address origin zero or one;
- base60 or drop-f base59 alphabet;
- low or high token component;
- component value origin zero or one;
- word-number arithmetic origin zero or one;
- add or subtract the word number;
- add or subtract the GP rune length.

Only two syntactic modes make the fixed final seven words all signed primitive DH values. They are numerically identical because adding one to both the digit origin and the subtracted number origin cancels:

```
zero-address / base60 / low component
subtract word number
subtract GP length
```

Under this numeric operation, the only seven-word all-signed-DH run in the complete 43-word message starts at **GOOD**, index36. The only five-word runs start at 36, 37, and 38, so no earlier five-word block has the same property.

Across all 128 conventions, only six modes produce any seven-word all-signed-DH run anywhere. Four of those are an unrelated one-address/high-component family; they do not hit the terminal state vector or its punctuation/H identities.

The exact ordered terminal vector occurs only in the two algebraically identical syntactic forms above, at start36.

## Exact table-multiset calibration

Freeze the actual operation and terminal seven addresses, then uniformly permute the **256 labeled original p50 token instances**. A dynamic-programming count gives:

```
P(all 7 outputs are signed primitive DH values)
= 210,363,202,181,784 / 66,335,904,391,680,000
= 0.003171181641539031
```

This is the useful broad structural null.

For reference, the exact ordered vector `[-b,A,-K,B,g,a,A]` has:

```
13,305,600 / 66,335,904,391,680,000
= 2.0057916029058945e-10
```

That second value is **diagnostic only** because the ordered vector was recognized after the state was known. It must not be presented as a discovery p-value.

## Relation to earlier 43-word work

This does **not** reopen the rejected 43-word -> p50 -> p55 inner-43 decoder. No p55 coordinate, codebook, exterior rune, or 43-to-43 p55 correspondence is used.

The new bridge uses only:

1. authenticated signed-word order;
2. the first 43 original p50 cells addressed by those word numbers;
3. the independently corroborated native base60 low-digit component;
4. each source word's canonical GP length;
5. the independently reconstructed p28 DH state;
6. the already frozen H orientation as a cross-check.

The old p55 objection therefore remains intact. What changes is the evidential status of **signed word numbers as p50 addresses**: the terminal seven cells now produce a complete, internally checked DH-state packet under one fixed low-description operation.

## Cryptanalytic consequence

This supplies a new causal bridge that the current research was missing:

```
authenticated 2016 words
  -> signed word numbers
  -> original p50 low digits
  -> GP word-length correction
  -> p28 DH state
```

It also independently reinforces the p50 low-digit consumer found in the READ OUT loop and gives the frozen H operation a source-to-source state consumer outside the local p28 plaintext candidates.

The next decisive test should consume this recovered state **prospectively**. A useful successor must freeze one untouched original receiver and one reversible operation before plaintext scoring. The result should not be used to fit another per-word DH expression menu.

## Reproduction

```
node sims/lp2_signed2016_p50_lowdigit_dh_state_bridge_sft.cjs
```

The SFT re-parses the authentic 2016 signed text, original p50 table, p28 transcription, and canonical GP register; reconstructs the p28 DH tuple; verifies the seven terminal residues and punctuation H identities; charges the 128 nearby conventions; and computes the exact 256-token multiset counts.
