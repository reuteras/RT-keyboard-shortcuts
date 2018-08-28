/*
 * RT Keyboard Shortcuts is an extension for RT from bestpractical.org.
 * The extension is an adaptation by Peter R of Acunote Shortcuts 
 * from Acunote. A very good tool that was extremly easy to adopt for 
 * this purpose!
 *
 * Adds keyboard navigation for:
 * ticket.sys.kth.se
 * rt.reuteras.com
 * rt.cpan.org
 *
 * Add your own installation to the @include section below and in the
 * SupportedSites section. Search for the string CHANGEME and change to 
 * values suitable for your environment.
 *
 * Original message from Acunote:
 *
 *  Acunote Shortcuts.
 *
 *  Acunote Shortcuts is a greasemonkey script based on
 *  Javascript Keyboard Shortcuts library extracted from Acunote
 *  http://www.acunote.com/open-source/javascript-keyboard-shortcuts
 *
 *  Shortcuts Library Copyright (c) 2007-2008 Pluron, Inc.
 *  Reddit, Digg and YCNews Scripts Copyright (c) 2008 Pluron, Inc.
 *  Other scripts are copyright of their respective authors.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*jslint browser: true, newcap: true, plusplus: true, unparam: true, vars: true, continue: true, evil: true */
/*jshint unused: true */
/*global RThelp: false, RTform_submit: false, RTnext_or_prev: false,
 RTmatch_name: false, RTmatch_link: false, rTbaseurl: false,
 RThome: false, RTgototicket: false, RTqueue: false */

// --------------------------------------------------------------------
//
// ==UserScript==
// @name            RT Keyboard Shortcuts
// @description     Adds keyboard shortcuts to RT.
// @namespace       https://reuteras.com/RT
// @include         https://ticket.sys.kth.se/*
// @include         https://rt.reuteras.com/*
// @include         https://rt.cpan.org/*
// @grant           none
// @downloadURL     https://github.com/reuteras/RT-keyboard-shortcuts/raw/master/rtkeyboardshortcuts.user.js
// @updateURL       https://github.com/reuteras/RT-keyboard-shortcuts/raw/master/rtkeyboardshortcuts.meta.js
// @version         0.1.9
// ==/UserScript==
// CHANGEME

/*
 *  ===========================================================
 *  Acunote Shortcuts: The Library
 *  Copyright (c) 2007-2008 Pluron, Inc.
 *  ===========================================================
 */

var myVersion = "Version of RT keyboard shourtcuts is 0.1.9"

