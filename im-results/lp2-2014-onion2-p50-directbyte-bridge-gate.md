# January 2014 Onion-2 byte stream versus the LP2 32×8 number table

**Agent 3, 22 November 2026. Classification: source-led bounded negative with an exact all-order obstruction.** No unknown Liber Primus plaintext, author key, authenticated decoder, or deep-web destination is recovered.

## Why these originals make a plausible test

An archived 7 January 2014 Cicada onion-page HTML witness begins with `<!--Patience is a virtue-->` and carries a growing hexadecimal value. Its reconstructed final value is exactly **256 bytes**, preserved as `resources/2014-onion2-final-256byte-hex.txt` and separately in `resources/cicada2014-onion2-timing.json`. The later LP2 printed pp49–51 grid is **32×8 two-character numbers**, precisely **256 cells**, and each cell is a valid byte under the repo's competing base60 and base59 readings. A 2014 participant could have seen the earlier value before opening the May manuscript. If these source-visible byte registers were a direct rearrangement, a hidden alphabet relabeling, a hash chain, or an ordinary symmetric cipher/key pair, an exact relationship might identify a decoder or supply original key material.

The evidence does **not** say the author connected the artifacts, selected the radix, requested AES, or identified the grid as the plaintext or a key. Those are explicit candidate operations tested here. The particular January final bytes must not be confused with the original growing page's earlier 170/201-character HTML states.

## Exact original-source inputs

- Historical 256-byte hex: `resources/2014-onion2-final-256byte-hex.txt`; SHA-256 **05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56**.
- The printed pp49–51 table `resources/liber-primus/lp2-grid-256.json`, read row-major, has 256 cells. As base60 bytes its SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Removing the unused lowercase `f` from the numeric alphabet gives the alternative base59 bytes, SHA-256 **511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79**.
- No unknown LP2 text, guessed plaintext, or corpus vocabulary is used in selecting the byte transformations.

## Decisive all-order multiplicity exclusion

The January byte string contains **158 distinct byte values** with maximum multiplicity **5**. Either p50 byte interpretation has **161 distinct values** with maximum multiplicity **4**. A permutation of the 256 positions preserves the multiset of value occurrence counts. Even an arbitrary secret **bijective byte relabeling** preserves this occurrence-count multiset. Consequently **no ordering of either complete grid's original byte multiset, together with any fixed secret 256-symbol substitution alphabet, can give the January byte string**. This is an exact proof for that relation, without key guessing or numeric-radix preference.

It does not exclude a value-changing encryption, a stream cipher, a keyed nonlinear compressor, a source subset, an intermediate transform, or either byte object having an unrelated purpose.

## Direct hashes, XOR and AES-256

The read-only CommonJS source test compares:

- SHA-256 of all first 32-byte multiples of the January binary stream and ASCII-hex stream, and eight subsequent hash-chain values, to **all eight physical 32-byte table columns**; **320** exact byte-array comparisons per radix, zero matches.
- SHA-512 of 64-byte-multiple prefixes and four subsequent hash-chain values, against **four contiguous 64-byte row groups**; **80** exact comparisons per radix, zero matches.
- Row-aligned direct XOR of the January bytes with either grid. Printable ASCII results are **97/256** (base60) and **96/256** (base59); neither output forms prose.
- Decryption of the full January 256-byte string by standard **AES-256-ECB, no padding**, keyed separately by each of the table's eight natural 32-byte columns. Best-of-eight printable ASCII scores are **121/256** (base60) and **104/256** (base59). Neither yields a readable message. These are descriptive output scores rather than an exhaustive AES-key or mode exclusion.

The code independently encrypts and recovers a native printable 256-byte planted message under an actual table-column AES key, and a planted SHA-256 digest matches the same prefix-hash inventory. The full original onion/grid bytes are checked by SHA-256 before the experiment. The original negative outcomes therefore have exact positive controls without assuming the proposed author connection.

## Decision

**Reject the direct 256-byte equality/permutation/substitution bridge under every secret position order and fixed byte relabeling.** The natural prefix-hash, SHA-512, XOR and eight-column AES-ECB interpretations also have no original-byte positive. A relation between the two source objects would need a separately motivated **value-changing** operation or external instruction that specifies a real receiver. Do not tune additional permutations or AES modes solely to achieve printable output, and do not equate the 256-count coincidence with a recovered cryptographic key.

Reproducer: [`sims/lp2_p50_onion2_bytebridge_sft.cjs`](../sims/lp2_p50_onion2_bytebridge_sft.cjs), runnable with Node.js 22 against the immutable repository resources. It prints the exact results, checks all original hashes, and includes planted hash/AES controls.
