# Gallery uploads: setup

Your site runs as a Cloudflare Worker named `wispy-credit-c2b6`. This package replaces its contents with the same site plus the gallery upload system. Your domain keeps working.

## Folder layout
- `public/` is the website itself (index.html, gallery.html, admin.html, assets/ and so on).
- `worker.js` and `src/` are the upload code. Leave them alone.
- `wrangler.toml` is the config. Leave it alone.

## One-time
Open PowerShell in this folder (the one containing `wrangler.toml`).

    npx wrangler login
    npx wrangler deploy
    npx wrangler secret put ADMIN_PASSWORD

Type your chosen password when asked (nothing shows as you type). The R2 bucket `senseofsalience-gallery` must already exist, which it does.

If `wrangler deploy` warns that the Worker was last changed in the dashboard, say yes to continue.

## Using it
Go to `https://senseofsalience.com/admin.html`, sign in, tap "Import the starter pieces" once, then add photos. No file edits, no redeploys.

## Updating the rest of the site later
Change files inside `public/`, then run `npx wrangler deploy` in this folder. Gallery photos you uploaded through the admin page are stored separately and are never touched by a deploy.
