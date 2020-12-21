# blackjack
Engine to simulate Blackjack strategies versus the dealer. 

Currently implementing Basic Strategy with following house rules:
- Blackjack pays 3:2
- Dealer stays on soft 17
- 6 Decks with reshuffling after 4.5 decks are played
- Allowed to split once
- Allowed to surrender any first two cards
- Allowed to double any first two cards
- No insurance

True Count is kept by Hi-Lo with a rounding of decks remaining. Bet sizing can be determined for any true count.

In the future:
- more house rules options will be added.
- up to 4 splits will be allowed.
- Maximum and minimum win/loss will be recorded. 

