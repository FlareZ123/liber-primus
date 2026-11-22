# Exact whole-corpus LP2 word-length permutation rank: a bounded negative

**Director Issue [#1472](https://github.com/FlareZ123/liber-primus/issues/1472), Agent9, 18 November 2026.** The unaltered printed LP2 word-length order, viewed as one canonical zero-based multiset-permutation rank and serialized as minimum unsigned big-endian bytes, produces an opaque **1,099-byte binary register** with no predeclared recognizable file/container header. The independent physical p0–p2 chapter similarly yields an opaque **58-byte** register. Both are exact reversible encodings of observed **ciphertext word lengths**, not recovered plaintext, an independently sourced key, or evidence of encryption by enumerative coding. The source lacks a rule selecting this receiver.

**Prior-art correction:** The identical whole-book canonical ascending-length lexicographic rank and its `d7758df1…` big-endian bytes were **already computed on 13 November 2026 by a previous Agent9 incarnation** in [the 80-orientation global/chapter exact-rank test](lp2-wordlength-multiset-rank-binary-gate.md). This 18 November implementation is an independently executed, narrower cross-check and pinned full hexadecimal artifact. It establishes **no novel original-cipher exclusion or newly discovered side channel**. The Director Issue #1472 should be treated as confirming existing evidence rather than advancing the cipher frontier.

## Exact original input and frozen interpretation

Read [the repository's LP2 community rune transcription](../resources/lp2-transcription.txt) through its canonical [`parseSharedCorpus`](../sims/lp2_word_pages.cjs). Preserve the original rune-bearing physical p0–p55 order, including the 32 words crossing physical page boundaries; page/line wrap does not break a word. End words on source `-`, `.`, `&` or other nonrune punctuation. The numerical p50 page has no rune-bearing words.

- Whole corpus: **12,956 GP29 runes, 2,896 complete printed words**, each of length 1–14. Input `lengths.join(",")` SHA-256: `00bd02e68a48b2f44a8edac927a5f97e8d7e4b37b1f9edf9448392fa75526494`.
- Exact multiplicities by increasing rune length: `1:83, 2:448, 3:720, 4:513, 5:317, 6:256, 7:216, 8:156, 9:78, 10:52, 11:32, 12:18, 13:4, 14:3`. Sum = 2,896.
- Single independently fixed short control: first physical chapter **p0–p2**, **729 runes in 158 words**. Multiplicities `1:5, 2:28, 3:36, 4:20, 5:13, 6:18, 7:17, 8:9, 9:6, 10:4, 11:2`. Input length-vector SHA-256: `30ac7c0d07c01a36879ab8d56b238c19852fadc90947addd99f9e72c90c229a2`.

For either scope, fix the original multiset and lexicographically order all of its distinguishable word-length permutations with smaller numeric length first. The total rank domain has \(M=N!/\prod_{\ell}n_\ell!\) elements. At every source word of length \(\ell\), with \(R\) slots left and \(M_R\) valid permutations of the remaining multiset, add \(M_R(\sum_{k<\ell}n_k)/R\) to the rank and update \(M_R\gets M_R n_\ell/R\). This is the ordinary exact enumerative code, with rank zero reserved for the lexicographically first ordering. The sole output is the rank as the **minimum unsigned big-endian byte string**, with no endian search, bit reversals, word offsets, key, seed, or alternative segmentation.

## Exact original output and discrimination

| Source register | Domain | Original rank | Output length | Leading bytes |
|---|---:|---:|---:|---|
| All unknown pages, 2,896 words | 8,792-bit domain; circa 8,791.876 bits capacity | 8,792 bits | **1,099 bytes** | `d7758df1640a621ac9d8f75d38a0813` |
| p0–p2, 158 words | 461-bit domain | 460 bits | **58 bytes** | `0f40367a9561dc41afc2146268f67a95` |

The **entire 2,198-character global rank** is separately pinned as [the exact big-endian hexadecimal artifact](lp2_wordlength_multiset_fullrank_be.hex). Its output bytes SHA-256 is **`68bbf7e7c3bdb90f0e941473abff21d6789a00d398228e531ea138715f78ad51`**; it ends with `...e8f8d9198b46433c606367456`. For p0–p2, the complete rank is:

`0f40367a9561dc41afc2146268f67a95dc1443ff98b2d55ac2d65ab5017f075f5f4640d7f879be95ce83ac7ca2275e5496dfc07b3ee1c5b94290`

Its byte SHA-256 is `4b79dfcd443cfd1a9cc364384841148d6f539caf0690692f6c2b2e7f9d5c58b0`.

The frozen full-width signature screen considers at least four-byte prefixes for PNG, JPEG/JFIF, GIF, PDF, ZIP, gzip, bzip2, xz, 7zip, zstd, SQLite, RIFF, ELF, ASCII-armored PGP, a DOS executable and ASN.1 DER. **Neither original byte register matches any signature.** This is a deliberately bounded header check; headerless compression or unrelated binary data cannot be excluded by it.

Whole-register byte Shannon entropy is **7.84494044 bits per byte**, against **7.79430894–7.85461967** in 64 deterministically seeded original-multiset shuffled permutations. The source rank deflates from 1,099 to **1,104** bytes under standard raw DEFLATE; the 58-byte chapter output has entropy **5.53462087**, within its own shuffled control range **5.39668983–5.77600018**, and raw-DEFLATE length **63** bytes. The byte-entropy measurements are consistent with arbitrary encoded ranks and do not demonstrate cryptographic randomness.

## Exact inverse and typed positive control

[`sims/lp2_wordlength_multiset_rank_sft.cjs`](../sims/lp2_wordlength_multiset_rank_sft.cjs) implements BigInt rank and unrank independently and requires that the complete original **2,896/2,896** and control **158/158** length vectors round-trip, including their original multisets. A planted 1,098-byte register with a complete PNG signature and deterministic remainder is mapped by unranking to an *entire valid 2,896-word permutation of original lengths*. Ranking that whole planted permutation restores its byte payload and recognizes its PNG prefix; the p0–p2 control runs the identical complete 57-byte planted test. This confirms the codec can recognize a typed object when one is deliberately present, without assuming the planted permutations represent Cicada plaintext. Both full tests pass on the original repository source in [Windows Node22 CI run 44300590081](https://github.com/FlareZ123/liber-primus/actions/runs/44300590081).

## Decision and boundary

The global permutation order contains ample mathematical capacity, but capacity is not an independently specified decoder. Under the one predeclared canonical enumerative code, the actual output has no recognizable typed container/key framing, no authenticated receiver that can act on the rune ciphertext, and no unknown-passage plaintext or held-out prediction. **Retire only this exact direct whole-rank→big-endian-file interpretation.** It would be reasonable to revisit enumerative coding if a new authentic manuscript/historical clue specifies the scope, a receiver, and a way of testing that receiver on original rune symbols. Do not rescue the current opaque stream with arbitrary XOR masks, endianness, bit rotations, scanning offsets, or retrospective segmentation.

Earlier [#1463](lp2-wordlength-global-code-source-selector-gate.md) established that source instructions do not independently name this register or its operation. This experiment reproduces one already-published canonical decoder output with an additional full hexadecimal fixture, leaving the prior source-selector judgment intact. The general LP2 unknown-page decryption status is unchanged.
