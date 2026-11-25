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

## Separate direct prime-cipher consumer

The authentic p56 cipher consumes consecutive primes minus one, modulo29, with plaintext Fehu (index0) transparent and nonconsuming. The newly recovered factors are two concrete prime *values*, so a second source-motivated operation is to begin the same consecutive-prime stream at p or q (inclusive), preserving the actual F rule. This differs from the arbitrary historical origin screens: the two large starts come directly from the conditional p55 quotient. No claim that the manuscript assigns either start to a page.

Generate the first 400 shifts for each factor using SymPy nextprime, then exact cursor-path DP on the original first 400 runes of each of the nine chapters, plus complete p55 and p56. If c=0, a transparent F hold is legal. A consuming transition is legal precisely when c≠key[j], because otherwise its decoded plaintext would be zero, which must hold. All possible paths were included. The first impossible zero-based original offset in each scope:

| Scope | p-origin | q-origin |
|---|---:|---:|
| p0–2 | 36 | 85 |
| p3–7 | 6 | 0 |
| p8–14 | 29 | 43 |
| p15–22 | 127 | 64 |
| p23–26 | 36 | 42 |
| p27–32 | 3 | 20 |
| p33–39 | 98 | 72 |
| p40–53 | 93 | 115 |
| p54–55 | 8 | 25 |
| p55 alone | 8 | 9 |
| p56 control, wrong origins | 9 | 7 |

Every factor-origin path dies before the end of its scope; no English scoring needed. The actual original p56 with origin2 has 22 legal paths and retains the authenticated consuming cursor84 (three paths at that cursor); the genuine full solution is an independent known control. The prime streams were generated locally, and the exact DP was executed on canonical repository arrays in V8. The integrated Python checkout SFT is [here](../sims/lp2_p55_base59_factor_prime_origin_sft.py).

The alternative factor-generator discrete-log route is recorded separately in [the DH consumer study](lp2-p55-base59-factor-dlog.md). Do not confuse a mathematical factor or logarithm with an authenticated cipher key.

## Direct BASE29 key and whole-chapter RSA block consumers

Two additional frozen, typed receivers use the recovered factors without a new fitted constant. Neither follows an explicit LP2 instruction.

1. Historically attested BASE29 conversion of p and q gives 12 and 39 GP29 digits. Transfer each as the complete cyclic additive key, chapter-local phase zero and authentic plaintext-F holds. All nine chapters reject both keys by exact cursor reachability. The full p55 alone rejects q at offset2; p permits exactly one all-consuming path, yielding `MARMUIABWLRIAIANGUINNGWBIATHAEMNYEAEAMPPCGNIGRBXHWWEOBUPDIAIYBASHESJTUBDTXTTHEAJIEOGONOEATOM`, nonprose. The actual known p56 also rejects both. This differs from using the factors as starting prime values.
2. Treat the same conditional N as the modulus for the unknown chapters themselves, using historical exponent65537 and fixed-width integer BASE29 ciphertext representatives. The minimal width of N is exactly50 digits. Parse each chapter from its source boundary. The table gives complete block counts and violations; no complete chapter has a width-multiple length. The last short fragments are not force-decoded. Every in-range block was actually decrypted and forward replayed; none is valid PKCS#1 v1.5 encryption framing (00 02, at least eight nonzero padding bytes, 00 separator). SHA1 OAEP is already capacity-impossible at this modulus width.

| Chapter | Complete 50-rune blocks | Remainder | C≥N | Valid v1.5 blocks |
|---|---:|---:|---:|---:|
| p0-2 | 14 | 29 | 1 | 0 |
| p3-7 | 22 | 45 | 2 | 0 |
| p8-14 | 34 | 29 | 2 | 0 |
| p15-22 | 38 | 3 | 2 | 0 |
| p23-26 | 20 | 21 | 1 | 0 |
| p27-32 | 28 | 33 | 2 | 0 |
| p33-39 | 33 | 30 | 0 | 0 |
| p40-53 | 60 | 8 | 2 | 0 |
| p54-55 | 6 | 8 | 0 | 0 |

Reject these particular direct factor consumers. This is not a statement about arbitrary block framing, CRT transport, or derived keys. [SFT](../sims/lp2_p55_base59_factor_consumers_sft.cjs) · [raw output](lp2-p55-base59-factor-consumers.json), actual connected JS execution.

**Decision:** retain the exact factorization as arithmetic data; reject the conditional historical RSA/OAEP consumer (width), the direct raw inverse, and the literal prime-origin transfer. The factorization does not authenticate the preceding radix fixed point; the semiprime observation was made after selecting N, and no independent selection of a new exponent or encoding has emerged. Do not launch an arbitrary exponent/padding sweep. All 56 unknown pages remain unsolved.

Reproducer: `python sims/lp2_p55_base59_quotient_factor_sft.py` (SymPy 1.14.0). The ECM, factor/primality checks and RSA arithmetic were actually run in the local Python environment on the exact source-derived integers. The canonical transcription split was independently executed in the connected runtime; the committed integrated Python SFT is provided for checkout reproduction, not claimed as a separate CI run.
