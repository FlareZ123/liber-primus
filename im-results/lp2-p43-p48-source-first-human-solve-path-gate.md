# LP2 p43–p48 source-first human solve-path gate

**Status:** bounded negative for a new source-selected decipherment. One outstanding source-adjudication dependency in the p47 low-digit study is closed. No unknown plaintext, key, or cipher mechanism recovered.

## Source and frozen hypotheses

Use the corrected original-image mapping and source inventory in [the corrected inventory](../workplace/lp2-p43-p48-source-only-inventory-preregistration.md), and the pre-derived-report hypothesis lock in [the source-first preregistration](../workplace/source-first-p43-p48-preregistration.md). Physical p43–p48 are archive images 60–65, not filenames 43–48. All six are 2400×3600 grayscale images with twelve centered GP29 lines and the same bilateral botanical frame.

The frame's left and right strips are pixel-identical across archive images 59–66 (physical p42–p49). Crop hashes:
- left x=0..499: 0f912c9126481b038f7906edaf518caed80f5e4306f69b21747b125a30522b8c
- right x=1900..2399: 0a96c791f5e4b794577009bd1dfccb244e8e939c8c721095e7c9e406e6d75234

This rejects a page-varying border key for p43–p48. A section-level framing cue remains possible, but it supplies no reversible operation or key.

## Frozen H1–H3 results

| Hypothesis | Fixed test | Result | Decision |
|---|---|---|---|
| H1 — 2013 “forest” means one section | Compare original frame state across p43–p48 and neighbors; keep the 1632-rune interval and its 72 line boundaries intact | The frame is identical across p42–p49. It has no page-varying state. The signed wording supports looking at a larger context but does not select this six-page scope, a cipher, or a key. | Reject per-page-frame key. Keep section grouping as a weak scope cue only. |
| H2 — bilateral frame means mirror/reverse | Reverse the complete rune/punctuation sequence within each printed line; do not change line order, shift, or tune; use p48 as held-out receiver | Direct GP29 transliteration of all twelve reversed p48 lines remains nonlinguistic. Full output is below. | Reject stand-alone line reversal as the decipherment. |
| H3 — “knock/listen” means standard Morse | Map period to dot and hyphen divider to dash; each printed line is one packet; no custom alphabet or regrouping; use p48 as held-out receiver | Packet lengths are 7,5,6,6,5,5,6,6,5,6,4,5. Seven of twelve exceed the maximum five-symbol standard Morse letter/digit code. The five valid packets decode to 9,9,0,9,0, not a message. | Reject this fixed Morse interpretation. |

### H2 held-out output

The exact fixed operation is reproduced by the source-locked script below. Transliteration is the repository's canonical GP29 mapping.

~~~text
-BRDP-AF.PROL-ITIA-UENG.GJ-THICH
LEPHOETH.CNTIA-AEAITHOE-BFPNF-G-SING
RIAI-PEAO-OEMEO-FEANGTHNGB.NGIA-MFOE-AE
-JRANP-ITTHDJO-FIATH-NOEJON-OBOOEWW-
OEJYIA.EOCAENGM-HYDP-MT-IANG-YRX
WTUTHCJAT-PS-ALAELAHO-AT-RIEOUONG-
C-YLTH-BA-OELOE-BFSU-DIIAYMEGM-TH
OAE-REA-U-DHDSUBNGOE-XW.IEOD-YEA
IATHL.WTHC-IAEOFIA-NGOEE-EOLNIAP-WABNGH
JIM-UM-GEAR-ANO-FEANUXU-JOED-P
OEP-TIAEJPIAB-JFEOFM-YFNO-MNRMB
FLAYDUFEO-OEING-EOAEHS-OEOC-NEH-OETAE
~~~

No extra phase, substitution, or key was added after this failed prediction.

### Historical meaning of “knock/listen”

The signed 2013 message containing “knock on the sky and listen to the sound” is followed in the preserved second-onion sequence by an ICMP-echo response carrying a signed message (the archived response is stored as the hex payload and decoded signed text). That is a historically demonstrated network-level reading of “knock/listen” — send an echo request and inspect the response — and is a stronger contextual interpretation than Morse. It does not create a page-local cipher: p43–p48 contain no visible IP address, hostname, onion endpoint, or packet payload specification. The fixed Morse test above remains a valid negative for the printed punctuation stream; the ICMP-echo route has no receiver on these six pages.

