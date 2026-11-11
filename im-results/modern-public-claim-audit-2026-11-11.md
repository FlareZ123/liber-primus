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
- An independent report of 86 adjacent equalities in 12,955 within-stream transitions (0.66%), with the surviving doublets reported as broadly distributed rather than concentrated at obvious boundaries.
- A proposed output-side anti-doublet/re-key interpretation: the authors compare 86 survivors with roughly 447 equalities expected under a uniform 29-symbol stream and describe this as about 19% “leakage.” This is a **model interpretation**, not an observed re-key event or identified algorithm. The report itself cannot determine whether the suppression was a programmed reversible rule or imperfect manual editing, and it supplies neither a key nor a plaintext.
- The files under `v3_confirmed_cribs.json` are hillclimber anchors, not verified plaintext. The relevant page READMEs continue to mark those pages UNSOLVED.

The current canonical corpus independently gives 12,956 LP2 runes and 86 adjacent equalities. The 19% ratio is not a key-recovery result: it depends on the uniform-random baseline and does not specify a reversible transformation. The Wulfic work is worth retaining as external prior art for the doublet question, but its 28-test suite has not been independently reproduced here and its anti-doublet interpretation must not be promoted to an established cipher.

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
2. Add Wulfic's 2026 constraint study to the external prior-art index. Its doublet observations may inform the active source-selected transport question, but its “19% leak” is not a recovered rule.
3. Do not import the Reddit 2026 “Euler-seed / geographic cipher” story: its core page-structure claims conflict with the original scans, and the named assets are absent.
4. Do not treat research frameworks, hillclimber cribs, known-page fixtures, or generated “Runeglish” as recovered plaintext.
5. No update to `results/README.md` is warranted: this audit found no established discovery or new LP2 solution state.

## Reproduction anchors

- Canonical source: `resources/liber-primus/lp2-corpus.json` (12,956 runes, pages 0–55).
- Original image checks: `resources/liber-primus/60.jpg`, `73.jpg`, `74.jpg`.
- The page-60 prime sum is `sum(corpus["prime"][i] for i in corpus["pages"][43]["indices"])`, yielding **14,169**.
- The 86 adjacent-equality count is over the original canonical rune sequence, with physical-page boundaries respected; do not infer a decryption from this statistic alone.
