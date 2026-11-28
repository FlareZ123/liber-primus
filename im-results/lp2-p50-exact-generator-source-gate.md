# Original LP2 32×8 table: exact source-generator check

**Current decision, 28 November 2026.** Bounded negatives across #1367/#2029/#2985 and the radix-invariant historical eSTREAM source-identity gate #3313. No source-authored generator, original unknown plaintext, recovered key, decoder, or destination. The literal GnuPG 1.4.11 persistent seed-file hypothesis is additionally excluded by its 600-byte native input contract.

## Why this is a possible plaintext route

The physical pp49–51 table contains 256 two-character tokens in a 32×8 rectangle. Its conventional row-major base60 byte reading is pinned by SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**, begins **cbe7a7ba61ed7eb75cf99cdef704b7d4**, and uses 161 distinct byte values. The duplicate bytes rule out a direct complete 256-byte permutation S-box. Identifying a historically published complete 256-byte sequence could reveal a source-authored cipher or key schedule; the strongest competing explanation is a bespoke unknown-purpose table.

## Radix-invariant complete 256-token fingerprint against dated eSTREAM Salsa20 vectors (#3313, Agent20, 28 November 2026)

**Source-typed candidate, not an LP2 decipherment:** original p49–51 presents 256 tokens in 32×8 physical row order. Base59 or base60 gives different numerical bytes but the exact same 256-position *equality partition* (161 distinct symbols, 127 unordered equal-index pairs). A published full-object cipher output could in principle identify itself by this collision graph even if the radix and byte mapping remain unknown. This tests the **eSTREAM Salsa20/20 encryption-function vectors** (a 2005–2008 period-available reference class) without fitting a byte key, IV, decoder, offset, nonce, word boundary, or radix to LP2.

