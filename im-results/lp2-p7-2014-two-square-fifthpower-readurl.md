# P7 five red-word products under the two original 2014 five-square fifth powers: central READ URL

**Agent 9, 22 November 2026. Classification: exact new conditional cross-source word readout.** The authentic p7 red-word values and the two historically supplied 2014 magic squares, subjected to one source-motivated but **not author-instructed** fifth-power operation, produce a **six-GP-rune contiguous center reading READ URL**. This is a sharply specified mathematical observation and a candidate next-step command. **It is not decrypted unknown LP2 plaintext, not an identified author cipher or key, and does not supply a URL or Cicada destination.** The framing and operation were identified retrospectively. Preserve that distinction before designing consumers.

## Original independently supplied operands

The original complete red inscription at the **end of physical LP2 page 7**, local rune offsets 194–207, contains five intact printed GP29 words of lengths [2,4,3,2,3]. Their **zero-based GP29 index products**, calculated inside each printed word and reduced modulo 29, are the existing p7 source vector

    v = (11, 26, 8, 15, 2)^T.

The five-word product convention and source vector were recorded before this observation in the [p7 inverse-determinant analysis](lp2-p7-red-product-matrix-inverse-det-gate.md) and in the [p7–p8 polynomial fixed-point analysis](lp2-p7-p8-original-red-polynomial-fixedpoint.md). This observation adds no newly read or corrected p7 symbol.

The actual 2014 Stage10 OutGuess-extracted object [resources/cicada2014-openpuff-magic-squares.txt](../resources/cicada2014-openpuff-magic-squares.txt) independently contains three printed squares in this exact order:

1. A **5×5** square of row sum **3301**;
2. a **7×7** square of row sum **1033**;
3. B **5×5** square of row sum **1033**.

These are authentic pre-LP2 operands. The last 5×5 matrix is also embedded in original LP1 p05 image bytes as a reversed, hex-encoded trailer, as shown in [the original-byte extraction](../results/lp1-p05-embedded-matrix.md). Both matching-size matrices were printed before p7 existed. The 2014 source does **not** say to apply them to p7 red words.

## A concrete, single source-shaped operation

Use the five source red products as a column vector and take the **fifth matrix power** of both authentic five-dimensional squares, modulo the authentic GP29 alphabet. The exponent 5 is nominated by *five* complete red words matching the two *five*-dimensional squares. It is plausible to try, but is a researcher-selected operation, not an instruction preserved in a signed Cicada message.

The exact fifth powers modulo 29 in original printed matrix orientation are

    A^5 =
       1 28 17 20 28
      23  5 18  7 12
       1  5 24  5  1
      12  7 18  5 23
      28 20 17 28  1

    B^5 =
      28 27 10  2  6
      11 23 12 16 11
      17  5  0  5 17
      11 16 12 23 11
       6  2 10 27 28

Therefore, **without a secret key or fitting any source symbols**,

    A^5 v = [13,18, 4,28,23] = P-E-R-EA-D
    B^5 v = [ 1, 4,20,14,21] = U-R-L-X-NG.

Under the standard GP transliteration, the two outputs concatenate to

    PE [READ URL] XNG

where the six consecutive central rune values are **[4,28,23,1,4,20]**, corresponding exactly to **R-EA-D U-R-L**. The rune EA is a single authentic GP glyph encoding the two Latin letters **EA**. The surrounding four runes are **P,E,X,NG**; they remain unexplained. Calling the six central runes an instruction requires deciding *after looking at the output* to discard the first two and last two runes. Solved p57's “shed our own circumferences” supplies a possible contextual rationale, but does not prescribe this ten-rune framing or the fifth-power operator.

## Strong mathematical uniqueness, but no valid post-discovery significance estimate

Freeze **both** output locations, the historical printed A-then-B ordering, and the exact six target GP symbols READURL. The six linear equations

    (A^5 v)[2..4] = [R, EA, D]
    (B^5 v)[0..2] = [U, R, L]

form one 6×5 matrix over GF(29) of exact **rank five**, with a consistent extra sixth equation. Gaussian elimination recovers **exactly one possible five-value source vector**, which is the independently printed p7 value [11,26,8,15,2]. This is a genuine reversible algebraic fingerprint conditional on those six selected letters.

A finite sensitivity test keeps the *two original matrices* fixed, allows all **56** exponent values covering the least common multiple of their exact matrix orders (A56 and B28), and all **5! = 120** orderings of the same five printed source products, for **6,720** tests:

| Exact fixed-six-rune target | Hits |
| --- | ---: |
| A suffix R-EA-D, alone | 1 / 6,720 |
| B prefix U-R-L, alone | 4 / 6,720 |
| Both together, the central READURL | **1 / 6,720** |

The single joint hit is **exponent 5 and original printed source word order [0,1,2,3,4]**. An independently printed red inscription on p53 contains 12 complete red words; none of its **eight** consecutive five-word product windows, at any of the 56 exponents, produces this same six-rune target.

These are **exact conditional enumeration counts, not an author-intent probability or a pre-registered p-value**. The operation exponent, choice to read the middle six positions, and English target were discovered by exploring the source operands. The broader search space of earlier community and agent hypotheses is substantial. Thus the apparently rare target can still be retrospective pattern selection. The matching words do not authenticate a cross-page cipher.

## Why this changes the next decision

The result supplies an **actual contiguous English-looking command**, and the command refers to a type of object already mentioned by the independently solved p56: a deep-web page whose hash is given but whose contents and location remain unknown. However, the output supplies no address or hash algorithm. A genuine next step would require finding in an **original first-party source** a rule that selects the fifth-power 5-word operator and center readout, or an exact URL-address consumer for the four unaccounted framing symbols P,E,X,NG. A source-independent or author-authenticated prediction on untouched p0–p55 ciphertext could also establish value.

Do not feed READURL back as assumed plaintext of p7's still-encrypted text. Do not promote this to a confirmed solve path based on 1/6,720, and do not search many arbitrary 2014 matrix powers, letter extractions, or URL guesses to manufacture a continuation. Its utility is a **finite, reproducible, unusually legible cross-source candidate** that may point to a historically missing URL/instruction.

## Reproduction and independently executed control

The standalone **Windows Node.js 22 CommonJS SFT** [sims/lp2_p7_two2014_squares_readurl_sft.cjs](../sims/lp2_p7_two2014_squares_readurl_sft.cjs) reads the untouched repo sources, independently recomputes the five red-word products, reads all three original magic squares and verifies their sums, computes the fifth powers, asserts all ten output values, exhausts the exact 56×120 finite sensitivity family, checks all eight p53 windows across 56 exponents, and performs exact GF29 rank-five elimination. It alters no source files and takes no private crib or parameter as input.

**PASS on Windows Node22:** [GitHub Actions run 45068674143](https://github.com/FlareZ123/liber-primus/actions/runs/45068674143), original input and all assertions. An independent SymPy integer matrix-power and GF29 elimination computation gave identical ten symbols and the same unique source vector before the SFT was published.
