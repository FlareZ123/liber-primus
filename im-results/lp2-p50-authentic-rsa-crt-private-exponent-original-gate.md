# LP2 256-byte table as an authentic Cicada RSA CRT private exponent

**Agent8, 18 November 2026. Exact original-input negative for a distinct historical key-recovery route.** There is no recovered RSA private key, LP2 decryption key or unknown plaintext. This closes the direct 256-byte **CRT exponent** interpretation under twelve source-natural readouts. A previous test had asked whether the table directly contained one 2048-bit **prime factor** of Cicada's authenticated 4096-bit public RSA moduli; that GCD test does **not** cover the CRT-exponent question here.

## Why this could have unlocked actual material

The original physical LP2 pages49–51 print **32×8=256** two-character numbers. Under two previously documented 59- and 60-character glyph alphabets, every one of the 256 cells is an integer byte. The source could therefore hold a 2048-bit value. The authenticated Cicada 3301 OpenPGP public key (fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`) contains **two 4096-bit RSA moduli**, each with public exponent **65537**. For a standard 4096-bit RSA key with balanced private primes `p,q`, either CRT private exponent `d_p=d mod(p−1)` or `d_q=d mod(q−1)` fits in about 2048 bits. This is a plausible exact-size interpretation *without* requiring the grid itself to share any prime factor with the public modulus.

More importantly, the CRT hypothesis has a **constructive secret-factor recovery test** that needs no private key or plaintext guess. If a grid candidate `x=d_p` is genuine, then for any base `a` coprime to the modulus `N=pq`, RSA gives

```text
e*x ≡ 1 (mod p−1)
a^(e*x) ≡ a (mod p)
gcd(a^(e*x) − a, N) has factor p, so it is not 1.
```

The same conclusion holds if `x=d_q`. Thus merely testing whether `gcd(powmod(a,e*x,N)−a,N)>1` is a direct *key-recovery necessary condition* for both CRT roles. This is a very different test from `gcd(x,N)` for literal prime factors.

## Fixed exact original-data test

The read-only [Node22 CJS source](../sims/lp2_p50_rsa_crt_exponent_key_recovery_sft.cjs) loads the original transcription `resources/liber-primus/lp2-grid-256.json`, asserts its 256 printed tokens, verifies the canonical base60 bytes, both radix-specific sums **33,006 / 32,499**, and loads both genuine RSA moduli from `resources/control/cicada-3301-public-key.asc`. The candidate family is finite and source-native:

- Base60 or base59 numeral reading of the **same original printed cells**;
- physical printed row-major or column-major ordering;
- forward bytes, reversed bytes, or bitwise-complemented bytes.

This gives **12 fixed 256-byte candidates**, each between 2046 and 2048 bits, tested against both authentic RSA public keys and bases **a=2 and a=3**, for a total of **48 exact modular exponentiation/GCD decisions**. The bases are coprime to each RSA modulus. No candidate key is guessed from language scores or the result.

A positive control uses RSA `p=61,q=53,N=3233,e=17,d_p=53`. The identical CRT-GCD test yields **gcd=61**, recovering a nontrivial factor exactly. This verifies that the code tests the useful CRT implication, rather than simply repeating the previously failed candidate-as-prime divisor test.

## Result and decision

**All 48 original CRT tests returned GCD 1.** No readout qualifies as a CRT private exponent for either archived Cicada 4096-bit key under the fixed rows/columns/reversal/complement operations. The complete original source, modular arithmetic, and positive control passed [Windows Node.js 22 GitHub Actions run 44303530942](https://github.com/FlareZ123/liber-primus/actions/runs/44303530942), using the [manual test workflow](../.github/workflows/agent8-p50-rsa-crt-original.yml).

The reason this is useful is that a positive would have recovered an **actual historical private RSA prime factor**, a far stronger artifact than a fitted ciphertext statistic. The negative decisively closes the particular natural, original-source CRT-exponent interpretation. It does not rule out a transformed/encrypted CRT exponent, a 2048-bit seed, other unrecorded RSA moduli, a different cell order, or a wholly different table consumer. None of those alternatives is implied by this failure, and they require fresh source selection before additional key attempts.

**Research decision:** retire the direct table-as-CRT-exponent branch. The earlier table-as-private-prime negative and the present CRT negative constrain two distinct historical RSA key-storage roles. The LP2 complete unknown plaintext and final destination remain unrecovered.
