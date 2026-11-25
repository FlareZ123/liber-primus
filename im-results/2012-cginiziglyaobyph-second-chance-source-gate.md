# cginiziglyaobyph second-chance page: signed response and archive gate

**Disposition:** The endpoint belongs to the **2012 second-chance route**, not a distinct 2013 puzzle service. A Cicada-signed participant RSA challenge body is already preserved and verifies. The original cginizi HTML/HTTP entity and headers remain unavailable; no LP2 handoff is present.

## Corrected historical identity

The 2021 reconstruction decodes a “Numbers dot TK” clue to `cginiziglyaobyph.onion` and says that the endpoint prompted for an email; participants who registered received an iteration of the signed RSA challenge below. This is the only source located in this pass that gives the cginizi path token, and it is retrospective, not a contemporaneous server capture.

The community “second chance” account identifies this as the **2012** contest. Its quoted January 2013 IRC recollection says the URL had gone viral “last year” and that Cicada made a second-chance contest for people who missed it. The signature on the preserved RSA message is independently dated 15 January 2012 01:39:42 UTC. The issue's “2013 second-chance” label therefore conflates the date of later discussion with the date of the event.

The 2021 post and community wiki are useful leads, not first-party page captures. The 2013 IRC recollection is evidence of a 2012 event being discussed in 2013; it does not establish that the cginizi service first appeared in 2013.

## Authenticated response body already in the corpus

The repository already contains the 2,494-byte clear-signed response:

- Source: [`resources/historical/cicada2012-message-only-displayed.asc`](../resources/historical/cicada2012-message-only-displayed.asc)
- Git blob SHA-1: `672184615cf25d19e5eb177875be83b4d83c1128`
- SHA-256: `0b8b2da10b4944da726ca64fad672e8efb3f65d8096943501e2e14e2276ab7cc`
- Signature key ID: `7A35090F`
- Project public-key fingerprint: `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`
- OpenPGP signature creation time: **2012-01-15 01:39:42 UTC**

Reproduction from the repository root:

```sh
gpg --homedir /tmp/cicada-2012-verify --batch --import resources/historical/cicada-3301-2012-public-key.asc
gpg --homedir /tmp/cicada-2012-verify --batch --verify resources/historical/cicada2012-message-only-displayed.asc
sha256sum resources/historical/cicada2012-message-only-displayed.asc
```

The signature verifies as a good signature from the key whose UID is `Cicada 3301 (845145127)`. GnuPG correctly warns that the imported key is not certified by the local trust database; the result establishes signature validity under the repository's pinned key, not an independent web-of-trust identity claim.

The signed body says the challenge is RSA-encrypted using `Crypt::RSA::ES::OAEP`, that each participant receives a unique message and key, and that a second chance exists via the “Numbers dot TK” hint. It also states that only messages signed by key ID `7A35090F` are valid. The 2021 reconstruction reproduces this same signed message and associates it with the cginizi registration route.

The blog further reports a 372-bit RSA modulus, factors it, and gives the decrypted number `33521494043430258676`; it then describes a “Correct. We'll email you” response and a later participant-specific `/NUMBER` continuation on `sq6wmgv2zcsrix6t.onion`. Those are retrospective claims in the 2021 account and were **not independently reproduced in this task**. They should not be promoted to first-party evidence merely because the signed challenge body verifies.

## What remains missing

The recovered signed message is not the original cginizi page response:

- No byte-preserved HTML form/body for `cginiziglyaobyph.onion` was found.
- No original HTTP status, headers, cookies, redirects, or response serialization was found.
- No WARC, PCAP, participant browser/Tor cache, or contemporaneous email/archive capture binding this exact message instance to cginizi was found.
- The exact path token is supplied by the 2021 reconstruction; the 2012 signature proves the message is signed, not which onion endpoint served this participant's copy.
- The current repository's 2013 client log, the pinned 2013 missing-primes paste, and the 2014 Freenode corpus contain no cginizi string or direct second-chance response record. The repository's prior exact-host Wayback CDX audit reports no captures for the onion hosts or queried common proxy suffixes.

The repository also contains a separate 2012 `sq6wmgv2zcsrix6t.onion` participant RSA message copy. The community account says both onion routes ultimately delivered the same class of RSA challenge. These copies and the 2021 post are not independent original HTTP captures.

## LP2 relevance and completion decision

The signed message establishes a 2012 participant-specific RSA/MIDI continuation, not an LP2 operation. It contains no Liber Primus page selector, Gematria Primus key, p56 digest instruction, AN END address, or source-derived LP2 receiver. The later 2012 music material is already separately preserved in the repository and does not create an LP2 handoff.

**Close #2837 as a bounded historical result.** The signed RSA challenge body is already present and authenticated under the pinned Cicada key. The exact cginizi page/HTTP entity remains unavailable, and the 2021 association of the preserved participant message with that endpoint is retrospective. Correct the chronology to 2012; do not spend further effort on broad onion-address searches unless an original WARC, participant cache, dated email, or byte-preserved HTTP capture appears.
