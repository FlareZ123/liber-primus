# P15 4×4 numeric source as modern 128/256-bit key: original p49–51 byte and p15–22 rune receivers

**Agent 5, 21 November 2026. Exploratory original-input negative.** These are physically plausible AES128/ChaCha20 interpretations with exact-source key material, not author-selected operations or a decryption of unknown LP2. A convention or cryptographic identifier selecting one mapping, cipher, IV, page, and plaintext encoding is still missing.

## Source-visible operation premise and independent alternatives

The original p15 illustration `32.jpg` contains **exactly sixteen 4-digit numbers** in a physical **4×4 square**, with red **3299** selecting a clockwise Fibonacci-indexed prime spiral. Its complete exact generator is already established at [p15 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md); this experiment reuses the canonical printed rows

```
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

The original p49–51 printed base60 bytes are **32 rows × 8 columns = 256 bytes**, all in 0–255, as independently preserved in `resources/liber-primus/lp2-grid-256.json`. An ordinary 4×4 byte key and a 16×16-block 256-byte receiver motivate the **AES128** experiment. Packing the sixteen source integers as uint16 integers gives exactly **32 bytes**, the standard 256-bit key length for **ChaCha20**, whose 16-word internal state is also 4×4. Neither algorithm, the numeric packing, AES cipher mode, or nonce is *named* on the page. An alternative source explanation is the already solved Fibonacci-prime numerical puzzle plus a distinct numerical byte table; geometry alone must not be promoted into a key.

## Frozen original receivers

**AES-128, 256 original p49–51 bytes.** Convert each original 16-cell list to low byte modulo256. Freeze four key lists: literal p15 printed row-major, the source-red spiral order, its sixteen prime operands in spiral order, and the sixteen distinct Fibonacci indices. Test native OpenSSL-backed AES-128 **ECB** (no IV), **CBC** (all-zero IV), and **CTR** (all-zero counter block), for **12** exact-key candidate receivers. Test metric 1 is printable ASCII 32–126 fraction of 256 decrypted bytes; metric 2 is 0–28 raw GP29-byte fraction; also check PKCS#7 suffix. Every key/mode round-trips an explicit 256-byte original-style English plant exactly. Authentic grid outputs: **best 105/256 = 41.02% ASCII printable**, **maximum raw GP29 fraction <27%**, **no valid PKCS#7 suffix**, no recognizably structured opening. A direct text result would have far higher printable fraction. [AES Node22 SFT](../sims/lp2_p15_aes128_p50_256byte_original_sft.cjs) · [Windows PASS 44956517103](https://github.com/FlareZ123/liber-primus/actions/runs/44956517103).

**ChaCha20, two independent original receivers.** Treat the same four p15 lists as unsigned **16×uint16 = 32-byte key**, in either LE or BE, using the standard Node/OpenSSL `chacha20` stream algorithm with zero counter/nonce (16-byte all-zero IV): **8** source-derived key candidates. The original raw 256-byte grid XOR inverse gives at most **103/256=40.23% ASCII printable** and no 256-byte GP29-only output (best raw-GP ratio below30%). Apply the generated stream's `byte mod 29` reductions to the original **1,883 consecutive black runes**, from p15 after its 20 source-red heading runes through p22, under both modular cipher signs: **16** original rune receivers. Best 1,883-rune IoC **0.03476658**, close to uniform 1/29 and far below ordinary native English GP distributions. A separate exact English-byte encrypt/decrypt plant and all original-rune synthetic stream addition/removal inverse plants pass. The first CI invocation failed a mistaken script test boundary that excluded p15's 139 black runes (1,744 instead of 1,883); the corrected script now uses the actual illustrated-section boundary and passes. [Corrected ChaCha20 Node22 SFT](../sims/lp2_p15_chacha20_original_receiver_sft.cjs) · [Windows PASS 44956755208](https://github.com/FlareZ123/liber-primus/actions/runs/44956755208).

Both native Node22 implementations use the platform `node:crypto` API rather than a custom AES/ChaCha core; no external key guessing is hidden inside the tests.

## Decision

**Do not invest in the specific unmarked direct p15-key AES128/ChaCha20 baseline** as an ASCII/raw-GP receiver of original p49–51 bytes or the following GP29 rune section. For ChaCha20 GP rune shifts and direct AES modes, finite original ciphertext readbacks are indistinguishable from uninterpreted data at this modest test resolution.

These tests make **no claim** against a source-supplied alternate IV, scrypt/hash KDF, meaningful output compression, a cipher explicitly named in a missing historical stage, or a mathematical use of the p15 16-cell spiral unrelated to AES/ChaCha20. Such variants require an actual instruction to select them, as otherwise any 256-byte random payload is compatible with an unlimited stream of candidate transforms. **No unknown rune plaintext, key, or destination has been recovered.**
