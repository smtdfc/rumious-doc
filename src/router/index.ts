import { App } from '@rumious/core';
import { RouterModule, createLoader } from '@rumious/router';

export default function (app: App): RouterModule {
  const router = app.addModule(RouterModule, {
    strategy: 'hash',
  }) as RouterModule;

  router.route([
    {
      path: '',
      component: createLoader(
        async () => (await import('@pages/home')).default,
      ),
    },
    {
      path: 'playground',
      component: createLoader(
        async () => (await import('@pages/playground')).default,
      ),
    },
    {
      path: 'documentation',
      layout: createLoader(async () => (await import('@layouts/docs')).default),
      childs: [
        {
          path: ':name',
          component: createLoader(
            async () => (await import('@pages/doc')).default,
          ),
        },
      ],
    },
  ]);

  return router;
}
