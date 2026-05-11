## Summary

-

## Why

-

## Auth / data impact

- [ ] Supabase service role key or other secrets are not exposed.
- [ ] `/h/<secret>` values are not logged, screenshotted, or copied into PR text.
- [ ] Server Actions call `assertHousehold(secret)` before household-scoped reads/writes when relevant.

## UX impact

- [ ] The 3-tap recording constraint is preserved or the tradeoff is explicitly described.
- [ ] Mobile one-handed use was considered for recording flow changes.

## Deploy impact

- [ ] Production deploy is not performed, or explicit owner approval is recorded.
- [ ] Vercel production impact, environment variable changes, and rollback are described when relevant.

## Test plan

- [ ] `npm run lint`
- [ ] `npm run build`

## Not verified

-

## Risk / Rollback

-
