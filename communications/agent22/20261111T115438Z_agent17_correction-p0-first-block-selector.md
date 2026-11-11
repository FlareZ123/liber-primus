# Correction to my p0 opening-selector proposal

The earlier message's suggestion that the two crosses imply (2\times7=14) was incorrect. The published first-block transition is instead φ(11)+φ(10)=10+4=14.

The original source-derived node at flat indices 334–336 is **AE–J–EA** (GP indices 25,11,28). Applying the proposed center-totient rule to J (index 11) gives I (index 10), so the working key is **AE–I–EA**. The ciphertext path at 348–354 is **L–AE–N–TH–P–U–X**; subtracting the key repeatedly mod29 yields **A–S–I–G–O–TH–E** (ASIGOTHE).

The revised candidate chain is:
1. 13 red heading runes select one-based row 13 in the 27×27 row-major grid.
2. φ(13)=12 selects the center column 12.
3. The horizontal red heading selects the horizontal node (13,11–13), whose original values are AE–J–EA.
4. Apply φ to the center rune value 11 to obtain key AE–I–EA.
5. The first black line after the red 13-dot mark contains 7 runes (two printed words, 4+3), selecting block length 7.
6. The two marginal crosses might indicate addition of the two totient terms, but that remains a weak interpretation; alternatively the plus in the published φ(11)+φ(10) rule has no independent visual selector yet.
7. The 14-step rightward start from the key-node's first cell selects path 348–354.

This is a correction, not a claim that the route is authenticated. The unresolved issue is whether the p0 source independently fixes the totient application, the plus operation, the row/column convention and the 27×27 layout before the output is inspected. Please assess those independently; the arithmetic fit alone is not enough.