import type { Stall, Merchant, Contract, FeeBill, Purchase, Complaint, Inspection } from '@/types';

const stalls: Stall[] = [
  { id: 's1', stallNo: 'A-001', area: 'A区', size: 12, type: '蔬菜', status: 'occupied', merchantId: 'm1' },
  { id: 's2', stallNo: 'A-002', area: 'A区', size: 15, type: '水果', status: 'occupied', merchantId: 'm2' },
  { id: 's3', stallNo: 'A-003', area: 'A区', size: 10, type: '肉类', status: 'vacant' },
  { id: 's4', stallNo: 'B-001', area: 'B区', size: 18, type: '水产', status: 'occupied', merchantId: 'm3' },
  { id: 's5', stallNo: 'B-002', area: 'B区', size: 12, type: '干货', status: 'occupied', merchantId: 'm4' },
  { id: 's6', stallNo: 'B-003', area: 'B区', size: 14, type: '调味品', status: 'vacant' },
  { id: 's7', stallNo: 'C-001', area: 'C区', size: 20, type: '熟食', status: 'occupied', merchantId: 'm5' },
  { id: 's8', stallNo: 'C-002', area: 'C区', size: 16, type: '豆制品', status: 'occupied', merchantId: 'm6' },
  { id: 's9', stallNo: 'C-003', area: 'C区', size: 11, type: '蛋类', status: 'vacant' },
  { id: 's10', stallNo: 'D-001', area: 'D区', size: 22, type: '综合', status: 'occupied', merchantId: 'm7' },
  { id: 's11', stallNo: 'D-002', area: 'D区', size: 13, type: '粮油', status: 'vacant' },
  { id: 's12', stallNo: 'D-003', area: 'D区', size: 17, type: '冷冻', status: 'occupied', merchantId: 'm8' },
];

const merchants: Merchant[] = [
  { id: 'm1', name: '张记菜行', contact: '张大明', phone: '13800001001', business: '蔬菜', licenseUrl: '/licenses/m1.jpg', licenseType: '营业执照' },
  { id: 'm2', name: '鲜果坊', contact: '李秀英', phone: '13800001002', business: '水果', licenseUrl: '/licenses/m2.jpg', licenseType: '营业执照' },
  { id: 'm3', name: '海味鲜水产', contact: '王大海', phone: '13800001003', business: '水产', licenseUrl: '/licenses/m3.jpg', licenseType: '食品经营许可证' },
  { id: 'm4', name: '山珍干货铺', contact: '赵德明', phone: '13800001004', business: '干货', licenseUrl: '/licenses/m4.jpg', licenseType: '营业执照' },
  { id: 'm5', name: '老王熟食', contact: '王福来', phone: '13800001005', business: '熟食', licenseUrl: '/licenses/m5.jpg', licenseType: '食品经营许可证' },
  { id: 'm6', name: '豆腐西施', contact: '陈小兰', phone: '13800001006', business: '豆制品', licenseType: '营业执照' },
  { id: 'm7', name: '万事达杂货', contact: '刘全', phone: '13800001007', business: '综合', licenseUrl: '/licenses/m7.jpg', licenseType: '营业执照' },
  { id: 'm8', name: '冷链优选', contact: '孙志强', phone: '13800001008', business: '冷冻', licenseUrl: '/licenses/m8.jpg', licenseType: '食品经营许可证' },
];

const contracts: Contract[] = [
  { id: 'c1', stallId: 's1', merchantId: 'm1', startDate: '2025-01-01', endDate: '2025-12-31', deposit: 3000, monthlyRent: 1500, status: 'active' },
  { id: 'c2', stallId: 's2', merchantId: 'm2', startDate: '2025-03-01', endDate: '2026-02-28', deposit: 4000, monthlyRent: 1800, status: 'active' },
  { id: 'c3', stallId: 's4', merchantId: 'm3', startDate: '2025-06-01', endDate: '2026-05-31', deposit: 5000, monthlyRent: 2200, status: 'active' },
  { id: 'c4', stallId: 's5', merchantId: 'm4', startDate: '2024-06-01', endDate: '2025-05-31', deposit: 3000, monthlyRent: 1600, status: 'expired' },
  { id: 'c5', stallId: 's7', merchantId: 'm5', startDate: '2025-01-01', endDate: '2025-12-31', deposit: 6000, monthlyRent: 2800, status: 'active' },
  { id: 'c6', stallId: 's8', merchantId: 'm6', startDate: '2025-04-01', endDate: '2026-03-31', deposit: 2500, monthlyRent: 1200, status: 'active' },
  { id: 'c7', stallId: 's10', merchantId: 'm7', startDate: '2025-07-01', endDate: '2026-06-30', deposit: 5000, monthlyRent: 2500, status: 'active' },
  { id: 'c8', stallId: 's12', merchantId: 'm8', startDate: '2025-01-01', endDate: '2025-12-31', deposit: 4500, monthlyRent: 2000, status: 'active' },
];

