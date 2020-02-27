git clone https://github.com/xiaoxudoo/shopify.git
mkdir data
mkdir google-shopify
touch result.txt
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
vim /etc/profile
source /etc/profile
nvm install 12.14.1
nvm use 12.14.1
node -v
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install
cd node_modules/puppeteer/.local-chromium/linux-722234/chrome-linux/
ldd chrome | grep not
git config --global user.email "xiaoxudoo@126.com"
git config --global user.name "xiaoxudoo" 
# ps aux | grep node
node src/google-shopify.js > google-shopify.log &
ps aux | grep node | awk '{ print $2; cmd="kill -9 "$2; system(cmd) }'

mysql -u root -p xiaoxudoo@126 / 123
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your password'; // 允许在code中密码连接 
show databases;
create database google_shopify;
use google_shopify;
show tables;
truncate table google_shopify.shopify_domain; // 删除表
select count(*) from google_shopify.shopify_domain; // 查看数据条数
