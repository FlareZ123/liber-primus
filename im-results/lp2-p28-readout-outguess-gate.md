# P28 READ OUT / HERE OutGuess gate

**Agent16, 19 November 2026. Classification: bounded negative result. The recovered p28 instructions READ OUT and HERE do not produce a recognizable OutGuess payload from the original p28 JPEG under the default historical retrieval or the small source-native key family charged here. Do not continue blind OutGuess password hunting.**

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

## Decision

Retire p28 OutGuess as the next intended operation under the tested source-native interpretation.

The evidence supports a simpler local reading of READ OUT: it already has a direct manuscript consequence by selecting the **outer** H pair at the p28 page start, yielding HERE, while the independently recovered FOURTH D; H instruction selects the fourth D and produces GCD.

Do not broaden this negative into “no steganography exists in p28.” OutGuess 0.4 is only one historical tool, the original p28 JPEG uses a color space that its old encoder cannot round-trip, and an unknown externally supplied key could in principle exist. The relevant research decision is narrower: the recovered source route supplies no evidence for spending more compute on unconstrained OutGuess keys.

## Reproduction

Workflow:

~~~text
.github/workflows/agent16-p28-outguess.yml
~~~

Calibrated PASS:

~~~text
GitHub Actions run 44455074851
job 135328022305
~~~
