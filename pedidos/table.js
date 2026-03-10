(function(global){
  const bodyEl = () => document.getElementById('tableBody');
  const summaryEl = () => document.getElementById('summaryTotal');

  function groupByCategory(products){
    return products.reduce((acc, p) => {
      acc[p.category] = acc[p.category] || [];
      acc[p.category].push(p);
      return acc;
    }, {});
  }

  function buildTable(products, storeState, onChange){
    const tbody = bodyEl();
    tbody.innerHTML = '';

    const groups = groupByCategory(products);
    Object.keys(groups).forEach(category => {
      const catRow = document.createElement('tr');
      catRow.className = 'category-row';
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = category;
      catRow.appendChild(cell);
      tbody.appendChild(catRow);

      groups[category].forEach(prod => {
        const storedStock = storeState.products[prod.id]?.stock ?? '';
        const currentStock = storedStock === '' ? '' : Number(storedStock);
        const order = Calculations.calcOrder(prod.ideal, currentStock);

        const tr = document.createElement('tr');
        tr.dataset.productId = prod.id;
        if(order > 0) tr.classList.add('highlight');

        const nameTd = document.createElement('td');
        nameTd.textContent = prod.name;

        const stockTd = document.createElement('td');
        stockTd.className = 'col-num';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.className = 'stock-input';
        input.value = currentStock === '' ? '' : currentStock;
        input.addEventListener('input', () => onChange(prod.id, input.value));
        stockTd.appendChild(input);

        const idealTd = document.createElement('td');
        idealTd.className = 'col-num';
        idealTd.textContent = prod.ideal;

        const orderTd = document.createElement('td');
        orderTd.className = 'col-num order-cell';
        orderTd.textContent = order;

        tr.append(nameTd, stockTd, idealTd, orderTd);
        tbody.appendChild(tr);
      });
    });

    updateSummary();
  }

  function updateRow(productId, orderValue){
    const row = bodyEl().querySelector(`tr[data-product-id="${productId}"]`);
    if(!row) return;
    const orderCell = row.querySelector('.order-cell');
    orderCell.textContent = orderValue;
    row.classList.toggle('highlight', orderValue > 0);
  }

  function updateSummary(){
    const orders = Array.from(bodyEl().querySelectorAll('.order-cell'))
      .map(cell => Number(cell.textContent) || 0);
    const total = orders.reduce((a,b)=>a+b,0);
    summaryEl().textContent = total;
  }

  global.Table = { buildTable, updateRow, updateSummary };
})(window);
