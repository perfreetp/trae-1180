import { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import type { Merchant } from '@/types';

const TABS = ['基本信息', '证照信息', '关联摊位'] as const;
type Tab = (typeof TABS)[number];

const BUSINESS_OPTIONS = ['蔬菜', '水果', '水产', '干货', '熟食', '豆制品', '综合', '冷冻', '肉类', '调味品', '粮油', '蛋类'];

const LICENSE_TYPE_OPTIONS = ['营业执照', '食品经营许可证', '卫生许可证'];

const CONTRACT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: '生效中', cls: 'badge-green' },
  expired: { label: '已到期', cls: 'badge-yellow' },
  terminated: { label: '已终止', cls: 'badge-red' },
};

export default function Merchants() {
  const { merchants, contracts, stalls, addMerchant, updateMerchant, deleteMerchant } = useMarketStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('基本信息');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', contact: '', phone: '', business: '' });
  const [modalForm, setModalForm] = useState({ name: '', contact: '', phone: '', business: '' });
  const [licenseType, setLicenseType] = useState('');
  const [licenseFileName, setLicenseFileName] = useState('');

  const selected = merchants.find((m) => m.id === selectedId) ?? null;

  const filtered = merchants.filter(
    (m) =>
      m.name.includes(search) ||
      m.contact.includes(search)
  );

  const merchantContracts = selected
    ? contracts.filter((c) => c.merchantId === selected.id)
    : [];

  const merchantStalls = selected
    ? stalls.filter((s) => s.merchantId === selected.id)
    : [];

  function handleSelect(id: string) {
    setSelectedId(id);
    setActiveTab('基本信息');
    const m = merchants.find((x) => x.id === id);
    if (m) {
      setEditForm({ name: m.name, contact: m.contact, phone: m.phone, business: m.business });
      setLicenseType(m.licenseType ?? '');
      setLicenseFileName('');
    }
  }

  function handleSaveBasic() {
    if (!selected) return;
    updateMerchant(selected.id, {
      name: editForm.name,
      contact: editForm.contact,
      phone: editForm.phone,
      business: editForm.business,
    });
  }

  function handleSaveLicense() {
    if (!selected) return;
    updateMerchant(selected.id, {
      licenseType,
      licenseUrl: licenseFileName ? `/licenses/${licenseFileName}` : selected.licenseUrl,
    });
    setLicenseFileName('');
  }

  function handleAdd() {
    const id = Date.now().toString();
    addMerchant({
      id,
      name: modalForm.name,
      contact: modalForm.contact,
      phone: modalForm.phone,
      business: modalForm.business,
    });
    setModalForm({ name: '', contact: '', phone: '', business: '' });
    setShowModal(false);
    setSelectedId(id);
    setActiveTab('基本信息');
    const m = merchants.find((x) => x.id === id);
    if (m) {
      setEditForm({ name: m.name, contact: m.contact, phone: m.phone, business: m.business });
    } else {
      setEditForm({ ...modalForm });
    }
  }

  function handleDelete(id: string) {
    deleteMerchant(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFileName(file.name);
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">商户列表</h2>
          <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + 新增商户
          </button>
        </div>
        <input
          className="input-field"
          placeholder="搜索商户名称/联系人"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`card cursor-pointer p-4 transition-all ${selectedId === m.id ? 'ring-2 ring-forest-500' : 'hover:shadow-md'}`}
              onClick={() => handleSelect(m.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-500">{m.contact} · {m.phone}</div>
                </div>
                <span className="badge-blue badge">{m.business}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-8">暂无匹配商户</div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="card flex items-center justify-center h-full text-gray-400">
            请从左侧选择商户查看详情
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    联系人：{selected.contact} · 电话：{selected.phone} · 经营范围：{selected.business}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>
                    删除
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-1 border-b border-ivory-200">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-forest-600 border-b-2 border-forest-600' : 'text-gray-500 hover:text-forest-500'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === '基本信息' && (
                <div className="card">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">商户名称</label>
                      <input
                        className="input-field"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">联系人</label>
                      <input
                        className="input-field"
                        value={editForm.contact}
                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">联系电话</label>
                      <input
                        className="input-field"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">经营范围</label>
                      <select
                        className="select-field"
                        value={editForm.business}
                        onChange={(e) => setEditForm({ ...editForm, business: e.target.value })}
                      >
                        {BUSINESS_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="btn-primary btn-sm" onClick={handleSaveBasic}>
                      保存修改
                    </button>
                  </div>
                </div>
              )}

              {activeTab === '证照信息' && (
                <div className="card space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">证照类型</label>
                      <select
                        className="select-field"
                        value={licenseType}
                        onChange={(e) => setLicenseType(e.target.value)}
                      >
                        <option value="">请选择</option>
                        {LICENSE_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">上传证照</label>
                      <input
                        type="file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100"
                        accept="image/*"
                        onChange={handleUpload}
                      />
                      {licenseFileName && (
                        <div className="text-sm text-forest-600 mt-1">已选择：{licenseFileName}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary btn-sm" onClick={handleSaveLicense}>
                      保存证照
                    </button>
                  </div>
                  {(selected.licenseUrl || licenseFileName) && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">证照图片</div>
                      <div className="w-48 h-32 border-2 border-dashed border-ivory-300 rounded-lg flex items-center justify-center bg-ivory-50 text-gray-400 text-sm">
                        {selected.licenseType ?? '证照'}预览
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === '关联摊位' && (
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="table-header">
                          <th className="px-4 py-3 text-left rounded-tl-lg">摊位号</th>
                          <th className="px-4 py-3 text-left">区域</th>
                          <th className="px-4 py-3 text-left">面积</th>
                          <th className="px-4 py-3 text-left">类型</th>
                          <th className="px-4 py-3 text-left">合同编号</th>
                          <th className="px-4 py-3 text-left">合同期限</th>
                          <th className="px-4 py-3 text-left">月租金</th>
                          <th className="px-4 py-3 text-left rounded-tr-lg">合同状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merchantContracts.map((c) => {
                          const stall = stalls.find((s) => s.id === c.stallId);
                          const statusInfo = CONTRACT_STATUS_MAP[c.status] ?? { label: c.status, cls: 'badge-gray' };
                          return (
                            <tr key={c.id} className="table-row">
                              <td className="px-4 py-3">{stall?.stallNo ?? '-'}</td>
                              <td className="px-4 py-3">{stall?.area ?? '-'}</td>
                              <td className="px-4 py-3">{stall?.size ?? '-'}㎡</td>
                              <td className="px-4 py-3">{stall?.type ?? '-'}</td>
                              <td className="px-4 py-3">{c.id}</td>
                              <td className="px-4 py-3">{c.startDate} ~ {c.endDate}</td>
                              <td className="px-4 py-3">¥{c.monthlyRent}</td>
                              <td className="px-4 py-3">
                                <span className={statusInfo.cls}>{statusInfo.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                        {merchantContracts.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-400">
                              暂无关联摊位与合同
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card w-96">
            <h3 className="text-lg font-semibold mb-4">新增商户</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">商户名称</label>
                <input
                  className="input-field"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">联系人</label>
                <input
                  className="input-field"
                  value={modalForm.contact}
                  onChange={(e) => setModalForm({ ...modalForm, contact: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">联系电话</label>
                <input
                  className="input-field"
                  value={modalForm.phone}
                  onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">经营范围</label>
                <select
                  className="select-field"
                  value={modalForm.business}
                  onChange={(e) => setModalForm({ ...modalForm, business: e.target.value })}
                >
                  {BUSINESS_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={handleAdd}
                disabled={!modalForm.name || !modalForm.contact}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
