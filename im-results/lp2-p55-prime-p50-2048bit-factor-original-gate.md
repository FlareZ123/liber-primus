# Is the 206-bit p55 interior prime a factor of the original 256-byte p50 table?

**Result: no, under all eight conventional source-justified integer packings.** This eliminates a direct, potentially decisive factor/key bridge between two independent LP2 numerical artifacts. It does not devalue the raw p55 arithmetic or establish that the 256-byte table is an RSA modulus.

## Human-visible hypothesis and source bytes

The authenticated p57 PARABLE's request to “shed our own circumferences” motivates, without proving, removal of both boundary glyphs from p55's **16 complete printed words**, preserving its one-rune carry from p54 as part of the shell. The unchanged original physical p55 has exact fragment lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Strict interiors comprise **43 original GP29 runes**, exteriors **33**. Reading the interior as a source-native big-endian BASE29 integer (a genuine original 2013 Cicada command) gives

```text
N43 = 510043531279477768552291351270111060625364732293226050492113768
    = 8 × P
P   = 63755441409934721069036418908763882578170591536653256311514221
```

The 206-bit `P` was independently *primality-certified*, including a full Lucas–Pratt tree, in the issue [#41 original p55 conditional candidate](https://github.com/FlareZ123/liber-primus/issues/41). The 43/33 split itself is a provisional inference: original art does **not** specifically label it as an RSA secret or source a factorization instruction.

Independently, original physical pp49–51 display exactly **256 two-glyph number tokens in a 32×8 layout**, transcribed in [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). Conventional base60 yields the original 256-byte string. The unused lowercase `f` in the printed digit alphabet admits the source-acknowledged base59 variant. Either offers 256 bytes, exactly the length of a conventional **2048-bit unsigned integer** or RSA modulus candidate. This last interpretation is likewise **conditional**, though its factor divisibility is a decisive mathematical test once stated.

## Complete fixed original-source factor gate

For each radix 60 and 59, read the original 32×8 bytes in printed row-major or column-major order, and interpret their whole 256-byte integer in either conventional big- or little-endian form. These are the **eight** natural packings; no byte permutation, hashing, speculative salt, offset, fitted key, or plaintext recognition is involved.

| Table radix | Reading order | Big-endian `N mod P` | Little-endian `N mod P` | `gcd(N,P)`, both |
|---|---|---:|---:|---:|
| 59 | Row | 32214165093512015756526033323190970513807441389976191987858987 | 31247168097954532500889707548888539411496990429116716658663235 | **1** |
| 59 | Column | 20699152862415201160565146800700670221456531413121391153141223 | 27363041340284056327759454330412392106166684468313470305931371 | **1** |
| 60 | Row | 47197546403675830911263032974980439416009381561640076472450564 | 53434311656456571547949999880236963838394959115101988332731794 | **1** |
| 60 | Column | 46412273260177436552065036334936990959921542975513265321145043 | 46045273354314001633770943782030031552224946894015513227479080 | **1** |

All eight residues are nonzero. None of the eight whole-table integers is divisible by the p55 source-prime `P`. In addition, **conventional printed-row base60 big-endian ends in byte80**, so it is *even* and cannot itself be a standard product of two large odd RSA primes; the corresponding base59 last byte79 is odd, but its integer is not divisible by `P`. This is a direct source-property rejection, independent of any English scoring.

The self-contained test rebuilds all **43 authentic interior indices**, verifies the exact `8P` equality, parses all **256 authentic source tokens** under both alphabet rules, checks lossless 2048-bit pack/unpack in all eight frames, computes exact gcd and remainders using arbitrary-precision BigInt, and **positively detects** a separately planted original-size `N=P×Q` factor. [Windows Node22 source-checkout PASS 45126277866](https://github.com/FlareZ123/liber-primus/actions/runs/45126277866). [Single-file runnable reproducer](../sims/lp2_p55_prime_p50_2048bit_factor_original_sft.cjs).

**Research decision:** Retire only the *direct 206-bit prime factor of whole 256-byte RSA-style integer* bridge. It yields no key and cannot by itself decrypt any original LP2 rune. Do not “rescue” it by inventing byte rearrangements or modifying the p55 shell until a first-party instruction selects that processing. A different independently specified use of either object, or a genuine external key handoff, remains possible.
