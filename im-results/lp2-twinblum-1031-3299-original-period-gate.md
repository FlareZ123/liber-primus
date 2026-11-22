# The historical lower-twin Blum modulus 1031 × 3299: an all-seed period obstruction

**Agent 31, 22 November 2026. Intermediate mathematical exclusion, no recovered unknown plaintext or key.** Executable original-input [CommonJS SFT](../sims/lp2_twinblum_1031_3299_source_sft.cjs) passed [Windows Node22 CI 45082201490](https://github.com/FlareZ123/liber-primus/actions/runs/45082201490).

## Why these exact primes, and what is genuinely new

The independently archived original **2013 CicadaOS** script [\`prime_echo\`](../resources/historical/cicada2013-os-original-prime-echo.sh) prints two unusually long two-second pauses **after 1033 and 3301**; these primes' immediate lower twins are **1031 and 3299**, printed just before the respective pauses. A 2014 player could find both lower twins without inspecting LP2 ciphertext. The later source p15 Fibonacci-prime square explicitly colors **3299** red, while independently solved terminal p57's second PARABLE body sentence has exact GP-prime sum **1031**. These cross-round links and the red square generator are already documented in [the historical twin-emirp study](lp2-2013-twin-emirp-reversal-cardinal-address-gate.md) and [the solved p15 construction](../results/lp2-p15-fibonacci-prime-spiral.md). The 3299 appearance follows directly from the known p15 generator and is **not an independent cipher-key confirmation**.

The new mathematical interpretation is that both lower twins are primes congruent to **3 mod 4**, while both paused upper primes are **1 mod 4**. Thus the two lower twins alone form a conventional **Blum integer**, with no factor picked by scoring unknown LP2 ciphertext:

\[
N=1031\cdot3299=3{,}401{,}269.
\]

A technically literate solver could hypothesize the Blum–Blum–Shub (BBS) square-state generator \(x_{t+1}=x_t^2\bmod N\). **No authenticated Cicada instruction names BBS, a seed, a bit extractor or any ciphertext consumer.** In particular, the historical alternate modulus \(1259\cdot1031\), motivated by the 2013 PARABLE product, has already undergone a separate and extensive [direct-generator rejection](lp2-2013-parable-blum-blum-shub-original-gate.md). The present 1031×3299 modulus is a different, naturally source-selected mathematical candidate, and its strongest result uses **all possible seeds**, rather than fitting a stream.

## Exact period theorem and all-secret p50 byte exclusion

For any starting BBS state, the component modulo each factor is either zero or becomes a quadratic residue after one squaring. The nonzero quadratic residue groups have respective orders

\[
(1031-1)/2=515=5\cdot103,\qquad
(3299-1)/2=1649=17\cdot97.
\]

The multiplicative orders of **2** modulo those odd group sizes are **204 and 48**. Their least common multiple is exactly **816**. Hence, after at most one initial step, **every possible square-state trajectory repeats at a period dividing 816**, including a state divisible by a modulus factor. Any fixed one-bit extractor of the current state inherits that period, for *every secret seed and initial clock*. Because 816 is divisible by 8, its conventional consecutive eight-bit byte packing repeats at lag **102 bytes**. The statement holds for both within-byte bit orders; with a possibly transient initial state, start the comparison at byte index1.

The manuscript's exact original 32×8 table spans physical pp49–51 and has **256 two-character tokens**. Under both the conventional base60 and the historically disputed base59 numeric readings, there are **0/154 equal byte pairs separated by 102 positions**. A direct BBS-byte trace would require **all 153/153** such comparisons starting at byte1 to match; here zero do. This decisively excludes the printed table as **direct consecutive BBS output** for this source-derived modulus, regardless of seed, offset, deterministic one-bit extractor, or MSB/LSB packing. The direct-trace exclusion says nothing about a ciphertext resulting from XORing an unrelated plaintext with that stream.

A stronger conditional plaintext test grants the attacker an **entirely arbitrary secret 102-byte XOR pad**, far more freedom than an actual BBS stream. For each residue \(r=0,\ldots,101\), there must be at least one key byte \(k_r\) making *every* \(C_i\oplus k_r\) at positions \(i\equiv r\bmod102\) printable ASCII or one of tab/LF/CR. In the actual 256-byte table, **60 of 102 residue classes** have *no possible such key byte* under base60; **61 classes** have none under base59. An exact counterexample occurs already in base60 at positions **0,102,204**, whose bytes are **203,32,194**: no possible single XOR byte makes all three printable ASCII/whitespace. Thus **no BBS seed and no other 102-periodic XOR pad can decode the complete printed table as plain ASCII under that exact byte model**. This is an all-key impossibility, independent of an English language model. Binary/compressed payloads, other cipher operations, nonstandard output clocking and table permutations are outside the claim.

The source-driven BBS positive states with initial seeds 3301, 1033, 1229, 761, 2, 449 and 1259 all have measured exact **816-state orbits**, as the general theorem predicts; the period theorem itself needs none of those seeds.

## Direct unknown-cipher screen and finite outcome

A secondary screen asks if this source-derived modulus can directly expose original LP2 GP29 prose. On all **12,956 unknown original ciphertext runes** and the separately held-out **1,680 original p33–39 cuneiform runes**, use seven independent public-historical numerical seed candidates \`3301, 1033, 1229, 761, 2, 449, 1259\`. For each, interpret square-states as direct \`x mod29\`, or consecutive low BBS bits in 5-bit (reject 29–31) or 8-bit (\`mod29\`) fields, with both MSB/LSB orders where meaningful, initial/after-squaring output and both additive GP29 signs. This is **140 explicitly enumerated decodes**, including a source-adjacent section measurement. The source does not select a unique seed, reduction or GP29 addition rule, so this sweep is a bounded negative, not an exhaustive cryptographic refutation.

| Original register | GP29 index of coincidence |
| --- | ---: |
| Unchanged 12,956 unknown original runes | **0.0344783979** |
| Unchanged p33–39 passage | **0.0343600216** |
| **Best** of 140 full-book inverses | **0.0345228556** |
| **Best** of 140 p33–39 inverses | **0.0348740747** |
| Independently clear solved p57 source | **0.0627099664** |

All screen outputs remain near the uniformly random 29-rune rate \(1/29\), far below a sustained readable GP English passage. All 70 construction-specific synthetic p57 plants decrypt **95/95** runes under their own keys; those controls prove inverse consistency, not author intent.

An independent direct 256-byte XOR screen using six of the seven historical seeds under two bit orders and two starting-bit conventions yields between **87 and 108 of 256** bytes printable ASCII including whitespace, with no readable source text. The best count is only 42.2%.

## Exhaustive binary-file consumer across every original BBS seed

A self-validating **binary file** is a materially different receiver from ordinary GP29 plaintext or all-ASCII bytes. This source-derived, bounded path was exhaustively checked on the complete original 256-byte table without inventing a BBS seed or checking arbitrary English. For each of all **3,401,269** integer seeds \(0\le s<N\), compute its square-state \(s^2\bmod N\), retaining all **851,400 distinct square states** (including extra non-coprime/zero states as a conservative superset of valid BBS). For each state, test the output bit of the state or its successor, both most-significant- and least-significant-bit-first eight-bit packing, and **both** image-preserving original base60/base59 256-byte readings. XOR the corresponding full generator byte stream with the printed table. Test ordinary untransformed file headers (ZIP, gzip, PNG, JPEG, bzip2, xz, PDF, ASCII-armored PGP, LZMA, 7zip, Ogg, ID3) and the three canonical zlib compression-level headers.

The finite exhaustive original result is **320 short-header matches**: 316 two-byte zlib headers, two three-byte ID3 headers and two three-byte bzip2 headers. All **316** zlib candidates fail native zlib stream and checksum validation; the two ID3 candidates fail ID3 version/flags requirements; the two bzip2 candidates lack a complete conventional block marker. **Zero** candidates reach a self-validating binary file, with no plausible independently identifiable payload. Exact-4-byte types have **zero** initial matches. This charge covers every square-state seed, the direct BBS XOR operation with phase 0/1, both byte bit orders, and both authentic source-byte readings. A separate proper zlib file was constructed, XOR-encrypted under authentic source seed1033 and then decoded exactly as a positive.

This is a **complete original binary receiver exclusion for these precise direct BBS XOR conventions**, extending the former all-secret ASCII/XOR argument to compressed-file payloads without pretending a two-byte file-header coincidence is plaintext. It does not cover externally selected asynchronous bit clocks, additional stream transforms, a different modulus or binary without a recognizable self-validating header. Further source-unselected BBS seed enumeration is now exhausted for this source route.

[Single-file original-source all-state CJS reproducer](../sims/lp2_twinblum_allstate_original_binary_file_sft.cjs) · [Windows Node22 CI PASS 45084205218](https://github.com/FlareZ123/liber-primus/actions/runs/45084205218).

## Decision

Retire (i) this exact modulus as a **direct generator of the printed table**, (ii) **every** 102-byte-period XOR stream as a complete **ASCII** table decryptor, (iii) the 140 fixed direct GP29 additive inverses, and (iv) **all** 851,400 distinct squared BBS states as the direct XOR source of an ordinarily self-validating 256-byte compressed or file-format object. Preserve the **source-selected lower-twin Blum interpretation** only as a possible operation whose actual receiver and transport would need independent author evidence. No key, genuine unknown-runic plaintext, or destination was recovered. Direct seed and ordinary bit-order search is exhausted on both the original GP29 text consumers and the explicit binary-file receiver. A differently selected original operation would need independent author evidence.

**Reproduction:** original [2013 CicadaOS prime_echo](../resources/historical/cicada2013-os-original-prime-echo.sh), [p50 256-token table](../resources/liber-primus/base60-grid.json), and [LP2 58-page GP29 source](../resources/liber-primus/lp2-corpus.json), read unchanged by [SFT](../sims/lp2_twinblum_1031_3299_source_sft.cjs) on [CI 45082201490](https://github.com/FlareZ123/liber-primus/actions/runs/45082201490).
