import { useMemo, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const PIE_COLORS = ['#2D6A4F', '#D4A373'];

function getBillMonth(bill: { month?: string; dueDate: string }): string {
  if (bill.month) return bill.month;
  try {
    const d = new Date(bill.dueDate);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  } catch {
    // ignore
  }
  return '';
}

export default function Dashboard() {
  const stalls = useMarketStore((s) => s.stalls);
  const merchants = useMarketStore((s) => s.merchants);
  const contracts = useMarketStore((s) => s.contracts);
  const feeBills = useMarketStore((s) => s.feeBills);
  const complaints = useMarketStore((s) => s.complaints);
  const inspections = useMarketStore((s) => s.inspections);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const monthBills = useMemo(() => {
    if (!selectedMonth) return feeBills;
    return feeBills.filter((b) => getBillMonth(b) === selectedMonth);
  }, [feeBills, selectedMonth]);

  const monthComplaints = useMemo(() => {
    if (!selectedMonth) return complaints;
    return complaints.filter((c) => c.complaintDate.startsWith(selectedMonth));
  }, [complaints, selectedMonth]);

  const monthInspections = useMemo(() => {
    if (!selectedMonth) return inspections;
    return inspections.filter((i) => i.inspectDate.startsWith(selectedMonth));
  }, [inspections, selectedMonth]);

  const rentalRate = useMemo(() => {
    if (stalls.length === 0) return 0;
    const occupied = stalls.filter((s) => s.status === 'occupied').length;
    return Math.round((occupied / stalls.length) * 100);
  }, [stalls]);

  const feeRate = useMemo(() => {
    if (monthBills.length === 0) return 0;
    const paid = monthBills.filter((f) => f.status === 'paid').length;
    return Math.round((paid / monthBills.length) * 100);
  }, [monthBills]);

  const pendingComplaints = useMemo(
    () => monthComplaints.filter((c) => c.status === 'pending').length,
    [monthComplaints]
  );

  const pendingInspections = useMemo(
    () => monthInspections.filter((i) => i.status === 'pending' || i.status === 'rectifying').length,
    [monthInspections]
  );

  const pieData = useMemo(() => {
    const occupied = stalls.filter((s) => s.status === 'occupied').length;
    const vacant = stalls.filter((s) => s.status === 'vacant').length;
    return [
      { name: '已租', value: occupied },
      { name: '空置', value: vacant },
    ];
  }, [stalls]);

  const areaFeeData = useMemo(() => {
    const areas = [...new Set(stalls.map((s) => s.area))];
    return areas.map((area) => {
      const areaStallIds = stalls.filter((s) => s.area === area).map((s) => s.id);
      const areaContractIds = contracts
        .filter((c) => areaStallIds.includes(c.stallId))
        .map((c) => c.id);
      const areaBills = monthBills.filter((b) => areaContractIds.includes(b.contractId));
      const paid = areaBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
      const unpaid = areaBills.filter((b) => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
      return { 区域: area, 已收: paid, 未收: unpaid };
    });
  }, [stalls, contracts, monthBills]);

  const complaintTrend = useMemo(() => {
    const now = selectedMonth ? new Date(selectedMonth + '-01') : new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'M月'),
      });
    }
    return months.map((m) => {
      const count = complaints.filter((c) => format(new Date(c.complaintDate), 'yyyy-MM') === m.key).length;
      return { 月份: m.label, 投诉数: count };
    });
  }, [complaints, selectedMonth]);

  const vacantStalls = useMemo(
    () => stalls.filter((s) => s.status === 'vacant'),
    [stalls]
  );

  const overdueMerchants = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    monthBills
      .filter((b) => b.status === 'overdue')
      .forEach((b) => {
        const contract = contracts.find((c) => c.id === b.contractId);
        if (!contract) return;
        const mid = contract.merchantId;
        if (!map.has(mid)) map.set(mid, { count: 0, total: 0 });
        const entry = map.get(mid)!;
        entry.count += 1;
        entry.total += b.amount;
      });
    return Array.from(map.entries()).map(([merchantId, data]) => {
      const merchant = merchants.find((m) => m.id === merchantId);
      return {
        merchantName: merchant?.name ?? '未知商户',
        overdueCount: data.count,
        overdueTotal: data.total,
      };
    });
  }, [monthBills, contracts, merchants]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const stallSheet = XLSX.utils.json_to_sheet(
      stalls.map((s) => ({
        摊位号: s.stallNo,
        区域: s.area,
        面积: s.size,
        类型: s.type,
        状态: s.status === 'occupied' ? '已租' : '空置',
      }))
    );
    XLSX.utils.book_append_sheet(wb, stallSheet, '摊位汇总');

    const feeSheet = XLSX.utils.json_to_sheet(
      monthBills.map((b) => {
        const contract = contracts.find((c) => c.id === b.contractId);
        const stall = contract ? stalls.find((s) => s.id === contract.stallId) : undefined;
        const merchant = contract ? merchants.find((m) => m.id === contract.merchantId) : undefined;
        return {
          月份: b.month || getBillMonth(b),
          摊位号: stall?.stallNo ?? '',
          商户: merchant?.name ?? '',
          金额: b.amount,
          到期日: b.dueDate,
          状态: b.status === 'paid' ? '已收' : b.status === 'overdue' ? '逾期' : '未收',
          收费日: b.paidDate ?? '',
        };
      })
    );
    XLSX.utils.book_append_sheet(wb, feeSheet, '收费统计');

    const complaintSheet = XLSX.utils.json_to_sheet(
      monthComplaints.map((c) => {
        const merchant = merchants.find((m) => m.id === c.merchantId);
        return {
          商户: merchant?.name ?? '',
          内容: c.content,
          投诉日期: c.complaintDate,
          处理人: c.handler ?? '',
          状态: c.status === 'pending' ? '待处理' : c.status === 'processing' ? '处理中' : '已解决',
          结果: c.result ?? '',
        };
      })
    );
    XLSX.utils.book_append_sheet(wb, complaintSheet, '投诉记录');

    const inspectionSheet = XLSX.utils.json_to_sheet(
      monthInspections.map((i) => {
        const stall = stalls.find((s) => s.id === i.stallId);
        return {
          摊位号: stall?.stallNo ?? '',
          巡查日期: i.inspectDate,
          问题: i.issue,
          类型: i.type,
          整改期限: i.deadline,
          状态:
            i.status === 'pending'
              ? '待整改'
              : i.status === 'rectifying'
              ? '整改中'
              : i.status === 'recheck_pass'
              ? '复查通过'
              : '复查未通过',
          复查日期: i.recheckDate ?? '',
          复查结果: i.recheckResult ?? '',
        };
      })
    );
    XLSX.utils.book_append_sheet(wb, inspectionSheet, '巡查记录');

    const monthLabel = selectedMonth || format(new Date(), 'yyyyMM');
    const fileName = `月度经营表_${monthLabel.replace('-', '')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest-800">数据看板</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">统计月份：</label>
          <input
            type="month"
            className="input-field w-44"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button className="btn-primary" onClick={handleExport}>
            导出月度经营表
          </button>
        </div>
      </div>

      {selectedMonth && (
        <div className="text-sm text-gray-500 bg-forest-50 rounded-lg px-4 py-2 inline-block">
          当前筛选月份：<span className="font-medium text-forest-700">{selectedMonth}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-forest-600">摊位出租率</div>
          <div className="text-3xl font-bold text-forest-800 mt-1">{rentalRate}%</div>
        </div>
        <div className="card">
          <div className="text-sm text-forest-600">当月收费率</div>
          <div className="text-3xl font-bold text-forest-800 mt-1">{feeRate}%</div>
        </div>
        <div className="card">
          <div className="text-sm text-forest-600">当月待处理投诉</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{pendingComplaints}</div>
        </div>
        <div className="card">
          <div className="text-sm text-forest-600">当月待整改问题</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{pendingInspections}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-forest-800 mb-4">摊位状态分布</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-forest-800 mb-4">
            {selectedMonth ? `${selectedMonth} 各区域收费` : '各区域收费统计'}
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={areaFeeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="区域" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="已收" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="未收" fill="#D4A373" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-forest-800 mb-4">近6月投诉趋势</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={complaintTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="月份" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="投诉数" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-forest-800 mb-4">空置摊位查询</h2>
        {vacantStalls.length === 0 ? (
          <div className="text-sm text-gray-500">暂无空置摊位</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">摊位号</th>
                  <th className="px-4 py-3 text-left">区域</th>
                  <th className="px-4 py-3 text-left">面积</th>
                  <th className="px-4 py-3 text-left">类型</th>
                </tr>
              </thead>
              <tbody>
                {vacantStalls.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-4 py-2.5">{s.stallNo}</td>
                    <td className="px-4 py-2.5">{s.area}</td>
                    <td className="px-4 py-2.5">{s.size}</td>
                    <td className="px-4 py-2.5">{s.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-forest-800 mb-4">
          {selectedMonth ? `${selectedMonth} 欠款商户` : '欠款商户统计'}
        </h2>
        {overdueMerchants.length === 0 ? (
          <div className="text-sm text-gray-500">暂无欠款商户</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">商户名称</th>
                  <th className="px-4 py-3 text-left">欠款笔数</th>
                  <th className="px-4 py-3 text-left">欠款总额</th>
                </tr>
              </thead>
              <tbody>
                {overdueMerchants.map((m, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="px-4 py-2.5">{m.merchantName}</td>
                    <td className="px-4 py-2.5">{m.overdueCount}</td>
                    <td className="px-4 py-2.5 text-red-600 font-medium">¥{m.overdueTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
