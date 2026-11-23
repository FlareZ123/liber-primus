# p55 coprime-interior selector: a 29-rune key candidate

**Status: the source-derived selector remains provisional; its one frozen, native OpenPuff v4.00 seven-JPEG receiver is experimentally rejected (23 November 2026). No p55 plaintext or authentic key was recovered.**

## Human solve-path hypothesis

Three visible pieces of the manuscript can be read as one instruction chain:

1. Solved p7 explicitly says that the **totient function is sacred**.
2. Solved p57 says to **shed our own circumferences** and find what is within.
3. Original p55 has 16 complete printed words beginning on that page, with visible word boundaries and rune lengths that can serve as the totient inputs.

A plausible human operation is therefore: for each complete p55 word of length n, discard its first and last runes, then select only strict-interior positions i whose one-based index is coprime to n. Euler's totient counts the integers in 1,...,n coprime to n. For n>1, position n is not coprime, while position 1 is the removed first boundary; consequently the number of selected interior positions is exactly phi(n)-1.

This is a plausible source-constrained reading, not a uniquely compelled instruction: the pages do not literally say “select positions coprime to each word length.” The important difference from an arbitrary key search is that the mathematical operation is selected by the explicit totient and circumference language, and it makes a locked prediction about the number of selected runes.

## Exact original-data derivation

The original p55 image is resources/liber-primus/72.jpg. It contains 76 runes: one initial rune completing a word carried from p54, followed by 16 complete words beginning on p55. The complete-word lengths, reproduced using the original page/word parser, are:

[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]

For these lengths:

- Total strict-interior runes: sum(n_i-2)=43.
- Totient sum: sum(phi(n_i))=45.
- Coprime strict-interior selector count: sum(phi(n_i)-1)=29.
- The 29 selected runes are a subset of the 43 interiors; 14 interior runes remain unselected.

The correct arithmetic matters: sum(phi(n_i)) is **45**, not 43. The 43 count belongs to all strict interiors. This is not a totient-based resegmentation of 43 runes.

Per-word selected counts are:

[1,0,0,1,1,0,11,1,1,0,5,5,0,1,1,1]

The selected GP29 indices in original word/position order are:

[10,2,5,28,0,14,10,19,1,5,13,8,21,20,13,12,18,10,6,14,6,15,12,2,2,18,5,11,18]

The historical base-29 alphabet 0123456789ABCDEFGHIJKLMNOPQRS serializes those 29 indices as:

**A25S0EAJ15D8LKDCIA6E6FC22I5BI**

This 29-character string is a **candidate key/password**, not plaintext. Reproduction and exact word-boundary checks are in [sims/agent43_p55_coprime_interior_key.py](../sims/agent43_p55_coprime_interior_key.py).

## Bounded check against the p56 digest

The p56 page gives the 128-hex-character target:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

The page does not independently specify the hash algorithm; SHA-512 is only the natural interpretation of a 128-hex digest. Under that interpretation, three direct representations of the candidate do not match the target:

- Base29 ASCII password (29 bytes): SHA-512 = 5abee1eb4bc9c937cd58976d4d28436199f26b5f61ac78402ede3876ec6c70c2f64c3b459010baf18406022901bf88a33304bcaca63581e83de65b98518e6d1b
- GP transliteration (36 ASCII characters): SHA-512 = 521bb48376d75912c49f55673af81816c975620cec29647a0e30d440fc7eb7012b7a26185fbde9920c6694d3c98b59be759999f76ec0b8d42064c4aa281c6fe5
- Raw selected runes encoded as UTF-8 (29 Unicode code points): SHA-512 = 34b167601f2ac0e1b10a92b8117131ffda353d756e53c4d673d88f55ae6d562edc1cd2efee9159963d0c636caf201baf73627930200ea24861b6015dd538438a

This rejects only the idea that one of those exact strings is itself the p56 SHA-512 preimage. It says nothing about the candidate as a password for another receiver, and it does not establish that SHA-512 is the specified algorithm.