const feeBills: FeeBill[] = [
  { id: 'f1', contractId: 'c1', amount: 1500, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-03' },
  { id: 'f2', contractId: 'c1', amount: 1500, dueDate: '2026-02-05', status: 'paid', paidDate: '2026-02-01' },
  { id: 'f3', contractId: 'c1', amount: 1500, dueDate: '2026-03-05', status: 'unpaid' },
  { id: 'f4', contractId: 'c2', amount: 1800, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-04' },
  { id: 'f5', contractId: 'c2', amount: 1800, dueDate: '2026-02-05', status: 'overdue' },
  { id: 'f6', contractId: 'c3', amount: 2200, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-02' },
  { id: 'f7', contractId: 'c3', amount: 2200, dueDate: '2026-02-05', status: 'paid', paidDate: '2026-02-05' },
  { id: 'f8', contractId: 'c3', amount: 2200, dueDate: '2026-03-05', status: 'unpaid' },
  { id: 'f9', contractId: 'c5', amount: 2800, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-01' },
  { id: 'f10', contractId: 'c5', amount: 2800, dueDate: '2026-02-05', status: 'overdue' },
  { id: 'f11', contractId: 'c6', amount: 1200, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-05' },
  { id: 'f12', contractId: 'c7', amount: 2500, dueDate: '2026-01-05', status: 'paid', paidDate: '2025-12-30' },
  { id: 'f13', contractId: 'c8', amount: 2000, dueDate: '2026-01-05', status: 'paid', paidDate: '2026-01-05' },
  { id: 'f14', contractId: 'c8', amount: 2000, dueDate: '2026-02-05', status: 'overdue' },
  { id: 'f15', contractId: 'c4', amount: 1600, dueDate: '2025-12-05', status: 'overdue' },
];

const purchases: Purchase[] = [
  { id: 'p1', merchantId: 'm1', date: '2026-06-01', source: '寿光蔬菜基地', category: '蔬菜', quantity: 500, coldStorage: false },
  { id: 'p2', merchantId: 'm1', date: '2026-06-02', source: '本地农庄', category: '蔬菜', quantity: 200, coldStorage: false },
  { id: 'p3', merchantId: 'm2', date: '2026-06-01', source: '海南果场', category: '水果', quantity: 300, coldStorage: false },
  { id: 'p4', merchantId: 'm3', date: '2026-06-01', source: '东海渔港', category: '水产', quantity: 150, coldStorage: true },
  { id: 'p5', merchantId: 'm3', date: '2026-06-02', source: '南海水产批发', category: '水产', quantity: 80, coldStorage: true },
  { id: 'p6', merchantId: 'm5', date: '2026-06-01', source: '本地肉联厂', category: '熟食', quantity: 100, coldStorage: true },
  { id: 'p7', merchantId: 'm8', date: '2026-06-01', source: '冷链物流中心', category: '冷冻', quantity: 250, coldStorage: true },
  { id: 'p8', merchantId: 'm8', date: '2026-06-02', source: '北方冷冻食品厂', category: '冷冻', quantity: 180, coldStorage: true },
  { id: 'p9', merchantId: 'm4', date: '2026-06-01', source: '云南野生菌基地', category: '干货', quantity: 50, coldStorage: false },
  { id: 'p10', merchantId: 'm6', date: '2026-06-02', source: '本地豆制品厂', category: '豆制品', quantity: 120, coldStorage: true },
];

const complaints: Complaint[] = [
  { id: 'cp1', merchantId: 'm3', content: '水产摊位地面湿滑，顾客差点摔倒', complaintDate: '2026-06-01', handler: '李管理', status: 'processing', result: '' },
  { id: 'cp2', merchantId: 'm5', content: '熟食摊位食品卫生不达标，有苍蝇', complaintDate: '2026-05-28', handler: '王管理', status: 'resolved', result: '已要求商户整改，加装防蝇设备' },
  { id: 'cp3', merchantId: 'm1', content: '蔬菜价格标示不清，与实际收费不符', complaintDate: '2026-06-03', status: 'pending' },
  { id: 'cp4', merchantId: 'm7', content: '占道经营，影响通道通行', complaintDate: '2026-06-02', handler: '李管理', status: 'processing' },
  { id: 'cp5', merchantId: 'm2', content: '水果摊位噪音过大，影响周边商户', complaintDate: '2026-05-30', handler: '王管理', status: 'resolved', result: '已与商户沟通，降低音响音量' },
];

const inspections: Inspection[] = [
  { id: 'i1', stallId: 's4', inspectDate: '2026-06-01', issue: '水产区排水不畅，地面积水严重', type: '卫生', deadline: '2026-06-05', status: 'rectifying' },
  { id: 'i2', stallId: 's7', inspectDate: '2026-05-28', issue: '熟食区防蝇设备缺失', type: '卫生', deadline: '2026-06-01', status: 'recheck_pass', recheckDate: '2026-06-02', recheckResult: '已加装防蝇设备，合格' },
  { id: 'i3', stallId: 's10', inspectDate: '2026-06-02', issue: '占道经营，货物堆放在通道', type: '秩序', deadline: '2026-06-04', status: 'rectifying' },
  { id: 'i4', stallId: 's1', inspectDate: '2026-06-03', issue: '价格标示不规范', type: '经营', deadline: '2026-06-06', status: 'pending' },
  { id: 'i5', stallId: 's12', inspectDate: '2026-05-25', issue: '冷链温度记录不完整', type: '安全', deadline: '2026-05-28', status: 'recheck_fail', recheckDate: '2026-05-29', recheckResult: '温度记录仍不完整，需继续整改' },
  { id: 'i6', stallId: 's5', inspectDate: '2026-06-01', issue: '灭火器过期未更换', type: '安全', deadline: '2026-06-03', status: 'recheck_pass', recheckDate: '2026-06-04', recheckResult: '已更换灭火器，合格' },
];

export const initialData = { stalls, merchants, contracts, feeBills, purchases, complaints, inspections };
