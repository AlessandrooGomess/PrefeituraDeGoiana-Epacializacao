import re

path = 'app/portal.module.css'
with open(path, 'r', encoding='utf8') as f:
    css = f.read()

css = re.sub(r'\.portal-shell > footer \{.*?\border-top: 1px solid var\(--cor-header-footer\);\s*\}', '', css, flags=re.DOTALL)
css = re.sub(r'\.portal-shell > footer a \{.*?\text-decoration: none;\s*\}', '', css, flags=re.DOTALL)
css = re.sub(r'\.portal-shell > footer \{.*?\padding: 8px 12px;\s*\}', '', css, flags=re.DOTALL)

with open(path, 'w', encoding='utf8') as f:
    f.write(css)
