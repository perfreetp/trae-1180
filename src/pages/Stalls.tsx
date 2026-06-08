import { useState, useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Stall } from '@/types';

const AREAS = ['A区', 'B区', 'C区', 'D区'];
const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '空置', value: 'vacant' },
  { label: '已租', value: 'occupied' },
];

interface FormData {
  stallNo: string;
  area: string;
  size: string;
  type: string;
}

const emptyForm: FormData = { stallNo: '', area: 'A区', size: '', type: '' };

export default function Stalls() {
  const { stalls, merchants, contracts, addStall, updateStall, deleteStall, resyncStalls } = useMarketStore();

  useEffect(() => {
    resyncStalls();
  }, [resyncStalls]);

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const total = stalls.length;
  const occupied = stalls.filter((s) => s.status === 'occupied').length;
  const vacant = stalls.filter((s) => s.status === 'vacant').length;
  const rate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0';

  const filtered = stalls.filter((s) => {
    if (search && !s.stallNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (areaFilter && s.area !== areaFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const getMerchantName = (merchantId?: string) => {
    if (!merchantId) return '-';
    const m = merchants.find((m) => m.id === merchantId);
    return m ? m.name : '-';
  };

  const getMerchantBusiness = (merchantId?: string) => {
    if (!merchantId) return '-';
    const m = merchants.find((m) => m.id === merchantId);
    return m ? m.business : '-';
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (stall: Stall) => {
    setEditingId(stall.id);
    setForm({
      stallNo: stall.stallNo,
      area: stall.area,
      size: String(stall.size),
      type: stall.type,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.stallNo || !form.area || !form.size || !form.type) return;

    if (editingId) {
      updateStall(editingId, {
        stallNo: form.stallNo,
        area: form.area,
        size: Number(form.size),
        type: form.type,
      });
    } else {
      const newStall: Stall = {
        id: Date.now().toString(),
        stallNo: form.stallNo,
        area: form.area,
        size: Number(form.size),
        type: form.type,
        status: 'vacant',
      };
      addStall(newStall);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteStall(id);
  };

  const handlePrint = (stall: Stall) => {
    const activeContract = contracts.find(
      (c) => c.stallId === stall.id && c.status === 'active'
    );
    const currentMerchantId = activeContract?.merchantId ?? stall.merchantId;
    const isActuallyOccupied = !!activeContract;
    const merchantName = isActuallyOccupied ? getMerchantName(currentMerchantId) : '（空置）';
    const businessType = isActuallyOccupied ? getMerchantBusiness(currentMerchantId) : '-';
    const now = new Date().toLocaleDateString('zh-CN');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>摊位证</title>
        <style>
          body { font-family: SimSun, serif; text-align: center; padding: 60px 40px; }
          h1 { font-size: 32px; margin-bottom: 40px; }
          .info { text-align: left; max-width: 500px; margin: 0 auto; font-size: 18px; line-height: 2.4; }
          .info span { font-weight: bold; }
          .footer { margin-top: 60px; font-size: 16px; color: #666; }
        </style>
      </head>
      <body>
        <h1>农贸市场监管局</h1>
        <h2>摊位证</h2>
        <div class="info">
          <p>摊位编号：<span>${stall.stallNo}</span></p>
          <p>商户名称：<span>${merchantName}</span></p>
          <p>经营类型：<span>${businessType}</span></p>
          <p>所在区域：<span>${stall.area}</span></p>
          <p>摊位面积：<span>${stall.size}㎡</span></p>
        </div>
        <div class="footer">发证日期：${now}</div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-gray-500">摊位总数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{occupied}</div>
          <div className="text-sm text-gray-500">已租摊位</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{vacant}</div>
          <div className="text-sm text-gray-500">空置摊位</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{rate}%</div>
          <div className="text-sm text-gray-500">出租率</div>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="搜索摊位编号..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select-field"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
        >
          <option value="">全部区域</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          className="select-field"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button className="btn-primary" onClick={openAdd}>新增摊位</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3">摊位编号</th>
              <th className="text-left p-3">区域</th>
              <th className="text-left p-3">面积(㎡)</th>
              <th className="text-left p-3">类型</th>
              <th className="text-left p-3">状态</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stall) => (
              <tr key={stall.id} className="table-row">
                <td className="p-3">{stall.stallNo}</td>
                <td className="p-3">{stall.area}</td>
                <td className="p-3">{stall.size}</td>
                <td className="p-3">{stall.type}</td>
                <td className="p-3">
                  {stall.status === 'occupied' ? (
                    <span className="badge-green">已租</span>
                  ) : (
                    <span className="badge-red">空置</span>
                  )}
                </td>
                <td className="p-3 space-x-2">
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(stall)}>编辑</button>
                  <button className="btn-secondary btn-sm" onClick={() => handlePrint(stall)}>打印摊位证</button>
                  {stall.status === 'vacant' && (
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(stall.id)}>删除</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingId ? '编辑摊位' : '新增摊位'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">摊位编号</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={form.stallNo}
                  onChange={(e) => setForm({ ...form, stallNo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">区域</label>
                <select
                  className="select-field w-full"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">面积(㎡)</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">类型</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleSubmit}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
