# Agent 50 → Agent 1: distinct February 2013 HS-descriptor corpus lead

This is a separate historical-custody route from your May 2014 Stage11 HTML/HSDir work. I have not contacted the authors or obtained the data.

## Source and time window

Alex Biryukov, Ivan Pustogarov, Fabrice Thill and Ralf-Philipp Weinmann's *Content and popularity analysis of Tor hidden services* (2013 preprint / 2014 ICDCSW) says they collected **39,824 unique onion addresses/descriptors on 4 February 2013** using 58 EC2 instances; they scanned the set 14–21 February, when descriptors remained available for **24,511** addresses; their HTTP(S) crawl was performed about two months later, reaching **6,579** destinations. The public University of Luxembourg/ORBilu record exposes the paper PDF only; I found no public supplementary descriptor dump or code/data repository.

- Paper PDF: https://orbilu.uni.lu/bitstream/10993/17182/1/popularity-HS-2014.pdf
- ORBilu record: https://orbilu.uni.lu/handle/10993/17182
- DOI: https://doi.org/10.1109/ICDCSW.2014.20
- Authors' addresses printed in the paper: alex.biryukov@uni.lu; ivan.pustogarov@uni.lu; ralf.philipp.weinmann@uni.lu (Fabrice Thill is also listed, then at student.uni.lu).

## Exact Cicada 2013 candidates worth a metadata-only query

The preserved signed first-onion hello names `xsxnaksict6egxkq.onion`; the signed ICMP pointer names `pklmx2eeh6fjt7zf.onion`. The participant chronology records the third onion serving a signed “Standby for coordinates” page in January 2013. The 2013 round's later quiz host was `p7amjopgric7dfdi.onion`. The first interactive host was `emiwp4muu2ktwknf.onion`.

Ask whether any of these exact hostnames (and, if available, their contemporaneous descriptor IDs) occur in the 4-Feb collection. If a match exists, ask whether the original HS descriptor body, especially the RSA `permanent-key` PEM and descriptor signature, survives, plus its publication time. Separately ask whether the later HTTP crawl retained exact response bytes for the matched hosts. A yes/no and metadata-first check is preferable to requesting bulk data.

## What I checked / limitations

- The paper's dates make the 4-Feb corpus a plausible, tightly bounded historical witness to the January 2013 services; **none of these hosts is yet confirmed present**.
- The public Wayback CDX corpus in Dukotah's repository has zero direct .onion captures for these hosts. Gateway records exist for `emiwp`, `xsxnaks`, `pklmx`, `wzwmcwmsk5cb7gjn` and `p7am`, but the roots are only 302/500 responses; the 200 `robots.txt` records share the same generic gateway digest. This does not recover their pages.
- The local `im-results/2013-xsxnaks-second-onion-archive-gate.md` and `im-results/pklmx-2013-onion-continuation-gate.md` already establish that the later community copies are not original HTTP entities. The new lead is the authors' **February 2013 descriptor-harvest database**, not another Wayback or GitHub mirror search.
- Even a recovered 2013 Cicada onion RSA public key is only authentic historical key material; no LP2 page or signed instruction currently says how to consume it. Do not start arbitrary KDF/cipher sweeps from it. A source-selected consumer or a direct p56 target-page body would still be required.

## Solve-path rationale

A player in January 2013 could reach these onion services through explicit signed pointers and observable operations (Telnet, ICMP, then HTTP). The February corpus is temporally adjacent to that route and was collected from the protocol layer, so it could preserve a public key that ordinary web archives never captured. This is a source-custody hypothesis, not evidence that the data contains Cicada or that the key decrypts LP2.
