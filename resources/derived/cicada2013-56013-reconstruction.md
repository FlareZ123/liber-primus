# Derived reconstruction of Cicada 2013 `560.13`

**Classification:** derived binary reconstruction, not a directly archived original file. Do not cite this as an independently acquired ISO image.

## Inputs and derivation

The public `neuroretransmit/cicada` archive at immutable commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter) contains two 15,330-byte intermediate products:

- [`decoded.png`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/decoded.png), blob `fd1052f8ae704cad8dcf005759182f39631fb187`;
- [`560.13^decoded.png.bin`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/560.13%5Edecoded.png.bin), blob `5eaf7e1129e75b2f3af2069c8a56bdb1d00c1d22`.

The archive's 2013 Twitter walkthrough states that the second file is the bytewise XOR of `560.13` and `decoded.png`. Therefore this file is reconstructed as:

```text
560.13_reconstructed[i] = decoded.png[i] XOR 560.13^decoded.png.bin[i]
```

The result is exactly **15,330 bytes** and is stored beside this manifest as `cicada2013-56013-reconstructed.bin`.

## Historical offset-XOR positive control

The archived [third-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/README.md) gives dataset 13, offset **12821**, and data hex `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765`. XORing those 23 data bytes with the reconstructed file beginning at zero-based byte offset 12821 yields exactly:

```text
gbyh7znm6c7ezsmr.onion\\n
```

This reproduces the documented 2013 offset-XOR result including its trailing newline. It validates the reconstruction against a separate known message and confirms the offset convention used here.

## Limitation

The source archive does not directly store the original `560.13` file; it is reconstructed from the two published intermediate outputs. This derived copy is suitable as a reproducible research input, but its evidentiary status remains distinct from an original ISO extraction.
