# P15 spiral → original 2013 Instar audio → p50 AES-128: exact source-selected byte receiver

**Agent 1, 23 November 2026. Conditional original-input negative.** No LP2 unknown plaintext, source-authenticated key/decoder, hidden file, or destination was recovered. This is one closed source-driven hypothesis, not an AES family sweep.

## Reconstructible human route and missing instruction

- The solved physical LP2 p57 PARABLE reproduces the earlier Cicada-published 2013 `761.MP3` ID3 user-text poem. That 2013 audio is a historically real byte-level XOR operand, and the identical poem makes the file a specific plausible cross-round key source.
- Physical LP2 p15 contains exactly 16 printed decimal values in a known red-origin four-neighbour spiral. Their established derivation is `abs(3301-prime(F(n)+1))`, with the red `3299` first. Reading the **printed values themselves as zero-based audio byte offsets** gives one reproducible 16-byte key, in original spiral order. All addresses lie inside the 4,010,732-byte original source MP3.
- Physical LP2 pp49–51 display the separately established **32×8 base-60 byte panel**. Exactly 256 bytes comprise 16 complete AES-128 blocks, suggesting one direct receiver: AES-128-ECB decryption, with no IV, key schedule tuning, extra byte permutation, secret phase or searched offset.

The weakest premise is decisive: **no Cicada-authenticated source explicitly says to interpret the p15 printed numbers as audio byte addresses, select AES-128-ECB, or decrypt the table**. These are one analyst-specified typed bridge, not facts established by the artwork.

## Executed original source result

The verified source MP3 has 4,010,732 bytes, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. The original row-major panel has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The frozen original spiral offsets are:

`3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`

Those exact original audio bytes give the proposed AES key `dcb150b90ddcd7e994f8521e8000413b` (hex). AES-128-ECB decryption of the **unchanged 256 bytes** yields SHA-256 `bfe40acf99e0b82535deb757c1c8231285d7584fe69aabc57d4cae528f92aeec`. The first 32 output bytes are:

`28baacc1a66bc42eb59a4adf9214157a98e0de51b111a3f2a8d1cbea86071371`

Only **97/256 = 37.890625%** bytes are printable ASCII/whitespace; the longest printable run is **4**, compared with **5** in the original untouched grid. The output begins with hex `28 ba ac c1`, no common recognizable file magic, and no sustained ASCII or source-native GP29 values. The original panel and the decoded output are both high-entropy-looking byte streams. This is an **unsuccessful direct plaintext receiver**, not a theorem excluding every possible encrypted binary format.

The AES code re-encrypts the entire decoded output to reproduce all **256/256 original grid bytes**, and a real solved-p57-text AES plant recovers all **256/256 UTF-8/ASCII test bytes**. Those exact round trips establish implementation correctness only; they cannot authenticate the conjectured historical chain.

## Decision

The p15 red spiral, 2013 poem/source audio, and p50 byte panel are individually real, source-selected artifacts, but the proposed bridge **does not yield a readable original output**. Stop this one AES-128-ECB key-address transfer; further audio offsets, source-file starts, endian orderings, IVs and cipher variants would be post hoc unless independently motivated by an original clue. Direct source-indexed original MP3/p50 byte-zero XOR was separately rejected in `im-results/audio761-original-grid-xor.md`; this experiment uses a different source-selected 16-byte acquisition rule.

**Exact read-only Windows Node22/CommonJS SFT:** [`sims/lp2_p15_audio761_spiral_aes128_p50_sft.cjs`](../sims/lp2_p15_audio761_spiral_aes128_p50_sft.cjs). **Original-source PASS:** [GitHub Actions run 45160493753](https://github.com/FlareZ123/liber-primus/actions/runs/45160493753), committed source SHA `a096277efd5027d0a5388ea4ed2be47f61d52601`.
