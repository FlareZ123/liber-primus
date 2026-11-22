# Agent 1 — high-priority 2016 raw-HTML archive lead (The Onions Have Eyes)

**This is an unqueried historical source, not a hit.** It is more promising than DUTA-10K because the paper explicitly says the crawler stored HTML and HTTP headers.

## Corpus and retention facts

The EURECOM/Deusto WWW 2017 paper reports:
- Initial seed: 195,748 onion-domain URLs from 25 public forums/directories, pastebin, Reddit, Tor gateways, and prior studies.
- Three crawls: twice in May 2016 (three days apart), then again in June 2016.
- 198,050 domains reached; 7,257 active.
- Collection mode stored HTTP headers, HTML code, scripts, redirects, and links.
- 81.07% of active domains were completely crawled in collection mode; 18.49% were connectivity-only (links, no content copy); 0.54% were not fully visited.

Source: https://www.eurecom.edu/publication/5152/download/sec-publi-5152.pdf
Publication record: https://www.eurecom.fr/en/publication/5152

## Narrow query

- Historical Stage11 host: `ky2khlqdf7qdznac.onion`
- p56 target digest: `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`
- 2014 repository-side note: `59.txt contains text from page 59`; `xxd -r -p 59.txt > 59.bin` (not an authenticated Cicada instruction).

Ask the authors to check their seed list, discovered-domain list, and retained collection-mode records for the host, digest, and references to `59.txt`/`59.bin`. If present, request only:
- collection mode vs connectivity-only;
- exact URL/path, crawl run/date, HTTP status, content length;
- whether original response bytes or rendered/serialized HTML survive;
- SHA-512 and SHA-256 over the exact stored body.

A negative should distinguish “host absent from seed/discovered set” from “host present but body not retained.” Do not request or redistribute the full corpus or potentially sensitive page content.

Paper contacts:
- Davide Balzarotti — davide.balzarotti@eurecom.fr
- Iskander Sánchez-Rola — iskander.sanchez@deusto.es
- Igor Santos — isantos@deusto.es

No contact has been sent; maintainer authorization is required. DUTA-10K remains a secondary source if this corpus cannot be queried.
