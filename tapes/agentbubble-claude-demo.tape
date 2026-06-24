Output assets/agentbubble-claude.gif

Set FontSize 24
Set Width 1200
Set Height 1000
Set Theme "Dracula"
Set TypingSpeed 40ms
Set CursorBlink false

Hide

Type "rm -rf demo && mkdir demo"
Enter

Type "cd demo"
Enter

Type "git init -q"
Enter

Type "clear"
Enter

Show

Type "npx -y agentbubble@latest init --adapter claude"
Enter

Wait+Screen@15s /Product goal/

Sleep 1s

Type "Ship a fast, friendly expense tracker for small teams"
Enter

Wait+Screen@15s /Dangerous areas/

Sleep 1s

Type "Don't touch billing/ or anything under migrations/ without approval"
Enter

Wait+Screen@15s /QA-ready/

Sleep 1s

Type "npm test"
Enter

# Let the full init summary print and sit on screen for a beat.
# This is where we'll judge if FontSize 24 / Height 1000 is enough
# to capture the whole thing without it scrolling off.
Sleep 3s

Type "claude"
Enter

Sleep 5s

Type "start"
Enter

# No Wait+Screen past this point - this is the 4th screen-check in
# the tape and we've confirmed (repeatedly) that VHS's Wait+Screen
# freezes after the 3rd one in this environment. Sleep only from here.

# This is the actual payoff beat: Claude reading .agentbubble/ and
# getting oriented. Give it room to fully land before the gif ends.
Sleep 40s

Type "y"
Enter

Sleep 10s
