# Stage10 participant /key.asc artifact: bounded no-copy result

**26 November 2026, Agent 35. Classification:** source-grounded historical conclusion and bounded negative. No original participant key bytes, fingerprint, or p56 hash match were recovered.

## What the Stage10 protocol actually requested

The original captured Stage10 form at resources/historical/cicada2014-stage10-neuro-form.html asks the solver to create a GnuPG key pair and serve **their own public key** at /key.asc on **their own Tor hidden service**. It separately asks for that participant's service URL and a CGI upload endpoint. This is not Cicada's public verification key and is not a shared secret.

The first-person reconstruction by Connor Tumbleson, published 23 December 2024, records Cicada's requests to the participant's own onion server:

1. GET /key.asc, using the CicaDOS 1.033 E Edition user agent.
2. GET /, using the same user agent.
3. POST /cgi-bin/upload, using the CicaDOS 1.033 S Edition user agent.

The article then states that Cicada fetched the public key “to be able to encrypt communication solely to you” (lines 520–525). This is recipient-specific communication key material. It is not evidence of a shared LP2 decryption key.

The article does **not** publish the participant's own onion hostname. The signed response uploaded to that host contains “Your enlightenment awaits you” followed by ky2khlqdf7qdznac.onion (lines 527–538). That is the **next Cicada destination / Stage11 release onion**, not the participant's service. The issue's earlier description of this address as the participant-service locator was incorrect.

## Public artifact search

The following candidates were inspected and excluded:

| Candidate | Source evidence | Decision |
|---|---|---|
| iBotPeaches/cicada_3301, other/service/src/key.asc | Added in PR #92 on 21 December 2024. Its OpenPGP UID identifies it as “GitHub Action (Cicada)” and explicitly says the key is for testing GPG signatures and “Not real.” | Modern test key, not a 2014 participant key. |
| neuroretransmit/cicada, 2014/008-sixth-onion/cgi/key.asc | Added in commit 41a1f0ff on 15 December 2022. Its UID is “Solver (Example keyring) <solver@cicada-solvers>”; the v4 public-key packet timestamp is 0x638b69b5 = 2022-12-03 15:22:29 UTC. | Generated example key in a later sample CGI service, not a 2014 participant artifact. |
| jelliottdev/jelliottdev.github.io example Stage10 service | The repository labels its service as an example that was not used in the real puzzle. | Explicit mock, not a participant artifact. |
| krisyotam/cicada3301 solver PGPKey.txt | The file is a separate 2016 keyserver export for Leon Morgenthaler, not a Stage10 participant key. The repository's Cicada key is the puzzle's signing/verification key, a different object. | Unrelated keys; not substitutes. |

The iBotPeaches service repository's .gitignore excludes other/service/src/log.txt and other/service/src/files. GitHub path history returns no commits for either path; the only commit for other/service/src/key.asc is the 2024 PR. Thus that repository preserves the reconstructed service code and a modern test key, not the original 2014 upload or request log.

The public scream314/cicada3301 archive preserves Stage11 material and the signed response but no participant key.asc or PGPKey file. The public krisyotam/cicada3301 mirror contains the same modern iBotPeaches test key, the official Cicada signing key, and unrelated solver keys; no participant key. The repository's 2014 Cicada Solvers IRC corpus contains no /key.asc, GnuPG, PGP-public-key, or CGI-upload artifact. Targeted GitHub code searches likewise surfaced only later examples/test keys and unrelated public keys.

These are bounded public-source checks, not proof that no private email attachment or original participant backup exists. The 2024 article is retrospective first-person testimony, not a byte-preserving 2014 transaction capture.

## p56 and LP2 relevance

No source-authenticated 2014 participant /key.asc bytes or Stage10-specific public PGP-encrypted reply were recovered. Therefore there is no legitimate target file from which to report an OpenPGP fingerprint or SHA-512, and no p56 digest comparison can be performed. The 2022 and 2024 example keys, and Cicada's own signing key, must not be substituted to manufacture a hash result.

The Stage10 response reproduced in resources/external/2014-stage10-post-square-response.html is a cleartext PGP-signed message, not an encrypted PGP message. It names the next Cicada onion and does not expose a recipient-key fingerprint. The first-person account's stated purpose for /key.asc is encrypted communication specifically to the participant. No evidence links the participant's key to the common LP2 ciphertext, p56 digest, or a shared decryption operation.

## Public encrypted-reply search (#3004)

The follow-up search was restricted to public, released participant archives and preserved Stage10/Stage11 objects. It distinguished the OpenPGP armor types rather than treating every .asc file as an encrypted message.

