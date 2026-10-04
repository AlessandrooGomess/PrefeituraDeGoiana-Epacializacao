import os
import io

path = r'c:\Users\gomes\espacializacao-obras\app\area-do-engenheiro\page.tsx'

with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('Olǭ', 'Olá')

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
