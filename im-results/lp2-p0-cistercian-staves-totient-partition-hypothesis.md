# LP2 p0 staves: Cistercian candidate rejected; 3|3 branch-rune lead

**Current status: the Cistercian 1133/3311 interpretation is not supported by independent visual audit. The better live hypothesis is a 3|3 branch/cipher-rune reading, still unverified. No plaintext has been recovered.**

## Established visual observations

The two wood-like marginal stave motifs on original LP2 images `resources/liber-primus/17.jpg`–`19.jpg` are repeated essentially identically across pages 0–2 and are 180-degree counterparts. The repeated-crop test is reproducible with `sims/lp2_p0_stave_repetition_sft.py`.

Agent4's independent audit (`communications/agent2/20261126T0416Z_agent4_p0-stave-visual-audit.md`) identifies **three genuine transverse members** crossing the upright, each protruding on both sides: a 3|3 branch pattern. The audit does not find a defensible four-quadrant Cistercian stroke assignment. In particular, the proposed 1133/3311 readings require assigning or ignoring an ambiguous central member and should not be treated as observed numerals.

## Why the Cistercian arithmetic is not evidence

The previous manual hypothesis read the pair as 1133 and 3311, yielding 3311=7×11×43, φ-factor values 6,10,42, and a conditional gcd of the two totients equal to 60. Those arithmetic identities are correct **if the manual numbers are assumed**. The visual premise is not established, however, and the resulting 6/10/42 page partition, (17,42) section address, and gcd-60/base-60 connection are therefore numerical coincidences until an independent glyph reading supports the numbers.

Do not use these calculations to support the old p0/base-60 address hypothesis. The conditional arithmetic reproducer `sims/lp2_p0_cistercian_staves_totient_partition_sft.cjs` is retained only to document what follows from the rejected manual assignment; it is not an image recognizer or evidence for the assignment.

## Better live hypothesis: Younger Futhark branch/cipher runes

A branch-rune system represents a rune by two coordinates: ætt/group and position within that group. In branch runes, strokes on the left of the vertical stave indicate the ætt; strokes on the right indicate the rune's position. See [Cipher runes](https://en.wikipedia.org/wiki/Cipher_runes) and the [Nordiska museet / Uppsala University discussion of cryptic runes](https://www.runforum.nordiska.uu.se/blog/cryptic-runes/).

The cryptic Younger Futhark order documented in the latter source is:

```text
tbmlʀ / hnias / fuþork
```

In that order, group 3, position 3 is **þ**. The observed 3|3 branch count therefore has a specific candidate reading: **3:3 → þ / TH**. Agent4 also reports that the first black rune on LP2 p0, immediately after the red heading, is TH. A visual check is consistent with that reading, but the first-black-rune transcription should still be independently verified against the original image.

This is a much more economical explanation of the three transverse members than the Cistercian assignment. It also makes direct contact with the manuscript's GP29 thorn rune. Important caveats remain:
- The cipher-rune order is a Younger Futhark convention, whereas Gematria Primus is an Anglo-Saxon-derived 29-rune alphabet. The shared thorn symbol does not establish that the entire alphabets or cipher systems are interchangeable.
- The two staves are 180-degree counterparts; because both branch counts are 3, both would encode the same 3:3 coordinate. This is consistent with a repeated hint but not proof.
- Alternative historical row orders and branch-rune variants exist. The exact source-selected order must be justified, not chosen because it yields TH.

## Decisive next tests

1. Independently transcribe the first black rune on p0 from the original image and confirm whether it is TH.
2. Compare the exact 3|3 stave geometry against a primary or well-documented branch-rune chart. Verify which side encodes ætt and which encodes position, and whether the documented reversed Younger Futhark order is the historically appropriate one.
3. Check whether the same 3|3 motif is intended to identify a rune, a page-level instruction, or a key. Do not assume it encodes every page's first rune.
4. Test only source-selected consequences of the 3:3→þ reading. Avoid enumerating arbitrary aett orders, orientations, and page addresses.
5. Keep the Cistercian/totient branch closed unless a new independent visual reading establishes all four quadrants.

**Current conclusion:** repeated 3|3 branch morphology plus the documented cipher-rune coordinate system is the strongest live interpretation. The 3:3→þ match is a specific, falsifiable clue, not yet a decipherment.
