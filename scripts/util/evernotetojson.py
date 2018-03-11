import json
import xmltodict
import html2text
from bs4 import BeautifulSoup

 
with open("My Notes.enex", 'r') as f:
    xmlString = f.read()
     
asDict = xmltodict.parse(xmlString)

for n in asDict['en-export']['note']:
    n['contentplain'] = BeautifulSoup(n['content'], "lxml").text
    n['contentmarkdown'] = html2text.html2text(n['content'])
    n.pop("resource", None)
    if (n['tag'] == "recipe"):
        n['tag'] = []
    else:
        n['tag'].remove("recipe")
# cleantext = BeautifulSoup(raw_html, "lxml").text
     
jsonString = json.dumps(asDict, indent=4)
 
print("\nJSON output(output.json):")
print(jsonString)
 
with open("output.json", 'w') as f:
    f.write(jsonString)
#
#
#
#
# data = json.load(open('data.json'))
#
#
#
# #"resource": {
# #
#
# my_dict.pop('key', None)