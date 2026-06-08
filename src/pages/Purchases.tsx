import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Purchase } from '@/types';

const CATEGORIES = ['蔬菜', '水果', '水产', '熟食', '冷冻', '干货', '豆制品', '综合'];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): Omit<Purchase, 'id'> => ({
  merchantId: '',
  date: today(),
  source: '',
  category: CATEGORIES[0],
  quantity: 0,
  coldStorage: false,
});

export default function Purchases() {
  const { purchases, merchants, addPurchase, updatePurchase, deletePurchase } = useMarketStore();

  const [filterDate, setFilterDate] = useState(today());
  const [filterMerchant, setFilterMerchant] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (p: Purchase) => {
    setEditingId(p.id);
    setForm({
      merchantId: p.merchantId,
      date: p.date,
      source: p.source,
      category: p.category,
      quantity: p.quantity,
      coldStorage: p.coldStorage,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.merchantId || !form.source || form.quantity <= 0) return;
    if (editingId) {
      updatePurchase(editingId, form);
    } else {
      addPurchase({ id: Date.now().toString(), ...form });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deletePurchase(id);
  };

  const getMerchantName = (merchantId: string) => {
    const m = merchants.find((m) => m.id === merchantId);
    return m ? m.name : '未知商户';
  };

  const filtered = purchases.filter((p) => {
    if (filterDate && p.date !== filterDate) return false;
    if (filterMerchant && p.merchantId !== filterMerchant) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const todayPurchases = purchases.filter((p) => p.date === today());
  const todayBatchCount = todayPurchases.length;
  const coldBatchCount = todayPurchases.filter((p) => p.coldStorage).length;
  const totalQuantity = todayPurchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest-800">进货登记</h1>
        <button className="btn-primary" onClick={openAdd}>
          登记进货
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-forest-600">{todayBatchCount}</div>
          <div className="text-sm text-gray-500 mt-1">今日进货批次数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{coldBatchCount}</div>
          <div className="text-sm text-gray-500 mt-1">冷藏商品批次数</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-600">{totalQuantity}</div>
          <div className="text-sm text-gray-500 mt-1">总进货量(kg)</div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">日期</label>
            <input
              type="date"
              className="input-field"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">商户</label>
            <select
              className="select-field"
              value={filterMerchant}
              onChange={(e) => setFilterMerchant(e.target.value)}
            >
              <option value="">全部商户</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">商品类别</label>
            <select
              className="select-field"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">全部类别</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left rounded-tl-lg">序号</th>
                <th className="px-4 py-3 text-left">商户名</th>
                <th className="px-4 py-3 text-left">日期</th>
                <th className="px-4 py-3 text-left">进货来源</th>
                <th className="px-4 py-3 text-left">商品类别</th>
                <th className="px-4 py-3 text-left">数量(kg)</th>
                <th className="px-4 py-3 text-left">冷藏标记</th>
                <th className="px-4 py-3 text-left rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{getMerchantName(p.merchantId)}</td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3">{p.source}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">
                    {p.coldStorage && <span className="badge-blue">需冷藏</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        编辑
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    暂无进货记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-800 mb-4">
              {editingId ? '编辑进货记录' : '登记进货'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">商户</label>
                <select
                  className="select-field"
                  value={form.merchantId}
                  onChange={(e) => setForm({ ...form, merchantId: e.target.value })}
                >
                  <option value="">请选择商户</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">进货来源</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入进货来源"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">商品类别</label>
                <select
                  className="select-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">数量(kg)</label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  value={form.quantity || ''}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coldStorage"
                  checked={form.coldStorage}
                  onChange={(e) => setForm({ ...form, coldStorage: e.target.checked })}
                  className="w-4 h-4 rounded border-ivory-300 text-forest-500 focus:ring-forest-500"
                />
                <label htmlFor="coldStorage" className="text-sm font-medium text-gray-600">
                  需冷藏
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
