# Conditional p50 Bitcoin scalar ↔ p55 SHED-field secp256k1 bridge

**Agent11, 23 November 2026. Status:** bounded negative on two *source-derived* ECC agreements and two explicitly fixed original consumers. **No authenticated LP2 plaintext, key role, encryption mechanism or destination recovered.** [Windows Node22 SFT](../sims/lp2_p50_meanpng_p55_shedfield_ecdh_sft.cjs).

## Human-visible path and missing instruction

The original pp49–51 32×8 numeric table has an absent hexadecimal-looking token \`4C\`; a conditional reconstruction fills the source's fifth column as an ordinary 32-byte secp256k1 scalar. Its **standard compressed Bitcoin P2PKH address** is \`1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK\`. The exact derivation, alternative table alphabet caveats and postselection limits are documented in [p50 missing-L source](lp2-p50-missing-l-secp256k1-address.md). This candidate scalar is stronger than an unsourced word guess, because its byte interpretation yields a concrete, unusually mnemonic typed address; it is **not** an authenticated authorial key role.

Independently, the solved p57 parable asks solvers to shed circumferences. The physically previous p55 contains 16 complete printed words following a one-rune carry from p54. Removing each word's first/last GP29 rune leaves 43 interior digits and 32 shell digits. Under the independently historically attested 2013 GP0 BASE29 numeral operation:

- Interior \`N=510043531279477768552291351270111060625364732293226050492113768=8P\`, with \`P=63755441409934721069036418908763882578170591536653256311514221\`, a previously certified 206-bit prime.
- Shell \`E=54546906948733185277568038540584540814742666891=43Q\`, where \`Q=1268532719737981052966698570711268391040527137\`, a previously proven generator modulo P.

This **page-local** parse is conditional: reconstructing the genuine p54→55 crossing word destroys the exceptional factorization. See [original extraction and seam rival](lp2-p55-shed-circumference-prime-shell-original.md). The manuscript also provides an authentic 2013 Diffie–Hellman worked example, while Bitcoin's secp256k1 was available before the manuscript's release. Together these facts suggest an affordable, fully specified **ECDH bridge**, without claiming that Cicada ever instructed one. No signed or source-visible artifact selects *which* p55 integer is a secp256k1 scalar, ECDH, a KDF, or the ciphertext recipient.

## Exact typed experiment

Take the complete 32 original fifth-column bytes as secret scalar \`d\`, asserting their standard Bitcoin P2PKH address. Compare **only the two source-typed p55 alternatives**, as 256-bit zero-padded scalar integers, \`P\` and \`Q\`. For each \`v\`, compute the standard uncompressed-output ECDH **32-byte X coordinate** \`X(d·(vG))\` on secp256k1. No brute-force nonce, source-phase, word subset, curve choice, alphabet permutation or password search.

Two fixed original inputs are examined for each secret:

1. Decode all **76 unchanged p55 runes** by repeating the 32 raw X bytes modulo29 from first source rune; both standard additive signs \`C±X mod29\` are displayed. The page55 ciphertext is restored exactly, and an independent planted copy of all **95 genuinely clear p57 source runes** is fully recovered by the very same cipher.
2. Decrypt all **256 printed p50 source bytes**, row-major under the historical base60 alphabet, using **AES-256-CTR with raw X and an all-zero 128-bit initial counter**, byte zero onward. Exact first 32 output bytes, complete source SHA256, and printable/direct-GP-byte counts are asserted. The original base60 source digest is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

The raw outputs are therefore *fully pinned*, not selected for recognizable fragments. CTR's all-zero counter is an investigator-chosen finite test, not an instruction in the manuscript.

| Original p55 scalar choice | ECDH X coordinate (hex) | p55 \`C-X\` IoC | p55 \`C+X\` IoC | p50 AES-CTR printable bytes |
| --- | --- | ---: | ---: | ---: |
| prime **P** | \`4dd01706306598ac89f2bad4b27db2c7331d5b2f8c961fe04e875838879d51ba\` | **0.03438596** | **0.03473684** | **105/256** |
| generator **Q** | \`e7c82e03d514b9670ec169258f410e00e96622f4dffb281ae09e43599f74fbf8\` | **0.03578947** | **0.03368421** | **88/256** |

The original 76-rune p55 ciphertext IoC is **0.03789474**; genuinely solved GP29 English p57 has substantially larger native-text IoC. All four conditional rune decodes remain scrambled GP29 rather than continuous prose. Neither byte receiver begins with a conventional recognizable document header or contains a sustained ASCII instruction. The original-byte AES outputs begin respectively:

- **P:** \`805c99baaa6053b9425eb1151da46f17f89588cb0fdbfbed744d5269f874085e\`.
- **Q:** \`f661edc88fe9a05d6ae10a21f0ded6fa161e9c601adc10ba7f5f4cb0e43930d5\`.

A separate Python \`cryptography\` execution using exactly the source column and two original-derived integers independently reproduced both X coordinates and all tabulated receiver diagnostics. The committed CommonJS SFT uses only Node22's built-in crypto and original repo source files, reextracts both p55 integers from intact printed words, checks the vanity address, and checks native p57 ciphertext/planted plaintext inversion.

## Decision and next route

The **direct ECC key-agreement** of the p50 conditional Bitcoin scalar against both **p55 source-extracted integers**, with fixed GP29 and AES-CTR consumers, is rejected as a plaintext-producing route on the unmodified original. This does not exclude an author-selected different ECDH input, separately authored KDF, a different cipher, or the potential informational role of the numeric panel and the SHED factoring. It also does **not** establish that Bitcoin was used as a puzzle operation. Do not extend to coordinate-byte flips, tuned AES IVs, arbitrary hashes, raw public-key permutations or new scalar-source constructions without independent original instruction selecting them.

The remaining causal obstacle is **the missing bridge from p50's Bitcoin address to p55's field arithmetic and a typed plaintext receiver**. The existing p55 field-DH and p50 image-operation studies do not supply it. This is an intermediate original-input exclusion, so it belongs in \`im-results/\` and leaves [the authoritative overall synthesis](../results/README.md) unchanged.
