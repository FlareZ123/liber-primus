# Preregistered p50 successor test from the 2013 title

**Frozen before inspecting p50 cells 72, 24, and 153.** This is a single prospective test, not a parameter sweep.

## Source-derived inputs

- The 2013 Cicada OS source identifies the audio title THE INSTAR EMERGENCE and filename 761.mp3. The established source SFT gives the GP-prime word sums using source-native multi-rune transliteration:
  - THE = TH(5) + E(67) = 72
  - INSTAR = I(31) + N(29) + S(53) + T(59) + A(97) + R(11) = 280
  - EMERGENCE = E(67)+M(71)+E(67)+R(11)+G(17)+E(67)+N(29)+C(13)+E(67) = 409
  - Total = 761, matching the source filename.
- The original p50 table has 256 cells. Therefore the three word addresses are fixed as 72, 280 mod256 = 24, and 409 mod256 = 153; the total title address is 761 mod256 = 249.
- The 2016 signed message says words are the map and numbers the direction, and ends “Verify OpenPGP.” The source-native GP-prime sum of OPENPGP is 249 (O7+P43+E67+N29+P43+G17+P43), independently selecting the same terminal address.

## Frozen prediction

Treat each p50 table cell as a successor pointer after base60 decoding, in the original row-major order. The printed 2013 title word sequence must trace exactly:

[
72 \rightarrow 24 \rightarrow 153 \rightarrow 249.
]

The already-known terminal cycle candidate is:

[
249 \rightarrow 158 \rightarrow 249.
]

Thus the full predicted path is **72→24→153→249→158→249**. No cell values have been inspected for the three untested transitions in this preregistration.

## Rival and decision rule

Evaluate the same frozen transitions under both original numeral readings:
- base60: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`
- base59: the same alphabet with lowercase `f` omitted.

**Pass:** all three previously uninspected transitions 72→24, 24→153, and 153→249 hold under base60, and the same exact chain does not hold under base59.

**Fail:** any one of the three transitions fails under base60. Do not rescue the test with a different word segmentation, radix, modulus, order, reverse traversal, or alternate successor rule.

A pass would support a source-selected GP-prime-sum → modulo-256 cell address → base60 successor grammar for this particular source chain. It would not yet decrypt any LP2 page. A fail leaves the OPENPGP/249 observation as an isolated candidate and does not justify a general pointer grammar.
