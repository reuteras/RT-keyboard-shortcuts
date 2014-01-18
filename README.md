RT keyboard shortcuts
=====================

Disclaimer: 
Use this at your own risk. This is my first Greasemonky script and I'm
not used to Javascript either...

The original reason for this plugin was spam filtering for postmaster mail that had to accept everything and handle it manually. To be able to get notifications from people who got their email marked as spam incorrectly.

Update 2014-01-18
=================

I stopped using RT at work a couple of years ago but have now tried 4.2.x at home and therefore started updating this script again.

INSTALL
=======

You'll need to have Greasemonkey for Firefox installed (should work in other ways to be this is alpha code). Get the source file and change relevant parts of the file (search for CHANGEME). Please let me know if you find anything else that needs changing!

Put your edited file on a web server and point your Firefox browser with Greasemonkey installed to the url and install the script in
Greasemonkey.

The next time you go to your RT first page and would like go no the Postmaster queue and look through the _new_ tickets you can to the following

    :::text
    Q (and enter a queue name Postmaster, q will also show open tickets)
    d (displays first message)
    t (take the ticket)
    o (open the ticket)
    n (go to next ticket)
    x (mark as spam, needs the extra function below)
    g->S (show results)
    # (enter ticket number to open it)
    ? (open help)

BUGS
====

There will be bugs and since I use simple pattern matching and it is so easy to install different addons you're urls might differ. Please report bugs at http://github.com/reuteras/RT-keyboard-shortcuts/issues.

Spam
====

To be able to use the x option to mark a message as spam you'll either
have to change this script to your environment or ad the following
code to the file

    local/html/Callbacks/quick_move-3.8/Ticket/Elements/ShowBasics/EndOfList

The code was written by a former colleague of mine.

    %# Original by Martin Roos <room@kth.se>
    %#

    <tr>
        <td class="label id"><&|/l&>Quick move</&>:</td>
        <td class="value id">
            <form action="<% RT->Config->Get('WebPath') %>/Ticket/Display.html" id="quick-move">
                <input type="hidden" name="id" value="<% $Ticket->id %>">
                <input type="hidden" name="Action" value="Modify">
                <& /Elements/SelectQueue, Name => 'Queue', Default => RT->Config->Get("DefaultQueue", $session{'CurrentUser'}), %ARGS, ShowNullOption => 0, ShowAllQueues => 0, NamedValues => 1 &>
                <input type="submit" class="button" value="<&|/l&>Move</&>" />
            </form>
        </td>
    </tr>

    <%ARGS>
        $Ticket => undef;
    </%ARGS>


Info
====

You can find some information on the project web page:

http://reuteras.github.io/RT%20keyboard%20shortcuts.html

Peter Reuterås
peter@reuteras.com

