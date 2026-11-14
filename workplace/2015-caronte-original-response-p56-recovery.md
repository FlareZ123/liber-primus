# CARONTE 2015 original-response retention: independent p56 archive route

**Agent39, 14 November 2026. Classification: distinct, historically plausible source acquisition; no available original HTTP body, p56 hash preimage, unknown LP2 plaintext, key or destination.**

## Original-source causal route

The solved Liber Primus p56 refers to an unspecified deep-web page via one 128-hex digest. The historical 2014 LP2 *distributor* is `ky2khlqdf7qdznac.onion`, but the digest **does not identify a host**, so a distributor-only lookup cannot exhaust the question.

A dated primary-source alternative to contemporary 2014 Ahmia, the 2015 OnionCity search index, 2015 Moore–Rid content sanitization, later DUTA, and the 2016 EURECOM PhantomJS crawl is **Srdjan Matic, Platon Kotzias and Juan Caballero, [CARONTE: Detecting Location Leaks for Deanonymizing Tor Hidden Services](https://software.imdea.org/~juanca/papers/caronte_ccs15.pdf), ACM CCS, 12–16 October 2015**, DOI [10.1145/2810103.2813667](https://doi.org/10.1145/2810103.2813667). Its study is separate in personnel, capture method and population. The exact capture dates are **not reported** by the paper, so the October 2015 publication date is only a conservative bound, not a capture date or proof the 2014 distributor remained live.

The paper explicitly states (§§3.1–3.2) that the exploration **collects each HTTP response, preprocesses it and stores both request and response in a database**. It only downloads text/HTML responses, and for HTTPS additionally retains certificate chains. The test crawled source-discovered URLs, roots and random paths, with eight request variants per target. §4.1 reports 31,849 discovered URLs on 6,426 onion addresses, **4,794 responding URLs and 1,974 live addresses** over four approximately three-day rounds; links discovered during exploration were added to the next round.

A stronger reason to investigate original bytes than merely paper-reported HTML is §3.4.1: CARONTE uses the **hash of each HTTP response body**, plus ETag, Last-Modified, Content-Length, Server, X-Powered-By and HTML-structure comparisons. It also constructed a blacklist by hashing the body of every database page and flagging hashes seen across five DNS domains or status codes. The paper thereby documents an actual native body-hash *consumer*, and its stored object may be far closer to response-entity bytes than a browser-rendered DOM. **Weakest assumption:** the phrase *preprocesses it* is not defined as byte-preserving, so a body hash could apply to sanitized/decoded responses, or raw bodies may not have been retained. No unnormalized body or original headers/URL+UTC specimen has yet been obtained.

## Public release and source search decision, 14 November 2026

The [author-hosted original PDF](https://software.imdea.org/~juanca/papers/caronte_ccs15.pdf) is public, and the [IMDEA faculty publication page](https://software.imdea.org/~juanca/index.html), [institutional bibliography](https://software.imdea.org/~juanca/bibtex.html) and [Milan 2015 archival record](https://air.unimi.it/handle/2434/388603) corroborate the study identity. None of their inspected paper-linked records advertises a byte-preserving crawl deposit, original data archive, full source-code repository or 2014/2015 host inventory. Bounded targeted public web queries using the exact title, authors, `CARONTE`, `dataset`, `code` and `download`, and GitHub repository searches, produced no release attributable to this experiment.

**Avoid the unrelated "Caronte" name collisions:** `michelecampobasso/caronte-crawler` is a *2019 WACCO* crawler of adversarial resources, while `eciavatta/caronte` is a modern CTF network-flow analysis tool. Neither is a public copy of the 2015 CCS Tor corpus. This is an important search disambiguator. These are **surface-bounded public discovery negatives**, not evidence that the university database was destroyed, had no Cicada URL or retained only sanitized data.

The study's stored requests/responses are potentially useful in *two ways*:
1. If exact preprocessed HTTP response bodies can be established as origin-identity, a **single fixed target SHA-512 equality check over all original body objects**, on an authorized private corpus or bounded public one, could recover the p56 preimage. SHA-512 is a candidate algorithm; the author never labels it.
2. A contemporaneous URL or content snapshot that refers to an unknown Cicada continuation host may independently supply a **source-selected cipher instruction**, even if its byte fidelity cannot support the hash.

The known 2014 `ky2khlqdf7qdznac.onion` distributor is a *coverage/fidelity control*. For its original 1,640-byte root index preserved at [resources/cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html), the pinned SHA-256 is `9d515f2c170c44ab0f5acbdc7ba2de2be62cc07b132ab7f9609532b3b5622e80`. A source-identical, same-era capture could check byte fidelity. In 2015 it might have changed or vanished; absence or difference would not rule out the unknown hash target on another host.

## Exact completion gate

Printed solved p56 128-hex target:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

A defensible positive requires **(i)** period URL plus UTC capture and source-body bytes, **(ii)** demonstrated fidelity of the body before any preprocessing or normalization, **(iii)** a full 512-bit equality to the fixed target under an independently motivated digest, or independent period instruction text, and **(iv)** an exact new original-LP2 decoding test using any recovered instruction/key. A site URL or partial body-hash match alone is not p56 decryption.

Publicly reachable originals have **not** been found. This requires a **discrete owner-authorized metadata question** if the maintainer chooses to pursue archival custody: whether the 2015 CARONTE research database survives; whether original unnormalized individual HTTP bodies, original URLs and crawl UTC were retained *before preprocessing*; and whether a custodian could reveal one non-sensitive native positive sample and, conditional on fidelity/permission, run one fixed digest equality locally. No unrelated pages, hidden-service locations, visitors, private inventory or dataset exports are requested. [Owner authorization issue #784](https://github.com/FlareZ123/liber-primus/issues/784) is the permission boundary, not an instruction to contact researchers.

**Research decision:** keep this as one historically distinct original-body opportunity, separate from EURECOM/2014 sources. Without access to original HTTP response entities or an independently useful 2015 Cicada continuation URL, it supplies **no currently runnable original-cipher inverse**. Do not launch a speculative key or hash-variant sweep on its account.
