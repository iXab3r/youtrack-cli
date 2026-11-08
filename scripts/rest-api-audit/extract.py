#!/usr/bin/env python3
"""Extract public contract facts from hash-pinned JetBrains source captures.
No service calls. INPUT is an audit capture directory, OUTPUT is a new directory.
"""
import argparse, collections, hashlib, json, re
from pathlib import Path

METHODS = {'get', 'post', 'delete', 'put', 'patch', 'head', 'options'}
BASE = 'https://www.jetbrains.com/help/youtrack/devportal/'

def canonical(path):
    index = iter(range(1, 100))
    return re.sub(r'\{[^}]+\}', lambda _: '{p%d}' % next(index), path)

def group(path):
    segments = path.split('/')[2:]
    if segments[0] == 'admin':
        if segments[1] == 'customFieldSettings':
            return 'bundles.' + segments[3] if segments[2] == 'bundles' else 'customFields'
        return 'admin.' + segments[1]
    return segments[0]

def digest(data):
    return hashlib.sha256(data).hexdigest()

def dump(file, value):
    file.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def extract(capture, output):
    output.mkdir(parents=True, exist_ok=True)
    schema_bytes = (capture / 'openapi.json').read_bytes()
    schema = json.loads(schema_bytes)
    reference_lock = json.loads((capture / 'reference-lock.json').read_text())
    docs, pages_without_methods, contradictions = {}, [], []
    for entry in reference_lock:
        data = (capture / 'reference' / entry['file']).read_bytes()
        assert digest(data) == entry['sha256'], entry['file']
        text = data.decode()
        resource = re.search(r'\|\s*Resource\s*\|\s*```GENERIC\s+([^\s`]+)', text)
        table = re.search(r'^\|\s*Supported methods\s*\|(.*)', text, re.M)
        assert resource, entry['file']
        path = resource[1]
        if not table:
            pages_without_methods.append({'page': entry['file'], 'path': path})
            continue
        methods = re.findall(r'`(GET|POST|DELETE|PUT|PATCH|HEAD|OPTIONS)`:\s*\[[^\]]+\]\(#([^)]*)\)', table[1])
        assert methods, entry['file']
        for method, anchor in methods:
            identity = method + ' ' + canonical(path)
            assert identity not in docs, identity
            syntaxes = re.findall(r'```GENERIC\s*\n(' + method + r' /api/[^\n]+)', text)
            assert len(syntaxes) == 1, (entry['file'], method, syntaxes)
            syntax = syntaxes[0]
            parameters = re.findall(r'\{([^}]+)\}', syntax.split('?', 1)[1]) if '?' in syntax else []
            caveats = []
            if canonical(syntax.split('?')[0]) != identity:
                caveats.append('Reference Resource table and Request syntax disagree: ' + syntax.split('?')[0])
                contradictions.append({'id': identity, 'tablePath': path, 'requestSyntax': syntax})
            syntax_match = re.search(r'```GENERIC\s*\n' + method + r' /api/[^\n]+', text)
            tail = text[syntax_match.end():].split('\n## ', 1)[0]
            parameter_table = re.search(r'### Request parameters\n(.*?)(?=\n### |\Z)', tail, re.S)
            table_parameters = [] if not parameter_table else [name.strip(' `') for name in
                re.findall(r'^\|\s*([^|]+?)\s*\|', parameter_table[1], re.M)
                if name.strip() not in ['Parameter', '---']]
            docs[identity] = {'referenceParameterTable': table_parameters, 'referencePath': path, 'reference': BASE + entry['file'].removesuffix('.md') + '#' + anchor,
                              'referenceQueryParameters': parameters, 'sourceCaveats': caveats}
    operations = []
    for path, item in schema['paths'].items():
        for method, operation in item.items():
            if method not in METHODS:
                continue
            full_path = '/api' + path
            identity = method.upper() + ' ' + canonical(full_path)
            assert identity in docs, identity
            parameters = [p['name'] for p in item.get('parameters', []) + operation.get('parameters', []) if p['in'] == 'query']
            response = operation.get('responses', {}).get('200', {}).get('content', {}).get('application/json', {}).get('schema', {})
            body = operation.get('requestBody', {}).get('content', {}).get('application/json', {}).get('schema', {})
            if '$ref' in body:
                body = schema['components']['schemas'][body['$ref'].split('/')[-1]]
            readonly = method == 'get' or full_path in ['/api/commands/assist', '/api/search/assist', '/api/issuesGetter/count']
            operations.append({'id': identity, 'group': group(full_path), 'method': method.upper(),
                'path': canonical(full_path), 'openapiPath': full_path,
                'permissionCategory': 'ReadOnly' if readonly else 'Update',
                'openapiQueryParameters': parameters,
                'queryParameters': sorted(set(parameters + docs[identity]['referenceQueryParameters'])),
                'disputedQueryParameters': sorted(set(docs[identity]['referenceParameterTable']) - set(parameters + docs[identity]['referenceQueryParameters'])),
                'responseKind': 'array' if response.get('type') == 'array' else 'object',
                'bodyProperties': sorted(body.get('properties', {})),
                **docs[identity]})
    assert len(operations) == len(docs) == 281
    operations.append({'id': 'GET /api/openapi.json', 'group': 'metadata', 'method': 'GET',
        'path': '/api/openapi.json', 'referencePath': '/api/openapi.json', 'openapiPath': None,
        'permissionCategory': 'ReadOnly', 'queryParameters': [], 'openapiQueryParameters': [],
        'referenceQueryParameters': [], 'referenceParameterTable': [], 'disputedQueryParameters': [], 'responseKind': 'object', 'bodyProperties': [],
        'reference': BASE + 'youtrack-openapi-specification.html',
        'sourceCaveats': ['Documented metadata route outside the resource-index/OpenAPI paths census.']})
    operations.sort(key=lambda row: row['id'])
    source_data = (json.dumps(operations, ensure_ascii=False, indent=2) + '\n').encode()
    (output / 'official-operations.json').write_bytes(source_data)
    lock = {'retrievedDateUTC': '2026-11-08', 'openapi': {'url': 'https://youtrack.jetbrains.com/api/openapi.json',
        'sha256': digest(schema_bytes), 'oasVersion': schema['openapi'], 'infoVersion': schema['info']['version'],
        'pathCount': len(schema['paths']), 'operationCount': len(docs)},
        'reference': {'url': BASE + 'api-resources.html', 'pageDate': '2026-11-04',
            'htmlBuiltOn': re.search(r'name="built-on" content="([^"]+)"', (capture / 'resources.html').read_text())[1],
            'indexSha256': digest((capture / 'resources.html').read_bytes()), 'pages': reference_lock},
        'corroboratingHtml': [{'file': name, 'url': BASE + name,
            'sha256': digest((capture / name).read_bytes())} for name in [
                'resource-api-assignedRoles.html', 'operations-api-assignedRoles.html',
                'operations-api-groups-groupID-ownUsers.html', 'youtrack-openapi-specification.html']],
        'projectionSha256': digest(source_data), 'pagesWithoutMethods': pages_without_methods,
        'syntaxContradictions': contradictions,
        'limits': ['Instance info.version is source evidence, not CLI/server compatibility.',
                   'Upstream URLs are mutable; raw hashes identify this capture, not an upstream immutable commit.',
                   'This projection retains operation facts, not full schemas, response samples or deployment configuration.',
                   'Metadata retrieval is public source research, not profile-backed product proof.']}
    dump(output / 'source-lock.json', lock)
    print(json.dumps({'officialOperations': len(operations), 'referencePages': len(reference_lock),
                      'pagesWithoutMethods': len(pages_without_methods), 'syntaxContradictions': len(contradictions)}))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('capture', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    extract(args.capture, args.output)
