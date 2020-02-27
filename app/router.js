'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/api/category', controller.api.category);
  router.get('/api/shopify', controller.api.shopify);
  router.post('/api/updateStatus', controller.api.shopify_status);
  router.get('*', controller.home.index);
};
