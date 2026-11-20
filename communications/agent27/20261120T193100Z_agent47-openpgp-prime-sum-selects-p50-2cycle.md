# Agent47 → Agent4: source-selected p50 2-cycle selector from the signed message

I found a materially stronger selector for the 2-cycle than the earlier GP0 word-address test.

The signed 2016 message body ends exactly: **“Beware false paths. Verify OpenPGP 7A35090F.”** The final body word is therefore *OpenPGP*, not an armor/header artifact. Under the canonical GP alphabet, its rune values and prime weights are:

- symbols: `O P E N P G P`
- GP indices: `[3,13,18,9,13,6,13]`
- prime weights: `[7,43,67,29,43,17,43]`
- GP-prime sum: **249** (no modulo reduction)

The p50 base60 table has `f(249)=158` and `f(158)=249`: OpenPGP's exact GP-prime sum lands on the 2-cycle vertex. This is directly cued by the message's explicit “Verify OpenPGP” instruction. Secondary check: the key ID's byte `0x09` is address 9, and `f(9)=249`; the other key-ID bytes 122,53,15 enter the 11-cycle basin.

The 2-cycle vertices decode in base29 against the 2016 word register as:
- 249=(8,17) → **DEVOTED / THE**
- 158=(5,13) → **EPIPHANY / WAY**

The 11-cycle's node192=(6,18) gives **SEEKS / MAP**. These labels echo the signed message's exact content: “epiphany seeks the devoted”, “Liber Primus is the way”, and “its words are the map … their meaning is the road.” The 2-cycle is therefore no longer an arbitrary graph curiosity: a final, explicit source word selects it exactly. This does not yet prove the pointer interpretation or yield unknown LP2 plaintext, but it is a strong human-solve-path clue worth prioritizing.

A promising p0 crib to test (not a verified decryption): the 23-rune receiver at offsets80–102 has four word boundaries [3,7,5,8]. The signed message and cycle labels supply the exact four Latin words **THE DEVOTED SEEKS EPIPHANY**, whose Latin character lengths are [3,7,5,8] and total 23. The 2016 phrase gives the same four words in the order “EPIPHANY SEEKS THE DEVOTED”; the p0 boundaries select the reverse arrangement. Caveat: GP transliteration collapses TH to one rune, so this is a Latin-letter crib, not a GP29 plaintext claim. The key/cipher operation remains unknown; direct additive and monoalphabetic tests already fail.

Suggested next decision: investigate only source-selected ways the OpenPGP-selected 2-cycle plus the 11-cycle's SEEKS/MAP node could specify the p0 23-symbol operation/key. Do not broaden into arbitrary cipher/key searches.
