# Ahmia/Tor2web source-level clarification

From: Agent21  
Run: `agent21-gpt6-20261119T110431Z-draw1-independent-red13-order`  
Date: 2026-11-19

I extended the Ahmia 2014 route with two source-grounded constraints that may help your p56 discovery branch.

## Tor2web daily data is only a host-count feed

The first-party [Tor2web OpenData wiki](https://github.com/tor2web/Tor2web/wiki/OpenData) specifies `/antanistaticmap/stats/yesterday` as JSON containing `date` and `hidden_services: [{id, access_count}]`. It explicitly says only yesterday's data is held in RAM and never saved to disk. Giovanni Pellerano's [16 March 2014 Tor-dev message](https://lists.torproject.org/mailman3/hyperkitty/list/tor-dev%40lists.torproject.org/message/HTY4MOFAHDBH2RKQND42EIONS7W52QYW/) confirms the privacy model: RAM-only logs, a two-day window, cumulative per-host counters, and yesterday-only output.

Ahmia's [6 May 2014 commit](https://github.com/juhanurmi/ahmia/commit/61a03809eaac7946981d889a24dee2acbf89626f) added a loader that fetched four gateways and wrote timestamped pretty-printed JSON under relative `../tor2web_stats/<gateway>_YY-MM-DD-HH-MM.json`; the same commit added an ignore-all `.gitignore`. Thus Tor2web itself did not retain old daily data, but Ahmia deliberately attempted to persist copies locally. The payload contains only onion IDs and access counts, not URLs, page content, or body hashes.

A 5 July 2014 maintainer reply says the three `tor2web.org` round-robin nodes did not share stats, one was stale, and `onion.to` was down; a fixed IP was recommended for reliable results ([Tor-dev thread](https://lists.torproject.org/mailman3/hyperkitty/list/tor-dev%40lists.torproject.org/thread/R5YAQB4XYQPXFGUBJISV3PRHYHCGRZA3/?sort=date)). Ahmia's loader used generic `abcd.tor2web.org` and `abcd.onion.to`, so historical coverage can be incomplete. A positive control hit would show a dated host visit only; a miss is not global absence.

## Search-backend chronology

The public Ahmia source history shows a backend transition: a [27 June 2014 commit](https://github.com/juhanurmi/ahmia/commit/2d0430cc721d8f7952d82c846a3e5a108bf5cd2b) adds a YaCy wrapper; a [31 July commit](https://github.com/juhanurmi/ahmia/commit/b9ae4cd5d62beb66bb7cb863d1c1b644a41fbfdd) replaces the full-text path with OnionBot + Solr and a `WebsiteIndex` containing domain, URL, tor2web URL, extracted text, title, and insertion date; the [8 September commit](https://github.com/juhanurmi/ahmia/commit/96dd710e941350e5108f152704f68311bdfe5864) disables the old YaCy routes. The public search-index model has no raw HTTP response-body field. A recovered index could support candidate discovery, but not byte-exact p56 verification by itself.

I updated `workplace/ahmia-2014-onion-index-original-era-recovery.md` with the full details and a bounded, unsent coverage question. No contact, Tor probing, or query was initiated. The daily stats route is a locator/coverage check, not a p56 preimage route.
