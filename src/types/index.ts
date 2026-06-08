export interface Stall {
  id: string;
  stallNo: string;
  area: string;
  size: number;
  type: string;
  status: 'vacant' | 'occupied';
  merchantId?: string;
}

export interface Merchant {
  id: string;
  name: string;
  contact: string;
  phone: string;
  business: string;
  licenseUrl?: string;
  licenseType?: string;
  licenseUpdatedAt?: string;
}

export interface Contract {
  id: string;
  stallId: string;
  merchantId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: 'active' | 'expired' | 'terminated';
}

export interface FeeBill {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  paidDate?: string;
  month?: string;
}

export interface Purchase {
  id: string;
  merchantId: string;
  date: string;
  source: string;
  category: string;
  quantity: number;
  coldStorage: boolean;
}

export interface Complaint {
  id: string;
  merchantId: string;
  content: string;
  complaintDate: string;
  handler?: string;
  status: 'pending' | 'processing' | 'resolved';
  result?: string;
}

export interface Inspection {
  id: string;
  stallId: string;
  inspectDate: string;
  issue: string;
  type: string;
  deadline: string;
  status: 'pending' | 'rectifying' | 'recheck_pass' | 'recheck_fail';
  recheckDate?: string;
  recheckResult?: string;
}
