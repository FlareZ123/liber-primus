# LP2 p55 versus the clear PARABLE 19+76 split: bounded all-key no-go

**Agent 20, 17 November 2026. Classification: source-derived shape coincidence, exact key-independent exclusion for a narrow same-passage cipher. No unknown plaintext, authentic key or cipher recovered.**

## Human-visible candidate and its strongest alternative

The original physical LP2 p55 has **76 ciphertext runes**. The very last physical p57 is an independently readable **95-rune PARABLE**. Its first four printed words, “PARABLE LIKE THE INSTAR”, occupy exactly **19 Gematria Primus runes**; its final 16 complete words occupy exactly **76 runes**. A human noticing the adjacent terminal pages might try to read p55 as another encryption of this 76-rune suffix, with the opening 19 known runes as a key or as a four-row × 19-column phase. This is a candidate human solve path, **not an instruction printed by Cicada**.

Important rival: *PARABLE* was already embedded in authentic 2013 `761.mp3` metadata, the 19+76 split was noticed after studying the original lengths, and original p55's first rune is **carried from p54**. The matching 76 length is therefore insufficient to assert identical underlying text or a shared mechanism. This test grants extremely generous wholly unknown cipher alphabets before trying a fixed historical key.

## Source-exact exclusion with wholly unknown alphabets

The unchanged source registers in `resources/liber-primus/lp2-corpus.json` and the printed p57 word breaks in `resources/liber-primus/lp2-transcription.txt` have:

| Register | Rune count | Distinct GP29 runes | Unordered same-rune pairs |
| --- | ---: | ---: | ---: |
| Original p55 ciphertext, including carried first rune | 76 | **25** | **108** |
| Clear p57 last 16 words | 76 | **20** | **180** |
| Complete clear p57 | 95 | **22** | **280** |

No **deterministic stationary rune-to-rune function** can map *any* 76-rune subset of p57, even after arbitrary rearrangement, into all 76 original p55 glyphs. Such a function cannot create 25 distinct output classes from a source using only 22 classes total. For a bijective substitution, the mismatch of the sorted rune-count spectra and identical-pair sums gives a second, independent contradiction. This proof does not fit key values, language models or plaintext guesses.

Grant an **independent arbitrary GP29→GP29 substitution at each of 19 positions** in a repeated 19-rune clock; it may even be noninvertible. This generously covers every secret 19-phase alphabet, with four input/output observations per phase, in the exact original printed position order. Two contradictions remain:

- **Phase 1:** the same clear p57 suffix input **M** appears at local offsets **20** and **39**, but p55 demands different outputs **U** and **IA**.
- **Phase 15:** clear input **E** occurs at local offsets **53** and **72**, but p55 demands outputs **G** and **U**.

The exact minimum number of changed original target symbols needed to fit **all 19 completely secret phase maps** is therefore **2 of 76**. A genuine synthetic 76-rune positive, built from the same original p57 suffix with 19 independent fixed affine maps `(7 × rune + 13 + phase) mod 29`, gives **zero contradictions**.

This phase certificate specifically presumes the original p55 and p57 suffix symbols are paired at the same positions and the phase advances once per rune. A separately sourced permutation, moving-state alphabet, key-dependent symbol deletion, larger key period or changing register is outside its scope. Such accommodations cannot be selected after the mismatch without new source evidence.

## Research decision

The attractive 19+76 terminal overlap supplies **no direct monoalphabetic or repeated 19-phase same-passage decoder**. Do not select arbitrary keys or reassign word breaks to rescue this exact candidate. The needed next input is a first-party operation that makes use of the terminal poem and predicts otherwise unknown p55 text, or an independently identified source plaintext passage. This is a small **negative cryptanalytic boundary**, with no claim of solving any of the 56 unknown pages.

**Reproduction:** [read-only Node.js 22 CommonJS source-native SFT](../sims/lp2_p55_parable_suffix76_allsecret_sft.cjs); original data only, all contiguous 76-rune p57 windows, both exact collision certificates and a distinct synthetic 19-phase control. [Passing Windows GitHub Actions run 44148681024](https://github.com/FlareZ123/liber-primus/actions/runs/44148681024) executed the exact committed script on 17 November 2026.
