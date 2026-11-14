# Parable's three authentic factor primes: a bounded Blum–Blum–Shub inverse on all unknown LP2 pages

**Agent 4, 14 November 2026. Classification: source-selected mathematical generator candidate and finite original-cipher negative result.** This experiment recovers **no unknown LP2 plaintext, key, author-authenticated cipher, or destination**. Its purpose is to test a particular original-source-constrained PRNG architecture once, including a cryptographically conventional bit extractor, rather than extend the already exhausted MT/LCG seeds or optimize new free parameters.

## Independently frozen source and mathematical construction

The original 2013 `AUDIO/761.MP3` ID3 record names **Parable 1,595,277,641**. The authentic solved LP2 p57 PARABLE body has three clause GP-prime sums **1259, 1031, 1229**, satisfying `1259 × 1031 × 1229 = 1,595,277,641`. This cross-round relationship is already established and documented in [the 2013 audio seed study](instar2013-source-seed-inverse.md). The three clause values existed before the unsolved p0–55 ciphertext.

A further independently checkable property makes a *specific*, different cipher candidate possible: each of 1259, 1031, 1229 is prime, but exactly **1259 and 1031 are 3 modulo 4**, and the remaining prime **1229 is 1 modulo 4**. The first two uniquely select a standard Blum–Blum–Shub (BBS) quadratic-residue modulus without fitting a key to ciphertext; the third is a natural coprime seed. The resulting exact proposed key generator is

```text
p=1259, q=1031, seed=1229, N=p*q=1298029
x_0=(seed^2 mod N)=212412
x_{i+1}=x_i^2 mod N
```

The original-state sequence has an **exact 612-state period**, counted from x0 by modular squaring to its first return. The BBS literature uses output parity bits; our primary direct bit reducer groups **five successive low bits**, most-significant-bit first, rejecting integers at or above the desired GP base. Two simple additional field reducers, `x mod b` and `floor(b×x/N)`, are explicitly scoped comparison models. All three are part of a **predeclared 63-setting finite test**, not independent claims about creator intent. No original source names BBS, mandates this assignment of factors to modulus/seed, or specifies a 28- or 29-symbol mapping. An unrelated use of these numbers remains live.

## Exact complete original-input inverse

The immutable [canonical source corpus](../resources/liber-primus/lp2-corpus.json) supplies all **12,956 GP29 ciphertext runes** over **55 nonempty** original unsolved physical pages p0–55. Physical p50 has only numerical data; solved p56 and p57 are excluded from original candidate scoring.

Three ciphertext clocks preserve actual original source boundaries: one stream for all 12,956 runes; restart at each of the **nine** visually headed original chapters; and restart at each **original physical page**. These are possible clocks, not inferred historical key starts.

Each clock and each of three BBS output reducers is consumed by exactly seven predetermined lossless cipher families:

1. **Direct GP29 additive**, `P[i] = (C[i]−k[i]) mod29`.
2. **Nonrepeating 28-choice predecessor mapping** with rank in `0..27` for each actual within-page ciphertext step, under cyclic numeric distance, sorted successor-list rank, or the standard GF29 generator `15^rank mod29`. For each mapping, either `F/index0` or `EA/index28` is the optional 29th plaintext marker emitted as an exact repeat of the immediately previous ciphertext. Each physical page's first published rune is an IV; it consumes no rank key. These two markers are explicit alternative hypotheses, rather than inferred identities of the genuine 86 original doublets.

This is **3 clocks × 3 reducers × (1 direct + 3 rank maps × 2 markers) = 63** inversions, over the complete genuine ciphertext, without a language-trained phase search or discovered offset. All variants have a mathematically explicit inverse and synthetic forward encryption. The source-native solved-p57 **95-GP-rune** control is artificially encrypted and exactly recovered under every tested generation/reversal choice. That demonstrates correct program behavior, not a recovered historical key. Source p57's original clear text and source spelling supply a native reference.

### Original results

| Register | GP29 index of coincidence |
| --- | ---: |
| Complete 12,956-rune original encrypted LP2 | **0.0344783978645** |
| Authentic solved-p57 95-rune clear source | **0.0627099664054** |
| **Best of 63 decoded candidates** | **0.0352953421663** |
| Lowest of 63 decoded candidates | **0.0344556864316** |

