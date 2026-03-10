(function(global){
  const KEY = 'sorvete-stores-v1';

  function loadAll(){
    const raw = localStorage.getItem(KEY);
    if(!raw) return {};
    try { return JSON.parse(raw); } catch(err){
      console.warn('Erro lendo LocalStorage', err);
      return {};
    }
  }

  function saveAll(data){
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function loadStore(storeId){
    const data = loadAll();
    return data[storeId] || { products: {}, lastUpdated: null, countDate: null };
  }

  function saveStore(storeId, payload){
    const data = loadAll();
    data[storeId] = payload;
    saveAll(data);
  }

  function clearStore(storeId){
    const data = loadAll();
    delete data[storeId];
    saveAll(data);
  }

  global.StorageApi = { loadStore, saveStore, clearStore };
})(window);
