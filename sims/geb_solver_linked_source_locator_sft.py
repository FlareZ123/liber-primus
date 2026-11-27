"""Recover only the historical source locator and replay metadata for Director #3255.

No book body is published. The original 2014 channel log is pinned by Git blob.
This is an acquisition preflight, not a replay or unknown-page decryption.
"""
from hashlib import sha1, sha256
from html.parser import HTMLParser
from urllib.parse import urljoin
from urllib.request import Request, urlopen
import re

NOTEBOOK = "https://cicadanotebook.com/sessions/125.html"
LOG = "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log"
LOG_SHA = "bdd277c14f94c34b5ae714cd00c238065beeed4e"

def get(url, max_bytes):
    req = Request(url, headers={"User-Agent": "LiberPrimusResearch/1.0"})
    with urlopen(req, timeout=35) as response:
        data = response.read(max_bytes + 1)
        if len(data) > max_bytes:
            raise ValueError("response exceeds bound")
        return data

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.href = None
        self.label = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.href = dict(attrs).get("href")
            self.label = []
    def handle_data(self, data):
        if self.href:
            self.label.append(data)
    def handle_endtag(self, tag):
        if tag == "a" and self.href:
            self.links.append((" ".join("".join(self.label).split()), self.href))
            self.href = None

def main():
    try:
        html = get(NOTEBOOK, 2_000_000)
        parser = Links()
        parser.feed(html.decode("utf-8"))
        print("NOTEBOOK_HTML", len(html), sha256(html).hexdigest())
        for label, href in parser.links:
            if not re.search(r"original report|code and results|python script|coordinate|source URLs|fingerprint", label, re.I):
                continue
            url = urljoin(NOTEBOOK, href)
            print("NOTEBOOK_LINK", label, url)
            if not url.startswith("https://cicadanotebook.com/"):
                continue
            try:
                data = get(url, 1_000_000)
                print("METADATA_FILE", len(data), sha256(data).hexdigest())
                for line in data.decode("utf-8").splitlines():
                    if re.search(r"dropbox|20160411|2016-04-11|23151550|23,151,550|sha256|web.archive.org|archive.org/wayback", line, re.I):
                        print("META", line[:700])
            except Exception as exc:
                print("METADATA_UNAVAILABLE", type(exc).__name__, str(exc)[:200])
    except Exception as exc:
        print("NOTEBOOK_UNAVAILABLE", type(exc).__name__, str(exc)[:200])
    try:
        data = get(LOG, 20_000_000)
        blob = sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
        assert blob == LOG_SHA, (blob, LOG_SHA)
        print("IRC_BLOB", len(data), blob)
        hits = []
        for n, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
            if re.match(r"2014 (Jan 31|Feb 01|Feb  1|Feb 1) ", line) and re.search(r"dropbox.*(?:\.pdf|geb|godel|gödel)", line, re.I):
                hits.append((n, line))
        print("IRC_PDF_LINK_COUNT", len(hits))
        for n, line in hits:
            print("IRC_PDF_LINK", n, line[:600])
    except Exception as exc:
        print("IRC_UNAVAILABLE", type(exc).__name__, str(exc)[:200])
    print("PREFLIGHT_COMPLETE; PDF extraction not executed by this script")

if __name__ == "__main__":
    main()
