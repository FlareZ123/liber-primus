# p0 opening-phrase BASE29 / historical DH23 exchange candidate

**Status: intermediate hypothesis; no LP2 plaintext recovered.** This is a source-constrained key derivation worth retaining, not an established cipher solution.

**Corrected original-image adjudication (16 November 2026):** Original p0 has **two RED heading words**, GP lengths **8 and 5**, with a SMALL red ordinary word dot between them, and then the LARGE RED thirteen-dot title marker **after all thirteen red runes at offset13**. The first black body rune is `TH` at offset13. The earlier same-day claim of red8/marker8/black5 was an [incorrect original-image interpretation and is retracted](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md). The historical derived red13 and marker13 metadata were correct. All arithmetic using the first thirteen original GP rune values is unchanged.

## Proposed human-visible route

The original p0 JPEG (\`resources/liber-primus/17.jpg\`) visibly presents an 8-rune RED heading word, a small RED word dot, a 5-rune RED heading word, and then the LARGE RED 13-dot title mark; the next seven BLACK body runes follow that large mark. The page also has two marginal stave-like marks, although these have a competing branch-rune interpretation and are not treated as independent DH evidence.

The authenticated 2013 TCP-server challenge (\`resources/external/2013-tcp-server-signed-source.md\`) documents BASE29 conversion and a Diffie–Hellman protocol with prime \`p=23\`, server base \`g=5\`, server-selected exponent, and client-supplied public share. That makes the following reading plausible without inventing a group:

1. Read the first 13-rune opening phrase before the large title marker (two red words of lengths 8+5, separated only by the ordinary red word dot) as one big-endian BASE29 integer:
   \`N = 5412445423142629857\`.
2. Use the source-defined group order \`p−1=22\` to reduce the server exponent:
   \`a = N mod 22 = 7\`.
3. The final BASE29 digit of the heading is \`5\`, matching the historical server base.
4. Read the next seven black GP digits after the large red title mark as another big-endian BASE29 integer:
   \`M = 1420123033\`.
5. Reduce that value modulo the historical prime to obtain a candidate client public share:
   \`B = M mod 23 = 16\`.
6. The resulting exchange is:
   - server public value: \`A = 5^7 mod 23 = 17\`
   - client public value: \`B = 16\`
   - shared secret: \`K = 16^7 mod 23 = 18\`

The exponent 7 also equals the length of this following seven-rune black segment. The client public value has discrete logarithm 8 in the base-5 group, so the two exchange exponents are 7 and 8. The heading additionally satisfies \`N mod 23 = 0\`, although that is not required by the DH computation.

## Controls and limits

- The canonical p0 rune sequence and physical-ink override support the exact inputs above: red8, small red ordinary dot, red5, large marker at offset13, then the seven-rune black body opening. The 13-rune BASE29 operand is **entirely red**.
- The earlier p15/p33 red-span comparisons remain matched as colour-class controls only to the extent that they compare original **red** opening phrases; this red13 correction restores p0 to the red-heading class, but those postselected comparisons do not authenticate the DH selector. The independent all-page scan of every 13-rune window still finds only p0 offset0 under the fixed conjunction below, but that postselected conjunction is a finite coincidence screen, not an author instruction:
- A page-local scan of every 13-rune window on LP2 pages 0–55 finds only the p0 heading satisfying the fixed conjunction \`N mod 23 = 0\`, \`N mod 22 = 7\`, and final digit 5. This is a finite control, not a statistical proof; the scan covers many overlapping windows.
- The following seven-rune post-marker black-body segment's residue 16 is a valid nonzero DH public share, but almost any nonzero residue would be valid when the base is primitive. Its value alone is not a strong discriminator.
- The historical source establishes the protocol and parameters, not that LP2 reuses it or that this exact mapping of the red opening title and following black segment to server exponent/client share was intended.
- The two marginal staves may instead be branch-rune material. Do not count them as confirmed DH-party symbols.
- Direct GP29 Caesar use of shared secret 18 and the simple affine test using the derived pair do not produce readable p0 text.
- A frozen attempt to continue the existing 27×27 opening model also fails: treating \`(18,7)\` as row18/column7 selects node \`Y-X-D\`; the same center-totient rule gives \`Y-G-D\`; reusing the opening's +13 center-to-block displacement predicts block start 478. The seven ciphertext runes \`N-P-A-Y-P-C-Y\` decrypt to \`EO-W-U-F-W-J-F\`, not plaintext. No alternate starts, axes, phases, or signs were searched afterward.


## Primitive-root power stream from DH secret 18 (negative)

Because the conditional exchange yields (K=18) and (18) has multiplicative order 28 modulo 29, the least-assumption periodic continuation is to use the powers (K_i=18^i mod 29) as a GP29 additive key. The only two natural seed conventions are exponent zero (first shift 1) and exponent one (first shift 18). Apply both (C-K_i) and (C+K_i) to the 242-rune p0 body beginning at canonical offset 20; no fitted phase or alternate key is used.

| First key shift | Operation | No-skip body IoC | First impossible F-transparent inverse |
|---:|---|---:|---|
| 1 ((18^0)) | (C-K_i) | 0.03425808 | p0 offset 57: ciphertext IA (27), clock 9, key 27 forces plaintext F |
| 1 ((18^0)) | (C+K_i) | 0.03343507 | p0 offset 31: ciphertext I (10), clock 11, key 19 forces plaintext F |
| 18 ((18^1)) | (C-K_i) | 0.03518398 | p0 offset 26: ciphertext B (17), clock 6, key 17 forces plaintext F |
| 18 ((18^1)) | (C+K_i) | 0.03466959 | p0 offset 32: ciphertext NG (21), clock 12, key 8 forces plaintext F |

The authentic p56 plaintext-F rule was tested as a state-only exact inverse: at a ciphertext F, every state may either bypass without advancing or consume a key symbol if the resulting plaintext is non-F; at a non-F ciphertext, the key must be consumed and may not produce plaintext F. All four candidates lose every possible clock at the stated position, with a single clock state remaining immediately before failure. Thus this is a structural contradiction, not merely a poor language score. The no-skip outputs also remain near the random GP29 IoC baseline; the raw p0 body is 0.03429238.

A 242-rune full-alphabet synthetic plant containing eight literal Fs was encoded and recovered exactly under all four phase/sign variants, and the same branch-state gate retained a legal path for each plant. This validates the skip-state implementation. The test rejects only the simple period-28 additive power stream derived from the candidate DH secret; it does not invalidate the DH arithmetic or specify what other symmetric operation, if any, the secret should drive. The exact reproducer is the existing [p0 DH23 source SFT](../sims/p0_dh23_red_heading_candidate.cjs).


## Direct p56 prime-totient transfer with exact F bypass (negative)

The existing no-skip transfer tests use the DH-derived starts 18 and 19. The solved p56 cipher has a transparent plaintext-F rule: a literal F remains ciphertext F and does not consume a prime. I tested that exact inverse rather than treating all 242 body positions as clock-consuming. The body contains 12 ciphertext Fs, so the inverse must retain every possible bypass/consume branch.

The only starts tested were source-selected: **1** and **2** (the solved p56 prime-2 start, with or without its historical fake-F offset), **5** (DH base), **7** (DH exponent), **13** (red-heading/marker length), **18** (candidate shared secret), **19** (adjacent one-based/zero-based convention), **23** (DH modulus), and **29** (GP alphabet size). Both (C-(p_i-1)) and (C+(p_i-1)) were tested. A state-only DP allows a ciphertext F either to bypass without advancing or to consume a prime if it decodes to non-F; a non-F ciphertext must consume a prime and may not decode to plaintext F.

| Prime start | First prime | (C-(p_i-1)): first forced F | (C+(p_i-1)): first forced F |
|---:|---:|---|---|
| 1 | 2 | p0 offset 80: NG; prime 61 (ordinal 61), shift 21 | p0 offset 41: N; prime 79 (ordinal 22), shift 20 |
| 2 | 3 | p0 offset 80: NG; prime 283 (ordinal 61), shift 21 | p0 offset 96: A; prime 383 (ordinal 76), shift 5 |
| 5 | 11 | p0 offset 53: B; prime 163 (ordinal 38), shift 17 | p0 offset 30: EO; prime 47 (ordinal 15), shift 17 |
| 7 | 17 | p0 offset 25: W; prime 37 (ordinal 12), shift 7 | p0 offset 32: NG; prime 67 (ordinal 19), shift 8 |
| 13 | 41 | p0 offset 60: G; prime 239 (ordinal 52), shift 6 | p0 offset 28: S; prime 73 (ordinal 21), shift 14 |
| 18 | 61 | p0 offset 40: B; prime 163 (ordinal 38), shift 17 | p0 offset 54: D; prime 239 (ordinal 52), shift 6 |
| 19 | 67 | p0 offset 28: S; prime 103 (ordinal 27), shift 15 | p0 offset 23: N; prime 79 (ordinal 22), shift 20 |
| 23 | 83 | p0 offset 235: H; prime 1459 (ordinal 232), shift 8 | p0 offset 50: NG; prime 241 (ordinal 53), shift 8 |
| 29 | 109 | p0 offset 86: X; prime 479 (ordinal 92), shift 14 | p0 offset 25: W; prime 139 (ordinal 34), shift 22 |

Every one of the 18 candidates loses all possible clock states at its first listed position; each has a single state immediately before the forced-F contradiction. The no-skip IoCs range from **0.033058 to 0.036350**, against raw p0-body IoC **0.034292**. This is a structural rejection of the tested direct p56 prime-totient transfers, not a language-score judgment.

A 242-rune full-alphabet synthetic plant with eight literal Fs was encoded and recovered exactly under all 18 start/sign variants; the same branch-state gate retained a legal path in every case. This validates the bypass-state implementation. The result does not reject the provisional DH arithmetic or other source-selected symmetric mechanisms.

## Conditional 2016 word-map cross-check

If the DH outputs are read as page 18, word 7, the canonical printed-word parser used by \`sims/lp2_2016_message_base58_word_map.cjs\` selects \`GAHEALGO\`. It has seven GP runes with prime weights \`[17,97,23,109,73,17,7]\`, summing to \`343 = 7^3\`. It is the only seven-rune word with prime sum 343 among the 2,973 printed words; five words of all lengths have that sum. Its first and last prime weights (17 and 7) match the candidate DH public value and exponent.

This is an interesting conditional consistency, not a plaintext recovery: neither source explicitly says to interpret the DH pair as a page/word coordinate. Applying the provisional 2016 base-58 word-pointer rule to 343 gives p53:w6 (\`DOEER\`), then p18:w5 (\`IDJ\`); the deterministic walk enters a 33-cycle and does not reach solved p56/p57.

## Conditional GAHEALGO prime-weight Vigenère key (negative)

The conditional p18:w7 address above selects `GAHEALGO`, whose GP-prime weights are `[17,97,23,109,73,17,7]`. Since the 2016 signed message says that words' numbers supply direction, a bounded next test treated those seven prime weights as a repeating numeric key for the p0 body. The body tested here begins at canonical offset20 (after the thirteen red heading runes and first seven black body runes after the large mark) and contains 242 runes.

Four fixed phase-zero models were tested: direct prime weights modulo 29 and `φ(prime)=prime−1` modulo 29, each with both additive signs. No phase, offset, key permutation, or further key transformation was searched.

| Fixed key mapping | Sign | Key modulo 29 | GP trigram nats/rune | IoC |
|---|---:|---|---:|---:|
| prime weight | − | `[17,10,23,22,15,17,7]` | −11.65467 | 0.034567 |
| prime weight | + | `[17,10,23,22,15,17,7]` | −11.70195 | 0.035767 |
| φ(prime weight) | − | `[16,9,22,21,14,16,6]` | −11.86494 | 0.034567 |
| φ(prime weight) | + | `[16,9,22,21,14,16,6]` | −12.06681 | 0.035767 |

The raw p0 body scores −12.00701 nats/rune (IoC 0.034292). Across 8,982 native Gibran windows of the same 242-rune length, the minimum score is −8.62957, the 10th percentile −8.20543, and the median −7.98626. None of the four candidates approaches even the least English-like native window. All four ciphertext round trips and all four synthetic positive plants recover exactly; this validates the implementation, not the hypothesis.

**Decision:** reject only the direct repeating-key consumers “p18:w7 prime weights” and “p18:w7 φ(prime weights)” on the p0 body. The p18:w7 observation remains a conditional address consistency, not a demonstrated key derivation. Do not try other encodings of this word without a new original-source selector. Reproduce with `node sims/p0_dh23_gahealgo_prime_key_sft.cjs`.

## Conditional p32 11×11 map as a two-cycle p0 key (negative)

The p32 page is a source-visible 11×11 map containing **121 runes**; the p0 body after its thirteen-rune red opening title and seven-rune black body opening contains **242 runes**, exactly two 121-rune periods. In light of the signed 2016 instruction that Liber Primus's words are a map, this motivated one bounded test of the p32 grid as a repeated key. This is an exploratory map-as-key interpretation, not an authenticated instruction to use Vigenère.

The fixed reading is p32 row-major/page order, repeated exactly twice over p0 body offsets 20–261. The two native numeric encodings are GP indices and GP prime weights; each is tested with both additive signs modulo 29. No rotation, reversal, phase, or alternative traversal is searched.

| Fixed key encoding | Operation | GP trigram nats/rune | IoC | First 121-rune block | Second 121-rune block |
|---|---|---:|---:|---:|---:|
| GP index | `C−K` | −11.86070 | 0.033607 | −11.67758 | −12.03269 |
| GP index | `C+K` | −11.92079 | 0.036419 | −12.10929 | −11.72217 |
| GP prime weight | `C−K` | −11.78742 | 0.034532 | −11.77805 | −11.78443 |
| GP prime weight | `C+K` | −11.97503 | 0.034875 | −11.95202 | −11.98884 |

The raw 242-rune p0 body scores −12.00701 nats/rune (IoC 0.034292). Across 8,982 native Gibran windows of the same length, the minimum is −8.62957, the 10th percentile −8.20543, and the median −7.98626. All four outputs remain far outside the native range. Every original-input inverse and every synthetic positive plant recovers exactly.

**Decision:** retire only the row-major p32-map repeating-key interpretation under these two encodings and two signs. The 121/242 length relation is exact, but it does not authenticate the map as a key or select additive Vigenère. Do not expand to alternate map traversals or key transformations without a further original-source selector. [Reproducer](../sims/p32_grid_121_repeat_key_on_p0_sft.cjs).

## Conditional transfer of the solved p56 prime-totient clock (negative)

The p0 DH reading gives candidate shared secret K=18, but does not specify the symmetric operation. A cheap, source-motivated transfer test was therefore made against the already solved p56 mechanism: subtract φ(p_i)=p_i-1 mod 29 from each GP29 symbol, using 18 as the one-based starting prime ordinal. The thirteen-rune red heading and next seven black body runes are the proposed DH inputs, so the p0 ciphertext body begins at canonical offset 20 and contains 242 runes. The p56-only literal-F skip at offset 56 was not imported into p0.

Two natural index conventions were frozen:

| Interpretation of DH secret 18 | First prime | First shift | p0-body IoC |
|---|---:|---:|---:|
| one-based prime ordinal 18 | p18=61 | 2 | 0.0335722369 |
| zero-based offset 18 (ordinal 19) | p19=67 | 8 | 0.0356983643 |

The raw p0 body IoC is **0.0342923768**. Both outputs round-trip exactly under their stated inverse, but neither is readable; the one-based output begins UUMAIAEOTSTHWOEEAELACPWYYFBFNJOEDEWBTHOEBBCFOEAWY..., and the adjacent convention begins AYBEDGHJFOLXJTEOOCLLAEJDWULMTACIAUXJSADYOECLIDJ.... As controls, the solved p56 plaintext under its exact literal-F skip has IoC **0.0700280112**, and plaintext p57 has IoC **0.0627099664**.

**Decision:** reject only the direct transfer “DH shared secret 18 = starting prime ordinal for the p56 φ(p) clock on p0.” The result does not invalidate the p0 DH arithmetic, nor does it test other source-selected operations using K=18. The historical DH source does not say to reuse p56's prime clock or interpret the shared secret as a prime ordinal; no broader key/PRNG search is justified without a new original clue.

## Direct OutGuess use of K=18 (negative)

The DH arithmetic gives shared secret K=18 and server public value A=17. A plausible one-step human continuation is to use the decimal shared secret as the OutGuess passphrase and A=17 to select original carrier `resources/liber-primus/17.jpg`. This exact candidate was tested once, with no key, phase, or carrier sweep.

The local retrieval implementation is checked against the pinned OutGuess workflow: on original p6 carrier `23.jpg` with password `ATXBMGIASBXEO`, it reproduces the workflow's 29,681-byte artifact exactly (SHA-256 `a2c894e1014e6b572cb60c27348a6be71841f093ea5e716242622423ba878f06`; [run 43022439918](https://github.com/FlareZ123/liber-primus/actions/runs/43022439918)). On p0 `17.jpg` with password `18`, it emits seed 22,352, length 16,260, payload SHA-256 `567d527ecfec0c5a8bce5b423b3b11a64adf35f4660c6ff2eecc67cff5ac70aa`. The payload has no recognized file signature; `file` reports generic data, and `gpg --batch --list-packets` exits 2 with “no valid OpenPGP data found.” Its post-opening entropy is 7.989703 bits/byte and printable fraction 0.382997, matching the high-entropy false-positive profile already established by the synthetic-JPEG and original-image controls.

**Decision:** reject the direct continuation “DH secret 18 is the OutGuess password for image 17.” This is a bounded negative, not proof that p0 contains no other steganographic content, and it does not invalidate the DH arithmetic. Do not search additional passwords, images, or second-layer ciphers without a new source instruction. Reproduce with `python3 sims/outguess_extract.py resources/liber-primus/17.jpg 18 --output /tmp/p0-dh18-outguess.bin`.

## Dot-topology SSH/suffix crosscheck (12 November 2026)

See [the consolidated p0 13-dot visual readout](lp2-p0-red13-dot-topology-readout.md#a-new-cross-route-arithmetic-agreement-dot-readout-starts-ssh-and-its-suffix-matches-dh23-k18). Its frozen original 8|5 dot route reads \`S S H Y E O E G M NG IA F C\`, beginning with the 2014-available network acronym SSH. BASE29 on the remaining ten GP digits yields \`386252824294711\`, with modulo23 residue **18**, exactly equal to the *previously* derived p0 DH shared secret \`16^7 mod23\`. Among eight distinct natural word/row/orientation variants of the dot route, only the natural row-major sequence gives that residue. The untransposed last ten red digits instead give residue14. Original-data and orientation SFT: [p0 crossroute](../sims/lp2_p0_ssh_dh23_crossroute_sft.cjs).

A stricter source-matched control fixes the four raw GP digits mechanically forcing \`SSH\` and terminal base29 digit5, and conditions on the earlier two raw DH congruences. Of five million seeded random 13-rune opening sequences, **9,969** meet both congruences and **435** of those yield dot-suffix residue18, exactly the **1/23 null rate** to sampling accuracy. The visible SSH + modulo23 equality is consequently *not independently selective* after its construction choices; avoid compounding it into a new SSH-host search. The same reproducer generates the control deterministically.

**Classification:** a new *retrospectively observed* source-and-historical-operator agreement, not a solved key, independent prospectively predicted plaintext, a network address, or a decipherment operation. The 2013 signed source does not prescribe the SSH prefix extraction, suffix modulo or reuse of DH at LP2. Direct applications of candidate K18 already failed; do not compound unconstrained operations.


## Reproduction and next decision

Run \`node sims/p0_dh23_red_heading_candidate.cjs\` from the repository root. It reconstructs the BASE29 values, DH exchange, source-window and subgroup controls, conditional word-map observation, and rejected 27×27 continuation from the canonical resources.

**Research decision:** retain this as a candidate source-derived key, but do not promote it to \`results/\`. The tested direct consumers of the provisional DH route have all failed: the direct p56 prime-totient clock on p0 (no-skip starts 18/19 and exact F-transparent starts 1, 2, 5, 7, 13, 18, 19, 23 and 29 in both signs), OutGuess passphrase18 on image17, and the conditional p18:w7 prime-weight/φ-prime-weight repeating keys on p0, and the period-28 additive power stream from K=18 under both natural seed phases and signs (the exact F-transparent clock dies at p0 offsets 57, 31, 26 and 32). Separately, the source-visible 121-rune p32 map repeated twice over the 242-rune p0 body also fails as a direct additive key under GP-index/prime-weight encodings and both signs; the exact 2× length match does not authenticate the map-as-key interpretation. The missing piece remains a different source-selected reversible LP2 operation that consumes shared secret 18, or an independent second DH-encoded passage that validates the mapping. Do not expand into arbitrary PRNGs, coordinate orderings, or cipher families without another original clue.
