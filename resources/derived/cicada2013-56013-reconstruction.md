# 15,330-byte prefix reconstruction of Cicada 2013 `DATA/560.13`

**Classification:** derived binary reconstruction of a prefix, not a complete ISO extraction and not a directly archived original file. The local binary `cicada2013-56013-reconstructed.bin` contains only offsets **0–15,329** of the full CicadaOS dataset.

## Prefix inputs and derivation

The public `neuroretransmit/cicada` archive at immutable commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter) contains two 15,330-byte intermediate products: [`decoded.png`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/decoded.png) and [`560.13^decoded.png.bin`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/560.13%5Edecoded.png.bin). The walkthrough states that the second is the bytewise XOR of the beginning of `560.13` and `decoded.png`, so the local reconstruction is `560.13_prefix[i] = decoded.png[i] XOR 560.13^decoded.png.bin[i]`. The result is exactly **15,330 bytes**. The formula starts at byte offset zero; it does **not** reconstruct the rest of the full dataset.

## Full ISO file: distinct size and external coverage

The complete CicadaOS ISO member `DATA/560.13` is separately reported as **118,818,811 bytes**, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. The full file was recovered from `3301.iso` and tested in the external [pnotisdev/cicada3301 research](https://github.com/pnotisdev/cicada3301). The external record reports an initial 160-configuration/eight-offset negative and a later R28/L1 sweep at offset strides 16,384 and 331,777, including `keyskip2/pair` and N-scaled hit gates with planted controls ([status](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md); [coverage correction and exact hash](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/handoff/PARKED.md#p-3--data56013)). These are external results, not independently reproduced in this repository, and do not exhaust every offset or transformation. The 118 MB binary is not stored here.

## Historical offset-XOR positive control

The archived [third-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/README.md) gives dataset 13, offset **12821**, and data hex `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765`. XORing those 23 data bytes with the local prefix beginning at zero-based byte offset 12821 yields exactly `gbyh7znm6c7ezsmr.onion\\n`. This reproduces the documented 2013 offset-XOR result including its trailing newline. It validates the prefix bytes and offset convention used here; it does not validate bytes beyond offset 15,329.

## Scope of the local LP2 transfer test

`sims/cicada2013_56013_offset_xor_lp2_gate.cjs` tests four source-selected offsets **133, 331, 449, 1109**, all within this prefix, against the 2014 256-byte onion-2 timing string. It does not scan the full 118 MB. The external full-file tests above already cover several broad direct-pad and skip-aware families; do not repeat generic 560.13 pad sweeps without a new, independently source-selected offset or operation.
