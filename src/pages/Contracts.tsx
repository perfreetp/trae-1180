import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Contract, FeeBill } from '@/types';

type ContractStatus = '全部' | '生效中' | '已到期' | '已终止';
type FeeStatus = '全部' | '已缴' | '未缴' | '逾期';

const contractStatusMap: Record<Contract['status'], ContractStatus> = {
  active: '生效中',
  expired: '已到期',
  terminated: '已终止',
};

const contractStatusFilterMap: Record<ContractStatus, Contract['status'] | 'all'> = {
  '全部': 'all',
  '生效中': 'active',
  '已到期': 'expired',
  '已终止': 'terminated',
};

const feeStatusMap: Record<FeeBill['status'], FeeStatus> = {
  paid: '已缴',
  unpaid: '未缴',
  overdue: '逾期',
};

const feeStatusFilterMap: Record<FeeStatus, FeeBill['status'] | 'all'> = {
  '全部': 'all',
  '已缴': 'paid',
  '未缴': 'unpaid',
  '逾期': 'overdue',
};

interface ContractFormData {
  stallId: string;
  merchantId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: Contract['status'];
}

const emptyForm: ContractFormData = {
  stallId: '',
  merchantId: '',
  startDate: '',
  endDate: '',
  deposit: 0,
  monthlyRent: 0,
  status: 'active',
};