The original eSTREAM-verified test cases were preserved as converted MIT-licensed JSON by [oxarbitrage/salsa20-ecrypt-vectors-converter](https://github.com/oxarbitrage/salsa20-ecrypt-vectors-converter). The 89 128-bit-key and 103 256-bit-key published cases have each a specified literal key, IV and four independently specified 64-byte expected-stream fragments. Their complete 192 cases are copied unchanged in [128-bit source](../resources/external/salsa20-estream-vectors-128.json) and [256-bit source](../resources/external/salsa20-estream-vectors-256.json). The standalone [Node22 SFT](../sims/lp2_p50_estream_salsa20_fingerprint_sft.cjs) implements standard Salsa20/20 with 20 rounds, independently validates **768/768 original published known-answer 64-byte blocks** (including late blocks at byte131,008), then generates the **first uninterrupted 256 native keystream bytes** for each of 192 source keys. It compares every candidate's entire canonical first-occurrence label signature against both the physical row-major source and the independently ornament-selected per-row horizontal reflection. No byte-to-byte comparisons are used for the decision. It also verifies **192/192 planted bijective relabelings** preserve the complete signature, a direct positive calibration for an unknown radix/byte labeling.

**Result:** **0 / 192 original row-major exact signatures, 0 / 192 reflected exact signatures.** On the row-major original, even the *closest* published native 256-byte stream (128-bit Set1vector117) overlaps only **3 of 127** exact original equal-index pairs, despite full-source candidates having comparable 256-position collision counts. The candidate's byte strings are permitted to be relabeled arbitrarily (any injective renaming of symbols) without changing this result: the entire original repeat graph is different. This rejects **only these 192 fixed, historically documented native Salsa20 test streams under those two source-selected read orders** as the complete panel's source identity. It does not exclude arbitrary Salsa keys, a shifted stream, a different generator, a designed private key table, or use of p50 as something other than a generated stream; absent an independently provided key or receiver, those are not justified continuations.

**Why it cannot fix radix or a key by itself:** A label-free equality graph reveals which token positions repeat, but no actual byte value; arbitrary injective relabelings leave it unchanged. Both proposed radix alphabets induce such bijections on these **observed** tokens, so even a full equality graph is insufficient to choose base59 versus base60. A positive historical identity would need a distinct documented output type and an untouched-table prediction; this eSTREAM class supplies neither. The original 256-token object remains an unknown-purpose source artifact, not recovered ciphertext plaintext.

## Source-limited exact comparison

The [original-table standalone test](../sims/lp2_p50_known_generator_match_sft.cjs) compares all 256 ordered bytes against both original and reversed readings of **21 complete pre-2014 streams**, 42 exact equality tests:

- 64 SHA-256 cube-root round constants, both byte orders within 32-bit words;
- 64 MD5 sine round constants, both byte orders;
- complete AES and inverse AES 256-byte S-boxes;
- standard RC4 keystreams from the literal strings **3301, 33011033, PATIENCEISAVIRTUE, FIRFUMFERENFE, DIVINITY**, with drop 0/256/3072.

The test asserts the source digest, published SHA-256/MD5/AES prefixes and a full 256/256 standard-table positive. It runs on Node 22 with no packages or external calls. It does not fit a cipher to English or alter original numbers.

**Result: 0/42 exact 256-byte matches.** The highest accidental same-position agreement is **4/256**, obtained by reversed RC4 on PATIENCEISAVIRTUE after drop3072, with no matching prefix. This count carries no key inference. An auxiliary local full-order screen of π, e, √2, √3, φ, ln2 fractional-byte sequences and historical-integer MT19937 seeds also failed exact equality; those are narrower implementation-sensitive checks, not a universal exclusion.


## Additional 2013-source RAND generator exclusion (Agent7, 18 November 2026)

The **PGP-authenticated 26 January 2013 TCP challenge** specifies a `RAND [n]` command returning integers in 0–255. This is a historically documented *participant-operated server interface*: the original source does **not** make Cicada's author choose its random seed or claim that the later p50 tokens were generated through this command. As an inexpensive and completely frozen creator-era countermodel, I tested whether the first four original table tokens `3N 3p 2l 36` (conditional full-alphanumeric base60 bytes **203, 231, 167, 186**) could come from a Unix-epoch-seeded C `rand()` instance whose output is reduced to one byte. An exact prefix is a necessary condition for reproducing all 256 ordered source tokens; it is independent of any proposed LP2 decipherment.

The full inclusive UTC seed interval **2013-01-01 00:00:00 through 2014-05-31 23:59:59** contains **44,582,400** integer seconds. For each seed, the algorithm emits the first four draws in native generator order, without reordering, salt, warmup or fitted offset. Two first-byte reductions were frozen for each implementation: the least-significant eight output bits, and the most-significant eight available bits. The source-specific, independently reproducible test is [the standalone C++17 SFT](../sims/lp2_p50_epoch_rand_source_gate_sft.cpp); its MSVC recurrence uses `state=214013*state+2531011 (mod 2^32)`, returning bits 16–30, while its GNU-libc mode uses actual `srand/rand` on a GNU-libc host. The MSVC branch is platform-independent and runs under Windows or Linux; the GNU-libc branch runs only with that library. Full 2013 and January–May 2014 native GNU-libc sweeps were also independently executed locally.

| Frozen generator and one-byte readout | 2-byte-prefix seeds | 3-byte-prefix seeds | 4-byte-prefix seeds |
| --- | ---: | ---: | ---: |
| GNU-libc `rand()`, low eight bits | 694 | 3 | **0** |
| GNU-libc `rand()`, highest eight bits | 702 | 1 | **0** |
| MSVC 15-bit `rand()`, low eight bits | 695 | 2 | **0** |
| MSVC 15-bit `rand()`, highest eight bits | 678 | 2 | **0** |

**Decision:** neither of these two *specific* dated C generators directly produces the unmodified original table under either source-frozen eight-bit reduction. This is a **bounded negative**, not evidence that the table was generated by another PRNG, that `RAND` was an LP2 opcode, or that a timestamp source actually exists. Random 2013 participant responses do not authenticate Cicada's p50 table key. Do not widen the seed/PRNG menu absent an original selector; the independent table-generator and actual cipher-consumer inputs remain missing.

## Exact sequence freeze and pre-May-2014 source-provenance gate (#2029, Agent7, 21 November 2026)

### Frozen source input and hashes

The target is the original 256 printed two-character tokens across LP2 pp49–51, in physical row-major order: 10 rows on p49, 13 on p50, and 9 on p51. This freezes the token sequence without presuming that the tokens are bytes or that base60 was author-selected.

The three original scans in resources/liber-primus are the exact same Git blobs as the uploaded JPEGs. Their file SHA-256 values and repository Git blob IDs are:

| Original scan | Bytes | SHA-256 | Git blob SHA-1 |
| --- | ---: | --- | --- |
| 66.jpg (p49) | 651,504 | aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335 | c5243ea1324cf3b72b79a41366f8d0e434ce3978 |
| 67.jpg (p50) | 581,983 | bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776 | f5abe00085811319f5183c2468ea1171d9dbfb82 |
| 68.jpg (p51) | 661,727 | 2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b | 701e47789abf4401d61420ff938c2b72aa03ad2c |

The canonical derived transcription is resources/liber-primus/base60-grid.json (Git blob SHA-1 4698c0806e6bab06a39cfbc3c3283b862de58b35), whose row counts are [10,13,9]. I visually compared all 32 printed rows with the three original scans; the token case and leading zeroes in that transcription agree with the images.

For the radix-independent normalized sequence hash, serialize each page as a label [page N], followed by its rows, with exactly eight tokens per row, one ASCII space between tokens, LF line endings, one blank line between page blocks, and one final LF. The SHA-256 is **719de138b5ca661c45a98920b1bf78293d3bb0016ec52e049fac6189d6f6df15**. The concatenated 512-character token stream without separators hashes to **fb518a448f34323e91f84110e98b8cbe80a2d90ec7e9949cb8dc1e6ca42961a0**. Under the separate, conditional full-alphanumeric base60 interpretation, the decoded 256-byte stream hashes to **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Only the first two hashes identify the printed token sequence without a radix assumption.

A reproducible hash calculation from the checked-in JSON is:

~~~python
import hashlib, json
from pathlib import Path

d = json.loads(Path("resources/liber-primus/base60-grid.json").read_text())
counts = d["page_row_counts"]
offset = 0
blocks = []
for page, count in zip((49, 50, 51), counts):
    rows = [" ".join(row) for row in d["rows"][offset:offset + count]]
    blocks.append(f"[page {page}]\\n" + "\\n".join(rows))
    offset += count
normalized = "\\n\\n".join(blocks) + "\\n"
assert offset == 32 and sum(counts) * 8 == 256
print(hashlib.sha256(normalized.encode("ascii")).hexdigest())
~~~

### Historical source and generator search

The strongest early digital transcription located is in micheloosterhof/cicada-2014. The repository itself was created on 10 January 2014, but that date does not date its Liber Primus table files: the first commit adding 49.txt, 50.txt and 51.txt is **19d68fbb9cff1c06d52cc0add30285199c936282**, 11 May 2014 20:41:01 UTC. It is after the requested pre-May cutoff and is a participant transcription, not a source-authored generator.

That initial transcription differs from the original scans at **10 of 256 cells**:

| Flat index (zero-based) | Page,row,column | 11 May transcription | Original scan |
| ---: | --- | --- | --- |
| 25 | 49,4,2 | 3i | 3I |
| 45 | 49,6,6 | 1L | 1l |
| 50 | 49,7,3 | 0L | 0l |
| 165 | 50,11,6 | 0l | 0I |
| 170 | 50,12,3 | 3E | 4E |
| 172 | 50,12,5 | 2s | 2S |
| 175 | 50,12,8 | 0i | 0I |
| 182 | 50,13,7 | 2L | 2l |
| 199 | 51,2,8 | 0L | 0l |
| 246 | 51,8,7 | 3i | 3I |

The later commit **a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462**, 11 May 2014 21:39:09 UTC, adds decimal.txt (256 decimal values), decimaltobyte.pm, and sexagesimal.bin. The script is only pack 'C', $_ over the decimal list. Comparing those 256 decimal values with the conditional base60 decoding of the original image tokens gives the same ten mismatching cells. Thus sexagesimal.bin is a post-publication participant derivative of the already-transcribed table, not an independent 256-byte source and not an implementation that generated the printed sequence. Its date and dependency direction disqualify it as a pre-May source.

Public exact-string searches for the full 512-character stream and quoted distinctive rows surfaced the 11 May participant files, later copies in scream314/cicada3301 (repository created 24 January 2018) and its 2026 fork kyus2001/cicada3301-Liber-Primus, and current analysis mirrors. They did not surface a dated pre-May-2014 primary source. The present resources/liber-primus/base60-grid.json cites that later fork as a transcription source; it is a useful derived reference, not contemporaneous provenance.

The preserved first-party/period corpus was checked in the representations that can directly contain the sequence: the 2014 Stage11 signed message and index HTML/manifest; the 2013 OS wisdom-folly base64 objects (including decoded bytes); the 2013 second-onion ICMP-echo hex object; the 2014 Onion2 170-byte and 201-byte page streams; and the pinned 256-byte Onion2 hex object. None contains the exact printed token stream or, under the explicitly conditional base60 decoding, the exact 256-byte sequence. The Stage11 signed message supplies a greeting and onion address; the index supplies a title, a div identifier and sequential image references, not a table legend, byte serialization or generator.

The authenticated 2013 prime_echo.sh/cicada.sh material is a fixed prime display, not a 256-value table generator. The signed 2013 TCP challenge's RAND command is a participant-operated server interface and supplies neither a Cicada-selected seed nor a source link to LP2. The specific dated GNU-libc/MSVC epoch-seeded candidates are already excluded above; do not expand the PRNG menu without a source-authored selector. The separate 2014 Onion2 source audit (#1908) likewise found no authored operation linking its 256-byte object or timing data to p50/LP2.

**Source-provenance result:** no pre-May-2014 source, exact deterministic generator, source-authored interpretation, or held-out LP2 prediction was found. The positive-looking exact digital copies are downstream transcriptions, and the only early table/byte conversion found is dated 11 May and contains ten cell errors. This is a bounded negative over the named preserved corpus and public indexed source repositories, not a proof that no lost historical source exists.

## Complete unknown-seed C-generator inversion (Agent23, 22 November 2026)

The preceding timestamp test covered only 44,582,400 epoch seeds. Its distinct open assumption was that the printed 256-byte table might originate from the same two period-available C generators under an *unconstrained* internal seed. The complete original conditional-base60 256 bytes were now tested against **every** MSVCRT \`rand()\` output-relevant internal state and an all-state necessary recurrence for GNU-libc \`random()\`/\`rand()\`, across six frozen geometric readings: printed, reverse, column-major, reverse column-major, alternating-row snake and reverse snake.

For standard MSVCRT \`rand()\`, \`state=214013×state+2531011 mod2³²\`, with returned bits16–30. In each of the two historically plausible byte reductions (low 8 returned bits or high 8 returned bits), knowing the first byte fixes eight internal state bits, leaving exactly **2²³** possible lower31-bit state classes. Exhaustively try all 8,388,608; bit31 cannot affect the next 15-bit outputs. Every complete 256-byte source reading has **zero** survivors under either byte lane. For the printed natural order, the first three bytes leave 128 (low) and126 (high) candidate classes, but later untouched bytes eliminate all. No date-bound or human-fitted seed is used.

For standard GNU-libc additive \`random()\`, all seed and warmup choices obey \`x[i]=x[i−3]+x[i−31] mod2³²\`, with output \`x[i]>>1\`. Thus, if source cells were the low byte of each output, every one of 225 original lagged residuals \`b[i]−b[i−3]−b[i−31] mod256\` must belong to **{0,1}**. Only **4/225** natural-order residuals do; the six source-frozen readings have **[4,2,2,5,3,1]** valid residuals respectively. The constraint is seed-independent. Separate true-generator synthetic streams recover the hidden MSVCRT state and satisfy **225/225** additive recurrences. Read-only, original-hash-asserting [Node22 CJS reproducer](../sims/lp2_p50_allstate_msvcrt_glibc_sft.cjs).

**Decision:** These are complete exclusions for the specified standard C runtime algorithms, two byte reductions and six named orderings, even granting unknown non-time-based seeds and arbitrary initial clock. The signed 2013 \`RAND\` command specifies participant-server random output rather than an LP2 source, so the negatives cannot prove Cicada chose either algorithm or exclude other generators, a hidden KDF, staged encryption or a non-byte interpretation. They recover **no** original LP2 plaintext or key. The absence of an original authored table generator and consumer remains the decisive external dependency; further PRNG catalog expansion is unjustified.


## Period-authentic GnuPG seed-input contract (Director #2985, Agent17, 26 November 2026)

The new question is whether the table is itself a literal seed/state input for a historically evidenced primitive. Cicada's signed messages carry GnuPG 1.4.11 armor (also reported in [Dukotah Round18](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round18/SYNTHESIS.md)); this documents the tool version, not its use for LP2. The exact period implementation was inspected at [GnuPG 1.4.11, tag commit 05febd5860f3a1d2f5d4916f3a88087c0d591bee, cipher/random.c](https://github.com/gpg/gnupg/blob/05febd5860f3a1d2f5d4916f3a88087c0d591bee/cipher/random.c#L487-L519) (annotated release tag dated 18 October 2010). Its native random_seed loader requires a regular file of exactly POOLBLOCKS × DIGESTLEN = 30 × 20 = **600 bytes**; another nonzero size fails before data absorption. Even a valid file is combined with process ID, time, process clock and a fresh entropy-source request; it is not a self-contained deterministic stream key.

Direct evaluation of the size predicate extracted from the pinned source and the original-image-adjudicated [grid JSON](../resources/liber-primus/lp2-grid-256.json) gave:

| Candidate serialization | Bytes | Accepted by native size predicate |
| --- | ---: | --- |
| Conditional base60, one unsigned byte/cell | 256 | No |
| Conditional drop-f base59, one unsigned byte/cell | 256 | No |
| Literal two-character tokens, no separators | 512 | No |
| Physical rows, single spaces between tokens and LF after each row | 768 | No |
| Boundary controls | 599 / 600 / 601 | No / yes / no |

Reproduce by taking the length of the concatenated tokens, or counting one byte per cell; the row text has 32 × (16 token characters + 7 spaces + 1 LF) bytes. Compare to the source's exact size condition. The predicate was evaluated in V8, not by running a native GnuPG executable. The length result is independent of token order or rune scores. No source selects padding to 600 bytes or deterministic replacement of extra entropy inputs. A passphrase, arbitrary input to a separate KDF, or incomplete entropy pool remains mathematically possible but lacks an authored receiver.

The other authentic operations have bounded decisions: #211/#773 establish participant-generated RAND; #2313 establishes exact historical XOR but no LP2 byte selector; #2123 establishes the original MP3/OpenPuff and square-upload receiver; #2350 finds no first-party consumer for the three early 2014 256-byte objects; #449/#2527 reject the exact authenticated RSA key/signature length premises; #2576 establishes that the immediate table framing does not label a typed receiver. #995/#2506 establish the missing PRNG/KDF/GP29 handoff. None supplies the primitive, table initialization and named unknown rune receiver simultaneously. Reopen only on a new authored instruction or a complete independently selected reversible operation. No new plaintext or key.

## Decision

The complete original table is not one of the **42 frozen published constants or literal-seed generator outputs**. The additional #2029 exact-sequence gate found no pre-May-2014 source or generator in the named preserved corpus or public indexed repositories; the only located 2014 text/byte conversion is dated 11 May, is downstream of a participant transcription, and differs from the original images at ten cells. The exact printed sequence is now pinned by the row/page-preserving hash above. This remains a bounded negative, not a universal exclusion of lost archives, secret-seeded streams, other generators, or the base59 branch.

**Missing necessary input:** a period-available source or exact generator that selects *all 256 cells in their printed order*, and a source-authored operation connecting it to a named ciphertext interval. Only then can a p50-origin key or decoder be meaningfully tested against a blind chapter. Close #1367, #2029 and #2985 at that dependency instead of extending arbitrary cipher menus. All 56 unknown LP2 pages remain unsolved.
