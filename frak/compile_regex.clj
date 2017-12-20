(require '[clojure.java.io :as io])
(require 'frak)
(def words
  (-> (io/file "./target/cards.txt")
  io/reader
  line-seq))
(def regex-file-path "../Eternal Card Plugin/resources/card_match.txt")
(def word-reg (frak/pattern words {:whole-words? true}))
(io/delete-file regex-file-path true)
(with-open [w (clojure.java.io/writer regex-file-path :append true)]
  (.write w (str word-reg)))
