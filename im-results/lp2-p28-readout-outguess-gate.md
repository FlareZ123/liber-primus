# P28 READ OUT / HERE OutGuess gate

**Consolidated classification (Agent16, 19 Nov; Agent3, 25 Nov 2026): bounded negative.** The default retrieval, the 16 p28 phrase keys, and the independently derived decimal DH shared-secret candidate `2` yield no recognizable OutGuess payload from the original p28 JPEG. This does not authenticate OutGuess as the intended receiver or exclude other hidden-payload systems. Do not continue blind password hunting.

## Motivation

Cicada historically used OutGuess on JPEGs, so the recovered p28 phrase **READ OUT** and local checkpoint **HERE** give a concrete, historically plausible steganographic interpretation: try OutGuess on the exact original p28 image.

This test was deliberately narrow. It did not enumerate dictionaries, mutate keys, or search arbitrary passwords.

Original p28 carrier:

~~~text
resources/liber-primus/45.jpg
SHA256 318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522
~~~

Tool:

~~~text
OutGuess 0.4
resurrecting-open-source-projects/outguess tag 0.4
~~~

The old bundled JPEG library required ANSI-prototype compatibility defines to build on current Ubuntu. Retrieval semantics were checked against the source: `-r` consumes the first key `-k`; a second `-K` retrieval hypothesis was invalid and was removed.

## Calibrated positive control

The workflow embeds:

~~~text
OUTGUESS-CALIBRATION
BEGIN PGP SIGNED MESSAGE
~~~

into OutGuess's upstream `tests/test.jpg` with key `READ OUT`, retrieves it with the same key, and byte-compares the result.

Result:

~~~text
embed-test-status=0
recover-test-status=0
upstream-control=PASS
~~~

So the built binary and keyed retrieval path are functional.

The exact p28 JPEG cannot be used as an embedding control with this old encoder because embedding fails immediately with:

~~~text
Bogus input colorspace
embed-p28-status=1
~~~

That limits the calibration claim to the tool/retrieval path rather than round-tripping this exact color-space carrier.

## Default historical retrieval

Historical Cicada OutGuess clues were commonly recovered directly with `outguess -r`.

On p28:

~~~text
default key / no explicit -k
output length = 0 bytes
~~~

This is a clean negative for the most natural OutGuess interpretation.

## Source-native keyed family

Charged keys were limited to strings already recovered or source-selected by the route:

~~~text
HERE
here
READ
OUT
FIND
NUMBERS
DIRECTION
READOUT
readout
READ OUT
read out
READOUTHERE
readouthere
READOUT HERE
READ OUT HERE
read out here
~~~

Representative nonempty retrievals:

~~~text
HERE         6,295 bytes  entropy 7.965504  printable 0.387768
READ        41,087 bytes  entropy 7.994850  printable 0.379609
FIND        46,163 bytes  entropy 7.996254  printable 0.381864
DIRECTION    7,133 bytes  entropy 7.973199  printable 0.379924
READOUTHERE 48,090 bytes  entropy 7.995706  printable 0.383718
READ OUT    49,080 bytes  entropy 7.995675  printable 0.382152
read out    20,668 bytes  entropy 7.990934  printable 0.387410
readouthere  5,980 bytes  entropy 7.968641  printable 0.386288
read out here 8,787 bytes entropy 7.980453  printable 0.383066
~~~

Other charged keys returned empty output. Some keys caused OutGuess to interpret random carrier bits as an impossible payload length and terminate with a floating-point exception. This behavior demonstrates weak wrong-key rejection in OutGuess retrieval and prevents treating “exit 0 with bytes” as evidence of a real payload.

Every nonempty candidate was classified as generic `data`. None contained the case-insensitive markers:

~~~text
BEGIN PGP
3301
http
onion
LIBER
CICADA
OUTGUESS
READ
HERE
~~~

The byte streams are consistent with wrong-key random extraction: entropy is approximately 7.97–8.00 bits/byte and printable fractions approximately 0.38.

## Independent DH-derived K=2 probe (Agent3, 25 November 2026)

### Hypothesis and limits

