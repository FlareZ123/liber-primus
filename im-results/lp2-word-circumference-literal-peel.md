# Literal word-circumference shedding: exact GP29 partition and decision

**Agent40 · 16 November 2026 · Director Issue #1266.** This is a bounded original-cipher negative. The clear physical p57 PARABLE instructs readers to “shed our own circumferences” and “find the divinity within.” A human-visible application is to each **printed word**: discard its exterior first/last GP29 runes and read the interior. That operation is exact and unparameterized. No independently authored rule here says how the discarded shell transforms the interior or how a plaintext key is to be reconstructed.

## Source and reversible accounting

The original ciphertext input is `resources/liber-primus/lp2-transcription.txt`, independently checked rune-for-rune against `resources/liber-primus/lp2-corpus.json` for all 55 rune-bearing unknown physical pages p0–p55 (p50 contains no runes). A word continues across a printed line or page and ends only at source word/punctuation separators `-`, `.`, `&`, `$`; the 32 carried words are retained as **single words**. Every one of the 29 GP symbols is preserved, including `ᚠ` (F). The verified **138 small four-dot stops** remain untouched in the original punctuation source; the transcription's 175 period characters must not be misidentified as 175 physical small stops.

For one word `w` of length `n`: if `n=1`, its shell is `w` and the interior is empty. For `n≥2`, its shell is `w[0] + w[n−1]` and its interior is `w[1..n−2]`. The exact inverse is `shell[0] + interior + shell[1]` for length-two shells, and `shell` for length-one shells. Applying the inverse to all source words, and then retaining the original punctuation/page/line boundaries, reconstructs **all 12,956 original GP29 rune indices exactly**. This is a positional identity, not evidence for a historical cipher.

The [exact 2,896-slot ordered tapes](lp2-word-circumference-tapes.json) include one shell and one interior for every authentic word, **531 explicitly empty interior slots**, and the 32 carried-word indices/page memberships. The [read-only source-native CommonJS SFT](../sims/lp2_word_circumference_sft.cjs) asserts page/count parity, complete reconstruction, synthetic one-letter/two-letter/F/carry restoration, literal readout statistics, and the p57 cleartext control. It requires only Node's built-in modules and the pinned source corpus.

| Source partition | Word slots | GP29 runes | Index of coincidence |
| --- | ---: | ---: | ---: |
| All unknown original words | 2,896 | 12,956 | 0.03447840 |
| All exterior shells, retaining one-letter words | 2,896 | 5,709 | 0.03448286 |
| All interiors, including 531 empty slots | 2,896 | 7,247 | **0.03447346** |
| p0–2 literal interiors | 158 | 418 | **0.03413537** |
| p40–53 literal interiors, disjoint test | 669 | 1,683 | **0.03456259** |
| Genuine clear p57 before shedding | 20 | 95 | 0.06270997 |
| Genuine clear p57 after shedding, interiors | 20 | 55 | **0.07138047** |

The section counts include any original word whose source page membership intersects that section; carried words are not cut and a boundary word can contribute from an adjoining page. The p0–2 section has 729 total rune positions and 311 shell positions; p40–53 has 3,008 original positions and 1,325 shell positions. The source rune alphabet's uniform baseline is 1/29 = **0.03448276**.

## Actual readout and causal decision

The first p0–2 interior words transliterate `HEOGMIA-YENG-JG-J-N-EWBASOEEOING-AEGI-BN-B-J-NGY`; the p40–53 control starts `N-GDAE-PXY-EAO-NG-ITTH-AC-ROEGEANAEBUEB-F-S`. These are literal source-derived runes after one peel, before any cipher search. Neither readout yields a contiguous recovered GP-native plaintext. Their large-sample IoCs remain essentially uniform, whereas even the 55 interior runes extracted by the identical procedure from the independently **clear** p57 remain distinctly nonuniform.

**Rejected in this bounded decision:** the direct assertion that p57's shedding instruction exposes ordinary GP29 prose by deleting the first and last original rune of each printed ciphertext word, with existing word order and word divisions preserved. The exterior channel itself is likewise uniform in its pooled symbol frequencies. For 83 one-rune and 448 two-rune original words, literal shedding leaves **no interior word whatsoever**; those 531 slots cannot directly supply the corresponding plaintext words under a one-for-one word-boundary-preserving inverse.

**Still open:** A source-specified, reversible operation in which the shell carries a key/check/control for the interior; a receiver that remaps output boundaries; or a different geometrical use of p57. The phrase “circumferences” does not authorize subtracting shell values modulo29, fitting word-specific keys, repeatedly rotating interiors, or invoking a hidden state whose restoration rule is unavailable. Such variants need a separate independently visible selector before the original ciphertext is used to fit them. This decision recovers no unknown LP2 plaintext or Cicada destination.

The parent clue and neighboring routes are discussed in [the integrated inversion frontier](../workplace/integrated-original-inversion-challenge.md) and [the authoritative synthesis](../results/README.md). This report does not elevate an unverified mechanism to established results.
