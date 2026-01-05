import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function TaskDetail({ clientId, taskId }){
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');

  useEffect(()=>{
    const fetch = async ()=>{
      setLoading(true);
      try{
        if (!clientId) throw new Error('Missing clientId');
        const res = await api.get(`/admin/clients/${clientId}/tasks/${taskId}`);
        setTask(res.data.task);
      }catch(err){ console.error(err); }
      setLoading(false);
    }
    fetch();
  },[taskId, clientId]);

  if (loading) return <div>Loading task...</div>;
  if (!task) return <div>Task not found</div>;

  const refresh = async ()=>{
    setLoading(true);
    try{ const r = await api.get(`/admin/clients/${clientId}/tasks/${taskId}`); setTask(r.data.task); }catch(e){}finally{ setLoading(false); }
  }

  const approve = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/approve`, { remarks }); await refresh(); }catch(e){ alert('Failed'); } }
  const reject = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/reject`, { remarks }); await refresh(); }catch(e){ alert('Failed'); } }
  const assign = async ()=>{ const assignedTo = prompt('Assign to (user id)'); const idx = task.currentStageIndex || 0; try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/assign`, { assignedTo, stageIndex: idx }); await refresh(); }catch(e){ alert('Failed'); } }
  const reassign = async ()=>{ const assignedTo = prompt('Reassign to (user id)'); const idx = task.currentStageIndex || 0; try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/reassign`, { assignedTo, stageIndex: idx }); await refresh(); }catch(e){ alert('Failed'); } }

  const submit = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/submit`, { remarks }); await refresh(); }catch(e){ alert('Failed'); } }
  const resubmit = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/resubmit`, { remarks }); await refresh(); }catch(e){ alert('Failed'); } }

  const markPosted = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/mark-posted`); await refresh(); }catch(e){ alert('Failed'); } }
  const markDone = async ()=>{ try{ await api.post(`/admin/clients/${clientId}/tasks/${task._id}/mark-done`); await refresh(); }catch(e){ alert('Failed'); } }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="mb-2 font-bold">{task.title}</div>
      <div className="text-sm text-gray-500">{task.type} • {task.client?.name}</div>
      <div className="mt-3">
        <h3 className="font-semibold">Stages</h3>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          {(task.stages || []).map((s, i) => (
            <li key={i} className={`p-2 rounded ${task.currentStageIndex === i ? 'bg-yellow-50' : 'bg-white'}`}>
              <div className="font-medium">{s.name} - {s.status}</div>
              <div className="text-sm text-gray-500">Assigned To: {s.assignedTo? s.assignedTo.name: '—'}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4">
        <textarea className="w-full border p-2" placeholder="Remarks" value={remarks} onChange={e=>setRemarks(e.target.value)} />
        <div className="flex gap-2 mt-2">
          {(user.role === 'TL-1' || user.role === 'TL-2') && (
            <>
              <Button onClick={assign}>Assign</Button>
              <Button onClick={approve}>Approve</Button>
              <Button onClick={reject} className="bg-red-500">Reject</Button>
              <Button onClick={reassign}>Reassign</Button>
            </>
          )}
          {(user.role === 'Employee' || user.role === 'TL-1' || user.role === 'TL-2') && (
            <>
              <Button onClick={submit}>Submit</Button>
              <Button onClick={resubmit}>Resubmit</Button>
            </>
          )}
          {user.role === 'Social Media Manager' && (
            <>
              <Button onClick={markPosted}>Mark Posted</Button>
              <Button onClick={markDone}>Mark Done</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}