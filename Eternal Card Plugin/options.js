// Saves options to chrome.storage
function save_options() {
  var size = document.getElementById('card-size').value,
    displayCard = true,
    caseSensitive = document.getElementById('case-sensitive').checked,
    matchAll   = document.getElementById('card-match').checked,
    linkMatch  = document.getElementById('link-match').checked,
    deckButton = document.getElementById('deck-button').checked;

  chrome.storage.sync.set({
    cardSize: size,
    displayCard: displayCard,
    caseSensitive: caseSensitive,
    cardMatch: matchAll,
    linkMatch: linkMatch,
    deckButton: deckButton
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  //Defaults
  chrome.storage.sync.get({
    cardSize: 'medium',
    displayCard: true,
    caseSensitive: true,
    cardMatch: true,
    linkMatch: true,
    deckButton: true
  }, function(items) {
    document.getElementById('card-size').value = items.cardSize;
    document.getElementById('case-sensitive').checked = items.caseSensitive;
    document.getElementById('card-match').checked = items.cardMatch;
    document.getElementById('link-match').checked = items.linkMatch;
    document.getElementById('deck-button').checked = items.deckButton;
  });
}

// Init
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);