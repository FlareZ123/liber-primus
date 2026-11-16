# 2014 LP2 JPEG password source gate

**Historical-source decision (updated 15 November 2026):** No surviving signed or contemporaneous Cicada instruction expressly tells players to run OpenPuff on the 58 Stage11 JPEGs or specifies an LP2 JPEG payload. **A separate, bounded original-artifact hypothesis is now executable**, after independent source-native recovery of the authentic 2014 OpenPuff MP3 file. The repeated LP2 p33–39 cuneiform pair also gives a physically marked seven-image source group for one passphrase-reuse experiment. The documented OpenPuff passwords belong to the earlier `Interconnectedness` MP3; the documented OutGuess JPEG operations belong to distinct LP1 carriers and Stage5 continuation assets. Later finite tests of the only plausible Stage5 tail candidate `9133` and seven source-derived F5 password representations produced no recognizable LP2 payload. The commonality that both historical OutGuess and LP2 involve JPEGs is not a source selector.

## Acceptance rule

Issue [#246](https://github.com/FlareZ123/liber-primus/issues/246) requires an explicit historical link between a fixed password/key derivation and the LP2 Stage11 page JPEG carriers. A password for another carrier, a solver's guess, or a generic steganography instruction does not satisfy that requirement.

## Stage11 release and callback

- The pinned [Stage11 HTML index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage11/ky2khlqdf7qdznac.onion/index.html) is 1,640 bytes and contains title `133`, a `div` id `331`, and sequential references `0.jpg`–`57.jpg`. It contains no password, key derivation or steganography instruction. This is an archive copy, not an independently authenticated raw HTTP response.
- The PGP-signed [“Your enlightenment awaits you” message](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/hello-your-enlightenment.asc) points to `ky2khlqdf7qdznac.onion`, says “We look forward to hearing from you,” and ends with “3301.” It contains no password or OpenPuff direction.
- The PGP-signed [callback/form body](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/hello-you-have-done-well.asc) asks solvers to submit three magic squares and a Tor URL, generate a GnuPG key pair, and publish the public key at `/key.asc`. It does not direct use of a password on the Stage11 JPEGs.
- The participant's pinned [sixth-onion archive](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md) reproduces the signed OutGuess payloads on `10.jpg`–`13.jpg`. They repeat the instruction to host a CGI upload service and submit the squares and service URL. These payloads are not a passphrase derivation for the later 58-image Stage11 set.
- The May 2 participant callback archive records `GET /key.asc`, `GET /`, and `POST /cgi-bin/upload`; the saved log has no request body, key fingerprint or client trace. The preserved `message.txt.asc` is clear-signed, not a recipient-specific encrypted envelope. The example `cgi.py` is explicitly a never-used participant mock. See the consolidated [upload-direction/outbound-envelope audit](2014-stage11-upload-direction-correction.md).

## The known OpenPuff passwords belong to the MP3

The two historical walkthroughs disagree on the spelling, but agree on the carrier and operation:

- The pinned [fifth-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md) specifies OpenPuff v4.00, password `33011033`, B/C disabled, and 50% MP3 bit selection to extract `magicsquares.txt` from the `Interconnectedness` MP3. It links the password to the 1033/3301 column sums.
- The pinned [iBotPeaches extraction note](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/other/Interconnected_OpenPuff.md) reports `33011103` for the same `interconnected.mp3`, 50% MP3 selection and a 745-byte output with reported CRC32 `6A8C41E3`.

The historical disagreement has since been narrowed by **native OpenPuff 4.00**: [positive run 43662139707](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707) extracted the exact **745-byte magicsquares.txt** under `33011033`, B/C disabled, MP3 Maximum, with author-visible OpenPuff CRC32 **6A8C41E3** and matching source bytes; the variant `33011103` failed in GUI file selection before its password was evaluated. The recovered passphrase is authentic **for the MP3** only. An LP2-specific instruction to reuse it remains absent. However the *original LP2 art itself* repeats the same two distinctive numeral values on exactly **seven pages p33–39**, original JPEGs 50–56 ([cuneiform source audit](issue344-cuneiform-historical-template-gate.md)). The 2013 OpenPuff 4.00 [period review](https://dottech.org/104672/windows-best-free-steganography-software-review/) documents its default **Medium** setting and order-sensitive multi-carrier format. This supports two fully fixed exploratory source-input tests, the **seven marked originals 50.jpg–56.jpg** and the **58 published originals 17.jpg–74.jpg** as ordered chains, without asserting that either embeds a file. See [frozen carrier-chain test](../workplace/lp2-original-order-openpuff-58-carrier-chain.md). Agent8 independently dispatched a **per-image 58-JPEG** run [43673308138](https://github.com/FlareZ123/liber-primus/actions/runs/43673308138), still running at this report's revision; it cannot exclude split-carrier messages. The new multi-image source-fixed modes remain **unexecuted**.

## The historical JPEG OutGuess path is carrier-specific

The byte-preserved 2014 Stage04 and Stage05 instructions do establish a real, simple OutGuess solve path, but only for their named LP1 images:

- **Stage04:** the archived `decode.sh` runs OutGuess 0.4 with the default (empty) key using `outguess -r 03.jpg 03.jpg.asc` and `outguess -r 04.jpg 04.jpg.asc`. Those are the original LP1 pages 03 and 04, not Stage11 pages. Page 03 yields a PGP clear-signed “Let the text guide you” message and an embedded JPEG; page 04 yields an opaque 7,524-byte object. The complete Stage04 server-status binary is LP1 page 05. See [the Stage04 source gate](cicada2014-stage04-256-p50-direct-identity-gate.md).
- **Stage05:** the archived GZIP container recovers four JPEGs byte-identical to LP1 pages 06–09. The archived command is `outguess -r q4utgdi2n4m4uim5.onion.jpg q4utgdi2n4m4uim5.onion.asc.bz2` (again, no passphrase). Default-key OutGuess 0.4 on the third recovered image (LP1 08.jpg) yields the authentic 140-byte clue; the source-selected row-wise seven-column permutation `1736254` decodes its 56 grouped characters to `q4utgdi2n4m4uim5.onion`. The trailing `9133` occupies the four padding cells needed to complete eight rows of seven; no original instruction assigns it a password or LP2 role. See the [complete Stage05 recovery and OutGuess audit](2014-stage5-avowy-archive-audit.md).
- The single `9133` password hypothesis was nevertheless tested with pinned OutGuess 0.4 on the fourth Stage05 image and all 58 original LP2 JPEGs. All 58 LP2 files produced the same apparent `seed 50256, len 23133` header and high-entropy output, but **zero** recognized payloads; a payload-free control produced a plausible header too. This is a false-header family, not a partial extraction. Do not repeat it.
- **OpenPuff** is a separate documented path: v4.00 only, on the `Interconnectedness` MP3, with B/C disabled and 50% MP3 bit selection. The archived walkthrough gives password `33011033`; another preserved extraction note gives `33011103`. Both identify a 745-byte `magicsquares.txt` output from that MP3, not an LP2 JPEG.
- **F5** is not selected by these 2014 source instructions. The later bounded seven-password scan across all 58 LP2 JPEGs returned 0/406 nonempty payloads, while its detector was unreliable on every LP2 image and on its own positive control. This is a limited password result, not an exclusion of JPEG steganography generally; see the [F5 gate](f5-lp2-targeted-gate.md).

The Stage11 index lists sequential `0.jpg`–`57.jpg` files but supplies no OutGuess/OpenPuff/F5 instruction or expected payload. The signed Stage11 callback requests magic squares, a Tor URL and a GnuPG public key; the authenticated 2016 continuation speaks of words, meaning and numbers, not steganography. The original LP2 **cuneiform p33–39** does supply an *unsigned image-group and passphrase-value reminder* matching the earlier authentic OpenPuff password, but still does not name OpenPuff or say to apply it to these images. Preserve that distinction: it motivates a **bounded proposed original-byte extraction**, while a claim of intended LP2 OpenPuff reuse remains unproved.

## Bounded archive search

The pinned iBotPeaches 2014 message tree was checked for `welcome.asc`, `the-work-of-a-private-man.asc`, `very-good-you-have-done-well.asc`, `idgtk-umloo.asc`, `let-the-text-guide-you.asc`, and the `liber_primus/00`–`03` and `10`–`13` signed payloads. The latter four repeat the upload instruction; the other inspected bodies provide their own text/image or an unrelated RSA-OAEP challenge, not a Stage11-JPEG password.

Bounded GitHub code-search results on the public archive repositories:

| Query | Result |
|---|---|
| `neuroretransmit/cicada`: `password path:2014` | One hit: `2014/007-fifth-onion/README.md` (MP3 password) |
| `neuroretransmit/cicada`: `OpenPuff path:2014` | `2014/007-fifth-onion/README.md` and `2014/008-sixth-onion/README.md`; no LP2-JPEG key derivation |
| `neuroretransmit/cicada`: `passphrase path:2014` | Zero hits |
| `iBotPeaches/cicada_3301`: `password path:messages/2014` | Zero hits |
| `iBotPeaches/cicada_3301`: `OpenPuff path:messages/2014` | Zero hits |

The iBotPeaches repository-wide password search returned the MP3 extraction note and two software implementation/test files, not a 2014 message linking a password to Stage11 JPEGs. These searches cover preserved public repositories, not private participant mailboxes or lost onion/server storage.

## One deterministic 2013 BASE29 output as a bounded seven-image passphrase candidate

A participant-preserved 2013 Cicada TCP session log, [`clientlog-1362290293-9.txt`](https://github.com/neuroretransmit/cicada/blob/main/irc-logs/clientlog-1362290293-9.txt), records the exact command `BASE29 1033` and response **`01 OK 16I`**. This is reproducible arithmetic: with the server's base-29 digit alphabet `0123456789ABCDEFGHIJKLMNOPQRS`, `1033 = 1·29² + 6·29 + 18`, hence `16I`. The original LP2 cuneiform section p33–39 visibly repeats 1033/3301 and selects original scans **50.jpg–56.jpg**; the p0 red heading's source-derived half-difference is **16**. This gives a concrete, deterministic candidate passphrase rather than a guessed string.

**Weakest premise:** the TCP log is a participant archive, not a signed Cicada instruction, and no surviving 2014 author message directs solvers to apply OpenPuff to the LP2 JPEGs or to reuse the `BASE29` output as an OpenPuff password. The historical OpenPuff v4.00 method and the seven-image cuneiform carrier group are independently documented, but the transfer remains a hypothesis.

A single bounded test is therefore registered in the existing manual-only workflow `.github/workflows/openpuff-v400-lp2-cuneiform-topdown-source-probe.yml`, mode `seven-chain-base29`: **A=`16I`**, B/C disabled by the native driver, original JPEGs **50–56 in printed order**, JPEG **Medium 1/5**, with an independently authored public-JPEG positive control on the same Windows runner. A genuine extracted file must be independently identified and validated; a native corrupted-stream result with zero files rejects only this exact combination; a timeout is inconclusive. No additional passwords, carrier subsets, orders or bit levels are licensed by this candidate.

The `16I` digits interpreted as GP29 indices `[1,6,18]` were also tested as a direct repeating additive key on the original p0–p2 black body (716 runes) and p33–p39 cuneiform section (1,589 runes), both signs. Both outputs remained near the uniform GP29 baseline and nonlinguistic. Thus this test does **not** recycle a failed direct-Vigenère interpretation; it tests only the historically real OpenPuff operation.

The same 2013 session's `DH 3301` output `1067` is a session-specific exchange result, not a reproducible key supplied by the manuscript. A separate hypothesized `p=3301, g=133, A=16, B=331` DH construction yields shared secret `2906` and base-29 `3D6`; its direct repeating-additive GP29 use is also negative. Do not expand either DH interpretation into arbitrary key/seed searches.

## Research decision

1. No **direct Cicada-authored LP2 steganography instruction** was recovered in the bounded 2014 public messages. The original LP2 seven-page cuneiform source group and authentic earlier OpenPuff password justify **one** source-cued ordered seven-carrier test without upgrading the reuse theory to an established fact.
2. The original MP3 positive control **already passed** for `33011033`. The per-image original-JPEG probe is already dispatched separately by Agent8. After its outcome is understood, the two *distinct, source-fixed* candidate multi-image orders are 50.jpg–56.jpg (visibly marked pair) and 17.jpg–74.jpg (complete published source list), each with historical password and period-default JPEG Medium. Require genuine native completion and an independent multi-carrier positive before interpreting an empty result.
3. The one deterministic source-derived `16I` candidate above receives exactly one fixed seven-cuneiform-image test. Do not invent further passwords, arbitrary image subsets, bit-level menus or rune clocks on the basis of this clue. Never bypass protected manual GitHub Actions dispatch or treat a timeout as a negative.
4. A genuine original extracted payload or creator instruction would promote the finding to a new key/plaintext investigation. A completed empty native probe rejects only its exact fixed input parameters; it does not prove LP2 contains no other image steganography.

**Boundary:** this is a negative result for the identified surviving public archives. It does not prove that no private recipient archive, deleted message, unpreserved onion response or creator-side record ever existed. No LP2 plaintext, key, carrier payload or destination is recovered.
