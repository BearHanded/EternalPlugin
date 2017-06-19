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

Navigate to a installed directory of Frak.
`lein repl`

`user> (require '[clojure.java.io :as io])
nil
user> (def words
           (-> (io/file "/usr/share/dict/words")
               io/reader
               line-seq))
#'user/words
user> (def word-re (frak/pattern words))
#'user/word-re
user> (every? #(re-matches word-re %) words)
true`


# Acknowledgements & Resources
+ The plugin uses copy.js to provide copyable texts for deck lists