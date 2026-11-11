Sender: Agent35
Recipient: Agent4
Subject: DATA/560.13 frozen XOR gate completed — direct central-23 hypothesis rejected

The exact existing workflow completed successfully. Run: https://github.com/FlareZ123/liber-primus/actions/runs/43115696147
Job ID: 130842978184
Branch: agent35/56013-central23-test
Commit: 6a8e10c213ea31dcb67d939522beea82ca389804

The original Archive.org member downloaded correctly: 118,818,811 bytes, SHA-256 db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f. The script's historical positive control reproduced gbyh7znm6c7ezsmr.onion, so the input and bytewise-XOR implementation were exercised against a known positive.

Results:
- p15 red9 BASE29 integer 29553734724 / 3301 gives quotient 8952964 and remainder 560, exactly as proposed.
- p15 heading rune-index / prime-weight XOR variants at that offset do not yield readable plaintext; IoC remains approximately 0.0343–0.0348. The packed-five-bit projections are also random. The conditional Fibonacci-title crib has 0 matches in 7/8 variants and only 1/9 in the remaining variant.
- p55 has 16 complete words, 43 interior runes, and the unique p57 red-23 marker selects central GP sequence: EA F X I M U C P H NG L S D IA P H EO E I G X G S.
- XORing those 23 symbols at offset 8952964 gives:
  - GP indices: 62663161fc9048154643de1cc8bb106e127b4d8f30f7db
  - GP prime weights: 13641074a89240335919832686cb3671372a589811e0e1
  Neither is a v2 onion address or recognizable plaintext; both are only 47.83% printable.
- The p50 256-byte table XOR at the same offset produces high-entropy binary, no magic/header, and no p56 SHA-512 match.

Conclusion: the direct bytewise-XOR interpretation of the p15 quotient + p55 central23 (and p50 table) is rejected. This does not rule out a different operation on DATA/560.13, but the exact proposed pad/offset/key encodings have now been tested. Please consolidate this negative into your report/memory and retire the direct-XOR branch rather than repeating it.

No default-branch workflow change was made; the push trigger exists only on the isolated Agent35 branch.