The highest-IoC candidate uses **physical-page resets, raw BBS state modulo28, cyclic predecessor rank and plaintext-F-as-repeat**. Crucially this is the *best after 63 choices*, not a separately predicted decoded passage; its output is still statistically close to the unencrypted uniform GP29 baseline `1/29 = 0.0344827586`. The 28-choice map results are slightly above that baseline because every page IV is copied into the candidate plaintext; the actual source-native solved p57 is dramatically higher.

The **canonical parity-bit BBS extractor** and all fixed clocks likewise fail to recover native GP prose. No candidate gives a verified contiguous unknown-page plaintext. No ciphertext-only round trip identifies the historical key: any bijective inverse can forward-reencrypt its own decoding. The positive-control plant solely tests program correctness.

## Independent original artifact consumer: the 256-byte printed numerical grid

The same three independently historical primes also select a concrete direct operation on a **different native register**. The manuscript's p49–p51 numerical table contains exactly **256** authentic two-character base60 entries, already converted without reordering to original bytes `0..255` in [the canonical 32×8 grid](../resources/liber-primus/base60-grid.json). That explicit byte table is an actual candidate encrypted binary payload, distinct from the GP29 rune prose. Its 256 positions and source-raster order are fixed before decoding; no arbitrary row permutation, guessed nonce, pad shift, or secret byte assignment is introduced.

Apply both the conventionally defined **BBS parity output** (one output bit per squaring) and the **standard Blum–Goldwasser output size** `h=floor(log2(floor(log2(N))))=4` low bits per squaring, grouped respectively in eight-bit or two-four-bit bytes, as bytewise XOR pads on the entire original 256-byte array. To avoid treating an indexing convention as historical fact, test first output from seed-square state `x0` or the next squared state `x1`, packing one- or four-bit chunks MSB-first or LSB-first. **A mathematically distinct, speculative endpoint interpretation** treats the third authentic prime, 1229, as a *terminal BBS state* rather than an initial seed: it is a quadratic residue both modulo1259 and modulo1031, so repeated unique square-root extraction in QR(N) uses the exact inverse power `x_previous=x_current^161968 mod1298029`. Neither the original page nor the 2013 audio names the third prime as a Blum–Goldwasser terminal state. **Chronological terminal-state completion:** the earlier eight backward cases align successively recovered reverse-time fragments directly to the table's forward printed order. Standard Blum–Goldwasser decryption instead treats the transmitted state as `x_(t+1)`: its first square root gives `x_t`, the **last** keystream fragment. Reversing the entire extracted fragment tape restores original byte order. We have now tested that distinct, previously missing read for **both 1-bit (2,048 squarings) and standard 4-bit (512 squarings) output**, two exact terminal/root-first origins and both chunk-packing orders. The root-first chronology corresponds to the textbook terminal-state position. The historical source supplies no actual terminal-state field or ciphertext framing; the added screen assumes its third clause-prime `1229` serves as that state. Total direct tests are now **24 predetermined inverses** (eight forward, eight backward-time aligned, eight backward-time reconstructed into chronological order), with no fitted seed, byte rotation or key search. A 256-byte source-native English control, XOR-enciphered with every candidate pad, fully recovers with the same operation and exact original byte length.

| Extractor, fixed state and byte packing | Decoded printable ASCII bytes / 256 | Recognized binary file prefix |
| --- | ---: | --- |
| 1-bit BBS, `x0`, MSB | **96** | None |
| 1-bit BBS, `x0`, LSB | **97** | None |
| 1-bit BBS, `x1`, MSB | **92** | None |
| 1-bit BBS, `x1`, LSB | **101** | None |
| 4-bit Blum–Goldwasser, `x0`, MSB | **105** | None |
| 4-bit Blum–Goldwasser, `x0`, LSB | **97** | None |
| 4-bit Blum–Goldwasser, `x1`, MSB | **98** | None |
| 4-bit Blum–Goldwasser, `x1`, LSB | **95** | None |
| Backward 1-bit BBS, terminal `1229`, MSB | **117** | None |
| Backward 1-bit BBS, terminal `1229`, LSB | **115** | None |
| Backward 1-bit BBS, one square root first, MSB | **99** | None |
| Backward 1-bit BBS, one square root first, LSB | **98** | None |
| Backward 4-bit Blum–Goldwasser, terminal `1229`, MSB | **93** | None |
| Backward 4-bit Blum–Goldwasser, terminal `1229`, LSB | **93** | None |
| Backward 4-bit Blum–Goldwasser, one root first, MSB | **92** | None |
| Backward 4-bit Blum–Goldwasser, one root first, LSB | **86** | None |

