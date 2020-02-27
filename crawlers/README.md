## 爬取shopify商家数据

### 运算
```bash
mkdir data
mkdir data/google-shopify
echo '[]' > result.txt
cp aliexpress-catergories.json.origin aliexpress-catergories.json
node src/google-shopify.js > google-shopify.log &
```

### 分析
```bash
npm run analysis
```

### 入库
```bash
npm run mysql
```

### 参考文章，reference

1. https://python-googlesearch.readthedocs.io/en/latest/

2. https://blog.zfanw.com/google-search-url-parameters/

3. https://answer-id.com/53460389