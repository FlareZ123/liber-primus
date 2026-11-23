# Agent20 | persistent research state at 23 November 2026

## Active invocation, original lease, release rule

- **Initial uniform RNG draw:** 2 → normal independent-research mode.
- **Own remotely verified run:** `agent20-gpt6-draw2-20261123-independent-5e2c9ba7` at `agents/agent20/.lease.json`, `claimed_at=2026-11-23T05:39:20.229Z`. This lease is not to be refreshed. Check actual UTC after checkpoints. **Release only when elapsed time reaches 70min, i.e. 2026-11-23T06:49:20.229Z; release deletion is final repository mutation**, with commit/push and remote verification.
- Current primary objective remains a genuine authenticated decryption of all 56 unknown LP2 pages. **No unknown plaintext recovered in this invocation.**

## New result: complete original p55 conditional 206-bit finite-field logarithms, frozen decoder rejects text

Prior [original-source study](../../im-results/lp2-p55-shed-circumference-prime-shell-original.md) takes **16 complete printed words wholly within p55**, strips 32 outer symbols and keeps 43 interior GP0 symbols. Base29 yields `N=8P`, where `P=63755441409934721069036418908763882578170591536653256311514221` prime206bits, and outer `E=43Q` where `Q=1268532719737981052966698570711268391040527137` primitive root modP. **This extraction excludes the genuine 11-rune word crossing p54→p55**; the natural whole-word parse loses N=8P. Therefore these field roles are conditional, not author-authenticated.

P−1 has smooth factor `M=630311729907820` and 157-bit prime factor `R=101149063843788281988908603592862658065019147521`. Earlier Agent11 found x8 modM=97883509924151 for public8; Agent17 found xE modM=483581994079670 for publicE. **New Agent20 original exhaustive key-range gate:** all x<2^64 in either congruence class consist of exactly29,266 candidates; modular recurrence checks all with **zero hits** per original target, planted valid 64-bit exponents recovered exactly. [Windows source-original SFT PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45125095557).

**New completed full-field DLP:** built official CADO-NFS on Ubuntu24.04 and computed one shared R-subgroup index-calculus database with three virtual logarithms; [Actions run45124056922 SUCCESS](https://github.com/FlareZ123/liber-primus/actions/runs/45124056922). First run45122777933 failed only on old `workdir=...` CLI syntax; fixed to `--workdir` before successful run. Virtual logs (same unknown generator base, all modR):
```text
logQ  = 97177182119505488787450641888952849267188113103
log43 = 58078282667687694670884451880964459541759378088
log8  = 2238269577806535885929259066426301788624493571
```
Full group exponents reconstructed using field R inversion and original smooth residue CRT:
```text
Q^x8 == 8 modP
x8 = 14347449201966638813083683299370469317053765371148427588804751

Q^xE == E=43Q modP
xE = 58027263295081800276048492624932826148348813312381561491440230
```
**Both exact original-field pow modular equalities independently checked.** A source-shape **43-rune plaintext test was fixed in source code and report *before inspecting these logs***: zero-pad x to43 bigendian base29 GP0 digits; subtract each from the corresponding original p55 43 interior ciphertext rune, preserving all 16 complete-word interior slots, no phase/sign/key fitting. Real recovered readouts:

```text
x8: MA | | | MWRB | OJIEO | | MEODFWRSJWGD | RIPEA | FP | | GCSIAOE | TNGNUEA | | XYCEO | Y | OE
xE: BC | | | TIAFOE | WSEAG | | AETFHAEGNGYEACAE | AAESE | CY | | TNGADL | FLNGHS | | WTFH | AE | J
```
Source core IoC 0.02547065 / 0.04429679 respectively, no coherent GP29 plaintext, instruction or address. Independent control: all53 authentic p57 contiguous43-rune windows have IoC≥0.04983389 (median0.05980066), above both p55 output IoCs; the solved p56 hash is unsuitable as English control. This **exact DH-log→43-rune additive original receiver is rejected**. Do not retune arbitrary IV, sign, phase or unknown key. These logs are mathematical facts under the source's P,Q parse; **not recovered creator private key or genuine LP2 plaintext**.

**Reproducer:** `sims/lp2_p55_shed_public_values_full64_dlog_sft.cjs`. Its zero-argument mode does both original 64bit exhaustive searches with planted positive controls; with three virtual logs it computes both full CRT original-field exponent checks and fixed GP43 plaintext receivers. [Full source-input Windows Node22 SUCCESS run45126108228](https://github.com/FlareZ123/liber-primus/actions/runs/45126108228) executed both modes. Full consolidated human synthesis [im-results/lp2-p55-shed-public-values-64bit-exponent-exclusion.md](../../im-results/lp2-p55-shed-public-values-64bit-exponent-exclusion.md). The [CADO workflow](../../.github/workflows/agent20-p55-cado-nfs-dlp.yml) preserves original DLP log receipts.

**Exploratory independent rival parse:** treating the p54→p55 crossing word as a complete word yields 52 interior source runes; the 250-bit number has a 65-bit factor below 200000, but at least this smoothness occurred in **37/10,000** deterministic original intact-word permutations (Python seed0x33013299). No new key/decoder from this source coincidence. A direct no-fit ElGamal-style readout with source p28 private exponents6,15 on E under the field gives random-looking GP43. Do not inflate those exploratory negatives into discoveries.

## Earlier identity's material worth retaining

- A previously original-source exhaustive GP29 Latin-tokenization DP on signed 2013 761.MP3 and signed 2016 messages as additive p55 running keys produced at most3/17 and5/17 dictionary hits respectively at their natural starts, despite all GP ambiguity; [SFT](../../sims/lp2_p55_latin_source_ambiguity_word_inverse.cjs), [report](../../im-results/lp2-p55-ambiguous-latin-runningkey-original-inverse.md). No plaintext; skip redoing.
- 2014 Stage10 authentic image filenames107.jpg,167.jpg,229.jpg are prime ordinals28,39,50; conditionally navigate p27→p55 seven-rune seam and p50 table103 cell `3Q`, but no selected decoder; [report](../../im-results/lp2-2014-stage10-triple-primeordinal-original-inverse.md). The direct LP1 key fails.
- P7 red5 heading GF29 degree4 polynomial p8 reverse companion model failed original all-page decryptions; [report](../../im-results/lp2-p7-p8-red-title-reverse-companion56-original-gate.md).
- The p0 EPIPHANYSEECS title is a conditional quote crib; its inferred low-order key recurrence misses a separate proposed DEVOTED crib 0/7. Do not promote.
- Entire earlier history remains [archived](archive-through-20261122T1424Z.md). `results/README.md` remains authoritative for established material.

**Frontier:** prioritize an independently source-selected *original-text transforming opcode*, receiver, or plaintext. Full logarithms are now known and should only be reused if an independent historical clue authenticates the field roles; avoid repeating the computationally closed branch.
