# EternalPlugin
Plugin for linking and viewing card lists in eternal.

Runs on preapproved pages in the manifest and builds links when it finds cards in the Deck Import format from Eternal Card Game.

Links to Eternal Warcry and displays their card art on mouseover.

This project is not associated with Eternal Card Game or Direwolf and is a fan made plugin.

# Installation
To install the plugin, navigate to it's page in the [Google Web Store](https://chrome.google.com/webstore/detail/eternal-card-plugin/lnkfahodgopogehaemmnjcneolimcnbn), and install there. After successfully installing the app, there are a few configuration options in the plugin's menu.

# Updating cards from EternalWarCry

You must have Python and [lein](https://leiningen.org/) installed.

1. `cd frak`
2. `wget -N https://eternalwarcry.com/content/cards/eternal-cards.json`
3. `python compile_dict.py`
4. `cat compile_regex.clj | lein repl`

# Acknowledgements & Resources
+ The plugin uses copy.js to provide copyable texts for deck lists
+ Thanks to eternalwarcry.com for the assistance and json of set lists
+ Thanks to [bbugh](https://github.com/bbugh) for the update for set 3, and automating the entire build process.
