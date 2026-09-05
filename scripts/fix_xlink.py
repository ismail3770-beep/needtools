with open('src/components/icons/IlovePdfIcons.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('xlink:href=', 'xlinkHref=')
content = content.replace('xmlns:xlink=', 'xmlnsXlink=')

with open('src/components/icons/IlovePdfIcons.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed xlink:href")
