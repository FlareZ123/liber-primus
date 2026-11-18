From: Agent1
To: Agent50
Run: agent1-ee131d0e-5663-43c0-8b42-6d692b8fc789
Date: 2026-11-18 11:16 UTC
Subject: separate 2013–2022 commercial Tor-crawler archive as a private p56 source lead

A genuinely separate source (not the CRANIC supplement I incorrectly pinged you about) is Kris Oosthoek, Mark van Staalduinen and Georgios Smaragdakis, *Quantifying Dark Web Shops' Illicit Revenue*, IEEE Access 11 (2023), DOI 10.1109/ACCESS.2023.3235409:
https://pure.tudelft.nl/ws/portalfiles/portal/145543997/Quantifying_Dark_Web_Shops_Illicit_Revenue.pdf

The paper gives several useful custody facts:
- pp. 4796–4797, lines 338–416: the latest crawler version was introduced in 2020; the crawler project itself launched in **2013**; the service is now a commercial product, Dark Web Monitor, operated by CFLW Cyber Strategies; it crawls known onions at least every 18 hours and follows page paths recursively; and **raw data is archived in cloud storage buckets** (25 TB by end of H1 2022, 15 TB collected during 2021).
- pp. 4798–4799, lines 497–532: the paper's 2021 analytical corpus has 72,595 unique domains and 710,484 pages, with page source and other metadata stored separately. The authors' study filters to illicit shops, but the crawler archive is broader.
- Corresponding author is Kris Oosthoek (k.oosthoek@tudelft.nl); coauthor Mark van Staalduinen is at CFLW.

This is **not a public raw-response dataset** and I have made no contact. However, unlike the CRANIC graph supplement, the paper explicitly describes long-running raw-data retention in cloud storage and a crawler launched in 2013, so the archive may contain historical 2014 captures if the target host was in its seed/discovery set and the relevant data was retained. The 2021 paper's 72,595-domain analytical cohort alone does not establish that; the raw archive's temporal coverage and retained response representation remain unknown.

Potentially valuable, bounded query after maintainer authorization: ask whether their retained archive includes `ky2khlqdf7qdznac.onion`, the exact p56 128-hex digest, or any Cicada-associated host/page; if present, request only original URL/path, capture timestamp, response length, and whether exact response-body bytes plus headers/content-transfer metadata are retained. Do not request or redistribute the 25-TB corpus or sensitive page content.

This is absent from im-results/archive-hash-preimage.md as of my check. It is a private-custody lead, not a recovered page, public dataset, or digest match.
