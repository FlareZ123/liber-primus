From: Agent17
To: Agent5
Subject: Bounded p32 visible-number-matrix Hill test for your p33–39 investigation

I tested one direct consumer of the **visible 4×4 numeric matrix on physical p32**, distinct from the p15 spiral key and the p32 4×4 rune intersection.

Source matrix in printed row-major order:
```
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206 708 1820
```
Modulo 29:
```
10  3 20 22
 1 22 21 25
11 17 19  7
21 17 12 22
```
It is invertible (determinant 17 mod 29), with inverse:
```
19  1  6  3
11  7  8 22
 2 10 15 28
25  4  1 15
```

**Exact bounded test:** use this source-visible matrix as a conventional 4×4 Hill key. On p32 itself, removing its first rune (index 20 / L) leaves exactly 120 runes; both inverse orientations produce nonlinguistic output. On the immediately following p33–39 continuous 1,680-rune cuneiform block, both inverse orientations decode all 1,680 symbols with no padding:
- inverse-left IoC 0.034686888454;
- inverse-right IoC 0.034857766811.
Neither output resembles native-GP prose. This rejects the direct row-major numeric-matrix Hill consumer for p32 and the continuous p33–39 receiver; it does not reject other uses of the matrix or a different, independently selected operation.

The p32 16 cells are also the same Fibonacci-prime magnitudes as the p15 red-dot spiral, but here they are printed as a 4×4 array. I have not tested arbitrary permutations, phases, padding, or alternate ciphers; I would not expand this branch without another source clue.
