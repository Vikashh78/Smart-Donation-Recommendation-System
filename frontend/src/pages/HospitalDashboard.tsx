import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, History, Sparkles, AlertCircle, Eye, Plus, Phone, MapPin, CheckCircle, Clock, Truck } from 'lucide-react';
import { Button, Input, Card } from '@/src/components/UI';
import { EmptyState } from '@/src/components/States';
import { hospitalService, handleApiError } from '@/src/services/api';
import { Link } from 'react-router-dom';

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState<'request' | 'my-requests' | 'accepted' | 'history'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendStatuses, setSendStatuses] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'duplicate'>>({});
  const userName = localStorage.getItem('userName') || 'Medical Center';
  const userEmail = localStorage.getItem('email') || '';

  // New state for accepted requests
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);

  const [form, setForm] = useState({
    item: '',
    quantity: '',
    urgency: 'medium',
    location: '',
    deadline: 'today',
    notes: '',
  });

  useEffect(() => {
    if (activeTab === 'my-requests') {
      loadMyRequests();
    } else if (activeTab === 'accepted') {
      loadAcceptedRequests();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadMyRequests = async () => {
    try {
      const response = await hospitalService.getMyRequests(userEmail);
      setMyRequests(response.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAcceptedRequests = async () => {
    try {
      const response = await hospitalService.getAcceptedRequests();
      setAcceptedRequests(response.data.accepted_requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await hospitalService.getHistory();
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
      await hospitalService.request({
        hospital_email: userEmail,
        item: form.item,
        quantity: Number(form.quantity),
        urgency: form.urgency,
        location: form.location,
        deadline: form.deadline,
        notes: form.notes,
      });
      setSuccessMessage('Request posted successfully!');
      setForm({ item: '', quantity: '', urgency: 'medium', location: '', deadline: 'today', notes: '' });
      setActiveTab('my-requests');
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  const viewMatches = async (request: any) => {
    setSelectedRequest(request);
    try {
      const response = await hospitalService.getRequestMatches(request._id);
      setMatches(response.data.matches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (donationId: string, match: any) => {
    if (!selectedRequest) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setSendStatuses((prev) => ({ ...prev, [donationId]: 'sending' }));

    try {
      const response = await hospitalService.sendRequest(donationId, {
        request_id: selectedRequest._id,
        hospital_id: userEmail,
        donor_id: donationId,
        resource_name: match.item,
        quantity: match.quantity,
        urgency: selectedRequest.urgency || match.urgency,
        needed_by: selectedRequest.deadline || 'today',
        hospital_name: userName,
      });

      setSuccessMessage(response.data?.message || 'Request sent successfully');
      setSendStatuses((prev) => ({ ...prev, [donationId]: 'sent' }));
      loadMyRequests();
    } catch (err) {
      const message = handleApiError(err);
      const errorText = typeof message === 'string' ? message : message.detail || message.message || JSON.stringify(message);
      if (errorText.toLowerCase().includes('already sent') || errorText.toLowerCase().includes('duplicate')) {
        setSendStatuses((prev) => ({ ...prev, [donationId]: 'duplicate' }));
      } else {
        setSendStatuses((prev) => ({ ...prev, [donationId]: 'idle' }));
      }
      setErrorMessage(errorText);
    }
  };

  const completeRequest = async (notificationId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await hospitalService.completeRequest(notificationId);
      setSuccessMessage('Request completed successfully!');
      loadAcceptedRequests();
      loadMyRequests();
    } catch (err) {
      const message = handleApiError(err);
      setErrorMessage(typeof message === 'string' ? message : message.detail || message.message || JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 bento-bg min-h-screen">
      <main className="grid grid-cols-12 gap-6">
        {/* Header Section */}
        <div className="col-span-12 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{userName}</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your resource requests and track recommendations.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'request' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              New Request
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'my-requests' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              My Requests ({myRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'accepted' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Accepted ({acceptedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <History className="w-4 h-4 inline mr-1" />
              History ({historyRequests.length})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12">
          {activeTab === 'request' && (
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Post New Resource Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-indigo-200">Resource Item</label>
                    <input
                      type="text"
                      placeholder="e.g. Oxygen Concentrator"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm placeholder:text-indigo-200"
                      value={form.item}
                      onChange={(e) => setForm({ ...form, item: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-indigo-200">Quantity</label>
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-indigo-200">Urgency Level</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm"
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-indigo-200">Need by</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    >
                      <option value="2 hours">2 Hours</option>
                      <option value="today">Today</option>
                      <option value="1 day">1 Day</option>
                      <option value="3 days">3 Days</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-200">Location</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-200">Notes</label>
                  <textarea
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Broadcasting...' : 'Broadcast Request'}
                </button>
                {successMessage && <p className="mt-3 text-sm text-green-300">{successMessage}</p>}
                {errorMessage && <p className="mt-3 text-sm text-red-300">{errorMessage}</p>}
              </form>
            </Card>
          )}

          {activeTab === 'my-requests' && !selectedRequest && (
            <div className="space-y-4">
              {myRequests.length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  description="Post your first resource request to get started."
                  action={<Button onClick={() => setActiveTab('request')}>Create Request</Button>}
                />
              ) : (
                myRequests.map((request) => (
                  <Card key={request._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{request.item}</h3>
                        <p className="text-sm text-slate-600">Quantity: {request.quantity} | Urgency: {request.urgency} | Deadline: {request.deadline}</p>
                        <p className="text-xs text-slate-500">Status: {request.status} | Matches: {request.match_count}</p>
                      </div>
                      <Button onClick={() => viewMatches(request)} variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View Matches
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Matches for: {selectedRequest.item}</h2>
                <Button onClick={() => setSelectedRequest(null)} variant="outline">Back</Button>
              </div>
              {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              {matches.length === 0 ? (
                <EmptyState title="No matches found" description="No suitable donors available at this time." />
              ) : (
                matches.map((match) => (
                  <Card key={match.donation_id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{match.donor_email}</h3>
                        <p className="text-sm text-slate-600">Quantity: {match.quantity} | Location: {match.location}</p>
                        <p className="text-xs text-slate-500">Priority Score: {match.priority_score} | Response Rate: {match.response_rate}%</p>
                      </div>
                      <Button
                        onClick={() => sendRequest(match.donation_id, match)}
                        className="gap-2"
                        disabled={['sent', 'sending', 'duplicate'].includes(sendStatuses[match.donation_id] || 'idle')}
                        isLoading={sendStatuses[match.donation_id] === 'sending'}
                      >
                        <Send className="w-4 h-4" />
                        {sendStatuses[match.donation_id] === 'sending'
                          ? 'Sending...'
                          : sendStatuses[match.donation_id] === 'sent'
                          ? 'Sent'
                          : sendStatuses[match.donation_id] === 'duplicate'
                          ? 'Already sent'
                          : 'Send Request'}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'accepted' && (
            <div className="space-y-4">
              {acceptedRequests.length === 0 ? (
                <EmptyState
                  title="No accepted requests"
                  description="When donors accept your requests, they will appear here with their contact details."
                  action={<Button onClick={() => setActiveTab('request')}>Create Request</Button>}
                />
              ) : (
                acceptedRequests.map((request) => (
                  <Card key={request._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.request_details?.item || request.item}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'details_sent' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {request.status === 'details_sent' ? 'Details Received' : 'Accepted'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Donor: {request.donor_name || request.donor_email} | Quantity: {request.quantity}
                        </p>
                        {request.status === 'details_sent' && request.donor_details && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-semibold text-blue-700 mb-2">Donor Contact Details:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-600">{request.donor_details.phone}</span>
                              </div>
                              {request.donor_details.alt_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-blue-500" />
                                  <span className="text-slate-600">{request.donor_details.alt_phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 col-span-2">
                                <MapPin className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-600">{request.donor_details.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-600">{request.donor_details.preferred_time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Truck className="w-3 h-3 text-blue-500" />
                                <span className="text-slate-600 capitalize">{request.donor_details.delivery_method?.replace('_', ' ')}</span>
                              </div>
                              {request.donor_details.notes && (
                                <div className="col-span-2 mt-1">
                                  <p className="text-xs text-slate-500">Notes: {request.donor_details.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'details_sent' && (
                          <Button 
                            onClick={() => completeRequest(request._id)} 
                            variant="outline" 
                            className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                            disabled={isLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Completed
                          </Button>
                        )}
                        {request.status === 'accepted' && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            Waiting for donor details
                          </span>
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
                  title="No completed requests"
                  description="Your completed requests will appear here."
                  action={<Button onClick={() => setActiveTab('request')}>Create Request</Button>}
                />
              ) : (
                historyRequests.map((request) => (
                  <Card key={request._id} className="p-6 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{request.request_details?.item || request.item}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Donor: {request.donor_name || request.donor_email} | Quantity: {request.quantity}
                        </p>
                        {request.completed_at && (
                          <p className="text-xs text-slate-500">Completed: {new Date(request.completed_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
