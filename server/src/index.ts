
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createUserInputSchema, 
  updateUserInputSchema,
  getUserPageInputSchema,
  createLinkInputSchema,
  updateLinkInputSchema,
  reorderLinksInputSchema,
  trackLinkClickInputSchema,
  getAnalyticsInputSchema,
  createSubscriptionInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { updateUser } from './handlers/update_user';
import { getUserByUsername } from './handlers/get_user_by_username';
import { createLink } from './handlers/create_link';
import { updateLink } from './handlers/update_link';
import { deleteLink } from './handlers/delete_link';
import { getUserLinks } from './handlers/get_user_links';
import { getPublicUserLinks } from './handlers/get_public_user_links';
import { reorderLinks } from './handlers/reorder_links';
import { trackLinkClick } from './handlers/track_link_click';
import { getUserAnalytics } from './handlers/get_user_analytics';
import { getLinkAnalytics } from './handlers/get_link_analytics';
import { createSubscription } from './handlers/create_subscription';
import { updateSubscriptionStatus } from './handlers/update_subscription_status';
import { checkUserLimits } from './handlers/check_user_limits';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  getUserByUsername: publicProcedure
    .input(getUserPageInputSchema)
    .query(({ input }) => getUserByUsername(input)),

  // Link management
  createLink: publicProcedure
    .input(createLinkInputSchema)
    .mutation(({ input }) => createLink(input)),

  updateLink: publicProcedure
    .input(updateLinkInputSchema)
    .mutation(({ input }) => updateLink(input)),

  deleteLink: publicProcedure
    .input(z.object({ id: z.string(), user_id: z.string() }))
    .mutation(({ input }) => deleteLink(input)),

  getUserLinks: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => getUserLinks(input.userId)),

  getPublicUserLinks: publicProcedure
    .input(getUserPageInputSchema)
    .query(({ input }) => getPublicUserLinks(input)),

  reorderLinks: publicProcedure
    .input(reorderLinksInputSchema)
    .mutation(({ input }) => reorderLinks(input)),

  // Analytics and tracking
  trackLinkClick: publicProcedure
    .input(trackLinkClickInputSchema)
    .mutation(({ input }) => trackLinkClick(input)),

  getUserAnalytics: publicProcedure
    .input(getAnalyticsInputSchema)
    .query(({ input }) => getUserAnalytics(input)),

  getLinkAnalytics: publicProcedure
    .input(z.object({ userId: z.string(), days: z.number().int().min(1).max(365).default(30) }))
    .query(({ input }) => getLinkAnalytics(input.userId, input.days)),

  // Subscription management
  createSubscription: publicProcedure
    .input(createSubscriptionInputSchema)
    .mutation(({ input }) => createSubscription(input)),

  updateSubscriptionStatus: publicProcedure
    .input(z.object({ user_id: z.string(), status: z.enum(['active', 'inactive', 'cancelled', 'past_due']) }))
    .mutation(({ input }) => updateSubscriptionStatus(input)),

  // User limits checking
  checkUserLimits: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => checkUserLimits(input.userId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`BioLink Pro TRPC server listening at port: ${port}`);
}

start();
