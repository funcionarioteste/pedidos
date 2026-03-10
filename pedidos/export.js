(function(global){
  function exportToExcel(storeName, dateValue, products){
    if(typeof XLSX === 'undefined'){
      alert('Biblioteca XLSX não carregada. Verifique a conexão.');
      return;
    }
    const data = products.map(p => ({
      Produto: p.name,
      Estoque: p.stock ?? 0,
      Ideal: p.ideal,
      Pedir: p.order
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedido');

    const safeStore = storeName.replace(/[^\w\d]+/g,'_');
    const fileName = `pedido_${safeStore}_${dateValue || 'sem-data'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  global.Export = { exportToExcel };
})(window);
