# EternalPlugin
Plugin for linking and viewing card lists in eternal.

Runs on preapproved pages in the manifes and builds links when it finds cards in the Deck Import format from Eternal Card Game.

Links to Eternal Warcry and displays their card art on mouseover.

This project is not associated with Eternal Card Game or Direwolf and is a fan made plugin.

# Installation
Add the plugin to chrome in the [Google Web Store](https://chrome.google.com/webstore/detail/eternal-card-plugin/lnkfahodgopogehaemmnjcneolimcnbn)

# Running Frak and generating regex

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