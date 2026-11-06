# Good Guy Music — updated website preview

The website preserves the original gold/charcoal design and typography. Logos, CSS, and JavaScript are embedded in the generated page, so brand images do not rely on relative file paths.

## Owner Studio

Owner Studio is a separate page from the public website. There is no owner button or editing form on the customer-facing page. Add tagged audio previews, titles, genres, BPM, musical keys, USD prices, license names, and terms in the studio. Edit or delete beats from the library. Select **Preview Website** to open the customer view. Adding your first beat replaces the sample collection in that browser. Export and restore backups to protect your data.

Both pages share browser-local storage when served together on the same origin. The public page loads the catalog on navigation and when its tab regains focus. This is not a shared online database.

The public page is the root `index.html`; the owner page is `studio/index.html`. Each embeds its required code and images. The build script preserves its input in `site.template.html` and regenerates both. The public build contains no beat-management handlers. The studio's no-index hint is not access control.

This is a **browser-local editing workspace**, not an authenticated online administration system. Audio previews and beat details persist in IndexedDB only on the same browser and origin. Other visitors do not see owner changes. Clearing site storage deletes them. Export a backup before switching browsers, publishing, or clearing data.

## Payments

You can attach your own HTTPS Stripe, PayPal, or Square hosted payment link to a beat. The licensing dialog then links to that provider's checkout. Without a link, the beat is inquiry-only. Prices and license terms must match what you configure at the payment provider.

The website does not collect card data, verify payments, unlock downloads, or deliver files automatically. Only tagged public previews should be uploaded; never upload master files or stems. Payment receipt checks and file delivery remain the owner's responsibility until a production integration is implemented.

A live store still requires a shared backend, secure owner authentication, preview-file storage, private delivery-file storage, a payment-provider account, verified payment callbacks, and a license/delivery workflow. The separate studio route is not protected yet. Do not treat it as production authentication. A next-steps checklist is included in the studio.

## Merch

The merch section remains visible with a prominent **Coming soon** announcement and badges on each concept. Merch dialogs do not offer shopping or inquiry buttons. Concept designs are not confirmed products or inventory.

## Contact

The existing project brief form downloads a local text file. It does not send an email.

## Included source

The standalone page is generated from the source CSS, JavaScript, and brand images using the included build script. No payment credentials or master music files are included.
