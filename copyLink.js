COPY_AS_PLAIN_MENU_ITEM_ID = 'CopyAsPlainText';
COPY_AS_MARKDOWN_MENU_ITEM_ID = 'CopyAsMarkdown';
COPY_LINK_MENU_ITEM_ID = 'CopyLink';

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: COPY_LINK_MENU_ITEM_ID,
  title: "Copy Link as Rich Text",
  contexts: ["browser_action"],
});
chrome.contextMenus.create({
  id: COPY_AS_PLAIN_MENU_ITEM_ID,
  title: "Copy Link and Title as Plain Text",
  contexts: ["browser_action"],
});
chrome.contextMenus.create({
  id: COPY_AS_MARKDOWN_MENU_ITEM_ID,
  title: "Copy Link and Title as Markdown Text",
  contexts: ["browser_action"],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case COPY_AS_PLAIN_MENU_ITEM_ID:
      copyLinkAsPlainTextToClipboard(tab);
      break;

    case COPY_LINK_MENU_ITEM_ID:
      copyLinkToClipboard(tab);
      break;

    case COPY_AS_MARKDOWN_MENU_ITEM_ID:
      copyLinkAsMarkdownToClipboard(tab);
      break;

    default:
      throw Error('Unknown menu item' + info.menuItemId);
  }
});

// onClicked action gives us the tab without any permissions needed.
chrome.browserAction.onClicked.addListener(function(tab) {
  copyLinkAsMarkdownToClipboard(tab);
});

chrome.commands.onCommand.addListener(function(command) {
  switch (command) {
    case 'copy-link':
      getActiveTab(function(tab) {
        return copyLinkToClipboard(tab);
      });
      break;

    case 'copy-as-plain':
      getActiveTab(function(tab) {
        return copyLinkAsPlainTextToClipboard(tab);
      })

    case 'copy-as-markdown':
      getActiveTab(function(tab) {
        return copyLinkAsMarkdownToClipboard(tab);
      })

    default:
      throw new Error('Unknown command: ' + command);
  }
});

function getActiveTab(callback) {
  requestPermissions('tabs', function() {
    chrome.tabs.query({
        lastFocusedWindow: true,
        active: true
      }, function(tab) {
        if (tab && tab.length > 0) {
          callback(tab[0]);
        } else {
          showNotification('Error', 'Unable to get link: No active tab.');
        }
      });
  });
}

function requestPermissions(permission, callback) {
  chrome.permissions.request({
    permissions: [permission]
  }, function(granted) {
    if (granted) {
      callback();
    } else {
      if (permission != "notifications") {
        showNotification('Error', 'Unable to get link: User rejected tabs permissions request.');
      } else {
        console.log('Unable to show the message: Notifications permissions rejected.');
      }
    }
  });
}

function showNotification(title, text) {
  requestPermissions('notifications', function() {
    var opt = {
      type: 'basic',
      title: title,
      message: text,
      iconUrl: 'icon.png'
    };
    chrome.notifications.create("", opt, function() {});
  });
}

function getUrl(tab) {
  return tab.url;
}

function getTitle(tab) {
  return tab.title.replace(/(- Google Docs|- Google Slides|- Google Sheets)$/, '');
}

function copyLinkAsPlainTextToClipboard(tab) {
  var url = getUrl(tab);
  var title = getTitle(tab);
  console.log('Copying to clipboard', url, title);

  var span = document.createElement('span');
  span.innerText = title + ' ' + url;
  document.body.appendChild(span);
  try {
    span.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    showNotification('Link is ready to be pasted', '"' + title + '" was copied to clipboard');
  } finally {
    span.remove();
  }
}

function copyLinkAsMarkdownToClipboard(tab) {
  var url = getUrl(tab);
  var title = getTitle(tab);
  console.log('Copying to clipboard', url, title);

  var span = document.createElement('span');
  span.innerText = '['+ title + '](' + url + ')';
  document.body.appendChild(span);
  try {
    span.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    showNotification('Link in markdown format is ready to be pasted', '"' + title + '" was copied to clipboard');
  } finally {
    span.remove();
  }
}

function copyLinkToClipboard(tab) {
  var url = getUrl(tab);
  var title = getTitle(tab);
  console.log('Copying to clipboard', url, title);

  var link = document.createElement('a');
  link.innerText = title;
  link.setAttribute('href', url);
  document.body.appendChild(link);
  try {
    link.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    showNotification('Link is ready to be pasted', '"' + title + '" was copied to clipboard');
  } finally {
    link.remove();
  }
}

