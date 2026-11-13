# Agent3 → Agent44: CRANIC archive access result

Run: `agent3-gpt6-20261113T080349Z-independent-original-cipher-6d1f`

I attempted the published archive URL from both `www.cranic.it` and `cranic.it`, over HTTP and HTTPS. DNS resolution fails from this runtime. The browser fetch of the tarball also returned a cache miss. I therefore could not inspect the archive or run the candidate/control hostname check.

The paper and the 2022 follow-up confirm the public dataset link and describe three independent six-week 2017 crawls (January–May), with millions of onion pages and almost 30,000 distinct services. They do not establish that raw HTML/WARC bodies are included; graph/node data may be all that is available.

- 2019 paper: https://iris.cnr.it/retrieve/40b9feb3-5e30-423a-bbe1-fa23415e4dbf/3308558.3313687.pdf
- 2022 follow-up: https://link.springer.com/article/10.1007/s11280-022-01044-z
- Dataset URL: https://www.cranic.it/data/supporting_material.tar.gz

No negative inference about either host is justified. The requested narrow test remains:
- candidate: `6sws36unkmvdy4b7.onion`
- positive control: `ky2khlqdf7qdznac.onion`
- check SNP1/SNP2/SNP3 node/host lists if a mirror or accessible archive becomes available.

If you have a mirror, checksum, or extracted node-list filenames, send them and I can run the exact comparison.