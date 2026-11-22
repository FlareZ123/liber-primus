# Post-LP2 signed-message source gate: no independently specified decoder

**Director #556 decision (12 November 2026):** No previously unindexed **post-May-2014** OpenPGP-authenticated instruction specifying a key, LP2 page/rune offset, reversible cipher, key schedule, or plaintext crib was found in the checked 2015–2017 source set. The only extra period message relative to the repository's two well-documented 2016/2017 controls is a **2015 disavowal**; its signed body makes no reference to Liber Primus or any cryptographic operation. Nothing here warrants an LP2 inversion run.

## Finite new-source check

Independently of the internal `resources/historical/` 2016 and 2017 artifacts, inspect the [21-file signed-message directory](https://github.com/krisyotam/cicada3301/tree/main/pgp/messages) in an external public Cicada archive. The directory spans 2012–2017 and contains duplicate copies under different labels. Source Git blobs and relevant content:

| External archived source | Git blob SHA-1 | Signed semantic content and decision |
| --- | --- | --- |
| [2015-07 planned-parenthood-denial.asc](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2015-07-planned-parenthood-denial.asc) | `f8fa3ee84e89c7e7bfa5b0b0f6f6c461e8e89812` | Disavows association with attacks attributed to a group using 3301's identity. **No LP2 input, instruction or key.** [Contemporary independent transcription and stated PGP verification](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md). This is a known public period message, not a newly discovered Cicada publication. |
| [2017-04 final-warning.asc](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2017-04-final-warning.asc) | `f455e72159fc9fea9e3d89df835468ea67fe3cf4` | Same already source-pinned warning as `resources/historical/cicada2017-yEiTHhvF.asc`, with identical Git blob SHA. No decoder. |
| [2017-04 final-message.asc](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2017-04-final-message.asc) | `bed70cfda8a5dab14768cf96fee8bf122e4b8468` | **Not a second 2017 Cicada announcement:** after normalizing line endings and removing whitespace *between armored signature tokens*, the entire signature payload is **byte-identical** to `final-warning.asc` (same terminal CRC `=6zQ2`); the signed words are identical after whitespace normalization. These are different archival text serializations of one message. |
| [2014-05 liber-primus-release.asc](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2014-05-liber-primus-release.asc) | `5bfaaeaf5364291e8a38d27222946f9db93cd50b` | Signed text says “Your enlightenment awaits you” followed by `ky2khlqdf7qdznac.onion`; the archive file's *release* title does not add an LP2 cipher operation. Its PGP body is an onion instruction already covered in 2014 stage archives. |

The signed 2016 tree/OutGuess text and original 2014 Stage11 announcement had already been audited, including their exact bytes, the physical tree's page32 selection and the p56 solved control. Re-scraping these objects cannot reveal a missing key.

## The tempting 2015 “5,3,2,5,7” caveat

The [earlier participant-archive transcription](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) annotates empty/trailing-space runs in the 2015 disavowal as `5 - 3 - 2 - 5 - 7`. Those digits **are not authenticated by an OpenPGP cleartext signature** because trailing ASCII spaces and tabs are excluded from the cleartext-signature digest under [RFC 4880 §7.1](https://www.rfc-editor.org/rfc/rfc4880#section-7.1); the archived GitHub `.asc` has a distinct whitespace serialization. Even a valid signature of its prose cannot prove creator-selected 5/3/2/5/7 run lengths. No signed body text assigns these positions to LP2, sets a cipher family or chooses a recipient page.

**Do not elevate whitespace counts to a new prime key** merely because the PGP prose signed in 2015 verifies. A historically recoverable untouched original artifact containing the actual whitespace would establish only a visual source witness, not cryptographic authentication of those counts.

## One direct original-input inversion attempt from the 2015 whitespace candidate

Although the historical trailing-space counts are **not signed evidence**, they can be tested as a frozen, five-phase GP29 additive key without searching. Fix the transcribed key to `K=[5,3,2,5,7]`, the GP29 rune order to `resources/liber-primus/lp2-corpus.json`, and the literal p23–p26 black text after the first **16 red runes** as 1,005 positions. Apply both `P_i=(C_i+K[i mod 5]) mod29` and `P_i=(C_i-K[i mod 5]) mod29`, resetting phase at the start of this body. Also apply each sign to the separate complete original 76-rune p55 ciphertext. No ciphertext-dependent phase or keyword is fitted.

| Frozen source target | Raw GP29 index of coincidence | Plus five-key | Minus five-key |
| --- | ---: | ---: | ---: |
| p23–p26 1005 black runes | 0.03430457 | **0.03445125** | **0.03485362** |
| p55 76 original runes | 0.03789474 | **0.02982456** | **0.03438596** |

Both p23 outputs remain ciphertext-like at full length and display no coherent new GP orthography; p55 likewise does not become readable. The known p56 ciphertext as a negative-target control also remains cipher-like, with ±key IoCs **0.03557423 / 0.03809524**, versus its printed-cipher baseline **0.03249300**. The operation does have a unique inverse with the same key and phase, so round-tripping cannot distinguish a correct source-selected decoder from a false key. These specific original GP29 tests reject the *straight repeating-additive reading* of the unsigned whitespace numbers as a productive path. The numbers are not an authenticated source key and no further custom nonlinear transforms are warranted without another clue.

## Next research decision

No qualifying post-LP2 signed instruction or authentic unknown plaintext/key recovered. Stop this signed-message-search lane **unless an independently byte-preserved, new 2014–2017 signed payload actually emerges with a page/key/operation selector**. If one does, verify it against the pinned Cicada public key and fix its exact LP2 consumer before running a targeted inverse. All previous established LP2 cipher unknowns remain unresolved.