function getBillMonth(bill: FeeBill): string {
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

export default function Contracts() {
  const { contracts, feeBills, stalls, merchants, addContract, updateContract, deleteContract, addFeeBill, addFeeBills, updateFeeBill } = useMarketStore();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [contractFilter, setContractFilter] = useState<ContractStatus>('全部');
  const [feeFilter, setFeeFilter] = useState<FeeStatus>('全部');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractFormData>(emptyForm);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMonth, setBatchMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [batchResult, setBatchResult] = useState<{ total: number; added: number; skipped: number } | null>(null);

  const getStallNo = (stallId: string) => stalls.find((s) => s.id === stallId)?.stallNo ?? '-';
  const getMerchantName = (merchantId: string) => merchants.find((m) => m.id === merchantId)?.name ?? '-';

  const vacantStalls = stalls.filter((s) => s.status === 'vacant');

  const filteredContracts = contractFilter === '全部'
    ? contracts
    : contracts.filter((c) => c.status === contractStatusFilterMap[contractFilter]);

  const filteredFeeBills = feeFilter === '全部'
    ? feeBills
    : feeBills.filter((f) => f.status === feeStatusFilterMap[feeFilter]);

  const totalFee = feeBills.reduce((s, f) => s + f.amount, 0);
  const paidFee = feeBills.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const unpaidFee = feeBills.filter((f) => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);
  const overdueFee = feeBills.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (contract: Contract) => {
    setEditingId(contract.id);
    setForm({
      stallId: contract.stallId,
      merchantId: contract.merchantId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      deposit: contract.deposit,
      monthlyRent: contract.monthlyRent,
      status: contract.status,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.stallId || !form.merchantId || !form.startDate || !form.endDate) return;
    if (editingId) {
      updateContract(editingId, { ...form });
    } else {
      addContract({ id: Date.now().toString(), ...form, status: 'active' });
    }
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleGenerateFee = (contract: Contract) => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const dueDate = nextMonth.toISOString().slice(0, 10);
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    addFeeBill({
      id: Date.now().toString(),
      contractId: contract.id,
      amount: contract.monthlyRent,
      dueDate,
      status: 'unpaid',
      month,
    });
  };

  const handleBatchGenerate = () => {
    const activeContracts = contracts.filter((c) => c.status === 'active');
    const existingKeys = new Set(
      feeBills.map((b) => {
        const m = getBillMonth(b);
        return `${b.contractId}_${m}`;
      })
    );

    const newBills: FeeBill[] = [];
    const [year, month] = batchMonth.split('-').map(Number);
    const dueDate = new Date(year, month, 5).toISOString().slice(0, 10);

    activeContracts.forEach((c, idx) => {
      const key = `${c.id}_${batchMonth}`;
      if (!existingKeys.has(key)) {
        newBills.push({
          id: (Date.now() + idx + 1).toString(),
          contractId: c.id,
          amount: c.monthlyRent,
          dueDate,
          status: 'unpaid',
          month: batchMonth,
        });
      }
    });

    if (newBills.length > 0) {
      addFeeBills(newBills);
    }

    setBatchResult({
      total: activeContracts.length,
      added: newBills.length,
      skipped: activeContracts.length - newBills.length,
    });

    setTimeout(() => {
      setActiveTab(1);
      setFeeFilter('未缴');
    }, 800);
  };

  const handleMarkPaid = (bill: FeeBill) => {
    updateFeeBill(bill.id, { status: 'paid', paidDate: new Date().toISOString().slice(0, 10) });
  };

  const contractBadgeClass = (status: Contract['status']) => {
    if (status === 'active') return 'badge-green';
    if (status === 'expired') return 'badge-yellow';
    return 'badge-gray';
  };

  const feeBadgeClass = (status: FeeBill['status']) => {
    if (status === 'paid') return 'badge-green';
    if (status === 'unpaid') return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 0 ? 'bg-forest-500 text-white shadow-md' : 'bg-white text-forest-500 border border-forest-500 hover:bg-forest-50'}`}
          onClick={() => setActiveTab(0)}
        >
          合同管理
        </button>
        <button
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 1 ? 'bg-forest-500 text-white shadow-md' : 'bg-white text-forest-500 border border-forest-500 hover:bg-forest-50'}`}
          onClick={() => setActiveTab(1)}
        >
          收费管理
        </button>
      </div>

      {activeTab === 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(['全部', '生效中', '已到期', '已终止'] as ContractStatus[]).map((s) => (
                <button
                  key={s}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${contractFilter === s ? 'bg-forest-500 text-white' : 'bg-ivory-100 text-forest-700 hover:bg-ivory-200'}`}
                  onClick={() => setContractFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary btn-sm"
                onClick={() => { setShowBatchModal(true); setBatchResult(null); }}
              >
                批量生成收费单
              </button>
              <button className="btn-primary btn-sm" onClick={openAddModal}>
                新增合同
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left font-medium">合同编号</th>
                  <th className="px-4 py-3 text-left font-medium">摊位号</th>
                  <th className="px-4 py-3 text-left font-medium">商户名</th>
                  <th className="px-4 py-3 text-left font-medium">起始日期</th>
                  <th className="px-4 py-3 text-left font-medium">截止日期</th>
                  <th className="px-4 py-3 text-right font-medium">押金(元)</th>
                  <th className="px-4 py-3 text-right font-medium">月租(元)</th>
                  <th className="px-4 py-3 text-center font-medium">状态</th>
                  <th className="px-4 py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-3 font-mono">{c.id}</td>
                    <td className="px-4 py-3">{getStallNo(c.stallId)}</td>
                    <td className="px-4 py-3">{getMerchantName(c.merchantId)}</td>
                    <td className="px-4 py-3">{c.startDate}</td>
                    <td className="px-4 py-3">{c.endDate}</td>
                    <td className="px-4 py-3 text-right">{c.deposit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{c.monthlyRent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={contractBadgeClass(c.status)}>
                        {contractStatusMap[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {c.status === 'active' && (
                          <button className="btn-secondary btn-sm" onClick={() => handleGenerateFee(c)}>
                            生成收费单
                          </button>
                        )}
                        <button className="btn-secondary btn-sm" onClick={() => openEditModal(c)}>
                          编辑
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => deleteContract(c.id)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      暂无合同数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-sm text-gray-500 mb-1">总收费金额</div>
              <div className="text-2xl font-bold text-forest-600">¥{totalFee.toLocaleString()}</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-gray-500 mb-1">已收金额</div>
              <div className="text-2xl font-bold text-green-600">¥{paidFee.toLocaleString()}</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-gray-500 mb-1">未收金额</div>
              <div className="text-2xl font-bold text-amber-600">¥{unpaidFee.toLocaleString()}</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-gray-500 mb-1">逾期金额</div>
              <div className="text-2xl font-bold text-red-600">¥{overdueFee.toLocaleString()}</div>
            </div>
          </div>
          <div className="card">
            <div className="flex gap-2 mb-4">
              {(['全部', '已缴', '未缴', '逾期'] as FeeStatus[]).map((s) => (
                <button
                  key={s}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${feeFilter === s ? 'bg-forest-500 text-white' : 'bg-ivory-100 text-forest-700 hover:bg-ivory-200'}`}
                  onClick={() => setFeeFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left font-medium">收费单号</th>
                    <th className="px-4 py-3 text-left font-medium">合同编号</th>
                    <th className="px-4 py-3 text-left font-medium">月份</th>
                    <th className="px-4 py-3 text-right font-medium">金额(元)</th>
                    <th className="px-4 py-3 text-left font-medium">应缴日期</th>
                    <th className="px-4 py-3 text-center font-medium">状态</th>
                    <th className="px-4 py-3 text-left font-medium">缴费日期</th>
                    <th className="px-4 py-3 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeBills.map((f) => (
                    <tr key={f.id} className="table-row">
                      <td className="px-4 py-3 font-mono">{f.id}</td>
                      <td className="px-4 py-3 font-mono">{f.contractId}</td>
                      <td className="px-4 py-3">{f.month ?? getBillMonth(f) ?? '-'}</td>
                      <td className="px-4 py-3 text-right">{f.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">{f.dueDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={feeBadgeClass(f.status)}>
                          {feeStatusMap[f.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">{f.paidDate ?? '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {(f.status === 'unpaid' || f.status === 'overdue') && (
                          <button className="btn-primary btn-sm" onClick={() => handleMarkPaid(f)}>
                            标记已缴
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredFeeBills.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        暂无收费单数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-forest-700 mb-4">
              {editingId ? '编辑合同' : '新增合同'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">摊位</label>
                <select
                  className="select-field"
                  value={form.stallId}
                  onChange={(e) => setForm({ ...form, stallId: e.target.value })}
                >
                  <option value="">请选择摊位</option>
                  {editingId
                    ? stalls.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.stallNo} - {s.area} ({s.type})
                        </option>
                      ))
                    : vacantStalls.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.stallNo} - {s.area} ({s.type})
                        </option>
                      ))}
                </select>
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">起始日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">截止日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">押金(元)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">月租(元)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.monthlyRent}
                    onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                  />
                </div>
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">合同状态</label>
                  <select
                    className="select-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Contract['status'] })}
                  >
                    <option value="active">生效中</option>
                    <option value="expired">已到期</option>
                    <option value="terminated">已终止</option>
                  </select>
                  {form.status !== 'active' && (
                    <p className="text-xs text-amber-600 mt-1">
                      修改为非生效状态后，对应摊位将自动释放为空置状态
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingId ? '保存' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-forest-700 mb-4">批量生成月度收费单</h3>

            {!batchResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">选择月份</label>
                  <input
                    type="month"
                    className="input-field"
                    value={batchMonth}
                    onChange={(e) => setBatchMonth(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  将为所有<span className="font-medium text-forest-600">生效中</span>的合同生成
                  <span className="font-medium text-forest-600">{batchMonth}</span>月收费单，
                  已存在的收费单将跳过。
                </div>
                <div className="text-sm text-gray-500">
                  当前生效合同：<span className="font-medium">{contracts.filter((c) => c.status === 'active').length}</span> 份
                </div>
                <div className="flex justify-end gap-3">
                  <button className="btn-secondary" onClick={() => setShowBatchModal(false)}>
                    取消
                  </button>
                  <button className="btn-primary" onClick={handleBatchGenerate}>
                    确认生成
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-lg font-medium text-forest-700">批量生成完成</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="card p-3">
                    <div className="text-xl font-bold">{batchResult.total}</div>
                    <div className="text-xs text-gray-500">生效合同</div>
                  </div>
                  <div className="card p-3">
                    <div className="text-xl font-bold text-green-600">{batchResult.added}</div>
                    <div className="text-xs text-gray-500">新增收费单</div>
                  </div>
                  <div className="card p-3">
                    <div className="text-xl font-bold text-amber-600">{batchResult.skipped}</div>
                    <div className="text-xs text-gray-500">跳过(已存在)</div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowBatchModal(false);
                      setActiveTab(1);
                      setFeeFilter('未缴');
                    }}
                  >
                    查看未缴清单
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
