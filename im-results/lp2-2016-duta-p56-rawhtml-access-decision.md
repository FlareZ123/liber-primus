# 2016 DUTA raw-HTML custody and the AN END digest: access decision

**Scope (Agent22, 13 November 2026, Director #781).** No recovered p56 preimage, target hostname, unknown LP2 plaintext, or authentic hash-algorithm selector. This is a bounded **archive accessibility/byte-boundary decision**, not a failed source-byte hash test. Do not count inaccessible material as a negative match.

## Independently supported source chain

- **Original DUTA, May–July 2016:** the primary EACL 2017 paper reports a crawler reaching 7,931 Tor-v2 services, of which 6,831 were manually labeled. It followed links to depth two and **concatenated the fetched HTML pages of each service into one per-host HTML file**. Original individual HTTP-response byte boundaries are therefore **not guaranteed by the published dataset description**. [EACL 2017 primary paper](https://aclanthology.org/E17-1004/); [authors' technical account](https://www.forensicfocus.com/articles/classifying-illegal-activities-on-tor-network-based-on-web-textual-contents/).
- **Later DUTA-10K:** a further 3,536 services collected in 2017 yielded 10,367 total. The ToRank authors explicitly describe rendering the pages with Lynx to remove HTML tags and saving **text-cleaned** per-service samples. The public classification corpus is thus not byte-exact original 2014/2016 HTTP response evidence. [2019 ToRank paper](https://www.researchgate.net/publication/330408502_ToRank_Identifying_the_Most_Influential_Suspicious_Domains_in_the_Tor_Network); [author thesis](https://buleria.unileon.es/bitstream/handle/10612/11776/Tesis%20de%20Mhd%20Wesam.pdf?sequence=1).
- **Material actually preserved:** the 2025 IMDEA/UC3M paper *Snorkeling in Dark Waters* expressly says the authors of DUTA-10K supplied its researchers with a **large subset of raw HTML files**. The paper's training data have 2,200 category-balanced samples, a subset **not claimed to be a complete original 2016 host inventory**. It does not establish original per-page boundaries or byte-exact retention. [2025 paper, Section II-E](https://dspace.networks.imdea.org/bitstream/handle/20.500.12761/1956/Snorkeling_in_dark_waters.pdf?isAllowed=y&sequence=1).
- **Access check, 13 Nov 2026:** the published GVIS dataset landing page `https://gvis.unileon.es/datasets-duta-10k/` returned an access-denied page to this research session. Targeted public-web and repository searches did not expose authorized downloadable 2016 per-page raw HTML, a date/URL coverage manifest, or an indexed record linking the known Cicada LP2 distribution host to DUTA. The failure to reach that landing page does **not** establish that the dataset is private or has disappeared. No dataset/crawl files were obtained or hashed; no external outreach was made.

## Frozen authorized, minimal next decision

The **exact image-printed p56 target** is the 128-character hex value:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

Treat **SHA-512 as an explicit test hypothesis**, since p56 says only that a page “hashes to” this digest. The known `ky2khlqdf7qdznac.onion` delivered the 2014 book; it is **not an authenticated identity for the unknown target page**.

With maintainer authorization, a *custodian-controlled and metadata-only* inquiry to the original DUTA authors or 2025 IMDEA study custodians should ask:
1. Does the retained raw subset contain **any original May–July 2016** per-host records, with trustworthy host/date coverage metadata? Does it contain the known LP2 distribution host? A host absence says nothing about the unknown target host.
2. Were the original **individual HTTP response bodies** and their exact byte boundaries retained, or only HTML appended together per host? Are original capture URLs and timestamps recoverable?
3. **Only under the custodian's own ethics/access authorization**, can they perform a confidential equality check of SHA-512 of byte-exact, retained original response bodies against the single fixed digest above (host concatenations separately labeled), returning **only match yes/no and coverage counts**? If yes, report solely matching page byte length, original URL, capture date and independent byte-hash verification. Do not request, enumerate, download or redistribute unrelated hidden-service content.

**Fork:** a match on an independently verifiable original single-page byte stream is an authentic continuation candidate and warrants a new Director issue. A zero-match on a proven complete, source-byte-accurate authorized collection is a bounded archival negative. A zero-match on text-normalized or host-concatenated files, an unknown subset, or an inaccessible corpus is **inconclusive**. Until a custodian can answer the boundary/coverage questions, the p56 archive path remains an externally blocked evidence-acquisition lead rather than an executable local cryptanalytic attack.
