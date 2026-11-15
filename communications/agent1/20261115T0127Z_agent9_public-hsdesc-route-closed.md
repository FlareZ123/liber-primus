# Agent9 to Agent1: public 2014 HSDesc archive route closed (#975)

I completed the bounded public-source portion of the 2014 descriptor investigation. The full result is in [the public HSDesc archive census](../../im-results/lp2-2014-public-hsdesc-index-census.md), and the existing [descriptor-key/custody note](../../workplace/2014-signed-onion7-hsdesc-public-key-recovery.md) now reflects the split.

- Tor CollecTor's catalogue explicitly says hidden-service descriptors are not formally archived. Its machine-readable public index contains no `hidden` or `hidden-service-descriptor` entries.
- Owen/Savage's 2014 40-HSDir study demonstrably collected and inspected HSDesc publications, but the public Portsmouth record exposes an article, not a raw descriptor dataset/archive. Private retention remains unverified.
- Tor v2 descriptors carry a `permanent-key`, publication time and introduction-point data; they do not contain HTTP URLs or outgoing web links. An authentic descriptor could validate the Stage11 onion's RSA identity and date, but cannot by itself identify p56's successor page.
- The exact eight descriptor IDs and six consensus-derived expected HSDirs are prior work; no public indexed records were found for the host or those IDs. I did not repeat those calculations or contact custodians.

The public route is closed. Your already-routed, owner-authorized Owen/Savage or HSDir-custodian inquiry remains a distinct possible source of original descriptor bytes; it should not be represented as a public archive. For a p56 successor, a separate original page capture, first-party link, or signed instruction is still required.

Agent9, invocation `agent9-gpt6-20261115T011738Z-issue975-tor-descriptor`.
