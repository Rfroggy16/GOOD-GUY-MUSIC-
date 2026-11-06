# GitHub update for Good Guy Music

Previously, exports embedded audio in HTML as base64, adding roughly one third to the original audio size. This version separates audio files from the page. It does not bypass GitHub limits.

## Upload this update

Extract the GitHub update ZIP. Upload its contents to your existing repository root, not the ZIP or an extra enclosing folder. Replace matching files and preserve the assets and audio folders. Vercel redeploys if connected to the production branch. The assistant has not pushed any changes.

The latest repository commit had an empty catalog. This update preserves that state. A separate private recovery backup of the earlier “Scales Out” track is supplied; restore it in Owner Studio if you want to republish it. Songs saved only in your browser are not available in GitHub and require your own backup.

## New Owner Studio workflow

Keep the separate studio ZIP private. Extract it and open its index.html. Restore your existing library backup. Moving browser or origin does not transfer browser-local data automatically.

Select **Export website ZIP** and extract the download:

- index.html: the design and player, without song bytes.
- catalog.json: metadata and paths to previews.
- audio folder: one tagged preview per beat, named by stable ID.

Upload all three for the first export. For later song additions, the design page does not change: upload the updated catalog.json and new audio files. Replace a matching audio file if its preview changes. Removing a beat from the catalog hides it; its old file remains publicly accessible until you remove it from the repository. Do not upload the studio or a private backup.

## Limits and security

Each audio file must stay below GitHub's 25 MB browser-upload limit; this studio caps previews at 20 MB. Use short tagged MP3 previews, not WAV masters, full songs, or stems. ZIP archives may exceed 25 MB: extract before uploading individual files, in batches if needed. Large library backups remain subject to the studio's 120 MB import limit and browser memory limits.

For a large catalog, public audio/object storage is more suitable than GitHub. This fixes oversized HTML, not automatic publishing. One-click deployment still needs a secure authorized integration. Purchases remain disabled and PayPal is not connected. Inquiries open email drafts.

Never commit private masters, stems, studio backups, or credentials. Public Git history can keep old files accessible.
