(function(global){
  function calcOrder(ideal, stock){
    const i = Number(ideal) || 0;
    const s = Number(stock) || 0;
    return Math.max(0, i - s);
  }

  function totalOrder(products){
    return products.reduce((sum, p) => sum + (Number(p.order) || 0), 0);
  }

  global.Calculations = { calcOrder, totalOrder };
})(window);
