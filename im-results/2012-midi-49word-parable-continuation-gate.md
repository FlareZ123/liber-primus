# 2012 MIDI 49-word payload → 2013 PARABLE: source-gated continuation test

## Decision

**Bounded negative for Director Issue #140.** The original 2012 source gives the 49-word list a complete local purpose: encrypt it, sign it, and email it to Cicada. The list itself contains no exact shared word or consecutive two-word phrase with the 19-word p57 PARABLE body, and no source-visible reference to the 2013 `761.MP3` or PARABLE. No original instruction selects a 49→19 mapping. Retire this direct cross-round continuation unless a new primary source supplies that missing instruction.

## Frozen 2012 source payload

Pinned archive: [`neuroretransmit/cicada` commit `b13600373d3400d75ec4208198019f3d92a304dd`](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle).

The original `words.txt` (Git blob SHA-1 `4351148626eaaed6854713b0c037fc3cdedff6f1`, 292 bytes) is exactly:

```text
muscle drop pump knee birdwatch bell ball hammer pocket hook house brake feather knot ticket boat box moon cloud bulb carriage box tray square cup station match tooth oven horse pencil tray collar tree scissors brush drawer brick arm engine sock umbrella sheep apple horn hat chain fork screw
```

Count: **49 entries, 47 distinct words**. The only repeated entries are `box` and `tray`.

The original archive README (blob `573cc3a934019153c442bdc52375eb59d4e99f47`) gives the Track1 instruction: create a GPG key, encrypt the supplied wordlist with Cicada's public key, sign it with the participant's key, and send the ASCII-armored ciphertext to the Gmail address from which the participant received their number. The archive's `decode.py` (blob `d9cc994cc0e0183a978d224dfb560ab91299036b`) documents the two-track substitution decode; `decrypted.asc` (blob `dfaf910652a44b848a64ff849b714e2aeaac1139`) and `midi.asc` (blob `cbdb9899a5c77f364456f55e39bd25b73467d809`) preserve the decoded messages and signed introduction.

The signed introduction says the song is “your own path” and “another stop on the road toward enlightenment,” then says “Let the Chorus be your guide to the depths.” This selects the **2012 song's chorus** as the immediate musical guide. It does not name the 2013 audio file, 761, PARABLE, LP2, or a later reuse of the 49-word list. The Track2 Blake stanza is historical context only; shared literary source is not an instruction to map the Track1 wordlist to a later poem.

## Frozen p57 PARABLE text

The solved p57 source is the original physical page 74 image (SHA-256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`) and the pinned rune corpus `resources/liber-primus/lp2-corpus.json` (Git blob SHA-1 `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`). Page 57 contains **95 runes**: the seven-rune red heading `PARABLE` and the 19-word body. The GP transliteration of the full source sequence is:

```text
PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE
```

The nonstandard spellings `LICE`, `TUNNELNG`, and `DIUINITY` preserve the source's GP orthography (C for K, dedicated NG rune, U for V). The conventional body spelling, with the three sentence stops preserved, is:

> LIKE THE INSTAR TUNNELING TO THE SURFACE. WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.

The body word counts are **7 + 6 + 6 = 19**. The source text is also recorded in [the p57/Onion7 source analysis](onion7-magic-center-source-prime-gate.md), whose current Git blob is `ddb944d33f13f05837a11d8cb4cd4921dadcd938`.

The pinned 2013 MP3 is [`rtkd/iddqd` commit `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, `2013/02/761.MP3`](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3), Git blob SHA-1 `7e2bd299fbc7b96283219cf15e2904641daf631f`. The repository's [761 audio/ID3 analysis](audio-761-pad-scan.md), blob `8199c66294aeff655aeda0d69613958a4e0bbbbb`, identifies its user-text metadata as `Parable 1,595,277,641` and records the p57 poem. This is a separate 2013 artifact; neither it nor the p57 text supplies an instruction to reuse the 2012 49-word submission.

## Frozen comparison

A direct comparison of the 49 source words with the 19 p57 body words gives:

| Test | Result |
|---|---:|
| 2012 wordlist entries | 49 |
| Distinct 2012 words | 47 |
| p57 PARABLE body words | 19 |
| Exact shared tokens (GP transliteration) | **0** |
| Exact shared tokens (conventional English) | **0** |
| Shared consecutive two-word phrases | **0** |

The only generic geometry noun in the 49-word list is `square`; it is not a p57 body word, named reference, or command. The list has no `parable`, `circumference`, `instar`, `tunneling`, `divinity`, `761`, or other source-visible pointer to the 2013 audio/Parable. The counts 49 and 19, by themselves, do not specify a transformation, address, or ordering. No word-index, anagram, acrostic, or arbitrary 49→19 search was run.

The existing [source-native comparison script](../sims/cicada2012_midi_parable_source_gate.cjs) checks the 49-word source copy against p57's 95-rune corpus sequence, verifies the 19-word body in both GP and conventional spelling, and asserts empty shared-word and bigram sets. This invocation independently fetched the pinned `words.txt`, README, `midi.asc`, p57 corpus, p57 source analysis and 761 ID3 analysis, then recomputed the counts and intersections.

## Exact missing instruction

No original 2012 README, decoded Track1 message, or signed MIDI introduction says to carry the 49-word submission forward to the 2013 `761.MP3` or LP2 PARABLE. No source specifies how to transform, select, index, or otherwise map those 49 words to the 19-word body. The missing evidence is an original cross-round instruction explicitly linking the submitted list to the 2013 audio/Parable and selecting the operation. Until such a primary instruction appears, the 2012→2013 49-word continuation is unsupported and should not drive further cryptanalysis.

This negative concerns only the proposed direct continuation. It does not invalidate the independently decoded 2012 MIDI instructions, the 2013 ID3 metadata, or the established p57 source analysis; it yields no LP2 key or unknown plaintext.
