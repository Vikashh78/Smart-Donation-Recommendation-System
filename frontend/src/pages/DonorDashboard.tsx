import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Package, CheckCircle, XCircle, Clock, Truck, Phone, MapPin, History } from 'lucide-react';
import { Button, Input, Card } from '@/src/components/UI';
import { EmptyState } from '@/src/components/States';
import { donorService, handleApiError } from '@/src/services/api';

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState<'donate' | 'requests' | 'history'>('donate');
  const [isLoading, setIsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const userName = localStorage.getItem('userName') || 'Donor';
  const userEmail = localStorage.getItem('email') || '';

  const [form, setForm] = useState({
    item: '',
    quantity: '',
    location: '',
    expiryDate: '',
  });

  // Delivery details modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    full_name: '',
    phone: '',
    alt_phone: '',
    address: '',
    preferred_time: '9 AM - 5 PM',
    delivery_method: 'self_delivery',
    notes: '',
  });

  useEffect(() => {
    if (activeTab === 'requests') {
      loadIncomingRequests();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadIncomingRequests = async () => {
    try {
      const response = await donorService.getIncomingRequests(userEmail);
      setIncomingRequests(response.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await donorService.getHistory(userEmail);
      setHistoryRequests(response.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await donorService.donate({
        donor_email: userEmail,
        item: form.item,
        quantity: Number(form.quantity),
        location: form.location,
        expiry_date: form.expiryDate,
      });
      setSuccessMessage('Resource submitted successfully!');
      setForm({ item: '', quantity: '', location: '', expiryDate: '' });
      setActiveTab('requests');
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (notificationId: string) => {
    try {
      await donorService.acceptRequest(notificationId);
      setSuccessMessage('Request accepted!');
      loadIncomingRequests();
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const handleReject = async (notificationId: string) => {
    try {
      await donorService.rejectRequest(notificationId);
      setSuccessMessage('Request rejected.');
      loadIncomingRequests();
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const handleSendDeliveryDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotification) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await donorService.sendDeliveryDetails(selectedNotification._id, deliveryForm);
      setSuccessMessage('Delivery details sent successfully!');
      setShowDeliveryModal(false);
      setDeliveryForm({
        full_name: '',
        phone: '',
        alt_phone: '',
        address: '',
        preferred_time: '9 AM - 5 PM',
        delivery_method: 'self_delivery',
        notes: '',
      });
      setSelectedNotification(null);
      loadIncomingRequests();
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  const openDeliveryModal = (notification: any) => {
    setSelectedNotification(notification);
    setShowDeliveryModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 bento-bg min-h-screen">
      <main className="grid grid-cols-12 gap-6">
        {/* Header Section */}
        <div className="col-span-12 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back, {userName}!</h1>
            <p className="text-slate-500 text-sm mt-1">Your contributions are making a real-world impact. See your stats below.</p>
          </div>
          <div className="bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-sky-100">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            System Operational
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="col-span-12 flex gap-4">
          <button
            onClick={() => setActiveTab('donate')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'donate' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Donate Resource
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <History className="w-4 h-4 inline mr-2" />
            History ({historyRequests.length})
          </button>
        </div>

        {/* Main Content */}
        <div className="col-span-12">
          {activeTab === 'donate' && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Resource Donation
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1.5 block">Resource Item</label>
                    <input
                      type="text"
                      placeholder="e.g. Oxygen Concentrator"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm placeholder:text-indigo-200 outline-none focus:ring-2 focus:ring-white/30"
                      value={form.item}
                      onChange={(e) => setForm({ ...form, item: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1.5 block">Quantity</label>
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/30"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1.5 block">Location</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/30"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1.5 block">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Submit Resource'}
                </button>
                {successMessage && <p className="mt-3 text-sm text-green-300">{successMessage}</p>}
                {errorMessage && <p className="mt-3 text-sm text-red-300">{errorMessage}</p>}
              </form>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <EmptyState
                  title="No incoming requests"
                  description="When hospitals need your resources, requests will appear here."
                  action={<Button onClick={() => setActiveTab('donate')}>Make a Donation</Button>}
                />
              ) : (
                incomingRequests.map((request) => (
                  <Card key={request._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.request_details.item}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.request_details.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                            request.request_details.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            request.request_details.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {request.request_details.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Hospital: {request.hospital_email} | Quantity: {request.quantity} | Deadline: {request.request_details.deadline}
                        </p>
                        <p className="text-xs text-slate-500">Location: {request.request_details.location}</p>
                        <p className="text-xs text-slate-500 mt-1">Status: {request.status}</p>
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button onClick={() => handleAccept(request._id)} variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </Button>
                            <Button onClick={() => handleReject(request._id)} variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'accepted' && (
                          <Button onClick={() => openDeliveryModal(request)} variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Truck className="w-4 h-4" />
                            Send Delivery Details
                          </Button>
                        )}
                        {request.status === 'details_sent' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Details Sent</span>
                        )}
                        {request.status === 'completed' && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Completed</span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Rejected</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {historyRequests.length === 0 ? (
                <EmptyState
                  title="No history yet"
                  description="Your completed and rejected requests will appear here."
                  action={<Button onClick={() => setActiveTab('donate')}>Make a Donation</Button>}
                />
              ) : (
                historyRequests.map((request) => (
                  <Card key={request._id} className="p-6 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.request_details?.item || request.item}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'completed' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Hospital: {request.hospital_email} | Quantity: {request.quantity}
                        </p>
                        {request.completed_at && (
                          <p className="text-xs text-slate-500">Completed: {new Date(request.completed_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'completed' && (
                          <CheckCircle className="w-6 h-6 text-purple-500" />
                        )}
                        {request.status === 'rejected' && (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Delivery Details Modal */}
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Delivery Details
                  </h3>
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSendDeliveryDetails} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={deliveryForm.full_name}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={deliveryForm.phone}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Alternate Phone (Optional)</label>
                      <input
                        type="tel"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={deliveryForm.alt_phone}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, alt_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Pickup/Delivery Address
                    </label>
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      value={deliveryForm.address}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                      placeholder="Full address for pickup or delivery"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Preferred Contact Time</label>
                      <select
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={deliveryForm.preferred_time}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, preferred_time: e.target.value })}
                      >
                        <option value="9 AM - 5 PM">9 AM - 5 PM</option>
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                        <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Delivery Method</label>
                      <select
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={deliveryForm.delivery_method}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_method: e.target.value })}
                      >
                        <option value="self_delivery">Self Delivery</option>
                        <option value="pickup">Hospital Pickup</option>
                        <option value="courier">Courier Service</option>
                        <option value="discuss">Discuss with Hospital</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Additional Notes</label>
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      value={deliveryForm.notes}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                      placeholder="Any special instructions or notes..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDeliveryModal(false)}
                      className="flex-1 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Details'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
