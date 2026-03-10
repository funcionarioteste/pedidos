(function(global){
  const KEY = 'pedidoApp-v3';

  function loadState(){
    const raw = localStorage.getItem(KEY);
    if(!raw) return { catalog: [], stores: {}, customProducts: [], theme: 'light' };
    try {
      const parsed = JSON.parse(raw);
      return {
        catalog: Array.isArray(parsed.catalog) ? parsed.catalog : [],
        stores: parsed.stores || {},
        customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
        theme: parsed.theme || 'light'
      };
    } catch(err){
      console.warn('Erro lendo LocalStorage', err);
      return { catalog: [], stores: {}, customProducts: [], theme: 'light' };
    }
  }

  function saveState(state){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function getCatalog(){
    return loadState().catalog || [];
  }

  function setCatalog(catalog){
    const state = loadState();
    state.catalog = Array.isArray(catalog) ? catalog : [];
    saveState(state);
  }

  function getCustomProducts(){
    return loadState().customProducts || [];
  }

  function addProduct(product){
    const state = loadState();
    state.catalog = state.catalog || [];
    const existing = state.catalog.find(p => p.id === product.id);
    if(existing){
      Object.assign(existing, product);
    } else {
      state.catalog.push(product);
      state.customProducts = state.customProducts || [];
      if(!state.customProducts.find(p => p.id === product.id)){
        state.customProducts.push(product);
      }
    }
    saveState(state);
  }

  function deleteProduct(productId, storeIds){
    const state = loadState();
    state.catalog = (state.catalog || []).filter(p => p.id !== productId);
    state.customProducts = (state.customProducts || []).filter(p => p.id !== productId);
    (storeIds || []).forEach(id => {
      if(state.stores && state.stores[id] && state.stores[id].products){
        delete state.stores[id].products[productId];
      }
    });
    saveState(state);
  }

  function getStore(storeId){
    const state = loadState();
    return state.stores && state.stores[storeId] ? state.stores[storeId] : null;
  }

  function setStore(storeId, data){
    const state = loadState();
    state.stores = state.stores || {};
    state.stores[storeId] = data;
    saveState(state);
  }

  function clearStore(storeId){
    const state = loadState();
    if(state.stores && state.stores[storeId]){
      delete state.stores[storeId];
      saveState(state);
    }
  }

  function getTheme(){
    return loadState().theme || 'light';
  }

  function setTheme(theme){
    const state = loadState();
    state.theme = theme;
    saveState(state);
  }

  global.Storage = {
    loadState,
    saveState,
    getCatalog,
    setCatalog,
    getCustomProducts,
    addProduct,
    deleteProduct,
    getStore,
    setStore,
    clearStore,
    getTheme,
    setTheme
  };
})(window);
