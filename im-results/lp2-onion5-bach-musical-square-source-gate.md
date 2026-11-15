# The 2014 Onion5 Bach excerpt and alleged musical magic square

**Disposition (15 November 2026): historical claim identified; original audio byte identity reproduced; the suggested note-to-number operation and an LP2 receiver are not source-specified. This branch supplies no new GP29 key, decipherment, or LP2 plaintext.** It is distinct from the already verified OpenPuff magic-square extraction on the longer `Interconnectedness.mp3`.

## What a 2014 solver would have seen

Cicada's original [19 January 2014 signed message](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc) contains hex for three contiguous media components (1,084-byte Gödel JPEG, 1,635-byte Escher Eye JPEG, and a 9,288-byte Bach MP3), followed by book-code coordinates. The media identify Douglas Hofstadter's *Gödel, Escher, Bach* and the coordinates yield the known Sixth Onion `ut3qtzbrvs7dtvzp.onion`. This known, complete source-selected path is documented in [the authoritative Onion-chain synthesis](../results/2014-onion-chain.md).

The [original 2014 website copy](https://github.com/micheloosterhof/cicada-2014/blob/master/stage08/index.3.mp3) has the same 9,288 bytes as the signed audio block. We independently reconstructed all three signed blocks and compared the audio **byte for byte** in the source-frozen [CommonJS SFT](../sims/lp2_2014_onion5_bach_source_sft.cjs). The complete audio consists of **129 consecutive 72-byte MPEG-2 Layer III frames** (24 kb/s, 24 kHz, mono, 576 samples/frame, 3.096 s). Original source first eight bytes `fff334640002fc29`, final eight bytes `aaaaaaaaaaaaaaaa`. No bytes remain outside the measured MP3 frames. **Scope:** an absence of trailers does not rule out note-based encoding, nonstandard MPEG side data, or steganography in the audio.

## Exact participant claim and what survives

The source-linked [Uncovering Cicada Wiki XML export `export_cur_00020.xml`](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/wikis/uncovering-cicada/export_cur_00020.xml) has page `CICADA 3301 2014 PUZZLE FACTS PART 7`, MediaWiki page ID **8128**, surviving revision **42707**, timestamp **2021-12-14T23:27:13Z** (Crashdemons). This is a *retrospective revision* containing text about 2014, not an independently retrieved January 2014 revision.

In the section on the three-second Bach excerpt, a participant describes **BWV 1039, second half of bar 18**, a transcribed score screenshot `McLEj0T.png`, and a personal Finale transcription. The exact secondary source locators were:

- Alleged transcription MIDI/sheet: `https://www.dropbox.com/sh/jpqwmteihyrrshp/nSksuROnvE`
- Participant note-position and-part listing: `http://pastebin.com/3T089HUW`
- Participant's proposed letter-to-number interpretations: `http://pastebin.com/17h9MhyK`

Immediately thereafter the wiki displays the participant quote **“also, one of the magic squares IS in the mp3 though, it's encoded the same way Bach encoded his.”** The next line responds **“Not have been found yet.”** Neither statement is a Cicada-signed instruction. The source contains no actual note-index table, specific square cells from the clip, uniquely prescribed note/octave/duration → number mapping, or original LP2 page/clock/key instruction. The two Pastebin IDs and Dropbox URL are **acquisition handles**; their original historical payloads remain unrecovered, so no musical decoder can be source-frozen from this evidence alone.

**New independent dated screenshot witness (15 November 2026):** a recovered **2014 Wayback CDX record**, already preserved in [Dukotah's F5 original archive index](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/cdx/wikia-img3.json), specifically records the wiki-uploaded `McLEj0T.png` **180-pixel thumbnail** under source URL `http://img3.wikia.nocookie.net/__cb20140202145619/uncovering-cicada/images/thumb/2/20/McLEj0T.png/180px-McLEj0T.png` with **successful `image/png` status 200 at 2014-02-27T04:21:20Z**, reported payload length **21,675 bytes** and archival base32 SHA-1 digest **`RZVGNQBNYK3PQF5VEDMEZMZFXAKVI665`**. The `__cb20140202145619` component encodes the wiki upload version timestamp **2 February 2014**, consistent with the participant's dated original era, rather than the later 2021 text-revision timestamp. This is a real period record establishing that the score screenshot URL existed; it is **not yet a byte recovery, note transcription, or proof of Cicada authorship**. Direct original/replay access is unavailable in the present runtime and must be pursued using that exact CDX `original` URL and 2014 replay timestamp, with digest/length verified before any interpretation. Neither missing Pastebin body is present in indexed public code-search results beyond quotations of its URL.

The same wiki page acknowledges **BWV 1033** as an alternate contemporary music identification; no first-party instruction chooses a musical score *edition* or bars as a cryptographic key. Even if the BWV 1039 attribution proves correct, a human can identify the clip as **Bach** without performing note arithmetic, because the signed Gödel/Escher images and book-code jointly complete the historical stage. A hypothetical additional encoding therefore requires its own independent trigger and receiver rather than retrospective searching of musical transforms.

## The other MP3 supplies the authenticated historical square route

The [2014 wiki Part 8 account](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8) recounts the **6 February 2014** successful recovery of three magic squares from the different, longer `Interconnectedness.mp3` by original OpenPuff with password **`33011033`**. That square file is **745 bytes** with native CRC32 **`6A8C41E3`**. Crucially, this is experimentally verified on original tool and bytes by [repository Windows run 43662139707](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707), with extracted SHA256 `9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`. See [OpenPuff source analysis](openpuff-jpeg-capacity-gate.md).

Therefore, older community talk of squares “in the MP3” is **ambiguous** between an actual solved separate MP3 and a speculative 3.096-second Bach excerpt. The demonstrably solved square path does not authenticate a magic square in the latter.

## Cryptanalytic decision

There is **no source-selected note-to-number transform to test against an original unknown LP2 page**, and no independently identified GP29 receiver for these three seconds of audio. Brute-forcing pitches, offsets, instrument assignments, magic-square arrangements, or keys would fit conjecture after observation, violating this issue's frozen-operation gate. The music-specific branch is therefore **unsupported, not mathematically disproved**. It should remain retired unless an original timestamped note table, a Cicada-authored instruction, or a separately sourced LP2 receiver is recovered.

A decisive successor would obtain the exact original bytes of `3T089HUW`, `17h9MhyK`, or the specific score screenshot, establish their creation date, and recover a single pre-existing note-to-cell/key mapping. Only then would a frozen 100-rune LP2 original-input trial plus disjoint 40-rune holdout and exact GP29 reencryption be warranted. The key/source-to-LP2 link, rather than new audio search volume, is the missing premise.

**Outcome:** historical ambiguity resolved enough to prevent further unconstrained Bach-to-square-to-LP2 key sweeps. **No unknown original-page plaintext recovered.**
