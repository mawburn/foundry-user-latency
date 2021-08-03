# Foundry Ping Logger

Shows an average of a players pings in the player window.

<p align="center">
  <img src="https://i.imgur.com/LPD18Rc.png"  style="width:300px;height:192px;" alt="screenshot" />
</p>

Foundry Link:

https://foundryvtt.com/packages/ping-logger

## Scripts

- clean - removes dist and package.zip folder
- build - runs clean & bumps package version & gulp build & updates manifest file
  - _Note:_ versions in the manifest file are based on the version in package.json
- package - runs gulp build & outputs a module.zip file
- nuke - runs clean & removes node_modules
- lint- runs lint --fix on all files

## Fork - Response Times

- https://foundryvtt.com/packages/response-time
- https://gitlab.com/tenuki.igo/foundryvtt-ping-times

Forked from Response Times since it was broken. I only meant to fix it, but I went ahead and dropped the charting feature, simplified things a bit, and converted to TS, since I just wanted to see the players' average ping and didn't care about the time based chart that was pretty heavy.
