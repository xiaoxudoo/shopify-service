import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Typography } from 'antd';
import styles from './Welcome.less';

const CodePreview: React.FC<{}> = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => (
  <PageHeaderWrapper>
    <Card>
      <Typography.Text strong>
        <a target="_blank" rel="noopener noreferrer" href="https://www.shopifynotes.com/shopify66.html">
          大叔教你如何分析一个竞品Shopify店铺
        </a>
      </Typography.Text>
      <CodePreview> 如何全方位分析一家shopify店铺 </CodePreview>
      <Typography.Text
        strong
        style={{
          marginBottom: 12,
        }}
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://adspy.com/"
        >
          AdSpy
        </a>
      </Typography.Text>
      <CodePreview> AdSpy is the largest searchable database of Facebook and Instagram ads in the world.  </CodePreview>
      <Typography.Text
        strong
        style={{
          marginBottom: 12,
        }}
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.similarweb.com/"
        >
          关联网站查询
        </a>
      </Typography.Text>
      <CodePreview> Similar Web </CodePreview>
    </Card>
  </PageHeaderWrapper>
);
