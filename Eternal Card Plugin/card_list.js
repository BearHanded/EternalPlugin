// Brendan Myers
// Rudimentary Str search & highlight functions for card list app
// Update to point to Eternal Warcry
// https://eternalwarcry.com/cards/details/1-250
const SET_REGEX = /\(Set.*/,
    NUM_REGEX = /#.*\)/,
    ETERNAL_WARCRY = "https://eternalwarcry.com/cards/details/",
    CARD_ART =       "https://cards.eternalwarcry.com/cards/full/",
    CARD_SIZE = '50',
    MAX_ENTRIES = 10,
    DECK_MIN = 6;

// Escape characters for strings that break links in the attributes. Funky quotes
function strSanitize( stringIn ) {
    // Clean up odd encoding of '
    var cleaned = stringIn.replace(/’/g, "'")
    cleaned = encodeURIComponent(cleaned).replace(/'/g, '%27')

    //Remove leading underscores if exists
    cleaned = cleaned.replace(/^_/, '');
    return cleaned
}

function buildLink(dirUrl, imgId, text) {
    dirLink = '<a data-card-name="' + imgId + '" class="card-view" ';
    dirLink += 'href="' + dirUrl + '" target="_blank">';
    dirLink += text;
    dirLink += '</a>';
    return dirLink;
}


/* Replace text with link - Chaos Champion -> "Chaos%20Champion"
Returns [success(bool), link(str)] */
function wrapLink(textIn) {
    // 4 Desert Marshal (Set1 #332)
    // Split ['4', 'Desert', 'Marshal', '(Set1', '#332)']
    //TODO: Need 1-332

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

//Card names should have "*(Set #*)"
//Cards should be a whole line
//Want [2]-> '(Set*'
var crawlText = function(parentNode){
    //Check each node, not just the flat body
    for(var i = parentNode.childNodes.length-1; i >= 0; i--){
        var node = parentNode.childNodes[i];
        //  Make sure this is a text node
        if(node.nodeType == Element.TEXT_NODE){
            var out = wrapLink(node.textContent);
            if(out[0] == true){
                // out [0] contains whether or not a replacement was made
                let newSpan = document.createElement('span');
                newSpan.innerHTML = out[1];
                node.parentNode.replaceChild(newSpan,node);
            }

        } else if(node.nodeType == Element.ELEMENT_NODE){
            //  Check this node's child nodes for text nodes to act on

            crawlText(node);
        }
    }
};

function init() {
    // Run Crawl
    crawlText(document.body);

    // Add Hover Behavior
    $(document).ready(function () {
        var yOff = 20;
        var xOff = 25;

        $(document).on('mouseenter', ".card-view", function (e) {
            var cardName = strSanitize($(this).attr("data-card-name"))
            var artPath = CARD_ART.concat(cardName, ".png");

            $("body").append("<p id='card-img'><img src='" + artPath + "'/></p>");
            $("#card-img")
                .css("position", "absolute")
                .css("top", (e.pageY - yOff) + "px")
                .css("left", (e.pageX + xOff) + "px")
                .css("z-index", "999")
                .fadeIn("fast");
        })

        //TRIGGERED ON MOVE?
        $(".card-view").mouseleave(function () {
            $("#card-img").remove();
        });

        $(".card-view").mousemove(function (e) {
            $("#card-img")
                .css("top", (e.pageY - yOff) + "px")
                .css("left", (e.pageX + xOff) + "px");
        });
    });
}

init()