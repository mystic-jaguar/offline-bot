import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-2 rounded ${active ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
    {children}
  </button>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

const AdminDashboard = () => {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [chats, setChats] = useState({});
  const [policies, setPolicies] = useState([]);
  const [company, setCompany] = useState({});
  const [categories, setCategories] = useState([]);
  const [disabledCats, setDisabledCats] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryItems, setCategoryItems] = useState([]);
  const [originalItemCount, setOriginalItemCount] = useState(0);

  const loadAll = async () => {
    const [an, ch, pol, comp, cats, dis] = await Promise.all([
      apiService.adminAnalytics(),
      apiService.adminGetChats(),
      apiService.adminGetPolicies(),
      apiService.adminGetCompany(),
      apiService.adminListCategories(),
      apiService.adminGetDisabledCategories(),
    ]);
    setAnalytics(an);
    setChats(ch);
    setPolicies(pol);
    setCompany(comp);
    setCategories(cats.categories || []);
    setDisabledCats(dis.disabled || []);
    if (!selectedCategory && (cats.categories || []).length > 0) {
      setSelectedCategory((cats.categories || [])[0]);
    }
  };

  const loadCategoryItems = async (category) => {
    if (!category) return;
    const items = await apiService.adminGetCategoryItems(category);
    const itemsArray = Array.isArray(items) ? items : [];
    setCategoryItems(itemsArray);
    setOriginalItemCount(itemsArray.length);
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (selectedCategory) loadCategoryItems(selectedCategory); }, [selectedCategory]);

  const savePolicies = async () => {
    await apiService.adminSavePolicies(policies);
    await loadAll();
  };

  const saveCompany = async () => {
    await apiService.adminSaveCompany(company);
    await loadAll();
  };

  const toggleDisabled = async (cat) => {
    const next = disabledCats.includes(cat) ? disabledCats.filter(c => c !== cat) : [...disabledCats, cat];
    await apiService.adminSetDisabledCategories(next);
    setDisabledCats(next);
  };

  

  const resetChats = async () => {
    await apiService.adminResetChats();
    await loadAll();
  };

  const deleteChat = async (sid) => {
    await apiService.adminDeleteChat(sid);
    await loadAll();
  };

  const addKbRow = () => {
    setCategoryItems(prev => ([ ...prev, { question: '', answer: '' } ]));
  };

  const saveKbItems = async () => {
    await apiService.adminSaveCategoryItems(selectedCategory, categoryItems);
    await loadCategoryItems(selectedCategory); // This will update originalItemCount
  };

  const deleteKbRow = async (index) => {
    try {
      // Check if this is a saved item (index < originalItemCount) or a new item
      const isSavedItem = index < originalItemCount;
      
      if (isSavedItem) {
        // For saved items, delete from backend first
        try {
          await apiService.adminDeleteCategoryItem(selectedCategory, index);
          // Preserve any new/unsaved items that were added after the original count
          const newItems = categoryItems.slice(originalItemCount);
          // Reload saved items from backend
          const savedItems = await apiService.adminGetCategoryItems(selectedCategory);
          const savedItemsArray = Array.isArray(savedItems) ? savedItems : [];
          // Combine saved items with preserved new items
          setCategoryItems([...savedItemsArray, ...newItems]);
          setOriginalItemCount(savedItemsArray.length);
        } catch (error) {
          console.error('Error deleting from backend:', error);
          // Reload to restore correct state
          await loadCategoryItems(selectedCategory);
          throw error; // Re-throw to show error to user if needed
        }
      } else {
        // For new/unsaved items, just remove from local state
        const updatedItems = categoryItems.filter((_, i) => i !== index);
        setCategoryItems(updatedItems);
        // originalItemCount stays the same
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      // Reload items to restore correct state
      await loadCategoryItems(selectedCategory);
    }
  };

  const toPieData = (obj) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }));

  if (!analytics) return <div className="p-4 text-gray-700 dark:text-gray-200">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <TabButton active={tab==='analytics'} onClick={() => setTab('analytics')}>Analytics</TabButton>
          <TabButton active={tab==='chats'} onClick={() => setTab('chats')}>User Chats</TabButton>
          <TabButton active={tab==='policies'} onClick={() => setTab('policies')}>Policies</TabButton>
          <TabButton active={tab==='company'} onClick={() => setTab('company')}>Company</TabButton>
          <TabButton active={tab==='knowledge'} onClick={() => setTab('knowledge')}>Knowledge Base</TabButton>
        </div>
        <button onClick={async () => { await apiService.adminLogout(); window.location.reload(); }} className="btn-secondary">Logout</button>
      </div>

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</div>
              <div className="text-2xl font-semibold">{analytics.total_sessions}</div>
            </div>
            <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Questions</div>
              <div className="text-2xl font-semibold">{analytics.total_questions}</div>
            </div>
            <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">Most Popular Category</div>
              <div className="text-2xl font-semibold">{analytics.most_popular_category || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-sm font-semibold mb-2">By Category</div>
              <div className="h-64 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={toPieData(analytics.category_counts)} dataKey="value" nameKey="name" outerRadius={90} label>
                      {toPieData(analytics.category_counts).map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-4 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-sm font-semibold mb-2">By Department</div>
              <div className="h-64 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={toPieData(analytics.department_counts)} dataKey="value" nameKey="name" outerRadius={90} label>
                      {toPieData(analytics.department_counts).map((entry, index) => (
                        <Cell key={`dept-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'chats' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Filter by session id" className="border rounded px-2 py-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
            <button onClick={resetChats} className="btn-secondary">Reset All</button>
          </div>
          <div className="space-y-3">
            {Object.entries(chats)
              .filter(([sid]) => sid.includes(filter))
              .map(([sid, history]) => (
              <div key={sid} className="border rounded p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Session: {sid}</div>
                  <button onClick={() => deleteChat(sid)} className="text-sm text-red-600">Delete</button>
                </div>
                <div className="space-y-1 text-sm">
                  {history.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-20 text-gray-500">{m.type}</div>
                      <div className="flex-1">{m.message}</div>
                      <div className="w-40 text-right text-gray-500">{m.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'policies' && (
        <div className="space-y-2">
          <button onClick={savePolicies} className="btn-primary">Save Policies</button>
          <textarea value={JSON.stringify(policies, null, 2)} onChange={(e)=>setPolicies(JSON.parse(e.target.value || '[]'))} className="w-full h-80 border rounded p-2 font-mono text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"></textarea>
        </div>
      )}

      {tab === 'company' && (
        <div className="space-y-2">
          <button onClick={saveCompany} className="btn-primary">Save Company</button>
          <textarea value={JSON.stringify(company, null, 2)} onChange={(e)=>setCompany(JSON.parse(e.target.value || '{}'))} className="w-full h-80 border rounded p-2 font-mono text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"></textarea>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="space-y-4">
          <div className="border rounded p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="font-semibold mb-2">Categories</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-2 py-1 rounded border ${selectedCategory === c ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>{c}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((c) => (
                <button key={`toggle-${c}`} onClick={() => toggleDisabled(c)} className={`px-2 py-1 rounded border ${disabledCats.includes(c) ? 'bg-red-100 border-red-300 text-red-700' : 'bg-green-100 border-green-300 text-green-700'}`}>{disabledCats.includes(c) ? 'Disabled' : 'Enabled'}: {c}</button>
              ))}
            </div>
            
            {selectedCategory && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Editing: {selectedCategory}</div>
                  <div className="space-x-2">
                    <button onClick={addKbRow} className="btn-secondary">Add Row</button>
                    <button onClick={saveKbItems} className="btn-primary">Save</button>
                  </div>
                </div>
                <div className="overflow-auto border rounded dark:border-gray-700 max-h-[70vh]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="text-left p-2 border-b dark:border-gray-700 w-1/2">Question</th>
                        <th className="text-left p-2 border-b dark:border-gray-700 w-1/2">Answer</th>
                        <th className="text-left p-2 border-b dark:border-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryItems.map((it, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="p-2 border-b dark:border-gray-700">
                            <textarea value={it.question || ''} onChange={(e)=>{
                              const next = [...categoryItems];
                              next[idx] = { ...next[idx], question: e.target.value };
                              setCategoryItems(next);
                            }} className="w-full border rounded p-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" rows={3} />
                          </td>
                          <td className="p-2 border-b dark:border-gray-700">
                            <textarea value={it.answer || ''} onChange={(e)=>{
                              const next = [...categoryItems];
                              next[idx] = { ...next[idx], answer: e.target.value };
                              setCategoryItems(next);
                            }} className="w-full border rounded p-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" rows={3} />
                          </td>
                          <td className="p-2 border-b dark:border-gray-700">
                            <button onClick={() => deleteKbRow(idx)} className="text-red-600">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


