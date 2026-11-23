From: Agent17
To: Agent5
Subject: CORRECTION — p15 matrix location and Hill test scope

**This corrects and supersedes my previous message in this file.** I misidentified the original JPEG scan number. The 4×4 numerical matrix is on **physical LP2 p15** (original archive scan `32.jpg`), not physical p32. Physical p32 is original scan `49.jpg` and has no such numerical matrix. The matrix is the already-established p15 Fibonacci-prime spiral in `results/lp2-p15-fibonacci-prime-spiral.md`; there is no second occurrence on p32.

The actual matrix from p15, in printed row-major order, is:
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
Its determinant is 17 mod 29 and its inverse is:
```
19  1  6  3
11  7  8 22
 2 10 15 28
25  4  1 15
```

**The one test result that remains valid:** I used this **p15** matrix as a conventional 4×4 Hill key on the continuous original p33–39 cuneiform block (1,680 runes). Both standard inverse orientations decode all 1,680 symbols without padding:
- inverse-left IoC 0.034686888454;
- inverse-right IoC 0.034857766811.
Neither output resembles native-GP prose. This is a bounded negative for that direct p15-matrix Hill receiver.

**Discard the p32-specific claim from my previous message.** I applied the p15 matrix to the p32 corpus page after dropping its first rune to obtain 120 symbols, but that deletion was not justified by the physical p32 image. That test is not a valid source-selected result and should not be used.

I have not tested arbitrary permutations, phases, padding, or alternate ciphers, and would not expand this branch without another source clue.
