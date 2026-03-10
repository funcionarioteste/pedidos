(async function(){
  const storeSelect = document.getElementById('storeSelect');
  const dateInput = document.getElementById('dateInput');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');

  const defaultProducts = [
    { id: 'sensa-morango', name: 'Sensa Morango', category: 'Sensa', ideal: 24 },
    { id: 'sensa-chocolate', name: 'Sensa Chocolate', category: 'Sensa', ideal: 24 },
    { id: 'sensa-baunilha', name: 'Sensa Baunilha', category: 'Sensa', ideal: 18 },
    { id: 'picole-uva', name: 'Picolé Uva', category: 'Picolé', ideal: 40 },
    { id: 'picole-limao', name: 'Picolé Limão', category: 'Picolé', ideal: 40 },
    { id: 'picole-coco', name: 'Picolé Coco', category: 'Picolé', ideal: 30 },
    { id: 'pote-1l-napolitano', name: 'Pote 1L Napolitano', category: 'Potes', ideal: 16 },
    { id: 'pote-1l-flocos', name: 'Pote 1L Flocos', category: 'Potes', ideal: 16 },
    { id: 'pote-1l-dulce', name: 'Pote 1L Doce de Leite', category: 'Potes', ideal: 16 },
    { id: 'premium-pistache', name: 'Premium Pistache', category: 'Premium', ideal: 12 },
    { id: 'premium-amora', name: 'Premium Amora', category: 'Premium', ideal: 12 },
    { id: 'premium-cookies', name: 'Premium Cookies', category: 'Premium', ideal: 12 }
  ];

  const defaultStores = [
    { id: 'marti', name: 'Marti' },
    { id: 'tamandare', name: 'Tamandaré' },
    { id: 'pires', name: 'Pires' }
  ];

  let products = [];
  let stores = [];
  let currentStoreId = null;
  let storeState = { products: {}, lastUpdated: null, countDate: null };

  init();

  async function init(){
    dateInput.valueAsDate = new Date();
    [products, stores] = await loadConfig();
    populateStoreSelect(stores);
    const initialId = stores[0]?.id;
    if(initialId){
      currentStoreId = initialId;
      storeSelect.value = initialId;
      loadStore(initialId);
    }
    bindEvents();
  }

  async function loadConfig(){
    const prod = await fetchJson('data/products.json', { fallback: { products: defaultProducts }});
    const st = await fetchJson('data/stores.json', { fallback: { stores: defaultStores }});
    return [prod.products, st.stores];
  }

  async function fetchJson(path, { fallback }){
    try {
      const res = await fetch(path);
      if(!res.ok) throw new Error('Erro ao carregar ' + path);
      return await res.json();
    } catch(err){
      console.warn('Falha ao carregar JSON, usando fallback', err);
      return fallback;
    }
  }

  function populateStoreSelect(list){
    storeSelect.innerHTML = '';
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      storeSelect.appendChild(opt);
    });
  }

  function bindEvents(){
    storeSelect.addEventListener('change', () => {
      currentStoreId = storeSelect.value;
      loadStore(currentStoreId);
    });

    saveBtn.addEventListener('click', () => {
      StorageApi.saveStore(currentStoreId, storeState);
      alert('Pedido salvo para ' + currentStoreId);
    });

    resetBtn.addEventListener('click', () => {
      storeState = { products: {}, lastUpdated: null, countDate: dateInput.value };
      Table.buildTable(products, storeState, handleInputChange);
    });

    exportBtn.addEventListener('click', () => {
      const mapped = products.map(p => {
        const stock = storeState.products[p.id]?.stock || 0;
        const order = Calculations.calcOrder(p.ideal, stock);
        return { ...p, stock, order };
      });
      Export.exportToExcel(currentStoreName(), dateInput.value, mapped);
    });
  }

  function loadStore(storeId){
    storeState = StorageApi.loadStore(storeId);
    if(!storeState.products) storeState.products = {};
    if(storeState.countDate){
      dateInput.value = storeState.countDate;
    }
    Table.buildTable(products, storeState, handleInputChange);
  }

  function handleInputChange(productId, value){
    const numeric = value === '' ? '' : Math.max(0, Number(value));
    const prodConfig = products.find(p => p.id === productId);
    const order = Calculations.calcOrder(prodConfig.ideal, numeric);

    storeState.products[productId] = { stock: numeric };
    storeState.lastUpdated = new Date().toISOString();
    storeState.countDate = dateInput.value;

    Table.updateRow(productId, order);
    Table.updateSummary();
  }

  function currentStoreName(){
    return stores.find(s => s.id === currentStoreId)?.name || 'loja';
  }
})();
