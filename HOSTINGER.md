# Hostinger deployment

This package targets **managed Node.js hosting with NestJS support**, with MySQL supplied by Hostinger. It is not a PHP-only website and should not be deployed by uploading only the React source to `public_html`.

Hostinger's current guidance lists Business Web Hosting and Cloud plans for Node.js web apps, and explicitly supports NestJS. Product names can vary by offer or region: verify **Node.js Web Apps** and **MySQL** are included in the plan before purchasing. A VPS is not needed for the recommended setup.

Official references:

- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/changelog/nestjs-framework-support-added-to-nodejs-hosting
- https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/

## 1. Domain and account

Purchase `healnest.co.in` if still available. This package does not reserve the name or verify checkout availability. Keep domain and hosting ownership with the client, with delegated access for maintenance. Domain, hosting and email subscriptions are separate from the ₹8,000 development scope.

## 2. Create the database

In hPanel, create a MySQL database and user. Record the actual provider-issued host, port, full database name, full username and password. Do not assume the database host is `localhost` inside a managed Node runtime.

Deploy with a database user authorized for the application table. After the initial migration, runtime access needs SELECT, INSERT, UPDATE and DELETE; CREATE is only needed for setup or migrations.

## 3. Create the Node.js app

Upload this source ZIP or connect a repository containing its contents. The application root is the directory containing the top-level `package.json`, not `apps/web`.

Use these settings where hPanel provides overrides:

| Setting                  | Value                                                    |
| ------------------------ | -------------------------------------------------------- |
| Node.js                  | 22 or 24                                                 |
| Install                  | `npm ci` (include development dependencies during build) |
| Build                    | `npm run build`                                          |
| Start                    | `npm start`                                              |
| Entry point if requested | `apps/api/dist/main.js`                                  |
| App port                 | Provider-assigned `PORT`; code defaults to 3000          |

Do not let framework auto-detection deploy only the static frontend. One Node service serves the built React files and `/api` on the same origin. Do not configure static-only output hosting for this full application.

## 4. Set environment variables

Use hPanel environment settings, not a checked-in `.env` file. The complete variable list is in `.env.example`.

```text
NODE_ENV=production
APP_ORIGIN=https://healnest.co.in
BOOKING_ENABLED=false
SITE_INDEXABLE=false
DB_HOST=<actual MySQL host>
DB_PORT=3306
DB_USER=<full database username>
DB_PASSWORD=<secret>
DB_NAME=<full database name>
SMTP_HOST=<provider SMTP hostname>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<mailbox username>
SMTP_PASS=<app password or SMTP credential>
MAIL_FROM=Heal Nest <appointments@healnest.co.in>
BOOKING_TO=tskarthi2002@gmail.com
RETENTION_DAYS=90
```

For port 465, set `SMTP_SECURE=true`. For port 587, the app requires STARTTLS. Use the actual sender address authorized by the mail provider. A Gmail recipient does not mean Gmail must be the sending provider. Hostinger email or Zoho Mail can provide the sending mailbox if the chosen plan supports authenticated SMTP.

Configure SPF/DKIM and appropriate DMARC records using the email provider's instructions. Keep the site's domain DNS and the email MX records intact when making hosting changes.

## 5. Initialize and enable

Run `npm run db:migrate` once through the deployment environment's supported terminal or setup command, with the same database variables. If a terminal is unavailable, run the CREATE TABLE statement from `apps/api/src/schema.ts` in hPanel's database tool. Do not add destructive schema changes to every application startup.

Set `BOOKING_ENABLED=true`, then restart. The process refuses to start with missing booking configuration. The presence of credentials is not a successful connection test; the tests below remain necessary.

Ask Hostinger support for the correct proxy configuration for your app, then configure `TRUSTED_PROXIES` with the verified IPs/subnets. Confirm that two separate clients are not incorrectly sharing one request limit. Do not enter `true` or trust arbitrary `X-Forwarded-For` values.

## 6. Connect the domain and test

Connect the domain through Hostinger's domain workflow and apply the DNS records it supplies. Enable HTTPS and select one canonical hostname. Redirect the alternative hostname consistently, and set `APP_ORIGIN` to the final HTTPS origin with no trailing slash.

Complete these checks while `SITE_INDEXABLE=false`:

- Desktop and mobile layouts in Chrome and Safari; English/Tamil labels and line wrapping.
- Keyboard navigation, visible focus, required-field messages and the mobile menu.
- Call, WhatsApp and map destinations.
- A consented **test request** saved in MySQL with one matching clinic email. Verify inbox/spam delivery. Delete test data afterward.
- Retry the same request after a simulated network interruption; confirm only one database record.
- Temporarily use failing SMTP credentials in staging; confirm request storage, pending state and delivery after credentials are restored. Do not disrupt a live clinic inbox for this test.
- Invalid dates, Sunday times, missing consent and oversized bodies are rejected.
- Database unavailability displays an error rather than a success message.
- Restart the app and confirm that pending notifications resume.
- Confirm backups, log monitoring, proxy handling and the agreed data-retention schedule.

For launch, replace `BOOKING_TO` with the clinic's production inbox. Obtain clinic sign-off on contact details, translated copy, doctor details and imagery. Set `SITE_INDEXABLE=true` and restart to remove the server's noindex header. The supplied homepage has a descriptive title and metadata; add a canonical URL and submit the live site to search tools once the domain is confirmed.

## Troubleshooting

**503 on booking:** booking is disabled, configuration is incomplete, the table is missing or MySQL is unavailable. The application keeps internal error details out of the response.

**Request saved but no email:** inspect pending outbox rows and server logs; check SMTP settings, authorized sender, quota, DNS and spam folders. Never copy patient details into public support tickets.

**403 on booking:** `APP_ORIGIN` does not match the browser's origin exactly. Check HTTPS and `www` redirects.

**429 for unrelated visitors:** verify the reverse-proxy trust configuration. The app currently limits five POST requests per 15 minutes per resolved IP.

**Page loads but API is absent:** the deployment was configured as static React instead of the root NestJS service.
