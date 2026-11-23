# Original p33/p39 NW–SW whole-word pairing: west-column key and numbered-passage inverse

**Agent50, 23 November 2026. Classification:** a new source-literal *candidate operand selector* and direct cryptanalytic test, **not** recovered unknown LP2 plaintext, an authenticated key, a selected cipher, or a destination. The original five numbered passages remain encrypted under every tested direct inverse.

## Independent source observation and intended-route hypothesis

The 55 rune-bearing, unsolved LP2 physical pages have exactly **two complete, hyphen-bounded two-rune compass words** among the four candidates `NE, NW, SE, SW` under the actual GP29 transliteration: **`ᚾᚹ` = NW on original p33** (scan `50.jpg`, second red-heading paragraph) and **`ᛋᚹ` = SW at the start of original p39** (scan `56.jpg`). Both lie inside the seven-physical-page cuneiform chapter p33–39. This complete-word census preserves actual hyphens and full stops; printed line-wrap slashes do not create extra words. In particular, the p39 **source `SW`** is a whole word and not a chosen substring. The image-backed word shapes were independently inspected.

A human might interpret **NW → SW** as a direction to read **down the western edge** of a rectangular object. The untouched later p49–51 number object (scans `66–68.jpg`) has exactly **32 rows × eight columns**, giving a natural 32-byte west-column candidate if the established conventional base60 transcription is used. A 32-byte operand is a recognizable candidate key for 2014-era AES-256. The original chapter independently numbers five runic passages **1 through 5**, allowing a direct, fully specified five-item receiver and IV counter.

The strongest rival is ordinary accidental ciphertext words in an alphabet of 29: the manuscript does not label those two encrypted words as decrypted instructions, does not explicitly connect them to p50, does not specify AES, and has a live base59-versus-base60 digit-alphabet ambiguity. This is an **actionable hypothesis**, rather than proof that the author intended the interpretation.

Under the conventional base60 codec, the top-to-bottom 32-byte **west column** is:

```text
cb5c796d7350fdfe7aa48ed3de7a492ac90a7de7e9f0eb80006e398e446a9071
```

SHA-256 of this exact source byte column is `dcd70c84ab465e956077ca9fb75974dbfd644e0f95a38858ed4691193b03e4d1`. The first printed northwest grid cell is `3N = 203`; the final southwest cell is `1r = 113`.

## Historical source clues that discriminate the proposed west / reversal reading

The original May 2014 seventh-onion HTML, preserved at [Stage11 `index.html`](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/ky2khlqdf7qdznac.onion/index.html) and already mirrored in this repository, opens with a deliberately conspicuous pair of numeric HTML attributes: `<title>133</title>` and `<div id="331">`. They are **digit reversals**. Their sum is **464**, and the **464th positive prime is 3301**, already printed alongside its reversal **1033** on the original p33–p39 cuneiform chapter. Moreover the genuine 2014 Stage10 **7×7 / 1033 magic square has center 331**, an exact previous-stage value ([historical 7×7 matrix](../resources/cicada2014-openpuff-magic-squares.txt)). This constructs a short, human-accessible candidate pointer from the actual Onion7 page source to the cuneiform heading, using the historically demonstrated prime motif. **The site never says to add its two attributes or take a prime index**, and 3301 is the already-public puzzle identity. It therefore does **not** authorize reversing a rune tape, picking any matrix transform, treating the five numbered units as machine instructions, or promoting a plaintext claim.

A second cross-round *historically preserved but signature-limited* candidate is the original 2014 delivery note archived as [Stage11 `message.txt.asc`](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/message.txt.asc). Its trailing-space/blank-space run lengths encode `2,3,5,7,11,13,17,23,29,31,37`, omitting **19** from the first 12 consecutive primes. **19** is the GP-prime label of rune **ᚹ = W**, making it a source-independent possible cue to the printed NW and SW words in this cuneiform chapter. The omission was documented as a possible unused Cicada hint years before this research, and should **not** be presented as newly decoded plaintext. Importantly, an [independent archived copy](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2014/hello-your-enlightenment.asc) has **exactly the same OpenPGP signature bytes yet removes those trailing spaces**, because OpenPGP cleartext signature canonicalization strips trailing whitespace. The putative prime-word omission is period-archived data, **not independently protected by the valid signature**. The signed five-space indent on the onion address is preserved in both copies; the rest of the blank-space prime counts are not fixed by the signature.

