#!/usr/bin/env python3
"""Independent algorithm for the final self-check; this is NOT an independent reviewer."""
import argparse, collections, hashlib, json, re
from pathlib import Path
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('capture', type=Path)
parser.add_argument('generated', type=Path)
a = parser.parse_args()
norm = lambda text: re.sub(r'\{[^}]+\}', '{}', text)
spec = json.loads((a.capture / 'openapi.json').read_text())
# Traverse the raw OAS afresh. No imports or output from extract.py/generate.mjs.
schema_set = {verb.upper() + ' /api' + norm(path) for path, obj in spec['paths'].items()
              for verb in obj if verb in ['get', 'post', 'delete', 'put', 'patch', 'head', 'options']}
reference_set = set()
empty_pages = []
for file in sorted((a.capture / 'reference').glob('*.md')):
    lines = file.read_text().splitlines()
    resource = next(line for line in lines if line.startswith('|  Resource  |'))
    path = re.search(r'/api/[^ `|]+', resource)[0]
    methods = next((line for line in lines if line.startswith('|  Supported methods  |')), '')
    for method in re.findall(r'`(GET|POST|DELETE|PUT|PATCH|HEAD|OPTIONS)`:', methods):
        key = method + ' ' + norm(path)
        assert key not in reference_set, 'Duplicate source operation: ' + key
        reference_set.add(key)
    if not methods:
        empty_pages.append(file.name)
assert schema_set == reference_set
assert len(schema_set) == 281
rows = json.loads((a.generated / 'coverage.json').read_text())
assert {norm(row['id']) for row in rows} == schema_set | {'GET /api/openapi.json'}
assert len(rows) == len({row['id'] for row in rows}) == 282
statuses = collections.Counter(row['status'] for row in rows)
permissions = collections.Counter(row['permissionCategory'] for row in rows)
for row in rows:
    assert row['reason'] and row['reference']
    if row['binding']:
        assert row['status'] in ['covered', 'partial', 'uncertain']
        assert row['binding']['permission'] == row['permissionCategory']
        assert row['verification']['testLocations']
        assert all(value['passed'] and value['requests'] == 1 for value in row['binding']['surfaces'].values())
        assert row['binding']['deniedBeforeHttp']
    else:
        assert row['status'] == 'missing'
    assert (row['status'] == 'uncertain') == bool(row['disputedUnsupportedQueryParameters'])
    assert (row['status'] == 'partial') == bool(row['unsupportedQueryParameters'] or row['unsupportedBodyControls'])
summary = json.loads((a.generated / 'summary.json').read_text())
for key in ['covered', 'partial', 'missing', 'uncertain']:
    assert summary[key] == statuses[key]
for axis, field in [('byGroup', 'group'), ('byPermission', 'permissionCategory')]:
    for group, counts in summary[axis].items():
        group_rows = [row for row in rows if row[field] == group]
        assert counts['total'] == len(group_rows)
        assert all(counts[key] == sum(row['status'] == key for row in group_rows) for key in ['covered', 'partial', 'missing', 'uncertain'])
issue = json.loads((a.capture / 'issue-1.json').read_text())
backlog = {norm(key) for key in re.findall(r'\| P[23] \| (?:ReadOnly|Update) \| `([^`]+)`', issue['body'])}
missing = {norm(row['id']) for row in rows if row['status'] == 'missing'}
assert len(backlog) == 163
assert missing - backlog == {'GET /api/openapi.json', 'POST /api/assignedRoles'}
assert backlog - missing == {'POST /api/assignedRoles/{}'}
assert len((a.generated / 'coverage.tsv').read_text().splitlines()) == 283
result = {'verdict': 'SELF-CHECK PASS', 'independentReview': False,
          'rawOasEqualsFullReference': True, 'referenceOperations': 281, 'metadataOperations': 1,
          'referencePagesWithoutMethods': len(empty_pages), 'counts': dict(statuses),
          'byPermission': dict(permissions), 'issue1BacklogReconciliation': {'retained': 162, 'historicalOnly': ['POST /api/assignedRoles/{}'], 'currentOnly': ['POST /api/assignedRoles'], 'supplementalMetadata': ['GET /api/openapi.json']},
          'unexplainedOperations': [], 'duplicates': []}
print(json.dumps(result, indent=2))
