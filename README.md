# Bhoomera Realty

Premium React website for Hyderabad properties. The default workflow uses Google Forms, a private Google Sheet and a read-only approved-listings feed. No paid database or separately hosted backend is required.

Customers complete the Google Form on Sell. The owner reviews submissions in Google Sheets, edits property details and public photo links, and approves listings for Buy or Rent. The `/#admin` page links the owner to the private Sheet, which uses Google sign-in. Viewing requests use WhatsApp.

## Local setup

Use Node.js 22 or newer. Run `npm install`, then `npm run dev`. No database credentials or local API server are required for Google mode.

See [Google workflow instructions](GOOGLE-WORKFLOW.md) for the live Form and Sheet links, approval instructions, privacy and script configuration.

## Production

Run `npm run build` and deploy the generated `dist/` directory to a static host. Customer submissions and approvals are saved by Google, so the website host does not need persistent disk storage.

Keep the response Sheet Restricted. Only the Apps Script public feed and approved property photo files should be accessible to website visitors.

The previous file-backed implementation is retained as an optional fallback. Its separate setup is documented in [file-backed management](PROPERTY-MANAGEMENT.md); those server requirements do not apply to the default Google workflow.

## Checks

`npm test` runs the file-backed workflow tests. `npm run build` checks TypeScript and builds the website.
