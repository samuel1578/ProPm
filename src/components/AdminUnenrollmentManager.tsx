import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Calendar,
    DollarSign,
    FileText,
} from 'lucide-react';
import {
    getAllUnenrollmentRequests,
    approveUnenrollmentRequest,
    denyUnenrollmentRequest,
} from '../lib/appwrite';
import type { UnenrollmentRequest } from '../types/resources';
import { plans } from '../lib/plans';

type StatusFilter = 'all' | 'pending' | 'approved' | 'denied';

export default function AdminUnenrollmentManager() {
    const [requests, setRequests] = useState<UnenrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<UnenrollmentRequest | null>(null);

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    async function loadRequests() {
        try {
            setLoading(true);
            const filter = statusFilter === 'all' ? undefined : statusFilter;
            const data = await getAllUnenrollmentRequests(filter);
            setRequests(data as unknown as UnenrollmentRequest[]);
        } catch (error) {
            console.error('Failed to load unenrollment requests:', error);
            alert('Failed to load requests');
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(request: UnenrollmentRequest) {
        setSelectedRequest(request);
        setShowConfirmModal(true);
    }

    async function confirmApprove() {
        if (!selectedRequest) return;

        setProcessing(selectedRequest.$id);
        try {
            // Get plan details for cooldown and refund calculation
            const plan = plans.find(p => p.name === selectedRequest.planTier);
            if (!plan) {
                alert('Plan not found');
                return;
            }

            // Calculate refund eligibility
            const enrolledDate = new Date(selectedRequest.enrolledAt);
            const now = new Date();
            const daysSinceEnrollment = Math.floor((now.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24));
            const refundEligible = daysSinceEnrollment <= plan.refundEligibilityDays;
            const refundAmount = refundEligible ? plan.basePrice * 0.5 : 0; // 50% refund if eligible

            // Mock admin user ID - in production, get from auth context
            const adminUserId = 'admin-user-id'; // TODO: Replace with actual admin user ID from context

            await approveUnenrollmentRequest(
                selectedRequest.$id,
                adminUserId,
                selectedRequest.enrollmentId,
                plan.cooldownDays,
                refundEligible,
                refundAmount
            );

            alert('Unenrollment request approved successfully!');
            setShowConfirmModal(false);
            setSelectedRequest(null);
            await loadRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request');
        } finally {
            setProcessing(null);
        }
    }

    async function handleDeny(request: UnenrollmentRequest) {
        if (!confirm(`Are you sure you want to deny the unenrollment request from ${request.certificationName}?`)) {
            return;
        }

        setProcessing(request.$id);
        try {
            // Mock admin user ID
            const adminUserId = 'admin-user-id'; // TODO: Replace with actual admin user ID from context

            await denyUnenrollmentRequest(request.$id, adminUserId);
            alert('Unenrollment request denied');
            await loadRequests();
        } catch (error) {
            console.error('Failed to deny request:', error);
            alert('Failed to deny request');
        } finally {
            setProcessing(null);
        }
    }

    function getStatusBadge(status: string) {
        const styles = {
            pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            denied: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[status as keyof typeof styles] || ''}`}>
                {status}
            </span>
        );
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        denied: requests.filter(r => r.status === 'denied').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Denied</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.denied}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {(['all', 'pending', 'approved', 'denied'] as StatusFilter[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 font-medium text-sm capitalize transition-colors border-b-2 ${statusFilter === filter
                                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Requests Table */}
            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No {statusFilter !== 'all' ? statusFilter : ''} unenrollment requests found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#0d2244] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User & Certification
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Plan Tier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.map((request) => (
                                    <tr key={request.$id} className="hover:bg-gray-50 dark:hover:bg-[#0d2244] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {request.userId.substring(0, 8)}...
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {request.certificationName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                {request.planTier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {request.reasonCategory?.replace(/-/g, ' ')}
                                                </p>
                                                {request.reasonDetails && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {request.reasonDetails}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Enrolled: {formatDate(request.enrolledAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Requested: {formatDate(request.requestedAt)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(request)}
                                                        disabled={processing === request.$id}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeny(request)}
                                                        disabled={processing === request.$id}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {request.processedAt && `Processed: ${formatDate(request.processedAt)}`}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approval Confirmation Modal */}
            {showConfirmModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#0b1b36] rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Confirm Unenrollment Approval
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-[#0d2244] rounded-lg p-4 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Certification:</strong> {selectedRequest.certificationName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Plan:</strong> {selectedRequest.planTier}
                                </p>
                                {(() => {
                                    const plan = plans.find(p => p.name === selectedRequest.planTier);
                                    if (!plan) return null;

                                    const enrolledDate = new Date(selectedRequest.enrolledAt);
                                    const now = new Date();
                                    const daysSinceEnrollment = Math.floor((now.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24));
                                    const refundEligible = daysSinceEnrollment <= plan.refundEligibilityDays;
                                    const refundAmount = refundEligible ? plan.basePrice * 0.5 : 0;

                                    return (
                                        <>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <strong>Cooldown Period:</strong> {plan.cooldownDays} days
                                            </p>
                                            <div className={`flex items-center gap-2 text-sm ${refundEligible ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                <DollarSign className="w-4 h-4" />
                                                <span>
                                                    <strong>Refund:</strong> {refundEligible ? `₵${refundAmount.toLocaleString()} (50% refund)` : 'Not eligible'}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        This will mark the enrollment as inactive and prevent re-enrollment during the cooldown period.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={!!processing}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Confirm Approval
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