## Bounded check against the 2016 signed-word map

The authenticated 2016 message contains 43 alphabetic words under its preserved source segmentation. Its text says that LP's words are the map and their numbers are the direction. One natural reading of the new 29-rune selector is to use its GP29 indices as zero-based addresses into that 43-word list.

The resulting 29-word readout is:

Primus path epiphany the Hello Its Primus their The epiphany way devoted is meaning way the map Primus seeks Its seeks words the path path map epiphany is map

It is not a coherent instruction or sentence. This rejects that exact direct-address interpretation. The broader 43-interior GP0/prime direct-address family was already rejected in [the 2016 43-word gate](lp2-p55-signed2016-43word-core-original-gate.md); that gate did not test this 29-selected subset or a step walk.

A second natural reading of “numbers are the direction” is to use the 29 GP indices as step lengths through the 43-word map: start at the first word (“Hello”), advance forward by each value, and wrap modulo 43. The resulting readout is:

Primus the the path path are numbers path lies devoted is direction the are paths Liber are luck Hello Its meaning found empty seeks devoted numbers and OpenPGP the

This is not coherent. It rejects that one frozen forward cyclic walk. No reverse, alternate-start, alternate-wrap, or other walk variants were tested; do not turn this into a search.


## Frozen native OpenPuff seven-JPEG experiment, completed 23 November 2026

The previously proposed distinct p55-derived password **`A25S0EAJ15D8LKDCIA6E6FC22I5BI`** was tested exactly once with original OpenPuff v4.00 on the original **seven** contiguous cuneiform JPEGs `resources/liber-primus/50.jpg` through `56.jpg`, in published order; A-only, B/C disabled, JPEG Medium `1/5 (20%)`. The original executable and DLL were pinned to Git blob hashes, and the workflow verified all seven carrier entries and selected bit setting. The same Windows run recovered the exact **35-byte** independently published JPEG OpenPuff positive before testing the LP2 originals.

**Observed native result:** `native-corrupted-stream`, original GUI `Task interrupted - Error: Task stopped: corrupted stream`; `carrier_count=7`, `output_present=false`, `outputs=[]`. The workflow succeeded *as a completed test*, while this frozen candidate yielded **zero recovered files**. [Run 45127092305](https://github.com/FlareZ123/liber-primus/actions/runs/45127092305) · [source-original GUI evidence artifact 14796043501](https://github.com/FlareZ123/liber-primus/actions/runs/45127092305/artifacts/14796043501) · [manual-only workflow](../.github/workflows/openpuff-v400-lp2-cuneiform-topdown-source-probe.yml), mode `seven-chain-p55-coprime`.

**Decision:** reject this exact p55 password → OpenPuff seven-JPEG Medium receiver. The coprime-interior extraction remains a mathematically reproducible candidate rule, but its independently necessary historical password, source-p55-to-carrier handoff, and explanation of the other 47 source runes are missing. Do not vary carrier order, subset, depth, key, or selector to rescue this negative without a new independent source instruction. Earlier 2014-derived passwords remain distinct already-closed contracts.

## What this does not establish

- It does not decode the 29 selected runes into English.
- It does not account for all 76 p55 runes, including the inherited p54 carry and the 14 unselected strict-interior runes.
- It does not provide a reversible p55 ciphertext/plaintext mapping for the 33 exterior runes or satisfy waiting [Issue #41](https://github.com/FlareZ123/liber-primus/issues/41).
- It does not rescue the separate all-position, depth-totient, two-edge-sum codec rejected in [lp2-p55-whole-word-symmetric-totient-gate.md](lp2-p55-whole-word-symmetric-totient-gate.md).

The frozen OpenPuff receiver is closed; do not repeat or vary it. The 29-rune selector remains only a source-paired extraction hypothesis. Any further use requires a distinct first-party instruction selecting a different reversible receiver; absent that, retire the selector rather than search over transforms.
