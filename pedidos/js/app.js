(function(){
  const storeSelect = document.getElementById('storeSelect');
  const dateInput = document.getElementById('dateInput');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const addFlavorBtn = document.getElementById('addFlavorBtn');
  const tableBody = document.getElementById('tableBody');
  const summaryTotal = document.getElementById('summaryTotal');
  const themeToggle = document.getElementById('themeToggle');

  const modalAdd = document.getElementById('modalAdd');
  const modalConfirm = document.getElementById('modalConfirm');
  const flavorName = document.getElementById('flavorName');
  const flavorCategory = document.getElementById('flavorCategory');
  const flavorIdeal = document.getElementById('flavorIdeal');

  const modalDelete = document.getElementById('modalDelete');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  const STORES = ['Martiniano', 'Tamandaré', 'Pires'];

  const state = {
    catalog: [],
    productsView: [],
    productsById: new Map(),
    storeId: STORES[0],
    storeData: { date: '', products: {} },
    collapsedFamilies: {}
  };

  const deleteModal = UI.createConfirmModal(modalDelete, deleteConfirmBtn);

  function todayISO(){
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  function buildStoreOptions(){
    storeSelect.innerHTML = STORES.map(name => `<option value="${name}">${name}</option>`).join('');
    storeSelect.value = state.storeId;
  }

  function loadStoreData(){
    const storeData = Storage.getStore(state.storeId);
    state.storeData = storeData ? storeData : { date: todayISO(), products: {} };
    dateInput.value = state.storeData.date || todayISO();
  }

  function buildProductsView(){
    state.productsById = new Map();
    state.productsView = state.catalog.map(product => {
      const stored = state.storeData.products[product.id] || {};
      const stock = Number(stored.stock) || 0;
      const ideal = Number(product.ideal) || 0;
      const order = Calculations.calcOrder(ideal, stock);
      const view = { ...product, stock, ideal, order };
      state.productsById.set(product.id, view);
      return view;
    });
  }

  function updateSummary(){
    summaryTotal.textContent = Calculations.totalOrder(state.productsView);
  }

  function renderTable(){
    Table.renderTable(tableBody, state.productsView, state.collapsedFamilies);
    updateSummary();
  }

  function refreshCategoryOptions(){
    const families = Array.from(new Set(state.catalog.map(p => p.category || 'OUTROS'))).sort();
    flavorCategory.innerHTML = families.map(fam => `<option value="${fam}">${fam}</option>`).join('');
  }

  function openAddModal(){
    flavorName.value = '';
    flavorIdeal.value = 12;
    refreshCategoryOptions();
    UI.openModal(modalAdd);
    flavorName.focus();
  }

  function createUniqueId(base){
    let id = base;
    let counter = 2;
    while(state.catalog.some(p => p.id === id)){
      id = `${base}-${counter}`;
      counter += 1;
    }
    return id;
  }

  function addFlavor(){
    const name = flavorName.value.trim();
    const category = flavorCategory.value.trim() || 'OUTROS';
    const ideal = Math.max(0, Number(flavorIdeal.value) || 0);

    if(!name){
      alert('Informe o nome do sabor.');
      return;
    }

    const slug = ProductService.slugify(name);
    const baseId = `${category.toLowerCase()}-${slug}`;
    const id = createUniqueId(baseId);

    const product = { id, name, category, ideal };
    Storage.addProduct(product);
    state.catalog.push(product);
    buildProductsView();
    renderTable();
    UI.closeModal(modalAdd);
  }

  function handleInput(event){
    const input = event.target;
    if(!input.matches('input[data-field]')) return;
    const row = input.closest('tr.product-row');
    if(!row) return;

    const id = row.dataset.id;
    const product = state.productsById.get(id);
    if(!product) return;

    const value = Math.max(0, Number(input.value) || 0);
    input.value = value;

    if(input.dataset.field === 'stock'){
      product.stock = value;
      state.storeData.products[id] = { stock: value };
    }

    if(input.dataset.field === 'ideal'){
      product.ideal = value;
    }

    product.order = Calculations.calcOrder(product.ideal, product.stock);
    Table.updateOrder(tableBody, id, product.order);
    Table.updateHighlight(tableBody, id, product.order > 0);
    updateSummary();
  }

  function handleTableClick(event){
    const toggle = event.target.closest('.family-toggle');
    if(toggle){
      const family = toggle.dataset.family;
      const current = state.collapsedFamilies[family] !== undefined ? state.collapsedFamilies[family] : true;
      const next = !current;
      state.collapsedFamilies[family] = next;
      Table.setFamilyCollapsed(tableBody, family, next);
      return;
    }

    const actionBtn = event.target.closest('button[data-action]');
    if(!actionBtn) return;
    const row = actionBtn.closest('tr.product-row');
    if(!row) return;

    const id = row.dataset.id;

    if(actionBtn.dataset.action === 'confirm-ideal'){
      const product = state.productsById.get(id);
      const catalogItem = state.catalog.find(p => p.id === id);
      if(product && catalogItem){
        catalogItem.ideal = product.ideal;
        Storage.setCatalog(state.catalog);
        product.order = Calculations.calcOrder(product.ideal, product.stock);
        Table.updateOrder(tableBody, id, product.order);
        Table.updateHighlight(tableBody, id, product.order > 0);
        updateSummary();
      }
      return;
    }

    if(actionBtn.dataset.action === 'delete'){
      deleteModal.open(() => {
        Storage.deleteProduct(id, STORES);
        state.catalog = state.catalog.filter(p => p.id !== id);
        buildProductsView();
        renderTable();
      });
    }
  }

  function handleSave(){
    state.storeData.date = dateInput.value || todayISO();
    Storage.setStore(state.storeId, state.storeData);
  }

  function handleExport(){
    if(typeof XLSX === 'undefined'){
      alert('Biblioteca XLSX nao carregada.');
      return;
    }

    const data = state.productsView.map(p => ({
      Sabor: p.name,
      Estoque: p.stock,
      Ideal: p.ideal,
      Pedir: p.order
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedido');

    const safeStore = state.storeId.replace(/[^\w\d]+/g, '_');
    const dateValue = dateInput.value || 'sem-data';
    XLSX.writeFile(wb, `pedido_${safeStore}_${dateValue}.xlsx`);
  }

  async function init(){
    buildStoreOptions();
    loadStoreData();

    const defaults = await ProductService.loadDefaultProducts();
    const storedCatalog = Storage.getCatalog();
    const storedCustom = Storage.getCustomProducts();
    const merged = ProductService.dedupeCatalog(defaults, [...storedCatalog, ...storedCustom]);

    state.catalog = merged;
    Storage.setCatalog(merged);

    state.collapsedFamilies = merged.reduce((acc, product) => {
      const family = product.category || 'OUTROS';
      if(acc[family] === undefined) acc[family] = true;
      return acc;
    }, {});

    buildProductsView();
    renderTable();
  }

  Theme.init(themeToggle);
  UI.bindModal(modalAdd);
  UI.bindModal(modalDelete);

  storeSelect.addEventListener('change', () => {
    state.storeId = storeSelect.value;
    loadStoreData();
    buildProductsView();
    renderTable();
  });

  dateInput.addEventListener('change', () => {
    state.storeData.date = dateInput.value;
  });

  tableBody.addEventListener('input', handleInput);
  tableBody.addEventListener('click', handleTableClick);

  addFlavorBtn.addEventListener('click', openAddModal);
  modalConfirm.addEventListener('click', addFlavor);
  saveBtn.addEventListener('click', handleSave);
  exportBtn.addEventListener('click', handleExport);

  init();
})();
