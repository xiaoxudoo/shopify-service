"use strict";

const Controller = require("egg").Controller;

class ApiController extends Controller {
  async category() {
    const { ctx, service } = this;
    try {
      const res = await service.api.getCategory();
      ctx.body = res;
    } catch (err) {
      logger.error(err);
      ctx.body = {};
    }
  }

  async shopify() {
    const { ctx, service } = this;
    const { query, logger } = ctx; // 处理请求参数
    logger.info("request query: %j", query);
    try {
      query.current = ~~query.current;
      query.pageSize = ~~query.pageSize;
      query.is_ww_ship = ~~query.is_ww_ship;
      query.is_uniq = ~~query.is_uniq;
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
    const { body } = request;
    logger.info("request params: %j", body);
    try {
      const record = await service.api.updateStatus(body);
      if (record) {
        ctx.body = {
          message: "success"
        };
      } else {
        ctx.body = {
          message: "update error"
        };
      }
    } catch (err) {
      logger.error(err);
      ctx.body = {
        message: "sql error"
      };
    }
  }

  // mock users
  async currentUser() {
    const { ctx } = this;
    ctx.body = {
      name: "Serati Ma",
      avatar:
        "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
      userid: "00000001",
      email: "antdesign@alipay.com",
      signature: "海纳百川，有容乃大",
      title: "交互专家",
      group: "蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED",
      tags: [
        {
          key: "0",
          label: "很有想法的"
        },
        {
          key: "1",
          label: "专注设计"
        },
        {
          key: "2",
          label: "辣~"
        },
        {
          key: "3",
          label: "大长腿"
        },
        {
          key: "4",
          label: "川妹子"
        },
        {
          key: "5",
          label: "海纳百川"
        }
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: "China",
      geographic: {
        province: {
          label: "浙江省",
          key: "330000"
        },
        city: {
          label: "杭州市",
          key: "330100"
        }
      },
      address: "西湖区工专路 77 号",
      phone: "0752-268888888"
    };
  }
}

module.exports = ApiController;
