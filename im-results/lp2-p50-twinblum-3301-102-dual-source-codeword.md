# Original p50: conditional 3301−102 and 1031/512 byte codewords

**22 November 2026; Agent31. Classification: exact original-input arithmetic with retrospective operator selection, no unknown LP2 plaintext or authentic cipher key.** Reproduction: [read-only Node.js 22 SFT](../sims/lp2_p50_twinblum_period102_dualcongruence_source_sft.cjs).

## Independent input objects and explicit contingency

The authentic signed 2013 CicadaOS [\`prime_echo\` script](../resources/historical/cicada2013-os-original-prime-echo.sh) pauses after **1033** and **3301**. Both are upper twin primes, whose lower members **1031** and **3299** are Blum primes (both 3 modulo 4). The source-fixed conventional Blum–Blum–Shub square-state modulus is therefore \(1031\times3299=3,401,269\). Because \(2\) has multiplicative orders **204 and 48** in the respective quadratic-residue groups of orders **515 and 1,649**, the eventual period of *any* BBS state stream divides **816 states**. With one extracted bit per state and ordinary groups of eight bits, the period divides **102 bytes** for every possible seed. See the independently preserved [all-seed period proof and original-table exclusion](lp2-twinblum-1031-3299-original-period-gate.md). Crucially that same proof **rules out** the printed table as direct sequential output of this BBS generator.

The separate 2014 Stage10 authentic magic-square task visibly uses the sum **3301**. The original 2014 LP2 numeric panel at physical pp49–51 has **256** two-character base60 numbers. The already established exact [1031/512 codeword report](lp2-p50-parable1031-red512-single-erasure-codeword.md) supplies the original GP-prime sum **1031** of the solved p57 middle sentence, and the independently printed original red p27 and p54 prime sums **1109** and **597**, whose difference equals **512**. Treating all 256 printed base60 values as one **big-endian base256 integer** \(N\) yields the already known \(N\bmod1031=512\).

A new additional arithmetic match is exactly:

\[
\boxed{N\bmod3301=3199=3301-102.}
\]

Here the number 102 has a clear derivation from the distinct historical twin-prime operands plus a conventional BBS bit-packing assumption. **However, the congruence was discovered by evaluating candidate moduli on the original table**, and there is **no first-party Cicada instruction to build this BBS stream, adopt eight-bit packing, take the difference from3301, treat all table bytes as a big-endian integer, or use the resulting congruences as a checksum**. The prior 1031/512 formula was also recognized after inspecting the corrected original table. These agreements may be chance arithmetic, and their common prime sources mean they are not independent blinded observations. No claim is made that the creator actually used this code.

## Exact independent original-byte outcomes under the frozen conditional rules

The original corrected 256-byte panel SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Its row-major base60 big-endian integer has \(N\bmod1031=512\), \(N\bmod3301=3199\), and previously established large-integer factor \(F=36,528,277,968\), so \(N\bmod F=0\). Both earlier independently derived GF29 polynomial factors of its 256 reduced coefficients also vanish:
\(H(X)=3+26X+24X^2\), signed 2013 BASE29 source; \(G(X)=27+5X+15X^2\), original physical p39 red triad. The latter are analyst-recognized mathematical source relationships, and their potential dependence on the integer factors remains a caveat.

The completed experiment *withholds* a suffix before reconstructing it from these pinned full-table constraints, using only the preceding original bytes and the explicit CRT / GF29 polynomial equations:

| Hidden original suffix | CRT candidates using \(F,1031,3301\) | Candidates satisfying both H and G | True original among them |
| --- | ---: | ---: | --- |
| Final **eight bytes** | **148** | **1** | \`719eace6b424bd50\` (the sole survivor) |
| Final **nine bytes** | **37,986** | **2** | \`c0719eace6b424bd50\` (one of two) |

The other valid nine-byte candidate is \`d893c344f01267c900\`. This strictly brackets the **conditional unique recovery at eight suffix bytes**, an improvement on the previous seven-byte cutoff when only \(F,1031,H,G\) were used. A proof of creator intent would require an original operator/recipient instruction, which this experiment does not establish.

An independent period transcription repair uses the **twelve historically attested ambiguous table positions**, each with two already documented 2014 image/text alternatives, yielding exactly **4,096** source-licensed readings. Under the same unchanged byte grammar, only **5** readings satisfy the prior \(N\bmod1031=512\) relation and only **2** satisfy the new \(N\bmod3301=3199\) relation. Their intersection is a **single** case, bitmask \`0xfc7\`, which reproduces the exact corrected image-derived 256 bytes. There are **zero fitted new byte values** or speculative other glyph substitutions. This is concrete reconstruction under the *conditional codeword*, not decryption of unknown runes or independent evidence of an intended checksum.

For the six ordinary geometries and both historically disputed base60/base59 alphabets (12 original-source readings), the simultaneous modular equations select **only the canonical printed row-major base60 byte sequence**. This is a consistency control; the earlier 1031 relation alone already singled out that reading.

## Decision and unresolved causal input

The exact formulas permit some *source-byte* recovery and constrain historical transcription ambiguities. The novel link to a BBS stream **cannot** be used as direct source evidence for the generator, because original source bytes contradict that direct stream. Neither congruence provides an independently selected **secret key**, **plaintext-bearing operation**, **word-boundary conversion**, **whole unsolved-page inverse**, or **deep-web destination**. Retire speculative extra modulus searches and future blind expansion of this checksum family. Reopen only if a first-party 2014–2016 message or original image mark actually selects the bit packing, table integer serialization, and a meaningful ciphertext receiver. No previously undeciphered LP2 material has been solved.

**Exact executable method:** [CommonJS SFT](../sims/lp2_p50_twinblum_period102_dualcongruence_source_sft.cjs) reads the repository's unchanged [canonical 256 cells](../resources/liber-primus/base60-grid.json), [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [red ink annotations](../resources/liber-primus/lp2-ink-annotations.json), and [2013 pause script](../resources/historical/cicada2013-os-original-prime-echo.sh), asserts all original identities and independent periods, enumerates all historical alternatives, and reconstructs withheld suffixes. It writes no files.
