import React, { useState } from 'react';
import { Form, Input, Modal, Select } from 'antd';

import { TableListItem } from '../data.d';

export interface FormValueType extends Partial<TableListItem> {
  domain?: string;
  status?: number;
  review?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
}
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

export interface UpdateFormState {
  formVals: FormValueType;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({
    domain: props.values.domain,
    status: props.values.status,
    review: props.values.review,
  });

  const [form] = Form.useForm();

  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,
  } = props;

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();

    // todo: 这里对formVals 设置失败了
    setFormVals({ ...formVals, ...fieldsValue });

    handleUpdate({ ...formVals, ...fieldsValue });
  };

  const renderContent = () => {
    return (
      <>
        <FormItem
          name="domain"
          label="shopify域名"
        >
          <Input disabled={true} />
        </FormItem>
        <FormItem name="status" label="当前状态">
          <Select style={{ width: '100%' }} optionLabelProp="label">
            <Option value={0} label="未联系">未联系</Option>
            <Option value={1} label="联系中">联系中</Option>
            <Option value={2} label="失败">失败</Option>
            <Option value={3} label="成功">成功</Option>
          </Select>
        </FormItem>
        <FormItem
          name="review"
          label="操作记录"
          rules={[{ required: true, message: '请输入至少五个字符的规则描述！', min: 5, max: 250 }]}
        >
          <TextArea rows={4} placeholder="请输入至少五个字符" />
        </FormItem>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title="修改状态"
      visible={updateModalVisible}
      onOk={() => handleSubmit()}
      onCancel={() => handleUpdateModalVisible(false, values)}
      afterClose={() => handleUpdateModalVisible()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          domain: formVals.domain,
          status: formVals.status,
          review: formVals.review
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default UpdateForm;
