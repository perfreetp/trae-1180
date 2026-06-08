import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Inspection } from '@/types';
import { format } from 'date-fns';

const statusMap: Record<Inspection['status'], { label: string; badge: string }> = {
  pending: { label: '待整改', badge: 'badge-yellow' },
  rectifying: { label: '整改中', badge: 'badge-blue' },
  recheck_pass: { label: '复查通过', badge: 'badge-green' },
  recheck_fail: { label: '复查未通过', badge: 'badge-red' },
};

const typeOptions = ['卫生', '秩序', '安全', '经营'];

export default function Inspections() {
  const { inspections, stalls, addInspection, updateInspection } = useMarketStore();

  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [addForm, setAddForm] = useState({
    stallId: '',
    inspectDate: format(new Date(), 'yyyy-MM-dd'),
    issue: '',
    type: '',
    deadline: '',
  });

  const [recheckForm, setRecheckForm] = useState({
    recheckDate: format(new Date(), 'yyyy-MM-dd'),
    recheckResult: '',
    status: 'recheck_pass' as 'recheck_pass' | 'recheck_fail',
  });

  const stallMap = new Map(stalls.map((s) => [s.id, s.stallNo]));

  const filtered = inspections.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const handleAddSubmit = () => {
    if (!addForm.stallId || !addForm.issue || !addForm.type || !addForm.deadline) return;
    addInspection({
      id: Date.now().toString(),
      stallId: addForm.stallId,
      inspectDate: addForm.inspectDate,
      issue: addForm.issue,
      type: addForm.type,
      deadline: addForm.deadline,
      status: 'pending',
    });
    setShowAddModal(false);
    setAddForm({
      stallId: '',
      inspectDate: format(new Date(), 'yyyy-MM-dd'),
      issue: '',
      type: '',
      deadline: '',
    });
  };

  const handleIssueRectify = (id: string) => {
    updateInspection(id, { status: 'rectifying' });
  };

  const handleOpenRecheck = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setRecheckForm({
      recheckDate: format(new Date(), 'yyyy-MM-dd'),
      recheckResult: '',
      status: 'recheck_pass',
    });
    setShowRecheckModal(true);
  };

  const handleRecheckSubmit = () => {
    if (!editingInspection || !recheckForm.recheckResult) return;
    updateInspection(editingInspection.id, {
      recheckDate: recheckForm.recheckDate,
      recheckResult: recheckForm.recheckResult,
      status: recheckForm.status,
    });
    setShowRecheckModal(false);
    setEditingInspection(null);
  };

  const grouped = filtered.reduce<Record<string, Inspection[]>>((acc, cur) => {
    const key = cur.inspectDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cur);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-forest-600">巡查整改</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          新增巡查
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              className={view === 'list' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              onClick={() => setView('list')}
            >
              列表视图
            </button>
            <button
              className={view === 'timeline' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              onClick={() => setView('timeline')}
            >
              时间线视图
            </button>
          </div>

          <select
            className="select-field w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">全部类型</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="select-field w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            {Object.entries(statusMap).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {view === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left font-medium">巡查日期</th>
                  <th className="px-4 py-3 text-left font-medium">摊位号</th>
                  <th className="px-4 py-3 text-left font-medium">问题</th>
                  <th className="px-4 py-3 text-left font-medium">类型</th>
                  <th className="px-4 py-3 text-left font-medium">整改期限</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">复查日期</th>
                  <th className="px-4 py-3 text-left font-medium">复查结果</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((insp) => (
                  <tr key={insp.id} className="table-row">
                    <td className="px-4 py-3">{insp.inspectDate}</td>
                    <td className="px-4 py-3">{stallMap.get(insp.stallId) || '-'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={insp.issue}>{insp.issue}</td>
                    <td className="px-4 py-3">{insp.type}</td>
                    <td className="px-4 py-3">{insp.deadline}</td>
                    <td className="px-4 py-3">
                      <span className={statusMap[insp.status].badge}>{statusMap[insp.status].label}</span>
                    </td>
                    <td className="px-4 py-3">{insp.recheckDate || '-'}</td>
                    <td className="px-4 py-3 max-w-[160px] truncate" title={insp.recheckResult}>{insp.recheckResult || '-'}</td>
                    <td className="px-4 py-3">
                      {insp.status === 'pending' && (
                        <button className="btn-primary btn-sm" onClick={() => handleIssueRectify(insp.id)}>
                          下发整改
                        </button>
                      )}
                      {insp.status === 'rectifying' && (
                        <button className="btn-secondary btn-sm" onClick={() => handleOpenRecheck(insp)}>
                          记录复查
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">暂无巡查记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无巡查记录</p>
            )}
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-forest-600 mb-3">{date}</h3>
                <div className="relative pl-6 border-l-2 border-forest-300 space-y-4">
                  {grouped[date].map((insp) => (
                    <div key={insp.id} className="relative">
                      <div className="absolute -left-[25px] top-2 w-3 h-3 rounded-full bg-forest-500 border-2 border-white" />
                      <div className="card ml-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-forest-700">
                            摊位 {stallMap.get(insp.stallId) || '-'}
                          </span>
                          <span className={statusMap[insp.status].badge}>{statusMap[insp.status].label}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{insp.issue}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>类型：{insp.type}</span>
                          <span>整改期限：{insp.deadline}</span>
                        </div>
                        {insp.recheckDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            复查日期：{insp.recheckDate} | 结果：{insp.recheckResult}
                          </p>
                        )}
                        <div className="mt-2">
                          {insp.status === 'pending' && (
                            <button className="btn-primary btn-sm" onClick={() => handleIssueRectify(insp.id)}>
                              下发整改
                            </button>
                          )}
                          {insp.status === 'rectifying' && (
                            <button className="btn-secondary btn-sm" onClick={() => handleOpenRecheck(insp)}>
                              记录复查
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg mx-4">
            <h2 className="text-lg font-bold text-forest-600 mb-4">新增巡查</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摊位</label>
                <select
                  className="select-field"
                  value={addForm.stallId}
                  onChange={(e) => setAddForm({ ...addForm, stallId: e.target.value })}
                >
                  <option value="">请选择摊位</option>
                  {stalls.map((s) => (
                    <option key={s.id} value={s.id}>{s.stallNo} - {s.area} - {s.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">巡查日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={addForm.inspectDate}
                  onChange={(e) => setAddForm({ ...addForm, inspectDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={addForm.issue}
                  onChange={(e) => setAddForm({ ...addForm, issue: e.target.value })}
                  placeholder="请描述巡查发现的问题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  className="select-field"
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                >
                  <option value="">请选择类型</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">整改期限</label>
                <input
                  type="date"
                  className="input-field"
                  value={addForm.deadline}
                  onChange={(e) => setAddForm({ ...addForm, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleAddSubmit}>确认</button>
            </div>
          </div>
        </div>
      )}

      {showRecheckModal && editingInspection && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg mx-4">
            <h2 className="text-lg font-bold text-forest-600 mb-4">记录复查</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复查日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={recheckForm.recheckDate}
                  onChange={(e) => setRecheckForm({ ...recheckForm, recheckDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复查结果</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={recheckForm.recheckResult}
                  onChange={(e) => setRecheckForm({ ...recheckForm, recheckResult: e.target.value })}
                  placeholder="请描述复查结果"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复查状态</label>
                <select
                  className="select-field"
                  value={recheckForm.status}
                  onChange={(e) => setRecheckForm({ ...recheckForm, status: e.target.value as 'recheck_pass' | 'recheck_fail' })}
                >
                  <option value="recheck_pass">复查通过</option>
                  <option value="recheck_fail">复查未通过</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowRecheckModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleRecheckSubmit}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
