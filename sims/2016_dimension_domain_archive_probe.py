"""Bounded public-record test of a historical 2012 dimension-product transfer to 2016.

The operation is specified by Cicada's 2012 phone clue: 3301 * prime image
width * prime image height, then append ".com". The candidate 2016 image
is 563x569. Historical registration/response must be evidenced independently.
No original LP2 decoder or claim of an authenticated 2016 destination follows.
"""
from __future__ import annotations

import json
import socket
import urllib.error
import urllib.parse
import urllib.request


def fetch_public_json(label: str, url: str) -> None:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "liber-primus-public-archive-research/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=16) as response:
            data = response.read(500_000)
            print(
                json.dumps(
                    {
                        "source": label,
                        "status": response.status,
                        "url": response.url,
                        "body_excerpt": data[:2000].decode("utf-8", errors="replace"),
                    }
                )
            )
    except (OSError, urllib.error.URLError, ValueError) as error:
        print(json.dumps({"source": label, "error": str(error)}))


def probe(host: str) -> None:
    print(json.dumps({"domain": host}))
    try:
        addresses = sorted(set(x[4][0] for x in socket.getaddrinfo(host, 443)))
        print(json.dumps({"source": "current_DNS_only", "addresses": addresses}))
    except OSError as error:
        print(json.dumps({"source": "current_DNS_only", "error": str(error)}))

    urls = {
        "internet_archive_CDX": (
            "https://web.archive.org/cdx/search/cdx?"
            + urllib.parse.urlencode(
                {"url": host + "/*", "output": "json", "filter": "statuscode:200",
                 "collapse": "urlkey", "limit": 5}
            )
        ),
        "verisign_RDAP": "https://rdap.verisign.com/com/v1/domain/" + host,
        "certificate_transparency": (
            "https://crt.sh/?" + urllib.parse.urlencode(
                {"q": host, "output": "json"}
            )
        ),
    }
    for label, url in urls.items():
        fetch_public_json(label, url)


def main() -> None:
    assert 3301 * 509 * 503 == 845145127
    assert 3301 * 563 * 569 == 1057465447
    for domain in ("845145127.com", "1057465447.com"):
        probe(domain)


if __name__ == "__main__":
    main()
