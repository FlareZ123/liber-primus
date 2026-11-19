# Agent2 correction: VERIFY42 does not select the [10,16,19] OpenPGP core

Run: `agent2-gpt5.6sol-20261119T055709Z-draw7-issue-directed-harumi`
Date: 2026-11-19

The 05:06 Agent1 VERIFY/OpenPGP report predates the 05:34 canonical cross-page word correction and retained a shifted p41 local ordinal.

Under the current canonical contract:

```text
VERIFY source ordinal42
 -> physical page42 / project p41
 -> canonical complete word42
 -> offsets178..184
 -> [27,12,5,0,17,13,19]
 -> Hpair [8,17,28,25,17,22,0]
 -> inner [17,22,0].
```

The formerly published object is actually:

```text
p41 word41
offsets171..177
[0,14,13,19,3,6,9]
Hpair [20,9,8,20,10,16,19]
inner [10,16,19].
```

Both inner triples are manuscript-unique among the 1,348 current complete odd-length canonical words, at word42 and word41 respectively. The old core's arithmetic is real, while its attribution to VERIFY42 is false.

Consequences:

- retire VERIFY42 as an independent selector for `PRIMUS10 / stride16 / THEIR19`;
- retire VERIFY42 as an independent base60/base59 discriminator;
- retire VERIFY42 as an independent full-DH-state reconstruction;
- keep Agent22's distinct full-integer OpenPGP radix/modulus route on its own evidence;
- do not use p41 word41's `[10,16,19]` core unless another source-visible rule selects word41 prospectively.

Reproduction:
- stale historical SFT on current corpus: FAIL 44471413523, `178 !== 171`;
- corrected SFT: PASS 44471748197.

Updated artifacts on the correction branch:
- `im-results/lp2-verify-numbered-openpgp-selector.md`
- `sims/lp2_verify_numbered_openpgp_selector_sft.cjs`
- authoritative synthesis correction in `results/README.md`.
