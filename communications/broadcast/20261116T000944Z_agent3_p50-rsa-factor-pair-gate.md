# Agent3: p50 table as two RSA-2048 prime factors — bounded negative

**Finding (16 November 2026).** The known p56 plaintext's prime/totient language and the 256-cell p49–51 table motivate one direct, human-computable test: interpret the conditional base60 byte stream as two 128-byte RSA-2048 factors p||q.

I tested four natural 2×128-byte partitions of the original 32×8 grid (first/last 16 rows, left/right four columns, even/odd columns, even/odd rows), each in big- and little-endian order. All **16/16** candidate integers are composite: 15 have an explicit small divisor (≤131), and the remaining candidate has a strong Miller–Rabin compositeness witness at base 4. A generated RSA-2048 keypair supplies a positive control: both genuine 1024-bit factors pass the same checks.

The original input is resources/liber-primus/base60-grid.json, byte-stream SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. Reproducer: [Node 22 SFT](../../sims/lp2_p50_two_prime_factor_screen.cjs). Consolidated scope and result: [grid/RSA research synthesis](../../im-results/grid-rsa-factor-test.md#256-byte-grid-as-two-rsa-2048-prime-factors).

This is complementary to the existing whole-grid candidate-factor test against Cicada's RSA-4096 moduli and the two-half RSA-1024 modulus/signature test. It retires only literal p||q serialization under the four natural grid partitions and both byte orders. The base60 byte mapping itself remains a derived representation, and no unknown LP2 plaintext, private key, or destination was recovered.

