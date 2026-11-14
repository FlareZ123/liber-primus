# p55 inner43 BASE29 polynomial bridge

**Status: Intermediate structural finding — not a decryption.**

## Claim

The 43 strict-interior runes of physical p55, interpreted as coefficients in the ascending-degree BASE29 convention explicitly demonstrated in Cicada's signed 2013 TCP source, define a polynomial (P_{55}(X)\in GF(29)[X]) with two source-anchored evaluations:

\[
P_{55}(3301\bmod29)=P_{55}(24)=18=1033\bmod29
\]

\[
P_{55}(1033\bmod29)=P_{55}(18)=23.
\]

The output 23 numerically matches the 23 terminal red dots on p57 and the modulus 23 of the signed 2013 Diffie–Hellman challenge. These are reproducible **retrospectively chosen arithmetic correspondences**. Nothing in the authenticated p56, p57 or signed 2013 source instructs the solver to evaluate this proposed p55 polynomial at the two magic-square residues; no unknown plaintext, cipher inverse, or key-use rule follows.

## Human-visible route

1. **Correction to a mistaken historical selector:** the authenticated p56 decryption actually begins “AN END WITHIN THE DEEP WEB” and discusses finding a page that hashes to a specified digest. The claimed sentence “The first nourishes the last” does **not** occur in p56 plaintext or in the other known p57 rune text. Therefore no first-to-last instruction authorizes connecting the first 2014 square to the last p57 dots. That assignment is an exploratory researcher interpretation.
2. The clear p57 parable says to shed circumferences and find what is within. Applying the literal first/last-rune removal to p55's printed words selects its strict interiors.
3. Physical p55 has 17 printed rune segments with lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. The first is a one-rune page carry; the remaining complete words contribute exactly 43 interior runes.
4. Cicada's signed 2013 source explicitly demonstrates the BASE29 coefficient convention with `3301 -> 3QO`: digits `[3,26,24]` are the coefficients of (3+26X+24X^2), in increasing degree. This fixes the orientation without a fitted reversal.
5. The original 2014 three-square source has magic sums 3301, 1033 and 1033. Reducing these constants modulo 29 gives 24 and 18.
6. The original p57 page has a terminal cluster of 23 red dots; the signed 2013 DH source independently uses modulus 23.

## Exact polynomial and field check

The coefficient vector, in printed order and ascending degree, is:

`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`

Thus (P_{55}) has degree 42. Its orbit beginning at the 2014 first-square residue is:

`24 -> 18 -> 23 -> 4 -> 6 -> 19 -> 22 -> 22`.

There is a second check using the signed 2013 quadratic

\[
H(X)=3+26X+24X^2.
\]

Polynomial reduction gives

\[
P_{55}(X)\bmod H(X)=6+26X.
\]

Writing (u=X\bmod H), the normalized relation is (u^2=11u+18). Therefore the field element (\alpha=6+26u\in GF(29^2)) has:

- trace (Tr(\alpha)=8);
- norm (N(\alpha)=24), again (3301\bmod29);
- multiplicative order 210, while (u) has order 840.

The norm match is an independent algebraic invariant of the same source-selected polynomial, not a plaintext result.

## Controls and interpretation

- Reversing the 43 coefficients gives (P(24)=4) and (P(18)=19), so the ascending order matters.
- Using all 76 p55 runes instead of the strict interior gives (P(24)=24) and (P(18)=26); the literal interior extraction matters.
- The 2013 signed source, 2014 square constants, p57 dot count and p55 word interiors are independent artifacts, but the polynomial construction and chosen evaluation points were proposed after inspecting them. The resulting arithmetic checks are not statistically independent and no historical operation selects the evaluation route. No p-value is claimed.
- **DH provenance caution:** the signed 2013 source's worked exchange also prints base 5, server public share 8, client public share 19 and shared key 2, but explicitly says the server base and secret are participant-selected for each request. Do not treat those example values (or matches to the polynomial's trace 8 / orbit value 19) as organizer-fixed clues or key material. The cross-round bridge uses only the protocol's fixed modulus 23.
- This finding does not identify how (P_{55}), (\alpha), its norm, trace or order should be consumed by a cipher. No arbitrary keystream, phase, stream-cipher or page-decoder search was performed. Waiting decoder challenge [#41](https://github.com/FlareZ123/liber-primus/issues/41) remains waiting; this report is a structural lead, not an attempt to bypass its acceptance gate.

## Reproduction

Run:

`node sims/p55_inner43_base29_polynomial_bridge.cjs`

The script checks the original p55 transcription against the canonical corpus, verifies the three 2014 square sums, evaluates the polynomial, reduces it modulo (H), and independently computes the field trace, norm and multiplicative order.

**Source anchors:** solved p56 plaintext summarized in [the authoritative synthesis](../results/README.md) · [original LP2 transcription](../resources/liber-primus/lp2-transcription.txt) · [canonical rune corpus](../resources/liber-primus/lp2-corpus.json) · [original 2014 squares](../resources/cicada2014-openpuff-magic-squares.txt) · [signed 2013 TCP/BASE29/DH source](../resources/external/2013-tcp-server-signed-source.md) · original p57 image `resources/liber-primus/74.jpg`.
