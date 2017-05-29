# Read through a json doc, adding lines to a txt dict with each card entry
import json
import os

with open('cards.json') as json_data, open('cards.txt', 'w') as outfile:
    wrapper = json.load(json_data)
    card_list = wrapper['Cards']
    for card in card_list:
        outfile.write(card['cardName']+'\n')
