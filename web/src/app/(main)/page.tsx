"use client";

import React, { useState } from "react";
import { Card, Row, Col, Select, Space } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface DepartmentData {
  name: string;
  部门A: number;
  部门B: number;
  部门C: number;
  部门D: number;
  [key: string]: string | number;
}

// 优化数据生成函数
const generateMonthData = (month: number): DepartmentData[] => {
  // 为不同月份设置不同的基准值
  const monthFactor = Math.sin((month * Math.PI) / 6) * 50 + 100;

  const baseValues = {
    部门A: 400 + monthFactor,
    部门B: 300 + monthFactor * 0.8,
    部门C: 350 + monthFactor * 0.9,
    部门D: 250 + monthFactor * 0.7,
  };

  return Array.from({ length: 7 }).map((_, index) => ({
    name: `第${index + 1}周`,
    部门A: Math.round(baseValues.部门A + Math.random() * 50 - 25),
    部门B: Math.round(baseValues.部门B + Math.random() * 40 - 20),
    部门C: Math.round(baseValues.部门C + Math.random() * 45 - 22.5),
    部门D: Math.round(baseValues.部门D + Math.random() * 35 - 17.5),
  }));
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PerformancePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [chartData, setChartData] = useState(generateMonthData(1));
  const [pieData, setPieData] = useState(generateMonthData(1)[0]);

  const handleMonthChange = (value: number) => {
    setSelectedMonth(value);
    const newData = generateMonthData(value);
    setChartData(newData);
    setPieData(newData[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">绩效分析面板</h1>
        <Space>
          <span>选择月份：</span>
          <Select
            defaultValue={1}
            style={{ width: 120 }}
            onChange={handleMonthChange}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: `${i + 1}月`,
            }))}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* 折线图 */}
        <Col xs={24} xl={12}>
          <Card title="部门周绩效趋势" className="h-[400px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="部门A" stroke="#8884d8" />
                <Line type="monotone" dataKey="部门B" stroke="#82ca9d" />
                <Line type="monotone" dataKey="部门C" stroke="#ffc658" />
                <Line type="monotone" dataKey="部门D" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 柱状图 */}
        <Col xs={24} xl={12}>
          <Card title="部门绩效对比" className="h-[400px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="部门A" fill="#8884d8" />
                <Bar dataKey="部门B" fill="#82ca9d" />
                <Bar dataKey="部门C" fill="#ffc658" />
                <Bar dataKey="部门D" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 饼图 */}
        <Col xs={24} xl={12}>
          <Card title="部门绩效占比" className="h-[400px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(pieData)
                    .filter(([key]) => key !== "name")
                    .map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(pieData)
                    .filter(([key]) => key !== "name")
                    .map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 面积图 */}
        <Col xs={24} xl={12}>
          <Card title="累计绩效趋势" className="h-[400px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="部门A"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="部门B"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="部门C"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
                <Area
                  type="monotone"
                  dataKey="部门D"
                  stackId="1"
                  stroke="#ff7300"
                  fill="#ff7300"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformancePage;
