import React, { useState } from 'react';
import { 
  Calendar, Check, User, Activity, Clock, ShieldCheck, 
  CreditCard, Plus, Minus, Trash2, Printer, 
  Users, DollarSign, Award, Laptop, Tablet, Smartphone, ExternalLink 
} from 'lucide-react';

interface SimulatorProps {
  simulatorType?: 'clinic' | 'pos' | 'hrms' | 'hotel' | 'corporate' | 'ecommerce';
  projectName: string;
  onClose?: () => void;
  onRequestQuote?: () => void;
}

export const InteractiveSimulatorModal: React.FC<SimulatorProps> = ({
  simulatorType = 'clinic',
  projectName,
  onClose,
  onRequestQuote
}) => {
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Simulator Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <div className="text-sm font-semibold tracking-tight">{projectName}</div>
            <div className="text-xs text-slate-400">Interactive Prototype Simulation · Live Functional Test</div>
          </div>
        </div>

        {/* Device Frame Viewport Switcher */}
        <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setDeviceFrame('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              deviceFrame === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceFrame('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              deviceFrame === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDeviceFrame('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              deviceFrame === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onRequestQuote && (
            <button
              onClick={onRequestQuote}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Request Custom Build
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Exit Simulator"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Simulator Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        <div
          className={`transition-all duration-300 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 ${
            deviceFrame === 'mobile'
              ? 'w-[375px] min-h-[667px] max-h-[85vh] overflow-y-auto rounded-3xl border-4 border-slate-700'
              : deviceFrame === 'tablet'
              ? 'w-[768px] min-h-[600px] max-h-[85vh] overflow-y-auto'
              : 'w-full max-w-5xl min-h-[620px] max-h-[85vh] overflow-y-auto'
          }`}
        >
          {simulatorType === 'clinic' && <ClinicAppointmentSimulator />}
          {simulatorType === 'pos' && <PosRegisterSimulator />}
          {simulatorType === 'hrms' && <HrmsSimulator />}
          {simulatorType === 'corporate' && <CorporatePreviewSimulator />}
          {simulatorType === 'ecommerce' && <EcommerceSimulator />}
          {simulatorType === 'hotel' && <HotelSimulator />}
        </div>
      </div>

      {/* Subtle Bottom Note */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2 text-center text-xs text-slate-400">
        Engineered by TesfayeTech · Interactive Sandbox Simulation with local state persistence
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 1. CLINIC APPOINTMENT SIMULATOR
 * -----------------------------------------------------------*/
const ClinicAppointmentSimulator: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Dr. Selamawit Bekele (Cardiology)');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-28');
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [patientName, setPatientName] = useState<string>('Dawit Haile');
  const [symptom, setSymptom] = useState<string>('Routine cardiovascular consultation and blood pressure follow-up');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const doctors = [
    { name: 'Dr. Selamawit Bekele', spec: 'Cardiology Specialist', rating: '4.9 (184 reviews)', fee: '$60' },
    { name: 'Dr. Marcus Vance', spec: 'Internal Medicine & Pulmonology', rating: '4.8 (210 reviews)', fee: '$55' },
    { name: 'Dr. Almaz Kebede', spec: 'Pediatric Care', rating: '5.0 (340 reviews)', fee: '$50' }
  ];

  const slots = ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM'];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">MediConnect Health System</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Book Specialist Consultation</h2>
        </div>
        <div className="text-right text-xs text-slate-500">
          Step {step} of 3
        </div>
      </div>

      {!isBooked ? (
        <div className="mt-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Select Attending Physician:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.name}
                    onClick={() => setSelectedDoctor(`${doc.name} (${doc.spec})`)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedDoctor.includes(doc.name)
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <div className="font-semibold text-sm text-slate-900">{doc.name}</div>
                    </div>
                    <div className="text-xs text-slate-600">{doc.spec}</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{doc.rating}</span>
                      <span className="font-semibold text-slate-900">{doc.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                >
                  Continue to Date & Time
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Available Consultation Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedTime(s)}
                        className={`py-2 text-xs font-medium rounded border ${
                          selectedTime === s
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                >
                  Continue to Patient Details
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chief Symptoms / Reason for Visit</label>
                <textarea
                  rows={3}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
                <div className="font-semibold text-slate-900">Summary:</div>
                <div>Physician: {selectedDoctor}</div>
                <div>Time: {selectedDate} at {selectedTime}</div>
                <div>Telehealth Link & Clinic Check-in SMS will be dispatched instantly.</div>
              </div>
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={() => setIsBooked(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm & Reserve Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 text-center py-8 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Consultation scheduled for <span className="font-semibold">{patientName}</span> with <span className="font-semibold">{selectedDoctor}</span> on <span className="font-semibold">{selectedDate}</span> at <span className="font-semibold">{selectedTime}</span>.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setIsBooked(false);
                setStep(1);
              }}
              className="px-4 py-2 border border-slate-300 text-xs font-medium text-slate-700 rounded-md hover:bg-slate-50"
            >
              Simulate Another Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. POS REGISTER SIMULATOR
 * -----------------------------------------------------------*/
const PosRegisterSimulator: React.FC = () => {
  interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
  }

  const catalog = [
    { id: 'p1', name: 'Premium Arabica Coffee Beans (500g)', price: 18.50, sku: 'SKU-882' },
    { id: 'p2', name: 'Organic Honey jar (1kg)', price: 14.00, sku: 'SKU-104' },
    { id: 'p3', name: 'Cold Pressed Olive Oil (750ml)', price: 22.00, sku: 'SKU-509' },
    { id: 'p4', name: 'Artisan Sourdough Loaf', price: 6.50, sku: 'SKU-312' },
    { id: 'p5', name: 'Dark Single-Origin Chocolate 85%', price: 5.75, sku: 'SKU-741' },
    { id: 'p6', name: 'Matcha Green Tea Powder (100g)', price: 19.25, sku: 'SKU-990' },
  ];

  const [cart, setCart] = useState<CartItem[]>([
    { id: 'p1', name: 'Premium Arabica Coffee Beans (500g)', price: 18.50, qty: 2 },
    { id: 'p4', name: 'Artisan Sourdough Loaf', price: 6.50, qty: 1 },
  ]);

  const [receiptOpen, setReceiptOpen] = useState<boolean>(false);

  const addToCart = (item: typeof catalog[0]) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
      {/* Product Catalog Lane */}
      <div className="md:col-span-7 p-6 border-r border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase text-blue-600">Apex POS Engine</span>
            <h3 className="text-lg font-bold text-slate-900">Retail Quick Keys</h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">Terminal 01 · Online</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {catalog.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="text-xs text-slate-400 font-mono">{product.sku}</div>
              <div className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600">
                {product.name}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-2">
                ${product.price.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Register Lane */}
      <div className="md:col-span-5 p-6 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Order Summary</h4>
            <span className="text-xs text-slate-500 font-mono">{cart.length} lines</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto mt-2">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No items added. Click products on the left to ring up.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-900 truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      ${item.price.toFixed(2)} × {item.qty} = ${(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing & Checkout Actions */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>VAT (15%)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>Total Payable</span>
            <span className="font-mono text-blue-600">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              disabled={cart.length === 0}
              onClick={() => setReceiptOpen(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card / Cash</span>
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => setReceiptOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Tender & Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-200">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="font-bold text-base">TESFAYE RETAIL MART</div>
              <div className="text-xs text-slate-500">Terminal #01 · Ref: #REC-{Math.floor(Math.random() * 89999 + 10000)}</div>
              <div className="text-xs text-slate-400 mt-1">Transaction Completed Successfully</div>
            </div>
            <div className="py-4 space-y-2 text-xs divide-y divide-slate-100">
              {cart.map((i) => (
                <div key={i.id} className="pt-1.5 flex justify-between">
                  <span>{i.name} (x{i.qty})</span>
                  <span className="font-mono">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL PAID</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
              <div className="text-slate-500 text-center pt-2">Thank you for testing the Apex POS demo!</div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => {
                  setReceiptOpen(false);
                  setCart([]);
                }}
                className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
              >
                Close & Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. HRMS SIMULATOR
 * -----------------------------------------------------------*/
const HrmsSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'leave' | 'payroll'>('employees');
  const [leaves, setLeaves] = useState([
    { id: '1', emp: 'Bethlehem Tsegaye', dept: 'Software Engineering', type: 'Annual Leave', days: '4 days', status: 'Pending' },
    { id: '2', emp: 'Kassahun Worku', dept: 'Quality Assurance', type: 'Sick Leave', days: '2 days', status: 'Approved' },
    { id: '3', emp: 'Hana Assefa', dept: 'Product Design', type: 'Remote Day', days: '1 day', status: 'Pending' }
  ]);

  const handleLeaveAction = (id: string, action: 'Approved' | 'Declined') => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: action } : l)));
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <span className="text-xs font-semibold uppercase text-blue-600">PulseHR Enterprise</span>
          <h3 className="text-xl font-bold text-slate-900">Workforce & Operations Management</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'employees' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'leave' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leave Approvals
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'payroll' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payroll Engine
          </button>
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Active Headcount</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">148</div>
              <div className="text-xs text-emerald-600 mt-1">+12 this quarter</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">On Duty Today</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">141</div>
              <div className="text-xs text-slate-500 mt-1">95.2% Attendance Rate</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Pending Actions</div>
              <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">3</div>
              <div className="text-xs text-slate-500 mt-1">Leave & Expense items</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Role & Dept</th>
                  <th className="py-2.5 px-3">Shift Status</th>
                  <th className="py-2.5 px-3">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Amanuel Girma</td>
                  <td className="py-3 px-3 text-slate-600">Lead Architect · Tech</td>
                  <td className="py-3 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-2xs">Clocked In 08:45</span></td>
                  <td className="py-3 px-3 font-mono text-slate-500">3.4 yrs</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Bethlehem Tsegaye</td>
                  <td className="py-3 px-3 text-slate-600">Frontend Engineer · Tech</td>
                  <td className="py-3 px-3"><span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-2xs">Annual Leave</span></td>
                  <td className="py-3 px-3 font-mono text-slate-500">1.8 yrs</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Yared Solomon</td>
                  <td className="py-3 px-3 text-slate-600">Financial Controller · Finance</td>
                  <td className="py-3 px-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-2xs">Clocked In 09:00</span></td>
                  <td className="py-3 px-3 font-mono text-slate-500">4.1 yrs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="mt-6 space-y-3">
          <div className="text-xs text-slate-600 mb-2">Pending employee leave requests requiring manager endorsement:</div>
          {leaves.map((l) => (
            <div key={l.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-900">{l.emp}</div>
                <div className="text-xs text-slate-500">{l.dept} · {l.type} ({l.days})</div>
              </div>
              <div className="flex items-center gap-2">
                {l.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => handleLeaveAction(l.id, 'Declined')}
                      className="px-3 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 rounded"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleLeaveAction(l.id, 'Approved')}
                      className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                    l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {l.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-900 text-sm">October 2026 Payroll Batch</div>
              <div className="text-xs text-slate-500">148 Employees · Automated statutory deduction matrix applied</div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700">
              Run 1-Click Bank Disbursement
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500">Gross Salaries</span>
              <div className="font-bold font-mono text-base text-slate-900 mt-1">$214,800.00</div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500">Income Tax & Social Security</span>
              <div className="font-bold font-mono text-base text-slate-900 mt-1">$42,960.00</div>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500">Net Transfer Total</span>
              <div className="font-bold font-mono text-base text-emerald-600 mt-1">$171,840.00</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 4. CORPORATE PREVIEW SIMULATOR
 * -----------------------------------------------------------*/
const CorporatePreviewSimulator: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Mini header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="font-bold text-slate-900 tracking-tight text-sm">NEXUS HOLDINGS GROUP</div>
        <div className="flex gap-4 text-xs text-slate-600">
          <span>Sectors</span>
          <span>Investments</span>
          <span>Governance</span>
          <span>Investors</span>
        </div>
      </div>
      {/* Mini hero */}
      <div className="p-8 md:p-12 bg-slate-950 text-white text-center space-y-4">
        <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Institutional Capital & Infrastructure</div>
        <h1 className="text-2xl md:text-3xl font-extrabold max-w-xl mx-auto tracking-tight">
          Building resilient economic architectures for emerging markets.
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Over $840M deployed across telecommunications, digital infrastructure, and logistics hubs.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded">
            Download 2026 Annual Report
          </button>
          <button className="px-4 py-2 border border-slate-700 text-white text-xs font-semibold rounded hover:bg-slate-900">
            Portfolio Showcase
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 5. E-COMMERCE SIMULATOR
 * -----------------------------------------------------------*/
const EcommerceSimulator: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="font-bold text-lg text-slate-900">LUMINA STOREFRONT</div>
        <div className="text-xs text-slate-500">Faceted Filter & Fast-Checkout Demo</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div className="border border-slate-200 rounded-lg p-3 text-center">
          <div className="h-28 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">
            Wireless Audio Pro
          </div>
          <div className="text-xs font-bold text-slate-800">Noise-Cancelling Studio Headphones</div>
          <div className="text-xs font-bold text-blue-600 mt-1">$289.00</div>
          <button className="mt-2 w-full py-1.5 bg-slate-900 text-white text-2xs font-semibold rounded">
            Add to Bag
          </button>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 text-center">
          <div className="h-28 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">
            Mechanical Keyboard
          </div>
          <div className="text-xs font-bold text-slate-800">Custom Aluminum Keeb 75%</div>
          <div className="text-xs font-bold text-blue-600 mt-1">$175.00</div>
          <button className="mt-2 w-full py-1.5 bg-slate-900 text-white text-2xs font-semibold rounded">
            Add to Bag
          </button>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 text-center">
          <div className="h-28 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">
            Ergonomic Desk Mat
          </div>
          <div className="text-xs font-bold text-slate-800">Wool Felt Minimalist Pad</div>
          <div className="text-xs font-bold text-blue-600 mt-1">$45.00</div>
          <button className="mt-2 w-full py-1.5 bg-slate-900 text-white text-2xs font-semibold rounded">
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 6. HOTEL SIMULATOR
 * -----------------------------------------------------------*/
const HotelSimulator: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="font-bold text-lg text-slate-900">SERENGETI VISTA RESORT</div>
        <div className="text-xs text-slate-500">Live Availability & Room Lock Engine</div>
      </div>
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="text-xs text-slate-600">
          <div className="font-semibold text-slate-900">Selected Dates: Oct 28 - Nov 02, 2026 (5 Nights)</div>
          <div>Deluxe Savannah Suite · 2 Adults · Complimentary Morning Game Drive Included</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900 font-mono">$1,850.00</div>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded mt-1">
            Book Direct & Save 20%
          </button>
        </div>
      </div>
    </div>
  );
};
