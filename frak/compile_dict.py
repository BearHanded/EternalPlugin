# Read through a json doc, adding lines to a txt dict with each card entry
# Updated for set 2
import json
import os

with open('eternal-cards.json') as json_data, open('./target/cards.txt', 'w') as outfile:
    #Initial call, previous json format
    #wrapper = json.load(json_data)
    #card_list = wrapper['Cards']

    #TODO: Add list of common names/nicknames: i.e. Diogo

    card_list = json.load(json_data)
    for card in card_list:
        print card['Name']
        encoded = card['Name'].encode('utf-8')
        outfile.write(encoded+'\n')
