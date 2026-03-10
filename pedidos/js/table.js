(function(global){
  function groupByFamily(products){
    return products.reduce((acc, product) => {
      const family = product.category || 'OUTROS';
      if(!acc[family]) acc[family] = [];
      acc[family].push(product);
      return acc;
    }, {});
  }

  function renderTable(tbody, products, collapsedMap){
    const grouped = groupByFamily(products);
    const families = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    const fragment = document.createDocumentFragment();

    families.forEach(family => {
      const isCollapsed = collapsedMap[family] !== undefined ? collapsedMap[family] : true;
      const familyRow = document.createElement('tr');
      familyRow.className = 'family-row';
      familyRow.dataset.family = family;
      familyRow.dataset.collapsed = String(isCollapsed);
      familyRow.innerHTML = `
        <td class="col-toggle">
          <button class="family-toggle" data-family="${family}" aria-expanded="${!isCollapsed}">
            <span class="chevron"></span>
          </button>
        </td>
        <td colspan="5">${family}</td>
      `;
      fragment.appendChild(familyRow);

      grouped[family]
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(product => {
          const row = document.createElement('tr');
          row.className = `product-row${product.order > 0 ? ' highlight' : ''}`;
          row.dataset.id = product.id;
          row.dataset.family = family;
          row.dataset.hidden = String(isCollapsed);
          row.innerHTML = `
            <td class="col-toggle"></td>
            <td>${product.name}</td>
            <td class="col-num">
              <input class="stock-input" type="number" min="0" value="${product.stock}" data-field="stock" />
            </td>
            <td class="col-num">
              <input class="ideal-input" type="number" min="0" value="${product.ideal}" data-field="ideal" />
            </td>
            <td class="col-num" data-role="order">${product.order}</td>
            <td class="col-actions">
              <div class="action-buttons">
                <button class="icon-action" data-action="confirm-ideal" title="Confirmar ideal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button class="icon-action danger" data-action="delete" title="Excluir sabor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          `;
          fragment.appendChild(row);
        });
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }

  function setFamilyCollapsed(tbody, family, collapsed){
    const familyRow = tbody.querySelector(`tr.family-row[data-family="${family}"]`);
    if(familyRow){
      familyRow.dataset.collapsed = String(collapsed);
      const toggle = familyRow.querySelector('.family-toggle');
      if(toggle) toggle.setAttribute('aria-expanded', String(!collapsed));
    }

    tbody.querySelectorAll(`tr.product-row[data-family="${family}"]`).forEach(row => {
      row.dataset.hidden = String(collapsed);
    });
  }

  function updateOrder(tbody, id, order){
    const row = tbody.querySelector(`tr.product-row[data-id="${id}"]`);
    if(!row) return;
    const cell = row.querySelector('[data-role="order"]');
    if(cell) cell.textContent = order;
  }

  function updateHighlight(tbody, id, highlight){
    const row = tbody.querySelector(`tr.product-row[data-id="${id}"]`);
    if(row) row.classList.toggle('highlight', highlight);
  }

  global.Table = {
    renderTable,
    setFamilyCollapsed,
    updateOrder,
    updateHighlight
  };
})(window);
