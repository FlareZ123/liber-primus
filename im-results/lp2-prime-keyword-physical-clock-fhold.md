# Physical-prime clock plus periodic q8/q13 keyword, literal-F hold

**Decision (26 November 2026): reject the fixed start-zero physical-prime/consuming-key architecture on p54–p55.** The calibrated receiver recovers every planted key and all held-out text, but the original has nonprose p54 prefixes and no viable p55 continuation under q13; q8's sole continuation is also far below native controls.

## Frozen law and clocks

For a non-F plaintext rune at physical position (i),
[
C_i=P_i+K[t\bmod q]+(\operatorname{prime}_i-1)\pmod{29},
]
where (q\in\{8,13\}). Literal plaintext F emits ciphertext F (index 0) and does not advance the keyword cursor (t). The physical position (i) advances on every rune, including held F. The keyword cursor advances only on non-F. Both clocks start at zero on p54 and continue across the p54/p55 seam; there is no page reset, phase sweep, origin sweep, alternate sign, or extra layer.

With no held F, (i=t), so this reduces exactly to the earlier consuming-prime clock. The SFT asserts this equality on a 40-rune no-hold stream and separately verifies that a held F advances (i) but not (t). It also constructs a non-F plaintext that emits ciphertext F, so the inverse preserves both legal ciphertext-F explanations.

## Exact keyless preflight

The physical p54 prefix is 232 runes and has ciphertext-F positions [41, 65, 195], giving exactly eight possible hold masks. For each mask, the preflight subtracts the known physical prime term at every consuming position, assigns the next keyword phase only to non-F positions, and removes the one key value per phase that would force forbidden consuming plaintext F.

- q8: all 8/8 masks remain legal; there are 1251161820 mask/key pairs.
- q13: all 8/8 masks remain legal; there are 27852058751385600 mask/key pairs.

This is not an algebraic no-key proof. The exact cyclic n-gram optimizer is required to rank the surviving keys.

## Native calibration

Two independent 308-rune native plants were built from KOAN and LOSS for each period, with a 232-rune fit prefix and an untouched 76-rune suffix. Every plant contains at least one literal held F and at least one consuming non-F ciphertext-F in its prefix. The exact optimizer recovers all four hidden keys, every 232/232 prefix rune, and every 76/76 held-out rune.

- 0_koan_1, q8, source offset 56: 2 held F, 2 consuming ciphertext-F positions; exact key, 232/232 prefix and 76/76 heldout recovery; prefix/suffix scores -2.2047/-2.3202 nats/rune; 9 legal heldout paths.
- 0_loss_of_divinity, q8, source offset 15: 3 held F, 1 consuming ciphertext-F positions; exact key, 232/232 prefix and 76/76 heldout recovery; prefix/suffix scores -2.9134/-2.7996 nats/rune; 1 legal heldout paths.
- 0_koan_1, q13, source offset 9: 2 held F, 2 consuming ciphertext-F positions; exact key, 232/232 prefix and 76/76 heldout recovery; prefix/suffix scores -2.2284/-2.3178 nats/rune; 6 legal heldout paths.
- 0_loss_of_divinity, q13, source offset 48: 2 held F, 3 consuming ciphertext-F positions; exact key, 232/232 prefix and 76/76 heldout recovery; prefix/suffix scores -2.9097/-3.1471 nats/rune; 8 legal heldout paths.

The controls therefore validate the physical/keyword clock split, both ciphertext-F branches, and frozen p54-to-p55 prediction. Their held-out scores range from −2.3202 to −3.1471 nats/rune.

## Original p54–p55 result

**q8:** all eight prefix masks are legal. The best is mask 2 with key `[9,8,0,14,0,9,9,7]`, consuming cursor 231 at the seam, and prefix score **−4.71310376** nats/rune. The runner-up gap is only 0.00315905 nats/rune, so the prefix key is also weakly identified. Freezing this key and seam state leaves exactly one legal p55 path; its score is **−5.32733652** nats/rune and its plaintext is:

`DSHOPTHEOIAPEAADITFGUWNGMNTXDLOEEAIOMDXIAXAHNDEONGRUTAUIYAHJDRWEAEPTHWTHLXPHENGAYXCYUEOAPR`

This is not native prose and is substantially below both q8 native held-out controls (−2.3202 and −2.7996).

**q13:** all eight prefix masks are legal. The best is mask 6 with key `[8,1,20,22,11,15,6,3,3,25,27,11,15]`, consuming cursor 230, and prefix score **−4.40878080** nats/rune. Freezing this key and seam state leaves **zero** legal p55 paths. Its prefix score is also far below both q13 native controls (−2.3178 and −3.1471).

The exact keyless gate therefore does not reject the law, but the calibrated predictive test does. The physical clock supplies no native p54 reading or p55 continuation. Retire this exact start-zero physical-prime plus q8/q13 consuming-key law.

## Scope and reproduction

This excludes only the tested fixed architecture: prime-minus-one indexed by every physical rune, a shared periodic q8 or q13 keyword indexed by non-F consumption, authentic literal-F holds, zero initial clocks, and continuous state across p54–p55. It does not exclude the known consuming-prime p56 mechanism, q8/q13 alone, another source-selected key or clock, or other compositions.

- Exact SFT: `sims/lp2_prime_keyword_physical_prime_clock_fhold_sft.cjs`
- Full machine output: `im-results/lp2-prime-keyword-physical-clock-fhold-output.json`
- Existing shared-key baseline: `im-results/lp2-prime-keyword-shared-fhold-exact.md`
- Node 22 Actions run: [45908448158](https://github.com/FlareZ123/liber-primus/actions/runs/45908448158), successful; SFT commit `27420235d3b583a26f66907ae227bbc37a65a321`.

No unknown LP2 plaintext, authentic key, or destination was recovered.
