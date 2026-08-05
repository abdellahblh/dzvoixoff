import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User as UserType } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, XCircle, Search, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface PaymentProof {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  fileData: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function Admin() {
  const { user, isAuthReady } = useAuth();
  const { t, language } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const ADMIN_EMAIL = 'abdellah.bellahcene2004@gmail.com';

  useEffect(() => {
    if (!isAuthReady || user?.email !== ADMIN_EMAIL) return;

    // Fetch Users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserType[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    // Fetch Pending Proofs
    const qProofs = query(collection(db, 'payment_proofs'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const unsubscribeProofs = onSnapshot(qProofs, (snapshot) => {
      const proofsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentProof[];
      setProofs(proofsData);
    }, (error) => {
      console.error("Error fetching proofs:", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProofs();
    };
  }, [isAuthReady, user]);

  if (!isAuthReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'pro') => {
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan,
        ...(newPlan === 'pro' ? { generationsUsed: 0 } : {})
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Failed to update user plan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProofAction = async (proofId: string, userId: string, action: 'approve' | 'reject') => {
    setUpdatingId(proofId);
    try {
      // Update proof status
      await updateDoc(doc(db, 'payment_proofs', proofId), {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      // If approved, upgrade user to pro and reset usage
      if (action === 'approve') {
        await updateDoc(doc(db, 'users', userId), {
          plan: 'pro',
          generationsUsed: 0
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing proof:`, error);
      alert(`Failed to ${action} payment proof.`);
    } finally {
      setUpdatingId(null);
      setSelectedProof(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" dir={dir}>
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-brand-navy dark:text-brand-teal" />
        <h1 className={`text-3xl font-bold text-brand-navy dark:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
          Admin Dashboard
        </h1>
      </div>

      {/* Pending Payment Proofs Section */}
      {proofs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-brand-teal/30 dark:border-brand-teal/20 overflow-hidden mb-8 transition-colors">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-brand-teal/5 dark:bg-brand-teal/10 flex items-center gap-2">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white">Pending Payment Proofs</h2>
            <span className="bg-brand-teal text-white px-3 py-1 rounded-full text-sm font-bold">
              {proofs.length} New
            </span>
          </div>
          <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {proofs.map(proof => (
              <div key={proof.id} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 flex flex-col transition-colors">
                <div 
                  className="h-48 bg-slate-200 dark:bg-slate-800 relative cursor-pointer group"
                  onClick={() => setSelectedProof(selectedProof === proof.id ? null : proof.id)}
                >
                  {proof.fileData.startsWith('data:image') ? (
                    <img src={proof.fileData} alt="Payment Proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" /> View Full
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{proof.userName}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">{proof.userEmail}</div>
                  
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleProofAction(proof.id, proof.userId, 'approve')}
                      disabled={updatingId === proof.id}
                      className="flex-1 py-2 bg-brand-teal text-brand-navy font-bold rounded-lg hover:bg-brand-teal-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {updatingId === proof.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleProofAction(proof.id, proof.userId, 'reject')}
                      disabled={updatingId === proof.id}
                      className="flex-1 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {updatingId === proof.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Image Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedProof(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2"
            >
              <XCircle className="w-8 h-8" />
            </button>
            {proofs.find(p => p.id === selectedProof)?.fileData.startsWith('data:image') ? (
              <img 
                src={proofs.find(p => p.id === selectedProof)?.fileData} 
                alt="Full Payment Proof" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center shadow-2xl border border-white/10">
                <p className="text-slate-600 dark:text-slate-400 mb-4">This file is not an image.</p>
                <a 
                  href={proofs.find(p => p.id === selectedProof)?.fileData} 
                  download="payment_proof"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal text-brand-navy font-bold rounded-xl hover:bg-brand-teal-hover transition-colors"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Users Management</h2>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-medium">
              {users.length} Total
            </span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent text-sm text-slate-900 dark:text-white transition-all ${language === 'ar' ? 'pr-10 pl-4' : ''}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className={`p-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>User</th>
                <th className={`p-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>Joined</th>
                <th className={`p-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>Usage</th>
                <th className={`p-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>Plan</th>
                <th className={`p-4 font-semibold text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${u.plan === 'pro' ? 'bg-brand-teal' : 'bg-slate-400 dark:bg-slate-600'}`} 
                            style={{ width: `${Math.min((u.generationsUsed / (u.plan === 'pro' ? 250 : 3)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {u.generationsUsed} / {u.plan === 'pro' ? '250' : '3'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.plan === 'pro' 
                          ? 'bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal border border-brand-teal/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                      }`}>
                        {u.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {u.plan === 'free' ? (
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'pro')}
                          disabled={updatingId === u.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy dark:bg-brand-teal text-white dark:text-brand-navy text-xs font-bold rounded-lg hover:bg-brand-navy-light dark:hover:bg-brand-teal-hover transition-colors disabled:opacity-50"
                        >
                          {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Upgrade to Pro
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'free')}
                          disabled={updatingId === u.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                        >
                          {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Downgrade
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
