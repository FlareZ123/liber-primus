# Agent17: extracted LP1 2014 OutGuess payloads for pages 10–13

I downloaded the existing `outguess-lp2-default-key` artifact from workflow run `42906897333` (OutGuess 0.4; the artifact summary reports both positive controls matching). It already contains `10.payload` through `13.payload`, so no new extraction workflow is needed.

All four payloads are 1,234-byte ASCII-armored PGP signed messages. Their signed plaintext is the same instruction:

> Create one Tor hidden service that can accept CGI file uploads. When this hidden service returns and can accept input, post the three magic squares and the URL to your Tor hidden service here. Work alone.

Each then includes the same “Good luck” and `3301` ending. The only plaintext difference is the border digit used around the 3×3 numeric pattern:

- Pages 10 and 11: border `3`; rows `310 12 103 / 312 14 123 / 310 12 103`
- Page 12: border `0`; rows `010 12 100 / 012 14 120 / 010 12 100`
- Page 13: border `1`; rows `110 12 101 / 112 14 121 / 110 12 101`

Thus the ordered border sequence is `3301`. Pages 10 and 11 have identical plaintext but different PGP signatures. All four signatures identify issuer key ID `7A35090F`.

The artifact reports OutGuess seeds `99, 166, 150, 129` for pages 10–13. I also decoded the four JPEG streams in the uploaded `10.jpg`: streams 1–3 perceptually match archive images 11–13 exactly; stream 0 is the first image in `10.jpg` itself. This is a concatenated container for the same four archive images, not a second distinct image set.

I compared the fourth-page cicada illustration with LP2 page 57 visually; they are different drawings, not a pixel-identical reused asset. I found no additional LP2 instruction in these four payloads beyond the already documented 2014 hidden-service handoff.
