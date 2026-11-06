# Good Guy Music — no-database website and personal Owner Studio

## Your release workflow

1. Keep Owner Studio on your own device. It is a personal editing tool, not a protected online admin dashboard. Do not deploy studio files, source templates, or library backups to public hosting.
2. Add beat details, USD prices, license terms, and tagged audio previews. The studio saves them in browser storage (IndexedDB), not a paid server database. Clearing site data can delete your library. Changing browser, device, or origin can make it unavailable.
3. Select **Preview my website** to see the customer page generated from your saved beats.
4. Select **Export customer website** to download a complete `index.html`. Publish only that exported page to your static host. Repeat after every catalog change: edits are not automatically published.
5. Export a separate library backup and keep it private. Restore it when moving browsers or computers.

## Customer website

The exported page embeds the catalog, tagged audio previews, supplied logos, CSS, and JavaScript. It works independently of Owner Studio and does not contain editing controls, checkout URLs, or database dependencies. Fonts load online with local fallbacks. The starting catalog is empty: no fake beats are published.

## Payments

Purchasing is **coming soon**. There are no active payment buttons. PayPal is the intended future provider; no account or checkout is connected yet. Old links in imported backups are not activated and are omitted from customer exports.

After PayPal setup, verify payments in PayPal before manually sending the purchased beat and license. This version does not verify payments, collect cards, unlock downloads, or deliver files automatically.

## File safety

Upload tagged public previews only. Never upload masters or stems: every file embedded in the customer page is publicly accessible. MP3, WAV, OGG, and M4A previews are supported up to 20 MB each. Short compressed MP3 previews keep exports manageable. A large catalog creates a large page, and your host may have its own file-size limits.

## Merch and contact

Merch stays visible as coming-soon concepts with no purchase controls. The contact form downloads a local project brief and does not send email.

## Included source

The build script generates the starting customer page and studio from the included source template, CSS, JavaScript, and supplied assets. Keep all source and studio files private. Only the exported customer `index.html` should be published.

Creating these files does not deploy a live website.