function ShortcutsSource() {
    "use strict";
    var shortcutListener = {
        listen: true,
        shortcut: null,
        combination: '',
        lastKeypress: 0,
        clearTimeout: 2000,

        // Keys we don't listen to
        keys: {
            KEY_BACKSPACE: 8,
            KEY_TAB:       9,
            KEY_ENTER:    13,
            KEY_SHIFT:    16,
            KEY_CTRL:     17,
            KEY_ALT:      18,
            KEY_ESC:      27,
            KEY_SPACE:    32,
            KEY_LEFT:     37,
            KEY_UP:       38,
            KEY_RIGHT:    39,
            KEY_DOWN:     40,
            KEY_DELETE:   46,
            KEY_HOME:     36,
            KEY_END:      35,
            KEY_PAGEUP:   33,
            KEY_PAGEDOWN: 34
        },

        init: function() {
            if (!window.SHORTCUTS) { return false; }
            this.createStatusArea();
            this.setObserver();
        },

        isInputTarget: function(e) {
            var targetNodeName, target;
            target = e.target || e.srcElement;
            if (target && target.nodeName) {
                targetNodeName = target.nodeName.toLowerCase();
                if (targetNodeName === "textarea" || targetNodeName === "select" ||
                        (targetNodeName === "input" && target.type &&
                        (target.type.toLowerCase() === "text" || target.type.toLowerCase() === "password"))) {
                    return true;
                }
            }
            return false;
        },

        stopEvent: function(event) {
            if (event.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.returnValue = false;
                event.cancelBubble = true;
            }
        },

        // shortcut notification/status area
        createStatusArea: function() {
            var area = document.createElement('div');
            area.setAttribute('id', 'shortcut_status');
            area.style.display = 'none';
            document.body.appendChild(area);
        },

        showStatus: function() {
            document.getElementById('shortcut_status').style.display = '';
        },

        hideStatus: function() {
            document.getElementById('shortcut_status').style.display = 'none';
        },

        showCombination: function() {
            var bar = document.getElementById('shortcut_status');
            bar.innerHTML = this.combination;
            this.showStatus();
        },

        // This method creates event observer for the whole document
        // This is the common way of setting event observer that works 
        // in all modern brwosers with "keypress" fix for
        // Konqueror/Safari/KHTML borrowed from Prototype.js
        setObserver: function() {
            var name = 'keypress';
            if (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || document.detachEvent) {
                name = 'keydown';
            }
            if (document.addEventListener) {
                document.addEventListener(name, function(e) {shortcutListener.keyCollector(e); }, false);
            } else if (document.attachEvent) {
                document.attachEvent('on' + name, function(e) {shortcutListener.keyCollector(e); });
            }
        },

        // Key press collector. Collects all keypresses into combination 
        // and checks it we have action for it
        keyCollector: function(e) {
            var key, keyCode, code, letter;
            // do not listen if no shortcuts defined
            if (!window.SHORTCUTS) { return false; }
            // do not listen if listener was explicitly turned off
            if (!shortcutListener.listen) { return false; }
            // leave modifiers for browser
            if (e.altKey || e.ctrlKey || e.metaKey) { return false; }
            keyCode = e.keyCode;
            // do not listen for Ctrl, Alt, Tab, Space, Esc and others
            for (key in this.keys) {
                if (this.keys.hasOwnProperty(key)) {
                    if (e.keyCode === this.keys[key]) { return false; }
                }
            }
            // do not listen for functional keys
            if (navigator.userAgent.match(/Gecko/)) {
                if (e.keyCode >= 112 && e.keyCode <= 123) { return false; }
            }
            // do not listen in input/select/textarea fields
            if (this.isInputTarget(e)) { return false; }
            // get letter pressed for different browsers
            code = [ e.which || e.keyCode];
            letter = String.fromCharCode(code).toLowerCase();
            if (e.shiftKey) { letter = letter.toUpperCase(); }
            // IE hack to support "?"
            if (window.ie && (code === 191) && e.shiftKey) {
                letter = '?';
            }
            if (shortcutListener.process(letter)) { shortcutListener.stopEvent(e); }
        },

        // process keys
        process: function(letter) {
            if (!window.SHORTCUTS) { return false; }
            if (!shortcutListener.listen) { return false; }
            // if no combination then start from the begining
            if (!shortcutListener.shortcut) { shortcutListener.shortcut = window.SHORTCUTS; }
            // if unknown letter then say goodbye
            if (!shortcutListener.shortcut[letter]) { return false; }
            if (typeof (shortcutListener.shortcut[letter]) === "function") {
                shortcutListener.shortcut[letter]();
                shortcutListener.clearCombination();
            } else {
                shortcutListener.shortcut = shortcutListener.shortcut[letter];
                // append combination
                shortcutListener.combination = shortcutListener.combination + letter;
                if (shortcutListener.combination.length > 0) {
                    shortcutListener.showCombination();
                    // save last keypress timestamp (for autoclear)
                    var d = new Date();
                    shortcutListener.lastKeypress = d.getTime();
                    // autoclear combination in 2 seconds
                    setTimeout("shortcutListener.clearCombinationOnTimeout()", shortcutListener.clearTimeout);
                }
            }
            return true;
        },

        // clear combination
        clearCombination: function() {
            shortcutListener.shortcut = null;
            shortcutListener.combination = '';
            this.hideStatus();
        },

        clearCombinationOnTimeout: function() {
            var d = new Date();
            // check if last keypress was earlier than (now - clearTimeout)
            // 100ms here is used just to be sure that this will work in superfast browsers :)
            if ((d.getTime() - shortcutListener.lastKeypress) >= (shortcutListener.clearTimeout - 100)) {
                shortcutListener.clearCombination();
            }
        }
    };
}

/*
 *  ===========================================================
 *  RT Keyboard Support
 *  Copyright (c) 2010 Peter <code@reuteras.se>.
 *  ===========================================================
 */