These two candidates strengthen the **question** of whether there was an original human-readable route to a *westward or reversing instruction*, but they still supply neither the key-law/byte-to-rune serialization nor a demonstrated original output. The already completed **west-column AES-256-CTR and direct GP29 additive** receivers below therefore remain negative without exception. No further derivative-cipher search is justified by these clues alone; the next useful input would be a period-authentic instruction assigning the 2014 7×7 center, west edge, or digit reversal to an explicit full-cipher recipient.

## Direct unknown-cipher test

The five source-numbered sections are complete printed-rune tapes of lengths **139, 91, 98, 96 and 129**, totaling **553** GP29 indices. Their concatenated source-byte SHA-256 is `f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a`. They are extracted at the original `1-` through `5-` boundaries rather than guessed word or line positions.

**AES-256-CTR candidate:** for each numbered item j, AES-encrypt zero bytes using the literal western key and either IV=integer j (16-byte big-endian or little-endian) or the zero IV. Convert keystream bytes to GP29 by either `byte % 29` or source-agnostic unbiased rejection of byte values ≥232 before modulo29. Recover P = C ± keystream modulo29. Exactly **16 direct original-input inverse programs** are tested, using every original rune of all five numbered units and no fitted phase or guessed secret.

The original concatenated source IoC is **0.03423356133867966**. The **largest IoC of any of the 16 deciphered original candidates is 0.03541945121471814**, with individual item scores **0.033260, 0.036630, 0.035767, 0.033114, 0.036579**. This is near uniform 1/29 and far below the independent authentic clear p57 GP IoC **0.06270996640537514**. No readable unknown GP plaintext appears.

**Simpler historical rival:** use the same 32 western source bytes reduced modulo29 as a repeated additive GP29 Vigenere key, either restarting at the first rune of each numbered item or running continuously across the full 553-rune sequence. Both signs give **four exact direct candidates**, with maximum original IoC **0.034521843960479075**. Again no unknown plaintext.

For both inversion families, the reproducer constructs authentic clear p57 rune sequences matching all five original lengths, encrypts them under each frozen candidate and recovers **553/553** GP runes exactly. This verifies the implementable inverse without mistaking a synthetic round trip for historical authentication. The script asserts the two original whole-word compass locations, full 32×8 source key, exact five-item lengths, source digests, every test count and numerical metric.

**Reproduction:** [single-file Windows-compatible Node22/CommonJS SFT](../sims/lp2_cuneiform_nw_sw_westcol_aes256_numbered_sft.cjs), successfully executed on the original checked-in corpus and grid in [Windows Actions run 45100645280](https://github.com/FlareZ123/liber-primus/actions/runs/45100645280).

## Cryptanalytic decision

The **source-attested NW/SW whole-word pairing** merits preservation as a possible original compass selector. The **specific source-west key into the five numbered passages** does **not** yield plaintext under direct repeated Vigenere or AES-256-CTR. Stop this family at these source-bounded receivers; testing guessed AES nonces, private password-derived keys, alternate cipher layers or ad hoc shifts would sacrifice the very source constraint motivating it.

The related [earlier east-column experiment](lp2-p50-east32-aes-key-gate.md) already used the western column as an *explicit negative control* for AES decryption of the **remaining 224 table bytes**, and the [eight-section AES source test](lp2-p50-eightcolumn-aes256-original-source-gate.md) tested all eight columns as master keys for **eight much larger text sections**. This investigation's genuinely different receiver is the **five original numbered cuneiform passages**. None of these different tests has an authentic cipher-consumer instruction or an unknown plaintext recovery.

A useful successor requires **an independent first-party clue specifying the actual consumer of the western column**, a verified candidate plaintext or a reversible operation that predicts new held-out source symbols. Treat the NW/SW pairing as a bounded lead, not as proof of intentional map directions.
