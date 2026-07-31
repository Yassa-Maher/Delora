import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Mail, Send, ChevronDown, ChevronUp } from 'lucide-react';
import API from '../../api/axios';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});
  const [expanded, setExpanded] = useState({});

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/contacts');
      setContacts(Array.isArray(res.data) ? res.data : res.data.contacts || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    try {
      await API.put(`/contacts/${id}/read`);
      fetch();
    } catch {}
  };

  const handleReply = async (id) => {
    const reply = replyText[id]?.trim();
    if (!reply) { toast.error('يرجى كتابة الرد'); return; }
    setSending((p) => ({ ...p, [id]: true }));
    try {
      await API.post(`/contacts/${id}/reply`, { reply });
      toast.success('تم إرسال الرد');
      setReplyText((p) => ({ ...p, [id]: '' }));
      setExpanded((p) => ({ ...p, [id]: false }));
      fetch();
    } catch {} finally { setSending((p) => ({ ...p, [id]: false })); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try { await API.delete(`/contacts/${id}`); toast.success('تم الحذف'); fetch(); } catch {}
  };

  const toggleExpand = (id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
    if (!expanded[id]) setReplyText((p) => ({ ...p, [id]: '' }));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الرسائل</h1>
      {contacts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><Mail size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-500 dark:text-gray-400">لا توجد رسائل</p></div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 ${!c.is_read ? 'border-[rgb(0,166,62)] bg-green-50/40 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700'}`} onClick={() => !c.is_read && markRead(c.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{c.name}</span>
                    {!c.is_read && <span className="bg-[rgb(0,166,62)] w-2 h-2 rounded-full"></span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.email}</p>
                  {c.subject && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">الموضوع: {c.subject}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{c.message}</p>
                  {c.admin_reply && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border-r-4 border-[rgb(0,166,62)]">
                      <p className="text-xs font-bold text-[rgb(0,166,62)] mb-1">رد الإدارة:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.admin_reply}</p>
                      {c.replied_at && <p className="text-[10px] text-gray-400 mt-1">{new Date(c.replied_at).toLocaleString('ar-EG')}</p>}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(c.created_at).toLocaleString('ar-EG')}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleExpand(c.id); }} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl">
                    {expanded[c.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
                </div>
              </div>
              {expanded[c.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الرد على {c.name}:</label>
                  <textarea className="input-field mb-2" rows={3} value={replyText[c.id] || ''} onChange={(e) => setReplyText((p) => ({ ...p, [c.id]: e.target.value }))} placeholder="اكتب ردك هنا..." />
                  <button onClick={() => handleReply(c.id)} disabled={sending[c.id] || !replyText[c.id]?.trim()} className="btn-primary text-sm flex items-center gap-1.5">
                    <Send size={14} /> {sending[c.id] ? 'جارٍ الإرسال...' : 'إرسال الرد'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
