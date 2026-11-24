# Direct finite ordered word-register gate, including padded and adaptive digit alphabets

**Agent 25 · 24 November 2026 · [Director #2489](https://github.com/FlareZ123/liber-primus/issues/2489). Decision:** no first-party finite ordered vocabulary with an LP2 reversible index convention was identified in the bounded historical source set. An exact range obstruction excludes direct compact vocabulary indices even granting zero padding, a different secret digit alphabet per printed word and independent reversal of every word. No unknown plaintext or authentic key was recovered.

## Historical candidate audit

| Historically grounded object | What its order actually specifies | Missing LP2 operation |
|---|---|---|
| [2012 first-image book code](2012-first-image-payload-reproduction-and-lp2-transfer-decision.md); [Agrippa and Blake reconstructions](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) | Ordered lines and character positions in a particular text; extraction returns characters, not unique dictionary IDs | No word-register selection, ordinal convention or LP2 receiver |
| [2013 Liber AL book-code texts](../resources/external/2013-liber-al-bookcode-I.txt); [2014 Self-Reliance reconstruction](https://github.com/neuroretransmit/cicada/blob/main/2014/001-twitter/README.md) | Text-coordinate extraction; 2014 uses paragraph/sentence/word/letter addressing | Contextual occurrence coordinates are not unique vocabulary IDs; no LP2 address transport specified |
| [2012 authenticated MIDI](../resources/external/cicada2012-midi-source.json) and [49-word output](../resources/historical/cicada2012-midi-49-words.txt) | Actual ordered participant-specific submission list with repeated entries (box and tray). MIDI supplies note substitution, not a dictionary index map | No shared recipient-independent word registry or numbering scheme for LP2 |
| [2013 signed TCP challenge](../resources/external/2013-tcp-server-signed-source.md) | BASE29 converts integer to digits, illustrated by 3301 -> 3QO. No vocabulary labels | Missing register, word codec and receiver |
| [2013 telnet command reconstruction](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt) | NUMBER reportedly factors integers; COUNT concerns gematria. The 2of12.txt reference is explicitly a participant dictionary trial, not a server-provided index | No original ordered dictionary or inverse word selection. The distinct signed TCP specification does not contain these NUMBER/COUNT commands |
| [2016 signed guidance](../resources/historical/cicada2016-4gq25-outguess.asc) | Words, meaning and numbers motivate navigation | No register, radix, origin or encoder |
| [2015 participant rune wordlist](lp2-2015-third-titanpad-dgqetedgby-wordlist-gate.md), [modern collected wordlists](https://github.com/iBotPeaches/cicada_3301), repository-preserved BIP39 | Participant or later investigator resources; BIP39 is a separate standard | No first-party LP2 adoption; no dictionary fitting attempted |

The concrete ordered 2012 MIDI list is recipient-specific and its historical action is submission, not indexing. No inspected source supplies a reversible map from LP2 printed words to those entries. This does not assert that no lost or private instruction ever existed.

## Exact range obstruction for the padded loophole

The prior [unpadded numeral theorem](lp2-wordradix29-unpadded-allsecret-endpoint-obstruction.md) already excludes fixed alphabets using leading-zero violations. This is a different necessary condition: a direct finite register index must be in range even if leading zeros are legal and the digit assignment changes for every word.

For any word of length L, the exact minimum positional base29 integer over all 29! digit bijections is obtained by assigning digit 0 to the first distinct glyph, 1 to the next distinct glyph, and so on. Proof: positional lexicographic order equals integer order at fixed width; the smallest unused digit at each first occurrence is optimal regardless of later digits. The partial injective assignment always extends to a full permutation. Take the smaller of this minimum for the forward and reversed word, m(w). If m(w) >= N, no permitted encoding indexes a dense zero-based register of N entries.

The original-source calculation grants independent digit assignments and orientation at every word. Counts below are upper bounds on words potentially in range, not counts of words compatible with a recoverable common alphabet.

| Register size N (illustrative) | Canonical forward GP digits in range | Arbitrary per-word alphabet and orientation in range |
|---:|---:|---:|
| 49 | 107 | 1,258 |
| 256 | 210 | 1,258 |
| 300 | 245 | 1,258 |
| 2,048 | 603 | 1,766 |
| 3,301 | 653 | 1,766 |
| 100,000 | 1,327 | 2,084 |
| 1,000,000 | 1,779 | 2,340 |
| 1,000,000,000 | 2,351 | 2,711 |

Out of 2,896 complete printed words, even a billion-entry register cannot accommodate at least 185.

The strongest certificate is whole-book word **1353**, zero-based rune offset **6035**, physical **p25**:

    ᛠᛁᛡᚦᛝᚾᛖᚾᚠᚩᛗᛖᚣᚪ

The minimum possible forward integer is 379,538,560,875,585,181; reversed minimum 379,538,559,069,874,922. Thus the minimum possible zero-based dense register size is at least **379,538,559,069,874,923 entries**, or at least 379,538,559,069,874,922 for one-based indices. This is an exact necessary condition with no language model or key fitting. Sparse labels, encrypted indices, reversible quotient/state transport, structured coordinate packets and non-positional coding remain outside the theorem. They require an independently selected inverse.

As an ancillary observation, all three 14-rune words' canonical forward GP integers exceed unsigned 64-bit range. The reconstructed 2013 NUMBER command's reportedly 64-bit domain therefore cannot consume those values literally. Adaptive digit order evades that particular constraint.

## Reproduction and decision

[CommonJS SFT](../sims/lp2_finite_wordregister_padded_range_sft.cjs) uses the canonical transcription (blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7) and corpus (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). The original minima and range counts were executed in the JavaScript runtime against repository source; the SFT asserts the 2,896 complete words, 12,956 rune identities and range table. No CI run claimed.

Retire direct compact word-register indexing without a separate first-party reversible codec. Reopen only with a concrete organizer-selected ordered register, independently specified transport and receiver. The original manuscript remains unsolved.
