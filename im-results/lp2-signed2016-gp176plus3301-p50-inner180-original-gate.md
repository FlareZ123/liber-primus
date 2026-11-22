# Signed 2016 source GP176 + “3301” versus original p50 interior180

**Original-input decision, 22 November 2026, Agent11:** source-literal length alignment confirmed; the four direct fixed-sign, fixed-origin GP29 additive keys fail both independent native-language controls and exact comparison with the adjacent known 180 runes. This yields **no authentic plaintext, selected cipher, or key**. The signed message's 176-symbol length itself is an ordinary-length event in independent natural-language data.

## Specific source-derived idea

The unaltered [OpenPGP-clearsigned January 2016 Cicada message](../resources/historical/cicada2016-4gq25-outguess.asc) says that the manuscript's **“words are the map”** and **“numbers are the direction.”** Its 43 alphabetic words, from *HELLO* through *OPENPGP*, encode to **176 GP29 runes** using the original p57-validated Latin→rune spellings, including TH and ING ligatures. The message separately prints the isolated four-digit brand **3301**. Treating those four digits as four integers `[3,3,0,1]` produces one possible literal **180-position** key.

Separately, the original p50 source table has **32×8 bytes, perimeter76 and strict 30×6 interior180**. The original solved p56+p57 material also spans **85+95=180 GP29 runes**. All three counts are source-visible, creating a bounded route from the later signed clue to the earlier table. The weakest premise is precisely the **choice to append digits as four key units**; neither the 2016 message nor p50 specifies that pairing or an additive GP29 byte interpretation. The signed cue was issued two years after the book's original appearance.

This coincidence has a quantitative baseline: among **15,691** independent consecutive 43-word windows of pinned Gibran *The Prophet*, **244** have exactly 176 native GP runes, a **1.555%** rate. It is therefore insufficient to authenticate a shared 180-unit key mechanism.

## Locked reversible test

Take unchanged original table values `T[r,c]` from [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json) for printed rows 1–30 and columns 1–6, preserving the published original base60 interpretation. Read the 180 interior cells by printed row order or printed column order. Reduce each unsigned byte modulo29. At fixed key position 0, calculate either

`P[i]=(T[i] mod29 + K[i]) mod29` or `P[i]=(T[i] mod29 − K[i]) mod29`,

with **no fitted phase, digit permutation, page reset, nonlinear rule, or language-selected key**.

Use GP-native trigrams trained on independent pinned Gibran source text. Its **4,811** native 180-rune windows have mean log-trigram scores at least **−2.451947**, and an independently solved LP1 first180 reference scores **−2.336531**. An authentic original p57 clear passage tiled to180 has score **−2.509606**. All four reverse methods re-encode 180/180 original table residues exactly, and each decrypts a separately planted 180-symbol native-GP solved-p57 specimen exactly.

| Original strict-interior receiver | GP29 IoC | Native trigram | Exact positions agreeing with adjacent printed p56+p57 |
| --- | ---: | ---: | ---: |
| Row-major, subtract signed GP176+digits | 0.0373060 | −4.106628 | 2/180 |
| Row-major, add signed GP176+digits | 0.0346989 | −4.079154 | 8/180 |
| Column-major, subtract | 0.0353818 | −4.150661 | 9/180 |
| Column-major, add | 0.0358163 | −4.089298 | 4/180 |

The **best** original trigram is **−4.079154**, below **all 4,811** native-reference windows and dramatically below the authentic solved-language controls. The p56+p57 column counts compare to their **original printed rune indices** (p56 still enciphered, p57 clear), so reject only a **direct exact source-table-to-adjacent-printed-rune** alignment, not a mapping to p56 plaintext or an additional key layer.

## Decision and next source gate

The later signed source's 176+4 count does **not** decrypt the p50 strict interior through any fixed-origin, sign-only GP29 additive rule in natural printed order, nor reproduce the original adjacent 180 runes. It neither explains p55's 76 ciphertext glyphs nor supplies a reversible full-book key, and the source-length match is common enough that it cannot justify an expanding cipher family. Reopen this branch only after a first-party instruction specifies **how** the signed message's numerical 3301 is to enter the p50/terminal cipher.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_signed2016_176plus3301_p50_inner180_sft.cjs), Windows Node22 **PASS** [manual read-only workflow run 44984558484](https://github.com/FlareZ123/liber-primus/actions/runs/44984558484). It reads unmodified historical/canonical files, verifies source-signed words43 and native signs176, p57 translation95/95, strict interior180, all four 180/180 plants, 15,691 independent word-length controls, and four original outputs.
