// dash.tsx
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

// Mock data generation
const generateMockData = () => {
  const sources = [
    { name: 'Credit Card', color: '#8884d8', count: 1200, amount: 150000 },
    { name: 'Bank Transfer', color: '#82ca9d', count: 800, amount: 200000 },
    { name: 'PayPal', color: '#ffc658', count: 600, amount: 95000 },
    { name: 'Stripe', color: '#ff7300', count: 400, amount: 75000 },
    { name: 'Apple Pay', color: '#a4de6c', count: 300, amount: 45000 },
    { name: 'Google Pay', color: '#d0ed57', count: 200, amount: 30000 },
    { name: 'Crypto', color: '#f20089', count: 100, amount: 50000 },
    { name: 'Check', color: '#51cf66', count: 150, amount: 20000 },
  ];

  // Treemap data for count and amount (hierarchical for demo)
  const treemapCountData = sources.map((source, index) => ({
    name: source.name,
    size: source.count,
    color: source.color,
    fill: index % 2 === 0 ? source.color : `${source.color}20`,
  }));

  const treemapAmountData = sources.map((source, index) => ({
    name: source.name,
    size: source.amount,
    color: source.color,
    fill: index % 2 === 0 ? source.color : `${source.color}20`,
  }));

  // Table data
  const tableData = sources.map((source) => ({
    source: source.name,
    consumers: source.count,
    totalAmount: `$${source.amount.toLocaleString()}`,
    avgAmount: `$${(source.amount / source.count).toFixed(2)}`,
    transferRate: `${(Math.random() * 5 + 1).toFixed(1)}%`,
  }));

  // Line chart data for monthly totals
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineData = months.map((month, index) => ({
    month,
    totalCount: 500 + Math.random() * 500 + index * 10,
    totalAmount: 50000 + Math.random() * 50000 + index * 2000,
  }));

  return { treemapCountData, treemapAmountData, tableData, lineData };
};

// Source Tree Component
const SourceTree: React.FC<{ sources: string[]; selected: string[]; onSelect: (source: string) => void }> = ({
  sources,
  selected,
  onSelect,
}) => {
  return (
    <div className="w-48 bg-white p-4 border-r border-gray-200">
      <h3 className="font-bold mb-4">Payment Sources</h3>
      <ul>
        {sources.map((source) => (
          <li key={source} className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(source)}
                onChange={() => onSelect(source)}
                className="mr-2"
              />
              {source}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Treemap Component
const CustomTreemap: React.FC<{ data: any[]; title: string }> = ({ data, title }) => {
  const renderCustomized = (props: any) => {
    const { x, y, width, height, value, name } = props;
    if (width < 10 || height < 10) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={props.fill} stroke="#fff" />
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 20}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
        >
          {value.toLocaleString()}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white p-4 border rounded shadow">
      <h3 className="font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="size"
          ratio={4 / 3}
          stroke="#fff"
          content={renderCustomized}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

// Table Component
const PaymentTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white p-4 border rounded shadow">
      <h3 className="font-bold mb-4">Top Sources Summary</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Source</th>
            <th className="border p-2 text-left">Consumers</th>
            <th className="border p-2 text-left">Total Amount</th>
            <th className="border p-2 text-left">Avg Amount</th>
            <th className="border p-2 text-left">Transfer Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="border p-2">{row.source}</td>
              <td className="border p-2">{row.consumers}</td>
              <td className="border p-2">{row.totalAmount}</td>
              <td className="border p-2">{row.avgAmount}</td>
              <td className="border p-2">{row.transferRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Line Chart Component
const TotalLineChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white p-4 border rounded shadow col-span-2">
      <h3 className="font-bold mb-4">Total Count & Amount by Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="totalCount" stroke="#8884d8" name="Total Count" />
          <Line yAxisId="right" type="monotone" dataKey="totalAmount" stroke="#82ca9d" name="Total Amount ($)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Dashboard Component
const Dash: React.FC = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const mockData = generateMockData();
  const sources = Object.keys(mockData.treemapCountData).map((_, i) => mockData.treemapCountData[i].name);

  const handleSourceSelect = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  // Filter data based on selected sources (for demo, no filter applied)
  const filteredCountData = mockData.treemapCountData;
  const filteredAmountData = mockData.treemapAmountData;
  const filteredTableData = mockData.tableData;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Source Tree */}
      <SourceTree
        sources={sources}
        selected={selectedSources}
        onSelect={handleSourceSelect}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Payments Received Dashboard</h1>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <CustomTreemap data={filteredCountData} title="Sources by Consumer Count" />
          <CustomTreemap data={filteredAmountData} title="Sources by Total Amount" />
        </div>

        {/* Bottom Line Chart */}
        <TotalLineChart data={mockData.lineData} />
      </div>

      {/* Right Sidebar - Table */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-auto">
        <PaymentTable data={filteredTableData} />
      </div>
    </div>
  );
};

export default Dash;