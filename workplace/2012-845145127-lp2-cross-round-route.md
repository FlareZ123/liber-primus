# 2012 845145127 chain: solved book codes, missing one-time pages, possible LP2 callback

## Established 2012 route

The 2012 PGP-signed book-code clues are already solved; do not spend another run rediscovering the books.

- The “twenty-nine volumes” clue selects the *Encyclopaedia Britannica*, 11th edition, volume 6, slice 3 (“Chitrai” to “Cincinnati”). The Mabinogion pause occurred at line 69 of the subreddit code stream; the first name is “Cicada.” The book code yields `eq6emgv2ehsrix6t.onion`, whose page is lost. Sources: [neuroretransmit/cicada two-book-code synthesis](https://github.com/neuroretransmit/cicada/blob/main/2012/006-two-book-codes/README.md) and [the pause reconstruction](https://uncovering-cicada.fandom.com/wiki/What_Happened_%282012%29).
- The “poem of fading death, named for a king” clue selects William Gibson’s *Agrippa (A Book of the Dead)*; its book code yields `sq6wmgv2zcsrix6t.onion`. Its archived landing page is `2012/007-onions/sq6wmgv2zcsrix6t.onion/site/index.html`: a PGP-signed congratulations message and one-time email form. Users submitted a fresh public email address, received a unique number, then appended it to the onion URL. The page is preserved in [the archive repo](https://github.com/neuroretransmit/cicada/tree/main/2012/007-onions).
- The 2012 second-chance route groups the ten numbered image IDs into Agrippa and Britannica sets, sums each group’s largest number to obtain `1853143003544.tk`, then factors it to `33091839349.tk`. The archived image payload leads to William Blake’s *The Marriage of Heaven and Hell* and the onion `cginiziglyaobyph.onion`. See [the second-chance reconstruction](https://github.com/neuroretransmit/cicada/tree/main/2012/008-second-chance).
- The 2012 RSA-email stage served a **unique, one-time page/message per participant** at `sq6wmgv2zcsrix6t.onion/NUM`. The archive preserves one valid PGP-signed example (`quaetrix0@gmail.com.asc`) and related ciphertext/key material, not every participant’s page. The signed message explicitly warns that only messages signed by key ID `7A35090F` are valid. See [the RSA-email archive](https://github.com/neuroretransmit/cicada/tree/main/2012/008-rsa-emails).

## Bounded p56 hash test

The following ten raw archive objects were hashed with SHA-512 against the p56 target; none matched:

| Object | Bytes | SHA-512 |
|---|---:|---|
| Agrippa onion landing HTML | 1,788 | `71ae971c27c3852bb4648b7b3bd973568fe25ee8dfc930eb35010f40c0056d8fc9040069cfd0c17a194dbfb99b2c95e61a0dd0967bb2405833421712719e9fbb` |
| Agrippa onion screenshot | 123,011 | `69a0c8a8c79e671f025788a061f83cc33d44b4d58c45b391c3a9aae2f0268d76c996ea4ce098f6f25a9d83323a7e09c1be8cf33713a0ea32ad31ea066ac928fa` |
| Second-chance HTML | 158 | `f11b1f5eb42e51d0ec194f4d5bcfff048066fe4ea8b1691248213e941cab4ede64dd88ea724dfe57a7ffda0d4ba22c27ceaa361b6e5e2f6f9ed574eceb4979a2` |
| Second-chance image | 175,229 | `934edfb4f14176951f42bfbd87e61eda6d18faaff3a631deda2219913ddae198a93f5d38127fc4024f816ba650ffff996a9b6c7a5a1a80ba3c2f4754b2f62355` |
| Second-chance PGP payload | 1,079 | `0c2c50ec4dac46c4ee0733eeda344934a3485bea0dfa256d68457c1f0a94be89eb87b0f42a0cb52157d595be4275718545a85cdc1f033bcccd13b852d6382227` |
| RSA-email valid example | 2,500 | `636d263618569bb1e34b0c27a7e5c230aa2639e5aa890479a89d2331b01bbf5ad745dd9c9312ba03ea7911acb5bf7b9c8b82528d3e18e607f6234739d9fd67b5` |
| RSA-email shared artifact | 1,199 | `969b5bd545cd242caa472d22205c1f07b759c125151886733df0bef67922bf069acb558a9544ba9dd61f038576161acb8a119ae1fe17731d6068e902a73c07a6` |
| RSA-email unknown artifact | 2,537 | `d2f227ba5f26703362a23b1fb4c4840d46725040a1a231c9ad0b8b2a010b4951afcb209f0a68fe8a46a38080ac1266d480d74fd5593ea4221c9302428f037e98` |
| RSA-email another unknown | 2,476 | `c48d28701e8bef1ee797a868d6d5e7f68be6f863ea86192bccbab602d3c94fcdd4b49040b90aca222ac87aaa696e74a5a9b64655cd2f665d74e1145be3e491d7` |
| RSA-email public-key PEM | 458 | `d81c9c71af5c006d00985466c013831071f7e86d2d7dd3c1fadcf8c2b8dbac01e291d92eef729a6d04b2274d33c80cb3d8c102b5eb32acda7b04ecf2e64e5887` |

This excludes those exact raw objects only. It does **not** exclude the per-user `/NUM` pages, which were served once and are not preserved in the archive, nor does it establish that p56 points to the 2012 chain.

## Candidate LP2 relationship (unproven)

The 2016 signed text’s “words are the map / numbers are the direction” language plausibly recalls Cicada’s earlier book-code and numeric-address mechanisms. The shared 7A35090F key authenticates continuity of authorship, not a specific cryptographic dependency. The 2012 book-code route itself resolves to onion services and participant-specific RSA pages; it has not yielded LP2 plaintext, a p56 preimage, or an executable LP2 key.

**Next useful decision:** the RSA-email archive records that after a solver submitted the decrypted number, the service first returned HTTP 500, then on 17 January at about 02:49 UTC returned `Correct. We’ll email you.` The next archived stage is `2012/009-midi-puzzle`, which preserves `song.mid`, `midi.asc`, `midi-first-unwrap.asc`, `decrypted.asc`, `words.txt` and `output.flac`. SHA-512 of the three recovered 20-digit plaintext numbers and their obvious onion URL forms does not match p56; the exact response text and MIDI-stage objects have not yet been tested. These are now the most concrete remaining 2012 page/message candidates. Test those exact archived objects before exploring arbitrary transformations. The participant-specific `/NUM` page remains missing. Do not repeat the solved Britannica/Agrippa book codes or the ten raw SHA-512 checks above.