function RTSource() {
    "use strict";
    var Cursor = {
        init: function() {
            shortcutListener.init();
        }
    }, SHORTCUTS = {
        '?': function() { RThelp(); },
        '/': function() { RTmatch_link(/Search\/Build\.html/); },
        '#': function() { RTgototicket(); },
        'a': function() { RTmatch_link(/Status=resolved/); },
        'b': function() { RTmatch_link_click(/TicketBookmark/); },
        'c': function() { RTmatch_link(/Action=Comment/, "break"); },
        'C': function() { RTmatch_link(/Action=Comment/); },
        'e': {
            'b': function() { RTmatch_link(/Modify\.html/); },
            'd': function() { RTmatch_link(/ModifyDates\.html/); },
            'h': function() { RTmatch_link(/History\.html/); },
            'j': function() { RTmatch_link(/ModifyAll\.html/); },
            'l': function() { RTmatch_link(/ModifyLinks\.html/); },
            'p': function() { RTmatch_link(/ModifyPeople\.html/); },
            'r': function() { RTmatch_link(/Reminders\.html/); }
        },
        'd': function() { RTmatch_link(/\/Display\.html/, "break"); },
        'f': function() { RTmatch_link(/Forward\.html/); },
        'F': function() { RTnext_or_prev("first"); },
        'g': {
            'a': function() { RTmatch_link(/Approvals/); },
            'b': function() { RTmatch_link(/Bulk\.html/); },
            'c': function() { RTmatch_link(/Admin/); },
            // If you have the documentation installed
            'd': function() { RTmatch_link(/Developer\/Perldoc/); },
            'h': function() { RThome(); },
            'l': function() { RTmatch_link(/NoAuth\/Logout\.html/); },
            'p': function() { RTmatch_link(/Prefs\/Other\.html/); },
            'S': function() { RTmatch_link(/Results\.html\?Format/); },
            's': function() { RTmatch_link(/Simple\.html/); },
            't': {
                'i': function() { RTmatch_link(/Search\/Build\.html/); },
                'o': function() { RTmatch_link(/Tools/); }
            }
        },
        'L': function() { RTnext_or_prev("last"); },
        'n': function() { RTnext_or_prev("next"); },
        'N': function() { RTform_submit("CreateTicketInQueue"); },
        'o': function() { RTmatch_link(/Status=open/); },
        'p': function() { RTnext_or_prev("prev"); },
        'q': function() { RTqueue(); },
        'Q': function() { RTqueue("new"); },
        'r': function() { RTmatch_link(/Action=Respond/, "break"); },
        'R': function() { RTmatch_link(/Action=Respond/); },
        's': function() { RTmatch_link(/Action=Steal/); },
        't': function() { RTmatch_link(/Action=Take/); },
        'T': {
            'a': function() { RTmatch_link(/Search\/Edit\.html/); },
            'b': function() { RTmatch_link(/Bulk\.html/); },
            'e': function() { RTmatch_link(/Search\/Build\.html\?Format=/); },
            'g': function() { RTmatch_link(/Chart\.html/); },
            'n': function() { RTmatch_link(/Search\/Build\.html\?NewQuery=1/); },
            's': function() { RTmatch_link(/Search\/Results\.html\?Format=/); }
        },
        'V': function() { window.alert(myVersion); return true; },
        // CHANGEME: This function requires that you have added a form to RT to move a ticket to a spam 
        // queue. I'll try to get the code or a pointer to it later...
        'x': function() { RTform_submit("quick-spam"); }
    };
    function RThelp() {
        var RCursorHelp =
            '\n=== Ticket ===\n' +
            '# - open ticket with number\n' +
            'a - resolve\n' +
            'b - bookmark\n' +
            'c - comment\n' +
            'C - comment on last\n' +
            'd - display current ticket or first from a list\n' +
            'e -> Edit:\n' +
            '  b - Basics\n' +
            '  d - Dates\n' +
            '  h - History\n' +
            '  j - Jumbo\n' +
            '  l - Links\n' +
            '  p - People\n' +
            '  r - Reminders\n' +
            'f - forward current ticket\n' +
            'o - open ticket\n' +
            'q - open queue with name from prompt\n' +
            'Q - open queue with name from prompt and show new messages\n' +
            'r - reply\n' +
            'R - reply on last\n' +
            's - steal ticket\n' +
            't - take ticket\n' +
            'x - Mark as spam\n' +
            '\n=== Ticket navigation ===\n' +
            'F - open first ticket\n' +
            'L - open last ticket\n' +
            'n - open next ticket\n' +
            'p - open previous ticket\n' +
            '\n=== General navigation ===\n' +
            'g -> \n' +
            '  a - Approvals\n' +
            '  b - Bulk update\n' +
            '  c - Configuration (if you have access)\n' +
            '  d - Developer docs (if installed)\n' +
            '  h - go to front page\n' +
            '  l - logout\n' +
            '  p - Preferences\n' +
            '  s - simple search\n' +
            '  S - search result page\n' +
            '  t -> \n' +
            '    i - Ticket page\n' +
            '    o - Tools page\n' +
            '\n=== Other ===\n' +
            'N - Create new ticket in default queue\n' +
            'V - Show version number\n' +
            '/ - Search\n' +
            '? - this help\n';

        window.alert(RCursorHelp);
        return true;
    }

    // Submit the form named formName
    function RTform_submit(formName) {
        if (document.getElementById(formName)) {
            document.forms[formName].submit();
        } else {
            event.returnValue = false;
            return false;
        }
        return true;
    }

    // Navigoation using the rel links in the page from RT
    function RTnext_or_prev(direction) {
        var i = 0, links = document.getElementsByTagName("link"), link = -1;
        for (i = 0; i < links.length; i++) {
            if (links[i].hasAttribute("rel") && links[i].rel === direction) {
                link = i;
            }
        }
        if (link === -1) {
            event.returnValue = false;
            return false;
        }
        // Ugly replace, have to check if our last upgrade introduced a conf error CHANGEME
        window.location = links[link].href.replace(/Ticket/, "/Ticket");
        return true;
    }

    // Get the link for the element matchstring and follow it
    function RTmatch_name(matchString) {
        var link = document.getElementsByName(matchString);
        if (link) {
            window.location = link.href;
            return true;
        }
        event.returnValue = false;
        return false;
    }

    // Match a part of a url and follow it
    function RTmatch_link_click(matchString) {
        var breakOn = [matchString || ""],
            links = document.getElementsByTagName("a"),
            link = -1,
            i = 0;
        for (i = 0; i < links.length; i++) {
            if (links[i].href.match(matchString)) {
                link = i;
                if (breakOn === "break") { break; }
            }
        }
        if (link === -1) {
            event.returnValue = false;
            window.alert("nothing to do");
            return false;
        }
        links[link].onclick();
        return true;
    }

    // Match a part of a url and follow it
    function RTmatch_link(matchString) {
        var breakOn = [matchString || ""],
            links = document.getElementsByTagName("a"),
            link = -1,
            i = 0;
        for (i = 0; i < links.length; i++) {
            if (links[i].href.match(matchString)) {
                link = i;
                if (breakOn === "break") { break; }
            }
        }
        if (link === -1) {
            event.returnValue = false;
            window.alert("nothing to do");
            return false;
        }
        window.location = links[link].href;
        return true;
    }

    // Find base url
    function rTbaseurl() {
        var home = document.getElementById('home'); 
        var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
        var path = home.getAttribute('href');
        var url = full + path;
        return url;
    }

    // RT home
    function RThome() {
        var url = rTbaseurl();
        if (url) {
            window.location = url + "index.html";
            return true;
        }
        event.returnValue = false;
        return false;
    }

    // Open ticket number given by prompt number
    function RTgototicket() {
        var nr = window.prompt("Open ticket:", ""), url;
        if (nr) {
            url = rTbaseurl();
            window.location = url + "Ticket/Display.html?id=" + nr;
            return true;
        }
        event.returnValue = false;
        return false;
    }

    // Open the first queue matched by the text from the prompt
    function RTqueue(neworold) {
        var queue = window.prompt("Open queue:", "");
        if (queue) {
            if (neworold === "new") {
                queue = queue + ".*new";
                RTmatch_link(queue);
            } else {
                RTmatch_link(queue, "break");
            }
            return true;
        }
        event.returnValue = false;
        return false;
    }
}

