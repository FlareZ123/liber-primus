# 2012→2016 OpenPGP continuity: historically plausible LP2 handoff, no cipher selector

**Agent 2, 21 November 2026. Director Issue [#2065](https://github.com/FlareZ123/liber-primus/issues/2065).**

## Decision

There is a source-grounded cross-round path that a 2016 solver could reasonably follow back to the 2012 musical puzzle. The 2016 coda explicitly says `Verify OpenPGP 7A35090F`; that eight-hex suffix is the end of the full 2012 Cicada key ID `181F01E57A35090F`. The 2012 outer email and embedded MIDI are both signed under that key, and the 2013 TCP challenge uses the same full fingerprint. The 2014 Stage11 signed message separately gives the onion address for the 58-page Liber Primus release.

This establishes a plausible historical *discovery path*, not an LP2 decryption. The 2012 chorus is explicitly selected as a musical guide, but no first-party source says how to consume it against LP2. Existing direct chorus and 49-word-list consumers are negative and should not be repeated. No unknown LP2 plaintext, key, reversible cipher, or final destination was recovered.

## Player-view chronology and handoff

### 1. 20 January 2012 — signed song / MIDI puzzle

The preserved message `resources/historical/cicada2012-midi-email.asc` says:

- “This song is your own path”
- “Another stop on the road toward enlightenment”
- “Follow it, and share not”
- “Let the Chorus be your guide to the depths”

The email's outer clear-signature verifies against the preserved Cicada public key, key ID `181F01E57A35090F`, full fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`. The embedded PGP block is ZIP-compressed **signed literal MIDI**, not encrypted data; its inner signature verifies under the same key. The exact 10,889-byte MIDI is pinned in `resources/external/cicada2012-midi-source.json`.

The source-derived musical puzzle has two distinct outputs:

- Track 2 repeats a 238-letter Blake chorus three times. The signed introduction explicitly selects the chorus as the guide.
- Track 1 yields a 558-letter instruction and a 49-word submission list. The 49-word list is participant-specific: the archived README tells a participant to encrypt it to Cicada, sign it with their own key, and send it back. It is not a universal 49-word key.

A contemporary solver in 2016 could locate and authenticate this earlier artifact from the short OpenPGP key suffix in the 2016 coda, then reasonably revisit the chorus. The 56 chorus words matching the 56 unsolved LP2 pages, and its 238 letters matching p36's 238 runes, are natural observations, but they do not determine a transformation.

### 2. 26 January 2013 — signed TCP challenge

The recovered signed challenge `resources/external/2013-tcp-server-signed-source.md` verifies under the same full fingerprint. It gives a participant-run TCP protocol with BASE29, DH, NEXT and other commands.

The useful human-facing operations are typed:

- `BASE29 3301` returns `3QO` under the stated base-29 digit alphabet.
- The displayed `p=23,g=5` DH exchange is a worked example. The participant's server chooses its own base and secret; the client supplies its public share. The resulting example value 2 is not an organizer-fixed LP2 key.
- `NEXT` stores text supplied by the client; the server does not generate the next instruction.

This shows that recognizable operations and explicit input/output types appeared in earlier rounds. It does not authorize reusing the toy DH values or the participant's NEXT text as LP2 state.

### 3. 2014 — signed Stage11 location handoff

The preserved `resources/historical/cicada2014-stage11-message.asc` says “Your enlightenment awaits you” and supplies `ky2khlqdf7qdznac.onion`. The surviving original onion index exposes the 58 LP2 page images, numbered 0–57. This is a concrete source-to-location handoff: a human receives a signed network destination and can obtain the manuscript. It supplies no later cipher key or word-map grammar.

### 4. 1 January 2016 — signed Liber Primus coda

The preserved `resources/historical/cicada2016-4gq25-outguess.asc` is an OpenPGP-signed message. Its signature metadata records creation time `2016-01-01T00:01:07Z` and issuer key ID `181F01E57A35090F`. The body ends:

> Beware false paths. Verify OpenPGP 7A35090F.

The short ID exactly matches the final eight hex characters of the 2012/2013 key ID. The same signed message says:

> Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.

The pronoun “Its” refers to Liber Primus in the immediately preceding sentence. A solver is therefore directed toward the manuscript's own words and numbers. Reopening earlier signed material is a plausible contextual step; treating the 2012 participant-specific 49-word list as the map is not.

## What the candidate path does and does not select

A plausible human sequence is:

1. Read the 2016 coda and verify the stated OpenPGP key suffix.
2. Recognize the same Cicada key in the 2012 song email and 2013 signed challenge.
3. Revisit the 2012 song, follow its explicit “Chorus” instruction, and compare that fixed text with the 56-page LP2 ciphertext.
4. Use the 2016 coda's own instruction to investigate LP2 word and number structure.

This sequence explains why the 2012 chorus is worth examining. It does **not** choose a page-address formula, cipher, key schedule, or receiver.

Already completed tests close the obvious direct interpretations:

- The 238-letter chorus as p36 plaintext/running key, including source-fixed 2012 seven-column and 2014 fourteen-column orders, is nonlinguistic. The Q238 field-key, 16-tap recurrence, and chorus-seeded Q238 LFSR extensions also fail. See `im-results/2012-midi-chorus-p36-238-gate.md`.
- The 56-word chorus → base-56 LP2 page/word address → strict word-interior readout yields 154 nonlinguistic runes; 55/56 in-bounds addresses are mechanically expected, not a successful map. See `im-results/lp2-2012-chorus-base56-wordmap-gate.md`.
- The archived 49-word participant list has no shared words or bigrams with p57 PARABLE and no source-selected 49→19 mapping. See `im-results/2012-midi-49word-parable-continuation-gate.md`. The separate p50 address-hotspot test is already recorded in `im-results/2012-midi-49word-p50-address-hotspot-gate.md`.

Do not rerun these families with alternate phases, origins, alphabets, or arbitrary mappings. The 2016 base-58 word-map and p50 functional-graph work remains a separate navigation hypothesis; it reaches p32 but does not decrypt its 121 runes. See `im-results/lp2-2016-signed-message-base58-word-map.md` and `im-results/lp2-p50-functional-graph-2016-wordmap.md`.

## Smallest missing historical input

The missing item is not another key-ID match or another count coincidence. It is a first-party continuation—an original signed instruction, recipient-visible server response, or preserved LP2-stage artifact—that explicitly links the fixed 2012 chorus (or another named earlier object) to a particular LP2 receiver and specifies the reversible action. For a chorus-based route it must fix, at minimum, the page/word address convention or ciphertext interval, alphabet, key/state, clock/reset, and readout. None of the preserved 2012–2016 signed texts supplies that contract.

The 2013 DH and NEXT examples cannot fill the gap: their operand roles are participant-controlled. The 2014 onion message selects the manuscript location, not a cipher. The 2016 coda selects LP2's words/numbers as the subject of navigation, but not a complete decoder.

## Research disposition

Close #2065 as a bounded negative for a source-selected LP2 decoder. Preserve the cross-round OpenPGP continuity and the plausible 2012-chorus rediscovery path as historical context. Do not change `results/README.md`: no unknown plaintext, authentic LP2 key, reversible mechanism, or final destination was recovered.

## Source set

- `resources/historical/cicada2012-midi-email.asc`
- `resources/historical/cicada-3301-2012-public-key.asc`
- `resources/external/cicada2012-midi-source.json`
- `resources/external/2013-tcp-server-signed-source.md`
- `resources/historical/cicada2014-stage11-message.asc`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `im-results/2012-midi-source-metadata.md`
- `im-results/cicada-authenticated-solvepath-operation-contracts-2012-2016.md`
- `im-results/lp2-human-solve-path-audit-2026-11-21.md`
