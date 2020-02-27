import { Cascader, Checkbox, Select, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { SorterResult } from 'antd/es/table/interface';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/newUpdateForm';
import { TableListItem, Category } from './data.d';
import { queryShopify, updateStatus, fetchCategory } from './service';
const { Option } = Select;

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在修改');
  try {
    await updateStatus({
      domain: fields.domain,
      status: fields.status,
      review: fields.review,
    });
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [options, setOptions] = useState<Category[]>([]);
  const [sorter, setSorter] = useState<string>('');
  const [lang, setLang] = useState<string|undefined>('en');
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({});
  const [is_ww_ship, handlewwShip] = useState<number>(1);
  const [is_uniq, handleUniqAnalysis] = useState<number>(1);
  const [first_category_id, setFirstCategory] = useState<number | undefined>(undefined);
  const [second_category_id, setSecondCategory] = useState<number | undefined>(undefined);
  const [third_category_id, setThirdCategory] = useState<number | undefined>(undefined);

  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'shopify域名',
      dataIndex: 'domain',
      render: (text: React.ReactNode): React.ReactNode => {
        const url = `https://${text}`;
        return (
          <a href={url} target="_blank">
            {text}
          </a>
        );
      },
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      hideInForm: true,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '未联系', status: 'Default' },
        1: { text: '联系中', status: 'Processing' },
        2: { text: '联系成功', status: 'Success' },
        3: { text: '联系失败', status: 'Error' },
      },
    },
    {
      title: '添加评论',
      dataIndex: 'review',
      hideInTable: true,
      valueType: 'textarea'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            // onClick={() => {
            //   handleModalVisible(true);
            // }}
            onClick={() => {
              handleUpdateModalVisible(true);
              setFormValues(record);
            }}
          >
            修改状态
          </a>
        </>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const category = await fetchCategory();
      setOptions(category);
    };
    fetchData();
  }, []);

  return (
    <PageHeaderWrapper>
      <ProTable<TableListItem>
        headerTitle="查询域名"
        actionRef={actionRef}
        rowKey="index"
        search={false}
        onChange={(_, _filter, _sorter) => {
          const sorterResult = _sorter as SorterResult<TableListItem>;
          if (sorterResult.field) {
            setSorter(`${sorterResult.field}_${sorterResult.order}`);
          }
        }}
        toolBarRender={action => [
          '品类:',
          <Cascader
            options={options}
            onChange={value => {
              console.log(value);
              switch (value.length) {
                case 1:
                  setFirstCategory(~~value[0]);
                  break;
                case 2:
                  setSecondCategory(~~value[1]);
                  break;
                case 3:
                  setThirdCategory(~~value[2]);
                  break;
                default:
                  setFirstCategory(undefined);
                  setSecondCategory(undefined);
                  setThirdCategory(undefined);
              }
            }}
            changeOnSelect
            style={{width: '200px'}}
            placeholder="Please select"
          />,
          <span>&nbsp;&nbsp;</span>,
          '语言:',
          <Select
            mode="multiple"
            placeholder="选择语言"
            style={{ width: '200px' }}
            defaultValue={[lang]}
            onChange={(value: string[]) => {
              console.log(value)
              setLang(value.join('|'))
            }}
            optionLabelProp="label"
          >
            <Option value="en" label="en">
              <span role="img" aria-label="en">
                🇺🇸
              </span>
              USA (英语)
            </Option>
            <Option value="nl" label="nl">
              <span role="img" aria-label="nl">
                🇳🇱
              </span>
              荷兰 (荷语)
            </Option>
            
            <Option value="de" label="de">
              <span role="img" aria-label="de">
                🇩🇪
              </span>
              德国 (德语)
            </Option>
            <Option value="pt" label="pt">
              <span role="img" aria-label="pt">
                🇧🇷
              </span>
              巴西 (葡萄牙语)
            </Option>
          </Select>,
          <span>&nbsp;&nbsp;</span>,
          <Checkbox
            checked={!!is_ww_ship}
            onChange={e => {
              handlewwShip(e.target.checked ? 1 : 0);
            }}
          >
            world wide ship
          </Checkbox>,
          <Checkbox
            checked={!!is_uniq}
            onChange={e => {
              console.log(e.target.checked);
              handleUniqAnalysis(e.target.checked ? 1 : 0);
            }}
          >
            去重分析
          </Checkbox>,
        ]}
        params={{
          sorter,
          lang,
          is_ww_ship,
          is_uniq,
          first_category_id,
          second_category_id,
          third_category_id,
        }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        tableAlertRender={(selectedRowKeys, selectedRows) => (
          <div>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
            <span>域名总计出现 {selectedRows.reduce((pre, item) => pre + item.rank, 0)} 次</span>
          </div>
        )}
        request={params => queryShopify(params)}
        columns={columns}
        rowSelection={{}}
      />
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable<TableListItem, TableListItem>
          onSubmit={async value => {
            // const success = await handleSetStatus(value);
            // if (success) {
            //   handleModalVisible(false);
            //   if (actionRef.current) {
            //     actionRef.current.reload();
            //   }
            // }
          }}
          rowKey="id"
          type="form"
          columns={columns}
          rowSelection={{}}
        />
      </CreateForm>
      {formValues && Object.keys(formValues).length ? (
        <UpdateForm
          onSubmit={async value => {
            const success = await handleUpdate(value);
            if (success) {
              handleModalVisible(false);
              setFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={formValues}
        />
      ) : null}
    </PageHeaderWrapper>
  );
};

export default TableList;