/*
 *  ===========================================================
 *  Shortcuts Library: Supported Sites
 *  This greasemonkey script matches site URL against the
 *  property name and gets the source of the function
 *  specified as property value.
 *  ===========================================================
 */
var SupportedSites = {
    // CHANGEME
    'kth.se':           RTSource,
    'rt.reuteras.com':  RTSource,
    'rt.cpan.org':      RTSource
};

/*
 *  ===========================================================
 *  Shortcuts Library: Loader
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
var addScript = function(ShortcutsSource) {
    "use strict";
    var getSource = function (func) {
        var js = func.toString(), i = js.indexOf('{');
        js = js.substr(i + 1, js.length - i - 2);
        return js;
    }, script = document.createElement('script'),
        source = getSource(ShortcutsSource),
        site, text;

    for (site in SupportedSites) {
        if (SupportedSites.hasOwnProperty(site)) {
            if (typeof site !== 'string') { continue; }
            if (location.href.match(site)) {
                source += getSource(SupportedSites[site]) + '\n window.Cursor.init();';
                break;
            }
        }
    }

    text = document.createTextNode(source);
    script.appendChild(text);
    script.setAttribute('id', 'RTKeyboardShortcuts');
    if (!document.getElementById('RTKeyboardShortcuts')) {
        document.body.appendChild(script);
    }
};
addScript(ShortcutsSource);

