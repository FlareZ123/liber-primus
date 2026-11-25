# Factorization of the p55 conditional base59 quotient

Agent49, 2026-11-25. **New source-derived arithmetic result; no recovered unknown plaintext or authenticated RSA key.** This is a downstream test of the conditional [base59 / DH23 fixed point](lp2-p55-base59-elgamal-fixedpoint.md), not a new source selector. The source does not name RSA, prescribe the division by 16×23, or identify the shell as an RSA ciphertext.

The complete 16 p55 page-local words, with its incoming NG carry removed, give 43 interior GP digits and 32 circumference GP digits. Reconstructed in the connected runtime from the image-corrected transcription (blob f7b534a33edeb212d427329798438325307463d7) and matched to the corpus (054f2a0f780b7d46901acbe3d9bf4f0ac1801165). The prior interpretation defines I and S as the two base59 integers, and N=I/(16×23).

## Actual factorization

SymPy 1.14.0 ECM, B1=10000, B2=1000000, max_curve=60, seed=59, completed in 1.12 s locally and returned:

    N = 12377304100984924479685441395200930255261447096598624977561724516152253161
      = 25049452499506949
        × 494114755650988709396898675903506495573679579533633450389

Exact product checked against the reconstructed source. Factors are 55 and 189 bits; both pass SymPy isprime (large-factor BPSW, no formal primality certificate claimed). No small factor was found with factorint limit 100000; the initial ECM B1=2000, B2=200000, 60 curves, seed3301 returned "Increase the bounds." The larger ECM run succeeded, so there is no reason to rerun factoring for this number.

## Direct historical exponent consumer

The signed 2014 first-onion RSA puzzle supplies e=65537 and SHA1 OAEP (see [the historical p55 RSA gate](lp2-p55-2014-rsa-original-source-shell-gate.md)). Take the original shell as the single ciphertext representative S, with N the factorized candidate modulus. Unlike the older gate, this constructs N from p55 itself rather than using the old onion modulus. This is a conditional hypothesis, not an instruction from the manuscript.

The exponent is invertible modulo (p−1)(q−1). Raw RSA decryption gives:

    hex: 014a4bf9a41eee120a189a4d60249cc1fc81a6958127772f127e8db45fa3b6
    native BASE29: CFPXNJDWUCTHEAMIIASNOEIALXLJLPEAXEAOCEYLTOPXSJTHEIJATHGWLP

The 50 GP digits are nonprose. Forward modular exponentiation reproduces S exactly, as expected of textbook RSA. The modulus width is **31 bytes**, below even the 42-byte SHA1 OAEP minimum for an empty message. This is a padding-capacity rejection of the actual historical format regardless of its nonstandard MGF counter.

There is an additional physical carrier obstruction: all 32-GP-digit base59 shell strings are below N, and there are exactly 29^32 = 62623297589448778360828428329074752308805325441 such strings. Since RSA is a permutation of residues modulo a product of distinct primes, a uniformly distributed plaintext residue has exactly this many representable ciphertexts: fraction 5.0595264589536525e−27 (2^−87.353). This is a conditional uniform-residue capacity statement, not a p-value for the observed manuscript. A restricted or compressed message source could evade uniformity. It does not establish that the observed shell is RSA ciphertext.

**Decision:** retain the exact factorization as arithmetic data; reject the source-selected historical RSA/OAEP consumer (width) and report the direct raw inverse negative. The factorization does not authenticate the preceding radix fixed point; the semiprime observation was made after selecting N, and no independent selection of a new exponent or encoding has emerged. Do not launch an arbitrary exponent/padding sweep. All 56 unknown pages remain unsolved.

Reproducer: `python sims/lp2_p55_base59_quotient_factor_sft.py` (SymPy 1.14.0). The ECM, factor/primality checks and RSA arithmetic were actually run in the local Python environment on the exact source-derived integers. The canonical transcription split was independently executed in the connected runtime; the committed integrated Python SFT is provided for checkout reproduction, not claimed as a separate CI run.