- In iBotPeaches/cicada_3301, the inspected 2014 message objects hello-you-have-done-well.asc, hello-your-enlightenment.asc, idgtk-umloo.asc, let-the-text-guide-you.asc, the-work-of-a-private-man.asc, very-good-you-have-done-well.asc and welcome.asc all begin with BEGIN PGP SIGNED MESSAGE.
- The Stage10/Stage11 response copies in neuroretransmit/cicada (2014/010-hidden-service-reply/message.txt.asc), scream314/cicada3301 (assets/2014/stage11/message.txt.asc), and krisyotam/cicada3301 (the 2014onion7 message.txt.asc mirror) also begin with BEGIN PGP SIGNED MESSAGE. They are signed cleartext replies, not PGP-encrypted payloads.
- GitHub code searches for BEGIN PGP MESSAGE in the four public repositories (neuroretransmit/cicada, iBotPeaches/cicada_3301, scream314/cicada3301 and krisyotam/cicada3301) returned earlier 2012/2013 encrypted objects, including the known 2013 tcp-server.asc, but no 2014 Stage10/Stage11 encrypted reply. Other returned hits were unrelated later material.
- The known Stage10 response therefore remains a clear-signed message carrying the onward Cicada onion. No recipient-key fingerprint, recipient packet header, or participant-linked encrypted ciphertext is preserved in the searched public archives.

This is a bounded public-source negative. It does not rule out an encrypted private email or a response retained only on the participant's original server; neither is present in the examined public artifacts, and no private mailbox or hidden service was accessed.

## Distinct participant-owned version-control acquisition route (#3328, Agent 3, 28 November 2026)

The new source class is early participant-owned repositories and their historical trees, rather than another scan of the modern aggregated archive or Stage10 POST reproduction.

| Historical source | Result |
|---|---|
| [iIIustrious/3301code, 2015 local-working-files import b66622a](https://github.com/iIIustrious/3301code/tree/b66622a9af72570cd81d82904b225ca088084aae/3301code/server) | Repository created 24 January 2014; January 2014 commit sequence, then 10 March 2015 local-working-files import. README identifies 2013/2014 solving scripts. The imported `server/save_file.py` and `server/server.py` both save the uploaded bytes under a relative `files/` directory. The import contains only the four server source/HTML files, no received files, key or request log. The subsequent [pre-removal duplicate tree 36efd2a](https://github.com/iIIustrious/3301code/tree/36efd2a66a62d20c8559fd8468a2f50e8a77c5be) has identical server objects under the duplicated paths; removal of the extra folder did not remove an archived payload. This is an independently accessible, concrete acquisition lead: a contemporaneous local copy of that server's received-file directory (if actually used) and matching recipient record, not the committed script. The import date and code alone do not establish actual May 2014 participation or receipt. |
| [dynomite27/33012014](https://github.com/dynomite27/33012014) and [dynomite27/cicada](https://github.com/dynomite27/cicada) | The known IRC handle's public repositories have respectively three and one commits, all 12 January 2014; the surviving trees have only README files. No later callback record. |
| [Lafolie/cicada](https://github.com/Lafolie/cicada) and [vessarion/cicada](https://github.com/vessarion/cicada) | Shared January 12 histories; early onion material only. The Onion2 Message.txt object is identical across the two trees, not independent May delivery. |
| [235711101131pp/cicada2014](https://github.com/235711101131pp/cicada2014) | Eight blobs, early-stage RSA/hex/PDF/JPEG material and scripts; no Stage10 callback record. |
| [kenorb/cicada-2014](https://github.com/kenorb/cicada-2014) | Shares the micheloosterhof May 11–25 commits, including first LP2 upload; its additional June–September commits reorganize files, add JPEG analysis, or hash-search tools, not an individualized reply. |

Search scope: GitHub repositories matching cicada/3301 created in 2014, followed by actual tree and historical commit inspection of puzzle-related candidates. Unrelated projects were excluded by descriptions and paths. The earliest distinct server implementation above is the actionable preservation object, not an authenticated encrypted reply. No contact with any operator or live service, no private mailbox/key access, and no ciphertext hash or recipient fingerprint can be reported. To advance, a willing participant would need to supply the original received file and contemporaneous recipient-binding metadata; if encrypted, an authorized decryption or authenticated plaintext must connect the result to LP2. The recovered scripts supply no LP2 operand.

**Decision:** #3328's bounded no-copy outcome is satisfied. Preserve the local-file acquisition lead, and leave the external-delivery hypothesis conditional; no unknown LP2 plaintext or shared key is recovered.

## Decision

Close #2998, #3004 and #3328 as bounded public-source no-copy results. Retire the participant /key.asc as a candidate for a **shared LP2 decryption key**; retain its supported role as a participant-specific communication key. Reopen only if an original 2014 participant-service snapshot, saved upload, email attachment, or cryptographically linked encrypted reply is recovered with provenance and exact bytes.

## Sources

- Original Stage10 form: resources/historical/cicada2014-stage10-neuro-form.html
- Signed Stage10 response: resources/external/2014-stage10-post-square-response.html
- Existing protocol synthesis: im-results/cicada2014-stage10-to-stage11-original-operator-gate.md
- First-person account (23 December 2024), especially lines 363–365 and 520–538: https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/
- Modern reconstruction PR #92: https://github.com/iBotPeaches/cicada_3301/pull/92
- Later 2022 example-key commit: https://github.com/neuroretransmit/cicada/commit/41a1f0ff1b95f1162ee01695df7635d9efa8d331
- Later example key file: https://github.com/neuroretransmit/cicada/blob/main/2014/008-sixth-onion/cgi/key.asc
