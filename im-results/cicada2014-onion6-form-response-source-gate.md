# 2014 Onion6 Stage11: alternative questionnaire reply not recoverable from surviving public sources

**Conclusion:** no authenticated distinct questionnaire response has been recovered. The only public support for the claim is a 2024 retrospective sentence. This is an evidence-limited negative, not proof that no private or unarchived participant ever received such a response.

## Claim under test

A December 2024 reconstruction says that some participants received a “welcome questionnaire message” instead of the standard redirect after the 2014 hidden-service submission flow. The account gives no recipient identity, date, filename, upload path, plaintext, signature, encrypted envelope, or byte-preserving HTTP/Tor capture. It is the sole source located for a distinct questionnaire outcome.

Source: [Connor Tumbleson, 23 December 2024](https://connortumbleson.com/2024/12/23/the-cicada-3301-mystery-puzzle-3-solve-part-4/).

## Disambiguating the tempting “welcome” artifacts

There are two different 2014 artifacts whose filenames can mislead:

1. **iBotPeaches messages/2014/welcome.asc** is a validly signed message dated **2014-01-06 07:35:27 UTC** in the independent signature inventory. Its cleartext is “Welcome. Good luck. 3301” followed by an RSA-OAEP encrypted payload. It is the January RSA-OAEP challenge, not a post-submission Stage11 questionnaire. The inventory maps it to 2014-01-rsa-oaep-challenge.asc (SHA-256 65ff60bfa019e424ce2ae23994f19af5692f7e12e6bc177830b42a154985defd).
2. **2014-01-onion-welcome.asc** in the later corpus is a whitespace variant of the ordinary Stage11 redirect. Its signed body says “Hello. Your enlightenment awaits you,” gives ky2khlqdf7qdznac.onion, and says “We look forward to hearing from you.” The same signature packet is carried by hello-your-enlightenment.asc, message.txt.asc, ky_2014-01-final-message.asc, and ky_2014-05-liber-primus-release.asc. These are copies/format variants of one message, not distinct replies.

The earlier hello-you-have-done-well.asc is the January upload-instructions/form stage, not an alternative response after the Stage11 submission.

## Strongest surviving public record

- The independent [Dukotah signature timeline](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json) contains 15 distinct 2014 Cicada signatures. The only April 2014 signature in that inventory is the Stage11 redirect signature, dated **2014-04-02 08:49:51 UTC**; no second signed questionnaire response is listed.
- The accompanying [signature inventory](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURES.json) classifies ibotpeaches/messages/2014/hello-your-enlightenment.asc as VALID, SHA-256 967990fd9415a13d18830e4159d8228b4c3ef443b712c293d56f04a28415cb18. It records the same signed content in the cijhho123 2014onion7 participant dropbox and in the later PGP corpus. The inventory also classifies the January 6 RSA-OAEP welcome challenge as VALID.
- The [iBotPeaches 2014 message archive](https://github.com/iBotPeaches/cicada_3301/tree/master/messages/2014), the [scream314 participant reconstruction](https://github.com/scream314/cicada3301/blob/master/2014.md), and the [neuroretransmit 2014 archive](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2014/010-hidden-service-reply) preserve the standard redirect; no distinct questionnaire payload appears in those collections.
- The [pnotisdev source review](https://github.com/pnotisdev/cicada3301/blob/main/work/laptop_review/05_cicada_primary.md) distinguishes the January welcome/form stage from the May 2014 response-message stage.
- The contemporaneous [OpenPuff/Cicada 2014 write-up](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf) documents the submission flow; its authors say they heard nothing after their final submission. It does not report a questionnaire, but it is only one participant account and cannot establish what every other participant received.

Targeted GitHub searches for questionnaire, “welcome questionnaire,” and message.txt.asc across the inspected archives surfaced no separate response artifact. Search-index absence is not proof of nonexistence.

## Upload-endpoint actor correction

The original 2014 signed instruction explicitly delegates `/cgi-bin/upload` to **the participant's own** Tor hidden service; the May 2 `GET /key.asc` and `POST /cgi-bin/upload` are outbound **Cicada-client** requests to that participant. The archived `cgi/cgi.py` is marked as a mock by its author. Thus [the original operator source gap](2014-stage11-upload-direction-correction.md) concerns Cicada's outbound client and distinct upload envelopes rather than a hypothetical Cicada-owned `/cgi-bin/upload` handler. The standard reply is clear-signed; fetching a public key alone does not prove how the author used it.

## Decision

**Close the alternative-response search as unrecoverable from the surviving public record.** The 2024 retrospective claim remains uncorroborated. The January welcome.asc is an earlier RSA-OAEP challenge; the later filenames containing “onion-welcome” are copies of the standard signed redirect. No authenticated distinct Stage11 questionnaire message, recipient-specific key/state, or LP2-relevant instruction was recovered.

Reopen only if someone supplies an original recipient-side message, signed/encrypted envelope, private archive, or byte-preserving HTTP/Tor capture with a traceable recipient and timestamp. Do not infer the questionnaire's contents or treat the retrospective sentence as cryptographic evidence.
