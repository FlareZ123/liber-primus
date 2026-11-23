# Terminal 75+180 GF(256) Reed–Solomon: all-secret original alphabet obstruction

**Agent33, 23 November 2026. Exact, original-source, key-independent exclusion of one concrete terminal-code architecture.** This work recovers **no unknown LP2 plaintext, creator-selected key, or continuation destination**. It tests a new recipient, the terminal **rune tape itself**; the older [p50 RS report](lp2-p50-rs255-original-codeword-gate.md) instead tested the printed 256-byte grid as a codeword.

## Human-visible cue and proposed inverse

Original p55 contains **76 unknown GP29 runes**. Original p56 has **85 solved ciphertext runes**, and original p57 has **95 clear runes**. Separately, the original pp49–51 field has **256** byte-shaped cells, and p57's PARABLE asks the reader to *shed our own circumferences*. The first p55 rune also continues a word across the p54→p55 physical page seam. If **one** p55 rune is treated as a boundary/control symbol, the remaining source tape has exactly **75 + 85 + 95 = 255 runes**, the conventional full length for a GF(256) Reed–Solomon codeword. Earlier Cicada QR stages had used Reed–Solomon error correction. These observations motivate a sharply defined decoder question.

Suppose the terminal 255-rune sequence is an **RS(255,180) codeword** with 75 parity symbols and 180 recoverable known symbols. A straightforward inverse would use p56 and p57 to recover or confirm the missing parity. There is no authenticated original instruction to use RS, drop that one rune, place parity first, turn GP runes into bytes, or choose either page-56 cipher/plaintext register. Such a source-selected operation remains the decisive missing premise.

Rather than assume the standard GP ordinal-to-byte mapping, grant the attacker an **arbitrary SECRET injective map of all 29 GP rune identities into GF(256)**. The same rune gets the same byte throughout the codeword, but the map can be any of more than 256!/227! possibilities. If no such secret map works, every ordinary fixed byte encoding, keyed alphabet, and affine relabeling fails as well.

## Key-independent original-codeword theorem

Let original 255-rune labels be \(c_0,\ldots,c_{254}\in\{0,\ldots,28\}\), and let \(v_s\in GF(256)\) be the entirely unknown byte value associated with symbol \(s\). For a conventional primitive element \(\alpha\), every RS parity root \(k\) imposes

\[
0=\sum_{i=0}^{254} v_{c_i}\alpha^{k(254-i)}
 =\sum_{s=0}^{28}A_{k,s}v_s,\qquad
 A_{k,s}=\sum_{i:c_i=s}\alpha^{k(254-i)}.
\]

The **entire unknown 29-value byte codebook** is thus a solution to a small linear system over GF(256). No linguistic assumption, known byte mapping, key seed, or guessed plaintext is involved.

Check both ordinary consecutive-root conventions, \(k=0,\ldots,74\) and \(k=1,\ldots,75\), with QR's GF(256) polynomial **0x11d**, primitive element **2**, and AES's GF(256) polynomial **0x11b**, primitive element **3**. Test original sequence order and its reversal. At p56, independently test the **actual printed 85 ciphertext runes** and the **85 independently solved plaintext runes**, exactly reproduced by the known p56 prime-minus-one/F-bypass decoder. For maximal generosity, omit **every possible one of the 76** original p55 positions, including the physically natural first-rune seam. This is **2 fields × 2 orientations × 2 root starts × 2 p56 representations × 76 omission sites = 1,216 exact original configurations**.

Only the first **30** source roots (start 0) or **29** roots (start 1) are needed to reach the maximum possible rank in every case:

| Original terminal register | Omitted p55 site | Distinct surviving GP symbols | Matrix rank with roots starting at 0 | Matrix rank with roots starting at 1 |
| --- | --- | ---: | ---: | ---: |
| p56 original ciphertext + clear p57 | Any of 76 | 29 | **29** | **28** |
| p56 authenticated plaintext + clear p57 | 74 of 76 sites | 29 | **29** | **28** |
| p56 authenticated plaintext + clear p57 | Sites 63 or 71 | 28 | **28** | **27** |

Each entry holds under **both field bases and either physical direction**. When the decoded p56 register is used, the special omission sites remove respectively the only surviving original terminal OE or J; their absence is explicitly accounted for.

**Consequence for the unknown mapping:**

- A root at \(\alpha^0=1\) gives rank equal to the number of GP labels that actually occur. All those occurring labels are forced to **byte 0**. Thus no injective map is possible.
- Roots starting at \(\alpha^1\) give rank exactly one less than the number of occurring labels. A **constant assignment** is always a null vector because \(\sum_{i=0}^{254}\alpha^{ki}=0\) for every \(k=1,\ldots,75\). Since the kernel is one-dimensional on the occurring labels, **all occurring labels must map to the same byte**. Again, no injective map is possible.

The ranks exhaust the nullspace, so **the later 45 or 46 roots cannot rescue a map**. This directly rejects every stationary injective 29-rune-to-GF256 labeling under the declared RS(255,180) architectures, even with completely secret label choices and any p55 omitted rune.

## Genuine encoded positives and reproduction

The standalone [Node22 CommonJS SFT](../sims/lp2_terminal255_allsecret_rs_source_gate_sft.cjs) parses the original canonical corpus, independently validates all 85 p56 plaintext GP runes using the authentic prime-minus-one decoder and its transparent F at position 56, enumerates the full 1,216 original cases, and checks each matrix rank.

A **nonzero, injective three-symbol** 255-position, period-three RS codeword is independently planted: under root start 0 its three distinct GF256 byte labels are 7, 11, 12; under root start 1 they are 7, 11, 31. Both true plants have **all 75 required zero syndromes in both fields**. This confirms that the detector recognizes genuinely nonconstant RS codewords rather than merely rejecting all inputs. The original sources remain unchanged. The exact standalone test passed on [Windows Node.js 22 CI run 45155022653](https://github.com/FlareZ123/liber-primus/actions/runs/45155022653).

## Research decision

**Retire a complete conventional RS(255,180) codeword directly on the printed terminal rune identities** under any stationary secret injective rune-to-byte alphabet, both standard GF(256) bases, standard roots, either direction, and either authentic p56 text register. The "75 after one-rune seam +180 known" coincidence no longer justifies trying more alphabet keys for this model.

This result does **not** exclude an RS code after a source-defined transposition or stream cipher, page-private nonstationary byte maps, nonstandard parity locations, modified evaluation points, separately encoded parity bytes, or other binary receivers. Those require independent original evidence. In particular, **no unknown p55 runes have been deciphered**; the result changes a precise branch decision and nothing beyond it.
