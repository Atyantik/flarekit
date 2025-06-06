import { Handler } from 'hono';
import routesv1 from './routes';

import { cors } from 'hono/cors';
import { queueHandler } from './handlers/queue.handler';
import { scheduledHandler } from './handlers/scheduled.handler';
import { createOpenAPIApp } from './config/openapi.config';

const app = createOpenAPIApp();
app.use(cors());

const honoHomeRoute: Handler = (c) => {
  return c.json({
    success: true,
    message: 'Welcome to Flarekit APIs!',
  });
};

app.all('/', honoHomeRoute);

// Register all routes
routesv1.forEach((routeRegister) => routeRegister(app));

export { app };

export default {
  fetch: app.fetch,
  queue: queueHandler,
  scheduled: scheduledHandler,
} satisfies ExportedHandler<Env>;
