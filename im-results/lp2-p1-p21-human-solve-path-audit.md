# LP2 p1–p21 human solve-path audit

**Agent4, 19 November 2026 · Director Issue #1891.** Bounded negative: three plausible, historically available clue paths were ranked by the length of the clue-to-operation description, then checked against the original ciphertext using existing exact-source tests. No unknown plaintext, key, or destination was recovered.

## Scope and method

The scope is physical LP2 pages **p1–p21**, original combined scans **18.jpg–38.jpg**. This audit excludes the p0 red13/27×27 families and p7 music/five-dot families, and does not use current p50, DH, or SHED hypotheses as selectors. It asks what a solver in May 2014 could see, obtain, and reasonably try, not which operation gives the best language score after looking at target output.

The ranked order below is based on the shortest source-visible clue → recognizable operation path, not on output quality. Existing original-input reports and their reproducible tests were reused; no broad visual, key, phase, or language-score sweep was started.

## Ranked human-solve-path hypotheses

### 1. p2 mirrored LP1 artwork → reverse the printed lines

**Visible clue.** Original p1 and p2 (scans 18.jpg and 19.jpg) carry repeated staff/cross-like marginal ornaments and small lemniscate-like marks. P2 also contains a segmented arthropod illustration. The same raster artwork appears on solved LP1 p9, horizontally mirrored and repositioned in LP2 p2; the original-crop comparison gives IoU 0.999972. LP1 p9 is headed “An Instruction” and its solved text says “Do four unreasonable things each day.” This cross-round material was available to a 2014 solver. The attribution of the arthropod to Schröter’s 1774 “leggy trilobite” remains unverified against the actual historical plate and is not needed for the mirror hypothesis.

**Smallest operation.** Preserve p2 line order but reverse rune order within each of its nine printed lines. This is the least elaborate operation directly suggested by a horizontally mirrored copy and an earlier solved instruction about doing something unreasonable.

**Original-cipher prediction and result.** The fixed p2 transcription has 201 runes and line lengths [21,24,22,25,23,21,24,22,19]. The exact reverse-each-line output is nonlinguistic. Whole-page reversal and GP29 Atbash are also nonlinguistic. A more elaborate “three parts” reading of the arthropod plus 201=3×67 was not promoted: 24/58 corpus records are divisible by three, the natural three-stanza grouping gives 67/69/65 rather than equal blocks, and the bounded 3×67 Legendre/trit/cube-orientation tests find no coherent output. The image does not identify which runes belong to three parts, which object is reversed, or any key/clock.

**Decision.** The mirrored reuse is a real first-party cross-round visual relation and justifies the cheap line-reversal test; it does not select a working decipherment. The 1774 source attribution and any generic Trifid/three-stream search remain unsupported.

Evidence: [original p2 assessment](lp2-p2-schroeter-trilobite-assessment.md), [historical image-source correction](lp2-p2-schroeter-source-image-comparison.md), [p2 mirror SFT](../sims/lp2_p2_lp1_p9_mirror_sft.py), [solved LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt).

### 2. p3 red119 → Atbash SCY/SKY → the signed 2013 ICMP instruction

**Visible clue.** Original p3 (scan 20.jpg) has an isolated, complete three-rune red word at physical offsets 119–121, bounded by red 13-dot stops. Its GP indices are [13,23,2], transliterated P D TH. The already-solved LP1 Atbash operation maps indices i→28−i, producing [15,5,26] = SCY. The GP transliteration uses C for both ordinary C and K, so SCY can be read as SKY. An OpenPGP-signed 2013 Cicada message tells the reader to “knock on the sky and listen to the sound”; in its historical round this selected an ICMP echo/ping operation and a 28-fragment response. Both the Atbash operation and the signed earlier message were available to a 2014 solver.

**Smallest operation.** Apply the known GP29 Atbash to the red three-rune span, read SCY as SKY under the alphabet’s C/K transliteration, and follow the signed 2013 instruction to ICMP ping. This is the strongest clue-to-action path in the inspected range.

**Original-cipher prediction and result.** The result is a typed historical navigation/protocol action, not a p3 plaintext. The simplest cipher-transfer hypothesis—use SCY as a repeating GP29 Vigenère key on the entire original p3–p7 chapter at phase zero, with the historically attested nonconsuming plaintext-F rule—fails algebraically at chapter offset 20; the first 20 ciphertext symbols contain no F, so no F-skip branch can rescue it. The opposite sign fails at offset 22. The separate p7 red14 handoff under the same key yields zero of five native-English words. Thus the ICMP clue does not authenticate SCY as a chapter key or specify how the 28 response fragments enter the LP2 cipher.

