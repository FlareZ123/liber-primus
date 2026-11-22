# Modern public LP2 claim audit — 11 November 2026

**Agent37 · Director Issue #252 · outcome: no new verified LP2 plaintext, key, or reversible cipher mechanism.**

## Decision

The post-2018 public material located in this audit does **not** contain an independently reproducible decryption of any previously unsolved LP2 page, an authentic key, or a complete solution. One substantial 2026 research repository adds a useful independent constraint study but explicitly reports no plaintext. The strongest apparent 2026 “solution” claim is contradicted by the original page images and supplies none of the named code or output files.

This audit is scoped to claims and artifacts, not a catalogue of every Liber Primus discussion. Existing indexed sources (pnotisdev, Leo-Y-Zhang, Cicada Notebook, SECRA, and the CicadaSolvers historical archive) remain the principal prior-art references.

## 1. Wulfic/Cicada3301-Liber_Primus — useful research, not a solution

Repository: https://github.com/Wulfic/Cicada3301-Liber_Primus  
Primary status: [README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/README.md), [MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), [2026-09-29 logic findings](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md).

The repository was created 4 January 2026 and last pushed 12 October 2026. It is a substantial independent workspace (reported GitHub size 620,637 KB). Its own README explicitly classifies scans 17–66 and 68–72 as **LP2 p0–55, 12,956 runes, unsolved**; scans 73 and 74 are the known “AN END” and “PARABLE” pages. Its tracker states that none of its work has produced a plaintext.

Useful material:

- A 28-constraint register and reproducible test suite covering the LP2 ciphertext's structural statistics, word/line/page boundaries, key-source candidates, and attempted mechanism families.
- An independent report of 86 adjacent equalities across **12,947 section-contiguous transitions** in the 12,956-rune unknown stream (0.664%). The nine original sections have lengths [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316]; the follow-up reproducer now emits all 86 exact positions from the canonical master.
- A proposed output-side anti-doublet/re-key interpretation: 86 survivors versus 446.45 expected under a uniform 29-symbol stream (19.26%). This is a **model interpretation**, not an observed re-key event or identified algorithm. Issue #274 pinned the exact forward generators: encrypt_dodging and the two-key community switch are many-to-one, and the literal look-ahead switch can leave an output unset.
- The files under `v3_confirmed_cribs.json` are hillclimber anchors, not verified plaintext. The relevant page READMEs continue to mark those pages UNSOLVED.

The current canonical corpus independently gives 12,956 LP2 runes. Issue #274 pinned Wulfic's implementation at commit bf89d3d13aad2b8f2c95ab195cf1b092f250775c, independently reproduced its 86/12,947 fingerprint and all event positions, and demonstrated fixed-key/fixed-seed collisions in both encrypt_dodging variants and key_switch_ideal. Wulfic's own C14 test excludes its skip-next model (LLR −21.34 against a −10 gate), and its L5 test rejects the declared DIVINITY/CIRCUMFERENCES switch (6/2,900 ideal; 10/2,898 literal). The full 28-test suite has not been independently reproduced. The 19% ratio remains a statistical observation, not an authentic key, plaintext, or reversible mechanism; see [the exact model gate](lp2-anti-repeat-lossless-capacity.md#wulfic-s-19-anti-doublet-candidate-is-not-a-reversible-rule).

## 2. “Cicada Solution 2026” — unsupported and contradicted by original artifacts

Post: https://www.reddit.com/r/conspiracy/comments/1s5hp3c/cicada_solution_2026/

The author claims a dynamic stream cipher for pages 1–55, an Euler/totient cascade yielding “Visibilis Lux” on page 58, a 7×7 rune matrix on page 60 with prime modulus 1031 and offset 14, raw data bytes on pages 68–74, a reconstructed ZIP, and a page-74 SHA-256 checksum. It also names `MANIFESTO.TXT.ASC`, `PRIME_GEN.py`, and `MAP_FINAL.JPG`, and claims the result points to a mountain location.

No script, archive, map, manifest, PGP signature, exact key, page-by-page plaintext, or deterministic transformation is linked or attached. Several concrete claims fail against the original artifacts:

- Physical scan **60** is an ordinary runic text page, not a 7×7 rune matrix. In the canonical corpus it is LP2 page 43; its complete GP-prime-weight sum is **14,169**, not 1,031.
- Physical scans **73 and 74** are not raw data bytes. They are the known “AN END” page and the known “PARABLE” page, respectively. The 128-hex-character digest is on scan 73 (the 512-bit hash on LP2 p56); scan 74 contains the Parable, not a SHA-256 checksum.
- The proposed “Visibilis Lux” output is unsupported: the post gives no exact source sequence, key, page reset rule, intermediate values, or code from which it can be reproduced.
- The claimed ZIP, map, GPS generator, and PGP-signed manifesto are only named; no files or verifiable signature are supplied.

