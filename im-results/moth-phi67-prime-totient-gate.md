# Moth displacement (+66,+67) as a prime/totient start: bounded original negative

**Evidence class:** exact image displacement and arithmetic; retrospective source-derived key hypothesis; bounded negative on original LP2 pages p53–55. No unknown plaintext, authentic key, encryption mechanism, or destination recovered.

## Human solve-path hypothesis

The original LP2 moth artwork on physical p53 and p55 is the same rendered asset, translated by exactly **(+66,+67) pixels**. This is an observed image fact, not evidence that the displacement was intended as a cipher instruction.

A compact number-theoretic reading is nevertheless available:

- 67 is prime.
- Euler's totient is phi(67)=66.
- The intervening p54 has a visibly enlarged Ac at GP index 24, whose GP prime weight is 97.
- 97−67=30, exactly the number of red thirteen-dot stencils in the 31-mark source set.

The source's solved p56 uses the authenticated prime-totient stream: subtract phi(p_n)=p_n−1 modulo 29, with selected literal-F symbols not consuming a key step. This suggested a tightly constrained test: start that exact known operation at prime 67, using the moth displacement as the p67/phi(p67) selector, on the image-linked p53/p55 pages and the source-selected 256-rune composite p53 + p54 initial Ac + p55.

The numerical network is suggestive but retrospective. Neither the pixel displacement nor the 97−67=30 relation independently specifies that p56's cipher should be reused.

## Frozen test

The prime sequence starts at the 19th prime, 67; the first key values are phi(67), phi(71), phi(73), ... reduced modulo 29. The cipher direction is fixed to the authenticated p56 direction (subtract the totient); no sign, phase, or prime offset is fitted.

Exhaust every possible literal-F/nonconsuming mask for each selected ciphertext:

- p53: 179 runes, five visible F positions, 32 masks.
- p54: all 232 runes, three visible F positions, eight masks.
- p55: 76 runes, three visible F positions, eight masks.
- Composite 256-symbol block: all 179 p53 runes, the single enlarged p54 Ac at offset 0, then all 76 p55 runes; eight F positions, 256 masks. Test a continuous prime clock and a physical-page-reset clock.

The 256 block is selected by the existing original-image correspondence and the p54 dropcap count; it is not a contiguous transcription of all p54 text. The original language score is the repository's frozen Emerson-derived GP trigram model. The known solved p56 plaintext is an authentic positive control.

## Results

- The authentic p56 control reproduces all **85/85** known plaintext runes with its genuine prime-2 start and literal-F mask 8; score **−2.38385401**.
- p53, starting at prime 67 and exhausting 32 F masks: raw score **−6.51698188**; best **−5.82849431**, mask 8. Opening: RPXCTHFIFEALNPOEHEPLYTHSAEEEOBUTDUTDCJADUDOEXHLWEOTDIEFTOOJEEAETHJEANGDNGOPCBEOHJTDOETHOEWHAGOLTH.
- p54, starting at prime 67 and exhausting eight masks: raw **−6.17403174**; best **−6.14830428**, mask 4.
- p55, starting at prime 67 and exhausting eight masks: raw **−6.51080498**; best **−6.37715888**, mask 6.
- Composite 256 block, continuous clock: raw **−6.51700254**; best of 256 masks **−5.72232393**, mask 168.
- Composite 256 block, page-reset clock: best of 256 masks **−6.00426956**, mask 216.

Every original candidate remains far below the authentic solved-page control and produces no coherent text. A source-disjoint 256-rune plant with the same eight literal-F positions recovers **256/256** under both clock rules.

**Decision:** the direct p67-start prime-totient interpretation is negative on all three selected pages and the 256-symbol composite. Do not repeat the p67 start with cosmetic F-mask, sign, or clock variations. This does not exclude other source-derived uses of the image geometry or a different nonlinear state.

## Reproduction

Run:

    node sims/moth_phi67_prime_totient_gate.cjs

The script imports the repository's authenticated p56 prime/totient implementation and GP language model, verifies the known p56 control, reconstructs the source-selected page blocks from the canonical corpus, exhausts the declared F masks, and checks exact synthetic recovery under both composite clock rules.

This is a bounded source-key negative, not a change to the authoritative overall research state; no update to results/README.md is warranted.
