# Google Forms + Sheets workflow

The website uses native fields for customer enquiries and property submissions, Google Forms as the submission destination, private Google Sheets for owner review, and a read-only Google Apps Script feed for approved listings. A small server-side handler checks Google's receipt before returning a website-styled success message. No database is required. Deploy the repository to Vercel with its `api/google-submit.js` function, or use the included Node server; a static-only `dist/` upload cannot handle submissions. Google and hosting usage limits still apply.

## Live resources

- Customer form: https://docs.google.com/forms/d/e/1FAIpQLSc8Hks5nApY6_c45JyDbpjX1Dr315_qe4AwP9U3WFCT9SzpZw/viewform
- Form editor: https://docs.google.com/forms/d/1iQks3dz8OKpKmQHJJRxvqQDVsXmtq4qw1EhzBw7VHmk/edit
- Private review Sheet: https://docs.google.com/spreadsheets/d/1kINCkzOq5q8wZ_pYUCxrzzvoCelkegsyVSlM4xnJh6Y/edit#gid=1324259729
- Script editor: https://script.google.com/home/projects/15KHYxvic02aLQoS0Qh_Ry75Zn-Qrf07xDJjE6Tik3OSZqQaQ9ahbyWDs/edit
- Public approved-only feed: https://script.google.com/macros/s/AKfycbwwUlKB2sLwQEx5qbImcjRmJCC5XTQJlDRfY3mLUU4gajNjxgImOtJWnXKH0FYXfQ5DtA/exec

## Owner instructions

1. Open the private Sheet using the owner’s Google account.
2. Review each submission in **Form Responses 1**. Blank Status means it is not published.
3. Edit the public listing fields as needed. Title, city, locality, positive price and positive area are required for publication.
4. Add image links under **Public photo URLs**, separated by newlines or commas. Use images intended for public viewing. Drive photo files must be individually shared for viewing by anyone with their link; the response Sheet must remain Restricted. Customer-provided **Photo links** are deliberately not published automatically.
5. Change **Status** to **Approved**. Sale listings appear on Buy; rentals appear on Rent. Reload the website to see the changes.
6. Change Status to **Archived** or **Rejected** to remove a listing.

To add a property directly, fill a new row using the same columns, add a unique **Property ID** (e.g. BHR-001), and set the status. Choose Plot, Land, Apartment, House, Villa or Commercial as the property type, Sale or Rent as the purpose, and Sq yards, Sq feet or Acres as the area unit. Use numbers for price and area, not text such as “50 lakhs”. A customer submission with no Property ID receives a generated ID based on its timestamp. Use a unique manual ID for owner-created records so the URL remains stable if the title changes.

The Status dropdown currently covers rows 2–101. Extend/copy validation if you add more rows. Blank or unexpected statuses are always hidden by the feed.

## Privacy and access

The response Sheet is private to its Google owner. Form response summaries and response editing are disabled. Responders are not required to sign in. The form asks for an optional email field instead of automatically collecting verified Google email addresses.

The feed runs as its owner and uses the **Google Sheets advanced service** with only `spreadsheets.readonly` OAuth scope. It explicitly returns a whitelist of approved public listing fields. Seller names, phone numbers, email addresses, confirmation responses, photo submissions and internal notes are excluded. The submission endpoint accepts only whitelisted customer fields and forwards them to the two fixed Forms; it cannot approve or edit listings.

Owner Sheet links are absent from public navigation. The direct owner page opens the private Sheet; visitors without access cannot read it. Viewing enquiries go to the private enquiries Sheet, not WhatsApp. The former file-backed owner password is not used in Google mode.

## Website development and free hosting

- `npm run dev` starts the website. Run `npm run server` in another terminal for local form submissions; Vite proxies `/api` to port 3001.
- `npm run build` creates `dist/`. Deploy the repository to Vercel so it builds the frontend and the submission function. Alternatively, `npm start` serves the built website and API together.
- Forms display the site's own loading, success and error messages. A timeout or unrecognized Google response is treated as unconfirmed, never as success. No automatic retry is made because the first attempt may have been saved.
- The enquiry response Sheet is https://docs.google.com/spreadsheets/d/1xyhZWmD9Ab2l04QajqICMgT3-wrXocMKh2jTYDO3J4Q/edit and must stay private.
- Google Form field IDs are mapped in `src/NativeGoogleForm.tsx` and `server/google-submit.js`. If the Forms or their confirmation messages change, update and retest both mappings and receipt recognition.
- Google resource URLs are configured in `src/googleWorkflow.tsx`.
- Legacy file-backed code remains as an optional implementation. `GOOGLE_WORKFLOW` is enabled by default.

## Script updates

Keep the source Sheet name **Form Responses 1** and the form’s question titles unchanged unless you update the matching field names in the script. Updating code in Apps Script does not update an existing deployment until you choose **Deploy → Manage deployments → Edit → New version → Deploy**.

## Verified

A temporary Sheet row was tested as Pending (not returned), changed to Approved (returned by the public feed and shown on Buy and its details page), then removed. The feed excluded the artificial private seller contact fields throughout. No test listing remains.
