# Source manifest — p56 / sq6 cold-start packet

**Prepared:** 2026-11-26 UTC  
**Scope:** exact source objects supplied to the participant, plus observer-only provenance and source limitations.  
**No interpretation:** this manifest does not assert that the 2012 sq6 route is the target of p56.

## Participant-visible objects

### 1. Liber Primus LP2 page 56

- Local canonical source: [`resources/liber-primus/73.jpg`](../../../resources/liber-primus/73.jpg)
- LP2 mapping: archive image number = LP2 physical page + 17; therefore LP2 p56 is `73.jpg`.
- Length: **389,813 bytes**
- SHA-256: `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc`
- The digest is also listed in `resources/liber-primus/SHA256SUMS.txt`.
- Source context: the canonical 58-page LP2 image set is byte-identical to the 58 JPEGs in a dated 11 May 2014 Stage11 participant archive. This packet uses the original image bytes, not OCR or a transcription.

### 2. sq6 enrollment-form screenshot

- Local mirror: [`resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.jpg`](../../../resources/external/2012-sq6wmgv2zcsrix6t-onion-get-email-screenshot.jpg)
- Original public-archive repository: `cicada-solvers/neuroretransmit-cicada`
- Pinned commit: `b13600373d3400d75ec4208198019f3d92a304dd`
- Original archive path: `2012/007-onions/sq6wmgv2zcsrix6t.onion/screenshots/6mBiv.jpg`
- Length: **123,011 bytes**
- Git blob SHA-1: `908ec5b74fd99ff9bf5a440e1685ca317dc88c26`
- SHA-256: `07d3c4539437192017f5dd9f8faa31097b7b92beac0a91617f2cb49c40d8db3f`
- Classification: community-archive screenshot of the `/cgi-bin/get_email` enrollment page; not a first-party HTTP entity, not a participant-specific `/NUM` response, and not a successful server response body.

### 3. sq6 participant-specific signed message

- Local mirror: [`resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc`](../../../resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc)
- Original public-archive repository: `cicada-solvers/neuroretransmit-cicada`
- Pinned commit: `b13600373d3400d75ec4208198019f3d92a304dd`
- Original archive path: `2012/008-rsa-emails/quaetrix0@gmail.com.asc`
- Length: **2,500 bytes**
- Git blob SHA-1: `30a45f2149bf46fd99d156d24b7132f8e0f207b3`
- Classification: participant-specific PGP clear-signed message containing an RSA challenge and public-key material. The archive README identifies this as the valid-participant copy and says its signature verifies; this packet does not independently re-verify the signature. It is not a byte-preserving capture of the original onion HTTP response.

## Observer-only provenance and secondary context

Do not show this section until the participant has recorded and locked the first operation and prediction.

- The pinned community archive's README and source list are **archive metadata**, not first-party Cicada server records.
- The [AllMystery discussion](https://www.allmystery.de/themen/it83189) contains posts dated **15 January 2012** about unique participant emails and a 112-digit RSA key. It is contemporaneous forum discussion, but **secondary testimony**, not the original email or server response.
- Connor Tumbleson's [12 April 2021 account](https://connortumbleson.com/2021/04/12/the-cicada-3301-mystery-puzzle-1-extra/) is **retrospective secondary testimony**.
- Saumitrasapre's [11 June 2021 account](https://saumitrasapre.medium.com/the-mysterious-puzzle-2-c73d805e1f04) is **retrospective secondary testimony**.
- These accounts may help an observer classify provenance after the blind session; they are not included as participant-facing evidence.

## Known public-archive boundary

The pinned public archive preserves an enrollment screenshot, the participant-specific signed message copy, and archive notes. It does not preserve the initial sender email with the unique `/NUM` path token, original email headers for that initial message, a successful raw HTTP response body, or the participant's browser/Tor request record. A reported 500-error screenshot and later success text are not byte-preserving response bodies. This is a bounded statement about the pinned public archive only; it says nothing about private inboxes, personal caches, or unarchived server logs.

## Deliberately excluded from the participant packet

- decrypted RSA response numbers;
- the p56 digest copied into text or candidate hash-family lists;
- prior hash comparisons or candidate results;
- repository reports, issue discussions, and proposed relationships;
- guessed `/NUM` values, reconstructed response bodies, or unverified page content.
