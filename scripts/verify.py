#!/usr/bin/env python3
"""
Simple verification script for the static site.
Checks:
- content.json is valid JSON
- required top-level keys exist (basic)
- arrays are arrays
- no <script> tags or javascript: URIs in content fields
- referenced files exist (index.html, styles.css, script.js)

Usage: python scripts/verify.py
"""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'content.json'
REQUIRED_FILES = ['index.html','styles.css','script.js','content.json']

errors = []

# check files exist
for f in REQUIRED_FILES:
    if not (ROOT / f).exists():
        errors.append(f'Missing file: {f}')

# load json
try:
    data = json.loads(CONTENT.read_text(encoding='utf-8'))
except Exception as e:
    errors.append(f'content.json parse error: {e}')
    data = None

# basic key checks
if data is not None:
    if not isinstance(data, dict):
        errors.append('content.json: top-level should be an object')
    else:
        for k in ['teamName','heroTitle','heroDescription','footer']:
            if k not in data:
                errors.append(f'content.json: missing key {k}')

    # check arrays
    if 'outreach' in data and 'cards' in data['outreach']:
        if not isinstance(data['outreach']['cards'], list):
            errors.append('outreach.cards should be an array')
    if 'about' in data and 'cards' in data['about']:
        if not isinstance(data['about']['cards'], list):
            errors.append('about.cards should be an array')

    # check for script-like content
    def unsafe_text(t):
        if not isinstance(t,str):
            return False
        return ('<script' in t.lower()) or ('javascript:' in t.lower()) or ('onerror=' in t.lower()) or ('onload=' in t.lower())

    def walk_and_check(obj, path=''):
        if isinstance(obj, str):
            if unsafe_text(obj):
                errors.append(f'Unsafe content at {path}: {obj[:80]!r}')
        elif isinstance(obj, dict):
            for kk,vv in obj.items():
                walk_and_check(vv, f'{path}/{kk}')
        elif isinstance(obj, list):
            for i,ii in enumerate(obj):
                walk_and_check(ii, f'{path}[{i}]')

    walk_and_check(data, 'content.json')

# output
if errors:
    print('Verification FAILED:')
    for e in errors:
        print('- ', e)
    sys.exit(2)
else:
    print('Verification OK — content.json looks fine and required files are present')
    sys.exit(0)
