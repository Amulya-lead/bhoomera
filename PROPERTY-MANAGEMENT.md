# Property management without a database

Customers submit the Sell form. The submission is saved as **pending** and hidden from visitors. The owner signs in at `/#admin`, reviews the seller contact and property details, edits any field or photo, and chooses **Approve & publish**. Approved sale properties appear on Buy; rentals appear on Rent. The owner can add properties directly, reject submissions, or unpublish an approved listing.

Fields include title, type, purpose, asking price/monthly rent, area and unit, city, locality, address, bedrooms, bathrooms, approval details, facing, road width, description, amenities and up to six photos. Seller name, phone and email stay private in the dashboard. Public viewing requests are saved in the same dashboard.

## Run locally

Use Node.js 22 or newer. Install packages with `npm install`.

1. Copy `.env.example` to `.env` if there is no local `.env` yet.
2. Set `ADMIN_USERNAME` and a long, unique `ADMIN_PASSWORD` in `.env`.
3. Run `npm run server` in one terminal.
4. Run `npm run dev` in another terminal and open the Vite URL.

The development server proxies `/api` and `/uploads` to port 3001. If you change the API port, update `vite.config.ts` and `vite.config.js` accordingly. The local setup has already generated owner credentials in the ignored `.env` file. Never commit that file.

For the built site: `npm run build` followed by `npm start`. Open `http://127.0.0.1:3001`. Customer pages and the API are served together.

## Saved data

`DATA_DIRECTORY` defaults to `data/` in the project. The server saves records in `properties.json` and photos in `uploads/`. Records are updated in a serialized queue using atomic file replacement. Restarting the server preserves records and photos; owner sessions expire and require signing in again. Back up the **whole data directory**, including photos. Credentials and runtime data are ignored by Git.

This setup is for a single server process on one persistent disk. It does **not** work as a static GitHub Pages site, as browser-only storage, or on an ephemeral/serverless filesystem. Hosting requires a Node.js server with a persistent disk. Configure `DATA_DIRECTORY` as an absolute persistent directory, `NODE_ENV=production`, and HTTPS through a reverse proxy. `server/start.js` binds to loopback; the reverse proxy forwards the public HTTPS domain to the local port. Run only one instance against a data directory. No database service is required.

## Verification

`npm test` covers submission validation, image validation, authentication, owner-only changes, approval visibility, privacy, location/type/price filters, owner-created listings, enquiries, simultaneous submissions, unpublishing and data persistence after restart. Test records are isolated in temporary folders and removed after the tests.