**Decision.** Retain p3 red119→SKY→ICMP as a plausible cross-round navigation callback, not a reversible LP2 chapter decoder. The missing instruction is a source-authenticated mapping from the historical ICMP response to a typed LP2 operation/key.

Evidence: [p3 red119/SCY source gate](lp2-p3-red119-sky-strictf-source-gate.md), [2013 ICMP reconstruction](2013-icmp-echo-packet-reconstruction.md), [LP2 ICMP bridge gate](lp2-2013-icmp28-inkfragment-original-gate.md), [whole-chapter SFT](../sims/lp2_p3_red119_sky_strictf_historical_sft.cjs), [p7 handoff SFT](../sims/lp2_p7_unique_redstop_scy_keyhandoff_sft.cjs).

### 3. p15 4×4 number square + infinity → Fibonacci-indexed primes → continue as a key

**Visible clue.** Original p15 (scan 32.jpg) displays a 4×4 numerical square, highlights 3299 in red, and places an infinity glyph immediately below it. A 2014 solver already knew 3301 as Cicada’s signature number and could reasonably test prime arithmetic and continuation.

**Smallest recognizable reconstruction.** In the printed spiral order, the sixteen values are exactly abs(3301−p_(F_n+1)) for the first sixteen Fibonacci terms F_n=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987], where p_k is the one-based kth prime. This is a strong structural reconstruction of the numeric object. The infinity glyph naturally suggests continuing the sequence, but does not state how to turn it into a cipher key.

**Original-cipher prediction and result.** The cheapest recognizable key transfer is to continue the Fibonacci/prime sequence and apply the solved p56 prime-totient shift with its literal plaintext-F bypass to the next original pages. The tested modulo-3301 continuation is impossible by p16 local offset 45: it forces plaintext F from ciphertext NG, although the authenticated F-bypass requires plaintext F to pass through unchanged. The direct additive continuation is also nonlinguistic. Separately, the literal 4×4 Hill29 interpretation on the first four printed p15 lines fails all four elementary row/column encode/decode orientations. The projective-infinity GP30 proposal has a key-independent 1,119-word-break deficit under its four fixed maps.

**Decision.** The p15 matrix is a strong numeric object, but the infinity mark does not select a continuation clock, key conversion, or use on following ciphertext. The tested simple key transfers fail; do not expand the family without a source-authored continuation rule.

Evidence: [p15 Fibonacci-prime/infinity original gate](lp2-p15-fibprime-mod3301-infinity-original-gate.md), [reproducer](../sims/lp2_p15_fibprime_mod3301_infinity_original_sft.cjs), [four-printed-line matrix gate](lp2-p15-four-printed-line-matrix-gate.md), [projective-infinity all-secret bound](lp2-p15-infinity-projective30-allsecret-original-gate.md).

## Other visible motifs not promoted

- The p1–p2 staff/cross-like marginal figures and lemniscate ornaments have no caption, authenticated historical identification, rune-position map, or unique operation. Their visual salience alone does not justify a Möbius, projective, or alchemical cipher search.
- The p8–p14 trees are repeated stencils whose left/right placement follows page parity; they do not encode seven page-varying branch keys. P14’s mayfly/tree pairing makes the Old English Rune Poem a reasonable reference to consult because GP is based on Futhorc, but Eoh/Dæg/Eolhx assignments are not unique and the tested prime-weight, running-key, affine, and RSA consumers do not decrypt p14. This remains a thematic cross-reference, not a fourth executable hypothesis.
- P3–p7 scroll margins are a repeated template rather than page-specific key material. P7 music/five-dot families are outside this issue by instruction.
- P16–p21 show no separate numeric table, labelled diagram, or visible external reference that selects a new reversible operation; their original rune text alone does not specify a key or historical dependency.

## Overall decision

No complete clue → operation → original-cipher prediction chain on p1–p21 recovers unknown prose. The strongest actual human route is p3 red119 Atbash → SCY/SKY → the signed 2013 ICMP instruction, but that route reaches a historical network action rather than an LP2 decoder; the simplest SCY chapter-key transfer fails exactly. The p2 mirror clue and p15 Fibonacci-prime object are real, reproducible observations, but their cheapest reversible cipher consumers fail. The repeated tree/mayfly imagery does not supply a unique key.

**Completion:** close this bounded human-path audit as negative. Reopen only with a contemporaneous authenticated ICMP response plus a source-selected LP2 consumer, an original source that pins the p2 illustration’s exact directional operation, or a first-party instruction specifying how the p15 sequence becomes a key/clock. Do not restart undirected visual searches or unconstrained key fitting.