## p47 original-image word-boundary adjudication

The low-digit road-map report had one open prerequisite: verify p47 word segmentation against original scan 64. That check is now complete.

- Original p47 is archive image 64.jpg (SHA-256 08ed86be5561c09ce5c773d8001b290cc505436db89637d66ea0f5a15818d1c8). The 12-line image supports the canonical transcription's 54 hyphen dividers and four periods; the line-start and cross-line cases that determine the 59-word segmentation were checked explicitly.
- The transcription's slash marks are line-wrap notation, not printed separators. Where a line break has no divider, the word continues across it. The scan confirms the leading dividers on lines 5, 8, and 9; in particular, p47 word index 29 is the two-rune **AENG** spanning the end of line 6 and start of line 7, with no divider between those runes.
- Joining the twelve wrapped lines and splitting only at the printed hyphen/period marks yields **59 words / 274 runes**, matching the low-digit study's input. Its eight selected word positions are present as complete source spans:

| Zero-based word index | GP29 transliteration | Original line(s) |
|---:|---|---:|
| 10 | IAYEOEIAGAEFNW | 3 |
| 21 | LTI | 5 |
| 22 | AEJE | 5 |
| 29 | AENG | 6–7 |
| 39 | HTH | 8 |
| 42 | EOBOEAE | 9 |
| 48 | LEOEA | 10 |
| 58 | AOAAE | 12 |

This closes the source-transcription caveat; it does **not** validate the low-digit selector or establish that the selected 32-rune stream is a key. The existing study already records failed direct consumers, including the p55 76-symbol XOR transfer. Do not repeat those tests. The remaining missing input is a first-party operation that consumes the selected stream.

## Existing p48 leads and exclusions

- The p48 OutGuess extraction's Dyalog APL file(1) result is a generic signature false positive: the subtype byte is 0x98, not the Dyalog workspace value 0x03; the interpreter reports “ws not found.” No workspace, plaintext, or key was recovered. Retire this lead.
- The frozen p48 word-prime-coordinate → next-word keypad-direction rule predicts 96 where the actual next word selects 188; across 2,895 transitions it hits 11 (0.421%) versus a 0.462% marginal baseline. The direct remainder-shift consumer also leaves IoC essentially unchanged. Retire that specific rule.
- The separate p48 GEMY / 2016 number / p50 graph and p51 WWP convergence remains a provisional navigation hypothesis. It fixes neither a plaintext receiver nor an authenticated rule for consuming the GEM cycle; the proposed fixed-point reroute is still conjectural. Do not promote it to decipherment.

## Decision

No p43–p48 clue currently supplies a complete **clue → reversible operation → authentic key/state → untouched plaintext receiver** chain. The signed 2013 forest hint supplies, at most, a broad-context prompt; the knock/listen phrase does not make the ordinary word-divider/punctuation stream standard Morse. The repeated frame is a static template, not a page-varying key. The strongest current rival is ordinary ciphertext continuation through p43–p48, with the p47 low-digit and p48 GEMY structures retained only as provisional navigation hypotheses.

No further generic steganography, line-reversal variants, Morse regrouping, low-digit/XOR transfers, OutGuess, coordinate tuning, or broad key/phase searches are justified without a new first-party selector.

## Reproduction and dependencies

Run from repository root:

~~~sh
node sims/lp2_p43_p48_source_first_gate.cjs
~~~

The script reproduces p47's 59-word parse and selected spans, p48's fixed line-reversal output, and the standard-Morse held-out result from:
- resources/liber-primus/lp2-transcription.txt
- resources/liber-primus/lp2-corpus.json

Related existing studies:
- [p32/p47 low-digit road map](lp2-p32-p47-lowdigit-road-map.md)
- [p32/p47/p55 76-symbol XOR gate](lp2-p32-p47-p55-76symbol-xor-gate.md)
- [p48 OutGuess/Dyalog false-positive gate](lp2-p48-outguess-dyalog-signature-false-positive.md)
- [p48 word-prime coordinate/p50 grid gate](lp2-p48-word-prime-coordinate-p50-grid-gate.md)
- [p48 GEMY / p51 WWP convergence](../workplace/lp2-p51-wwp-p48-gemy-table-convergence.md)
