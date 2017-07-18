# EternalPlugin
Plugin for linking and viewing card lists in eternal.

Runs on preapproved pages in the manifes and builds links when it finds cards in the Deck Import format from Eternal Card Game.

Links to Eternal Warcry and displays their card art on mouseover.

This project is not associated with Eternal Card Game or Direwolf and is a fan made plugin.

# Installation
To install the plugin, navigate to it's page in the [Google Web Store](https://chrome.google.com/webstore/detail/eternal-card-plugin/lnkfahodgopogehaemmnjcneolimcnbn), and install there. After successfully installing the app, there are a few configuration options in the plugin's menu.

# Running Frak and generating regex
Frak must be run against the entire card list to generate the title regex. The /frak directory contains a py script to run against a json document of cards, that is fed into frak. After installing frak, follow the steps below.

First modify the match words default setting in the cljx(?) script to true for exact matches.

Navigate to a installed directory of Frak and run:
`lein repl`

Once the configuration has been set up, run the text contained in `./frak/frak_console.txt`. This will output (and notably append) the generated regex to the card regex file.

Finally, move the regex to the plugin's root folder -> `./resources/card_match.txt`

# Acknowledgements & Resources
+ The plugin uses copy.js to provide copyable texts for deck lists