# Original 2013 761.MP3: complete ID3 and MPEG envelope inventory

**Classification:** original-binary source recovery with finite ID3, MPEG frame-boundary and end-of-file audits. The ID3 inventory completed Director Issue #139; the MPEG container gate completes #445. **No new 2013 instruction, LP2 unknown plaintext or cipher key was recovered.** Both tests use a pinned immutable original with SHA-256 checks and separately declared controls.

## Pinned original and native parser

The actual archived binary is [`rtkd/iddqd/2013/02/761.MP3`](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) at commit `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`. Source bytes: **4,010,732**, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. A short opt-in `id3-audit` branch was added to the **existing** `.github/workflows/audio-761-pad-scan.yml` workflow. It downloads the immutable original and executes the standard-library-only [`sims/audio761_id3_frame_audit.cjs`](../sims/audio761_id3_frame_audit.cjs). The [completed successful hosted run 42986331787](https://github.com/FlareZ123/liber-primus/actions/runs/42986331787) independently verifies the full hash and runs two synthetic text-frame positive controls, plus a one-to-one decoded ID3 frame inventory. The opt-in mode skips the previously exhausted audio-pad searches and FFmpeg.

The source contains exactly **one ID3v2.3.0 header**, flags `0`, at file offset0. Its synchsafe declared body length is **196 bytes**, ending at byte **206** (exclusive), without padding. No ID3v1 128-byte footer exists. The MPEG audio begins at offset206 with bytes `ff fb b0 64`. Its three native frames exactly fill the header:

| Frame | Byte offset (including 10-byte frame header) | Payload bytes | Original decoded value |
| --- | ---: | ---: | --- |
| **TXXX** user text | 10 | 140 | Description: `Parable 1,595,277,641`; value: `Like the instar, tunneling to the surface\nWe must shed our own circumferences;\nFind the divinity within and emerge.` |
| **TIT2** title | 160 | 21 | `The Instar Emergence` |
| **TPE1** lead performer | 191 | 5 | `3301` |

Each frame is ISO-8859-1 text with encoding byte0 and two-byte ID3 frame flags0. The TXXX description/value separator is one actual NUL byte. Crucially, the body stores **two literal backslash-n pairs** (`\n`, bytes `5c 6e`) instead of line-feed characters (`0a`). A normalized 2013 Parable transcription may display these as line breaks; it is not byte-identical to the source tag.

Exact original payload fingerprints:

- TXXX SHA-256 `bbe6b0e411d74df5bdd7b6b33deebdb774a059e4fd0cb5baeba21ef53b0ea1b8`; prefix hex `0050617261626c6520312c3539352c3237372c363431004c`.
- TIT2 SHA-256 `914827b6e3c27b7aa7c56ab9c824431bb920bc04ba9c987d5fd4756fe88f3132`.
- TPE1 SHA-256 `ad2ba3a4bf4a9c363acec8ecb9d04dc8db02e57c7a33f47e64668fc2d6fc0610`.

There is no fourth frame, hidden comment, attached picture or metadata padding in this **206-byte source tag**. Source identity and frame lengths are confirmed by the parser's strict offset/end-of-tag assertions, with a planted TIT2+COMM tag and planted padding also successfully recovered. A different payload hidden in MPEG compressed audio is outside this scoped audit; prior audio wave and pad scans remain separate.

## GP-prime title sum matches the original basename

The original ID3v2.3 `TIT2` frame stores **`The Instar Emergence`** (21-byte payload at file offset160), while the immutable original file is named **`761.MP3`**. Under the canonical Gematria Primus prime weights:

| Title word | GP prime-weight calculation | Sum |
|---|---|---:|
| THE | TH=5 + E=67 | 72 |
| INSTAR | I=31 + N=29 + S=53 + T=59 + A=97 + R=11 | 280 |
| EMERGENCE | E=67 + M=71 + E=67 + R=11 + G=17 + E=67 + N=29 + C=13 + E=67 | 409 |
| **Total** | **72 + 280 + 409** | **761** |

The title sum equals the original basename exactly. This is an original-artifact positive control for GP-prime-sum numeric naming, independent of LP2 plaintext. The same original TXXX frame stores `Parable 1,595,277,641`, which equals the product of the three p57 body-clause GP-prime sums `1259×1031×1229`; the heading-sum-449 remainder candidate `[361,133,331]` and its 2014 HTML title/id match are detailed in [the original-audio Parable analysis](audio-761-pad-scan.md#parable-s-heading-is-the-modulus-of-the-seventh-onion-title-and-id). This is a source-level numeric checksum; the modulo operation and its interpretation as an address remain inferred. It is not, by itself, an authenticated instruction that all words should be counted or that sums address pages/words. In particular, the later-preserved first-onion `COUNT`/`NUMBER` service is reconstructed; no original `NUMBER` implementation or byte-preserving session is known. The candidate decimal reversal `761→167` and the existence of a 2014 `167.jpg` prime page are therefore a possible cross-round association, not an authenticated page pointer. See [the consolidated address-source audit](gp-prime-address-source-audit.md).

### Terminal headings and a conditional 761/DH5 orbit (12 November 2026)

The **already-solved** LP2 p56 heading `AN END` has GP-prime sum **311** (`A=97, N=29, E=67, N=29, D=89`); p57's original unencrypted `PARABLE` heading has GP-prime sum **449** (`P=43, A=97, R=11, A=97, B=61, L=73, E=67`). Both totals are prime and **311 + 449 = 760 = φ(761)**. This links the two solved terminal rubrics arithmetically to the independently existing 2013 `761.MP3` basename and its ID3 title checksum. It is an exact, but retrospectively noticed, **possible creator-era checksum**. The original sources contain no instruction to add the headings or make them encryption exponents.

One further *independently sourced* number makes a sharply bounded group test possible. The creator-signed 2013 TCP/Diffie–Hellman teaching example has **base 5** (in its worked DH23 exchange). Transplanting that illustrative base to the prime modulus 761 yields exact order **38**: `5^38 ≡ 1 (mod 761)`, but `5^19 ≡ −1 (mod 761)`. Physical unknown LP2 p55 has **76 source runes = two complete 38-step periods**. The complementary headline totals also give `5^311 ≡ 503` and `5^449 ≡ 351 (mod 761)`, with `503×351 ≡ 1 (mod 761)`. These identities hold without using any unknown plaintext and place the three source artifacts in one compact construction. But 5 was the base of an **illustrative 2013 exchange under modulus 23**, not a documented choice under 761; neither signed message nor original LP2 pages says to use this orbit as a key.

For a single fixed original-cipher test, initialize exponent `e∈{0,311,449}`, emit `K_i=(5^(e+i) mod761) mod29`, and apply the historically known GP29 addition/subtraction inverses `P_i=C_i±K_i (mod29)` to **all 76 unmodified original p55 runes**, in printed order. No position/phase fitting, glyph omission or hypothetical F interruption is used. Each model has period 38 in its putative keystream. The six full-page candidates have original-output IoCs **0.032632, 0.037544, 0.036491, 0.036491, 0.034737, 0.034386** (ordered e=0/311/449, minus then plus), with **no sustained recognizable GP29 prose**. Every decoder recovers an independently constructed 76-rune solved-p57 positive plant, and the separate authentic p56 φ(prime) / one-F-interruption regression recovers **85/85** true runes. Re-encoding the actual p55 ciphertext is an implementation check only; it cannot authenticate the candidate key.

**Authentic F-interruption sensitivity test:** p55 contains ciphertext F only at zero-based original offsets **15, 25 and 41**. In the two already solved LP1 Vigenère passages and the solved p56 totient cipher, some literal F runes skip the advancing key. Freeze the same three DH5 exponents and two signs and examine *every one* of the exactly **2³=8** possible consumption masks (48 complete, reversible 76-rune originals), without searching source starts. The strongest output is exponent311, subtractive sign, **all three Fs passed through**, with GP29 IoC **254/(76×75)=0.0445614** and nonlinguistic text. Every other mask has a lower IoC. All 48 remain below the **0.045614** minimum of 3,429 authentic solved-reference 76-rune windows already established in the terminal known-plaintext study. All original inverses re-encode 76/76, and all 48 source-native 76-rune plants recover exactly with the planted skip policy. Thus the direct DH5 additive stream still fails with its only historically justified exception family; further free exponents or output projections are unsupported.\n\n**Stronger literal-residue exclusion, without a candidate key:** the signed 2013 protocol also teaches `BASE29`; a residue modulo 761 occupies at most **two** base29 digits because `29²=841>761`. Therefore the original **76 p55 runes could, conditionally, encode exactly 38 ordered base29 residues**, one complete orbit of base5 modulo761. This framing immediately fails even *before* checking the orbit. The source-native high-digit-first interpretation yields 38 two-rune values with **three values outside [1,760]** (807, 812, 830), and low-digit-first leaves **two outside** (806, 817). Only **1/38** and **2/38**, respectively, belong to the exact order-38 subgroup of `GF(761)×`, whereas a literal DH5 cycle would require **38/38**. The finite extra historical digit mappings (plain GP29 Atbash, Atbash+3 and Atbash−3) and both digit orders also fail: respectively, **33–36** of 38 lie in range and **0–5** of 38 lie in the subgroup. **The exact p55 physical first-pair alignment contains 37 distinct two-rune pairs among its 38 pairs**, with one duplicate token (base29 ordinal 566). Because the true order-38 orbit has 38 distinct states, this independently rejects *every* stationary injective, even completely secret, encoding of a complete literal 38-element orbit into 2-rune tokens. This latter statement does not assume the conventional numeric digit map, its direction, or an identifiable 761 range. A planted full 38-element DH5 orbit encoded into 76 GP digits passes every range and subgroup check. This excludes a literal BASE29 serialization of the DH5 orbit under these eight authentic-operation mappings; it does **not** exclude a genuine plaintext-bearing multiplicative cipher, additional encipherment, unknown digit alphabet or a missing key.

[Exact original-input CJS SFT](../sims/lp2_761_dh5_terminal_headings_original_sft.cjs) asserts the solved headings, sums, true group order, complement inverses, original 76-rune page, eight literal-BASE29 range/subgroup gates, the 37-vs-38 all-bijection collision obstruction, six original additive-decoder pair counts, the entire 48-variant authentic-F-interruption family, positive controls, and exact forward inverses. **Decision:** this is a new source-derived, mathematically precise terminal orbit *hypothesis* with negative original direct-additive (including every three-F clock-interruption policy) and literal BASE29-group consumers. It supplies no authentic unknown plaintext or historical LP2 cipher choice. Absent an original instruction connecting the 2013 DH base to 761 and specifying how GF(761) residues become GP29 runes, do not broaden it into unrestricted projections, phases or table-derived keys.

### Source-number inversion: 2013 DH modulus 23 gives an exact 76-cycle modulo 761 (Agent16, 12 November)

The **signature-valid 2013 TCP-server challenge** uses prime modulus **23** in its illustrated Diffie–Hellman exchange, with base5. The independently pinned 2013 audio title has GP sum **761**, also the MP3's filename. Replacing the *historical modulus* 23 by a *generator* modulo the audio's 761 gives

\[
\operatorname{ord}_{761}(23)=76,\quad 23^{76}\equiv1\pmod{761},
\]

with **76 distinct residues** before returning to one, exactly the original physical p55 rune count. This is a complete cycle and a specific possible key clock. **The role swap is not an author instruction**: the signed example never says to use its old modulus as the base of a new exchange, and a group-order equality recognized after knowing p55's length is susceptible to selection bias. The source-related base5 under 761 has order38, as documented above, so this is a distinct but similarly retrospective construction.

Freeze the simplest literal source-cued transformation before consulting language scores: starting at \(x_0=1\), advance \(x_{i+1}=23x_i\bmod761\) for exactly 76 p55 symbols, emit \(k_i=x_i\bmod29\), and try the historically used additive GP inverses \(p_i=c_i-k_i\) and \(p_i=c_i+k_i\), with no F skip, phase, alternate modulus or page-boundary alteration. The **complete original 76-rune ciphertext** has IoC 0.03789474; **both** original outputs have IoC **0.03403509**, and neither forms coherent GP English. Their literal GP transliterations are:

- minus: LTHEOEORFDNGEEOUDXNAEIUYSHXYUEYNGNGDGMYSEAFJFWABXPLPTEALGXODEONGWECNITHJCXWYDLHTDGCAEAEOOEDD
- plus: OEMYHIUJWLEDEOAAEMAOEMTHBBWTUHWYOEOPJBPFATHGFJPNNGFAEMEOEAPHLNGDAEIALOEOEEAOEDWNGMMRSRDNGYEAEOPY

The [source-original complete CJS test](../sims/lp2_signed2013_dh23_mod761_p55_orbit_sft.cjs) proves order76 by enumerating all distinct group residues, asserts the 76 untouched original p55 runes, checks complete GP29 forward reversibility, and encrypts/decrypts a distinct source-native 76-rune solved-p57 positive plant under both signs. It passed in the existing [manual-only original-source workflow run 43331710185](https://github.com/FlareZ123/liber-primus/actions/runs/43331710185). A perfect roundtrip for any key is only an implementation invariant.

**Decision:** This exact arithmetic gives a possible *historically sourced 76-step clock* whose direct GP29 additive use fails on original p55. It recovers no authentic key or unknown plaintext, does not supply a contemporaneous author-selected role exchange, and gives no warrant to scan phases, key projections, group elements or further exponents. Reopen only if an independently preserved instruction explicitly links the 2013 DH modulus to the 761 group and specifies a non-additive invertible consumer.

## Parable's three-prime product as a textbook RSA modulus: direct original-input format gate

The independently documented TXXX number `1,595,277,641` factors into the **three prime-valued sums of the solved p57 body clauses**, `1259×1031×1229`. A possible historically recognizable interpretation is a **three-prime RSA modulus**, because the solved LP1 admonishes that primes and the totient function are sacred. This is a *hypothesis*: the author does not name RSA here, and any product of distinct primes can mathematically serve as an RSA modulus. The original MP3 title sum/filename **761** and the Cicada identifier **3301** both happen to be invertible public exponents, with respect to this modulus's `phi(N)=1,591,168,720`: their exact private exponents would be **190,271,161** and **23,137,261** respectively. Their existence does not establish a key choice.

Textbook RSA enciphers a numeric block into a residue **strictly below N**, irrespective of exponent. Since `29^6=594,823,321 < N < 29^7=17,249,876,309`, any fixed-width **seven-GP-rune base29 RSA ciphertext block** must begin with a numeral 0, 1 or 2. This remains a maximum of three symbols even under an arbitrary unknown fixed permutation of the 29-rune alphabet. But for every one of **55 original unknown rune-bearing pages**, every possible offset of its seven-rune clock has **at least seven distinct glyphs** at the would-be leading positions; in the book-continuous version all seven clock phases have **all 29 glyphs**. Thus no page-wise secret alphabet remapping or unknown seven-rune alignment can make the original pages direct fixed-width textbook RSA ciphertext blocks under this N.

Likewise, treating each original complete GP ciphertext word as one base29 RSA ciphertext residue gives **536/2,896 actual values >=N**, an exact obstruction to the literal per-word-block model. Treating the printed p50 **256 original bytes** as **64 four-byte RSA ciphertext blocks** fails the same range requirement: only **19/64** big-endian and **32/64** little-endian blocks are <N. An actual positive encrypts six-rune segments from the solved p57 under each exact source-number exponent, serializes each result into seven base29 digits and decrypts all segments without error, confirming the bound and RSA arithmetic.

[Executable source-and-solved-plaintext original gate](../sims/parable_three_prime_rsa_original_format_gate.cjs) preserves these necessary format checks. This rejects the direct, uncompressed RSA block readings of LP2 runes and p50 byte cells under the candidate N. It leaves byte packing across nonstandard boundaries, other modular constructions, keys derived from N and an unrelated purpose for the embedded Parable product open. **No unknown plaintext, original RSA key instruction or continuation is recovered.**

## Exact MPEG audio frame and file-end audit (Director #445)

The [source-locked MPEG frame SFT](../sims/audio761_mpeg_frame_structure_sft.cjs) parses all frames at their *next expected byte boundary* instead of scanning for arbitrary sync markers. It operates on the same SHA-256-checked **4,010,732-byte** original used for the preceding ID3 audit. [Successful manual-only CI with matched encoder and planted trailer controls](https://github.com/FlareZ123/liber-primus/actions/runs/43128163885) also runs FFprobe and the FFmpeg decoder. It adds the opt-in `mpeg-audit` selection to the existing manual `.github/workflows/audio-761-pad-scan.yml` workflow, with no push-triggered CI.

| Property | Original 2013 761.MP3 |
| --- | --- |
| ID3v2.3 envelope | offsets **0–205**, exactly **206 bytes** |
| Compressed audio | offsets **206–4,010,731**, exactly **4,010,526 bytes** |
| Sequential MPEG-1 Layer III frames | **6,397**; first offset206, 626 bytes; last offset **4,010,105**, 627 bytes |
| Sample rate, bitrate | **44,100 Hz**, **192 kbps CBR** on every frame |
| Channel/flags | all 6,397 headers are joint stereo, original=1, copyright=0, private=0, no CRC, emphasis=0 |
| Frame padding | **393** unpadded and **6,004** padded frames |
| Side-info reservoir back-pointer | 6,395 nonzero, maximum **447** (9-bit field) |
| First-frame marker | ordinary **Info** encoder header, `LAME3.98r` |
| Info declared audio frames | **6,396**, excluding the Info frame itself (6,397 parsed in total) |
| Info declared compressed bytes | **4,010,526**, matching the complete audio region |
| Independent FFprobe | `mp3`, 44,100 Hz, 2 channels, 192,000 bits/s, reported duration **167.021134 s** |
| MPEG frame-clock duration | **167.1053061224 s**, including encoder/info framing |
| Unparsed trailing bytes after last frame | **0** |

The original plays through FFmpeg without a reported decoder warning or error. The pre-existing ID3 audit already established that the only three tag frames are TXXX, TIT2 and TPE1, and that there is no ID3v1 footer. The new audit shows the file has no extra trailer after the last intact MPEG frame, including no trailing APEv2 block, secondary ID3 tag, or appended instruction file. This is an **out-of-band container exclusion**, not a statement about hidden data in valid compressed MP3 bits.

**Controls and falsifiability.** A separately encoded ordinary FFmpeg/LAME 192-kbps 44.1-kHz stereo control has **117** sequential valid frames and no tail, and its Info frame declares **116** frames, exhibiting the same standard one-frame offset. A synthetic marker `FROZEN_APPEND_TEST` appended to the authentic source is detected in full by the same parser, confirming that a non-frame trailer would have been visible. The parser additionally asserts the Info frame count and byte-count relationships for both original and control. All evidence is in the successful run above; no symbol key, audio frequency, frame subset, or ciphertext phase is fitted.

**Reserved Layer-III side-information payload check (12 November).** Each valid 192-kbps MPEG-1 stereo frame contains exactly three syntactically reserved side-information private bits after the nine-bit `main_data_begin` back-pointer. These are separate from the single private bit in each MPEG frame header (already verified zero). The full original file's **6,397 three-bit side-private fields are all 000**, so the entire **19,191-bit** reserved side-channel is constant zero. A matched ordinary LAME/FFmpeg 117-frame control likewise has 117/117 zeros. A planted one-bit mutation in the original's first frame's three-bit private field must be and is detected as exactly one nonzero event (one `001` field, 6,396 other zeros). [Independent source/control channel run](https://github.com/FlareZ123/liber-primus/actions/runs/43131072454) has the original observation; the stronger planted-field regression is [rerun 43131212467](https://github.com/FlareZ123/liber-primus/actions/runs/43131212467). This **decisively excludes data hidden in those 3-bit reserved fields** on the pinned MP3, independent of any candidate password. It says nothing about `part2_3_length` parity, bit-reservoir payloads or quantized audio coefficients. Standard MP3Stego instead manipulates part2_3_length; it does not use this reserved field as its ordinary channel. [The original MP3Stego implementation description](https://www.petitcolas.net/steganography/mp3stego/) and [MPEG side-info standard overview](https://datatracker.ietf.org/doc/html/draft-ietf-avt-rtp-mp3-00) distinguish these mechanisms.

**Scope and solve-path decision.** The historically documented, actionable 2013 use of this asset is the bytewise XOR of the MP3 against a Twitter stream, with the Parable text and its source-number checksum conveyed explicitly in ID3. The audio signal itself supplies no independently attested *second* listening, spectral, timing, or MIDI-to-GP29 rule. The compressed frames are ordinary legal MPEG packets as far as this boundary/metadata parser can establish. A watermark within MP3 scale factors, quantized samples, bit reservoir, or perceptual audio could still exist; no original clue currently selects how to extract one. Do not rerun unmotivated FFT peaks, offsets, direct MP3-byte pads, or PCM keyskip searches already reported in [the consolidated audio study](audio-761-pad-scan.md).


## 2013 DH 76-cycle as a p55 rank-order transposition (13 November 2026)

The signed 2013 server challenge authenticates `DH 23`; the source-derived pair is (p=761,g=23). Since (23) has exact order **76** modulo 761 and p55's page-local stream contains **76** runes (including the inherited one-rune page-turn carry), a natural non-additive, invertible consumer is to sort the 76 distinct orbit values and use their ranks as a 76-position transposition key. This is more constrained than reducing the orbit modulo 76: the latter has only **46 distinct residues** and is not a permutation.

The rank permutation is unique. Both inverse orientations were applied to all 76 p55 runes, without phase, rotation, offset, or alternative modulus search:

| Input / orientation | GP29 output | Emerson-GP score |
|---|---|---:|
| Raw p55 | baseline | −6.510805 |
| Rank scatter | `NGTHFAEEASEOIBETHOELTHXEJBXGHBUTHPMIABMISFXRCHCISXDCECGBDISSEOMGMWSEPEONGAAEUUFWMEOEACEEOIAIEAD` | −6.448388 |
| Rank gather | `NGIGBSEMHFSJCEOBSPXEIXTHEANGCECIAXMRLEOEOTHDTHIDIUEAMWUMHIDWSUXAEEOEFEABTHEOBCAEGMCEGFBPIAOEASS` | −6.397576 |

The p57 76-rune round-trip positive control passes (p57 score −2.254053), but neither p55 orientation resembles plaintext. Reproducer: [`sims/lp2_p55_dh761_rank_transposition_sft.cjs`](../sims/lp2_p55_dh761_rank_transposition_sft.cjs), [CI run 43428160100](https://github.com/FlareZ123/liber-primus/actions/runs/43428160100).

**Decision:** this closes the obvious rank-order transposition consumer of the source-authenticated DH 76-cycle. It does not establish that the 76-cycle was intended as a key, and does not justify arbitrary remappings of the orbit or offsets. The already-tested direct additive residue stream also remains negative.

## Cryptanalytic decision

**Close the tested 2013 wrapper channels: neither the complete ID3 frame set nor the MPEG frame/container boundaries contain an additional source-attested instruction or missing key field beyond the known Parable, title and artist.** The exact TXXX description number `1,595,277,641` and two literal `\n` separators can be reused directly if a future source-selected key derivation demands byte-exact metadata. They do not themselves select a GP29 operator, page index, or original LP2 decryption. The independently observed 6,397-frame standard MPEG envelope has no appended payload; no source-selected second waveform or spectral decoder has emerged. Preserve the earlier signal and pad studies as bounded negatives. The obvious 76-cycle rank transposition is now also negative; require an actual original clue before testing any different DH consumer.
