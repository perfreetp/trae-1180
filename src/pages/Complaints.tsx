import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Complaint } from '@/types';

type ComplaintStatus = Complaint['status'];

const COLUMNS: { key: ComplaintStatus; label: string; headerColor: string }[] = [
  { key: 'pending', label: '待处理', headerColor: 'bg-amber-500' },
  { key: 'processing', label: '处理中', headerColor: 'bg-blue-500' },
  { key: 'resolved', label: '已完成', headerColor: 'bg-green-500' },
];

const STATUS_BADGE: Record<ComplaintStatus, string> = {
  pending: 'badge-yellow',
  processing: 'badge-blue',
  resolved: 'badge-green',
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已完成',
};

export default function Complaints() {
  const { complaints, merchants, addComplaint, updateComplaint } = useMarketStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [addForm, setAddForm] = useState({
    merchantId: '',
    content: '',
    complaintDate: new Date().toISOString().slice(0, 10),
  });
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [handlerName, setHandlerName] = useState('');
  const [resultTarget, setResultTarget] = useState<Complaint | null>(null);
  const [resultText, setResultText] = useState('');

  const getMerchantName = (merchantId: string) => {
    const m = merchants.find((m) => m.id === merchantId);
    return m ? m.name : '未知商户';
  };

  const handleAdd = () => {
    if (!addForm.merchantId || !addForm.content.trim()) return;
    addComplaint({
      id: Date.now().toString(),
      merchantId: addForm.merchantId,
      content: addForm.content.trim(),
      complaintDate: addForm.complaintDate,
      status: 'pending',
    });
    setAddForm({ merchantId: '', content: '', complaintDate: new Date().toISOString().slice(0, 10) });
    setShowAddModal(false);
  };

  const handleAssign = () => {
    if (!assignTarget || !handlerName.trim()) return;
    updateComplaint(assignTarget.id, { handler: handlerName.trim(), status: 'processing' });
    setAssignTarget(null);
    setHandlerName('');
    setShowAssignModal(false);
  };

  const handleResult = () => {
    if (!resultTarget || !resultText.trim()) return;
    updateComplaint(resultTarget.id, { result: resultText.trim(), status: 'resolved' });
    setResultTarget(null);
    setResultText('');
    setShowResultModal(false);
  };

  const openAssign = (c: Complaint) => {
    setAssignTarget(c);
    setHandlerName('');
    setShowAssignModal(true);
  };

  const openResult = (c: Complaint) => {
    setResultTarget(c);
    setResultText('');
    setShowResultModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-forest-700">投诉管理</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          受理投诉
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const items = complaints.filter((c) => c.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className={`${col.headerColor} text-white text-center py-2 rounded-t-lg font-semibold`}>
                {col.label}（{items.length}）
              </div>
              <div className="bg-ivory-50 rounded-b-lg p-3 flex-1 space-y-3 min-h-[200px]">
                {items.length === 0 && (
                  <p className="text-center text-ivory-400 py-8 text-sm">暂无投诉</p>
                )}
                {items.map((c) => (
                  <div key={c.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span>
                      <span className="text-xs text-ivory-400">{c.complaintDate}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">{c.content}</p>
                    <p className="text-xs text-forest-600 font-medium mb-1">
                      商户：{getMerchantName(c.merchantId)}
                    </p>
                    {c.handler && (
                      <p className="text-xs text-blue-600 mb-1">处理人：{c.handler}</p>
                    )}
                    {c.result && (
                      <p className="text-xs text-green-600 mb-1">处理结果：{c.result}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {c.status === 'pending' && (
                        <button className="btn-secondary btn-sm" onClick={() => openAssign(c)}>
                          分派处理人
                        </button>
                      )}
                      {c.status === 'processing' && (
                        <button className="btn-primary btn-sm" onClick={() => openResult(c)}>
                          完成处理
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-700 mb-4">受理投诉</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">商户</label>
                <select
                  className="select-field"
                  value={addForm.merchantId}
                  onChange={(e) => setAddForm({ ...addForm, merchantId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-600 mb-1">投诉内容</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  value={addForm.content}
                  onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                  placeholder="请输入投诉内容"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">投诉日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={addForm.complaintDate}
                  onChange={(e) => setAddForm({ ...addForm, complaintDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleAdd}>
                确认受理
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-700 mb-4">分派处理人</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">处理人姓名</label>
              <input
                type="text"
                className="input-field"
                value={handlerName}
                onChange={(e) => setHandlerName(e.target.value)}
                placeholder="请输入处理人姓名"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleAssign}>
                确认分派
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-forest-700 mb-4">完成处理</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">处理结果</label>
              <textarea
                className="input-field min-h-[100px] resize-none"
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="请输入处理结果"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowResultModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleResult}>
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
