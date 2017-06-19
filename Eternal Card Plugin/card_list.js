/* Brendan Myers
Content Script for the Eternal Card Plugin.

To do:
    Extra config options.
    If card length doesn't find #, limit by max size. Replace in <p></p>
    Create link for unfollowable highlights. Ready to enable.
    Enabled features options: Card Display, Deck List, Names in paras
    Copy Deck button. (Future, export to Eternal Warcry)

Links : URL/1-123
Art   : URL/This_Is_a_Card
 https://eternalwarcry.com/cards/details/1-250
*/
/*-----------------------
    URL Notes:
        Each address may have it's own scheme for the id/name
        "https://eternalwarcry.com/cards/details/" + {Set-Number} (1-123)
        "https://eternalwarcry.com/cards/details/name" + {"Card Name"} ("Light the Fuse")
        "https://eternalwarcry.com/cards/cards/full" + {"Card_Name"} (1-123)name

------------------------*/
const SET_REGEX = /\(Set.*/,
    NUM_REGEX = /#.*\)/,
    ETERNAL_WARCRY = "https://eternalwarcry.com/cards/details/",
    CARD_ART =       "https://cards.eternalwarcry.com/cards/full/",
    NAME_URL =       "https://eternalwarcry.com/cards/details/name/",
    SM_CARD = "et-card-sm",
    MD_CARD = "et-card-md",
    LG_CARD = "et-card-lg",
    XL_CARD = "et-card-xl",
    SM_PX = 150,
    MD_PX = 300,
    LG_PX = 450,
    XL_PX = 600,
    MAX_ENTRIES = 10,
    DECK_MIN = 6;

var cardClass = MD_CARD,
    cardPx = MD_PX,
    displayCards = true;

var cardRegex = null;

/* ---------------------------------
 String Building
-----------------------------------*/
// Escape characters for strings that break links in the attributes. Funky quotes
function strSanitize( stringIn ) {
    // Clean up odd encoding of ' and ,
    var cleaned = stringIn.replace(/’/g, "'");
    cleaned = cleaned.replace(/,/g,",")
    cleaned = encodeURIComponent(cleaned).replace(/'/g, '%27')
        .replace(/%252C/g, '%2C');

    //Remove leading underscores if exists
    cleaned = cleaned.replace(/^_/, '');
    return cleaned;
}

function buildLink(dirUrl, imgId, text) {
    dirLink = '<a data-card-name="' + imgId + '" class="card-view" ';
    dirLink += 'href="' + dirUrl + '" target="_blank">';

    dirLink += text;
    dirLink += '</a>';
    return dirLink;
}

/*
 * Title Caps
 *
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */
var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

titleCaps = function(title){
    var parts = [], split = /[:.;?!] |(?: |^)["Ō]/g, index = 0;

    while (true) {
        var m = split.exec(title);

        parts.push( title.substring(index, m ? m.index : title.length)
            .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
                return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
            })
            .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
            .replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
                return punct + upper(word);
            })
            .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

        index = split.lastIndex;

        if ( m ) parts.push( m[0] );
        else break;
    }

    return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
        .replace(/(['Õ])S\b/ig, "$1s")
        .replace(/\b(AT&T|Q&A)\b/ig, function(all){
            return all.toUpperCase();
        });
};

function lower(word){
    return word.toLowerCase();
}

function upper(word){
  return word.substr(0,1).toUpperCase() + word.substr(1);
}

function bufferTrim(buffer){
    /* Trims extra white space and new line from each entry
        and adds only a single new line to the end */
    var cleanBuffer = []
    for (var i in buffer){
        cleanBuffer.push(buffer[i].trim())
    }
    return cleanBuffer.join("\n")
}
/* ---------------------------------
 Content Management
-----------------------------------*/
/* Replace text with link - Chaos Champion -> "Chaos%20Champion"
Returns [success(bool), link(str)] */
function wrapLink(textIn) {
    // 4 Desert Marshal (Set1 #332)
    // Split ['4', 'Desert', 'Marshal', '(Set1', '#332)']

    //vars
    var dirLink = textIn;
    var textArray = textIn.split(" ");

    //Short circuit if paragraph
    if(textArray.length > MAX_ENTRIES) {
        return [false, textIn];
    }

    var index = 0;
    var matched = false;
    var urlPath = null;
    var count_index = 0; //Location of Number of Cards. Used to trim to appropriate size

    for(var index = 0; index<=textArray.length-1; index++) {
        if(!isNaN(textArray[index])){
            //Location of Number of Cards in Deck.
            //Some post formats will include odd characters at the start of a line
            count_index = index
        } else if(NUM_REGEX.test(textArray[index]) && SET_REGEX.test(textArray[index-1])) {
            //IF '(Set23' && '#324)'
            // Get card name from [1] -> [index-2]
            var set = textArray[index-1].split('Set', 2)[1];
            var id_str = textArray[index];
            var cardId = id_str.substring(id_str.lastIndexOf("#")+1,id_str.lastIndexOf(")"));
            var card_name = textArray.slice(count_index+1, index-1).join("_");
            matched = true;

            //Build Paths
            var path = ETERNAL_WARCRY.concat(set, "-", cardId);

            dirLink = buildLink(path, card_name, textIn)
        }
    }
    return [matched, dirLink];
}

// Logic for in paragraph links
function textReplace(text){
    return text.replace(cardRegex, function(match){
        let titleName = titleCaps(match);
        var path = NAME_URL.concat(strSanitize(titleName));
        var card_name = titleName.split(" ").join("_");

        var link = buildLink(path, card_name, match);
        return link;
    })
}

//Splits individual text elements if necessary to perform linking
var matchText = function(node, regex, callback, excludeElements) {

    excludeElements || (excludeElements = ['script', 'style', 'iframe', 'canvas', 'a']);
    bk=0;
    //TODO: Exclude
    /*if(node[0] !== undefined){
        console.log(node[0]);
        if(node[0].tagName !== undefined)
            console.log("Match :" + node.tagName);
    }*/
    node.data.replace(regex, function(all) {
        var args = [].slice.call(arguments),
            offset = args[args.length - 2],
            newTextNode = node.splitText(offset+bk), tag;
        bk -= node.data.length + all.length;

        newTextNode.data = newTextNode.data.substr(all.length);
        tag = callback.apply(window, [node].concat(args));
        node.parentNode.insertBefore(tag, newTextNode);
        node = newTextNode;
    });

    return node;
};

function makeButton(title, copyText) {
    var buttHolder = document.createElement("SPAN");
    var breaker = document.createElement("br");
    var butt = document.createElement("BUTTON");
    var buttText = document.createTextNode(title);

    //Clipboard info
    var btnClass = document.createAttribute("class");
    btnClass.value = "deck-btn";
    butt.setAttributeNode(btnClass);

    var att = document.createAttribute("data-clipboard-text");
    att.value = copyText;
    butt.setAttributeNode(att);

    butt.appendChild(buttText);
    buttHolder.appendChild(butt);
    buttHolder.appendChild(breaker);

    return buttHolder;
}

/* ---------------------------------
 DOM Navigation Logic
-----------------------------------*/
//Card names should have "*(Set #*)"
//Cards should be a whole line
//Want [2]-> '(Set*'
function genLinks(parentNode, cardMatch, deckButton, callLevel = 0){
    //parent Node is normaly document.body.
    //cardMatch(bool): Enable matching all text
    //Check each node, not just the flat body
    var deckCount = 0; //Track at this node level
        replacedChildren = false;
    let lastOccurence = null;
    let streakInfo = [null, null, 0] //depth, offset, distance
    let deckBuffer = [];
    let map = []
    for(var i = parentNode.childNodes.length-1; i >= 0; i--){
        streakInfo[2]++;
        var node = parentNode.childNodes[i];
        //  Make sure this is a text node
        if(node.nodeType == Element.TEXT_NODE){
            // Get Link
            var out = wrapLink(node.textContent);
            if(out[0] == true){
                // out [0] contains whether or not a replacement was made
                let newSpan = document.createElement('span');
                newSpan.innerHTML = out[1];
                node.parentNode.replaceChild(newSpan,node);
                replacedChildren = true;
                deckBuffer.unshift(node.textContent);

                //Manage deck streak
                if(lastOccurence !== null) {
                    //Streak begins
                    streakInfo[1] = streakInfo[2]
                }
                lastOccurence = newSpan
                streakInfo[2] = 0; //Reset Current Distance

            } else if (cardMatch == true){
                //Check for paragraph entries
                matchText(node, cardRegex, function(node, match, offset) {
                    var span = document.createElement("span");
                    span.className = "card-match";
                    span.innerHTML = textReplace(match);
                    return span;
                });
            }
        } else if(node.nodeType == Element.ELEMENT_NODE){
            //  Check this node's child nodes for text nodes to act on
            //  [replacedChildren, deckBuffer, lastOccurence]
            outArray = genLinks(node, cardMatch, deckButton, callLevel+1);

            if(outArray[1].length>0) {
                //Build buffer & lastOccurence
                deckBuffer = outArray[1].concat(deckBuffer);

                //Track streak with depth
                if(lastOccurence !== null) {
                    //Streak begins
                    streakInfo[1] = streakInfo[2]; //Offset = current distance
                    streakInfo[0] = 1; //Match pattern found at depth 1
                }
                streakInfo[2] = 0; //Reset distance
                lastOccurence = outArray[2];
            }
        }
        //IF NO MATCH ON NODE CHECK IT FITS PATTERN
        if((streakInfo[1] !== null) && (streakInfo[1] < streakInfo[2])) {
            //Current distance > pattern offset. Pattern Break
            if(deckButton) {
                var newButton = makeButton("Copy Deck to Clipboard", bufferTrim(deckBuffer));
                lastOccurence.parentNode.insertBefore(newButton, lastOccurence);
            }
            deckBuffer = []
            streakInfo = [null, null, 0]
        }

    } // End Child Loop
    //Check if constructed a deck on this node.
    if(deckButton && (deckBuffer.length > DECK_MIN)) {
        var newButton = makeButton("Copy Deck to Clipboard", bufferTrim(deckBuffer));
        lastOccurence.parentNode.insertBefore(newButton, lastOccurence);
        deckBuffer = []
        streakInfo = [null, null, 0]
    }
    out = [replacedChildren, deckBuffer, lastOccurence]

    return out
};

/* ---------------------------------
 Settings & Init Listeners
-----------------------------------*/
function getConfig() {
    chrome.storage.sync.get(['cardSize', 'displayCard','caseSensitive', 'cardMatch', 'deckButton'],
        function(items) {

        //Defaults
        var size = 'medium',
            caseFlag = false,
            cardMatch = true,
            deckButton = false;

        //Load from memory
        if(typeof items.cardSize !== 'undefined') size = items.cardSize;
        if(typeof items.caseSensitive !== 'undefined') caseFlag = !(items.caseSensitive);
        if(typeof items.cardMatch !== 'undefined') cardMatch = items.cardMatch;
        if(typeof items.deckButton !== 'undefined') deckButton = items.deckButton;
        //Switch to appropriate css class
        switch(size) {
            case "small":
                cardClass = SM_CARD;
                cardPx = SM_PX;
                break;
            case "large":
                cardClass = LG_CARD;
                cardPx = LG_PX;
                break;
            case "xlarge":
                cardClass = XL_CARD;
                cardPx = XL_PX;
                break;
            case "medium":
            default:
                cardClass = MD_CARD
                cardPx = MD_PX;
        }


        //Get Regex & Execute
        var xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.extension.getURL('resources/card_match.txt'), true);
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
            {
                var flags = 'g';
                if (caseFlag)
                    flags += 'i';
                //... The content has been read in xhr.responseText
                cardRegex = RegExp(xhr.responseText, flags)
                genLinks(document.body, cardMatch, deckButton);
                //Make all buttons copyable
                new Clipboard('.deck-btn');
            }
        };
        xhr.send();
        console.log("Watch for new elements: ")
    })

};

function init() {
    //Configure display settings from options
    getConfig();  //Also calls to word match after load
    // Run Crawl. Doesn't need to wait for asynchronous call

    // Add Hover Behavior
    $(document).ready(function () {
        var yOff = 20;
        var xOff = 25;

        //Don't build if setting is off
        $(document).on('mouseenter', ".card-view", function (e) {
            var cardName = strSanitize($(this).attr("data-card-name"))
            var artPath = CARD_ART.concat(cardName, ".png");
            var size = 600;
            $("body").append("<p id='card-img' class='" + cardClass + "'><img src='" + artPath + "'/></p>");
            $("#card-img")
                .css("position", "absolute")
                .css("top", (e.pageY - yOff) + "px")
                .css("left", (e.pageX + xOff) + "px")
                .css("z-index", "999")
                .fadeIn("fast");

            //ADD CSS to img.
            $("#card-img").children('img')
                .css("height", cardPx+"px")
                .css("max-width", "100%")
        })

        //TRIGGERED ON MOVE?
        $(".card-view").mouseleave(function () {
            $("#card-img").remove();
        });

        $(".card-view").mousemove(function (e) {
            // detect if close to edge
            //$(window).width(), $(window).height()
            relTop = $(window).scrollTop();
            let xOffset = xOff
                yOffset = yOff
                threshold = cardPx;
            //if ((e.pageX + threshold) > $(window).width()) {
            if(e.pageX > ($(window).width() + $(window).scrollLeft() - threshold)) {
                xOffset = -1*(threshold*(2/3) + xOff);
            }
            //if ((e.pageY + threshold) > $(window).height())
            if(e.pageY > ($(window).height() + $(window).scrollTop() - threshold)) {
                yOffset = (threshold - yOff);
            }
            $("#card-img")
                .css("top", (e.pageY - yOffset) + "px")
                .css("left", (e.pageX + xOffset) + "px");
        });
        //Detect new tabs opened (links followed, and close display)
        //chrome.tabs.onCreated.addListener(function(tab) {
        //    $(".card-view").dispatch(mouseleave);
        //});
    });
}
// Run
init()

// EOF