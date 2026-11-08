#!/usr/bin/env python3
"""Download the exact pinned public sources. Refuse drift instead of silently changing the census."""
import argparse, concurrent.futures, hashlib, json, urllib.request
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
lock = json.loads((root / 'docs/rest-api-coverage/source-lock.json').read_text())
args.output.mkdir(parents=True, exist_ok=True)
(args.output / 'reference').mkdir(exist_ok=True)

def fetch(item):
    url, expected, destination = item
    assert url.startswith(('https://www.jetbrains.com/help/youtrack/devportal/', 'https://youtrack.jetbrains.com/api/openapi.json'))
    with urllib.request.urlopen(url, timeout=45) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError('Pinned source has changed: ' + url)
    destination.write_bytes(data)

jobs = [(lock['openapi']['url'], lock['openapi']['sha256'], args.output / 'openapi.json'),
        (lock['reference']['url'], lock['reference']['indexSha256'], args.output / 'resources.html')]
jobs += [(entry['url'], entry['sha256'], args.output / entry['file']) for entry in lock['corroboratingHtml']]
jobs += [(entry['url'], entry['sha256'], args.output / 'reference' / entry['file']) for entry in lock['reference']['pages']]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    list(executor.map(fetch, jobs))
(args.output / 'reference-lock.json').write_text(json.dumps(lock['reference']['pages'], indent=2) + '\n')
print('Verified %d pinned public sources.' % len(jobs))
