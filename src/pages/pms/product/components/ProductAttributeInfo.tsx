import React, {useEffect, useState} from 'react';
import {Modal, Form, Input, message, Checkbox, Upload, TreeSelect, Card, Select} from 'antd';
import type {AttributeCategoryListItem} from "@/pages/pms/product_attribute_category/data";
import {queryCategoryAttribute} from "@/pages/pms/product_attribute_category/service";
import {queryAttribute} from "@/pages/pms/product_attribute/service";
import type {AttributeListItem} from "@/pages/pms/product_attribute/data";
import type {RcFile, UploadProps} from 'antd/es/upload';
import type {UploadFile} from 'antd/es/upload/interface';
import {PlusOutlined} from "@ant-design/icons";
import 'braft-editor/dist/index.css';
import BraftEditor from 'braft-editor';
// @ts-ignore
import {ContentUtils} from 'braft-utils';

export interface BaseInfoProps {
  visible: boolean;
}

const FormItem = Form.Item;

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ProductAttributeInfo: React.FC<BaseInfoProps> = (props) => {

  const [attributeCategoryListItem, setAttributeCategoryListItem] = useState<AttributeCategoryListItem[]>([]);
  const [attributeListItem0, setAttributeListItem0] = useState<AttributeListItem[]>([]);
  const [attributeListItem1, setAttributeListItem1] = useState<AttributeListItem[]>([]);

  const [content, setContent] = useState(BraftEditor.createEditorState(null))

  useEffect(() => {
    if (props.visible) {
      queryCategoryAttribute({}).then((res) => {
        if (res.code === '000000') {
          const map = res.data.map((item: { id: any; name: any; title: any; parentId: any }) => ({
            value: item.id,
            id: item.id,
            label: item.name,
            title: item.name,
            parentId: item.parentId,
          }));

          setAttributeCategoryListItem(map);
        } else {
          message.error(res.msg);
        }
      });
    }
  }, [props.visible]);

  const onChange = (attributeCategoryId: string) => {
    //查询规格和参数
    queryAttribute({"productAttributeCategoryId": Number(attributeCategoryId)}).then((res) => {
      if (res.code === '000000') {
        const resData = res.data
        if (resData != null) {
          const params0 = resData.filter((x: { type: number; }) => x.type === 0);
          setAttributeListItem0(params0);

          const params1 = resData.filter((x: { type: number; }) => x.type === 1);
          setAttributeListItem1(params1)
        } else {
          setAttributeListItem0([])
          setAttributeListItem1([])
        }
      } else {
        message.error(res.msg);
      }
    });

  };

  //上传图片
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-2',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },

  ]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = ({fileList: newFileList}) =>
    setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined/>
      <div style={{marginTop: 8}}>Upload</div>
    </div>
  );

  //编辑器
  // const controls: any = ['undo', 'redo', 'separator',
  //   'font-size', 'line-height', 'letter-spacing', 'separator',
  //   'text-color', 'blod', 'italic', 'underline', 'strike-through', 'separator',
  //   'superscript', 'subscript', 'remove-styles', 'emoji', 'separator', 'text-indent', 'text-align', 'separator',
  //   'headings', 'list-ul', 'list-ol', 'blockquote', 'code', 'separator',
  //   'link', 'separator', 'hr', 'separator',
  //   'clear', 'separator',
  // ]
  const controls: any = ['bold', 'italic', 'underline', 'text-color', 'separator', 'link', 'separator', 'media']
  const handleImageContentChange = (info: any) => {
    // if (info?.file?.response?.message == "success") {
    //   setContent(ContentUtils.insertMedias(content, [{
    //     type: 'IMAGE',
    //     url: info?.file?.response?.url
    //   }]))
    // }
    setContent(ContentUtils.insertMedias(content, [{
      type: 'IMAGE',
      url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    }]))
  }
  const extendControlsContent: any = [
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <Upload
          accept="*"
          showUploadList={false}
          onChange={handleImageContentChange}
          action='http://127.0.0.1:9097/upload/image'
        >
          <button type="button" className="control-item button upload-button" data-title="插入图片">上传图片</button>
        </Upload>
      )
    }
  ]

  return (
    <>
      <FormItem name="productAttributeCategoryId" label="属性类型">
        <TreeSelect
          style={{width: '100%'}}
          dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
          treeData={attributeCategoryListItem}
          placeholder="请选择属性类型"
          treeDefaultExpandAll
          onChange={onChange}
        />
      </FormItem>
      <FormItem name="name1" label="商品规格">
        <Card>
          {attributeListItem0.map(r => r.inputList !== "" && <FormItem name={r.name} key={r.id} label={r.name}>
            {/*<Radio.Group>*/}
            {/*  {r.inputList.split(',').map(x => <Radio key={x} value={x}>{x}</Radio>)}*/}
            {/*</Radio.Group>*/}
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <Checkbox.Group key={r.name}>
              {r.inputList.split(',').map(x => <Checkbox key={x} value={x}>{x}</Checkbox>)}
            </Checkbox.Group>

          </FormItem>)}
        </Card>
      </FormItem>
      <FormItem name="name2" label="商品参数">
        <Card>
          {attributeListItem1.map(r => <FormItem key={r.id} name="subTitle" label={r.name}>
            {r.inputType === 0 && <Input id={r.name}/>}
            {r.inputType === 1 && <Select id="productAttributeCategoryId" placeholder={'请选择' + r.name}>
              {r.inputList.split(",").map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
            </Select>}
          </FormItem>)}
        </Card>
      </FormItem>
      <FormItem name="albumPics" label="商品相册">
        <Card>
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length >= 3 ? null : uploadButton}
          </Upload>
          <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
            <img alt="example" style={{width: '100%'}} src={previewImage}/>
          </Modal>
        </Card>
      </FormItem>
      <FormItem name="detailMobileHtml" label="商品详情">
        <Card>
          <BraftEditor
            className="my-editor"
            value={content}
            onChange={(editorState) => {
              setContent(editorState)
            }}
            controls={controls}
            extendControls={extendControlsContent}
            placeholder="请输入正文内容"
            contentStyle={{height: 400}}
          />
        </Card>
      </FormItem>
    </>
  );
};

export default ProductAttributeInfo;