The p57→p28 navigation reconstruction and the p7 red-word packet give a conditional DH23 state `p=23, g=5, a=6, b=15, A=8, B=19, K=2`. Physical p28 also yields the candidate instruction **READ OUT** and the local checkpoint **HERE**. A direct decimal serialization of the shared secret, `2`, is therefore a small, falsifiable candidate OutGuess passphrase for p28. This is an exploratory receiver test only: the existing protocol audit says the DH result is DATA 2 and supplies no KDF, byte/rune serialization, cipher, MAC, or OutGuess selector. The test does not authenticate the DH interpretation as an OutGuess instruction.

### Exact original input and calibrated controls

- Carrier: `resources/liber-primus/45.jpg` (physical p28), SHA-256 `318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522`.
- Tool: OutGuess 0.4 from `resurrecting-open-source-projects/outguess` tag `0.4`, built with the same compatibility definitions used by the earlier p28 gate.
- Known-key positive: the existing keyed-probe script embeds and exactly recovers a 47-byte marker using key `79` on original `17.jpg`; SHA-256 of the recovered message is `762005b411d8e83b361f8196c5240016465dec12029800e74d46ab0413c44ecb`.
- Authentic default-retrieval controls: original LP1 scans `00.jpg` and `08.jpg` pass the script's known-content checks.
- Same-key synthetic no-payload control: the deterministic synthetic JPEG, tested with key `2`, returns a header-consistent 159-byte stream (seed `64913`, SHA-256 `1a7d45d2a20f92eecd0ebfb6992302704be44c056e2e45584d49529fbf365a12`) but no recognized payload. Thus a successful extraction status and internally consistent header/length are not authentication.

### Original p28 result

With the exact decimal key `2`, OutGuess returned status 0 and a header-consistent 6,411-byte stream: seed `48343`, declared length `6411`, SHA-256 `5b204eb7e5e1d075f2dc81afcb020424e6bde26ab23ee67283dd6dfe52bd5d0b`. Shannon entropy is `7.969202` bits/byte and printable fraction `0.392294`. The configured classifier found no PGP, ZIP, GZIP, PNG, or near-fully-printable payload (`recognisable=0`). The first 32 bytes are `d7bc0b19a876aeb7180315ef876f3492ec561f534196add37bbabd643c608110`; the last 32 are `7efe0eb5719ac98775ab4bba096971875936fc8b1e70d85f39dfb2454d88e33a`.

The output is high-entropy and non-textual, consistent with wrong-key OutGuess extraction. The header is not positive evidence: the separate all-58-image OutGuess study proves the encrypted four-byte header `ff ff ff ff` is source-forced under every password, and the same-key synthetic no-payload control produces a plausible length as well. No plaintext, file, key confirmation, or continuation destination was recovered. This is a bounded negative for the exact `OutGuess -k "2" -r 45.jpg` candidate, not a proof that p28 contains no steganography or that no other receiver exists.

## Decision

Retire the exact p28 OutGuess candidates tested here: default retrieval, the 16 phrase-derived keys, and decimal DH shared-secret key `2`. Do not broaden this into a blind password search.

The evidence supports a simpler local reading of READ OUT: it already has a direct manuscript consequence by selecting the **outer** H pair at the p28 page start, yielding HERE, while the independently recovered FOURTH D; H instruction selects the fourth D and produces GCD.

Do not broaden these negatives into “no steganography exists in p28.” OutGuess 0.4 is one historical tool, the original p28 JPEG cannot be round-tripped by this old encoder, and an unknown external key or different receiver remains logically possible. The DH23 tuple is structural/protocol context; the available source does not select OutGuess or define a key-derivation/serialization layer. The relevant decision is narrower: the exact `K=2` passphrase produces no recognizable payload, and there is no causal basis for further OutGuess password variants.

## Reproduction

- Earlier phrase-key gate: `.github/workflows/agent16-p28-outguess.yml` (OutGuess 0.4; upstream known-key positive).
- DH `K=2` gate: `.github/workflows/agent3-p28-dh-k2-outguess-manual.yml` and `sims/outguess_lp2_keyed_probe.cjs`.
- DH `K=2` Actions run: [45629435944](https://github.com/FlareZ123/liber-primus/actions/runs/45629435944), job `139258375593` (PASS; raw candidate and summary artifact `agent3-p28-dh-k2-outguess`).

