# Agent25 research handoff, 23 November 2026

**Present invocation:** actual RNG draw **1**, independent normal research mode. Remotely established immutable identity lease `agents/agent25/.lease.json` has `run_id=agent25-gpt6-draw1-63aa01da0486ba0e` and `claimed_at=2026-11-23T08:59:22.220Z` (commit `d636e8df`). The first lawful normal-research voluntary release is **2026-11-23T10:09:22.220Z UTC**, after live-clock verification at a checkpoint; no lease refresh. Release only this invocation's lease **as the final repo mutation**, after other useful changes have been pushed and verified. Until then continue independent research. No GitHub Issue was claimed (draw1).

**Current research conclusion:** the canonical corpus still has **56 unsolved physical pages p0–55, 12,956 original GP29 runes**; no authenticated additional plaintext, key or historical cipher consumer is recovered by this incarnation. Authoritative status is [results/README](../../results/README.md). No new report here alters that synthesis.

## New research from this incarnation

### Cross-page carries → original 32×8 numeral table

The complete canonical word parser finds exactly **32 whole GP words that cross a physical page boundary**, totaling **209 runes**. The original p49–51 table has **32 printed rows of eight numeral tokens**. This equality suggests (only hypothetically) using each source word as one 64-bit table row or one byte of an AES-256 key; it is not an author-selected route, and natural pagination is a strong rival.

A complete Node22 original-input test exhausts **72 direct SHA-1/256/512 64-bit row interpretations** using exact source GP rune bytes, UTF-8 runes and Latin transliteration, prefix/suffix, row direction and both table radices. There are **0/2,304 exact eight-byte matches** (max four individual bytes over a 32-row comparison). The 32 GP-prime-sum-by-word key `2c314f734b9b3ea5b2a79b7850fcc4829704c17f836c38d0ed8f787605a1c009` yields no readable plaintext in source-locked AES256 ECB/CBC/CTR under base60 or base59 (best **103/256 printable bytes**, essentially random-like). Exact planted SHA rows and AES-CTR recover.

- [Complete bounded source report](../../im-results/lp2-pagecarry32-p50-rowhash-aes-original-gate.md).
- [Windows Node22 read-only reproducer](../../sims/lp2_pagecarry32_p50_hash_aes_source_sft.cjs), [PASS run45148524792](https://github.com/FlareZ123/liber-primus/actions/runs/45148524792).
- Decision: do not expand source-unguided alternative hash/key/byte-mode families. The 32=32 alignment is descriptive, not a solution or source-authored key.

### P15 Fibonacci-prime spiral → page-private Fibonacci autokey

The source grid has **16 authentic spiral values** and the surrounding p15–22 visual chapter has **eight physical rune pages**. A human-simple proposed 8×2 pairing assigns consecutive original spiral numbers modulo29 as one *separately reset IV pair per page* (source pairs `(22,21),(19,17),(11,1),(10,3),(20,22),(25,7),(22,12),(17,21)`). Four native GP29 reversible candidates, plaintext/ciphertext Fibonacci feedback and both additive signs, decode **all 1,903 original pp15–22 runes** with global IoC **0.034403–0.034552** and local page IoCs **0.032800–0.037932**, all nonlinguistic. Each original 1,903/1,903 re-encryption and independent solved-p57 native-GP planted decode succeeds. For one plus-oriented plaintext-feedback equation, all page-private IV pairs (not merely eight source pairs) leave each page tail's IoC invariant algebraically.

- [Bounded original source report](../../im-results/lp2-p15-spiral-eight-pairs-pageprivate-fibonacci-gate.md).
- [Windows Node22 reproducer](../../sims/lp2_p15_spiral_pairperpage_fibonacci_autokey_sft.cjs), [PASS run45149966361](https://github.com/FlareZ123/liber-primus/actions/runs/45149966361).
- Distinct from prior single continuous IV global runs, but does not identify a source-selected decipherment. The first p15 pair would have to operate before its printed grid, weakening human plausibility. Avoid coefficient/phase rescue searches without first-party instruction.

## Abandoned exploratory routes, no separate authoritative claim

- Inspected the original 75-JPEG image archive. The `05.jpg` 360-byte reversed-hex/palindromic 1033 magic-square envelope, `10.jpg` concatenated JPEGs, p32/p55 tree plate and p15 spiral are **already** fully recorded by previous agents. No new JPEG payload asserted.
- The 255-scroll-word→255 corrected p8-rune source alignment, after the existing GF4/radix59 retrospective correction, has four equality-constrained source word pairs. An eight-bit *XOR of GP ordinal bytes* collapses the 255 words to just32 buckets, forcing **≥192/255** original corrected p8 rune errors for any secret stationary lookup. Using **XOR of GP prime weights** gives 105 buckets, minimum **138/255** mismatches; a direct p50-table-index modulo29 map matches **13/255**. This is an independent low-complexity candidate obstruction, not a universal statement about nonlinear/order-sensitive hashing. No code or standalone report committed, so treat as notebook evidence.
- The 32×8 numerical panel's conventional 256 bytes yield no text through literal parity-bit, source-digit-case, high-bit, or second-digit bit-plane row extraction. The full manuscript's complete printed-word lengths max14; interpreting consecutive lengths as base16 nibbles gives nonsense with 74–86% ASCII printability mostly by trivial length distribution. Using two word lengths as an address into the 256-cell original grid also gives no coherent output. These were exploratory, *not source-authored transformations*; do not prolong them.
- The 256 p50 original bytes have eight bit-plane Berlekamp–Massey linear complexities around128–131 for 256 bits, as expected of random-like data. Not a short 32/64-stage raw linear generator, but this does not exclude modern stream ciphers. Direct bitwise adjacent differences, eight-column block SHA256 chains and composite-prime interpretations are already better documented elsewhere.
- The user's high priority is real unknown plaintext and a creator-selected decoder. Avoid conflating well-controlled negative tests or numerical coincidence with success.

## Context to preserve from earlier identity incarnations

Prior Agent25 work includes provisional p23 centered red triple `[23,6,10]` proportional to authenticated 2013 BASE29 H, p39 red3 `[27,5,15]` squared DH relation, p50 quotient252 / mod841 DH carry/ASCII 'IV', source grid `4C` absence→252→180→102→32 speculative pointer, and historical p22/cuneiform source-to-inverse negatives. Main records are [p23/p39 factor bridge](../../im-results/lp2-p23-red-midpoint-p50-factor-bridge.md), [p50 missing4C source pointer](../../im-results/lp2-p50-absent4c-dualradix-p55-page-pointer.md) and [p33 numbered bank](../../im-results/lp2-cuneiform-1033bank-modularstride-553-original-gate.md). These are **conditional clue alignments with missing independent opcode/receiver**, never plaintext. Distinguish previously known source evidence from added links. Avoid retesting same formulas as if novel.

**Earlier complete Agent25 identity state preserved verbatim** in [memory-archive-through-20261123-0859.md](memory-archive-through-20261123-0859.md); earlier original archives [Nov17–19](memory-archive-20261117-through-20261119.md) and [through Nov16](memory-archive-through-20261116.md). Those archives include longer reasoning and research source links; this file is the current consolidated handoff, not a chronological experiment log.
