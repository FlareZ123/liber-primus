# Historical 2013 Instar title as a native-OutGuess ARC4 rune stream on LP2 p55

**17 November 2026, bounded intermediate signal. The original p55 76-rune IOC rises from 0.037895 to 0.054737 with one precisely sourced 2013 password and the historical OutGuess ARC4 `Encryption` stream, interpreted as an additive GP29 pad. Only 1 of 10,000 independently generated wrong passwords matches this IOC. Yet the result is visibly nonlinguistic and a preceding 232-rune original page does not decode. This is neither established plaintext nor an authenticated cipher.**

## Source-motivated path

The original 2013 `761.MP3` title `The Instar Emergence` supplies a fixed complete password. The known, solved continuation after the terminal unknown LP2 page says `LIKE THE INSTAR TUNNELING TO THE SURFACE` and `SHED OUR OWN CIRCUMFERENCES`. OutGuess JPEG extraction is a documented historical Cicada operation; the exact source-title keyed p55 OutGuess extraction has been run separately and yields only a **source-forced pseudoheader** and no independently recognizable file ([direct extraction report](lp2-p55-2013-instar-title-original-outguess-gate.md)). This follow-on tests whether *OutGuess's actual ARC4 key stream* might instead act on the runes printed beside the image.

The precise candidate uses standard historical OutGuess 0.4 `arc4_initkey("Encryption", password)`: `MD5(ASCII "Encryption" || UTF8(password))`, 256-swap ARC4 KSA and canonical byte stream; for source GP29 symbols `c[i]` take `p[i] = (c[i] - (ARC4_byte[i] mod 29)) mod 29`. The unmodified p55 has **76 rune indices**, `resources/liber-primus/lp2-corpus.json`. There is no first-party evidence that Cicada intended this ARC4-to-rune projection, modulo29, key restart, or the subtraction sign. The MD5 key schedule is historically native; the proposed rune receiver is a separate hypothesis.

## Reproducible source input and exact output

Read-only, asserted [Node22 SFT](../sims/lp2_p55_instar2013_outguess_arc4_rune_gate_sft.cjs) uses the actual checked-in original LP2 corpus, original printed p55 word parsing, a complete 311,121-character Shakespeare reference, source-native p57 clear-GP re-encryption, and deterministic SHA256-derived wrong-password controls. [passing Windows original corpus, source-location and continuity run 44137326895](https://github.com/FlareZ123/liber-primus/actions/runs/44137326895).

| Register | Runes | Raw GP29 IOC | After exact key, restart from byte zero |
|---|---:|---:|---:|
| Original p55 `72.jpg` | 76 | 0.0378947368 | **0.0547368421** |
| Adjacent original p54 `71.jpg` | 232 | 0.0331392745 | **0.0362367518** |
| Original p54–55, one continuous key clock | 308 | 0.0338212276 | **0.0352172258** |
| Actual clear p57 (native comparison) | 95 | 0.0627099664 | No decryption required |

The first 40 decoded p55 GP indices transliterate as `Y H F G O G H A N F M NG T S EO M O G D G A H S EA T AE G H J TH H A G S N L TH S M H`. The entire 76-rune output has **H=10, G=10, EA=6**, with only E=2. These frequencies are unlike authentic p57 (E=15, G=1, H=1) and the output does not form meaningful GP prose.

The p54→p55 original physical page boundary actually occurs *within a printed word*: the p54 source ends with rune `Y` without a word-ending hyphen and p55 begins with rune `NG` before its first hyphen. This source continuity makes a brand-new ARC4 key clock at p55 an **unsupported assumption**. With the same title's historical stream starting at p54's first rune and consuming all 232 previous runes before p55, the terminal p55 IOC falls to **0.0336842105** (rather than 0.0547368421 with its stream restarted). This is a central objection to promoting the page-restarted signal as a real intended cipher.

The source-native positive plant re-encrypts and recovers **all 95/95** authentic p57 clear symbols. An unrelated-password null fixes the exact original p55 ciphertext and for each index `i=0…9999` derives the control key as SHA256 lowercase hexadecimal of `i:20261117` with five-digit zero-padded `i`. Of **10,000** keys exactly **one** gives IOC at least 0.0547368421, for an add-one conditional tail **0.00019998**, null mean **0.03441684** and null maximum **0.05543860**. An additional **original-source location holdout** fixes the same complete historical title, historical ARC4 derivation, byte-to-rune operation, direction and zero-start key clock while sliding a complete 76-rune window over *every contiguous within-page position* on the 55 rune-bearing unknown LP2 physical pages. Exactly **1 of 8,840 original windows** reaches or exceeds the original p55 IOC 0.0547368421, and that window is **p55 itself**; the strongest other window is **p33 offset85**, at IOC **0.05017544**. These overlapping windows are highly dependent and the key/receiver were already motivated by p55; **1/8,840 is a within-source rank, not a statistical p-value or multiplicative evidence factor**. This documents location specificity while leaving the decoding failure decisive.

The test is conditional on *this already selected key, cipher sign, receiver and 76-rune page*. It is **not a discovery-wide p-value**, given earlier key experiments and the unvalidated choice of byte projection.

### Clear-language and word-shell controls

A trigram count model trained on the existing Shakespeare 300k reference gives native authentic p57 clear GP29 a log-count score **4.36947 per three-rune window** while the proposed p55 result scores **−1.25191**. The strongest of frozen simple **4×19 row/column readouts and 29 Caesar offsets** improves only to **−0.33685**, still far below the authentic clear control. These operations are tested solely as bounded sanity checks; none was specified by a first-party puzzle clue.

The original p55 contains **17 page-local rune groups**, the first a single `NG` continuing an unfinished printed group from p54. Treating those 17 local groups as if they were complete words and removing each first and last rune yields **43 inner** and **33 shell** rune positions. Therefore the 43/33 test is a page-local diagnostic rather than a fully authenticated whole-word parse. The decoded-then-shed inner IOC is **0.04761905** and decoded shell IOC **0.05681818**. The source-cued opposite order, **shed first and apply this exact ARC4 stream to the 43 interior runes**, gives **0.03543743**, close to uniform. Neither path yields recognizable clear text. This matters because the original solved PARABLE explicitly suggests shedding a circumference; the actual clue-order operation fails under this candidate.

## Decision and limits

The exact title's short original terminal-page IOC spike is statistically uncommon under the frozen wrong-password control and is preserved as a **reproducible anomaly**. The full reversible decoder is known but fails the direct native GP29 plaintext and adjacent-page tests. It gives no authentic key material beyond the already published title, no message, no credible secret file and no destination.

**Do not promote this to `results/` or pursue an invented second cipher to rescue the number.** A productive follow-up would first recover a *separate Cicada-authenticated instruction* specifying how the 2013 title's ARC4 bytes should map to rune positions, or an independently predictable original clear interval under the same operator. Without that, prioritize distinct source-authenticated key acquisition or a complete original-cipher inverse over modifying the byte modulus, shift, transposition, or page phase.
