# Good Guy Music

Static customer website with separate audio files, rounded media player, spinning vinyl/label, coming-soon purchases and merch, and collaboration email drafts to goodguybyryan@gmail.com.

## Publishing files

The public page loads beat metadata from catalog.json and tagged previews from the audio folder. Do not embed full audio in index.html. Preserve relative file paths. See UPLOAD-GUIDE.md for browser upload and Vercel instructions.

## Personal Owner Studio

Owner Studio is supplied separately as a private download. Restore your existing library backup and select Export website ZIP. Extract it before uploading index.html, catalog.json, and audio files. Do not upload the ZIP itself through GitHub's browser uploader.

For song-only updates, upload catalog.json and changed/new audio files; the design HTML stays unchanged. Studio storage is browser-local, not a shared database. Keep backups private and never publish studio files, masters, or stems.

## Limits

Studio previews are capped at 20 MB per file; short compressed tagged MP3s are recommended. Split files solve the growing HTML problem, not GitHub repository limits, Vercel traffic limits, or unlimited media hosting. Larger catalogs should use dedicated public audio/object storage. Automatic publishing still requires an authorized integration and is not included.

## Source and migration

The build script uses app.js, website-export.js, style.css, site.template.html, and assets to generate the public page and studio. It preserves existing catalog.json. The optional migration script extracts previews from a legacy embedded-audio index before rebuilding. The starting catalog is empty; restore your library and export to populate it. This package has not been deployed or pushed.

PayPal is not connected and purchase controls remain disabled. The collaboration form opens an email draft; it does not send automatically.
