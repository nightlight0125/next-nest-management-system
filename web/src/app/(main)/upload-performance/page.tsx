"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Card,
  InputNumber,
  Divider,
  DatePicker,
} from "antd";
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { fetchWrapper } from "@/lib/utils";
import LoadingPage from "@/components/LoadingPage";
import { v4 as uuidv4 } from "uuid";
import zhCN from "antd/lib/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { ConfigProvider } from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface SelfCheckItem {
  key: string;
  responsible: string;
  score: number;
  reason: string;
}

const { Dragger } = Upload;

export default function PerformanceEdit() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selfCheckItems, setSelfCheckItems] = useState<SelfCheckItem[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [uploadState, setUploadState] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [yearMonth, setYearMonth] = useState<string>("");
  const [wordFile, setWordFile] = useState(null);

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setYearMonth(date.format("YYYY-MM"));
    }
  };

  useEffect(() => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      fetchWrapper(`/user/${user.id}`).then((res) => {
        setUserData(res.data);
      });
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error.message || "获取用户数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingPage />;

  const handleSubmit = async (values: any) => {
    if (!wordFile) {
      messageApi.error("请上传附件");
      return;
    }
    setIsSubmitting(true);
    try {
      if (values.selfCheck.length === 0) {
        messageApi.error("请添加自查项");
        return;
      }
      const perUnitSelfCheckedCondition: any[] = [];
      Object.keys(values.selfCheck).forEach((key) => {
        perUnitSelfCheckedCondition.push({
          responsiblePerson: values.selfCheck[key].responsible,
          responsiblePersonScore: values.selfCheck[key].score,
          responsiblePersonRemark: values.selfCheck[key].reason,
        });
      });
      const data = {
        unitId: userData?.unitId,
        createPersonId: userData?.id,
        yearMonth,
        selfCheckedScore: values.totalScore,
        wordFile: wordFile[0]?.response?.avatarUrl,
        perUnitSelfCheckedCondition: JSON.stringify(
          perUnitSelfCheckedCondition
        ),
      };
      await fetchWrapper("/current-year-month-unit-performance", {
        method: "POST",
        body: JSON.stringify(data),
      });

      messageApi.destroy();
      messageApi.success("保存成功");
      router.push("/performance-management/performance-list");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error.message || "保存失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理Excel文件上传
  const handleUpload = (file: File) => {
    setUploadState(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet);

        if (!excelData || excelData.length === 0) {
          message.error("文件解析失败");
          return false;
        }

        // 处理Excel数据
        const items: SelfCheckItem[] = excelData.map((row: any) => ({
          key: uuidv4(),
          responsible: row["姓名"],
          score: Number(row["得分"]),
          reason: row["扣分（加分）原因及对应考核评分标准"],
        }));
        setSelfCheckItems(items);
        const totalScoreValue = Number(
          (excelData[0] as any)?.["综合得分"] ?? 0
        );
        setTotalScore(totalScoreValue);
        form.setFieldsValue({ totalScore: totalScoreValue });

        messageApi.destroy();
        messageApi.success("文件上传成功");
      } catch (error) {
        setUploadState(false);
        messageApi.destroy();
        messageApi.error("文件解析失败");
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  // 添加新的自查项
  const addSelfCheckItem = () => {
    const newItem: SelfCheckItem = {
      key: uuidv4(),
      responsible: "",
      score: 0,
      reason: "",
    };
    setSelfCheckItems([...selfCheckItems, newItem]);
  };

  const deleteItem = (key) => {
    setSelfCheckItems([...selfCheckItems.filter((i) => key !== i.key)]);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleUploadFile = (info: any) => {
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    newFileList = newFileList.slice(-2);

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });
    console.log(newFileList);

    if (newFileList.length > 0) {
      setWordFile(newFileList);
    }
  };

  const handleRemoveFile = () => {
    console.log("remove");
    setWordFile(null);
  };

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <ConfigProvider locale={zhCN}>
        {userData?.unitId ? (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Excel上传 */}
            {!uploadState ? (
              <Form.Item label="上传Excel文件">
                <Dragger
                  accept=".xlsx,.xls"
                  beforeUpload={handleUpload}
                  showUploadList={false}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                </Dragger>
              </Form.Item>
            ) : null}

            {/* 单位选择 */}
            {uploadState ? (
              <Form.Item
                label="单位"
                name="unitId"
                initialValue={userData?.unit?.name}
                rules={[{ required: true, message: "请输入单位" }]}
              >
                <Input placeholder="请输入单位" disabled />
              </Form.Item>
            ) : null}

            {/* 选择月份 */}
            {uploadState ? (
              <Form.Item
                label="月份"
                name="month"
                rules={[{ required: true, message: "请选择月份" }]}
              >
                <DatePicker.MonthPicker
                  value={dayjs(yearMonth)}
                  onChange={handleMonthChange}
                  placeholder="选择年月"
                />
              </Form.Item>
            ) : null}

            {/* 综合得分 */}
            {uploadState ? (
              <Form.Item
                label="综合得分"
                name="totalScore"
                rules={[{ required: true, message: "请输入综合得分" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  value={totalScore}
                  onChange={(value) => setTotalScore(Number(value))}
                />
              </Form.Item>
            ) : null}

            {/* 自查情况列表 */}
            {uploadState ? (
              <>
                <Divider>各单位自查情况</Divider>
                {selfCheckItems.map((item) => (
                  <Card key={item.key} style={{ marginBottom: "16px" }}>
                    <Space direction="horizontal" style={{ width: "100%" }}>
                      <Form.Item
                        label="责任人"
                        name={["selfCheck", item.key, "responsible"]}
                        rules={[{ required: true, message: "请输入责任人" }]}
                        initialValue={item.responsible}
                        style={{ flex: "0 0 150px" }} // Adjust width
                      >
                        <Input placeholder="请输入责任人" />
                      </Form.Item>
                      <Form.Item
                        label="得分"
                        name={["selfCheck", item.key, "score"]}
                        rules={[{ required: true, message: "请输入得分" }]}
                        initialValue={item.score}
                      >
                        <InputNumber placeholder="请输入得分" />
                      </Form.Item>
                      <Form.Item
                        label="原因"
                        name={["selfCheck", item.key, "reason"]}
                        rules={[{ required: true, message: "请输入原因" }]}
                        initialValue={item.reason}
                        style={{ flex: "1" }} // Adjust width
                      >
                        <Input placeholder="请输入原因" />
                      </Form.Item>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteItem(item.key)}
                      >
                        删除
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={addSelfCheckItem}
                  block
                  icon={<PlusOutlined />}
                  className="mb-12"
                >
                  添加自查项
                </Button>
                {/* Word文件上传 */}
                <Form.Item
                  name="upload"
                  label="上传附件"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    name="file"
                    action="/api/uploadImage"
                    listType="picture"
                    maxCount={1}
                    accept=".doc,.docx"
                    onChange={handleUploadFile}
                    onRemove={handleRemoveFile}
                  >
                    <Button icon={<UploadOutlined />}>上传附件</Button>
                  </Upload>
                </Form.Item>
              </>
            ) : null}

            {/* 提交按钮 */}
            {uploadState ? (
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  保存
                </Button>
              </Form.Item>
            ) : null}
          </Form>
        ) : (
          <div className="text-center text-lg mt-12 text-gray-500 rounded-lg">
            请绑定单位
          </div>
        )}
      </ConfigProvider>
    </div>
  );
}
