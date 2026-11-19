# 2013 Twitter-stage gematria artifact

## Pinned external archive

The useful reference is the `neuroretransmit/cicada` archive pinned at commit [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3):

- [2013 Twitter-stage README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/README.md)
- [`gematria.jpg`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/gematria.jpg)
- [`gematria.jpg.asc`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/gematria.jpg.asc)
- [`analyze_gematria.py`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/analyze_gematria.py)
- [2013 OS `prime_echo`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo)
- [2013 OS message](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/rootfs-contents/etc/skel/message.txt)
- [2013 OS launcher](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/rootfs-contents/etc/skel/cicada.sh)

The archive repository and helper scripts are later community preservation, not first-party Cicada source code. The pinned commit is dated 2024. Treat the original-stage image and preserved Twitter/OS content as puzzle artifacts, but do not describe the helper code or the archive repository itself as authenticated by Cicada.

## What the stage README says

The README documents a reconstruction chain for the 2013 Twitter stage: the ordered tweet hex stream is reconstructed as `twitter.bin`; XOR with the 761 audio artifact produces `gematria.jpg`; OutGuess extraction from that image yields `gematria.jpg.asc`, described as a PGP-signed whitespace payload.

The README describes the **visible image** `gematria.jpg` as a lookup table associating Elder Futhark runes, English letters and prime gematria values. The signed `.asc` payload is extracted from the image carrier; do not conflate that signature with a direct signature over the JPEG bytes.

The later `analyze_gematria.py` is a helper transcription of the visible table. Its English-to-prime mapping is:

| Input spelling | Prime value | Input spelling | Prime value |
|---|---:|---|---:|
| F | 2 | U / V | 3 |
| TH | 5 | O | 7 |
| R | 11 | C / K | 13 |
| G | 17 | W | 19 |
| H | 23 | N | 29 |
| I | 31 | J | 37 |
| EO | 41 | P | 43 |
| X | 47 | S | 53 |
| T | 59 | B | 61 |
| E | 67 | M | 71 |
| L | 73 | NG | 79 |
| OE | 83 | D | 89 |
| A | 97 | AE | 101 |
| Y | 103 | IA | 107 |
| EA | 109 | | |

This is 29 distinct prime values, with the shown spelling aliases. For GP29 indexing, the preserved LP2 corpus order `F,U,TH,O,R,C,G,W,H,N,I,J,EO,P,X,S,T,B,E,M,L,NG,OE,D,A,AE,Y,IA,EA` corresponds to these 29 primes in ascending order.

## 2013 OS linkage

The original OS message preserved in the archive contains the handle `@1231507051321`, **“THE KEY IS ALL AROUND YOU,”** and `3301`. The `prime_echo` launcher emits the prime sequence and pauses at 1033 and 3301. This is useful historical context for the later LP2 p49–p54 / Stage11 investigation.

Using the visible table, “THE KEY IS ALL AROUND YOU” maps to the 19 prime values:

`5,67,13,67,103,31,53,97,73,73,97,11,7,3,29,89,103,7,3`

Their sum is **931**. The separately preserved signed 2013 BASE29 protocol in this repository, `resources/external/2013-tcp-server-signed-source.md`, supplies the radix convention; (931=1\times29^2+3\times29+3=133). The original 2014 Stage11 index has `<title>133</title>` and `<div id="331">`. This is a cross-era locator hypothesis, not a proven p55 operation.

## Research caution

- The image is a reconstructed original-stage artifact according to the pinned archive; the archive's helper code is not first-party.
- The PGP-signed `.asc` payload is a hidden message extracted from the JPEG carrier; do not claim that the JPEG itself is PGP-signed.
- The 931→133 equality does not assign title/div roles, specify a p50 byte alphabet, or define a reversible p55 receiver.
- The phrase has 19 GP29 symbols and p55 has 76 runes (=4×19), but fixed periodic GP29/prime/totient key tests and the simplest 19-column transposition are negative; see `im-results/lp2-2013-all-around-19-rune-p55-key-gate.md`.
