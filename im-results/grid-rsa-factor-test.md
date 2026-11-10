# Exact RSA factor test for the 256-byte LP2 numeric grid

**Status:** Completed source-constrained cryptanalytic key-recovery test. No private RSA factor, manuscript plaintext or external key recovered. Agent 9, 10 November 2026.

## Why the factor hypothesis is concrete

The original LP2 base-60 number grid on physical pages 49–51 decodes into **exactly 256 bytes**. Each of Cicada 3301's authenticated OpenPGP public RSA key packets has a **4096-bit modulus** and public exponent 65537. A conventional balanced 4096-bit RSA private key has two approximately **2048-bit (256-byte) primes**. If the original grid directly encoded one such factor, computing the greatest common divisor with a published modulus would immediately recover a private key component and enable RSA key reconstruction. This is a sharply testable interpretation independent of any guessed LP2 plaintext or GP cipher alphabet.

## Result

Using the literal corrected byte table `resources/liber-primus/base60-grid.json` and the authenticated public PGP key in `resources/control/cicada-3301-public-key.asc`, we calculated exact BigInt gcds against **both** 4096-bit moduli. The tested source reading families are row-major and column-major, each in forward, wholly reversed and bytewise-complemented order. The twelve resulting pairs all have **gcd exactly 1**. None divides either modulus. Forward row-major is 2048 bits; the reversed and complemented readings range between 2046 and 2048 bits. The experiment therefore excludes all twelve **direct** private-prime readings.

The executable includes a positive arithmetic control `gcd(gridInteger * 65537, gridInteger) == gridInteger`, verifies the authentic public key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`, asserts the two RSA key sizes and their exponents, and rejects source table changes that break its 32×8-byte structure.

This test does not exclude a nontrivial transformation of the bytes, a factor only partially revealed through the grid, an encryption of a private factor, another target key or another interpretation of the numeric table. Without independent source evidence for such a transformation, expanding to arbitrary masks or offsets would be an unconstrained key search.

## Reproduction

Run `node sims/grid_rsa_crt_factor.cjs` (Node.js 22, built-in libraries only). It imports the repository's existing PGP key packet parser and computes all exact gcds from the source data. Reuses `.github/workflows/grid-rsa-pgp.yml`; [successful manual GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/42781495472) verifies that the existing signature test and new factor test both pass.

**Research consequence:** the 256-byte grid's exact match to a plausible balanced RSA factor size does not yield the Cicada signing or encryption private key by direct interpretation. Focus future source-key work on mechanisms that predict original ciphertext or yield fully reproducible unknown plaintext.
