(function(global){
  async function loadDefaultProducts(){
    try {
      const res = await fetch('data/products.json');
      if(!res.ok) throw new Error('Erro ao carregar produtos');
      const json = await res.json();
      return json.products || [];
    } catch(err){
      console.warn('Falha ao carregar produtos.json', err);
      return [];
    }
  }

  function slugify(name){
    return name
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'novo-sabor';
  }

  function dedupeCatalog(defaults, stored){
    const map = new Map();
    defaults.forEach(p => map.set(p.id, { ...p }));
    stored.forEach(p => {
      const prev = map.get(p.id) || {};
      map.set(p.id, { ...prev, ...p });
    });
    return Array.from(map.values());
  }

  global.ProductService = { loadDefaultProducts, slugify, dedupeCatalog };
})(window);