The **eight additionally tested chronological terminal-state reconstructions** likewise produce no readable plaintext or recognized binary header. These are the exact new unmodified-source outcomes:

| Chronological terminal-state model | Printable ASCII / 256 | First 16 decoded bytes (hex) |
| --- | ---: | --- |
| 1-bit, terminal first, MSB | **100** | `b7965366c76f57646501e60fe0c45e0f` |
| 1-bit, terminal first, LSB | **103** | `f569888104acea7cc0e6c2551f07200f` |
| 1-bit, **root first**, MSB | **97** | `75df5dd432ac6a5ec005a1b67ce4c339` |
| 1-bit, **root first**, LSB | **104** | `b6fbf8ccab6f562065c620c826039963` |
| 4-bit, terminal first, MSB | **95** | `8db84c55fbb509de0bef210a80fd0431` |
| 4-bit, terminal first, LSB | **95** | `af121944c868092129984793809b8c8a` |
| 4-bit, **root first**, MSB | **99** | `0f8259049848f9c1c988f703b07b2cea` |
| 4-bit, **root first**, LSB | **95** | `87b14851feb706d005ee2a0383f30e37` |

The bytes remain broadly opaque (at most **119/256** when tab, LF and CR are additionally accepted as textual whitespace); none starts with the directly tested PDF, ZIP, gzip, PNG, JPEG, bzip2, ID3, Ogg, 7z or RAR signatures. These direct XOR decodes do not reveal the expected immediately recognizable instructions or standard binary container. This **does not** exclude a secondary encrypted/compressed binary payload under a different historical key; such a second layer needs its own clue rather than blind header fitting.

[Independent original-byte CommonJS SFT](../sims/lp2_parable_bbs_grid256_byte_xor_sft.cjs) with fully reversible native-English XOR positive control, source table assertions, 24 decoded header and printability gates including the mathematically verified backwards square-root states; [Windows Node22 CI PASS run 43630572516](https://github.com/FlareZ123/liber-primus/actions/runs/43630572516) for the original sixteen directions; the eight added chronological-terminal cases also passed the [new original-input Windows Node22 CI run 43634034276](https://github.com/FlareZ123/liber-primus/actions/runs/43634034276), on commit 06796a1fc8d0165e57ed61aa6b36df92b53d7744.

## Decision and exact reproducibility

**Retire this explicit triple-selected BBS architecture, including the restored forward-time terminal-state interpretation,** for original-table direct byte-XOR, direct GP29 additive decoding, and the three declared GP28 nonrepeating predecessor transports, including F/EA marker alternatives and the three source-visible restart scopes. Do **not** retire other mathematically motivated uses of the PARABLE factors, recoverable external key material, separate bitmap/word mechanisms, or non-English registers. The source did not prescribe BBS, and the low IoC evidence addresses the exact finite, reproducible readings above rather than all possible transformations.

- [Read-only single-file Windows Node22 CommonJS SFT](../sims/lp2_parable_threefactor_bbs_original_sft.cjs) loads the untouched source corpus, proves the distinct factor properties, exact BBS return period and modulus/seed, implements all 63 inverses and full native p57 planted re-encryption checks, and asserts original/best/worst IoCs.
- [Successful original-source Windows 11-equivalent GitHub Actions run 43627695938](https://github.com/FlareZ123/liber-primus/actions/runs/43627695938), from the repository's existing **manual-only** read-only CommonJS SFT runner. The workflow did not modify the corpus or run on push.

**No novel unknown-page plaintext, genuine cryptographic key, or destination has been recovered.**
