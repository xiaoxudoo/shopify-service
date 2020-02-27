const _ = require("lodash");
const Service = require("egg").Service;

class ApiService extends Service {
  async getCategory() {
    const category = await this.app.mysql.query(
      "select * from aliexpress_category"
    );
    const newCategory = [];
    _.forEach(category, cate => {
      const { first_level_id, first_level_name } = cate;
      const index = _.findIndex(
        newCategory,
        nCate => nCate.value === first_level_id
      );
      if (index === -1) {
        newCategory.push({
          label: first_level_name,
          value: first_level_id,
          children: []
        });
      }
    });
    _.forEach(category, cate => {
      const { first_level_id, second_level_id, second_level_name } = cate;
      const { children: secondCategory } = _.find(
        newCategory,
        firstCate => firstCate.value === first_level_id
      );
      const index = _.findIndex(
        secondCategory,
        secondCate => secondCate.value === second_level_id
      );
      if (index === -1) {
        secondCategory.push({
          label: second_level_name,
          value: second_level_id,
          children: []
        });
      }
    });
    _.forEach(category, cate => {
      const {
        first_level_id,
        second_level_id,
        third_level_id,
        third_level_name
      } = cate;
      const { children: secondCategory } = _.find(
        newCategory,
        firstCate => firstCate.value === first_level_id
      );
      const { children: thirdCategory } = _.find(
        secondCategory,
        secondCate => secondCate.value === second_level_id
      );
      const index = _.findIndex(
        thirdCategory,
        thirdCate => thirdCate.value === third_level_id
      );
      if (index === -1) {
        thirdCategory.push({
          label: third_level_name,
          value: third_level_id,
          children: []
        });
      }
    });
    return newCategory;
  }

  async queryShopify(query) {
    const {
      sorter,
      status,
      lang,
      first_category_id,
      second_category_id,
      third_category_id,
      is_ww_ship,
      is_uniq,
      pageSize,
      current
    } = query;
    const { logger } = this.ctx;
    const { mysql } = this.app;
    logger.info(query);
    try {
      // status 需要联表查询，暂不支持
      let category_name_options = {};
      if (first_category_id !== undefined) {
        const { first_level_name: first_category_name } = await mysql.get(
          "aliexpress_category",
          {
            first_level_id: ~~first_category_id
          }
        );
        category_name_options = { first_category_name };
      } else if (second_category_id !== undefined) {
        const { second_level_name: second_category_name } = await mysql.get(
          "aliexpress_category",
          {
            second_level_id: ~~second_category_id
          }
        );
        category_name_options = { second_category_name };
      } else if (third_category_id !== undefined) {
        const { third_level_name: third_category_name } = await mysql.get(
          "aliexpress_category",
          {
            third_level_id: ~~third_category_id
          }
        );
        category_name_options = { third_category_name };
      }
      // 计算总数

      let sqlquery = `select shopify_domain.domain, domain_state.status, domain_state.review, count(*) from shopify_domain left join domain_state on shopify_domain.domain = domain_state.domain where is_ww_ship = ${is_ww_ship}`;
      if (!_.isEmpty(category_name_options)) {
        _.keys(category_name_options).forEach(key => {
          const value = category_name_options[key];
          sqlquery += ` and ${key} = ${mysql.escape(value)}`;
        });
      }
      if (lang) {
        let langStr = "";
        _.forEach(_.split(lang, "|"), item => {
          langStr += ` ${mysql.escape(item)},`;
        });
        langStr = langStr.slice(1, -1);
        sqlquery += ` and hl IN (${langStr})`;
      }
      if (!!is_uniq) {
        sqlquery += " group by domain";
      }
      if (sorter.indexOf("rank") > -1) {
        let [rank, order] = sorter.split("_");
        order = order === "ascend" ? "ASC" : order === "descend" ? "DESC" : "";
        sqlquery += ` order by count(*) ${order}`;
      }

      logger.info(sqlquery);
      console.log(sqlquery);
      const wholeDomains = await mysql.query(sqlquery);

      // 分页查询数据
      if (current && pageSize) {
        sqlquery += ` LIMIT ${(current - 1) * pageSize}, ${pageSize}`;
      }
      let domains = await mysql.query(sqlquery);
      domains = _.map(domains, (domain, index) => ({
        ...domain,
        index,
        rank: domain["count(*)"],
        status: domain.status === null ? 0 : domain.status
      }));
      return { data: domains, pageSize, total: wholeDomains.length, current };
    } catch (err) {
      logger.error(err);
      return {};
    }
  }

  async updateStatus(params) {
    const {
      domain,
      status,
      review,
    } = params;
    // const { logger } = this.ctx;
    const { mysql } = this.app;

    const row = {
      domain,
      status,
      review,
    };
    // replace 操作
    const queryRst = await mysql.get('domain_state', {domain});
    let result
    if (queryRst) {
      // 更新 posts 表中的记录
      result = await mysql.update('domain_state', row, {
        where: {
          domain
        }
      }); 
    } else {
      // 插入一条记录
      result = await mysql.insert('domain_state', row);
    }
    // 判断更新成功
    const updateSuccess = result.affectedRows === 1;
    return updateSuccess
  }
}

module.exports = ApiService;
