'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async category() {
    const { ctx, service } = this;
    try {
      const res = await service.api.getCategory();
      ctx.body = res
    } catch (err) {
      logger.error(err);
      ctx.body = {};
    }
  }

  async shopify() {
    const { ctx, service } = this;
    const { query, logger } = ctx; // 处理请求参数
    logger.info('request query: %j', query);
    try {
      query.current = ~~query.current
      query.pageSize = ~~query.pageSize
      query.is_ww_ship = ~~query.is_ww_ship
      query.is_uniq = ~~query.is_uniq
      // sorter?: string;
      // status?: string;
      // first_category_id?: number;
      // second_category_id?: number;
      // third_category_id?: number;
      // is_ww_ship?: number;
      // is_uniq?: number;
      // pageSize?: number;
      // currentPage?: number;
      const res = await service.api.queryShopify(query);
      ctx.body = res;
    } catch (err) {
      logger.error(err);
      ctx.body = {};
    }
  }

  async shopify_status() {
    const { ctx, service } = this;
    const { request, logger } = ctx; // 处理请求参数
    const { body } = request
    logger.info('request params: %j', body);
    try {
      const record = await service.api.updateStatus(body);
      if (record) {
        ctx.body = {
          message: 'success'
        }
      } else {
        ctx.body = {
          message: 'update error'
        }
      }
    } catch (err) {
      logger.error(err);
      ctx.body = {
        message: 'sql error'
      };
    }
  }
}

module.exports = ApiController;
