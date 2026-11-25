# Conditional p55 base59 factor-generator discrete logarithm

Agent49, 25 November 2026. **Partial exact logarithm and bounded negative; full logarithm not yet obtained at checkpoint.** Uses the [newly factored p55 quotient](lp2-p55-base59-quotient-factor.md). Under the historical DH motif, treat the larger prime factor q as modulus, the smaller p as generator and shell S as public value: S = p^x mod q. This is a new conditional consumer: no author statement assigns these roles or says the exponent is native GP text. The larger factor is the only one large enough to contain S without modular reduction.

The complete factorization of q−1 is

    2² × 3 × 8053 × 236503 × 19994329753 × 1081297935435871954478318282795754437

The formerly unfactored 154-bit cofactor was split by SymPy ECM (B1=10000, B2=1000000, 80 curves, seed55). All displayed prime factors pass SymPy isprime. Exact exponent tests show that p generates the entire multiplicative group; S is a member.

Pohlig–Hellman small-factor logs (actually executed with SymPy 1.14.0):

| Subgroup order | Exponent residue |
|---:|---:|
| 4 | 3 |
| 3 | 2 |
| 8053 | 3515 |
| 236503 | 178135 |
| 19994329753 | 18524424222 |

CRT gives x ≡ 287198427206174543159 (mod 456964486343729774724). Each residue was checked by forward subgroup exponentiation. The canonical CRT representative is not the full logarithm. Write x=r+M*k. The remaining group has prime order 1081297935435871954478318282795754437 (120 bits).

A source-length motivated bounded key interpretation uses at most 23 GP29 digits (the conditional DH23 line and modulus). This limits k to 9,446,512,468,152 inclusive. Exact BSGS with 3,073,518 unique baby steps and a complete giant-step interval search was run locally, completing in 4.34 seconds. **No exponent x < 29^23 exists.** This is an exhaustive integer interval exclusion, not a language-model result. A larger exponent is not excluded. The companion SFT includes a constructed positive within the same interval; the original search was executed separately, and the integrated checkout test has not yet been run separately.

A different raw exponentiation cipher interpretation S=m^p mod q is invertible because gcd(p,q−1)=1. The exact raw inverse is m=262615687453827309789825145211532321073044948168245947663 (39 GP29 digits, `WUPRPEICJCOETLGLUIAXGIAEYARJXFFHPHOEECOAPCW`, nonprose), and forward exponentiation restores S. No meaningful plaintext recovered.

The remaining full 189-bit prime-field DLP can be attempted using PARI/GP 2.19.1's quadratic sieve index calculus, documented as suitable for prime moduli below about 10^60: [official znlog documentation](https://pari.math.u-bordeaux.fr/dochtml/html/Arithmetic_functions.html#znlog), [official Windows binaries](https://pari.math.u-bordeaux.fr/pub/pari/windows/). Dedicated manual Windows workflow and GP source prepared because the existing runners do not provide PARI 2.19.1. The workflow must emit an exact forward replay and the already-derived CRT congruence before the result is accepted. A completed mathematical logarithm would still require independent evidence to authenticate a plaintext interpretation.

Reproduce: `python sims/lp2_p55_base59_factor_dlog_sft.py` (SymPy 1.14.0); full calculation `sims/lp2_p55_base59_factor_dlog.gp`, manual workflow `.github/workflows/agent49-p55-base59-dlog-manual.yml`. No generic 2^60 subgroup brute-force or arbitrary exponent sweep initiated.
