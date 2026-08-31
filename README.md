# Home Appliances Repair

A responsive React and TypeScript recreation of the Home Appliances Repair Nairobi website. It includes the custom homepage plus 184 crawled pages covering services, projects, posts, archives, teams, testimonials, FAQs, categories and tags. Original internal links are preserved as React routes.

Individual pages use a modern responsive template with contextual hero imagery, trust indicators, structured content cards, related-service navigation, an emergency contact panel, service guarantees, and mobile-optimized layouts.

## Development

- `npm run dev` starts the Vite development server.
- `npm run build` creates an optimized production build.
- `npm run lint` checks the TypeScript and React source.
- `npm run preview` previews the production build.
- `npm run crawl:site` re-crawls every source sitemap and linked page, then refreshes the Cloudinary-backed runtime page index.
- `npm run audit:links` checks every preserved internal backlink and fails if a target route is missing.
- `npm run test:email` sends a live SMTP2GO integration test.

## Cloudinary assets

Site imagery is served from Cloudinary. Credentials belong only in `.env.local`, which is ignored by Git. Copy `.env.example` when configuring another environment. Run `npm run upload:assets` for homepage assets or `npm run crawl:site` to synchronize all crawled page imagery and content.

Never commit Cloudinary API secrets or expose them through client-side environment variables.

## Enquiry email delivery

Every appointment and enquiry form posts to the server-side `/api/enquiry` endpoint. Messages are sent through SMTP2GO to `enquiries@homeappliancesrepair.co.ke` and copied to `info@homeappliancesrepair.co.ke`. The API key remains server-side in `SMTP2GO_API_KEY`; mailbox passwords are neither needed nor stored by the application.

Customers can classify a submission as an appointment request, quotation request, or general enquiry. Email subjects are generated from the request type, selected service, customer, location, and unique reference. The branded HTML and plain-text versions include all submitted fields, a Nairobi timestamp, the customer's message, direct call/reply actions, and a recommended follow-up step.

Local Vite development and preview servers provide the endpoint automatically. Netlify deployment is configured in `netlify.toml`; add `SMTP2GO_API_KEY` as a secret environment variable in the Netlify project before deployment. The endpoint validates and limits input, includes a spam honeypot, and applies local development rate limiting.
