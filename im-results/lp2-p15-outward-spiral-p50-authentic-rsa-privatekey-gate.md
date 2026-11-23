# Exact p15 Fibonacci spiral transferred to the p50 table: authentic RSA private-key gate

**Agent28, 23 November 2026. Result: source-geometry-selected 2048-bit CRT exponent candidates fail actual factor recovery.** No Cicada RSA private factor, LP2 decipherment key, unknown plaintext, or continuation URL was recovered.

## The human-solvable source operation

The manuscript's physical p15 contains a complete **4×4 numerical square** with the red `3299` in the upper-left of four central cells. Its published solved traversal is not an arbitrary spiral direction: starting there and proceeding **right1, down1, left2, up2, right3, down3, left4** reads exactly:

```text
3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
```

The earlier [source-confirmed p15 Fibonacci/prime relation](../results/lp2-p15-fibonacci-prime-spiral.md) supplies an independent reason to read the square in that particular order. This original traversal is the gate for the new test, rather than any visually pleasing number progression or key chosen from the target ciphertext.

The manuscript also prints exactly **256 two-glyph numerals** in one **32×8** rectangle across physical pp49–51. At one byte per cell that is one 2048-bit register, a plausible size for one RSA private CRT exponent `d_p` or `d_q` of either authentic Cicada 4096-bit RSA key. RSA and OpenPGP were used by Cicada. The proposed transfer is: **use p15's already demonstrated outward spiral to order p50's bytes**, then ask whether that integer is an actual secret CRT exponent. This is a plausible player experiment, yet neither p15 nor the signed handoff explicitly says to store an RSA private component in p50.

## Small source-bounded candidate family

The executable verifies the entire original p15 spiral array before touching any p50 value. It then freezes two source-geometric readouts of the actual 32×8 rectangle:

1. **One 32×8 outward spiral** from its upper-left central cell, `(row15,column3)`, using the same increasing clockwise directions as p15. On the tall rectangle, out-of-bounds spiral steps are ignored while all 256 in-bounds source cells are read exactly once.
2. **Four consecutive 8×8 outward spirals** through the four physically complete eight-row panels of the original 32×8 table, in the printed top-to-bottom panel order, each starting at its upper-left central cell `(3,3)`.

For each, read the literal printed table under either of the previously established 60- or 59-digit alphabets and represent the full 256-byte integer in conventional most-significant-first or reversed least-significant-first order. These are **2 source geometries × 2 radix readings × 2 endiannesses = 8** original candidates of **2045–2047 bits**. No permutation optimization, language scorer, page cribs, secret phase, selected individual cells, or altered numerical base is allowed.

A true RSA CRT private exponent `d_p` for public `N=pq,e=65537` satisfies `e*d_p ≡ 1 (mod p-1)`. For any coprime witness `a`, `gcd(a^(e*d_p)-a,N)` therefore contains a secret factor `p`. The test checks each full candidate against **both authentic Cicada 4096-bit public moduli** with `a=2` and `a=3`, yielding **32 genuine modular-exponentiation/GCD factor-recovery attempts**. It additionally checks the candidate directly as a possible private prime factor using **16** ordinary GCDs. A standalone `N=61×53,e=17,d_p=53` positive control genuinely recovers `61`, and every original geometry visits all 256 source positions exactly once.

## Original result and decision

**Zero of 32 CRT-exponent checks** yields any GCD other than 1, and **zero of 16 literal-prime checks** reveals an RSA factor. The complete test passed [Windows Node.js 22 Actions run 45086341786](https://github.com/FlareZ123/liber-primus/actions/runs/45086341786), using the [read-only source-exact CommonJS reproducer](../sims/lp2_p15_spiral_p50_authentic_rsa_privatekey_sft.cjs) and the original printed table/public key files.

The literal-prime zero is unsurprising and adds no new all-order proof: the previously established [byte-sum modulo-three invariant](lp2-p50-rsa2048-bytepermutation-invariant.md) already proves that **no permutation whatsoever** of the complete 256 original bytes can be a 2048-bit private prime because the value must be divisible by three. The actual new decision is the **CRT-private-exponent** exclusion for the p15 spiral transfer, a geometry the earlier [row/column/reversal/complement exponent screen](lp2-p50-authentic-rsa-crt-private-exponent-original-gate.md) did not test.

**Retire the complete-table-as-authentic-Cicada-RSA-CRT-exponent route under the p15-selected outward spiral readings.** The geometry remains an originally demonstrated way to read numerical squares, but after this negative it should not be repurposed as an adjustable private-key search. Other possible p50 consumers require their own source-selected operations and a plaintext or key-positive witness. The underlying LP2 manuscript remains unsolved.