The primitive-root calculation may be mathematically valid in isolation, but it does not rescue the absent 7×7 matrix or the contradicted page layout. **Reject as an unsupported solution claim.** No LP2 frontier change.

## 3. “Full Translation of Liber Primus” — README-only, no decryption evidence

Repository: https://github.com/leorahross2015-afk/Full-Translation-of-Liber-Primus-Cicada-3301-/

The repository contains only a small README. It provides a few generic spiritual paraphrases, but no page-by-page plaintext, rune-to-text alignment, source ciphertext, key, algorithm, executable, or reproducible mapping. The text is not a translation in the cryptanalytic sense and cannot be tested against LP2. **Reject as unsupported.**

## 4. Newer research/tool repositories — no unknown-page key or plaintext claim substantiated

- [anon5376/cicada](https://github.com/anon5376/cicada): a 2026 execution lab that explicitly says it is not a claim that Liber Primus is solved. Its `EXP-LP-UNKNOWN-NEXT-001` artifact reports `derived_kept=0` and `verified_new_decrypt_runes=0`; it retains no new key or plaintext.
- [ToldByNun/Parcae](https://github.com/ToldByNun/Parcae): a C++20 cryptanalysis toolkit. Its README tutorial demonstrates a known-page Atbash regression fixture (“A Warning”), not an unknown-page solution. Useful infrastructure, not a decryption claim.
- [mortlach/RuneDecrypterPrime](https://github.com/mortlach/RuneDecrypterPrime) and [Liber-Primus-Crib-Assist](https://github.com/mortlach/Liber-Primus-Crib-Assist): modular cipher/crib tooling. No reproducible unknown-page plaintext or authentic key was found in the inspected material.
- [TheronEagle/liber-primus-research](https://github.com/TheronEagle/liber-primus-research), [Pitchfork-and-Torch/liber-research](https://github.com/Pitchfork-and-Torch/liber-research), and [jaxonkuipers/cicada3301](https://github.com/jaxonkuipers/cicada3301): research/archive material, not a verified unknown-page solve.
- [elder-plinius/V3R1T4S — LP2 entry](https://github.com/elder-plinius/V3R1T4S/blob/main/known-unknowns/unbroken-ciphers/liber-primus-lp2.md): explicitly lists LP2 as unbroken.
- The June 2025 Reddit post [“Third Cicada 3301 is cracked!”](https://www.reddit.com/r/mystery/comments/1lbm2os/third_cicada_3301_is_cracked/) concerns a separate alleged side puzzle; the thread itself asks about Liber Primus and supplies no LP2 decryption. Exclude from the LP2 solution frontier.

## 5. Historical public attempts

The 2019 Reddit post [“Documented Failure: Hashing Liber Primus”](https://www.reddit.com/r/cicada/comments/cmevyf) is an explicit failed attempt at the p56 hash, not a solution. Its code uses a generated RSA key and a fake local ciphertext path; it does not establish an LP2 cipher or key. It is useful only as a documented failure.

## Reusable conclusion

1. No post-2018 public source audited here supplies independently reproducible unknown-page plaintext, a source-authenticated LP2 key, or a complete reversible mechanism.
2. Retain Wulfic's 2026 constraint study as external prior art, but close the specified anti-doublet decoder: its forward generators are non-injective and the tested skip-next/two-key variants fail their own discriminating tests. The “19% leak” is not a recovered rule.
3. Do not import the Reddit 2026 “Euler-seed / geographic cipher” story: its core page-structure claims conflict with the original scans, and the named assets are absent.
4. Do not treat research frameworks, hillclimber cribs, known-page fixtures, or generated “Runeglish” as recovered plaintext.
5. The follow-up updates `results/README.md` only to record this bounded Wulfic-model exclusion; no established discovery or new LP2 solution state was found.

## Reproduction anchors

- Canonical source: `resources/liber-primus/lp2-corpus.json` (12,956 runes, pages 0–55).
- Original image checks: `resources/liber-primus/60.jpg`, `73.jpg`, `74.jpg`.
- The page-60 prime sum is `sum(corpus["prime"][i] for i in corpus["pages"][43]["indices"])`, yielding **14,169**.
- Wulfic's 86/12,947 count is over the nine original unsolved sections (segment IDs 7–15), excluding eight inter-section edges while retaining page joins; the separate within-page count is 86/12,901. The follow-up reproducer lists the 86 section-stream positions. Do not mix denominators or infer a decryption from either statistic alone.
