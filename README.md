# TAP

A card funded by the crypto you already hold. One tap, one sale, one receipt — and the receipt says what it cost you.

The site is a clock rather than a stack of sections: every part of the page is anchored to a millisecond in the two seconds a card authorisation has to complete in.

index.html is the site, with a working authorisation simulator. docs.html is the settlement spec: the order, custody at each step, and what happens when it fails after the asset is already sold. api/price.js reads BTC, ETH and SOL spot from a public venue, each with its source and the second it was read. test.mjs runs 47 checks at 1400 and 390, including hand-computed arithmetic on the receipt.

Published numbers: fee 0.90 percent, band plus or minus 0.75 percent, per-transaction ceiling 2,000 dollars. All three are commitments, not measurements.

Nothing is live. No card has been issued, no float has been deployed, and no purchase has settled. No token exists yet either — when one does, the address appears on the site and in the pinned post at the same moment, and anyone posting one before that is scamming you.
